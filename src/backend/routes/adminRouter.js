// routes/adminRouter.js
const express = require('express');
const router = express.Router();
const PersistenceFactory = require('../PersistenceFactory');
const prisma = require('../db');

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
router.get('/users', async (_req, res) => {
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

// Suspender cliente
router.put('/users/:id/suspend', async (req, res) => {
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
      message: 'Usuario suspendido',
      data: toPublicClient(actualizado)
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error suspendiendo usuario'
    });
  }
});

// Reactivar cliente
router.put('/users/:id/unsuspend', async (req, res) => {
  try {
    const id = req.params.id;

    const actualizado = await clientesDAO.update(id, { active: true });
    if (!actualizado) {
      return res.status(404).json({
        success: false,
        error: 'No encontramos este usuario'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Usuario reactivado',
      data: toPublicClient(actualizado)
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error reactivando usuario'
    });
  }
});

// Eliminar cliente
router.delete('/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await clientesDAO.delete(id);

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error eliminando usuario'
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

    // Buscar o crear categoría
    let categoryRecord = await prisma.category.findUnique({
      where: { name: category }
    });

    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: { name: category }
      });
    }

    const nuevo = await productosDAO.save({
      name,
      price,
      stock,
      categoryId: categoryRecord.id,
      description,
      image
    });

    res.status(201).json({
      success: true,
      message: 'Producto creado correctamente',
      data: nuevo
    });

  } catch (err) {
    console.error('Error creando producto:', err);
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

    // Si viene category (nombre), buscar o crear la categoría
    if (cambios.category) {
      let categoryRecord = await prisma.category.findUnique({
        where: { name: cambios.category }
      });

      if (!categoryRecord) {
        categoryRecord = await prisma.category.create({
          data: { name: cambios.category }
        });
      }

      cambios.categoryId = categoryRecord.id;
      delete cambios.category;
    }

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
    console.error('Error actualizando producto:', err);
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
