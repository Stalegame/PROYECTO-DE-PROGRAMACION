// SRC/Backend/routes/clientsRouter.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const path = require('path');

const router = express.Router();

// ===== Cargar DAO de clientes (con fallback a JSON) =====
let clientesDAO;
try {
  const PersistenceFactory = require('../PersistenceFactory');
  clientesDAO = PersistenceFactory.getDAO('clientes'); // Debe exponer: getByEmail, save, update, etc.
} catch {
  const JsonClientesDAO = require(path.join(__dirname, '..', 'json', 'JsonClientesDAO'));
  clientesDAO = new JsonClientesDAO();
}

// ===== Helpers de validación =====
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Datos de entrada inválidos',
      details: errors.mapped(),
    });
  }
  next();
};

// Whitelist de campos permitidos desde el cliente
const pickAllowedFields = (obj, allowed) =>
  allowed.reduce((acc, k) => {
    if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) acc[k] = obj[k];
    return acc;
  }, {});

// ===== Reglas de validación (router-level, defensa ligera) =====
const validateLogin = [
  body('email')
    .isString().withMessage('Email es requerido')
    .trim()
    .isLength({ max: 100 }).withMessage('Email demasiado largo')
    .isEmail().withMessage('Email no válido'),
  body('password')
    .isString().withMessage('Contraseña es requerida')
    .isLength({ min: 8, max: 64 }).withMessage('La contraseña debe tener entre 8 y 64 caracteres'),
];

const validateRegister = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido').bail()
    .isLength({ min: 2, max: 60 }).withMessage('El nombre debe tener entre 2 y 60 caracteres').bail()
    .matches(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/)
    .withMessage('El nombre solo puede incluir letras (con tildes y ñ), espacios, guion y apóstrofe')
    .customSanitizer(v => v.replace(/\s+/g, ' ')),

  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido').bail()
    .isLength({ max: 100 }).withMessage('Email demasiado largo').bail()
    .isEmail().withMessage('Email no válido').bail()
    .custom(v => !/\s/.test(v)).withMessage('El email no puede contener espacios').bail()
    .custom(v => !v.includes('..')).withMessage('El email no puede contener ".."'),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida').bail()
    .isLength({ min: 8, max: 64 }).withMessage('La contraseña debe tener entre 8 y 64 caracteres').bail()
    .custom(v => !/\s/.test(v)).withMessage('La contraseña no puede contener espacios').bail()
    .custom(v => {
      let classes = 0;
      if (/[a-z]/.test(v)) classes++;
      if (/[A-Z]/.test(v)) classes++;
      if (/\d/.test(v)) classes++;
      if (/[^A-Za-z0-9]/.test(v)) classes++;
      return classes >= 2;
    }).withMessage('La contraseña debe combinar al menos 2 de: mayúsculas, minúsculas, números o símbolos'),

  body('telefono')
    .trim()
    .notEmpty().withMessage('El teléfono es requerido').bail()
    .matches(/^\d{8}$/).withMessage('El teléfono debe tener exactamente 8 dígitos'),

  body('direccion')
    .customSanitizer(v => typeof v === 'string' ? v.trim() : v)
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 5, max: 120 }).withMessage('La dirección debe tener entre 5 y 120 caracteres')
    .matches(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s,.\-#°º/()]+$/)
    .withMessage('La dirección contiene caracteres no permitidos')
    .matches(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/)
    .withMessage('La dirección debe contener al menos una letra o un número')
];

// ===== Rutas =====
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API Clients funcionando',
    timestamp: new Date().toISOString(),
  });
});

// --- LOGIN ---
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const passwordPlain = String(req.body.password || '');

    const user = await clientesDAO.getByEmail(email);
    // Misma respuesta para no filtrar existencia
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    if (user.activo === false) {
      return res.status(403).json({ success: false, error: 'Cuenta deshabilitada' });
    }

    const isPasswordValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    const JWT_SECRET = process.env.JWT_SECRET_KEY;
    if (!JWT_SECRET) {
      return res.status(500).json({ success: false, error: 'Configuración JWT faltante' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const { passwordHash: _omit, password: _omitOld, ...publicUser } = user;

    res.json({
      success: true,
      message: 'Login exitoso',
      user: publicUser,
      token,
      redirect: user.role === 'admin' ? '/admin_controller.html' : '/productos.html',
    });
  } catch (err) {
    console.error('❌ Error en /login:', err);
    return res.status(500).json({ success: false, error: 'Error interno en login' });
  }
});

// --- REGISTER ---
router.post('/register', validateRegister, handleValidationErrors, async (req, res) => {
  try {
    // Whitelist antes de pasar al DAO
    const input = pickAllowedFields(req.body, ['nombre', 'email', 'telefono', 'password', 'direccion']);
    const cliente = await clientesDAO.save(input);

    // Saneamos (el DAO ya entrega sin hash, pero por si acaso)
    delete cliente.passwordHash;
    delete cliente.password;

    res
      .status(201)
      .set('Location', `/api/clients/${cliente.id}`)
      .json({
        success: true,
        message: 'Cliente registrado exitosamente',
        data: cliente,
      });

  } catch (error) {
    const code = error && error.code ? String(error.code) : 'INTERNAL';

    // Mapa de códigos del DAO → HTTP
    const errorMap = {
      // Requeridos
      NAME_REQUIRED:     { status: 400, msg: 'El nombre es requerido' },
      EMAIL_REQUIRED:    { status: 400, msg: 'El email es requerido' },
      PASSWORD_REQUIRED: { status: 400, msg: 'La contraseña es requerida' },
      PHONE_REQUIRED:    { status: 400, msg: 'El telefono es requerido'},

      // Formato
      NAME_INVALID:      { status: 400, msg: 'Nombre inválido' },
      EMAIL_INVALID:     { status: 400, msg: 'Email inválido' },
      PASSWORD_WEAK:     { status: 400, msg: 'Contraseña débil' },
      ADDRESS_TOO_LONG:  { status: 400, msg: 'Direccion demasiado larga, maximo 120 caracteres'},
      ADDRESS_INVALID_CHARS: {status: 400, msg: 'La dirección contiene caracteres no permitidos.'},
      PHONE_INVALID_CHARS:{ status: 400, msg: 'El teléfono solo puede contener números' },
      PHONE_INVALID_LENGTH:{ status: 400, msg: 'El teléfono debe tener exactamente 8 dígitos' },

      // Duplicados
      EMAIL_DUP:         { status: 409, msg: 'El email ya está registrado' },
    };

    const mapped = errorMap[code];
    if (mapped) {
      return res.status(mapped.status).json({ success: false, error: mapped.msg, code });
    }

    console.error('❌ Error no mapeado en /register:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al registrar cliente',
      code,
    });
  }
});

module.exports = router;