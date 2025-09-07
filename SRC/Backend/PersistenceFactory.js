const JsonProductosDAO = require('./json/JsonProductosDAO');
const JsonClientesDAO = require('./json/JsonClientesDAO');
const JsonChatbotDAO = require('./json/JsonChatbotDAO');

class PersistenceFactory {
  static getDAO(type) {
    switch (type) {
      case 'productos':
        return new JsonProductosDAO();
      case 'clientes':
        return new JsonClientesDAO();
      case 'chatbot':
        return new JsonChatbotDAO();
      default:
        throw new Error('Tipo de DAO no soportado: ' + type);
    }
  }

  static async initialize() {
    console.log('🔄 Inicializando capa de persistencia JSON...');
    try {
      const daos = [
        this.getDAO('productos'),
        this.getDAO('clientes'),
        this.getDAO('chatbot')
      ];
      console.log('✅ Capa de persistencia inicializada correctamente');
      return daos;
    } catch (error) {
      console.error('❌ Error inicializando persistencia:', error.message);
      throw error;
    }
  }
}

module.exports = PersistenceFactory;