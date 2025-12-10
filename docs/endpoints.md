## 📊 API Endpoints

### 🔐 Autenticación
- `POST /api/clients/login` – Inicio de sesión  
- `POST /api/clients/register` – Registro de usuarios  

### 🛒 Carrito de Compras
- `GET /api/cart/:userId` – Obtener carrito del usuario  
- `POST /api/cart/add` – Agregar producto al carrito  
- `PUT /api/cart/update/:userId/:productId` – Actualizar cantidad  
- `DELETE /api/cart/remove/:userId/:productId` – Eliminar producto  
- `DELETE /api/cart/clear/:userId` – Vaciar carrito completo  

### 📦 Productos
- `GET /api/products` – Listar todos los productos  
- `GET /api/products/:id` – Detalle de producto específico  
- `GET /api/products/famous` – Obtener productos destacados  
- `GET /api/products/search` – Buscar productos por nombre o categoría  

### 🛍️ Órdenes de Compra
- `POST /api/orders/create` – Crear orden y pago con PayPal  
- `POST /api/orders/capture` – Capturar pago de PayPal  
- `GET /api/orders/:orderId` – Obtener detalles de una orden  

### 🤖 Chatbot
- `POST /api/chat` – Enviar mensaje al chatbot con IA  

### 👥 Admin 
- `GET /api/admin/dashboard` – Panel de control administrativo  
- `GET /api/admin/users` – Listar todos los usuarios  
- `GET /api/admin/orders` – Listar todas las órdenes  
- `PUT /api/admin/users/:id/suspend` – Suspender usuario  
- `PUT /api/admin/users/:id/unsuspend` – Reactivar usuario  
- `DELETE /api/admin/users/:id` – Eliminar usuario permanentemente  
- `DELETE /api/admin/orders/:id` – Eliminar orden  
- `POST /api/admin/products` – Crear producto  
- `PUT /api/admin/products/:id` – Actualizar producto  
- `DELETE /api/admin/products/:id` – Borrar producto 
---
# Documentación de Endpoints

## 1. Endpoints de Autenticación y Clientes (/api/clients)

| Método | Endpoint                     | Funcionalidad                                         | Autenticación (Middleware)                                  | Ejemplo de Respuesta Exitosa                      |
|--------|------------------------------|------------------------------------------------------|-----------------------------------------------------------|---------------------------------------------------|
| POST   | /api/clients/register        | Registro de un nuevo usuario.                        | Ninguna (strictLimiter)                                   | `{"success": true, "user": {...}}`                |
| POST   | /api/clients/login           | Inicio de sesión y obtención del JWT.               | Ninguna (strictLimiter)                                   | `{"success": true, "token": "...", "user": {...}}` |
| GET    | /api/clients/:id            | Obtener datos públicos de un cliente por ID.        | Requiere auth (el ID debe coincidir con el usuario logueado o ser admin) | `{"data": {"id": "C-123", "nombre": "Juanita"}}` |
| PUT    | /api/clients/:id            | Actualizar datos del perfil (nombre, teléfono, dirección). | Requiere auth (el ID debe coincidir con el usuario logueado o ser admin) | `{"data": {"nombre": "Nuevo Nombre", ...}}`      |
| POST   | /api/clients/:id/desactivar | Desactivar la propia cuenta (requiere confirmar contraseña). | Requiere auth (solo el propio usuario) | `{"success": true, "message": "Usuario desactivado"}` |

**Nota de Seguridad:** Las rutas de login/register usan `strictLimiter` para prevenir ataques de fuerza bruta.

## 2. Endpoints de Productos (/api/products)

| Método | Endpoint                     | Funcionalidad                                         | Autenticación (Middleware)                                  | Ejemplo de Respuesta Exitosa                      |
|--------|------------------------------|------------------------------------------------------|-----------------------------------------------------------|---------------------------------------------------|
| GET    | /api/products                | Obtener todos los productos disponibles.             | Ninguna                                                   | `{"data": [{id: 1, name: "Manzana"}, {...}]}`     |
| GET    | /api/products/:id            | Obtener el detalle de un producto por ID.            | Ninguna                                                   | `{"data": {id: 1, name: "Manzana", price: 4990}}` |
| GET    | /api/products/famous         | Obtener productos marcados como destacados.          | Ninguna                                                   | `{"data": [{id: 2, name: "Alfajor", famous: true}]}` |
| GET    | /api/products/search?q=texto | Buscar productos por nombre o categoría.             | Ninguna                                                   | `{"data": [{id: 3, name: "Chocolate"}]}`         |

## 3. Endpoints de Carrito (/api/cart)

