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

### 👥 Admin 
- `GET /api/admin/dashboard` – Panel de control  
- `GET /api/admin/clientes` – Gestión de usuarios  
- `PATCH /api/admin/clientes/:id/desactivar` – Desactivar usuario  
- `POST /api/products` – Crear producto  
- `PUT /api/products/:id` – Actualizar producto  
- `DELETE /api/products/:id ` - Borrar producto 
---
# Documentación de Endpoints

## 1. Endpoints de Autenticación y Clientes (/api/clients)

| Método | Endpoint                     | Funcionalidad                                         | Autenticación (Middleware)                                  | Ejemplo de Respuesta Exitosa                      |
|--------|------------------------------|------------------------------------------------------|-----------------------------------------------------------|---------------------------------------------------|
| POST   | /api/clients/register        | Registro de un nuevo usuario.                        | Ninguna (strictLimiter)                                   | `{"success": true, "user": {...}}`                |
| POST   | /api/clients/login           | Inicio de sesión y obtención del JWT.               | Ninguna (strictLimiter)                                   | `{"success": true, "token": "...", "user": {...}}` |
| GET    | /api/clients/:id            | Obtener datos públicos de un cliente por ID.        | Requiere auth (el ID debe coincidir con el usuario logueado o ser admin) | `{"data": {"id": "C-123", "nombre": "Juanita"}}` |
| PUT    | /api/clients/:id            | Actualizar datos del perfil (nombre, teléfono, dirección). | Requiere auth (el ID debe coincidir con el usuario logueado o ser admin) | `{"data": {"nombre": "Nuevo Nombre", ...}}`      |

**Nota de Seguridad:** Las rutas de login/register usan `strictLimiter` para prevenir ataques de fuerza bruta.

## 2. Endpoints de Productos (/api/products)

| Método | Endpoint                     | Funcionalidad                                         | Autenticación (Middleware)                                  | Ejemplo de Respuesta Exitosa                      |
|--------|------------------------------|------------------------------------------------------|-----------------------------------------------------------|---------------------------------------------------|
| GET    | /api/products                | Obtener todos los productos disponibles.             | Ninguna                                                   | `{"data": [{id: 1, name: "Manzana"}, {...}]}`     |
| GET    | /api/products/:id            | Obtener el detalle de un producto por ID.            | Ninguna                                                   | `{"data": {id: 1, name: "Manzana", price: 4990}}` |

## 3. Endpoints de Carrito (/api/cart)

| Método | Endpoint                     | Funcionalidad                                         | Autenticación (Middleware)                                  | Ejemplo de Respuesta Exitosa                      |
|--------|------------------------------|------------------------------------------------------|-----------------------------------------------------------|---------------------------------------------------|
| GET    | /api/cart                    | Obtener el contenido del carrito del usuario logueado. | Requiere auth                                             | `{"data": [{productId: 5, quantity: 2}, {...}]}`  |
| POST   | /api/cart                    | Añadir/actualizar la cantidad de un producto en el carrito. | Requiere auth                                             | `{"data": {productId: 5, quantity: 3}}`           |
| POST   | /api/cart/checkout           | Finalizar la compra (iniciar el proceso de pago con Flow/Webpay). | Requiere auth                                             | `{"success": true, "redirect": "flow_url..."}`    |
| DELETE | /api/cart/:id                | Eliminar un ítem del carrito por ID de producto.    | Requiere auth                                             | `{"success": true}`                                |

## 4. Endpoints de Chatbot (/api/chatbot)

**En construcción. API Externa implementada**

| Método | Endpoint                     | Funcionalidad                                         | Autenticación (Middleware)                                  | Ejemplo de Respuesta Exitosa                      |
|--------|------------------------------|------------------------------------------------------|-----------------------------------------------------------|---------------------------------------------------|
| POST | /api/chat | Obtener y entregar informacion acerca de productos  | Ninguna                                                   | Texto  `{"El stock es: ... }` |

**Usabilidad ejemplo**

    import OpenAI from 'openai';
    const openai = new OpenAI({
     baseURL: "https://openrouter.ai/api/v1",
     apiKey: "<OPENROUTER_API_KEY>",
    defaultHeaders: {
        "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
        "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
    },
    });
    async function main() {
    const completion = await openai.chat.completions.create({
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [
        {
            "role": "user",
            "content": "What is the meaning of life?"
        }
        ],
        
    });

    console.log(completion.choices[0].message);
    }

    main();

## 5. Endpoints de Administración (/api/admin)

**Todas estas rutas requieren los privilegios más altos: auth y admin auth.**

| Método | Endpoint                     | Funcionalidad                                         | Ejemplo de Respuesta Exitosa                             |
|--------|------------------------------|------------------------------------------------------|----------------------------------------------------------|
| GET    | /api/admin/clientes          | Obtener la lista completa de clientes (sin hash de contraseña). | `{"data": [{id: "C-123", email: "..."}]}`               |
| GET    | /api/admin/dashboard          | Obtener estadísticas y métricas del dashboard.      | `{"metrics": {total_sales: 150, ...}}`                  |
| POST   | /api/products                | Crear un nuevo producto.                              | Requiere auth (Rol: admin)                               | `{"data": {id: 10, name: "Nuevo Producto", ...}}`  |
| PUT    | /api/products/:id            | Actualizar campos de un producto existente.          | Requiere auth (Rol: admin)                               | `{"data": {id: 1, price: 5990}}`                  |
| DELETE | /api/products/:id            | Eliminar un producto por ID.                          | Requiere auth (Rol: admin)                               | `{"success": true}`    |    