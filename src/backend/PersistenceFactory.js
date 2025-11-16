// SRC/Backend/PersistenceFactory.js
const path = require('path');

// DAOs JSON existentes
const JsonProductosDAO = require(path.join(__dirname, 'json', 'JsonProductosDAO'));
const JsonClientesDAO  = require(path.join(__dirname, 'json', 'JsonClientesDAO'));
const JsonCartDAO      = require(path.join(__dirname, 'json', 'JsonCartDAO'));

// Modo de persistencia (json | postgres | prisma)
const use = (process.env.PERSISTENCE || 'postgres').toLowerCase();

// --- Adaptadores para uniformar interfaz entre JSON y Prisma ---
function adaptProducts(repo) {
  // Devuelve un objeto con la interfaz "vieja" que esperan tus routers
  return {
    getAll:  (...a) => (repo.list ? repo.list(...a) : repo.getAll(...a)),
    getById: (...a) => repo.getById(...a),
    save:    (...a) => (repo.create ? repo.create(...a) : repo.save(...a)),
    update:  (...a) => repo.update(...a),
    delete:  (...a) => (repo.remove ? repo.remove(...a) : repo.delete(...a)),
    translateError: repo.translateError?.bind(repo),
  };
}

function adaptClients(repo) {
  return {
    getAll:     (...a) => (repo.getAll ? repo.getAll(...a) : repo.list(...a)),
    getById:    (...a) => repo.getById(...a),
    getByEmail: (...a) => repo.getByEmail ? repo.getByEmail(...a) : undefined,
    save:       (...a) => (repo.save ? repo.save(...a) : repo.create(...a)),
    update:     (...a) => repo.update(...a),
    delete:     (...a) => (repo.delete ? repo.delete(...a) : repo.remove(...a)),
    translateError: repo.translateError?.bind(repo),
  };
}

class PersistenceFactory {
  static getDAO(tipo) {
    const t = String(tipo || '').toLowerCase().trim();
    const isPrisma = (use === 'postgres' || use === 'prisma');

    if (isPrisma) {
      if (t === 'productos' || t === 'products') {
        // Repositorio Prisma de productos
        const repo = require('./repositories/productRepo.prisma');
        return adaptProducts(repo);
      }
      if (t === 'clientes' || t === 'clients') {
        // Repositorio Prisma de clientes
        const repo = require('./repositories/clientRepo.prisma');
        return adaptClients(repo);
      }
      if (t === 'cart')    return new JsonCartDAO();    // aún JSON
    }

    // Fallback JSON (o cuando PERSISTENCE=json)
    if (t === 'productos' || t === 'products') return new JsonProductosDAO();
    if (t === 'clientes'  || t === 'clients')  return new JsonClientesDAO();
    if (t === 'cart')     return new JsonCartDAO();

    throw new Error(`DAO desconocido: ${tipo}`);
  }

  static async initialize() {
    // Opcional: “calienta” la fábrica y muestra errores temprano
    this.getDAO('productos');
    this.getDAO('clientes');
    this.getDAO('cart');
    // Si usamos Prisma, intenta conectar de antemano para evitar latencia en la primera petición
    const isPrisma = (use === 'postgres' || use === 'prisma');
    if (isPrisma) {
      try {
        const prisma = require('./db');
        if (prisma && typeof prisma.$connect === 'function') {
          await prisma.$connect();
          console.log('✅ Prisma preconectado (warm)');
        }
      } catch (e) {
        console.warn('⚠️ No se pudo preconectar Prisma:', e.message);
      }
    }
    return true;
  }
}

module.exports = PersistenceFactory;