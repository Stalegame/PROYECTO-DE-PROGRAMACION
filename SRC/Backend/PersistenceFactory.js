// SRC/Backend/PersistenceFactory.js
const path = require('path');
// Importamos todos nuestros "asistentes de datos"
const JsonProductosDAO = require(path.join(__dirname, 'json', 'JsonProductosDAO'));
const JsonClientesDAO  = require(path.join(__dirname, 'json', 'JsonClientesDAO'));
const JsonChatbotDAO   = require(path.join(__dirname, 'json', 'JsonChatbotDAO'));
const JsonCartDAO      = require(path.join(__dirname, 'json', 'JsonCartDAO'));

console.log('[PersistenceFactory] Cargado en:', __filename);

class PersistenceFactory {
  // Este método es como un "director"(pq dirigexd) que te da el asistente correcto
  static getDAO(tipo) {
    // Limpiamos y estandarizamos el tipo que nos piden
    const tipoLimpio = String(tipo || '').toLowerCase().trim();
    console.log('[PersistenceFactory] Nos pidieron:', JSON.stringify(tipo), 'convertido a:', JSON.stringify(tipoLimpio));

    // Dependiendo de lo que necesiten, damos el asistente correcto
    switch (tipoLimpio) {
      case 'productos':
      case 'products':
        console.log('[PersistenceFactory] ✅ Dando el asistente de productos');
        return new JsonProductosDAO();

      case 'clientes':
      case 'clients':
        console.log('[PersistenceFactory] ✅ Dando el asistente de clientes');
        return new JsonClientesDAO();

      case 'chatbot':
        console.log('[PersistenceFactory] ✅ Dando el asistente del chatbot');
        return new JsonChatbotDAO();

      case 'cart':
        console.log('[PersistenceFactory] ✅ Dando el asistente del carrito');
        return new JsonCartDAO();

      default:
        // Si nos piden algo que no conocemos, avisamos
        console.error('[PersistenceFactory] ❌ No conocemos este tipo:', JSON.stringify(tipo), '(convertido:', JSON.stringify(tipoLimpio), ')');
        throw new Error(`No tenemos un asistente para: ${tipo}`);
    }
  }

  // Este método prepara todos los asistentes cuando arranca la aplicación
  static async initialize() {
    console.log('🔧 Preparando todos nuestros asistentes de datos...');
    try {
      // Pedimos todos los asistentes que tenemos disponibles
      const asistentes = [
        this.getDAO('productos'),  // Asistente de productos
        this.getDAO('clientes'),   // Asistente de clientes  
        this.getDAO('chatbot'),    // Asistente del chatbot
        this.getDAO('cart'),       // Asistente del carrito
      ];
      
      console.log('✅ ¡Todos los asistentes están listos para trabajar!');
      return asistentes;
    } catch (error) {
      console.error('❌ Hubo un problema al preparar los asistentes:', error.message);
      throw error;
    }
  }
}
// Exportamos la fábrica para que otros puedan usarla
module.exports = PersistenceFactory;