/**
 * Seed inicial para tu nueva base de datos con el schema actualizado.
 * Ejecutar con: `node src/backend/scripts/seed.js`
 */
const bcrypt = require('bcryptjs');
const prisma = require('../db/index.js');

async function main() {
  // CLIENTS

  const clients = [
    {
      id: 'cj2xk2q9m0000s0ez8g8z9hdp',
      name: 'Example Admin',
      email: 'example@fruna.cl',
      phone: null,
      address: null,
      password: 'ADMIN123',
      role: 'ADMIN',
      active: true
    },
    {
      id: 'cj2xk3h5b0001s0ez9jx0f2lm',
      name: 'Pepe Acosta',
      email: 'pepeacosta@example.com',
      phone: '+56912345678',
      address: 'Calle de Pepe Acosta',
      password: '12345678',
      role: 'USER',
      active: true
    },
    {
      id: 'cj2xk48m60002s0ezea0q9n7ys',
      name: 'Laura Fernández',
      email: 'laura.fernandez@example.com',
      phone: '+56987654321',
      address: 'Av. Los Olivos 123',
      password: '12345678',
      role: 'USER',
      active: false
    },
    {
      id: 'cj2xk4sfp0003s0ezezwl8u4qk',
      name: 'Martín Rojas',
      email: 'martin.rojas@example.com',
      phone: '+56923187458',
      address: 'Calle Central 45',
      password: '12345678',
      role: 'USER',
      active: true
    }
  ];

  for (const c of clients) {
    const hash = await bcrypt.hash(c.password, 10);
    const { password, ...rest } = c;

    await prisma.client.upsert({
      where: { id: c.id },
      update: {},
      create: {
        ...rest,
        passwordHash: hash
      }
    });
  }

  // CATEGORIES

  const categories = [
    { id: 'cmils0rgj0000uirk24jfq2j3', name: 'Helados' },
    { id: 'cmils0rgj0001uirk24jfq2j4', name: 'Bebidas' },
    { id: 'cmils0rgj0002uirk24jfq2j5', name: 'Snacks' }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: category
    });
  }

  // PRODUCTS

  const products = [
    {
      id: 'cj2xk6r9y0004s0eze9js1rnl',
      name: 'Palo Palito',
      price: 390,
      stock: 15,
      categoryId: 'cmils0rgj0000uirk24jfq2j3',
      description: 'Helado de agua sabor cereza y piña.',
      image: 'palo_palito.png',
      famous: true
    },
    {
      id: 'cj2xk74by0005s0ezectp82jt',
      name: 'Cola Cola Clásica 2Lt',
      price: 1490,
      stock: 10,
      categoryId: 'cmils0rgj0001uirk24jfq2j4',
      description: 'Refresca tus momentos con el sabor clásico de Cola Cola.',
      image: 'cola_cola_fruna.png',
      famous: true
    },
    {
      id: 'cj2xk7s6y0006s0ezeou7fcwn',
      name: 'Sufle Maní',
      price: 990,
      stock: 20,
      categoryId: 'cmils0rgj0002uirk24jfq2j5',
      description: 'Snack crocante de maní.',
      image: 'sufle_chanfle_mani.png',
      famous: false
    },
    {
      id: 'cmj0gt2vy100ebw1wyh4h23w3',
      name: 'Serrano Frutal 2Lt',
      price: 2490,
      stock: 25,
      categoryId: 'cmils0rgj0001uirk24jfq2j4',
      description: 'Bebida sabor frutal de 2 litros.',
      image: 'serrano_frutal_2l.png',
      famous: false
    }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: p
    });
  }

  console.log("✅ Seed completado con éxito");
}

// MAIN EXECUTION

if (require.main === module) {
  if (process.env.NODE_ENV === 'production' && process.env.FORCE_SEED !== 'true') {
    console.log('Seed omitido en producción. Ejecuta con FORCE_SEED=true para forzar.');
    process.exit(0);
  }

  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
