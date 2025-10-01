// routes/productsRouter.js
//esto tiene rutas que todos pueden ver y otras que solo el admin puede ver, los POST, PUT y DELETE son solo para el admin.
// Tiene sistema de seguridad, ponemos auth y adminAuth si existen, sino deja pasar a cualquiera
//Validaciones que hace: - Nombre = Entre 2 y 100 caracteres - Precio = Número positivo -Stock = Número entero positivo -Categoría = Máximo 50 caracteres - Descripción = Máximo 500 caracteres
// - Imagen = Máximo 300 caracteres
const path = require('path');
const express = require('express');
const { body, param, validationResult } = require('express-validator');

const PersistenceFactory = require(path.join(__dirname, '..', 'PersistenceFactory'));
const router = express.Router();

const IS_DEV = process.env.NODE_ENV !== 'production';

//  Nuestro "asistente de productos" 
let productosDAO;
try {
  // Intentamos usar el sistema principal
  productosDAO = PersistenceFactory.getDAO('productos');
} catch (e) {
  // Si falla, usamos el de respaldo directo
  const JsonProductosDAO = require(path.join(__dirname, '..', 'json', 'JsonProductosDAO'));
  productosDAO = new JsonProductosDAO();
}

//seguridad para modificar productos (es como un guardia)
let auth, adminAuth;
try {
  // Intentamos cargar los guardias de seguridad
  ({ auth, adminAuth } = require('../middlewares/auth'));
} catch (_) {
  // Si no existen los guardias (en desarrollo), avisamos pero seguimos
  if (IS_DEV) console.warn('[productsRouter] Los guardias de seguridad no están disponibles: CUALQUIERA podrá modificar productos');
}

//"Traductor" de datos (soporta español e inglés) 
const normalizeProductInput = (req, _res, next) => {
  const datos = req.body || {};
  
  // Aceptamos tanto "price" como "precio", tanto "stock" como "existencia" (tema de alcance de idioma se tomo en consideracion)
  const precioRaw = datos.price ?? datos.precio;
  const stockRaw = datos.stock ?? datos.existencia;

  // Función para limpiar textos
  const limpiarTexto = (v) => {
    if (v === undefined || v === null) return undefined;
    const textoLimpio = String(v).trim();
    return textoLimpio === '' ? undefined : textoLimpio;
  };

  // Función para limpiar números
  const limpiarNumero = (v) =>
    (v === undefined || v === null || String(v).trim() === '')
      ? undefined
      : Number(v);

  // Preparamos los datos limpios y normalizados
  req.body = {
    //IMPORTANTE: Nunca tocamos el ID aquí
    name:        limpiarTexto(datos.name ?? datos.nombre),
    price:       limpiarNumero(precioRaw),
    stock:       (limpiarNumero(stockRaw) !== undefined ? parseInt(limpiarNumero(stockRaw), 10) : undefined),
    category:    limpiarTexto(datos.category ?? datos.categoria),
    description: limpiarTexto(datos.description ?? datos.descripcion),
    image:       limpiarTexto(datos.image ?? datos.imagen),
  };
  next();
};

//Reglas para validar productos
const validateCreateOrUpdate = [
  body('name')
    .optional() // En actualizaciones puede ser opcional
    .notEmpty().withMessage('Tienes que poner un nombre al producto')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 letras')
    .trim().escape(),

  body('price')
    .optional()
    .notEmpty().withMessage('Tienes que poner un precio')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo')
    .toFloat(),

  body('stock')
    .optional()
    .notEmpty().withMessage('Tienes que indicar cuántos hay en stock')
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo')
    .toInt(),

  body('category')
    .optional()
    .isLength({ max: 50 }).withMessage('La categoría no puede tener más de 50 letras')
    .trim().escape(),

  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('La descripción no puede tener más de 500 letras')
    .trim().escape(),

  body('image')
    .optional()
    .isLength({ max: 300 }).withMessage('La imagen no puede tener más de 300 caracteres')
    .trim(),
];

const validateProductId = [
  param('id')
    .notEmpty().withMessage('Tienes que especificar qué producto')
    .isLength({ min: 1, max: 64 }).withMessage('El ID no es válido')
    .trim().escape(),
];

