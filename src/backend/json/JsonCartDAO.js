const fs = require('fs').promises;
const path = require('path');

const CART_FILE = path.join(__dirname, '..', 'data', 'cart.json');

class JsonCartDAO {
  constructor() {
    this.cartFile = CART_FILE;
  }

  // Carga el carrito completo
  async _loadCart() {
    try {
      const data = await fs.readFile(this.cartFile, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      return []; // si no existe o está vacío
    }
  }

  // Guarda el carrito completo
  async _saveCart(cart) {
    await fs.writeFile(this.cartFile, JSON.stringify(cart, null, 2));
  }

  // Obtener todo el carrito
  async getAll() {
    return await this._loadCart();
  }

  // Obtener un ítem por su ID
  async getById(productId) {
    const cart = await this._loadCart();
    return cart.find(item => item.productId === productId) || null;
  }

  // Agregar producto (o aumentar cantidad si ya existe)
  async addItem(productId, quantity) {
    const cart = await this._loadCart();

    let item = cart.find(item => item.productId === productId);

    if (item) {
      item.quantity += quantity;
    } else {
      item = { id: productId, productId, quantity };
      cart.push(item);
    }

    // No permitir cantidades menores o iguales a 0
    const filteredCart = cart.filter(item => item.quantity > 0);

    await this._saveCart(filteredCart);

    return filteredCart.find(i => i.productId === productId);
  }

  // Eliminar un ítem del carrito
  async removeItem(productId) {
    const cart = await this._loadCart();
    const updatedCart = cart.filter(item => item.productId !== productId);

    if (updatedCart.length === cart.length) return false;

    await this._saveCart(updatedCart);
    return true;
  }

  // Vaciar el carrito completo
  async clearCart() {
    await this._saveCart([]);
  }
}

module.exports = JsonCartDAO;
