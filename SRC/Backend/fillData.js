const fs = require("fs").promises;
const path = require("path");
const bcrypt = require("bcryptjs");

async function fillData() {
    try {
        // RUTA CORREGIDA: guardar en vscode/data/
        const dataDir = path.join(__dirname, "vscode", "data");
        
        console.log("📁 Llenando archivos de datos en:", dataDir);
        
        // Hashear contraseñas de forma segura
        const hashedPassword = await bcrypt.hash("password123", 10);
        const hashedAdminPassword = await bcrypt.hash("admin123", 10);

        // Datos de productos
        const products = [
            {
                "id": "1",
                "name": "Alfajor Clásico",
                "price": 1290,
                "stock": 45,
                "category": "Alfajores",
                "description": "Alfajor tradicional con dulce de leche y coco",
                "image": "alfajor-clasico.jpg",
                "active": true
            },
            {
                "id": "2", 
                "name": "Chocolate con Maní",
                "price": 2490,
                "stock": 32,
                "category": "Chocolates",
                "description": "Chocolate negro con maní crocante",
                "image": "chocolate-mani.jpg",
                "active": true
            },
            {
                "id": "3",
                "name": "Galletas de Vainilla",
                "price": 890,
                "stock": 67,
                "category": "Galletas",
                "description": "Galletas crujientes de vainilla",
                "image": "galletas-vainilla.jpg",
                "active": true
            },
            {
                "id": "4",
                "name": "Mani Salado",
                "price": 790,
                "stock": 88,
                "category": "Snacks",
                "description": "Maní tostado y salado",
                "image": "mani-salado.jpg",
                "active": true
            },
            {
                "id": "5",
                "name": "Barra de Cereal",
                "price": 690,
                "stock": 56,
                "category": "Barras",
                "description": "Barra de cereal con miel y avena",
                "image": "barra-cereal.jpg",
                "active": true
            }
        ];

        // Datos de clientes (CON CONTRASEÑAS HASHEADAS)
        const clients = [
            {
                "id": "1",
                "nombre": "María González",
                "email": "maria@email.com",
                "password": hashedPassword,
                "telefono": "+56912345678",
                "direccion": "Av. Principal 123, Santiago",
                "fechaRegistro": new Date().toISOString(),
                "activo": true,
                "role": "client",
                "ultimaActualizacion": new Date().toISOString()
            },
            {
                "id": "2",
                "nombre": "Admin Fruna",
                "email": "admin@fruna.com",
                "password": hashedAdminPassword,
                "telefono": "+56987654321",
                "direccion": "Calle Admin 456, Oficina Central",
                "fechaRegistro": new Date().toISOString(),
                "activo": true,
                "role": "admin",
                "ultimaActualizacion": new Date().toISOString()
            },
            {
                "id": "3",
                "nombre": "Carlos López",
                "email": "carlos@email.com",
                "password": hashedPassword,
                "telefono": "+56955555555",
                "direccion": "Av. Libertador 789, Viña del Mar",
                "fechaRegistro": new Date().toISOString(),
                "activo": true,
                "role": "client",
                "ultimaActualizacion": new Date().toISOString()
            },
            {
                "id": "4",
                "nombre": "Ana Martínez",
                "email": "ana@email.com",
                "password": hashedPassword,
                "telefono": "+56944444444",
                "direccion": "Calle Flores 321, Concepción",
                "fechaRegistro": new Date().toISOString(),
                "activo": true,
                "role": "client",
                "ultimaActualizacion": new Date().toISOString()
            }
        ];

        // Datos de chatbot
        const chatbot = [
            {
                "id": "1",
                "pregunta": "¿Qué horario de atención tienen?",
                "respuesta": "Atendemos de lunes a domingo de 8:00 a 22:00 hrs.",
                "categoria": "horarios",
                "fechaCreacion": new Date().toISOString()
            },
            {
                "id": "2",
                "pregunta": "¿Hacen entregas a domicilio?",
                "respuesta": "Sí, realizamos entregas con un costo adicional según la zona.",
                "categoria": "entregas",
                "fechaCreacion": new Date().toISOString()
            },
            {
                "id": "3",
                "pregunta": "¿Aceptan tarjetas de crédito?",
                "respuesta": "Sí, aceptamos todas las tarjetas de crédito y débito principales.",
                "categoria": "pagos",
                "fechaCreacion": new Date().toISOString()
            },
            {
                "id": "4",
                "pregunta": "¿Dónde están ubicados?",
                "respuesta": "Tenemos múltiples locales en Santiago y regiones. Consulta nuestra página de contactos.",
                "categoria": "ubicacion",
                "fechaCreacion": new Date().toISOString()
            },
            {
                "id": "5",
                "pregunta": "¿Tienen productos sin azúcar?",
                "respuesta": "Sí, contamos con una línea de productos sin azúcar añadida.",
                "categoria": "productos",
                "fechaCreacion": new Date().toISOString()
            }
        ];

        // Datos de FAQs
        const faqs = [
            {
                "id": "1",
                "pregunta": "¿Cómo realizo un pedido?",
                "respuesta": "Puedes hacer tu pedido a través de nuestra web, por teléfono o visitando nuestra tienda física.",
                "categoria": "pedidos",
                "fechaCreacion": new Date().toISOString()
            },
            {
                "id": "2", 
                "pregunta": "¿Cuánto tarda la entrega?",
                "respuesta": "El tiempo de entrega depende de tu ubicación, generalmente entre 1-3 días hábiles.",
                "categoria": "entregas",
                "fechaCreacion": new Date().toISOString()
            },
            {
                "id": "3",
                "pregunta": "¿Puedo cambiar o devolver un producto?",
                "respuesta": "Sí, aceptamos cambios y devoluciones dentro de los 7 días posteriores a la compra.",
                "categoria": "devoluciones",
                "fechaCreacion": new Date().toISOString()
            },
            {
                "id": "4",
                "pregunta": "¿Ofrecen descuentos por cantidad?",
                "respuesta": "Sí, tenemos descuentos especiales para compras al por mayor.",
                "categoria": "descuentos",
                "fechaCreacion": new Date().toISOString()
            }
        ];

        // Crear directorio vscode/data si no existe
        await fs.mkdir(dataDir, { recursive: true });

        // Escribir datos en los archivos (en vscode/data/)
        await fs.writeFile(path.join(dataDir, "productos.json"), JSON.stringify(products, null, 2));
        await fs.writeFile(path.join(dataDir, "clientes.json"), JSON.stringify(clients, null, 2));
        await fs.writeFile(path.join(dataDir, "conversaciones-chatbot.json"), JSON.stringify(chatbot, null, 2));
        await fs.writeFile(path.join(dataDir, "faqs-chatbot.json"), JSON.stringify(faqs, null, 2));

        console.log("✅ Datos de prueba creados exitosamente en vscode/data/");
        console.log("📦 Productos: " + products.length + " items");
        console.log("👥 Clientes: " + clients.length + " items (contraseñas hasheadas)");
        console.log("🤖 Chatbot: " + chatbot.length + " conversaciones");
        console.log("❓ FAQs: " + faqs.length + " preguntas frecuentes");
        console.log("\n🔐 Credenciales de prueba:");
        console.log("   Usuario: maria@email.com / password123");
        console.log("   Admin: admin@fruna.com / admin123");
        console.log("   Usuario 2: carlos@email.com / password123");
        console.log("   Usuario 3: ana@email.com / password123");

    } catch (error) {
        console.error("❌ Error creando datos:", error);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    fillData();
}

module.exports = fillData;