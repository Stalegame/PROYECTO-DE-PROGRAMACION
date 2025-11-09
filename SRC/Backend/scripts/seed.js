/**
 * 
 */
import bcrypt from 'bcryptjs';
import prisma from '../db/index.js';

console.log("NODE_ENV =", process.env.NODE_ENV);
console.log("DATABASE_URL =", process.env.DATABASE_URL);

async function main() {
  // CLIENTES 
  const clients = [
    {
      id: '1758128875560',
      nombre: 'Example Admin',
      email: 'example@fruna.cl',
      telefono: null,
      direccion: null,
      password: 'admin123',
      role: 'admin',
      activo: true
    },
    {
      id: '1758129268033',
      nombre: 'Pepe Acosta',
      email: 'pepeacosta@example.com',
      telefono: '+56912345678',
      direccion: 'Calle de Pepe Acosta',
      password: '123456',
      role: 'user',
      activo: true
    },
    {
      id: '1758131713782',
      nombre: 'Laura Fernández',
      email: 'laura.fernandez@example.com',
      telefono: '+5698765432',
      direccion: 'Av. Los Olivos 123',
      password: '123456',
      role: 'user',
      activo: false
    },
    {
      id: '1758131811794',
      nombre: 'Martín Rojas',
      email: 'martin.rojas@example.com',
      telefono: '+5692318745',
      direccion: 'Calle Central 45',
      password: '123456',
      role: 'user',
      activo: true
    }
  ];

  for (const c of clients) {
    const hash = await bcrypt.hash(c.password, 10);
    const { password, ...rest } = c; // quitar password
    await prisma.clients.upsert({
      where: { id: c.id },
      update: {},
      create: {
        ...rest,
        passwordHash: hash
      }
    });
  }

  // ===== PRODUCTOS =====
  const products = [
    {
      id: '1758149195472',
      name: 'Palo Palito',
      price: 390,
      stock: 15,
      category: 'Helados',
      description: 'Helado de agua sabor cereza y piña.',
      image: 'palo_palito.png'
    },
    {
      id: '1758149775878',
      name: 'Cola Cola Clásica 2Lt',
      price: 1490,
      stock: 10,
      category: 'Bebidas',
      description: 'Refresca tus momentos con el sabor clásico y burbujeante de siempre. Ideal para compartir.',
      image: 'cola_cola_fruna.jpg'
    },
    {
      id: '1758149867672',
      name: 'Sufle Maní',
      price: 990,
      stock: 20,
      category: 'Snacks',
      description: 'Snack crocante de maní con el sabor clásico de siempre.',
      image: 'Sufle_Chanfle_Mani.jpg'
    }
    // Agrega más productos si quieres
  ];

  for (const p of products) {
    await prisma.products.upsert({
      where: { id: p.id }, // ⚠️ usar id para evitar conflictos
      update: {},
      create: p
    });
  }

  console.log("✅ Seed completado con éxito");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
