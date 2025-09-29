const fs = require('fs').promises;
const path = require('path');
const CART_FILE = path.join(__dirname, 'cart.json');

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

  // Agregar producto (o aumentar cantidad si ya existe)
  async addItem(productId, quantity) {
    const cart = await this._loadCart();
    const index = cart.findIndex(item => item.productId === productId);

    if (index !== -1) {
        cart[index].quantity += quantity;
    } else {
        cart.push({ productId, quantity });
    }

    // No permitir cantidades menores o iguales a 0
    const filteredCart = cart.filter(item => item.quantity > 0);

    await this._saveCart(filteredCart);
    return filteredCart.find(item => item.productId === productId);
  }

  // Eliminar un ítem del carrito
  async removeItem(productId) {
    const cart = await this._loadCart();
    const updatedCart = cart.filter(item => item.productId !== productId);

    if (updatedCart.length === cart.length) return false; // no se eliminó nada

    await this._saveCart(updatedCart);
    return true;
  }

  // Vaciar el carrito completo
  async clearCart() {
    await this._saveCart([]);
  }
}

module.exports = JsonCartDAO;