// Revisa si hubo errores en las validaciones
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Los datos del producto no son válidos',
      details: errors.mapped(),
    });
  }
  next();
};

// ==================== RUTAS PÚBLICAS (todos pueden ver) ====================

// GET /api/products - Ver todos los productos
router.get('/', async (_req, res) => {
  try {
    const productos = await productosDAO.getAll();
    res.json({ 
      success: true, 
      count: productos.length, 
      data: productos,
      message: `Encontrados ${productos.length} productos` 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'No pudimos cargar los productos',
      ...(IS_DEV && { detail: error.message }), // Solo mostramos detalles en desarrollo
    });
  }
});

// GET /api/products/:id - Ver un producto específico
router.get('/:id', validateProductId, handleValidationErrors, async (req, res) => {
  try {
    const producto = await productosDAO.getById(req.params.id);
    if (!producto) {
      return res.status(404).json({ 
        success: false, 
        error: 'No encontramos este producto' 
      });
    }
    res.json({ 
      success: true, 
      data: producto,
      message: 'Producto encontrado' 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al buscar el producto',
      ...(IS_DEV && { detail: error.message }),
    });
  }
});

// RUTAS DE ADMINISTRADOR (solo admin puede modificar) 

// Función inteligente que aplica seguridad si existe, sino deja pasar
const protect = (funcion) => (auth && adminAuth) ? [auth, adminAuth, funcion] : [funcion];

// Ayuda para tomar solo los campos que nos interesan
const pick = (obj, campos) =>
  campos.reduce((acumulador, clave)=> (obj[clave]!==undefined ? (acumulador[clave]=obj[clave],acumulador) : acumulador), {});

// POST /api/products - Crear nuevo producto
router.post(
  '/',
  normalizeProductInput,     // Primero traducimos y limpiamos
  validateCreateOrUpdate,    // Luego validamos
  handleValidationErrors,    // Revisamos errores
  ...protect(async (req, res) => {  // Finalmente, si pasa todo, creamos el producto (con seguridad si existe)
    try {
      const nuevoProducto = await productosDAO.save(req.body);
      res.status(201).json({ 
        success: true, 
        message: '¡Producto creado exitosamente!', 
        data: nuevoProducto 
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'No pudimos crear el producto',
        ...(IS_DEV && { detail: error.message }),
      });
    }
  })
);

// PUT /api/products/:id - Actualizar producto existente
router.put('/:id',
  validateProductId,         // Validamos que el ID sea correcto
  normalizeProductInput,     // Traducimos y limpiamos (no toca la id por si acaso)
  validateCreateOrUpdate,    // Validamos los datos
  handleValidationErrors,    // Revisamos errores
  ...protect(async (req, res) => {  // Aplicamos seguridad
    try {
      const id = req.params.id;
      
      // Tomamos solo los campos que se pueden actualizar
      const cambios = pick(req.body, ['name','price','stock','category','description','image']);
      delete cambios.id; // Por seguridad, nunca cambiamos el ID

      const productoActualizado = await productosDAO.update(id, cambios);
      if (!productoActualizado) {
        return res.status(404).json({ 
          success: false, 
          error: 'No encontramos el producto para actualizar' 
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Producto actualizado correctamente', 
        data: productoActualizado 
      });
    } catch (error) {
      console.error('ERROR al actualizar producto:', { 
        mensaje: error.message, 
        stack: error.stack 
      });
      res.status(500).json({
        success: false,
        error: 'No pudimos actualizar el producto',
        detail: process.env.NODE_ENV !== 'production' ? error.message : undefined,
      });
    }
  })
);

// DELETE /api/products/:id - Eliminar producto
router.delete(
  '/:id',
  validateProductId,         // Validamos el ID
  handleValidationErrors,    // Revisamos errores
  ...protect(async (req, res) => {  // Aplicamos seguridad
    try {
      const seElimino = await productosDAO.delete(req.params.id);
      if (!seElimino) {
        return res.status(404).json({ 
          success: false, 
          error: 'No encontramos el producto para eliminar' 
        });
      }
      res.json({ 
        success: true, 
        message: 'Producto eliminado correctamente' 
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'No pudimos eliminar el producto',
        ...(IS_DEV && { detail: error.message }),
      });
    }
  })
);
module.exports = router;