const express = require('express');
const router = express.Router();

// Ruta simple de prueba
router.get('/test', (req, res) => {
  res.json({ 
    message: '✅ Ruta de chatbot funcionando',
    timestamp: new Date().toISOString()
  });
});

router.get('/', (req, res) => {
  res.json({ message: 'Ruta de chatbot' });
});

module.exports = router;
