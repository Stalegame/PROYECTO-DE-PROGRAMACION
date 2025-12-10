const express = require("express");
const router = express.Router();
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const {
  obtenerProducto,
  estaDisponible,
  listarProductosPorCategoria,
  listarProductosPorPrecio,
  buscarProductos
} = require("../db/dbFunctions");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();
    
    // Obtener contexto de la base de datos
    let contextoDB = "";

    // --- CONSULTAS DE STOCK ---
    if (/stock/i.test(lowerMsg)) {
      const match = message.match(/stock(?: del| de| de la)?\s+([\w\s]+)/i);
      let nombreProducto = match ? match[1].trim() : null;
      if (nombreProducto) {
        nombreProducto = nombreProducto.replace(/[?.!,]$/, ""); // limpiar signos
        const producto = await obtenerProducto(nombreProducto);
        if (producto) {
          return res.json({
            reply: `El producto "${producto.name}" tiene ${producto.stock} unidades en stock, precio: $${producto.price}, categoría: ${producto.category.name}.`
          });
        } else {
          return res.json({ reply: `No encontré el producto "${nombreProducto}" en la base de datos.` });
        }
      } else {
        return res.json({ reply: "Por favor, dime el nombre del producto para consultar el stock." });
      }
    }

    // --- CONSULTAS DE DISPONIBILIDAD ---
    if (/disponible/i.test(lowerMsg)) {
      const match = message.match(/disponible(?: del| de| de la)?\s+([\w\s]+)/i);
      let nombreProducto = match ? match[1].trim() : null;
      if (nombreProducto) {
        nombreProducto = nombreProducto.replace(/[?.!,]$/, "");
        const disponible = await estaDisponible(nombreProducto);
        return res.json({
          reply: disponible
            ? `Sí, el producto "${nombreProducto}" está disponible.`
            : `Lo siento, el producto "${nombreProducto}" no tiene stock o no existe.`
        });
      }
    }

    // --- LISTAR PRODUCTOS POR CATEGORÍA ---
    if (/categoría/i.test(lowerMsg)) {
      const match = message.match(/categor[ií]a(?: de|:)?\s+([\w\s]+)/i);
      const categoria = match ? match[1].trim() : null;
      if (categoria) {
        const productos = await listarProductosPorCategoria(categoria);
        if (productos.length > 0) {
          const nombres = productos.map(p => p.name).join(", ");
          return res.json({ reply: `Productos en la categoría "${categoria}": ${nombres}` });
        } else {
          return res.json({ reply: `No encontré productos en la categoría "${categoria}".` });
        }
      }
    }

    // --- LISTAR PRODUCTOS POR RANGO DE PRECIO ---
    if (/precio/i.test(lowerMsg)) {
      const match = message.match(/precio\s+(\d+)\s*(?:a|-)\s*(\d+)/i);
      if (match) {
        const min = parseInt(match[1]);
        const max = parseInt(match[2]);
        const productos = await listarProductosPorPrecio(min, max);
        if (productos.length > 0) {
          const nombres = productos.map(p => `${p.name} ($${p.price})`).join(", ");
          return res.json({ reply: `Productos entre $${min} y $${max}: ${nombres}` });
        } else {
          return res.json({ reply: `No encontré productos entre $${min} y $${max}.` });
        }
      }
    }

    // --- BÚSQUEDA INTELIGENTE DE PRODUCTOS ---
    // Detectar si menciona productos, categorías, precios, etc.
    const mencionaProductos = /producto|bebida|jugo|gaseosa|galleta|chocolate|snack|dulce|salado|fruna/i.test(lowerMsg);
    const mencionaCategoria = /categor[ií]a|tipo|clase/i.test(lowerMsg);
    const mencionaPrecio = /precio|cuesta|valor|cuánto|barato|caro|\$|pesos/i.test(lowerMsg);
    const mencionaStock = /stock|disponible|hay|tiene|quedan|unidades/i.test(lowerMsg);
    
    // Si la consulta es sobre productos, construir contexto
    if (mencionaProductos || mencionaCategoria || mencionaPrecio || mencionaStock) {
      // Buscar productos relevantes
      let productosRelevantes = await buscarProductos(message);
      
      // Si no encuentra con búsqueda, intentar por palabras clave
      if (productosRelevantes.length === 0) {
        // Extraer palabras clave (más de 3 letras)
        const palabras = message.match(/\b\w{3,}\b/gi) || [];
        for (const palabra of palabras) {
          const resultados = await buscarProductos(palabra);
          productosRelevantes.push(...resultados);
        }
        // Eliminar duplicados
        productosRelevantes = [...new Map(productosRelevantes.map(p => [p.id, p])).values()];
      }
      
      // Si aún no hay resultados, traer productos populares o todos
      if (productosRelevantes.length === 0) {
        productosRelevantes = await prisma.product.findMany({
          take: 10,
          include: { category: true },
          orderBy: { stock: 'desc' }
        });
      }
      
      // Limitar a 15 productos para no saturar el contexto
      productosRelevantes = productosRelevantes.slice(0, 15);
      
      // Construir contexto estructurado
      contextoDB = `BASE DE DATOS DE PRODUCTOS FRUNA:\n\n`;
      productosRelevantes.forEach(p => {
        contextoDB += `- ${p.name}\n`;
        contextoDB += `  Precio: $${p.price}\n`;
        contextoDB += `  Stock: ${p.stock} unidades\n`;
        contextoDB += `  Categoría: ${p.category?.name || 'Sin categoría'}\n`;
        if (p.description) contextoDB += `  Descripción: ${p.description}\n`;
        contextoDB += `\n`;
      });
    }

    // --- CONSULTA AL MODELO EXTERNO CON CONTEXTO ---
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        model: "tngtech/deepseek-r1t2-chimera:free",
        messages: [
          { 
            role: "system", 
            content: `Eres FrunaBot, asistente virtual de la tienda Fruna.

            REGLAS IMPORTANTES:
            1. SOLO usa información de la base de datos proporcionada
            2. NUNCA inventes productos, precios o información
            3. Si no tienes datos, di "No tengo esa información en este momento"
            4. Sé amable, breve y útil
            5. Si preguntan por un producto que no está en la BD, di que no lo encuentras

            ${contextoDB || "No hay contexto de productos para esta consulta."}` 
          },
          { role: "user", content: message }
        ],
      }),
    });    // timeout de 30 segundos
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Tiempo de espera agotado al contactar el modelo.")), 30000)
    );

    const data = await Promise.race([response.json(), timeout]);
    
    // Manejo de errores de OpenRouter
    if (data.error) {
      console.error("Error de OpenRouter:", data.error);
      
      // Mensajes específicos según el error
      if (data.error.code === 429) {
        return res.json({ 
          reply: "El chatbot está temporalmente sobrecargado. Por favor intenta de nuevo en unos segundos." 
        });
      } else if (data.error.code === 401) {
        return res.json({ 
          reply: "Error de configuración del chatbot. Por favor contacta al administrador." 
        });
      } else {
        return res.json({ 
          reply: `Error: ${data.error.message}. Por favor intenta nuevamente.` 
        });
      }
    }
    
    let reply = data.choices?.[0]?.message?.content || "No se obtuvo respuesta del modelo.";

    // Limpiar tokens especiales del modelo si aparecen
    reply = reply.replace(/<\|[^|>]+\|>/g, "").trim();

    res.json({ reply });

  } catch (error) {
    console.error("Error en /api/chat:", error);
    res.status(500).json({ reply: "Error interno del servidor." });
  }
});

module.exports = router;
