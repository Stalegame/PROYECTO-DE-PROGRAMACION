<<<<<<< HEAD
﻿// SRC/Backend/PersistenceFactory.js
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
=======
﻿const JsonProductosDAO = require('./json/JsonProductosDAO');
const JsonClientesDAO = require('./json/JsonClientesDAO');
const JsonChatbotDAO = require('./json/JsonChatbotDAO');

class PersistenceFactory {
  static getDAO(type) {
    switch (type) {
      case 'productos':
        return new JsonProductosDAO();
      case 'clientes':
>>>>>>> origin
        return new JsonClientesDAO();
      case 'chatbot':
        return new JsonChatbotDAO();
      default:
<<<<<<< HEAD
        console.error('[PersistenceFactory] unsupported:', JSON.stringify(type), '(normalized:', JSON.stringify(key), ')');
        throw new Error(`Tipo de DAO no soportado: ${type}`);
=======
        throw new Error('Tipo de DAO no soportado: ' + type);
>>>>>>> origin
    }
  }

  static async initialize() {
<<<<<<< HEAD
    console.log('🔧 Inicializando capa de persistencia JSON...');
    this.getDAO('productos');
    this.getDAO('clientes');
    this.getDAO('chatbot');
    console.log('✅ Capa de persistencia inicializada');
=======
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
>>>>>>> origin
  }
}

module.exports = PersistenceFactory;