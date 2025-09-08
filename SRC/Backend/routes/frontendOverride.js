// routes/frontendOverride.js
const fs = require("fs");
const path = require("path");
const express = require("express");

module.exports = function (app) {
  const exists = (p) => {
    try { return fs.existsSync(p); } catch { return false; }
  };

  // 🔎 Calcula la ruta base del proyecto: .../SRC
  // __dirname => .../SRC/Backend/routes
  const SRC_DIR = path.resolve(__dirname, "..", "..");
  let FRONTEND_DIR = path.join(SRC_DIR, "Frontend");

  // Por si alguien movió Frontend (fallback dentro de Backend)
  if (!exists(FRONTEND_DIR)) {
    const inside = path.join(__dirname, "..", "Frontend");
    if (exists(inside)) FRONTEND_DIR = inside;
  }

  console.log("[frontendOverride] SRC_DIR      =", SRC_DIR);
  console.log("[frontendOverride] FRONTEND_DIR =", FRONTEND_DIR, "exists?", exists(FRONTEND_DIR));

  // Si no existe, avisa y no montes nada (para no romper API)
  if (!exists(FRONTEND_DIR)) {
    console.warn("[frontendOverride] ⚠️ No se encontró la carpeta Frontend. " +
                 "Verifica la ruta: SRC/Frontend");
    return; // sigue sin servir estáticos, pero el backend funciona
  }

  // 🧱 Servir archivos estáticos (CSS/JS/IMG/…)
  // Cache agresivo para assets (no HTML). HTML se sirve con no-cache más abajo.
  app.use(express.static(FRONTEND_DIR, {
    etag: true,
    lastModified: true,
    index: false,                  // no servir index automáticamente
    setHeaders: (res, filePath) => {
      // No cachear HTML, cachear assets por 1h
      if (/\.(html?)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      } else {
        res.setHeader("Cache-Control", "public, max-age=3600, immutable");
      }
    },
  }));

  // Helper seguro para enviar HTML con fallback(s)
  function sendHtml(res, primary, alternatives = []) {
    const candidates = [primary, ...alternatives];
    for (const rel of candidates) {
      const full = path.join(FRONTEND_DIR, rel);
      if (exists(full)) {
        try {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
          return res.sendFile(full);
        } catch (err) {
          console.error("[frontendOverride] sendFile error:", err.message);
          return res.status(500).json({ error: "No se pudo enviar el HTML", file: rel });
        }
      }
    }
    console.warn("[frontendOverride] ❌ No se encontró ninguno de:", candidates, "en", FRONTEND_DIR);
    return res.status(404).json({ error: "Archivo no encontrado", searched: candidates, base: FRONTEND_DIR });
  }

  // 🌐 Rutas “páginas” (ajusta nombres según tus archivos reales en Frontend)
  app.get("/",           (_req, res) => sendHtml(res, "index.html", ["inicio.html"]));
  app.get("/login",      (_req, res) => sendHtml(res, "login_users.html", ["login.html", "index.html"]));
  app.get("/admin",      (_req, res) => sendHtml(res, "admin_controller.html", ["admin.html", "index.html"]));
  app.get("/contacto",   (_req, res) => sendHtml(res, "contacto.html", ["index.html"]));
  app.get("/productos",  (_req, res) => sendHtml(res, "productos.html", ["index.html"]));

  // 404 sólo para RUTAS WEB (cuando no matcheó nada anterior)
  app.use((req, res, next) => {
    // Si ya se respondió (API o estático), no entra aquí.
    // Si la petición acepta HTML, intenta devolver index.html como fallback (SPA) o 404 JSON.
    const accept = req.headers.accept || "";
    if (accept.includes("text/html")) {
      // SPA fallback opcional:
      const indexPath = path.join(FRONTEND_DIR, "index.html");
      if (exists(indexPath)) {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        return res.status(404).sendFile(indexPath);
      }
    }
    return res.status(404).json({ error: "Ruta no encontrada", path: req.path });
  });
};