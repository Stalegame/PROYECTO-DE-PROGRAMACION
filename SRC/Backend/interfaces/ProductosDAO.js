class ProductosDAO {
  async getAll()            { throw new Error('Método no implementado'); }
  async getById(id)         { throw new Error('Método no implementado'); }
  async getByCategory(cat)  { throw new Error('Método no implementado'); }
  async search(query)       { throw new Error('Método no implementado'); }
  async save(producto)      { throw new Error('Método no implementado'); } // <- usa "save" (coincide con tus routers)
  async update(id, updates) { throw new Error('Método no implementado'); }
  async delete(id)          { throw new Error('Método no implementado'); }
  async updateStock(id, n)  { throw new Error('Método no implementado'); }
}
module.exports = ProductosDAO;