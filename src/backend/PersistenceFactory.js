// PersistenceFactory.js
const path = require("path");

// Repos Prisma
const productRepo = require("./repositories/productRepo.prisma");
const clientRepo  = require("./repositories/clientRepo.prisma");

// Repo JSON (carrito)
const JsonCartDAO = require(path.join(__dirname, "json", "JsonCartDAO"));

class PersistenceFactory {
  static getDAO(type) {
    const t = String(type).toLowerCase().trim();

    switch (t) {
      case "productos":
      case "products":
        return productRepo;

      case "clientes":
      case "clients":
        return clientRepo;

      case "cart":
        // el carrito es JSON, no Prisma
        return new JsonCartDAO();

      default:
        throw new Error(`DAO desconocido: ${type}`);
    }
  }

  static async initialize() {
    // Inicializa Prisma SOLO para productos y clientes
    const prisma = require("./db");
    try {
      await prisma.$connect();
      console.log("✅ Prisma conectado (productos y clientes)");
    } catch (err) {
      console.error("❌ Error conectando Prisma:", err.message);
    }

    // Inicializa JSON del carrito precreando archivo si no existe
    const fs = require("fs");
    const cartPath = path.join(__dirname, "data", "cart.json");

    if (!fs.existsSync(cartPath)) {
      fs.writeFileSync(cartPath, "[]");
      console.log("🛒 cart.json creado automáticamente.");
    }
  }
}

module.exports = PersistenceFactory;
