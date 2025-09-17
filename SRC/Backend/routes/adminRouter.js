// routes/adminRouter.js
const express = require('express');
const router = express.Router();
const PersistenceFactory = require('../PersistenceFactory');
const clientesDAO = PersistenceFactory.getDAO('clientes');

// Ejemplo: dashboard admin
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido al panel de administrador',
    user: req.user // lo setea el middleware auth
  });
});

// Ejemplo: ver todos los usuarios
router.get('/clientes', async (req, res) => {
  try {
    const clientes = await clientesDAO.getAll(); // getAll NO expone passwordHash
    res.json({ success: true, data: clientes });
  } catch {
    res.status(500).json({ success: false, error: 'Error obteniendo clientes' });
  }
});

// Ejemplo: desactivar un usuario
router.patch('/clientes/:id/desactivar', async (req, res) => {
  try {
    const id = req.params.id;
    const cliente = await clientesDAO.update(id, { activo: false });
    if (!cliente) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });

    res.json({ success: true, message: 'Usuario desactivado', data: cliente });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error desactivando usuario' });
  }
});

module.exports = router;