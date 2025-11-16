const dotenv = require('dotenv');

// Carga automática del archivo de entorno según NODE_ENV
dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

const { PrismaClient } = require('@prisma/client');

// Instancia única de Prisma
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // En desarrollo o test: evita crear muchas conexiones
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

module.exports = prisma;
