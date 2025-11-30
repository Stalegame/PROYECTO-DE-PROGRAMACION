// Repositorio de Pedidos usando Prisma ORM

const prisma = require('../db');

// Mapea errores de Prisma a tus códigos/mensajes
function translateError(e) {
  if (!e) return null;

  if (e.code === 'P2025') {
    return { code: 'NOT_FOUND', msg: 'No encontramos el pedido' };
  }
  if (e.code === 'P2002') {
    return { code: 'ORDER_DUP', msg: 'Ya existe un pedido con ese identificador' };
  }

  return null;
}

module.exports = {
  
  // Obtener todos los pedidos
  async getAll() {
    return prisma.order.findMany({
        select: {
            id: true,
            clientId: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            client: { select: { name: true } }
        },
        orderBy: { createdAt: 'asc' },
    });
  },

  // Obtener pedido por ID
  async getById(id) {
    return prisma.order.findUnique({
      where: { id },
      select: {
            id: true,
            clientId: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            client: { select: { name: true } }
        },
    });
  },

  // Obtener ultimas 4 ordenes
  async getLastOrders() {
    return prisma.order.findMany({
        take: 3,
        select: {
            id: true,
            clientId: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            client: { select: { name: true } }
        },
        orderBy: { createdAt: 'asc'}
    });
  },

  // Obtener ventas del dia
  async getSumOfDay() {
    const desde = new Date();
    desde.setHours(0, 0, 0, 0);

    return await prisma.order.findMany({
        where: {
            createdAt: {
            gte: desde
            }
        }
    });
  },

  // Obtener pedidos pendientes
  async getPending() {
    return prisma.order.count({
        where: { status: 'PENDING' }
    });
  },

  // Crear pedido
  async save(input) {
    return prisma.order.create({
      data: {
        clientId: input.clientId,
        totalAmount: input.totalAmount
      }
    });
  },

  // Eliminar pedido
  async delete(id) {
    await prisma.order.delete({ where: { id } });
    return true;
  },

  translateError,
};
