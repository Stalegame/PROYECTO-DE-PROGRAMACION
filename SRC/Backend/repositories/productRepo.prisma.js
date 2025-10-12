// SRC/Backend/repositories/productRepo.prisma.js
const prisma = require('../db');

// Convierte params.id a número si tu columna id es INTEGER
function parseId(id) {
  const n = Number(id);
  if (!Number.isInteger(n)) throw Object.assign(new Error('ID inválido'), { code: 'BAD_ID' });
  return n;
}

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
      where: { id: parseId(id) },
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
        name: String(input.name),
        price: Number(input.price),
        stock: Number.isInteger(input.stock) ? input.stock : Number(input.stock),
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
    if (changes.price !== undefined)       data.price = Number(changes.price);
    if (changes.stock !== undefined)       data.stock = Number.isInteger(changes.stock) ? changes.stock : Number(changes.stock);
    if (changes.category !== undefined)    data.category = changes.category ?? null;
    if (changes.description !== undefined) data.description = changes.description ?? null;
    if (changes.image !== undefined)       data.image = changes.image ?? null;

    return prisma.products.update({
      where: { id: parseId(id) },
      data,
    });
  },

  // DELETE /api/products/:id
  async delete(id) {
    await prisma.products.delete({ where: { id: parseId(id) } });
    return true;
  },

  translateError,
};

