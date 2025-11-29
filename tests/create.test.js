const request = require('supertest');
const { app } = require('../src/backend/app.js');
const prisma = require('../src/backend/db/index.js');

function logRequest(method, url, status, duration) {
  console.log(
    `[${new Date().toLocaleTimeString()}] ${method} ${url} - Status: ${status} - ${duration}ms`
  );
}

describe('Pruebas básicas de creacion de objetos del servidor', () => {
  let createdUserId; // almacenamos el id del usuario creado
  let createdProductId; // almacenamos el id del producto creado

  test('POST /api/clients/register debe crear un nuevo cliente', async () => {
    const start = Date.now();

    const newClient = {
      nombre: 'Test User',
      email: 'testuser@example.com',
      password: 'Test1234',
      telefono: '44556677'
    };

    const res = await request(app).post('/api/clients/register').send(newClient);
    const duration = Date.now() - start;

    logRequest('POST', '/api/clients/register', res.statusCode, duration);

    expect(res.statusCode).toBe(201);
    const user = res.body.data;
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email', newClient.email);

    createdUserId = user.id; // guardamos el id para borrarlo
  });

  test('POST /api/products/ debe crear un producto nuevo como admin', async () => {
    const start = Date.now();

    // Acceder como admin
    const adminCreds = { email: 'example@fruna.cl', password: 'admin123' };
    const loginRes = await request(app).post('/api/clients/login')
      .send(adminCreds);

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
    const token = loginRes.body.token;

    const newProduct = {
      name: 'Test Product',
      category: 'Test',
      price: 999,
      stock: 10
    };

    const res = await request(app).post('/api/admin/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);
    const duration = Date.now() - start;

    logRequest('POST', '/api/admin/products', res.statusCode, duration);

    expect(res.statusCode).toBe(201);
    const product = res.body.data;
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name', newProduct.name);

    createdProductId = product.id; // guardamos el id para borrarlo
  });

  // afterEach elimina los objetos creados después de cada test
  afterEach(async () => {
    if (createdUserId) {
      await prisma.client.delete({
        where: { id: createdUserId }
      });
      createdUserId = null;
    }
    if (createdProductId) {
      await prisma.product.delete({
        where: { id: createdProductId }
      });
      createdProductId = null;
    }
  });
});
