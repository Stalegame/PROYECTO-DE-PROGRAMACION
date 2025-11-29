// SRC/Backend/middlewares/auth.js
const jwt = require('jsonwebtoken');
const PersistenceFactory = require('../PersistenceFactory');

// Obtener el DAO de clientes para verificar usuarios en la base de datos
const clientesDAO = PersistenceFactory.getDAO('clientes');

// Función para extraer el token Bearer del header Authorization
function getBearerToken(req) {
  const h = req.headers.authorization || req.header('Authorization') || '';
  if (!h) return null;
  const parts = h.split(' '); // Divide el header en partes: ["Bearer", "token"]
  // Verifica que tenga formato Bearer y retorna el token, sino retorna null
  return (parts.length === 2 && /^Bearer$/i.test(parts[0])) ? parts[1] : null;
}

// Middleware de autenticación principal - verifica que el usuario esté logueado
const auth = async (req, res, next) => {
  try {
    //Obtener el token del request
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Acceso denegado. No hay token.' });
    }

    // Verificar que exista la clave secreta JWT
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'Config JWT ausente (JWT_SECRET_KEY).' });
    }

    let payload;
    try {
      //Verificar y decodificar el token JWT
      payload = jwt.verify(token, secret); // { id, email, role, iat, exp }
    } catch {
      return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
    }

    //Buscar el usuario en la base de datos por ID
    const user = await clientesDAO.getById(payload.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Token no válido (usuario no existe).' });
    }

    //Verificar que la cuenta esté activa (si existe la propiedad active)
    if (Object.prototype.hasOwnProperty.call(user, 'active') && user.active === false) {
      return res.status(403).json({ success: false, message: 'Cuenta desactivada.' });
    }

    //Agregar la información del usuario al request para uso en siguientes middlewares/rutas
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role || 'USER', // Usar el rol de la BD, default 'USER'
      name: user.name,
      // opcional: payloadExp: payload.exp
    };

    // 7. Pasar al siguiente middleware
    return next();
  } catch (err) {
    // Error general en el proceso de autenticación
    return res.status(401).json({ success: false, message: 'Token no válido.' });
  }
};

// Middleware para verificar que el usuario sea administrador
const adminAuth = (req, res, next) => {
  // Verifica que el usuario exista en el request y tenga rol 'ADMIN'
  if (req.user && String(req.user.role).toUpperCase() === 'ADMIN') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Acceso denegado. Se requieren privilegios de administrador.' });
};

// Middleware que restringe el acceso a un único email específico (admin principal)
// Esto crea un nivel extra de seguridad para el super admin
const onlyAdminEmail = (adminEmail) => (req, res, next) => {
  // Verifica que el usuario sea exactamente el email especificado
  if (req.user && req.user.email && req.user.email.toLowerCase() === String(adminEmail).toLowerCase()) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Acceso denegado para este usuario.' });
};

// Exportar los middlewares para usar en las rutas
module.exports = { auth, adminAuth, onlyAdminEmail };