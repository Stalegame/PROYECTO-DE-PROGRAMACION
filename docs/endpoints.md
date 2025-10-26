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
| POST   | /api/products                | Crear un nuevo producto.                              | Requiere auth (Rol: admin)                               | `{"data": {id: 10, name: "Nuevo Producto", ...}}`  |
| PUT    | /api/products/:id            | Actualizar campos de un producto existente.          | Requiere auth (Rol: admin)                               | `{"data": {id: 1, price: 5990}}`                  |
| DELETE | /api/products/:id            | Eliminar un producto por ID.                          | Requiere auth (Rol: admin)                               | `{"success": true}`                                |

## 3. Endpoints de Carrito (/api/cart)

| Método | Endpoint                     | Funcionalidad                                         | Autenticación (Middleware)                                  | Ejemplo de Respuesta Exitosa                      |
|--------|------------------------------|------------------------------------------------------|-----------------------------------------------------------|---------------------------------------------------|
| GET    | /api/cart                    | Obtener el contenido del carrito del usuario logueado. | Requiere auth                                             | `{"data": [{productId: 5, quantity: 2}, {...}]}`  |
| POST   | /api/cart                    | Añadir/actualizar la cantidad de un producto en el carrito. | Requiere auth                                             | `{"data": {productId: 5, quantity: 3}}`           |
| POST   | /api/cart/checkout           | Finalizar la compra (iniciar el proceso de pago con Flow/Webpay). | Requiere auth                                             | `{"success": true, "redirect": "flow_url..."}`    |
| DELETE | /api/cart/:id                | Eliminar un ítem del carrito por ID de producto.    | Requiere auth                                             | `{"success": true}`                                |

## 4. Endpoints de Chatbot (/api/chatbot)

**En construcción. API Externa no implementada**

| Método | Endpoint                     | Funcionalidad                                         | Autenticación (Middleware)                                  | Ejemplo de Respuesta Exitosa                      |
|--------|------------------------------|------------------------------------------------------|-----------------------------------------------------------|---------------------------------------------------|
| ? | ??  | ???  | Ninguna                                                   | ???? |

## 5. Endpoints de Administración (/api/admin)

**Todas estas rutas requieren los privilegios más altos: auth y onlyAdminEmail (admin@fruna.cl).**

| Método | Endpoint                     | Funcionalidad                                         | Ejemplo de Respuesta Exitosa                             |
|--------|------------------------------|------------------------------------------------------|----------------------------------------------------------|
| GET    | /api/admin/clientes          | Obtener la lista completa de clientes (sin hash de contraseña). | `{"data": [{id: "C-123", email: "..."}]}`               |
| POST   | /api/admin/config/faqs       | Guardar/Actualizar las preguntas frecuentes (FAQs) del chatbot. | `{"success": true}`                                     |
| GET    | /api/admin/dashboard          | Obtener estadísticas y métricas del dashboard.      | `{"metrics": {total_sales: 150, ...}}`                  |
