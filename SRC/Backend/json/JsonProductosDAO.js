<<<<<<< HEAD
const fs = require('fs').promises;
const path = require('path');

class JsonProductosDAO {
  constructor() {
    // IMPORTANTE: data/ está al lado de json/ → un solo ".."
    this.filePath = require('path').join(__dirname, '..', 'data', 'productos.json');
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      try {
        await fs.access(this.filePath);
        console.log('📁 Archivo de productos encontrado:', this.filePath);
      } catch {
        await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
        console.log('📁 Archivo de productos creado:', this.filePath);
      }
    } catch (error) {
      console.error('❌ Error inicializando productos DAO:', error);
    }
  }

  async getAll() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error leyendo productos:', error);
      return [];
    }
  }

  async getById(id) {
    const productos = await this.getAll();
    return productos.find(p => p.id === id);
  }

  async save(producto) {
    try {
      const productos = await this.getAll();
      producto.id = producto.id || Date.now().toString();
      producto.timestamp = new Date().toISOString();
      productos.push(producto);
      await fs.writeFile(this.filePath, JSON.stringify(productos, null, 2));
      console.log('✅ Producto guardado:', producto.id);
      return producto;
    } catch (error) {
      console.error('❌ Error guardando producto:', error);
      throw error;
    }
  }

  async update(id, updatedProducto) {
    try {
      const productos = await this.getAll();
      const index = productos.findIndex(p => p.id === id);

      if (index === -1) {
        console.log('❌ Producto no encontrado para actualizar:', id);
        return null;
      }

      productos[index] = {
        ...productos[index],
        ...updatedProducto,
        ultimaActualizacion: new Date().toISOString()
      };

      await fs.writeFile(this.filePath, JSON.stringify(productos, null, 2));
      console.log('✅ Producto actualizado:', id);
      return productos[index];
    } catch (error) {
      console.error('❌ Error actualizando producto:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const productos = await this.getAll();
      const filtered = productos.filter(p => p.id !== id);

      if (productos.length === filtered.length) {
        console.log('❌ Producto no encontrado para eliminar:', id);
        return false;
      }

      await fs.writeFile(this.filePath, JSON.stringify(filtered, null, 2));
      console.log('✅ Producto eliminado:', id);
      return true;
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      throw error;
    }
  }
}

=======
const fs = require('fs').promises;
const path = require('path');

class JsonProductosDAO {
  constructor() {
    this.filePath = path.join(__dirname, '..', '..', 'vscode', 'data', 'productos.json');
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      try {
        await fs.access(this.filePath);
        console.log('📁 Archivo de productos encontrado:', this.filePath);
      } catch {
        await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
        console.log('📁 Archivo de productos creado:', this.filePath);
      }
    } catch (error) {
      console.error('❌ Error inicializando productos DAO:', error);
    }
  }

  async getAll() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error leyendo productos:', error);
      return [];
    }
  }

  async getById(id) {
    const productos = await this.getAll();
    return productos.find(p => p.id === id);
  }

  async getByCategory(categoria) {
    const productos = await this.getAll();
    return productos.filter(p => p.categoria === categoria);
  }

  async save(producto) {
    try {
      const productos = await this.getAll();
      producto.id = producto.id || Date.now().toString();
      producto.timestamp = new Date().toISOString();
      productos.push(producto);
      await fs.writeFile(this.filePath, JSON.stringify(productos, null, 2));
      console.log('✅ Producto guardado:', producto.id);
      return producto;
    } catch (error) {
      console.error('❌ Error guardando producto:', error);
      throw error;
    }
  }

  async update(id, updatedProducto) {
    try {
      const productos = await this.getAll();
      const index = productos.findIndex(p => p.id === id);
      
      if (index === -1) {
        console.log('❌ Producto no encontrado para actualizar:', id);
        return null;
      }
      
      productos[index] = { 
        ...productos[index], 
        ...updatedProducto,
        updatedAt: new Date().toISOString()
      };
      
      await fs.writeFile(this.filePath, JSON.stringify(productos, null, 2));
      console.log('✅ Producto actualizado:', id);
      return productos[index];
    } catch (error) {
      console.error('❌ Error actualizando producto:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const productos = await this.getAll();
      const filteredProductos = productos.filter(p => p.id !== id);
      
      if (productos.length === filteredProductos.length) {
        console.log('❌ Producto no encontrado para eliminar:', id);
        return false;
      }
      
      await fs.writeFile(this.filePath, JSON.stringify(filteredProductos, null, 2));
      console.log('✅ Producto eliminado:', id);
      return true;
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      throw error;
    }
  }

  async search(query) {
    const productos = await this.getAll();
    return productos.filter(p => 
      p.nombre.toLowerCase().includes(query.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(query.toLowerCase())
    );
  }
}

>>>>>>> origin
module.exports = JsonProductosDAO;