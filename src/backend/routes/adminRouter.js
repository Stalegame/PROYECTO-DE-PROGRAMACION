// routes/adminRouter.js
const express = require('express');
const router = express.Router();
const PersistenceFactory = require('../PersistenceFactory');

// DAOs desde tu Factory
const clientesDAO = PersistenceFactory.getDAO('clientes');
const productosDAO = PersistenceFactory.getDAO('productos');

/** Sanitización de cliente (evita mutar el objeto original) */
function toPublicClient(c) {
  if (!c) return null;

  return {
    id: c.id,
    email: c.email,
    name: c.name,
    active: c.active,
    createdAt: c.createdAt ?? c.created_at ?? null,
    updatedAt: c.updatedAt ?? c.updated_at ?? null,
  };
}

// Panel Del ADMIN (En construcción)
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bienvenido al panel administrativo',
    user: req.user,
  });
});

// Listar clientes
router.get('/clientes', async (_req, res) => {
  try {
    const clientes = await clientesDAO.getAll();
    const data = clientes.map(toPublicClient);

    res.status(200).json({
      success: true,
      data,
      message: `Encontrados ${data.length} clientes`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error cargando clientes'
    });
  }
});

// Desactivar cliente
router.patch('/clientes/:id/desactivar', async (req, res) => {
  try {
    const id = req.params.id;

    const actualizado = await clientesDAO.update(id, { active: false });
    if (!actualizado) {
      return res.status(404).json({
        success: false,
        error: 'No encontramos este usuario'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Usuario desactivado',
      data: toPublicClient(actualizado)
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error desactivando usuario'
    });
  }
});

// Crear producto
router.post('/products', async (req, res) => {
  try {
    const { name, price, stock, category, description, image } = req.body;

    if (!name || !price || !stock || !category) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, precio, stock y categoria son obligatorios'
      });
    }

    const nuevo = await productosDAO.save({
      name,
      price,
      stock,
      category,
      description,
      image
    });

    res.status(201).json({
      success: true,
      message: 'Producto creado correctamente',
      data: nuevo
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error al crear el producto'
    });
  }
});

// Actualizar producto
router.put('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const cambios = req.body;

    const actualizado = await productosDAO.update(id, cambios);

    if (!actualizado) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Producto actualizado',
      data: actualizado
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el producto'
    });
  }
});

// Eliminar producto
router.delete('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const eliminado = await productosDAO.delete(id);

    if (!eliminado) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Producto eliminado correctamente'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error eliminando el producto'
    });
  }
});

module.exports = router;
