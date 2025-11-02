const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Obtener información de un producto por nombre
 * @param {string} nombreProducto
 * @returns {Promise<object|null>} Devuelve {name, price, stock, category, description} o null
 */
async function obtenerProducto(nombreProducto) {
  try {
    const producto = await prisma.products.findFirst({
      where: {
        name: {
          contains: nombreProducto,
          mode: "insensitive",
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

/**
 * Verifica si un producto tiene stock disponible
 * @param {string} nombreProducto
 * @returns {Promise<boolean>} true si stock > 0, false si no hay stock o no existe
 */
async function estaDisponible(nombreProducto) {
  try {
    const producto = await prisma.products.findFirst({
      where: { name: { contains: nombreProducto, mode: "insensitive" } },
      select: { stock: true },
    });
    return producto ? producto.stock > 0 : false;
  } catch (error) {
    console.error("Error al verificar disponibilidad:", error);
    throw error;
  }
}

/**
 * Listar todos los productos de una categoría
 * @param {string} categoria
 * @returns {Promise<Array>} Lista de productos
 */
async function listarProductosPorCategoria(categoria) {
  try {
    return await prisma.products.findMany({
      where: { category: { equals: categoria, mode: "insensitive" } },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error al listar productos por categoría:", error);
    throw error;
  }
}

/**
 * Listar productos dentro de un rango de precio
 * @param {number} min
 * @param {number} max
 * @returns {Promise<Array>} Lista de productos
 */
async function listarProductosPorPrecio(min, max) {
  try {
    return await prisma.products.findMany({
      where: { price: { gte: min, lte: max } },
      orderBy: { price: "asc" },
    });
  } catch (error) {
    console.error("Error al listar productos por precio:", error);
    throw error;
  }
}

/**
 * Buscar productos por nombre o descripción
 * @param {string} query
 * @returns {Promise<Array>} Lista de productos que coinciden
 */
async function buscarProductos(query) {
  try {
    return await prisma.products.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
    });
  } catch (error) {
    console.error("Error al buscar productos:", error);
    throw error;
  }
}

/**
 * Devuelve un resumen completo de un producto en formato amigable
 * @param {string} nombreProducto
 * @returns {Promise<string>} String con los detalles del producto
 */
async function resumenProducto(nombreProducto) {
  const p = await obtenerProducto(nombreProducto);
  if (!p) return `No encontré el producto "${nombreProducto}" en la base de datos.`;
  return `Producto: ${p.name}
Categoría: ${p.category}
Precio: $${p.price}
Stock: ${p.stock}
Descripción: ${p.description || "Sin descripción"}`;
}

module.exports = {
  obtenerProducto,
  estaDisponible,
  listarProductosPorCategoria,
  listarProductosPorPrecio,
  buscarProductos,
  resumenProducto,
};
