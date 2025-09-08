<<<<<<< HEAD
﻿const fs = require('fs');
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const PersistenceFactory = require("./PersistenceFactory");
=======
﻿const express = require('express');
const cors = require('cors');
require('dotenv').config();
>>>>>>> origin

const app = express();
const PORT = process.env.PORT || 3000;

<<<<<<< HEAD
// ==================== MIDDLEWARES DE SEGURIDAD ====================

// 1. Helmet - Protección de cabeceras HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// 2. Rate Limiting - Prevenir ataques de fuerza bruta
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Demasiadas peticiones desde esta IP, intenta nuevamente después de 15 minutos" },
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/", apiLimiter);

// Limiter más estricto para login y endpoints críticos
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Demasiados intentos, por favor espera 15 minutos" }
});

// 3. CORS
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? ["https://tudominio.com"]
    : ["http://localhost:3000", "http://localhost:8080"],
  credentials: true
}));

// 4. Parseo seguro de JSON
app.use(express.json({
  limit: "10kb",
  verify: (req, res, buf) => {
    try { JSON.parse(buf.toString()); } catch (e) { throw new Error("JSON malformado"); }
  }
}));

// 5. Sanitización simple
app.use((req, res, next) => {
  const sanitize = (input) => {
    if (typeof input === "string") {
      return input.replace(/[<>$'"\\/(){}\[\]*+?|]/g, "");
    }
    return input;
  };
  if (req.body) {
    Object.keys(req.body).forEach(k => {
      if (typeof req.body[k] === "string") req.body[k] = sanitize(req.body[k]);
      else if (Array.isArray(req.body[k])) req.body[k] = req.body[k].map(v => typeof v === "string" ? sanitize(v) : v);
    });
  }
  if (req.query) {
    Object.keys(req.query).forEach(k => {
      if (typeof req.query[k] === "string") req.query[k] = sanitize(req.query[k]);
    });
  }
  next();
});

// ==================== SERVIR ARCHIVOS ESTÁTICOS ====================

function exists(p){ try { return fs.existsSync(p); } catch { return false; } }

// Por defecto asume Frontend junto al Backend (..\Frontend), que es tu caso:
let FRONTEND_DIR = path.join(__dirname, '..', 'Frontend');
// Si existiera también en Backend\\Frontend, podría usarse, pero priorizamos el real:
if (!exists(FRONTEND_DIR)) {
  const inside = path.join(__dirname, 'Frontend');
  if (exists(inside)) FRONTEND_DIR = inside;
}
console.log('🗂️  FRONTEND_DIR =', FRONTEND_DIR, 'exists?', exists(FRONTEND_DIR));

if (exists(FRONTEND_DIR)) {
  app.use(express.static(FRONTEND_DIR));
}

// helper para enviar html con fallback
function sendPage(res, ...names){
  for (const name of names){
    const full = path.join(FRONTEND_DIR, name);
    if (exists(full)) return res.sendFile(full);
  }
  res.status(404).json({ error: 'Archivo no encontrado', searched: names, base: FRONTEND_DIR });
}

// ==================== RUTAS DEL FRONTEND ====================
app.get('/',          (req,res)=> sendPage(res, 'index.html'));
app.get('/admin',     (req,res)=> sendPage(res, 'admin_controller.html', 'admin.html', 'index.html'));
app.get('/contacto',  (req,res)=> sendPage(res, 'contacto.html', 'index.html'));
app.get('/login',     (req,res)=> sendPage(res, 'login_users.html', 'login.html', 'index.html'));
app.get('/productos', (req,res)=> sendPage(res, 'productos.html', 'index.html'));

require(path.join(__dirname, 'routes', 'frontendOverride'))(app);

// ==================== CARGAR RUTAS API ====================

try {
  const productsRouter = require("./routes/productsRouter");
  const clientsRouter = require("./routes/clientsRouter");
  const chatbotRouter = require("./routes/chatbotRouter");

  // Limiter estricto en endpoints sensibles
  app.use("/api/clients/login", strictLimiter);
  app.use("/api/clients/register", strictLimiter);

  // Montaje de routers (tus endpoints quedan iguales)
  app.use("/api/products", productsRouter);
  app.use("/api/clients", clientsRouter);
  app.use("/api/chatbot", chatbotRouter);

  console.log("✅ Rutas API cargadas correctamente");
} catch (error) {
  console.log("❌  Algunas rutas API no están disponibles:", error.message);
}

// ==================== RUTAS PRINCIPALES ====================

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0"
  });
});

