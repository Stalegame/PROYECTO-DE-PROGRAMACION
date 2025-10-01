// routes/cartRouter.js
const path = require('path');
const express = require('express');
const { body, param, validationResult } = require('express-validator');

const PersistenceFactory = require(path.join(__dirname, '..', 'PersistenceFactory'));
const router = express.Router();

const IS_DEV = process.env.NODE_ENV !== 'production';

// ====== Nuestros "asistentes" para manejar datos ======
let cartDAO, productosDAO;
try {
  // Intentamos usar los DAOs principales
  cartDAO = PersistenceFactory.getDAO('cart');
  productosDAO = PersistenceFactory.getDAO('productos');
} catch (e) {
  // Si falla, usamos los de respaldo directos
  const JsonCartDAO = require(path.join(__dirname, '..', 'json', 'JsonCartDAO'));
  const JsonProductosDAO = require(path.join(__dirname, '..', 'json', 'JsonProductosDAO'));
  cartDAO = new JsonCartDAO();
  productosDAO = new JsonProductosDAO();
}

// ====== Reglas para validar lo que nos mandan ======
const validateCartItem = [
  // El ID del producto es obligatorio y debe ser texto
  body('productId')
    .notEmpty().withMessage('Tienes que especificar qué producto quieres')
    .isString().isLength({ min: 1 }).trim().escape(),

  // La cantidad debe ser un número
  body('quantity')
    .notEmpty().withMessage('Tienes que decir cuántos quieres')
    .isInt().withMessage('La cantidad debe ser un número')
    .toInt(),
];

// Esta función revisa si hubo errores en la validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Los datos que mandaste no son válidos',
      details: errors.mapped(),
    });
  }
  next();
};

// Validación para cuando nos mandan un ID en la URL
const validateItemId = [
  param('id')
    .notEmpty().withMessage('Tienes que especificar un ID')
    .isString().isLength({ min: 1 }).trim().escape(),
];

// ==================== RUTAS DEL CARRITO ====================

// GET /api/cart — Ver todo lo que tengo en el carrito
router.get('/', async (_req, res) => {
  try {
    // Traemos los items básicos del carrito
    const cartItems = await cartDAO.getAll();          // [{ productId, quantity }]
    
    // Traemos la información completa de todos los productos
    const allProducts = await productosDAO.getAll();   // [{ id, name, price, image }]

    // Combinamos: a cada item del carrito le agregamos los datos del producto
    const carritoEnriquecido = cartItems.map(item => {
      const producto = allProducts.find(p => p.id === item.productId);
      return {
        ...item,
        product: producto || null  // Si no encuentra el producto, pone null
      };
    });

    res.json({ 
      success: true, 
      count: carritoEnriquecido.length, 
      data: carritoEnriquecido 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'No pudimos cargar tu carrito',
      detail: IS_DEV ? error.message : undefined, // Solo mostramos detalles en desarrollo
    });
  }
});

// POST /api/cart — Agregar productos al carrito o cambiar cantidades
router.post(
  '/',
  validateCartItem,           // Primero validamos
  handleValidationErrors,     // Si hay errores, los mostramos
  async (req, res) => {
    try {
      const { productId, quantity } = req.body;

      // 1. Verificamos que el producto exista en nuestro catálogo
      const producto = await productosDAO.getById(productId);
      if (!producto) {
        return res.status(404).json({ 
          success: false, 
          error: 'Este producto no existe en nuestro catálogo' 
        });
      }

      // 2. Miramos si ya tenía este producto en el carrito
      const carritoActual = await cartDAO.getAll();
      const itemExistente = carritoActual.find(i => i.productId === productId);
      const cantidadActual = itemExistente?.quantity || 0;

      // Calculamos la nueva cantidad total que quedaría
      const nuevaCantidad = cantidadActual + quantity;

      // 3. Verificamos que no pida más de lo que tenemos en stock
      if (nuevaCantidad > producto.stock) {
        return res.status(400).json({
          success: false,
          error: `No tenemos tantos en stock. Máximo disponible: ${producto.stock}`,
        });
      }

      // 4. Todo bien, agregamos al carrito
      const itemActualizado = await cartDAO.addItem(productId, quantity);

      return res.status(201).json({
        success: true,
        message: 'Carrito actualizado correctamente',
        data: itemActualizado,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Ocurrió un error al modificar tu carrito',
        detail: IS_DEV ? error.message : undefined,
      });
    }
  }
);

// POST /api/cart/checkout — Vaciar el carrito después de comprar
router.post('/checkout', async (_req, res) => {
  try {
    await cartDAO.clearCart();
    res.json({ 
      success: true, 
      message: '¡Compra finalizada! Tu carrito está vacío' 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al finalizar la compra',
      detail: IS_DEV ? error.message : undefined,
    });
  }
});

// DELETE /api/cart/:id — Quitar un producto específico del carrito
router.delete('/:id', validateItemId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await cartDAO.removeItem(id);
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        error: 'Este producto no estaba en tu carrito' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Producto quitado del carrito' 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'No pudimos quitar el producto del carrito',
      detail: IS_DEV ? error.message : undefined,
    });
  }
});

// DELETE /api/cart — Vaciar todo el carrito manualmente
router.delete('/', async (_req, res) => {
  try {
    await cartDAO.clearCart();
    res.json({ 
      success: true, 
      message: 'Carrito vaciado completamente' 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'No pudimos vaciar el carrito',
      detail: IS_DEV ? error.message : undefined,
    });
  }
});
module.exports = router;