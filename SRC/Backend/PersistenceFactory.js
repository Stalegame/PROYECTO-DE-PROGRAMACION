// SRC/Backend/PersistenceFactory.js
const JsonProductosDAO = require('./json/JsonProductosDAO');
const JsonClientesDAO  = require('./json/JsonClientesDAO');
const JsonChatbotDAO   = require('./json/JsonChatbotDAO');

console.log('[PersistenceFactory] v2 loaded at', __filename);

class PersistenceFactory {
  static getDAO(type) {
    const key = String(type || '').toLowerCase().trim();
    console.log('[PersistenceFactory] requested =', JSON.stringify(type), 'normalized =', JSON.stringify(key));

    switch (key) {
      case 'productos':
      case 'products':
        return new JsonProductosDAO();
      case 'clientes':
      case 'clients':
        return new JsonClientesDAO();
      case 'chatbot':
        return new JsonChatbotDAO();
      default:
        console.error('[PersistenceFactory] unsupported:', JSON.stringify(type), '(normalized:', JSON.stringify(key), ')');
        throw new Error(`Tipo de DAO no soportado: ${type}`);
    }
  }

  static async initialize() {
    console.log('🔧 Inicializando capa de persistencia JSON...');
    this.getDAO('productos');
    this.getDAO('clientes');
    this.getDAO('chatbot');
    console.log('✅ Capa de persistencia inicializada');
  }
}

module.exports = PersistenceFactory;