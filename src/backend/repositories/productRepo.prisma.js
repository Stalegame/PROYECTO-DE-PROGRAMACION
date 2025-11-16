// SRC/Backend/repositories/productRepo.prisma.js
const prisma = require('../db');

// Mapea errores de Prisma a tus códigos/mensajes
function translateError(e) {
  if (!e) return null;
  // Registro no encontrado (update/delete/findUnique con where inexistente)
  if (e.code === 'P2025') return { code: 'NOT_FOUND', msg: 'No encontramos el producto' };
  // Único (si en el futuro agregas unique en name, por ejemplo)
  if (e.code === 'P2002') return { code: 'PRODUCT_DUP', msg: 'Ya existe un producto con ese valor único' };
  // Checks de BD (price >= 0, stock >= 0, etc.)
  if (e.code === 'P2004') return { code: 'CHECK_FAILED', msg: 'Los datos no cumplen las reglas del sistema' };
  return null;
}

module.exports = {
  // GET /api/products
  async getAll() {
    return prisma.products.findMany({
      // Si más adelante agregas is_active, filtra aquí
      // where: { is_active: true },
      orderBy: { id: 'asc' },
    });
  },

  // GET /api/products/:id
  async getById(id) {
    return prisma.products.findUnique({
      where: { id },
      select: {
        id: true, name: true, price: true, stock: true, category: true, description: true, image: true,
        createdAt: true, updatedAt: true,
      }
    });
  },

  // POST /api/products
  async save(input) {
    // Campos esperados en tu tabla:
    // id (serial/int), name (text), price (int), stock (int),
    // category (text|null), description (text|null), image (text|null),
    // created_at, updated_at (manejados por la BD)
    return prisma.products.create({
      data: {
        id: Date.now().toString(), // Si tu id es string, o usa otro generador
        name: String(input.name),
        price: Number(input.price) || 1,
        stock: Number(input.stock) || 0,
        category: input.category ?? null,
        description: input.description ?? null,
        image: input.image ?? null,
      },
    });
  },

  // PUT /api/products/:id
  async update(id, changes = {}) {
    const data = {};
    if (changes.name !== undefined)        data.name = String(changes.name);
    if (changes.price !== undefined)       data.price = Number(changes.price) || 1;
    if (changes.stock !== undefined)       data.stock = Number(changes.stock) || 0;
    if (changes.category !== undefined)    data.category = changes.category ?? null;
    if (changes.description !== undefined) data.description = changes.description ?? null;
    if (changes.image !== undefined)       data.image = changes.image ?? null;

    return prisma.products.update({
      where: { id: String(id) },
      data,
    });
  },

  // DELETE /api/products/:id
  async delete(id) {
    await prisma.products.delete({ where: { id: String(id) } });
    return true;
  },

  translateError,
};
