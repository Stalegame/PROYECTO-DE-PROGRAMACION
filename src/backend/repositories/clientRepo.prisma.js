// Repositorio de Clientes usando Prisma ORM

const prisma = require('../db');
const bcrypt = require('bcryptjs');

// Helper opcional para agregar "+569"
function formatTelefono(telefono) {
  const t = String(telefono ?? '').trim();
  if (!t) return null;
  return `+569${t}`;
}

function normalizeEmail(v) {
  return String(v || '').toLowerCase().trim();
}

function translateError(e) {
  if (!e) return null;
  if (e.code === 'P2002') return { code: 'EMAIL_DUP', msg: 'Este email ya está registrado' };
  if (e.code === 'P2025') return { code: 'NOT_FOUND', msg: 'No encontramos el cliente' };
  return null;
}

module.exports = {

  // Obtener todos los clientes
  async getAll() {
    return prisma.client.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        orders : true,
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  // Obtener cliente por ID
  async getById(id) {
    return prisma.client.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  },

  // Buscar por email (para login)
  async getByEmail(email) {
    return prisma.client.findUnique({
      where: { email: normalizeEmail(email) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        passwordHash: true, // Necesario para login
      }
    });
  },

  // Obtener Numero de clientes creados en el mes
  async getCreatedThisMonth() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return prisma.client.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    });
  },

  // Crear cliente
  async save(input = {}) {
    const data = {
      name: String(input.name || '').trim(),
      email: normalizeEmail(input.email),
      phone: input.phone ? formatTelefono(input.phone) : null,
      address: input.address ?? null,
      role: input.role ?? 'USER',
      active: input.active ?? true,
    };

    // Hash de contraseña si viene en plano
    if (input.password) {
      data.passwordHash = await bcrypt.hash(String(input.password), 10);
    }

    return prisma.client.create({ data });
  },

  // Actualizar cliente
  async update(id, changes = {}) {
    const data = {};

    if (changes.name !== undefined)     data.name = String(changes.name).trim();
    if (changes.email !== undefined)    data.email = normalizeEmail(changes.email);
    if (changes.phone !== undefined)    data.phone = formatTelefono(changes.phone) ?? null;
    if (changes.address !== undefined)  data.address = changes.address ?? null;
    if (changes.role !== undefined)     data.role = changes.role;
    if (changes.active !== undefined)   data.active = Boolean(changes.active);

    // Contraseña en texto plano transformar hash
    if (changes.password) {
      data.passwordHash = await bcrypt.hash(String(changes.password), 10);
    }

    // Si viene el hash directo (caso admin)
    if (changes.passwordHash) {
      data.passwordHash = String(changes.passwordHash);
    }

    return prisma.client.update({
      where: { id },
      data,
    });
  },

  // Eliminar cliente
  async delete(id) {
    await prisma.client.delete({ where: { id } });
    return true;
  },

  translateError,
};
