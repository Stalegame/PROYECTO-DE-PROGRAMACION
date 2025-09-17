// routes/productsRouter.js
const path = require('path');
const express = require('express');
const { body, param, validationResult } = require('express-validator');

const PersistenceFactory = require(path.join(__dirname, '..', 'PersistenceFactory'));
const router = express.Router();

const IS_DEV = process.env.NODE_ENV !== 'production';

// ====== DAO con fallback ======
let productosDAO;
try {
  productosDAO = PersistenceFactory.getDAO('productos');
} catch (e) {
  const JsonProductosDAO = require(path.join(__dirname, '..', 'json', 'JsonProductosDAO'));
  productosDAO = new JsonProductosDAO();
}

// ====== Middlewares de auth para mutaciones ======
let auth, adminAuth;
try {
  ({ auth, adminAuth } = require('../middlewares/auth'));
} catch (_) {
  // Si no existe el middleware aún, las rutas mutables quedarán públicas (solo en dev).
  if (IS_DEV) console.warn('[productsRouter] middlewares/auth no disponible: POST/PUT/DELETE sin protección');
}

// ====== Normalización de body (soporta ES/EN) ======
const normalizeProductInput = (req, _res, next) => {
  const b = req.body || {};
  const priceRaw = b.price ?? b.precio;
  const stockRaw = b.stock;

  // Deja preparado req.body con campos normalizados
  req.body = {
    id: b.id,
    name: (b.name ?? b.nombre ?? '').toString().trim(),
    price: priceRaw !== undefined && priceRaw !== null ? Number(priceRaw) : undefined,
    stock: stockRaw !== undefined && stockRaw !== null ? Number(stockRaw) : undefined,
    category: (b.category ?? b.categoria ?? '').toString().trim(),
    description: (b.description ?? b.descripcion ?? '').toString().trim(),
  };
  next();
};

// ====== Validaciones ======
const validateCreateOrUpdate = [
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

const validateProductId = [
  param('id')
    .notEmpty().withMessage('El ID del producto es requerido')
    .isLength({ min: 1, max: 64 }).withMessage('ID inválido')
    .trim().escape(),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Datos de entrada inválidos',
      details: errors.mapped(),
    });
  }
  next();
};

// ==================== RUTAS PÚBLICAS ====================

// GET /api/products - listado público
router.get('/', async (_req, res) => {
  try {
    const productos = await productosDAO.getAll();
    res.json({ success: true, count: productos.length, data: productos });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener productos',
      ...(IS_DEV && { detail: error.message }),
    });
  }
});

// GET /api/products/:id - detalle público
router.get('/:id', validateProductId, handleValidationErrors, async (req, res) => {
  try {
    const producto = await productosDAO.getById(req.params.id);
    if (!producto) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
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

// ==================== RUTAS ADMIN (protegidas) ====================

// Aplica protección solo si los middlewares existen
const protect = (fn) => (auth && adminAuth) ? [auth, adminAuth, fn] : [fn];

// POST /api/products - crear
router.post(
  '/',
  normalizeProductInput,
  validateCreateOrUpdate,
  handleValidationErrors,
  ...protect(async (req, res) => {
    try {
      const nuevo = await productosDAO.save(req.body);
      res.status(201).json({ success: true, message: 'Producto creado exitosamente', data: nuevo });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor al crear producto',
        ...(IS_DEV && { detail: error.message }),
      });
    }
  })
);

// PUT /api/products/:id - actualizar
router.put(
  '/:id',
  validateProductId,
  normalizeProductInput,
  validateCreateOrUpdate,
  handleValidationErrors,
  ...protect(async (req, res) => {
    try {
      const actualizado = await productosDAO.update(req.params.id, req.body);
      if (!actualizado) {
        return res.status(404).json({ success: false, error: 'Producto no encontrado' });
      }
      res.json({ success: true, message: 'Producto actualizado exitosamente', data: actualizado });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor al actualizar producto',
        ...(IS_DEV && { detail: error.message }),
      });
    }
  })
);

// DELETE /api/products/:id - eliminar
router.delete(
  '/:id',
  validateProductId,
  handleValidationErrors,
  ...protect(async (req, res) => {
    try {
      const ok = await productosDAO.delete(req.params.id);
      if (!ok) {
        return res.status(404).json({ success: false, error: 'Producto no encontrado' });
      }
      res.json({ success: true, message: 'Producto eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor al eliminar producto',
        ...(IS_DEV && { detail: error.message }),
      });
    }
  })
);

module.exports = router;