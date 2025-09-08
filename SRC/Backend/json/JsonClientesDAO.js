<<<<<<< HEAD
const fs = require('fs').promises;
=======
﻿const fs = require('fs').promises;
>>>>>>> origin
const path = require('path');

class JsonClientesDAO {
  constructor() {
    this.filePath = path.join(__dirname, '..', 'vscode', 'data', 'clientes.json');
<<<<<<< HEAD
  }

  async getByEmail(email) {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      const clientes = JSON.parse(data);
      return clientes.find(c => c.email === email);
    } catch (error) {
      return null;
=======
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      try {
        await fs.access(this.filePath);
      } catch {
        await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
      }
    } catch (error) {
      console.error('Error inicializando clientes DAO:', error);
>>>>>>> origin
    }
  }

  async getAll() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
<<<<<<< HEAD
      return [];
    }
  }
}

module.exports = JsonClientesDAO;
=======
      console.error('Error leyendo clientes:', error);
      return [];
    }
  }

  async getById(id) {
    const clientes = await this.getAll();
    return clientes.find(c => c.id === id);
  }

  async getByEmail(email) {
    const clientes = await this.getAll();
    return clientes.find(c => c.email === email);
  }

  async save(cliente) {
    try {
      const clientes = await this.getAll();
      cliente.id = cliente.id || Date.now().toString();
      clientes.push(cliente);
      await fs.writeFile(this.filePath, JSON.stringify(clientes, null, 2));
      return cliente;
    } catch (error) {
      console.error('Error guardando cliente:', error);
      throw error;
    }
  }

  async update(id, updatedCliente) {
    try {
      const clientes = await this.getAll();
      const index = clientes.findIndex(c => c.id === id);
      
      if (index === -1) return null;
      
      clientes[index] = { ...clientes[index], ...updatedCliente };
      await fs.writeFile(this.filePath, JSON.stringify(clientes, null, 2));
      return clientes[index];
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const clientes = await this.getAll();
      const filteredClientes = clientes.filter(c => c.id !== id);
      
      if (clientes.length === filteredClientes.length) return false;
      
      await fs.writeFile(this.filePath, JSON.stringify(filteredClientes, null, 2));
      return true;
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      throw error;
    }
  }
}

module.exports = JsonClientesDAO;
>>>>>>> origin
