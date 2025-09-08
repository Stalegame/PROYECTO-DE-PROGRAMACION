const express = require('express');
const router = express.Router();

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
