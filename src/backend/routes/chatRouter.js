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

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();

    // --- CONSULTAS DE STOCK ---
    if (/stock/i.test(lowerMsg)) {
      const match = message.match(/stock(?: del| de| de la)?\s+([\w\s]+)/i);
      let nombreProducto = match ? match[1].trim() : null;
      if (nombreProducto) {
        nombreProducto = nombreProducto.replace(/[?.!,]$/, ""); // limpiar signos
        const producto = await obtenerProducto(nombreProducto);
        if (producto) {
          return res.json({
            reply: `El producto "${producto.name}" tiene ${producto.stock} unidades en stock, precio: $${producto.price}, categoría: ${producto.category}.`
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

    // --- BUSQUEDA GENERAL POR NOMBRE O DESCRIPCIÓN ---
    if (/quiero|busco|tiene/i.test(lowerMsg)) {
      const productos = await buscarProductos(message);
      if (productos.length > 0) {
        const nombres = productos.map(p => p.name).join(", ");
        return res.json({ reply: `Encontré los siguientes productos: ${nombres}` });
      }
    }

    // --- CONSULTA AL MODELO EXTERNO ---
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [
          { role: "system", content: "Eres FrunaBot. Usa solo la información proporcionada de la base de datos, no inventes datos." },
          { role: "user", content: message }
        ],
      }),
    });

    // timeout de 30 segundos
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Tiempo de espera agotado al contactar el modelo.")), 30000)
    );

    const data = await Promise.race([response.json(), timeout]);
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

