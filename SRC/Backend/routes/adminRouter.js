// routes/adminRouter.js
const express = require('express');
const router = express.Router();
const PersistenceFactory = require('../PersistenceFactory');

// Traemos el DAO de clientes (Prisma/JSON, etc., según tu factory)
const clientesDAO = PersistenceFactory.getDAO('clientes');

/** 
 * Sanear/normalizar un cliente para respuesta pública:
 * - quita passwordHash/password_hash
 * - normaliza createdAt/updatedAt
 */
function toPublicClient(c) {
  if (!c) return c;

  // Extrae y descarta variantes de contraseña
  const {
    passwordHash,      // camel
    password_hash,     // snake
    ...rest
  } = c;

  // Normaliza fechas (si vienen en snake_case)
  const createdAt = rest.createdAt ?? rest.created_at ?? null;
  const updatedAt = rest.updatedAt ?? rest.updated_at ?? null;

  // Elimina las keys snake duplicadas para no confundir al frontend
  delete rest.created_at;
  delete rest.updated_at;

  return {
    ...rest,
    ...(createdAt ? { createdAt } : {}),
    ...(updatedAt ? { updatedAt } : {}),
  };
}

// ==================== RUTAS DEL ADMINISTRADOR ====================

// Esta ruta es como el "tablero de control" del administrador
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    message: '¡Hola administrador! Bienvenido a tu panel de control',
    user: req.user
  });
});

// Listar todos los clientes (sin contraseñas)
router.get('/clientes', async (req, res) => {
  try {
    // Pedimos todos los clientes al DAO
    const clientes = await clientesDAO.getAll();

    // Convertimos a versión pública y normalizamos campos
    const data = Array.isArray(clientes) ? clientes.map(toPublicClient) : [];

    res.json({ 
      success: true, 
      data,
      message: `Encontrados ${data.length} clientes`
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'No pudimos cargar la lista de clientes' 
    });
  }
});

// Esta ruta permite desactivar un cliente (sin eliminarlo)
router.patch('/clientes/:id/desactivar', async (req, res) => {
  try {
    const id = req.params.id;

    // Importante: solo tocamos "activo". No editamos contraseña aquí.
    const actualizado = await clientesDAO.update(id, { activo: false });

    if (!actualizado) { 
      return res.status(404).json({ 
        success: false, 
        error: 'No encontramos este usuario' 
      });
    }

    // Devolvemos versión pública
    const data = toPublicClient(actualizado);

    res.json({ 
      success: true, 
      message: 'El usuario ha sido desactivado',
      data
    });
  } catch (error) {
    console.error('Error al desactivar cliente:', error);
    res.status(500).json({ 
      success: false, 
      error: 'No pudimos desactivar al usuario' 
    });
  }
});
// Exportamos el router para usarlo en el servidor principal
module.exports = router;