// SRC/Backend/routes/clientsRouter.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const PersistenceFactory = require('../PersistenceFactory');

const router = express.Router();

// ===== Nuestro "libro de clientes" =====
// Ahora depende 100% de la PersistenceFactory
const clientesDAO = PersistenceFactory.getDAO('clientes');

// ===== Ayudantes para validaciones =====
// Esta función revisa si hubo errores en las validaciones
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Hay problemas con los datos que mandaste',
      details: errors.mapped(),
    });
  }
  next();
};

// Toma solo los campos que nos interesan (por seguridad)
const pickAllowedFields = (obj, allowed) =>
  allowed.reduce((acc, k) => {
    if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) acc[k] = obj[k];
    return acc;
  }, {});

// ===== Reglas para validar lo que nos mandan =====
const validateLogin = [
  body('email')
    .isString().withMessage('El email es requerido')
    .trim()
    .isLength({ max: 100 }).withMessage('El email es demasiado largo')
    .isEmail().withMessage('El email no tiene formato válido'),
  
  body('password')
    .isString().withMessage('La contraseña es requerida')
    .isLength({ min: 8, max: 64 }).withMessage('La contraseña debe tener entre 8 y 64 caracteres'),
];

const validateRegister = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('Tienes que poner tu nombre').bail()
    .isLength({ min: 2, max: 60 }).withMessage('Tu nombre debe tener entre 2 y 60 letras').bail()
    .matches(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/)
    .withMessage('Tu nombre solo puede tener letras (con tildes y ñ), espacios, guiones y apóstrofes')
    .customSanitizer(v => v.replace(/\s+/g, ' ')), // quita espacios de más

  body('email')
    .trim()
    .notEmpty().withMessage('Tienes que poner tu email').bail()
    .isLength({ max: 100 }).withMessage('Tu email es demasiado largo').bail()
    .isEmail().withMessage('Tu email no tiene formato válido').bail()
    .custom(v => !/\s/.test(v)).withMessage('El email no puede tener espacios').bail()
    .custom(v => !v.includes('..')).withMessage('El email no puede tener ".."'),

  body('password')
    .notEmpty().withMessage('Tienes que crear una contraseña').bail()
    .isLength({ min: 8, max: 64 }).withMessage('Tu contraseña debe tener entre 8 y 64 caracteres').bail()
    .custom(v => !/\s/.test(v)).withMessage('La contraseña no puede tener espacios').bail()
    .custom(v => {
      // Verificamos que tenga al menos 2 tipos de caracteres diferentes
      let tiposDeCaracteres = 0;
      if (/[a-z]/.test(v)) tiposDeCaracteres++; // minúsculas
      if (/[A-Z]/.test(v)) tiposDeCaracteres++; // mayúsculas
      if (/\d/.test(v)) tiposDeCaracteres++;    // números
      if (/[^A-Za-z0-9]/.test(v)) tiposDeCaracteres++; // símbolos
      return tiposDeCaracteres >= 2;
    }).withMessage('Tu contraseña debe combinar al menos 2 de estos: mayúsculas, minúsculas, números o símbolos'),

  body('telefono')
    .trim()
    .notEmpty().withMessage('Tienes que poner tu teléfono').bail()
    .matches(/^\d{8}$/).withMessage('Tu teléfono debe tener exactamente 8 números'),

  body('direccion')
    .customSanitizer(v => typeof v === 'string' ? v.trim() : v)
    .optional({ nullable: true, checkFalsy: true }) // la dirección es opcional
    .isLength({ min: 5, max: 120 }).withMessage('Tu dirección debe tener entre 5 y 120 caracteres')
    .matches(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s,.\-#°º/()]+$/)
    .withMessage('Tu dirección tiene caracteres que no permitimos')
    .matches(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/)
    .withMessage('Tu dirección debe tener al menos una letra o un número')
];

// ===== Rutas para los clientes =====

// Ruta de salud - para verificar que funciona
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'La parte de clientes está funcionando bien',
    timestamp: new Date().toISOString(),
  });
});

