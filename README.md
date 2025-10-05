# Proyecto fruna -- PROYECTO DE PROGRAMACION
----------------------- 
Proyecto Fruna - Gestion de Productos y Contactos

El "Proyecto Fruna" es una plataforma web destinada a gestionar productos y clientes frecuentes para un supermercado ficticio. El sistema, basado en una arquitectura por capas, se conectará a una base de datos para asegurar el almacenamiento seguro y eficiente de la información. El proyecto se desarrollará en fases, comenzando con una implementación básica que se irá mejorando con el tiempo.

## Caracteristicas principales
- Interfaz de usuario intuitiva para comprar productos.
- Gestión de carritos de compra.
- Registro e historial de compras.
- Integración con base de datos para almacenar productos, contraseñas y transacciones.
- Backend con API para comunicacioón entre frontend y base de datos.
  
## Tecnologias previstas
- **Frontend:** HTML, CSS, JavaSript
- **Base de datos:** SQLite / MongoDB
- **Backend:** Node.js, persistencia inicial en JSON, migración posterior a SQLITE, variables de entorno (.env)

## Objetivo
Desarrollar una solución web completa para simular un sistema de compras en línea para el supermercado Fruna. El sistema incluirá la gestión de un catálogo de productos, con funcionalidades de lectura, inserción y actualización de datos, y la integración con una API externa que proporcionará información nutricional. Además, esta API contará con un chatbot interactivo, donde los usuarios podrán realizar consultas y recibir respuestas automáticas de manera ágil.

## 📊 API Endpoints
- ** 🔐 Autenticación**
POST /api/clients/login - Inicio de sesión

POST /api/clients/register - Registro de usuarios

- **🛒 Carrito de Compras**
GET /api/cart - Obtener carrito

POST /api/cart - Agregar producto

DELETE /api/cart/:id - Eliminar producto

POST /api/cart/checkout - Finalizar compra

- **📦 Productos**
GET /api/products - Listar productos

GET /api/products/:id - Detalle de producto

POST /api/products - Crear producto (Admin)

PUT /api/products/:id - Actualizar producto (Admin)

- **👥 Administración**
GET /api/admin/dashboard - Panel de control

GET /api/admin/clientes - Gestión de usuarios

PATCH /api/admin/clientes/:id/desactivar - Desactivar usuario

##🎨 Paleta de Colores FRUNA

- **🎨 Paleta de Colores FRUNA**
Colores Principales de la Marca
- **🎯 Colores Primarios**

Rojo FRUNA	#E31837	<div style="background:#E31837; width:50px; height:20px; border:1px solid #000"></div>	Botones principales, precios, elementos importantes
Amarillo FRUNA	#FFD100	<div style="background:#FFD100; width:50px; height:20px; border:1px solid #000"></div>	Acentos, highlights, llamadas a la acción
Marrón Chocolate	#8B4513	<div style="background:#8B4513; width:50px; height:20px; border:1px solid #000"></div>

- **🔄 Colores Secundarios**

Rojo Oscuro	#C1122D	<div style="background:#C1122D; width:50px; height:20px; border:1px solid #000"></div>	Hover states, botones activos
Amarillo Claro	#FFE34D	<div style="background:#FFE34D; width:50px; height:20px; border:1px solid #000"></div>	Fondos claros, highlights suaves
Marrón Claro	#A0522D	<div style="background:#A0522D; width:50px; height:20px; border:1px solid #000"></div>

- **⚫️ Colores Neutros**

Blanco	#FFFFFF	<div style="background:#FFFFFF; width:50px; height:20px; border:1px solid #000"></div>	Fondos, textos sobre colores oscuros
Negro	#000000	<div style="background:#000000; width:50px; height:20px; border:1px solid #000"></div>	Textos principales, títulos
Gris Claro	#F5F5F5	<div style="background:#F5F5F5; width:50px; height:20px; border:1px solid #000"></div>	Fondos secundarios
Gris Medio	#666666	<div style="background:#666666; width:50px; height:20px; border:1px solid #000"></div>	Textos secundarios
Gris Oscuro	#333333	<div style="background:#333333; width:50px; height:20px; border:1px solid #000"></div>	Textos sobre fondos claros

- **🏷️ Colores por Categoría de Productos**

Alfajores	#FFD700	<div style="background:#FFD700; width:50px; height:20px; border:1px solid #000"></div>	Etiquetas, badges de categoría
Chocolate	#8B4513	<div style="background:#8B4513; width:50px; height:20px; border:1px solid #000"></div>	Productos de chocolate
Snacks	#FF8C00	<div style="background:#FF8C00; width:50px; height:20px; border:1px solid #000"></div>	Snacks y aperitivos
Helados	#87CEEB	<div style="background:#87CEEB; width:50px; height:20px; border:1px solid #000"></div>	Productos congelados
Bebidas	#32CD32	<div style="background:#32CD32; width:50px; height:20px; border:1px solid #000"></div>	Bebidas y líquidos
Ofertas	#FF0000	<div style="background:#FF0000; width:50px; height:20px; border:1px solid #000"></div>	Promociones y descuentos
Novedades	#9370DB	<div style="background:#9370DB; width:50px; height:20px; border:1px solid #000"></div>	Productos nuevos

- **🌈 Gradientes**

Gradiente Principal	linear-gradient(135deg, #E31837 0%, #FFD100 100%)	<div style="background:linear-gradient(135deg, #E31837 0%, #FFD100 100%); width:100px; height:30px; border:1px solid #000"></div>
Gradiente Botones	linear-gradient(45deg, #E31837, #C1122D)	<div style="background:linear-gradient(45deg, #E31837, #C1122D); width:100px; height:30px;

## 👥 Integrantes y Roles
- **🧑‍💻 Thomas Aranguiz** **[@Stalegame](https://github.com/Stalegame)** – Líder Técnico -> Backend
- **🎨 Patricio Muñoz** **[@patriciomunozzz](https://github.com/patriciomunozzz)**– Frontend  -> Líder Técnico
- **⚙️ Angela Muñoz** **[@MeruAngel](https://github.com/MeruAngel)** – Backend  -> QA & Documentación 
- **📝 Amira Casanova** **[@amiracasanova](https://github.com/amiracasanova)** – QA & Documentación -> Frontend
  
## 📌 Enlaces
- **Repositorio:** [🔗 GitHub Proyecto Fruna](https://github.com/Stalegame/PROYECTO-DE-PROGRAMACION)
- **Tablero Kanban:** [🔗 Proyecto Fruna – Kanban](https://trello.com/invite/b/689ccd69233da4f45016f66b/ATTI3a846a1aa484032cb15c2812a627865b229B87B7/proyecto-fruna)



