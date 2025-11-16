const fs = require('fs').promises;
const path = require('path');

// ==================== Ayudante para tomar solo los campos que nos interesan ====================
const pick = (obj, fields) => fields.reduce((a,k)=> (obj[k] !== undefined ? (a[k]=obj[k],a) : a), {});

class JsonProductosDAO {
  constructor() {
    // Donde guardamos el archivo de productos
    this.filePath = path.join(__dirname, '..', 'data', 'productos.json');
    this.init();
  }

  // Prepara el archivo cuando arranca la aplicación
  async init() {
    try {
      // Nos aseguramos de que la carpeta data exista
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      
      // Verificamos si el archivo ya existe
      try {
        await fs.access(this.filePath);
        console.log('📁 Archivo de productos encontrado:', this.filePath);
      } catch {
        // Si no existe, lo creamos vacío
        await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
        console.log('📁 Archivo de productos creado:', this.filePath);
      }
    } catch (error) {
      console.error('❌ Error preparando el archivo de productos:', error);
    }
  }

  // Lee todos los productos directamente del archivo
  async _readAllRaw() {
    const texto = await fs.readFile(this.filePath, 'utf8').catch(() => '[]');
    return JSON.parse(texto || '[]');
  }

  // Guarda todos los productos en el archivo
  async _writeAllRaw(arr) {
    await fs.writeFile(this.filePath, JSON.stringify(arr, null, 2));
  }

  // Obtiene todos los productos
  async getAll() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error leyendo productos:', error);
      return []; // Si hay error, devolvemos array vacío
    }
  }

  // Busca un producto por su ID
  async getById(id) {
    const productos = await this.getAll();
    return productos.find((p) => p.id === id);
  }

  // Busca productos por categoría
  async getByCategory(category) {
    const productos = await this.getAll();
    return productos.filter((p) => 
      (p.category || '').toLowerCase() === (category || '').toLowerCase()
    );
  }

  // Busca productos por nombre, descripción o categoría
  async search(query) {
    const busqueda = (query || '').toLowerCase();
    const productos = await this.getAll();
    
    return productos.filter((p) =>
      ((p.name || '').toLowerCase().includes(busqueda)) ||
      ((p.description || '').toLowerCase().includes(busqueda)) ||
      ((p.category || '').toLowerCase().includes(busqueda))
    );
  }

  // Guarda un nuevo producto
  async save(producto) {
    try {
      const productos = await this.getAll();
      const ahora = new Date().toISOString();

      // Requeridos por defensa
      if (!producto || typeof producto !== 'object') {
        const err = new Error('Payload inválido');
        err.code = 'INTERNAL';
        throw err;
      }

      // Verificamos que tenga los datos obligatorios
      if (!producto.name || String(producto.name).trim() === '') {
        const err = new Error('El nombre es obligatorio');
        err.code = 'NAME_REQUIRED';
        throw err;
      }
      if (producto.price === undefined || producto.price === null) {
        const err = new Error('El precio es obligatorio');
        err.code = 'PRICE_REQUIRED';
        throw err;
      }
      if (producto.stock === undefined || producto.stock === null) {
        const err = new Error('El stock es obligatorio');
        err.code = 'STOCK_REQUIRED';
        throw err;
      }

      // Normalizaciones/validaciones numéricas
      const price = Number(producto.price);
      const stock = Number(producto.stock);

      if (!(Number.isInteger(price) && price >= 1 && price <= 1_000_000)) {
        const err = new Error('El precio debe ser un entero entre 1 y 1.000.000');
        err.code = 'PRICE_INVALID';
        throw err;
      }
      if (!(Number.isInteger(stock) && stock >= 0 && stock <= 1_000_000)) {
        const err = new Error('El stock debe ser un entero entre 0 y 1.000.000');
        err.code = 'STOCK_INVALID';
        throw err;
      }

      const productoAGuardar = {
        ...producto,
        id: producto.id || Date.now().toString(), // Si no tiene ID, le damos uno
        timestamp: ahora, // Marcamos cuándo se creó
      };

      // Agregamos el nuevo producto a la lista
      productos.push(productoAGuardar);
      
      // Guardamos toda la lista actualizada
      await fs.writeFile(this.filePath, JSON.stringify(productos, null, 2));
      console.log('✅ Producto guardado:', productoAGuardar.id);
      return productoAGuardar;
    } catch (error) {
      console.error('❌ Error guardando producto:', error);
      throw error;
    }
  }

  // Actualiza un producto existente
  async update(id, cambios) {
    const productos = await this._readAllRaw();
    const indice = productos.findIndex(p => p.id === id);
    
    // Si no encontramos el producto, devolvemos null
    if (indice === -1) return null;

    const productoActual = productos[indice];

    // Tomamos solo los campos que se pueden editar
    const cambiosAplicados = pick(cambios, [
      'name', 'price', 'stock', 'category', 'description', 'image'
    ]);
    
    // Nos aseguramos de no cambiar el ID
    delete cambiosAplicados.id;

    if (cambiosAplicados.price !== undefined) {
      const price = Number(cambiosAplicados.price);
      if (!(Number.isInteger(price) && price >= 1 && price <= 1_000_000)) {
        const err = new Error('El precio debe ser un entero entre 1 y 1.000.000');
        err.code = 'PRICE_INVALID';
        throw err;
      }
      cambiosAplicados.price = price;
    }
    if (cambiosAplicados.stock !== undefined) {
      const stock = Number(cambiosAplicados.stock);
      if (!(Number.isInteger(stock) && stock >= 0 && stock <= 1_000_000)) {
        const err = new Error('El stock debe ser un entero entre 0 y 1.000.000');
        err.code = 'STOCK_INVALID';
        throw err;
      }
      cambiosAplicados.stock = stock;
    }

    // Combinamos los cambios con el producto actual
    const productoActualizado = {
      ...productoActual,
      ...cambiosAplicados,
      id: productoActual.id, // Nos aseguramos de mantener el mismo ID
      updatedAt: new Date().toISOString(), // Marcamos cuándo se actualizó
    };

    // Reemplazamos el producto en la lista
    productos[indice] = productoActualizado;
    
    // Guardamos los cambios
    await this._writeAllRaw(productos);
    return productoActualizado;
  }

  // Elimina un producto
  async delete(id) {
    try {
      const productos = await this.getAll();
      
      // Filtramos quitando el producto que queremos eliminar
      const productosFiltrados = productos.filter((p) => p.id !== id);

      // Si la cantidad no cambió, es porque el producto no existía
      if (productos.length === productosFiltrados.length) {
        console.log('❌ Producto no encontrado para eliminar:', id);
        return false;
      }

      // Guardamos la lista sin ese producto
      await fs.writeFile(this.filePath, JSON.stringify(productosFiltrados, null, 2));
      console.log('✅ Producto eliminado:', id);
      return true;
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      throw error;
    }
  }
}
module.exports = JsonProductosDAO;