// server.js — Backend FRUNA (CommonJS)
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

try { require('dotenv').config(); } catch { /* opcional */ }

const PersistenceFactory = require('./PersistenceFactory');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// ============= Middlewares base y de seguridad =============
// Configuración de trust proxy según entorno
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);   // en hosting real, con proxy delante.
  console.log('[server] trust proxy = 1 (production)');
} else {
  app.set('trust proxy', false); // en tu compu, sin proxy.
  console.log('[server] trust proxy = false (development)');
}

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "style-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      "script-src": ["'self'", "'unsafe-inline'"],
      "font-src": ["'self'", "https://cdnjs.cloudflare.com", "data:"],
      "img-src": ["'self'", "https:", "data:"]
    }
  }
}));

app.use(cors({
  origin: IS_PROD ? ['https://tudominio.com'] : ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));

// Rate limit general para /api/*
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,                  // máximo 100 requests por IP
  standardHeaders: true,     // devuelve info en headers estándar
  legacyHeaders: false,      // desactiva headers obsoletos
  message: { error: 'Demasiadas peticiones, inténtalo más tarde.' }
});
app.use('/api/', apiLimiter);

// Rate limit estricto para endpoints sensibles
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,                   // máximo 5 intentos
  message: { error: 'Demasiados intentos, espera 15 minutos.' }
});

app.use(express.json({
  limit: '10kb',
  verify: (req, _res, buf) => {
    if (!buf || !buf.length) return;
    try { JSON.parse(buf.toString()); } catch { throw new Error('JSON malformado'); }
  }
}));

// Agregar para soportar <form method="POST">
app.use(express.urlencoded({ extended: true }));

// Log mínimo de requests
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============= Frontend estático =============
function exists(p) { try { return fs.existsSync(p); } catch { return false; } }

const FRONTEND_DIR_MAIN = path.join(__dirname, '..', 'Frontend');
const FRONTEND_DIR_ALT  = path.join(__dirname, 'Frontend');
const FRONTEND_DIR = exists(FRONTEND_DIR_MAIN) ? FRONTEND_DIR_MAIN :
                     (exists(FRONTEND_DIR_ALT) ? FRONTEND_DIR_ALT : null);

console.log('[server] FRONTEND_DIR =', FRONTEND_DIR, 'exists?', !!FRONTEND_DIR && exists(FRONTEND_DIR));
if (FRONTEND_DIR) {
  app.use(express.static(FRONTEND_DIR, {
    index: false,
    setHeaders: (res, filePath) => {
      if (/\.(html?)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=3600, immutable');
      }
    }
  }));

  const sendPage = (res, ...names) => {
    for (const name of names) {
      const full = path.join(FRONTEND_DIR, name);
      if (exists(full)) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        return res.sendFile(full);
      }
    }
    return res.status(404).json({ error: 'Archivo no encontrado', searched: names, base: FRONTEND_DIR });
  };

  // Rutas de páginas
  app.get('/',          (_req, res) => sendPage(res, 'index.html'));
  app.get('/login',     (_req, res) => sendPage(res, 'login_users.html', 'login.html', 'index.html'));
  app.get('/admin',     (_req, res) => sendPage(res, 'admin_controller.html', 'admin.html', 'index.html'));
  app.get('/contacto',  (_req, res) => sendPage(res, 'contacto.html', 'index.html'));
  app.get('/productos', (_req, res) => sendPage(res, 'productos.html', 'index.html'));

  // ============= Página 404 para el frontend =============
  app.use((req, res, next) => {
    // Si es una ruta de la API, seguimos al manejador API
    if (req.path.startsWith('/api')) return next();

    // Si es cualquier otra ruta no definida, devolvemos la página 404 del frontend
    const full = path.join(FRONTEND_DIR, 'page_404.html');
    res.status(404).sendFile(full);
  });
}

// ============= Healthchecks =============
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

app.get('/healthcheck', (_req, res) => {
  res.json({ status: 'OK', message: 'Health check funcionando', timestamp: new Date().toISOString() });
});

// ============= Rutas API =============
try {
  const productsRouter = require('./routes/productsRouter');
  const clientsRouter  = require('./routes/clientsRouter');
  const chatbotRouter  = require('./routes/chatbotRouter');

  // Rutas de login y registro
  app.use('/api/clients/login', strictLimiter);
  app.use('/api/clients/register', strictLimiter);

  app.use('/api/products', productsRouter);
  app.use('/api/clients',  clientsRouter);
  app.use('/api/chatbot',  chatbotRouter);

  console.log('✅ Rutas API cargadas correctamente');
} catch (error) {
  console.log('⚠️  Algunas rutas API no están disponibles:', error.message);
}

//============= 404 API para el Backend ============
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found', path: req.originalUrl });
});

// ============= Manejo de errores global =============
app.use((err, _req, res, _next) => {
  console.error('🔥 Unhandled error:', err);
  const msg = IS_PROD ? 'Error interno del servidor' : err.message;
  res.status(err.status || 500).json({ error: 'Error interno del servidor', message: msg });
});

// ============= Arranque =============
(async () => {
  try {
    await PersistenceFactory.initialize(); // crea/valida archivos JSON de data
    app.listen(PORT, () => {
      const base = `http://localhost:${PORT}`;
      console.log('🟢 Servidor FRUNA corriendo en puerto ' + PORT);
      console.log('📍 URL:', base);
      console.log('❤️ Health:', base + '/health');
      console.log('🧩 API Products:', base + '/api/products');
      console.log('👥 API Clients:',  base + '/api/clients');
      console.log('🤖 API Chatbot:',  base + '/api/chatbot');
      if (FRONTEND_DIR) {
        console.log('🗂️  Frontend dir:', FRONTEND_DIR);
        console.log('🌐 Páginas: /  /login  /admin  /contacto  /productos');
      }
    });
  } catch (e) {
    console.error('❌ Error inicializando persistencia:', e);
    process.exit(1);
  }
})();

module.exports = app;