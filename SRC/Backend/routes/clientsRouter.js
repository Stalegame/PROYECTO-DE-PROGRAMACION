// routes/clientsRouter.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const path = require('path');

// Cargar DAO de clientes con fallback
let clientesDAO;
try {
  const PersistenceFactory = require('../PersistenceFactory');
  clientesDAO = PersistenceFactory.getDAO('clientes');
} catch (e) {
  console.error('[clientsRouter] No se pudo obtener DAO "clientes":', e.message);
  try {
    const JsonClientesDAO = require(path.join(__dirname, '..', 'json', 'JsonClientesDAO'));
    clientesDAO = new JsonClientesDAO();
  } catch (e2) {
    console.error('[clientsRouter] Fallback JsonClientesDAO falló:', e2.message);
    throw e2; 
  }
}

// Middleware de validación
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

// Validaciones
const validateLogin = [
  body('email').notEmpty().withMessage('Email es requerido')
    .isEmail().withMessage('Email no válido').normalizeEmail(),
  body('password').notEmpty().withMessage('Contraseña es requerida')
    .isLength({ min: 4 }).withMessage('Contraseña demasiado corta'),
];

const validateRegister = [
  body('nombre').notEmpty().withMessage('El nombre es requerido').trim().escape(),
  body('email').notEmpty().withMessage('Email es requerido')
    .isEmail().withMessage('Email no válido').normalizeEmail(),
  body('telefono').optional().isString().isLength({ max: 30 }).trim().escape(),
  body('direccion').optional().isString().isLength({ max: 200 }).trim().escape(),
];

// Rutas
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API Clients funcionando',
    timestamp: new Date().toISOString(),
  });
});

// Ruta de login
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  const { email, password } = req.body;

  // Validación del cliente
  const user = await clientesDAO.getByEmail(email);

  if (!user) {
    return res.status(400).json({ success: false, error: 'Credenciales incorrectas. Intenta nuevamente.' });
  }

  // Compara la contraseña utilizando bcrypt
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ success: false, error: 'Credenciales incorrectas. Intenta nuevamente.' });
  }

  // Generación de token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

  res.json({
    success: true,
    message: 'Login exitoso',
    user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role },
    token,
    redirect: '/admin',
  });
});

// Ruta de registro
router.post('/register', validateRegister, handleValidationErrors, async (req, res) => {
  try {
    const cliente = await clientesDAO.save(req.body);
    res.status(201).json({
      success: true,
      message: 'Cliente registrado exitosamente',
      data: cliente,
    });
  } catch (error) {
    console.error('[clientsRouter] register error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al registrar cliente',
    });
  }
});

module.exports = router;