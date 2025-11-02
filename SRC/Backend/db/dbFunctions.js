const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Busca el stock de un producto por su nombre
 * @param {string} nombreProducto
 * @returns {Promise<number|null>} Stock del producto o null si no existe
 */
async function obtenerProducto(nombreProducto) {
  try {
    const producto = await prisma.products.findFirst({
      where: {
        name: {
          contains: nombreProducto,
          mode: "insensitive", // no distingue mayúsculas
        },
      },
      select: {
        name: true,
        stock: true,
        price: true,
        category: true,
        description: true,
      },
    });

    return producto || null;
  } catch (error) {
    console.error("Error al buscar producto:", error);
    throw error;
  }
}

module.exports = { obtenerProducto };
