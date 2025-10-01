// routes/frontendOverride.js
const fs = require("fs");
const path = require("path");
const express = require("express");

module.exports = function (app) {
  // Función para verificar si una carpeta o archivo existe
  const exists = (p) => {
    try { 
      return fs.existsSync(p); 
    } catch { 
      return false; 
    }
  };

  // Busca dónde está la carpeta Frontend
  // Partimos desde esta carpeta (routes) y subimos dos niveles para llegar a SRC
  const SRC_DIR = path.resolve(__dirname, "..", "..");
  let FRONTEND_DIR = path.join(SRC_DIR, "Frontend");

  // Por si la carpeta Frontend está en otro lugar (fallback)
  if (!exists(FRONTEND_DIR)) {
    const dentroDeBackend = path.join(__dirname, "..", "Frontend");
    if (exists(dentroDeBackend)) FRONTEND_DIR = dentroDeBackend;
  }

  console.log("[frontendOverride] Buscando en SRC_DIR:", SRC_DIR);
  console.log("[frontendOverride] Carpeta Frontend encontrada en:", FRONTEND_DIR, "¿Existe?", exists(FRONTEND_DIR));

  // Si no encontramos la carpeta Frontend, avisamos pero no rompemos todo (se inluyo hace poco, para que no se caiga todo el backend si no está)
  if (!exists(FRONTEND_DIR)) {
    console.warn("[frontendOverride] ⚠️ ¡Cuidado! No encontramos la carpeta Frontend. " +
                 "Revisa que esté en: SRC/Frontend");
    return; // El backend sigue funcionando para las APIs, pero no servirá páginas web
  }

  // Servimos los archivos estáticos (CSS, JavaScript, imágenes, etc.)
  app.use(express.static(FRONTEND_DIR, {
    etag: true,
    lastModified: true,
    index: false,                  // No servir index.html automáticamente
    setHeaders: (res, filePath) => {
      // Las páginas HTML no se cachean (siempre se piden al servidor)
      if (/\.(html?)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      } else {
        // Los otros archivos (CSS, JS, imágenes) se cachean por 1 hora
        res.setHeader("Cache-Control", "public, max-age=3600, immutable");
      }
    },
  }));

  // Función para enviar páginas HTML
  function sendHtml(res, paginaPrincipal, alternativas = []) {
    // Lista de páginas a intentar, en orden de prioridad
    const opciones = [paginaPrincipal, ...alternativas];
    
    for (const nombreArchivo of opciones) {
      const rutaCompleta = path.join(FRONTEND_DIR, nombreArchivo);
      if (exists(rutaCompleta)) {
        try {
          // Las páginas HTML nunca se cachean
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
          return res.sendFile(rutaCompleta);
        } catch (err) {
          console.error("[frontendOverride] Error al enviar archivo:", err.message);
          return res.status(500).json({ error: "No pudimos cargar la página", archivo: nombreArchivo });
        }
      }
    }
    
    // Si no encontramos ninguna de las opciones
    console.warn("[frontendOverride] ❌ No encontramos ninguna de estas páginas:", opciones, "en", FRONTEND_DIR);
    return res.status(404).json({ 
      error: "Página no encontrada", 
      buscadas: opciones, 
      carpeta: FRONTEND_DIR 
    });
  }

  // rutas páginas web

  // Página principal
  app.get("/", (_req, res) => sendHtml(res, "index.html", ["inicio.html"]));
  
  // Página de login (intenta login_users.html primero, luego login.html, luego index.html)
  app.get("/login", (_req, res) => sendHtml(res, "login_users.html", ["login.html", "index.html"]));
  
  // Panel de administración
  app.get("/admin", (_req, res) => sendHtml(res, "admin_controller.html", ["admin.html", "index.html"]));
  
  // Página de contacto
  app.get("/contacto", (_req, res) => sendHtml(res, "contacto.html", ["index.html"]));
  
  // Página de productos
  app.get("/productos", (_req, res) => sendHtml(res, "productos.html", ["index.html"]));

  // 🚫 Manejo de páginas no encontradas (404)
  app.use((req, res, next) => {
    // Si la petición viene de un navegador 
    const accept = req.headers.accept || "";
    if (accept.includes("text/html")) {
      // Intenta mostrar index.html como última opción (para aplicaciones de una sola página)
      const indexPath = path.join(FRONTEND_DIR, "index.html");
      if (exists(indexPath)) {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        return res.status(404).sendFile(indexPath);
      }
    }
    // Si no es un navegador o no tenemos index.html, devolvemos error JSON
    return res.status(404).json({ 
      error: "Esta ruta no existe", 
      path: req.path 
    });
  });
};