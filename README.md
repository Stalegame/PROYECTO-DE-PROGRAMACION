# 🏪 Proyecto Fruna — PROYECTO DE PROGRAMACIÓN

## 🧾 Descripción General

**Proyecto Fruna – Gestión de Productos y Contactos**

El **Proyecto Fruna** es una plataforma web destinada a gestionar productos y clientes frecuentes para un supermercado ficticio.  
El sistema, basado en una **arquitectura por capas**, se conectará a una base de datos para asegurar el almacenamiento seguro y eficiente de la información.  

El proyecto se desarrollará en **fases**, comenzando con una implementación básica que se irá mejorando progresivamente.

---

## 🚀 Características Principales

- Interfaz de usuario intuitiva para la compra de productos.  
- Gestión de carritos de compra.  
- Registro e historial de compras.  
- Integración con base de datos para almacenar productos, contraseñas y transacciones.  
- Backend con API para la comunicación entre el frontend y la base de datos.

---

## 🧩 Tecnologías Previstas

- **Frontend:** HTML, CSS, JavaScript  
- **Base de Datos:** SQLite / MongoDB  
- **Backend:** Node.js, persistencia inicial en JSON y migración posterior a SQLite, con uso de variables de entorno (.env)

---

## 🎯 Objetivo

Desarrollar una **solución web completa** para simular un sistema de compras en línea para el supermercado **Fruna**.  

El sistema incluirá la gestión de un catálogo de productos con funcionalidades de lectura, inserción y actualización de datos, además de la integración con una **API externa** que proporcionará información nutricional.  

Esta API contará con un **chatbot interactivo**, permitiendo a los usuarios realizar consultas y recibir respuestas automáticas de manera ágil.

---

## 📊 API Endpoints

### 🔐 Autenticación
- `POST /api/clients/login` – Inicio de sesión  
- `POST /api/clients/register` – Registro de usuarios  

### 🛒 Carrito de Compras
- `GET /api/cart` – Obtener carrito  
- `POST /api/cart` – Agregar producto  
- `DELETE /api/cart/:id` – Eliminar producto  
- `POST /api/cart/checkout` – Finalizar compra  

### 📦 Productos
- `GET /api/products` – Listar productos  
- `GET /api/products/:id` – Detalle de producto  
- `POST /api/products` – Crear producto (Admin)  
- `PUT /api/products/:id` – Actualizar producto (Admin)  

### 👥 Administración
- `GET /api/admin/dashboard` – Panel de control  
- `GET /api/admin/clientes` – Gestión de usuarios  
- `PATCH /api/admin/clientes/:id/desactivar` – Desactivar usuario  

---

## 🎨 Paleta de Colores FRUNA

### 🎯 Colores Primarios

| Nombre | Código | Uso |
|--------|---------|-----|
| **Rojo FRUNA** | `#E31837` | Botones principales, precios, elementos importantes |
| **Amarillo FRUNA** | `#FFD100` | Acentos, highlights, llamadas a la acción |
| **Marrón Chocolate** | `#8B4513` | — |

---

### 🔄 Colores Secundarios

| Nombre | Código | Uso |
|--------|---------|-----|
| **Rojo Oscuro** | `#C1122D` | Hover states, botones activos |
| **Amarillo Claro** | `#FFE34D` | Fondos claros, highlights suaves |
| **Marrón Claro** | `#A0522D` | — |

---

### ⚫️ Colores Neutros

| Nombre | Código | Uso |
|--------|---------|-----|
| **Blanco** | `#FFFFFF` | Fondos, textos sobre colores oscuros |
| **Negro** | `#000000` | Textos principales, títulos |
| **Gris Claro** | `#F5F5F5` | Fondos secundarios |
| **Gris Medio** | `#666666` | Textos secundarios |
| **Gris Oscuro** | `#333333` | Textos sobre fondos claros |

---

### 🏷️ Colores por Categoría de Productos

| Categoría | Código | Uso |
|------------|---------|-----|
| **Alfajores** | `#FFD700` | Etiquetas, badges de categoría |
| **Chocolate** | `#8B4513` | Productos de chocolate |
| **Snacks** | `#FF8C00` | Snacks y aperitivos |
| **Helados** | `#87CEEB` | Productos congelados |
| **Bebidas** | `#32CD32` | Bebidas y líquidos |
| **Ofertas** | `#FF0000` | Promociones y descuentos |
| **Novedades** | `#9370DB` | Productos nuevos |

---

### 🌈 Gradientes

| Tipo | Descripción |
|------|--------------|
| **Gradiente Principal** | `linear-gradient(135deg, #E31837 0%, #FFD100 100%)` |
| **Gradiente Botones** | `linear-gradient(45deg, #E31837, #C1122D)` |

---

## 👥 Integrantes y Roles

- **🧑‍💻 Thomas Aranguiz** – [@Stalegame](https://github.com/Stalegame)  
  *Líder Técnico → Backend*

- **🎨 Patricio Muñoz** – [@patriciomunozzz](https://github.com/patriciomunozzz)  
  *Frontend → Líder Técnico*

- **⚙️ Angela Muñoz** – [@MeruAngel](https://github.com/MeruAngel)  
  *Backend → QA & Documentación*

- **📝 Amira Casanova** – [@amiracasanova](https://github.com/amiracasanova)  
  *QA & Documentación → Frontend*

---

## 📌 Enlaces

- **Repositorio:** [🔗 GitHub Proyecto Fruna](https://github.com/Stalegame/PROYECTO-DE-PROGRAMACION)  
- **Tablero Kanban:** [🔗 Proyecto Fruna – Kanban](https://trello.com/invite/b/689ccd69233da4f45016f66b/ATTI3a846a1aa484032cb15c2812a627865b229B87B7/proyecto-fruna)

---
