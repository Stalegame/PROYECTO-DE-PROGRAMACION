const jwt = require('jsonwebtoken');
const PersistenceFactory = require('../PersistenceFactory');

const clientesDAO = PersistenceFactory.getDAO('clientes');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Acceso denegado. No hay token.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await clientesDAO.getById(decoded.id);
    
    if (!user || !user.activo) {
      return res.status(401).json({ message: 'Token no válido.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token no válido.' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de administrador.' });
  }
};

module.exports = { auth, adminAuth };