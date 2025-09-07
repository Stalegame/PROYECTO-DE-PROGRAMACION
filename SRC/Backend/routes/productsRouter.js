const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const PersistenceFactory = require('../PersistenceFactory');

const productosDAO = PersistenceFactory.getDAO('productos');

// ==================== MIDDLEWARES DE VALIDACIÓN ====================

// Validaciones para crear producto
const validateCreateProduct = [
  body('name')
    .notEmpty().withMessage('El nombre del producto es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim().escape(), // Elimina espacios y caracteres peligrosos
    
  body('price')
    .notEmpty().withMessage('El precio es obligatorio')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo')
    .toFloat(), // Convierte a número decimal
    
  body('stock')
    .notEmpty().withMessage('El stock es obligatorio')
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo')
    .toInt(), // Convierte a número entero
    
  body('category')
    .optional() // Opcional
    .isLength({ max: 50 }).withMessage('La categoría no puede tener más de 50 caracteres')
    .trim().escape(),
    
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('La descripción no puede tener más de 500 caracteres')
    .trim().escape()
];

// Validaciones para ID de producto
const validateProductId = [
  param('id')
    .notEmpty().withMessage('El ID del producto es requerido')
    .isLength({ min: 1, max: 50 }).withMessage('ID inválido')
    .trim().escape() // Sanitiza el ID
];

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Datos de entrada inválidos',
      details: errors.array()
    });
  }
  next();
};

// ==================== RUTAS CON VALIDACIONES ====================

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
      error: 'Error interno del servidor al obtener productos'
    });
  }
});

// POST /api/products - Crear nuevo producto CON VALIDACIONES
router.post('/', validateCreateProduct, handleValidationErrors, async (req, res) => {
  try {
    // Los datos ya están validados y sanitizados en este punto
    const nuevoProducto = await productosDAO.save(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: nuevoProducto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al crear producto'
    });
  }
});

// GET /api/products/:id - Producto por ID CON VALIDACIONES
router.get('/:id', validateProductId, handleValidationErrors, async (req, res) => {
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
      error: 'Error interno del servidor al obtener el producto'
    });
  }
});

// PUT /api/products/:id - Actualizar producto
router.put('/:id', 
  validateProductId, 
  validateCreateProduct, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const productoActualizado = await productosDAO.update(req.params.id, req.body);
      
      if (!productoActualizado) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado'
        });
      }
      
      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: productoActualizado
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor al actualizar producto'
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
        error: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al eliminar producto'
    });
  }
});

module.exports = router;