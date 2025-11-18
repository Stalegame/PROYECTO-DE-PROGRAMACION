const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Obtener información de un producto por nombre
 * @param {string} nombreProducto
 * @returns {Promise<object|null>}
 */
async function obtenerProducto(nombreProducto) {
  try {
    const nombre = nombreProducto.trim();

    const producto = await prisma.product.findFirst({
      where: {
        name: {
          contains: nombre,
          mode: "insensitive",
        },
      },
      select: {
        name: true,
        stock: true,
        price: true,
        description: true,
        category: {
          select: { name: true }, // Relación
        },
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
 * @returns {Promise<boolean>}
 */
async function estaDisponible(nombreProducto) {
  try {
    const nombre = nombreProducto.trim();

    const producto = await prisma.product.findFirst({
      where: {
        name: {
          contains: nombre,
          mode: "insensitive",
        },
      },
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
 * @returns {Promise<Array>}
 */
async function listarProductosPorCategoria(categoria) {
  try {
    const cat = categoria.trim();

    return await prisma.product.findMany({
      where: {
        category: {
          name: {
            contains: cat,
            mode: "insensitive",
          },
        },
      },
      orderBy: { name: "asc" },
      include: { category: true },
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
 * @returns {Promise<Array>}
 */
async function listarProductosPorPrecio(min, max) {
  try {
    return await prisma.product.findMany({
      where: {
        price: {
          gte: Number(min),
          lte: Number(max),
        },
      },
      orderBy: { price: "asc" },
      include: { category: true },
    });
  } catch (error) {
    console.error("Error al listar productos por precio:", error);
    throw error;
  }
}

/**
 * Buscar productos por nombre o descripción
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function buscarProductos(query) {
  try {
    const q = query.trim();

    return await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { category: true },
    });
  } catch (error) {
    console.error("Error al buscar productos:", error);
    throw error;
  }
}

/**
 * Devuelve un resumen completo de un producto en formato amigable
 * @param {string} nombreProducto
 * @returns {Promise<string>}
 */
async function resumenProducto(nombreProducto) {
  const p = await obtenerProducto(nombreProducto);

  if (!p) {
    return `No encontré el producto "${nombreProducto}" en la base de datos.`;
  }

  return `Producto: ${p.name}
Categoría: ${p.category?.name || "Sin categoría"}
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
