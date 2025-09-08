// routes/productsRouter.js
const path = require('path');
const express = require('express');
const { body, param, validationResult } = require('express-validator');

const PersistenceFactoryPath = path.join(__dirname, '..', 'PersistenceFactory');
console.log('[productsRouter] require ->', PersistenceFactoryPath);
console.log('[productsRouter] resolve ->', require.resolve(PersistenceFactoryPath));

const PersistenceFactory = require(PersistenceFactoryPath);

const router = express.Router();
const IS_DEV = process.env.NODE_ENV !== 'production';

// === Fallback robusto: si la Factory falla, uso el DAO directo ===
let productosDAO;
try {
  const tipo = 'productos';
  console.log('[productsRouter] tipo =>', JSON.stringify(tipo), 'len=', (tipo || '').length);
  productosDAO = PersistenceFactory.getDAO(tipo);
} catch (e) {
  console.error('[productsRouter] Factory falló, usando fallback JsonProductosDAO. Motivo:', e.message);
  const JsonProductosDAO = require(path.join(__dirname, '..', 'json', 'JsonProductosDAO'));
  productosDAO = new JsonProductosDAO();
}

// ==================== MIDDLEWARES DE VALIDACIÓN ====================

// Validaciones para crear/actualizar producto
const validateCreateProduct = [
  body('name')
    .notEmpty().withMessage('El nombre del producto es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim().escape(),

  body('price')
    .notEmpty().withMessage('El precio es obligatorio')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo')
    .toFloat(),

  body('stock')
    .notEmpty().withMessage('El stock es obligatorio')
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo')
    .toInt(),

  body('category')
    .optional()
    .isLength({ max: 50 }).withMessage('La categoría no puede tener más de 50 caracteres')
    .trim().escape(),

  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('La descripción no puede tener más de 500 caracteres')
    .trim().escape(),
];

// Validaciones para ID de producto
const validateProductId = [
  param('id')
    .notEmpty().withMessage('El ID del producto es requerido')
    .isLength({ min: 1, max: 50 }).withMessage('ID inválido')
    .trim().escape(),
];

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Datos de entrada inválidos',
      details: errors.array(),
    });
  }
  next();
};

// ==================== RUTAS ====================

// GET /api/products - Todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await productosDAO.getAll();
    res.json({
      success: true,
      count: productos.length,
      data: productos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener productos',
      ...(IS_DEV && { detail: error.message }),
    });
  }
});

// POST /api/products - Crear nuevo producto (con validaciones)
router.post('/', validateCreateProduct, handleValidationErrors, async (req, res) => {
  try {
    const nuevoProducto = await productosDAO.save(req.body);
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: nuevoProducto,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al crear producto',
      ...(IS_DEV && { detail: error.message }),
    });
  }
});

// GET /api/products/:id - Producto por ID
router.get('/:id', validateProductId, handleValidationErrors, async (req, res) => {
  try {
    const producto = await productosDAO.getById(req.params.id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado',
      });
    }
    res.json({ success: true, data: producto });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener el producto',
      ...(IS_DEV && { detail: error.message }),
    });
  }
});

// PUT /api/products/:id - Actualizar producto
router.put(
  '/:id',
  validateProductId,
  validateCreateProduct,
  handleValidationErrors,
  async (req, res) => {
    try {
      const productoActualizado = await productosDAO.update(req.params.id, req.body);
      if (!productoActualizado) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado',
        });
      }
      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: productoActualizado,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor al actualizar producto',
        ...(IS_DEV && { detail: error.message }),
      });
    }
  }
);

// DELETE /api/products/:id - Eliminar producto
router.delete('/:id', validateProductId, handleValidationErrors, async (req, res) => {
  try {
    const resultado = await productosDAO.delete(req.params.id);
    if (!resultado) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado',
      });
    }
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al eliminar producto',
      ...(IS_DEV && { detail: error.message }),
    });
  }
});

module.exports = router;