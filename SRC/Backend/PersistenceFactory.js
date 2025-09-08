// SRC/Backend/PersistenceFactory.js
const path = require('path');

const JsonProductosDAO = require(path.join(__dirname, 'json', 'JsonProductosDAO'));
const JsonClientesDAO  = require(path.join(__dirname, 'json', 'JsonClientesDAO'));
const JsonChatbotDAO   = require(path.join(__dirname, 'json', 'JsonChatbotDAO'));

console.log('[PersistenceFactory] loaded at', __filename);

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
    try {
      const daos = [
        this.getDAO('productos'),
        this.getDAO('clientes'),
        this.getDAO('chatbot'),
      ];
      // Forzar init de cada DAO si lo exponen en constructor
      console.log('✅ Capa de persistencia inicializada');
      return daos;
    } catch (error) {
      console.error('❌ Error inicializando persistencia:', error.message);
      throw error;
    }
  }
}

module.exports = PersistenceFactory;