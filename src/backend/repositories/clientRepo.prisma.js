// SRC/Backend/repositories/clientRepo.prisma.js
const prisma = require('../db');
const bcrypt = require('bcryptjs');

// helper para agregar "+569"
function formatTelefono(telefono) {
  const t = String(telefono ?? '').trim();

  // si está vacío, devuelve null o el valor por defecto
  if (!t) return null;

  // caso normal: el usuario solo ingresa los 8 dígitos
  return `+569${t}`;
}

function parseId(id) {
  // En este proyecto los IDs se generan como strings (Date.now().toString()).
  // Aseguramos que no sea nulo/indefinido y devolvemos siempre string.
  if (id === undefined || id === null) throw Object.assign(new Error('ID inválido'), { code: 'BAD_ID' });
  return String(id);
}

function normalizeEmail(v) {
  return String(v || '').toLowerCase().trim();
}

function translateError(e) {
  if (!e) return null;
  if (e.code === 'P2002') return { code: 'EMAIL_DUP', msg: 'Este email ya está registrado' }; // unique(email)
  if (e.code === 'P2025') return { code: 'NOT_FOUND', msg: 'No encontramos el cliente' };
  return null;
}

module.exports = {
  // Lista de clientes
  async getAll() {
    return prisma.clients.findMany({ orderBy: { id: 'asc' } });
  },

  // Buscar por id
  async getById(id) {
    return prisma.clients.findUnique({
      where: { id },
      select: {
        id: true, email: true, nombre: true, role: true, activo: true, telefono: true, direccion: true,
        createdAt: true, updatedAt: true,
        // No incluir passwordHash aquí
      }
    });
  },

  // Buscar por email (para login)
  async getByEmail(email) {
    return prisma.clients.findUnique({
      where: { email: normalizeEmail(email) },
      select: {
        id: true, nombre: true, email: true, telefono: true, direccion: true,
        role: true, activo: true, createdAt: true, updatedAt: true,
        passwordHash: true, // Necesario para login
      }
    });
  },

  // Crear cliente
  async save(input = {}) {
    // Campos esperados (ajusta si tu tabla tiene otros):
    // id (serial/int), nombre (text), email (unique text), telefono (text/int),
    // direccion (text|null), passwordHash (text|null), role (text, default 'user'),
    // activo (boolean, default true), created_at, updated_at
    const data = {
      id:        Date.now().toString(), // Si tu id es string, o usa otro generador
      nombre:    String(input.nombre).trim(),
      email:     normalizeEmail(input.email),
      telefono:  formatTelefono(input.telefono),
      direccion: input.direccion ?? null,
      role:      input.role ?? 'user',
      activo:    input.activo ?? true,
    };

    // Si viene password plano, lo hasheamos
    if (input.password) {
      data.passwordHash = await bcrypt.hash(String(input.password), 10);
    }

    return prisma.clients.create({ data });
  },
  

  // Actualizar cliente
  async update(id, changes = {}) {
    const data = {};
    if (changes.nombre !== undefined)    data.nombre = String(changes.nombre).trim();
    if (changes.email !== undefined)     data.email = normalizeEmail(changes.email);
    if (changes.telefono !== undefined)  data.telefono = String(changes.telefono).trim();
    if (changes.direccion !== undefined) data.direccion = changes.direccion ?? null;
    if (changes.role !== undefined)      data.role = String(changes.role);
    if (changes.activo !== undefined)    data.activo = Boolean(changes.activo);

    if (changes.password) {
      data.passwordHash = await bcrypt.hash(String(changes.password), 10);
    }
    if (changes.passwordHash) {
      data.passwordHash = String(changes.passwordHash);
    }

    // Actualizar updatedAt para reflejar la modificación
    data.updatedAt = new Date();

    return prisma.clients.update({
      where: { id: parseId(id) },
      data,
    });
  },

  // Eliminar cliente (duro; si quieres baja lógica, cambia a update({activo:false}))
  async delete(id) {
    await prisma.clients.delete({ where: { id: parseId(id) } });
    return true;
  },

  translateError,
};