| Método | Endpoint                              | Funcionalidad                                         | Autenticación (Middleware)                                  | Ejemplo de Respuesta Exitosa                      |
|--------|---------------------------------------|------------------------------------------------------|-----------------------------------------------------------|---------------------------------------------------|
| GET    | /api/cart/:userId                     | Obtener el contenido del carrito del usuario.       | Ninguna                                                   | `{"ok": true, "data": {userId: "123", items: []}}` |
| POST   | /api/cart/add                         | Añadir producto al carrito con cantidad específica. | Ninguna                                                   | `{"ok": true, "msg": "Producto agregado"}`       |
| PUT    | /api/cart/update/:userId/:productId   | Actualizar la cantidad de un producto.               | Ninguna                                                   | `{"ok": true, "data": {...}}`                    |
| DELETE | /api/cart/remove/:userId/:productId   | Eliminar un producto específico del carrito.         | Ninguna                                                   | `{"ok": true, "msg": "Producto eliminado"}`     |
| DELETE | /api/cart/clear/:userId               | Vaciar completamente el carrito del usuario.         | Ninguna                                                   | `{"ok": true, "msg": "Carrito vaciado"}`        |

## 4. Endpoints de Órdenes (/api/orders)

| Método | Endpoint                     | Funcionalidad                                         | Autenticación (Middleware)                                  | Ejemplo de Respuesta Exitosa                      |
|--------|------------------------------|------------------------------------------------------|-----------------------------------------------------------|---------------------------------------------------|
| POST   | /api/orders/create           | Crear orden de compra y generar pago con PayPal.    | Requiere auth                                             | `{"orderId": "...", "approvalLink": "https://..."}` |
| POST   | /api/orders/capture          | Capturar y confirmar el pago realizado en PayPal.   | Requiere auth                                             | `{"success": true, "order": {...}}`             |
| GET    | /api/orders/:orderId         | Obtener detalles de una orden específica.           | Requiere auth (debe ser del usuario o admin)              | `{"success": true, "data": {...}}`              |

**Nota:** El sistema utiliza PayPal Sandbox para desarrollo y PayPal Production para producción. Los pagos se procesan en USD con conversión automática desde CLP.

## 5. Endpoints de Chatbot (/api/chat)

**API Externa implementada con OpenRouter (DeepSeek)**

| Método | Endpoint                     | Funcionalidad                                         | Autenticación (Middleware)                                  | Ejemplo de Respuesta Exitosa                      |
|--------|------------------------------|------------------------------------------------------|-----------------------------------------------------------|---------------------------------------------------|
| POST   | /api/chat                    | Enviar mensaje al chatbot para consultas.            | Ninguna                                                   | `{"reply": "El producto X tiene 45 unidades..."}` |

**Funcionalidades del Chatbot:**
- Consultar stock de productos
- Verificar disponibilidad
- Listar productos por categoría
- Buscar productos por rango de precio
- Búsqueda general de productos
- Consultas generales usando modelo DeepSeek vía OpenRouter

**Configuración:** Requiere variable de entorno `OPENROUTER_API_KEY` en el archivo `.env`

**Ejemplo de uso:**
```json
POST /api/chat
{
  "message": "¿Cuál es el stock del Alfajor Clásico?"
}
```

## 6. Endpoints de Administración (/api/admin)

**Todas estas rutas requieren autenticación y rol ADMIN.**

| Método | Endpoint                          | Funcionalidad                                         | Ejemplo de Respuesta Exitosa                             |
|--------|-----------------------------------|------------------------------------------------------|----------------------------------------------------------|
| GET    | /api/admin/dashboard              | Obtener estadísticas y métricas del panel administrativo. | `{"success": true, "data": {...}}`                    |
| GET    | /api/admin/users                  | Obtener lista completa de usuarios registrados.      | `{"success": true, "data": [{id: "C-123"}]}`        |
| GET    | /api/admin/orders                 | Obtener lista de todas las órdenes del sistema.      | `{"success": true, "data": [{id: "O-456"}]}`        |
| PUT    | /api/admin/users/:id/suspend      | Suspender cuenta de un usuario (active = false).     | `{"success": true, "message": "Usuario suspendido"}` |
| PUT    | /api/admin/users/:id/unsuspend    | Reactivar cuenta de un usuario (active = true).      | `{"success": true, "message": "Usuario reactivado"}` |
| DELETE | /api/admin/users/:id              | Eliminar permanentemente un usuario del sistema.     | `{"success": true, "message": "Usuario eliminado"}` |
| DELETE | /api/admin/orders/:id             | Eliminar una orden del sistema.                      | `{"success": true, "message": "Pedido eliminado"}`  |
| POST   | /api/admin/products               | Crear un nuevo producto en el catálogo.              | `{"success": true, "data": {id: 10, name: "..."}}` |
| PUT    | /api/admin/products/:id           | Actualizar información de un producto existente.     | `{"success": true, "data": {id: 1, price: 5990}}`   |
| DELETE | /api/admin/products/:id           | Eliminar un producto del catálogo.                   | `{"success": true, "message": "Producto eliminado"}` |    