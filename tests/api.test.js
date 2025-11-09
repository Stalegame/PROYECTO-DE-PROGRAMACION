/**
 * Pruebas básicas para verificar que los endpoints del servidor respondan correctamente.
 * Usa Supertest directamente sobre `app` sin levantar el servidor.
 */
const request = require('supertest');
const { app } = require('../src/backend/app.js');

function logRequest(method, url, status, duration) {
  console.log(
    `[${new Date().toLocaleTimeString()}] ${method} ${url} - Status: ${status} - ${duration}ms`
  );
}

describe('Pruebas básicas del servidor', () => {

  test('GET /health debe responder con status OK', async () => {
    const start = Date.now();
    const res = await request(app).get('/health');
    const duration = Date.now() - start;

    logRequest('GET', '/health', res.statusCode, duration);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  test('GET /api/products debe responder status 200 (aunque esté vacío)', async () => {
    const start = Date.now();
    const res = await request(app).get('/api/products');
    const duration = Date.now() - start;

    logRequest('GET', '/api/products', res.statusCode, duration);

    expect(res.statusCode).toBe(200);
  });

  test('GET /api/clients debe responder error 404 ya que no existe esta ruta', async () => {
    const start = Date.now();
    const res = await request(app).get('/api/clients');
    const duration = Date.now() - start;

    logRequest('GET', '/api/clients', res.statusCode, duration);

    expect(res.statusCode).toBe(404);
  });
});
