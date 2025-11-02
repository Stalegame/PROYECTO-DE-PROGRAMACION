const express = require("express");
const router = express.Router();
const { obtenerProducto } = require("../db/dbFunctions");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    // Detectar si el usuario pregunta por stock
    if (/stock/i.test(message)) {
      // Regex flexible para capturar nombres de productos
      const match = message.match(/stock(?: del| de| de la)?\s+([\w\s]+)/i);
      let nombreProducto = match ? match[1].trim() : null;

      // Limpiar signos de puntuación al final
      if (nombreProducto) {
        nombreProducto = nombreProducto.replace(/[?.!,]$/, "");
      }

      if (nombreProducto) {
        const producto = await obtenerProducto(nombreProducto);

        if (producto) {
          return res.json({
            reply: `El producto "${producto.name}" tiene ${producto.stock} unidades en stock, 
precio: $${producto.price}, categoría: ${producto.category}.`,
          });
        } else {
          return res.json({
            reply: `No encontré el producto "${nombreProducto}" en la base de datos.`,
          });
        }
      } else {
        return res.json({
          reply: "Por favor, dime el nombre del producto para consultar el stock.",
        });
      }
    }

    // Si no es consulta de stock, enviamos la pregunta al modelo
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [
          { role: "system", content: "Eres FrunaBot. Usa solo la información que se te proporciona de la base de datos." },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No se obtuvo respuesta del modelo.";
    res.json({ reply });

  } catch (error) {
    console.error("Error en /api/chat:", error);
    res.status(500).json({ reply: "Error interno del servidor." });
  }
});

module.exports = router;