// --- INICIAR SESIÓN ---
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const password = String(req.body.password || '');

    // Buscamos al usuario por su email
    const user = await clientesDAO.getByEmail(email);
    
    // Por seguridad, damos el mismo mensaje aunque el usuario no exista
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, error: 'El email o la contraseña no son correctos' });
    }

    // Verificamos si la cuenta está activa
    if (user.activo === false) {
      return res.status(403).json({ success: false, error: 'Tu cuenta está desactivada' });
    }

    // Comparamos la contraseña con la que tenemos guardada
    const contraseñaEsCorrecta = await bcrypt.compare(password, user.passwordHash);
    if (!contraseñaEsCorrecta) {
      return res.status(401).json({ success: false, error: 'El email o la contraseña no son correctos' });
    }

    // Verificamos que tengamos la clave secreta para crear el token
    const JWT_SECRET = process.env.JWT_SECRET_KEY;
    if (!JWT_SECRET) {
      return res.status(500).json({ success: false, error: 'Problema de configuración del servidor' });
    }

    // Creamos el "carnet de identidad digital" (JWT)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: '1h' } // El token dura 1 hora
    );

    // Quitamos la información sensible antes de devolver el usuario
    const { passwordHash: _omit, password: _omitOld, ...usuarioPublico } = user;

    res.status(200).json({
      success: true,
      message: '¡Bienvenido! Has iniciado sesión correctamente',
      user: usuarioPublico,
      token, // Este token hay que guardarlo en el frontend
      redirect: user.role === 'admin' ? '/admin_controller.html' : '/productos.html',
    });
  } catch (err) {
    console.error('❌ Error en el login:', err);
    return res.status(500).json({ success: false, error: 'Hubo un problema al iniciar sesión' });
  }
});

// --- REGISTRAR NUEVO CLIENTE ---
router.post('/register', validateRegister, handleValidationErrors, async (req, res) => {
  try {
    // Tomamos solo los campos que nos interesan (por seguridad y para evitar basura)
    const input = pickAllowedFields(req.body, ['nombre', 'email', 'telefono', 'password', 'direccion']);
    
    // Guardamos el nuevo cliente en nuestra base de datos
    const cliente = await clientesDAO.save(input);

    // Nos aseguramos de no mandar información sensible
    delete cliente.passwordHash;
    delete cliente.password;

    // Todo salio bien, devolvemos el cliente creado
    res
      .status(201)
      .set('Location', `/api/clients/${cliente.id}`)
      .json({
        success: true,
        message: '¡Te has registrado exitosamente!',
        data: cliente,
      });

  } catch (error) {
    const codigoError = error && error.code ? String(error.code) : 'INTERNAL';

    // Traducimos los códigos de error a mensajes que entienda el usuario
    const mapaDeErrores = {
      // Campos requeridos
      'NAME_REQUIRED':     { status: 400, msg: 'Necesitamos saber tu nombre' },
      'EMAIL_REQUIRED':    { status: 400, msg: 'Necesitamos tu email' },
      'PASSWORD_REQUIRED': { status: 400, msg: 'Necesitas crear una contraseña' },
      'PHONE_REQUIRED':    { status: 400, msg: 'Necesitamos tu teléfono'},

      // Problemas de formato
      'NAME_INVALID':      { status: 400, msg: 'Tu nombre tiene caracteres no permitidos' },
      'EMAIL_INVALID':     { status: 400, msg: 'Tu email no tiene formato válido' },
      'PASSWORD_WEAK':     { status: 400, msg: 'Tu contraseña no es suficientemente segura' },
      'ADDRESS_TOO_LONG':  { status: 400, msg: 'Tu dirección es demasiado larga (máximo 120 caracteres)'},
      'ADDRESS_INVALID_CHARS': {status: 400, msg: 'Tu dirección tiene caracteres no permitidos'},
      'PHONE_INVALID_CHARS':{ status: 400, msg: 'Tu teléfono solo puede tener números' },
      'PHONE_INVALID_LENGTH':{ status: 400, msg: 'Tu teléfono debe tener exactamente 8 números' },

      // Duplicados
      'EMAIL_DUP':         { status: 409, msg: 'Este email ya está registrado' },
    };

    const errorMapeado = mapaDeErrores[codigoError];
    if (errorMapeado) {
      return res.status(errorMapeado.status).json({ 
        success: false, 
        error: errorMapeado.msg, 
        code: codigoError 
      });
    }

    // Si es un error que no conocemos, lo mostramos en consola
    console.error('❌ Error no esperado en el registro:', error);
    res.status(500).json({
      success: false,
      error: 'Hubo un problema inesperado al crear tu cuenta',
      code: codigoError,
    });
  }
});
module.exports = router;