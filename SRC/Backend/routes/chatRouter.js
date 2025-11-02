const express = require("express");
const router = express.Router();

const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        // ⚠️ estos tres headers son necesarios ahora
        "HTTP-Referer": "http://localhost:3000", 
        "X-Title": "PROYECTO-DE-PROGRAMACION",
        "X-User-ID": "test-user", // 👈 agrega este (identifica el usuario)
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [
          { role: "system", content: "Eres FrunaBot, un asistente simpático que responde dudas sobre productos Fruna." },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter error:", data);
      return res.status(500).json({ reply: "Error al comunicarse con el modelo." });
    }

    const reply = data.choices?.[0]?.message?.content || "No se obtuvo respuesta del modelo.";
    res.json({ reply });
  } catch (error) {
    console.error("Error en /api/chat:", error);
    res.status(500).json({ reply: "Error interno del servidor." });
  }
});

module.exports = router;

