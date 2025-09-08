const express = require('express');
const router = express.Router();
<<<<<<< HEAD

// RUTA SIMPLE DE LOGIN - SIEMPRE FUNCIONA
router.post('/login', (req, res) => {
    console.log('📨 Login recibido:', req.body);
    
    // Simular validación básica
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Email y contraseña son requeridos'
        });
    }
    
    // Respuesta simulada exitosa
    res.json({
        success: true,
        message: 'Login exitoso',
        user: {
            id: '2',
            nombre: 'Admin Fruna',
            email: 'admin@fruna.com',
            role: 'admin'
        },
        token: 'token-simulado-123456',
        redirect: '/admin' //ruta???
    });
});

// RUTA HEALTH CHECK
router.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'API Clients funcionando',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
=======
const PersistenceFactory = require('../PersistenceFactory');

const clientesDAO = PersistenceFactory.getDAO('clientes');

// GET /api/clients - Todos los clientes
router.get('/', async (req, res) => {
  try {
    const clientes = await clientesDAO.getAll();
    res.json({
      success: true,
      count: clientes.length,
      data: clientes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/clients/register - Registrar cliente
router.post('/register', async (req, res) => {
  try {
    const cliente = await clientesDAO.save(req.body);
    res.status(201).json({
      success: true,
      message: 'Cliente registrado exitosamente',
      data: cliente
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
>>>>>>> origin
