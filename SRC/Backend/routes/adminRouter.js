// routes/adminRouter.js
const express = require('express');
const router = express.Router();
const PersistenceFactory = require('../PersistenceFactory');

// Traemos el "libro" de clientes por decirlo asi para poder leer y modificar clientes
const clientesDAO = PersistenceFactory.getDAO('clientes');

// ==================== RUTAS DEL ADMINISTRADOR ====================

// Esta ruta es como el "tablero de control" del administrador
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    message: '¡Hola administrador! Bienvenido a tu panel de control',
    user: req.user // Aquí viene la información del usuario que hizo login
  });
});

// Esta ruta muestra todos los clientes registrados
router.get('/clientes', async (req, res) => {
  try {
    // Pedimos la lista completa de clientes
    const clientes = await clientesDAO.getAll(); 
    
    // IMPORTANTE: getAll ya nos devuelve los clientes SIN sus contraseñas :D
    res.json({ 
      success: true, 
      data: clientes,
      message: `Encontrados ${clientes.length} clientes` 
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
    const id = req.params.id; // El ID del cliente que queremos desactivar
    
    // Actualizamos el cliente, poniendo "activo: false"
    const cliente = await clientesDAO.update(id, { activo: false });
    
    // Si no encontramos el cliente, avisamos
    if (!cliente) {
      return res.status(404).json({ 
        success: false, 
        error: 'No encontramos este usuario' 
      });
    }

    // Todo salió bien, confirmamos la desactivación
    res.json({ 
      success: true, 
      message: 'El usuario ha sido desactivado',
      data: cliente 
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