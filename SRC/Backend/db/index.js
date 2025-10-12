// SRC/Backend/db/index.js
const path = require('path');
require('dotenv').config({
  // Sube una carpeta desde /db hasta /Backend
  path: path.resolve(__dirname, '../.env'),
});

const { PrismaClient } = require('@prisma/client');

// Instancia única de Prisma
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // En desarrollo: evita crear muchas conexiones por hot reload
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

// Exporta el cliente para que lo usen los repositorios
module.exports = prisma;
