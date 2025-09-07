const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());


try {
  const productsRouter = require('./routes/productsRouter');
  const clientsRouter = require('./routes/clientsRouter');
  const chatbotRouter = require('./routes/chatbotRouter');
  
  app.use('/api/products', productsRouter);
  app.use('/api/clients', clientsRouter);
  app.use('/api/chatbot', chatbotRouter);
  
  console.log('✅ Rutas API cargadas correctamente');
} catch (error) {
  console.log('⚠️  Algunas rutas API no están disponibles:', error.message);
}

// Ruta PRINCIPAL
app.get('/', (req, res) => {
  res.json({ 
    message: '¡Backend FRUNA funcionando! 🚀',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Ruta de health check alternativa
app.get('/healthcheck', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Health check funcionando',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// Ruta para 404 
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    availableRoutes: ['/', '/health', '/healthcheck', '/api/products', '/api/clients', '/api/chatbot']
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🟢 Servidor FRUNA corriendo en puerto ' + PORT);
  console.log('📍 URL: http://localhost:' + PORT);
  console.log('📦 API Products: http://localhost:' + PORT + '/api/products');
  console.log('👥 API Clients: http://localhost:' + PORT + '/api/clients');
  console.log('🤖 API Chatbot: http://localhost:' + PORT + '/api/chatbot');
  console.log('📊 Health: http://localhost:' + PORT + '/health');
});

module.exports = app;