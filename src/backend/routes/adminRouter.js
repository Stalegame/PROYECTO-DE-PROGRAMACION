// routes/adminRouter.js
const express = require('express');
const router = express.Router();
const PersistenceFactory = require('../PersistenceFactory');

// DAOs desde tu Factory
const clientesDAO = PersistenceFactory.getDAO('clientes');
const productosDAO = PersistenceFactory.getDAO('productos');
const categoriaDAO = PersistenceFactory.getDAO('categorias');
const ordersDAO = PersistenceFactory.getDAO('orders');

// Panel Del ADMIN
router.get('/dashboard', async (_req, res) => {
  try {
    let dataTotal = {};
    dataTotal.resumenOrders = await ordersDAO.getLastOrders();
    dataTotal.pendingOrders = await ordersDAO.getPending();
    dataTotal.sumOfDay = await ordersDAO.getSumOfDay();
    dataTotal.lowStockProducts = await productosDAO.getLowStock();
    dataTotal.createdThisMonth = await clientesDAO.getCreatedThisMonth();

    res.status(200).json({
      success: true,
      data: dataTotal,
      message: 'Bienvenido al panel administrativo',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error cargando el panel administrativo'
    });
  }
});

// Listar clientes
router.get('/users', async (_req, res) => {
  try {
    const clientes = await clientesDAO.getAll();

    res.status(200).json({
      success: true,
      data: clientes,
      message: `Encontrados ${clientes.length} clientes`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error cargando clientes'
    });
  }
});

// Listar pedidos
router.get('/orders', async (_req, res) => {
  try {
    const orders = await ordersDAO.getAll();

    res.status(200).json({
      success: true,
      data: orders,
      message: 'Pedidos obtenidos correctamente'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo pedidos'
    });
  }
});

// Suspender cliente
router.put('/users/:id/suspend', async (req, res) => {
  try {
    const id = req.params.id;

    // El admin no se puede suspender a sí mismo
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes suspender tu propia cuenta Admin'
      });
    }

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
      data: actualizado
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
      data: actualizado
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

    // El admin no se puede eliminar a sí mismo
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes eliminar tu propia cuenta Admin'
      });
    }

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
    let categoryRecord = await categoriaDAO.getByName(category);

    if (!categoryRecord) {
      categoryRecord = await categoriaDAO.save(category);
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
      let categoryRecord = await categoriaDAO.getByName(cambios.category);

      if (!categoryRecord) {
        categoryRecord = await categoriaDAO.save(cambios.category);
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
