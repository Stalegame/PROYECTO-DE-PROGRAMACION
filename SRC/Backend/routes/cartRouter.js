// routes/cartRouter.js
const path = require('path');
const express = require('express');
const { body, param, validationResult } = require('express-validator');

const PersistenceFactory = require(path.join(__dirname, '..', 'PersistenceFactory'));
const router = express.Router();

const IS_DEV = process.env.NODE_ENV !== 'production';

// ====== DAO con fallback ======
let cartDAO, productosDAO;
try {
  cartDAO = PersistenceFactory.getDAO('cart');
  productosDAO = PersistenceFactory.getDAO('productos');
} catch (e) {
  const JsonCartDAO = require(path.join(__dirname, '..', 'json', 'JsonCartDAO'));
  const JsonProductosDAO = require(path.join(__dirname, '..', 'json', 'JsonProductosDAO'));
  cartDAO = new JsonCartDAO();
  productosDAO = new JsonProductosDAO();
}

// ====== Validaciones ======
const validateCartItem = [
  body('productId')
    .notEmpty().withMessage('El ID del producto es obligatorio')
    .isString().isLength({ min: 1 }).trim().escape(),

  body('quantity')
    .notEmpty().withMessage('La cantidad es obligatoria')
    .isInt().withMessage('La cantidad debe ser un número')
    .toInt(),
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

const validateItemId = [
  param('id')
    .notEmpty().withMessage('El ID es obligatorio')
    .isString().isLength({ min: 1 }).trim().escape(),
];

// ==================== RUTAS ====================

// GET /api/cart — obtener carrito con detalles del producto
router.get('/', async (_req, res) => {
  try {
    const cartItems = await cartDAO.getAll();          // [{ productId, quantity }]
    const allProducts = await productosDAO.getAll();   // [{ id, name, price, image }]

    const enrichedCart = cartItems.map(item => {
      const product = allProducts.find(p => p.id === item.productId);
      return {
        ...item,
        product: product || null
      };
    });

    res.json({ success: true, count: enrichedCart.length, data: enrichedCart });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener el carrito',
      detail: IS_DEV ? error.message : undefined,
    });
  }
});

// POST /api/cart — agregar o modificar cantidad de un producto
router.post(
  '/',
  validateCartItem,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { productId, quantity } = req.body;

      // 1. Verifica si el producto existe
      const producto = await productosDAO.getById(productId);
      if (!producto) {
        return res.status(404).json({ success: false, error: 'Producto no encontrado' });
      }

      // 2. Verifica si ya está en el carrito
      const carritoActual = await cartDAO.getAll();
      const itemExistente = carritoActual.find(i => i.productId === productId);
      const cantidadActual = itemExistente?.quantity || 0;

      const nuevaCantidad = cantidadActual + quantity;

      if (nuevaCantidad > producto.stock) {
        return res.status(400).json({
          // alerta de stock
          success: false,
          error: `No hay suficiente stock disponible. Stock máximo: ${producto.stock}`,
        });
      }

      // 3. Agrega o ajusta cantidad
      const updatedItem = await cartDAO.addItem(productId, quantity);

      return res.status(201).json({
        success: true,
        message: 'Carrito actualizado',
        data: updatedItem,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno al modificar carrito',
        detail: IS_DEV ? error.message : undefined,
      });
    }
  }
);

// POST /api/cart/checkout — vaciar carrito al finalizar compra
router.post('/checkout', async (_req, res) => {
  try {
    await cartDAO.clearCart();
    res.json({ success: true, message: 'Compra finalizada y carrito vaciado' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al finalizar compra',
      detail: IS_DEV ? error.message : undefined,
    });
  }
});

// DELETE /api/cart/:id — eliminar un producto del carrito
router.delete('/:id', validateItemId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await cartDAO.removeItem(id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado en el carrito' });
    }
    res.json({ success: true, message: 'Producto eliminado del carrito' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar producto del carrito',
      detail: IS_DEV ? error.message : undefined,
    });
  }
});

// DELETE /api/cart — vaciar carrito manualmente
router.delete('/', async (_req, res) => {
  try {
    await cartDAO.clearCart();
    res.json({ success: true, message: 'Carrito vaciado correctamente' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al vaciar el carrito',
      detail: IS_DEV ? error.message : undefined,
    });
  }
});

module.exports = router;
