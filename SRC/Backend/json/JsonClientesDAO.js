// json/JsonClientesDAO.js
const fs = require('fs').promises;
const path = require('path');

class JsonClientesDAO {
  constructor() {
    // data/ está al lado de json/
    this.filePath = path.join(__dirname, '..', 'data', 'clientes.json');
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      try {
        await fs.access(this.filePath);
      } catch {
        await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
        console.log('📁 Archivo de clientes creado:', this.filePath);
      }
    } catch (error) {
      console.error('❌ Error inicializando clientes DAO:', error);
    }
  }

  async getAll() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error leyendo clientes:', error);
      return [];
    }
  }

  async getById(id) {
    const clientes = await this.getAll();
    return clientes.find(c => c.id === id);
  }

  async getByEmail(email) {
    const clientes = await this.getAll();
    return clientes.find(c => (c.email || '').toLowerCase() === (email || '').toLowerCase());
  }

  async save(cliente) {
    try {
      const clientes = await this.getAll();
      const toSave = {
        ...cliente,
        id: cliente.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      clientes.push(toSave);
      await fs.writeFile(this.filePath, JSON.stringify(clientes, null, 2));
      console.log('✅ Cliente guardado:', toSave.id);
      return toSave;
    } catch (error) {
      console.error('❌ Error guardando cliente:', error);
      throw error;
    }
  }

  async update(id, updatedCliente) {
    try {
      const clientes = await this.getAll();
      const index = clientes.findIndex(c => c.id === id);
      if (index === -1) return null;

      clientes[index] = {
        ...clientes[index],
        ...updatedCliente,
        updatedAt: new Date().toISOString(),
      };

      await fs.writeFile(this.filePath, JSON.stringify(clientes, null, 2));
      console.log('✅ Cliente actualizado:', id);
      return clientes[index];
    } catch (error) {
      console.error('❌ Error actualizando cliente:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const clientes = await this.getAll();
      const filtered = clientes.filter(c => c.id !== id);
      if (clientes.length === filtered.length) return false;

      await fs.writeFile(this.filePath, JSON.stringify(filtered, null, 2));
      console.log('✅ Cliente eliminado:', id);
      return true;
    } catch (error) {
      console.error('❌ Error eliminando cliente:', error);
      throw error;
    }
  }
}

module.exports = JsonClientesDAO;