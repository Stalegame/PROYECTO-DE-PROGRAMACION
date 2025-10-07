const fs = require('fs');
const path = require('path');
const express = require('express'); // El "motor" que hace funcionar todo
const cors = require('cors'); // El que controla quién puede entrar, es como un portero
const helmet = require('helmet'); // seguridad contra hackers
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs'); // Es como un candado para contraseñas
const jwt = require('jsonwebtoken'); // El "carnet de identidad digital"
require('dotenv').config(); // Lee las "instrucciones secretas" del archivo .env (importante tener todo lo necesario del .env sino no sirve de nada)

const PersistenceFactory = require('./PersistenceFactory');

// Nuestro mensajero de WhatsApp
let enviarWhatsApp = async () => {
  console.log('[whatsappService] deshabilitado (stub).');
  return { ok: false, disabled: true };
};
let enviarConfirmacionPedido = async () => ({ ok: false, disabled: true });

try {
  const ws = require('./whatsappService'); // si existe, se usará
  enviarWhatsApp =
    ws.enviarWhatsApp || ws.default || ws.sendWhatsApp || enviarWhatsApp;
  enviarConfirmacionPedido =
    ws.enviarConfirmacionPedido || ws.enviarConfirmacionPedidoDefault || enviarConfirmacionPedido;

  if (typeof enviarWhatsApp === 'function') {
    console.log('[whatsappService] cargado correctamente');
  } else {
    console.warn('[whatsappService] módulo sin función válida; uso stub.');
  }
} catch {
  console.warn('[whatsappService] no encontrado. Continúo sin WhatsApp.');
}

// Configuración básica 
const app = express(); //Creamos la aplicación PRIMERO, OJO
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production'; //Estamos en producción?

// Seguridad y ayudantes 

// Configuración para cuando estamos detrás de un proxy (como NGINX) el proxy es un intermediario entre el usuario y el servidor
// Si usas NGINX o similar, asegúrate de que esta opción esté activada
// Si no usas proxy, déjala en false (por defecto)
if (IS_PROD) {
  app.set('trust proxy', 1);
  console.log('[server] Confiamos en el proxy (estamos en producción)');
} else {
  app.set('trust proxy', false);
  console.log('[server] No usamos proxy (estamos en desarrollo)');
}

// Helmet (es como se dice un casco que protege al servidor de ataques comunes)
app.use(
  helmet({
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
  })
);

// CORS, el "portero" que decide quién puede entrar
app.use(
  cors({
    origin: IS_PROD
      ? ['https://tudominio.com'] // En producción: solo tu dominio
      : ['http://localhost:3000', 'http://localhost:8080'], // En desarrollo: localhost
    credentials: true
  })
);

// Límite de peticiones - el control de fila
// Evita que alguien sature el servidor con muchas peticiones
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '¡Demasiadas peticiones! Espera un poco y vuelve a intentar.' }
});
app.use('/api/', apiLimiter);

// Límite estricto para login/registro - más seguridad en áreas sensibles
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos (se calcula en milisegundos)
  max: 5, // solo 5 intentos
  message: { error: 'Demasiados intentos fallidos. Espera 15 minutos.' }
});

// Traductores de datos convierten lo que manda el frontend
app.use(
  express.json({
    limit: '10kb', // No aceptamos datos muy grandes (para evitar ataques) (como el overflow de memoria)
    verify: (req, _res, buf) => {
      if (!buf || !buf.length) return;
      try {
        JSON.parse(buf.toString()); // Verificamos que sea JSON válido
      } catch {
        throw new Error('El JSON que mandaste está mal formado');
      }
    }
  })
);
app.use(express.urlencoded({ extended: true }));

// El secretario que apunta todo lo que pasa
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Nuestras páginas web (Frontend)
function exists(p) {
  try { return fs.existsSync(p); } catch { return false; }
}

// Buscamos dónde están nuestras páginas web
const FRONTEND_DIR_MAIN = path.join(__dirname, '..', 'Frontend');
const FRONTEND_DIR_ALT  = path.join(__dirname, 'Frontend');
const FRONTEND_DIR =
  exists(FRONTEND_DIR_MAIN) ? FRONTEND_DIR_MAIN :
  (exists(FRONTEND_DIR_ALT) ? FRONTEND_DIR_ALT : null);

console.log('[server] Carpeta Frontend:', FRONTEND_DIR, '¿Existe?', !!FRONTEND_DIR && exists(FRONTEND_DIR));

