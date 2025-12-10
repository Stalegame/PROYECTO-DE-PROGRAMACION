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
      password: 'USER1234',
      role: 'USER',
      active: true
    },
    {
      id: 'cj2xk48m60002s0ezea0q9n7ys',
      name: 'Laura Fernández',
      email: 'laura.fernandez@example.com',
      phone: '+56987654321',
      address: 'Av. Los Olivos 123',
      password: 'USER1234',
      role: 'USER',
      active: false
    },
    {
      id: 'cj2xk4sfp0003s0ezezwl8u4qk',
      name: 'Martín Rojas',
      email: 'martin.rojas@example.com',
      phone: '+56923187458',
      address: 'Calle Central 45',
      password: 'USER1234',
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
    { id: 'cmils0rgj0002uirk24jfq2j5', name: 'Snacks' },
    { id: 'cmj0kp8lk0000uixkndd6684f', name: 'Chocolates' },
    { id: 'cmj0g2u9g0000bw1w9kudajy9', name: 'Alfajores' },
    { id: 'cmj0ju7ug0000ui1kt43so0di', name: 'Caramelos' }
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
      famous: false
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
      id: 'cmiyuwa7h0002uikw3ue1e770',
      name: 'Tabletones Maní',
      price: 2490,
      stock: 25,
      categoryId: 'cmj0kp8lk0000uixkndd6684f',
      description: 'Tabletones de maní bañados en chocolate.',
      image: 'tabletones.png',
      famous: true
    },
    {
      id: 'cmj0g2ua00002bw1wwup4l70i',
      name: 'Alfajor Panchito',
      price: 390,
      stock: 350,
      categoryId: 'cmj0g2u9g0000bw1w9kudajy9',
      description: 'Alfajor tradicional bañado en chocolate.',
      image: 'alfajor_panchito.png',
      famous: false
    },
    {
      id: 'cmj0glv630006bw1wdi16okec',
      name: 'Chispote',
      price: 490,
      stock: 25,
      categoryId: 'cmils0rgj0002uirk24jfq2j5',
      description: 'Sufle sabor chocolate.',
      image: 'chispote.png',
      famous: false
    },
    {
      id: 'cmj0gn8a80008bw1wukdeuumv',
      name: 'Choco Cranch',
      price: 790,
      stock: 35,
      categoryId: 'cmils0rgj0002uirk24jfq2j5',
      description: 'Cereal de maíz con cobertura sabor a chocolate',
      image: 'choco_cranch.png',
      famous: true
    },
    {
      id: 'cmj0gq8na000abw1wytw78i2y',
      name: 'Doble Chirlito Chocolate',
      price: 290,
      stock: 45,
      categoryId: 'cmils0rgj0002uirk24jfq2j5',
      description: 'Sufle con relleno crema sabor chocolate',
      image: 'doble_chirlito_chocolate.png',
      famous: false
    },
    {
      id: 'cmj0grkfp000cbw1w2zcnyv5l',
      name: 'Fruna Frutal 500ml',
      price: 590,
      stock: 32,
      categoryId: 'cmils0rgj0001uirk24jfq2j4',
      description: 'Bebida sabor frutal de 500ml',
      image: 'fruna_frutal_500ml.png',
      famous: false
    },
    {
      id: 'cmj0gt2vy000ebw1wyh4h23wc',
      name: 'Serrano Frutal 2L',
      price: 2490,
      stock: 5,
      categoryId: 'cmils0rgj0001uirk24jfq2j4',
      description: 'Bebida sabor frutal de 2 litros',
      image: 'serrano_frutal_2l.png',
      famous: false
    },
    {
      id: 'cmj0gv7ay000ibw1w2z0fz18g',
      name: 'Fruna Fru Cola 3L',
      price: 2490,
      stock: 50,
      categoryId: 'cmils0rgj0001uirk24jfq2j4',
      description: 'Bebida sabor fru cola de 3 litros',
      image: 'fruna_fru_cola_3l.png',
      famous: true
    },
    {
      id: 'cmj0h3vtw000kbw1w165ltqqz',
      name: 'Brazuka',
      price: 290,
      stock: 35,
      categoryId: 'cmils0rgj0000uirk24jfq2j3',
      description: 'Helado de agua sabor a manzana limón',
      image: 'brazuka.png',
      famous: true
    },
    {
      id: 'cmj0h7gmm000mbw1wfrctzdk6',
      name: 'Choco Fru',
      price: 290,
      stock: 50,
      categoryId: 'cmils0rgj0000uirk24jfq2j3',
      description: 'Helado de leche con cobertura sabor a crocante',
      image: 'choco_fru.png',
      famous: false
    },
    {
      id: 'cmj0hbtra000obw1wterwvf8k',
      name: 'Palito Vannichoc',
      price: 290,
      stock: 60,
      categoryId: 'cmils0rgj0000uirk24jfq2j3',
      description: 'Helado de leche sabor a vainilla y sabor chocolate',
      image: 'palito_vannichoc.png',
      famous: false
    },
    {
      id: 'cmj0ju8qq0002ui1k298toldj',
      name: 'Almendras Confitadas Serrano 500g',
      price: 1490,
      stock: 60,
      categoryId: 'cmj0ju7ug0000ui1kt43so0di',
      description: 'Caramelos duros sabor a fresa.',
      image: 'almendras_confitadas_serrano_500g.png',
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
