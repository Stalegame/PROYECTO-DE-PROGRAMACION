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
  clientesDAO = PersistenceFactory.getDAO('clientes'); // Debe exponer: getByEmail, save, etc.
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

// ===== Reglas de validación =====
const validateLogin = [
  body('email')
    .notEmpty().withMessage('Email es requerido')
    .isEmail().withMessage('Email no válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

const validateRegister = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .trim().escape(),
  body('email')
    .notEmpty().withMessage('Email es requerido')
    .isEmail().withMessage('Email no válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('telefono')
    .optional().isString().isLength({ max: 30 }).trim().escape(),
  body('direccion')
    .optional().isString().isLength({ max: 200 }).trim().escape(),
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
    // Normaliza: evita undefined y espacios invisibles
    const email = String(req.body.email || '').trim();
    const passwordPlain = String(req.body.password || '').trim();

    // Busca usuario (debe venir con passwordHash)
    const user = await clientesDAO.getByEmail(email);
    if (!user) {
      return res.status(400).json({ success: false, error: 'Credenciales incorrectas. Intenta nuevamente.' });
    }

    // Acepta solo passwordHash
    const passwordHash = user.passwordHash;
    if (!passwordHash) {
      return res.status(500).json({ success: false, error: 'Cuenta sin hash. Vuelve a registrar este usuario.' });
    }

    // Compara con bcrypt
    const isPasswordValid = await bcrypt.compare(passwordPlain, passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, error: 'Credenciales incorrectas. Intenta nuevamente.' });
    }

    const JWT_SECRET = process.env.JWT_SECRET_KEY ;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // No exponer hash
    const { passwordHash: _omit, password: _omitOld, ...publicUser } = user;

    res.json({
      success: true,
      message: 'Login exitoso',
      user: publicUser,
      token,
      redirect: user.role === 'admin' ? '/admin_controller.html' : '/productos.html', // Admin = admin_controller, si no, productos 
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Error interno en login' });
  }
});

// --- REGISTER ---
router.post('/register', validateRegister, handleValidationErrors, async (req, res) => {
  try {
    // El DAO debe: duplicados por email, hashear y guardar en clientes.json
    const cliente = await clientesDAO.save(req.body);

    // Saneamos por si acaso
    delete cliente.passwordHash;
    delete cliente.password;

    res.status(201).json({
      success: true,
      message: 'Cliente registrado exitosamente',
      data: cliente,
    });
  } catch (error) {
    if (error && error.code === 'EMAIL_DUP') {
      return res.status(409).json({
        success: false,
        error: 'El email ya está registrado',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al registrar cliente',
    });
  }
});

module.exports = router;