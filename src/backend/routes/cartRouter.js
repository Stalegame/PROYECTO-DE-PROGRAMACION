const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Ruta del archivo cart.json
const CART_PATH = path.join(__dirname, "..", "data", "cart.json");

// Helpers para leer y escribir el carrito

function readCart() {
  if (!fs.existsSync(CART_PATH)) {
    fs.writeFileSync(CART_PATH, JSON.stringify([]));
  }

  const data = fs.readFileSync(CART_PATH, "utf8");
  return JSON.parse(data);
}

function saveCart(cart) {
  fs.writeFileSync(CART_PATH, JSON.stringify(cart, null, 2));
}

// Rutas del carrito

// Obtener carrito
router.get("/", (req, res) => {
  const cart = readCart();
  res.json({ ok: true, data: cart });
});

// Agregar producto
router.post("/add", (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ ok: false, msg: "productId y quantity son obligatorios" });
  }

  const cart = readCart();
  const existing = cart.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  saveCart(cart);
  res.json({ ok: true, msg: "Producto agregado al carrito", data: cart });
});

// Actualizar cantidad
router.put("/update/:id", (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const cart = readCart();
  const item = cart.find((item) => item.productId === id);

  if (!item) {
    return res.status(404).json({ ok: false, msg: "Producto no encontrado en el carrito" });
  }

  item.quantity = quantity;
  saveCart(cart);

  res.json({ ok: true, msg: "Cantidad actualizada", data: cart });
});

// Eliminar producto del carrito
router.delete("/remove/:id", (req, res) => {
  const { id } = req.params;

  const cart = readCart();
  const updated = cart.filter((item) => item.productId !== id);

  saveCart(updated);

  res.json({ ok: true, msg: "Producto eliminado", data: updated });
});

// Vaciar carrito completo
router.delete("/clear", (req, res) => {
  saveCart([]);
  res.json({ ok: true, msg: "Carrito vaciado" });
});

module.exports = router;