// Si encontramos las páginas web, las servimos
if (FRONTEND_DIR) {
  const IS_DEV = !IS_PROD;

  // Servimos archivos estáticos (CSS, JS, imágenes)
  app.use(express.static(FRONTEND_DIR, {
    index: false,
    setHeaders: (res, filePath) => {
      if (IS_DEV) {
        // En desarrollo: casi nada se cachea
        if (/\.(html?|js|css)$/i.test(filePath)) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        }
      } else {
        // En producción: cacheamos assets pero no HTML
        if (/\.(html?)$/i.test(filePath)) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
        }
      }
    }
  }));

  // Elbibliotecario que busca páginas
  const sendPage = (res, ...names) => {
    for (const name of names) {
      const full = path.join(FRONTEND_DIR, name);
      if (exists(full)) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        return res.sendFile(full);
      }
    }
    return res.status(404).json({ error: 'No encontramos esta página', buscadas: names, carpeta: FRONTEND_DIR });
  };

  // Definimos las direcciones de nuestras páginas
  app.get('/',          (_req, res) => sendPage(res, 'index.html'));
  app.get('/login',     (_req, res) => sendPage(res, 'login_users.html', 'login.html', 'index.html'));
  app.get('/admin',     (_req, res) => sendPage(res, 'admin_controller.html', 'admin.html', 'index.html'));
  app.get('/contacto',  (_req, res) => sendPage(res, 'contacto.html', 'index.html'));
  app.get('/productos', (_req, res) => sendPage(res, 'productos.html', 'index.html'));

  // Página "no encontrada" para rutas web
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    const full = path.join(FRONTEND_DIR, 'page_404.html');
    res.status(404).sendFile(full);
  });
}

// check del health 
// Para verificar que el servidor está vivo
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: '¡El servidor está funcionando perfectamente!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});
app.get('/healthcheck', (_req, res) => {
  res.json({ status: 'OK', message: 'Todo está en orden', timestamp: new Date().toISOString() });
});

// Nuestras APIs 
try {
  // Los "guardias de seguridad"
  const { auth, onlyAdminEmail } = require('./middlewares/auth');
  
  // Nuestros encargados de ciertas areas 
  const productsRouter = require('./routes/productsRouter');
  const clientsRouter  = require('./routes/clientsRouter');
  const chatbotRouter  = require('./routes/chatbotRouter');
  const adminRouter    = require('./routes/adminRouter');
  const cartRouter     = require('./routes/cartRouter');

  // Areas sensibles con seguridad extra
  app.use('/api/clients/login', strictLimiter);
  app.use('/api/clients/register', strictLimiter);

  // Area de administración - solo para jefes
  app.use('/api/admin', auth, onlyAdminEmail('admin@fruna.cl'), adminRouter);

  // Los demás mostradores de atención
  app.use('/api/products', productsRouter);
  app.use('/api/clients',  clientsRouter);
  app.use('/api/chatbot',  chatbotRouter);
  app.use('/api/cart',     cartRouter); 

  console.log('✅ Todos los mostradores de atención están listos');
} catch (error) {
  console.log('⚠️  Algunos mostradores no están disponibles:', error.message);
}

// Nuestro mensajero de WhatsApp
// Ruta para probar que el mensajero funciona
app.get('/api/test-whatsapp', async (_req, res) => {
  try {
    const to = process.env.TEST_WSP_TO || '56976730618'; // número de prueba (numero de la QA)
    const resultado = await enviarWhatsApp(
      to,
      `¡Hola! 🤖

Esta es una prueba EXITOSA de FRUNA WhatsApp 🍫

✅ Tu API Key está funcionando
📱 Los pedidos enviarán WhatsApp automáticamente

¡El sistema está listo! 🎉`
    );
    res.json({ mensaje: 'Prueba de WhatsApp completada', resultado });
  } catch (error) {
    res.status(500).json({ error: 'Error en la prueba: ' + error.message });
  }
});

// ====== "No encontrado" para APIs ======
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Esta API no existe', path: req.originalUrl });
});

// ====== Manejador de errores global ======
// Por si algo sale mal en cualquier parte
app.use((err, _req, res, _next) => {
  console.error('🔥 Error inesperado:', err);
  const msg = IS_PROD ? 'Error interno del servidor' : err.message;
  res.status(err.status || 500).json({ error: 'Algo salió mal', message: msg });
});
// encender el servidor
(async () => {
  try {
    // Preparamos todos nuestros "asistentes de datos"
    await PersistenceFactory.initialize();
    
    // Encendemos el servidor
    app.listen(PORT, () => {
      const base = `http://localhost:${PORT}`;
      console.log('🟢 ¡Servidor FRUNA encendido en puerto ' + PORT + '!');
      console.log('📍 Dirección:', base);
      console.log('❤️  Chequeo de salud:', base + '/health');
      console.log('🧩 Mostrador de productos:', base + '/api/products');
      console.log('👥 Mostrador de clientes:', base + '/api/clients');
      console.log('🛒 Mostrador de carrito:', base + '/api/cart');
      console.log('🤖 Mostrador del chatbot:', base + '/api/chatbot');
      console.log('📲 Probador de WhatsApp:', base + '/api/test-whatsapp');
      if (FRONTEND_DIR) {
        console.log('🗂️  Carpeta de páginas:', FRONTEND_DIR);
        console.log('🌐 Páginas disponibles: /  /login  /admin  /contacto  /productos');
      }
    });
  } catch (e) {
    console.error('❌ No pudimos preparar los asistentes de datos:', e);
    process.exit(1);
  }
})();
// Exportamos la app para poder hacer pruebas
module.exports = app;