const fs = require('fs').promises;
const path = require('path');

// ==================== Helper de validación/normalización ====================
const pick = (obj, fields) => fields.reduce((a,k)=> (obj[k] !== undefined ? (a[k]=obj[k],a) : a), {});

class JsonProductosDAO {
  constructor() {
    // data/ está al lado de json/
    this.filePath = path.join(__dirname, '..', 'data', 'productos.json');
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

  async _readAllRaw() {
    const txt = await fs.readFile(this.filePath, 'utf8').catch(() => '[]');
    return JSON.parse(txt || '[]');
  }

  async _writeAllRaw(arr) {
    await fs.writeFile(this.filePath, JSON.stringify(arr, null, 2));
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
    return productos.find((p) => p.id === id);
  }

  async getByCategory(category) {
    const productos = await this.getAll();
    return productos.filter((p) => (p.category || '').toLowerCase() === (category || '').toLowerCase());
  }

  async search(query) {
    const q = (query || '').toLowerCase();
    const productos = await this.getAll();
    return productos.filter((p) =>
      ((p.name || '').toLowerCase().includes(q)) ||
      ((p.description || '').toLowerCase().includes(q)) ||
      ((p.category || '').toLowerCase().includes(q))
    );
  }

  async save(producto) {
    try {
      const productos = await this.getAll();
      const now = new Date().toISOString();

      const toSave = {
        ...producto,
        id: producto.id || Date.now().toString(),
        timestamp: now,
      };

      productos.push(toSave);
      await fs.writeFile(this.filePath, JSON.stringify(productos, null, 2));
      console.log('✅ Producto guardado:', toSave.id);
      return toSave;
    } catch (error) {
      console.error('❌ Error guardando producto:', error);
      throw error;
    }
  }

  async update(id, patchIn) {
    const items = await this._readAllRaw();
    const idx = items.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const current = items[idx];

    // Acepta SOLO campos editables
    const patch = pick(patchIn, ['name','price','stock','category','description','image']);
    delete patch.id;

    // (Opcional) mini-validaciones defensivas
    if (patch.price !== undefined && !(typeof patch.price === 'number' && patch.price >= 0)) {
      const err = new Error('price inválido'); err.code = 'PRICE_INVALID'; throw err;
    }
    if (patch.stock !== undefined && !(Number.isInteger(patch.stock) && patch.stock >= 0)) {
      const err = new Error('stock inválido'); err.code = 'STOCK_INVALID'; throw err;
    }

    const updated = {
      ...current,
      ...patch,
      id: current.id, // <- fuerza conservar id
      updatedAt: new Date().toISOString(),
    };

    items[idx] = updated;
    await this._writeAllRaw(items);
    return updated;
  }

  async delete(id) {
    try {
      const productos = await this.getAll();
      const filtered = productos.filter((p) => p.id !== id);

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

module.exports = JsonProductosDAO;