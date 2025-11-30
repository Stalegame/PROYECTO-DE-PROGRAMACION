// Repositorio de Categorias usando Prisma ORM

const prisma = require('../db');

// Mapea errores de Prisma a tus códigos/mensajes
function translateError(e) {
  if (!e) return null;

  if (e.code === 'P2025') {
    return { code: 'NOT_FOUND', msg: 'No encontramos la categoría' };
  }
  if (e.code === 'P2002') {
    return { code: 'CATEGORY_DUP', msg: 'Ya existe una categoría con ese nombre' };
  }

  return null;
}

module.exports = {
  
  // Obtener todas los categorías
  async getAll() {
    return prisma.category.findMany({
      include: { products: true },
      orderBy: { createdAt: 'asc' },
    });
  },

  // Obtener categoría por ID
  async getById(id) {
    return prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
  },

  // Obtener por nombre
  async getByName(name){
    return prisma.category.findUnique({
      where: { name }
    });
  },

  // Crear categoría
  async save(input) {
    return prisma.category.create({
      data: {
        name: String(input.name).trim(),
      }
    });
  },

  // Actualizar categoría
  async update(id, changes = {}) {
    const data = {};

    if (changes.name !== undefined) data.name = String(changes.name).trim();

    return prisma.category.update({
      where: { id },
      data,
    });
  },

  // Eliminar categoría
  async delete(id) {
    await prisma.category.delete({ where: { id } });
    return true;
  },

  translateError,
};
