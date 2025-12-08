// Rutas para gestionar productos (Usuario público)

const express = require('express');
const PersistenceFactory = require('../PersistenceFactory');

const router = express.Router();

const productosDAO = PersistenceFactory.getDAO('productos');

// GET /api/products - Ver todos los productos
router.get('/', async (_req, res) => {
  try {
    const productos = await productosDAO.getAll();
    res.status(200).json({ 
      success: true, 
      count: productos.length, 
      data: productos,
      message: `Encontrados ${productos.length} productos` 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'No pudimos cargar los productos',
    });
  }
});

// GET /api/products/famous - Ver productos destacados
router.get('/famous', async (_req, res) => {
  try {
    const productos = await productosDAO.getFamous();
    res.status(200).json({ 
      success: true,
      count: productos.length, 
      data: productos,
      message: `Encontrados ${productos.length} productos destacados` 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'No pudimos cargar los productos destacados',
    });
  }
});

// GET /api/products/:id - Ver un producto específico
router.get('/:id', async (req, res) => {
  try {
    const producto = await productosDAO.getById(req.params.id);
    if (!producto) {
      return res.status(404).json({ 
        success: false, 
        error: 'No encontramos este producto' 
      });
    }
    res.status(200).json({ 
      success: true, 
      data: producto,
      message: 'Producto encontrado' 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al buscar el producto',
    });
  }
});

module.exports = router;