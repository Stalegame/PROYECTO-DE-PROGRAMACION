const express = require('express');
const router = express.Router();
const PersistenceFactory = require('../PersistenceFactory');

const productosDAO = PersistenceFactory.getDAO('productos');

// GET /api/products - Todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await productosDAO.getAll();
    res.json({
      success: true,
      count: productos.length,
      data: productos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/products - Crear nuevo producto
router.post('/', async (req, res) => {
  try {
    const nuevoProducto = await productosDAO.save(req.body);
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: nuevoProducto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/products/:id - Producto por ID
router.get('/:id', async (req, res) => {
  try {
    const producto = await productosDAO.getById(req.params.id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
