const fs = require('fs').promises;
const path = require('path');

class JsonClientesDAO {
  constructor() {
    this.filePath = path.join(__dirname, '..', 'vscode', 'data', 'clientes.json');
  }

  async getByEmail(email) {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      const clientes = JSON.parse(data);
      return clientes.find(c => c.email === email);
    } catch (error) {
      return null;
    }
  }

  async getAll() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }
}

module.exports = JsonClientesDAO;
