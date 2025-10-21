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
