/**
 * Pruebas de autenticación y protección JWT.
 * - Verifica login correcto e incorrecto.
 * - Verifica acceso a rutas protegidas.
 */
const request = require('supertest');
const { app } = require('../src/backend/app.js');

function logRequest(method, url, status, duration) {
  console.log(
    `[${new Date().toLocaleTimeString()}] ${method} ${url} - Status: ${status} - ${duration}ms`
  );
}

describe('Pruebas de autenticación (JWT)', () => {

  // Datos de ejemplo
  const credencialesValidas = {
    email: 'example@fruna.cl',
    password: 'admin123'
  };

  const credencialesInvalidas = {
    email: 'example@fruna.cl',
    password: 'contraseña_incorrecta'
  };

  let token = null;

  test('POST /api/clients/login debe rechazar credenciales inválidas', async () => {
    const start = Date.now();
    const res = await request(app)
      .post('/api/clients/login')
      .send(credencialesInvalidas);
    const duration = Date.now() - start;

    logRequest('POST', '/api/clients/login', res.statusCode, duration);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/clients/login debe aceptar credenciales válidas y devolver token', async () => {
    const start = Date.now();
    const res = await request(app)
      .post('/api/clients/login')
      .send(credencialesValidas);
    const duration = Date.now() - start;

    logRequest('POST', '/api/clients/login', res.statusCode, duration);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
    console.log(`Token de Usuario: ${token}`);
  });

  test('GET /api/admin/dashboard debe devolver 200 con token válido', async () => {
    const start = Date.now();
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);
    const duration = Date.now() - start;

    logRequest('GET', '/api/admin/dashboard', res.statusCode, duration);

    expect(res.statusCode).toBe(200);
  });
});
