// SRC/Backend/middlewares/auth.js
const jwt = require('jsonwebtoken');
const PersistenceFactory = require('../PersistenceFactory');

const clientesDAO = PersistenceFactory.getDAO('clientes');

function getBearerToken(req) {
  const h = req.headers.authorization || req.header('Authorization') || '';
  if (!h) return null;
  const parts = h.split(' ');
  return (parts.length === 2 && /^Bearer$/i.test(parts[0])) ? parts[1] : null;
}

const auth = async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Acceso denegado. No hay token.' });
    }

    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'Config JWT ausente (JWT_SECRET_KEY).' });
    }

    let payload;
    try {
      payload = jwt.verify(token, secret); // { id, email, role, iat, exp }
    } catch {
      return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
    }

    // Trae usuario desde la BD (con role actual).
    const user = await clientesDAO.getById(payload.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Token no válido (usuario no existe).' });
    }

    // Si el esquema define 'activo', solo bloquea cuando es explícitamente false.
    if (Object.prototype.hasOwnProperty.call(user, 'activo') && user.activo === false) {
      return res.status(403).json({ success: false, message: 'Cuenta desactivada.' });
    }

    // Confía en la BD para rol; conserva info útil del payload.
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
      nombre: user.nombre,
      // opcional: payloadExp: payload.exp
    };

    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token no válido.' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user && String(req.user.role).toLowerCase() === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Acceso denegado. Se requieren privilegios de administrador.' });
};

// Hay un solo admin y blindarlo por email
const onlyAdminEmail = (adminEmail) => (req, res, next) => {
  if (req.user && req.user.email && req.user.email.toLowerCase() === String(adminEmail).toLowerCase()) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Acceso denegado para este usuario.' });
};

module.exports = { auth, adminAuth, onlyAdminEmail };