app.get("/healthcheck", (req, res) => {
  res.json({
    status: "OK",
    message: "Health check funcionando",
=======
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
>>>>>>> origin
    timestamp: new Date().toISOString()
  });
});

<<<<<<< HEAD
// ==================== MANEJO DE ERRORES ====================
// ===== FRUNA FRONTEND ROUTES (SRC\Frontend) =====

function _exists(p){ try { return fs.existsSync(p); } catch { return false; } }
const FRONT_SRC = path.join(__dirname, '..', 'Frontend');
console.log('[server.js] FRONT_SRC =', FRONT_SRC, 'exists?', _exists(FRONT_SRC));

if (_exists(FRONT_SRC)) {
  app.use(express.static(FRONT_SRC));
}

function _send(res, base, ...names){
  for (const n of names){
    const full = path.join(base, n);
    if (_exists(full)) return res.sendFile(full);
  }
  res.status(404).json({ error: 'Archivo no encontrado', searched: names, base });
}

// Rutas reales
app.get('/',          (req,res)=> _send(res, FRONT_SRC, 'index.html'));
app.get('/login',     (req,res)=> _send(res, FRONT_SRC, 'login_users.html', 'login.html', 'index.html'));
app.get('/admin',     (req,res)=> _send(res, FRONT_SRC, 'admin_controller.html', 'admin.html', 'index.html'));
app.get('/productos', (req,res)=> _send(res, FRONT_SRC, 'productos.html', 'index.html'));
app.get('/contacto',  (req,res)=> _send(res, FRONT_SRC, 'contacto.html', 'index.html'));
// ===== END FRUNA FRONTEND ROUTES =====

app.use((err, req, res, next) => {
  console.error("Error:", err);
  const message = process.env.NODE_ENV === "production" ? "Error interno del servidor" : err.message;
  res.status(err.status || 500).json({
    error: "Error interno del servidor",
    message
  });
});

// 404



app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "Frontend", "login_users.html"));
});
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.originalUrl,
    availableRoutes: ["/", "/health", "/healthcheck", "/api/products", "/api/clients", "/api/chatbot", "/admin", "/login", "/productos", "/contacto"]
  });
});

// ==================== INICIAR SERVIDOR ====================

(async () => {
  try {
    await PersistenceFactory.initialize(); // ← crea/verifica los JSON
    app.listen(PORT, () => {
      console.log("✅ Servidor FRUNA corriendo en puerto " + PORT);
      console.log("🌐 Frontend:           http://localhost:" + PORT);
      console.log("🛠️  Admin Panel:       http://localhost:" + PORT + "/admin");
      console.log("📞 Contacto:           http://localhost:" + PORT + "/contacto");
      console.log("🔐 Login:              http://localhost:" + PORT + "/login");
      console.log("🛒 Productos:          http://localhost:" + PORT + "/productos");
      console.log("🧩 API Products:       http://localhost:" + PORT + "/api/products");
      console.log("🧩 API Clients:        http://localhost:" + PORT + "/api/clients");
      console.log("🧩 API Chatbot:        http://localhost:" + PORT + "/api/chatbot");
      console.log("❤️  Health:            http://localhost:" + PORT + "/health");
    });
  } catch (e) {
    console.error("❌ Error inicializando persistencia:", e);
    process.exit(1);
  }
})();

module.exports = app;








app.get("/", (req, res) => {
  const p1 = require('path').join(__dirname, '..', 'Frontend', 'index.html');
  const p2 = require('path').join(__dirname, 'Frontend', 'index.html');
  const fs = require('fs');
  if (fs.existsSync(p1)) return res.sendFile(p1);
  if (fs.existsSync(p2)) return res.sendFile(p2);
  res.status(404).json({ error: "index.html no encontrado", tried: [p1, p2] });
});




=======
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
>>>>>>> origin
