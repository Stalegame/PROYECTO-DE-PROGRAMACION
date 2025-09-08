const fs = require("fs");
const path = require("path");
const express = require("express");

module.exports = function(app){
  const exists = (p) => { try { return fs.existsSync(p); } catch { return false; } };

  // 🔧 TU FRONTEND ESTÁ EN SRC/Frontend (dos niveles arriba de /routes)
  let FRONTEND_DIR = path.join(__dirname, "..", "..", "Frontend");
  console.log("[frontendOverride] FRONTEND_DIR =", FRONTEND_DIR, "exists?", exists(FRONTEND_DIR));

  // fallback por si alguien lo moviera dentro de Backend (no es tu caso)
  if (!exists(FRONTEND_DIR)) {
    const inside = path.join(__dirname, "..", "Frontend");
    if (exists(inside)) FRONTEND_DIR = inside;
  }

  // Servir archivos estáticos (css/js/img)
  if (exists(FRONTEND_DIR)) {
    app.use(express.static(FRONTEND_DIR));
  }

  // Helper para enviar html + alternativa
  function send(res, name, alt=[]){
    const candidates = [name, ...alt];
    for (const n of candidates){
      const full = path.join(FRONTEND_DIR, n);
      if (exists(full)) return res.sendFile(full);
    }
    console.warn("[frontendOverride] No se encontró ninguno de:", candidates, "en", FRONTEND_DIR);
    res.status(404).json({ error: "Archivo no encontrado", searched: candidates, base: FRONTEND_DIR });
  }

  // Rutas con tus nombres REALES
  app.get("/",          (req,res)=> send(res, "index.html"));
  app.get("/login",     (req,res)=> send(res, "login_users.html", ["login.html", "index.html"]));
  app.get("/admin",     (req,res)=> send(res, "admin_controller.html", ["admin.html", "index.html"]));
  app.get("/contacto",  (req,res)=> send(res, "contacto.html", ["index.html"]));
  app.get("/productos", (req,res)=> send(res, "productos.html", ["index.html"]));
};
