// Carrito simple en memoria por usuario 

const carts = new Map();  
// { userId: [ { productId, quantity } ] }

module.exports = {
  getCart(userId) {
    if (!carts.has(userId)) carts.set(userId, []);
    return carts.get(userId);
  },

  addItem(userId, productId, quantity) {
    const cart = this.getCart(userId);
    const item = cart.find(i => i.productId === productId);

    if (item) {
      item.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }

    return item || { productId, quantity };
  },

  removeItem(userId, productId) {
    const cart = this.getCart(userId);
    const index = cart.findIndex(i => i.productId === productId);
    if (index === -1) return false;

    cart.splice(index, 1);
    return true;
  },

  clearCart(userId) {
    carts.set(userId, []);
  }
};
