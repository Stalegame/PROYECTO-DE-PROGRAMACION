// Repositorio de Productos usando Prisma ORM

const prisma = require('../db');

// Mapea errores de Prisma a tus códigos/mensajes
function translateError(e) {
  if (!e) return null;

  if (e.code === 'P2025') {
    return { code: 'NOT_FOUND', msg: 'No encontramos el producto' };
  }
  if (e.code === 'P2002') {
    return { code: 'PRODUCT_DUP', msg: 'Ya existe un producto con ese nombre' };
  }
  if (e.code === 'P2004') {
    return { code: 'CHECK_FAILED', msg: 'Los datos no cumplen las reglas del sistema' };
  }

  return null;
}

module.exports = {

  // Obtener todos los productos
  async getAll() {
    return prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    });
  },

  // Obtener producto por ID
  async getById(id) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  },

  // Crear producto
  async save(input) {
    return prisma.product.create({
      data: {
        name: String(input.name),
        price: Number(input.price) || 0,
        stock: Number(input.stock) || 0,
        description: input.description ?? null,
        image: input.image ?? null,
        categoryId: String(input.categoryId),
      }
    });
  },

  // Actualizar producto
  async update(id, changes = {}) {
    const data = {};

    if (changes.name !== undefined)         data.name = String(changes.name);
    if (changes.price !== undefined)        data.price = Number(changes.price) || 0;
    if (changes.stock !== undefined)        data.stock = Number(changes.stock) || 0;
    if (changes.description !== undefined)  data.description = changes.description ?? null;
    if (changes.image !== undefined)        data.image = changes.image ?? null;
    if (changes.categoryId !== undefined)   data.categoryId = String(changes.categoryId);

    return prisma.product.update({
      where: { id },
      data,
    });
  },

  // Eliminar producto
  async delete(id) {
    await prisma.product.delete({ where: { id } });
    return true;
  },

  translateError,
};
