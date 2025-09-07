const JsonClientesDAO = require('./json/JsonClientesDAO');

class PersistenceFactory {
  static getDAO(type) {
    switch (type) {
      case 'clientes':
        return new JsonClientesDAO();
      default:
        throw new Error(`Tipo de DAO no soportado: ${type}`);
    }
  }
}

module.exports = PersistenceFactory;