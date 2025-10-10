// Carga de variables de entorno (.env)
import dotenv from 'dotenv';
dotenv.config({ path: 'SRC/Backend/.env' }); // Asegúrate de que el archivo .env esté en SRC/

// Importa Prisma Client
import { PrismaClient } from '@prisma/client';

// Inicializa Prisma
const prisma = new PrismaClient();

async function main() {
  // Muestra un resumen de la conexión (solo para verificar)
  console.log('Conectando a:', process.env.DATABASE_URL);

  // Consulta simple para probar la conexión
  const productos = await prisma.products.findMany({ take: 5 });

  console.log('Productos encontrados:');
  console.table(productos);
}

// Ejecuta la función principal
main()
  .catch((error) => {
    console.error('Error al ejecutar Prisma:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
