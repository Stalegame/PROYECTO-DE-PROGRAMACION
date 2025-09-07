const express = require('express');
const router = express.Router();
const PersistenceFactory = require('../PersistenceFactory');

const clientesDAO = PersistenceFactory.getDAO('clientes');

// GET /api/clients - Todos los clientes
router.get('/', async (req, res) => {
  try {
    const clientes = await clientesDAO.getAll();
    res.json({
      success: true,
      count: clientes.length,
      data: clientes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/clients/register - Registrar cliente
router.post('/register', async (req, res) => {
  try {
    const cliente = await clientesDAO.save(req.body);
    res.status(201).json({
      success: true,
      message: 'Cliente registrado exitosamente',
      data: cliente
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
