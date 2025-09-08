// routes/clientsRouter.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const path = require('path');

// --- Cargar DAO de clientes con fallback ---
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
    throw e2; // sin DAO no podemos continuar
  }
}

// --- Middleware de validación genérico ---
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Datos de entrada inválidos',
      details: errors.array(),
    });
  }
  next();
};

// --- Validaciones ---
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

// ================= RUTAS =================

// RUTA HEALTH CHECK
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API Clients funcionando',
    timestamp: new Date().toISOString(),
  });
});

// RUTA SIMPLE DE LOGIN (simulada)
router.post('/login', validateLogin, handleValidationErrors, (req, res) => {
  const { email } = req.body;

  // Aquí iría tu validación real (DB/servicio). Esto es demo:
  res.json({
    success: true,
    message: 'Login exitoso',
    user: {
      id: '2',
      nombre: 'Admin Fruna',
      email,
      role: 'admin',
    },
    token: 'token-simulado-123456',
    redirect: '/admin',
  });
});

// GET /api/clients - Todos los clientes
router.get('/', async (req, res) => {
  try {
    const clientes = await clientesDAO.getAll();
    res.json({
      success: true,
      count: clientes.length,
      data: clientes,
    });
  } catch (error) {
    console.error('[clientsRouter] getAll error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener clientes',
    });
  }
});

// POST /api/clients/register - Registrar cliente
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