const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
//const prisma = require('./db/index.js') // Descomentar esta linea para el test.
require('dotenv').config();

const PersistenceFactory = require('./PersistenceFactory');

// Crear la app
const app = express();
const IS_PROD = process.env.NODE_ENV === 'production';

// Configuración general de la app
if (IS_PROD) app.set('trust proxy', 1);
else app.set('trust proxy', false);

// Helmet (seguridad)
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  useDefaults: true,
  directives: {
    "default-src": ["'self'"],
    "frame-src": ["'self'", "https://www.google.com", "https://*.google.com"],
    "child-src": ["'self'", "https://www.google.com", "https://*.google.com"],
    "style-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
    "script-src": ["'self'", "'unsafe-inline'"],
    "font-src": ["'self'", "https://cdnjs.cloudflare.com", "data:"],
    "img-src": ["'self'", "https:", "data:"],
    "connect-src": ["'self'"],
    "frame-ancestors": ["'self'"]
  }
}));

// CORS
app.use(cors({
  origin: IS_PROD
    ? ['https://tudominio.com']
    : ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));

// Rate limits
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: '¡Demasiadas peticiones! Espera un poco y vuelve a intentar.' }
});
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos fallidos. Espera 15 minutos.' }
});
app.use('/api/', apiLimiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Logger compacto: hora local y tiempo de respuesta (ms)
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const ms = Math.round(diff[0] * 1e3 + diff[1] / 1e6);
    const localTime = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });
    console.log(`[${localTime}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${ms}ms`);
  });
  next();
});


// Servir Frontend estático
function exists(p) { try { return fs.existsSync(p); } catch { return false; } }
const FRONTEND_DIR_MAIN = path.join(__dirname, '..', 'Frontend');
const FRONTEND_DIR_ALT = path.join(__dirname, 'Frontend');
const FRONTEND_DIR = exists(FRONTEND_DIR_MAIN)
  ? FRONTEND_DIR_MAIN
  : (exists(FRONTEND_DIR_ALT) ? FRONTEND_DIR_ALT : null);

if (FRONTEND_DIR) {
  app.use(express.static(FRONTEND_DIR, { index: false }));

  const sendPage = (res, ...names) => {
    for (const name of names) {
      const full = path.join(FRONTEND_DIR, name);
      if (exists(full)) return res.sendFile(full);
    }
    return res.status(404).json({ error: 'No encontramos esta página' });
  };

  app.get('/', (_req, res) => sendPage(res, 'index.html'));
  app.get('/login', (_req, res) => sendPage(res, 'login.html', 'index.html'));
  app.get('/admin', (_req, res) => sendPage(res, 'admin.html', 'index.html'));
  app.get('/productos', (_req, res) => sendPage(res, 'productos.html', 'index.html'));
}

// Rutas de health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Servidor operativo', timestamp: new Date().toISOString() });
});
app.get('/healthcheck', (_req, res) => {
  res.json({ status: 'OK', message: 'Todo está en orden', timestamp: new Date().toISOString() });
});

try {
  // Rutas API
  const { auth, adminAuth } = require('./middlewares/auth');

  // Routers
  const productsRouter = require('./routes/productsRouter');
  const clientsRouter  = require('./routes/clientsRouter');
  const adminRouter    = require('./routes/adminRouter');
  const cartRouter     = require('./routes/cartRouter');
  const chatRouter     = require('./routes/chatRouter');

  app.use('/api/clients/login', strictLimiter);
  app.use('/api/clients/register', strictLimiter);

  app.use('/api/products', productsRouter);
  app.use('/api/clients', clientsRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/admin', auth, adminAuth, adminRouter);

  console.log('✅ Rutas registradas correctamente');
} catch (e) {
  console.error('⚠️ Error al cargar rutas:', e.message);
}

// Middleware 404 para rutas API
app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada', path: req.originalUrl }));

// Middleware 404 para Frontend
app.use((req, res) => {
  console.warn(`⚠️ Página no encontrada: ${req.originalUrl}`);
  res.status(404).sendFile(path.join(FRONTEND_DIR, 'page_404.html'));
});

// Middleware general de manejo de errores
app.use((err, _req, res, _next) => {
  console.error('🔥 Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno' });
});

module.exports = { app, PersistenceFactory };
