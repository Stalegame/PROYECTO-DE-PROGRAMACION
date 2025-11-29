const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const PersistenceFactory = require('../PersistenceFactory');

const CART_PATH = path.join(__dirname, "..", "data", "cart.json");
const productosDAO = PersistenceFactory.getDAO('productos');

// Leer carrito
function readCart() {
  if (!fs.existsSync(CART_PATH)) {
    fs.writeFileSync(CART_PATH, JSON.stringify([]));
  }
  const data = fs.readFileSync(CART_PATH, "utf8");
  return JSON.parse(data);
}

// Guardar carrito
function saveCart(cart) {
  fs.writeFileSync(CART_PATH, JSON.stringify(cart, null, 2));
}

// Obtener datos del producto
async function getProductData(productId) {
  try {
    const producto = await productosDAO.getById(productId);
    return producto || null;
  } catch (error) {
    console.error('Error al buscar producto:', error);
    return null;
  }
}

// Obtener carrito del usuario
router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  const cart = readCart();
  const userCart = cart.find(c => c.userId === userId) || { userId, items: [] };
  res.json({ ok: true, data: userCart });
});

// Agregar producto
router.post("/add", async (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || !quantity) {
    return res.status(400).json({ ok: false, msg: "userId, productId y quantity son obligatorios" });
  }

  const cart = readCart();
  let userCart = cart.find(c => c.userId === userId);
  if (!userCart) {
    userCart = { userId, items: [] };
    cart.push(userCart);
  }

  // Obtener datos del producto
  const product = await getProductData(productId);
  if (!product) return res.status(404).json({ ok: false, msg: "Producto no encontrado" });

  const existing = userCart.items.find(i => i.productId === productId);
  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    userCart.items.push({
      productId,
      quantity: Number(quantity),
      name: product.name,
      price: product.price,
      image: product.image
    });
  }

  saveCart(cart);
  res.json({ ok: true, msg: "Producto agregado al carrito", data: userCart });
});

// Actualizar cantidad
router.put("/update/:userId/:productId", (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  const cart = readCart();
  const userCart = cart.find(c => c.userId === userId);
  if (!userCart) return res.status(404).json({ ok: false, msg: "Carrito no encontrado" });

  const item = userCart.items.find(i => i.productId === productId);
  if (!item) return res.status(404).json({ ok: false, msg: "Producto no encontrado en el carrito" });

  item.quantity = Number(quantity);
  saveCart(cart);
  res.json({ ok: true, msg: "Cantidad actualizada", data: userCart });
});

// Eliminar producto
router.delete("/remove/:userId/:productId", (req, res) => {
  const { userId, productId } = req.params;

  const cart = readCart();
  const userCart = cart.find(c => c.userId === userId);
  if (!userCart) return res.status(404).json({ ok: false, msg: "Carrito no encontrado" });

  userCart.items = userCart.items.filter(i => i.productId !== productId);
  if (userCart.items.length === 0) {
    // Si no quedan items, eliminar el carrito del usuario
    const index = cart.findIndex(c => c.userId === userId);
    if (index !== -1) {
      cart.splice(index, 1);
    }
  }

  saveCart(cart);
  res.json({ ok: true, msg: "Producto eliminado", data: userCart });
});

// Vaciar carrito completo (Con el usuario)
router.delete("/clear/:userId", (req, res) => {
  const { userId } = req.params;
  let cart = readCart();

  const newCart = cart.filter(c => c.userId !== userId);
  saveCart(newCart);

  res.json({ ok: true, msg: "Carrito vaciado", data: newCart });
});

module.exports = router;
