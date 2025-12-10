# 📄 Documentación de APIs — Proyecto Fruna

Este documento detalla todas las interfaces de programación (APIs) utilizadas en el proyecto FRUNA, incluyendo las rutas internas del backend y las APIs externas planificadas.

---

## 📌 APIs Internas del Backend

### Base URL
- **Desarrollo**: `http://localhost:3000/api`
- **Producción**: Configurar según deployment

### Autenticación
La mayoría de las rutas protegidas requieren un token JWT en el header:
```
Authorization: Bearer {token}
```

---

## 🔐 Autenticación y Clientes (`/api/clients`)

### POST `/api/clients/login`
Iniciar sesión de usuario.

**Body**:
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "¡Bienvenido! Has iniciado sesión correctamente",
  "user": {
    "id": "abc123",
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "role": "USER",
    "active": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "redirect": "/productos.html"
}
```

**Errores**:
- `401`: Credenciales incorrectas
- `403`: Cuenta desactivada

---

### POST `/api/clients/register`
Registrar nuevo usuario.

**Body**:
```json
{
  "nombre": "Juan Pérez",
  "email": "usuario@ejemplo.com",
  "password": "Contraseña123",
  "telefono": "98765432",
  "direccion": "Av. Providencia 1234" // opcional
}
```

**Validaciones**:
- **nombre**: 2-60 caracteres, solo letras, espacios, guiones y apóstrofes
- **email**: formato válido, máximo 100 caracteres
- **password**: 8-64 caracteres, debe combinar al menos 2 tipos (mayúsculas, minúsculas, números, símbolos)
- **telefono**: exactamente 8 dígitos
- **direccion**: 5-120 caracteres (opcional)

**Respuesta exitosa (201)**:
```json
{
  "success": true,
  "message": "¡Te has registrado exitosamente!",
  "data": {
    "id": "abc123",
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "phone": "+56998765432",
    "address": "Av. Providencia 1234",
    "role": "USER",
    "active": true
  }
}
```

**Errores**:
- `400`: Datos inválidos
- `409`: Email ya registrado

---

### GET `/api/clients/:id`
Obtener datos de un cliente (requiere autenticación).

**Headers**: `Authorization: Bearer {token}`

**Respuesta (200)**:
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "phone": "+56998765432",
    "address": "Av. Providencia 1234",
    "role": "USER",
    "active": true
  }
}
```

---

### PUT `/api/clients/:id`
Actualizar datos del cliente (requiere autenticación).

**Headers**: `Authorization: Bearer {token}`

**Body**:
```json
{
  "name": "Juan Carlos Pérez",
  "phone": "87654321",
  "address": "Nueva dirección 456"
}
```

**Respuesta (200)**:
```json
{
  "success": true,
  "data": { /* usuario actualizado */ }
}
```

---

### POST `/api/clients/:id/desactivar`
Desactivar cuenta de usuario (requiere autenticación y confirmación de contraseña).

**Headers**: `Authorization: Bearer {token}`

**Body**:
```json
{
  "password": "contraseña_actual"
}
```

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Usuario desactivado",
  "data": { /* usuario desactivado */ }
}
```

---

## 🛍️ Productos (`/api/products`)

### GET `/api/products`
Obtener todos los productos.

**Respuesta (200)**:
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "id": "prod123",
      "name": "Alfajor Clásico",
      "price": 1290,
      "stock": 45,
      "description": "Alfajor tradicional con dulce de leche",
      "image": "alfajores.png",
      "category": {
        "id": "cat1",
        "name": "Alfajores"
      }
    }
  ],
  "message": "Encontrados 25 productos"
}
```

---

### GET `/api/products/:id`
Obtener un producto específico.

**Respuesta (200)**:
```json
{
  "success": true,
  "data": {
    "id": "prod123",
    "name": "Alfajor Clásico",
    "price": 1290,
    "stock": 45,
    "description": "Alfajor tradicional con dulce de leche",
    "image": "alfajores.png",
    "category": {
      "id": "cat1",
      "name": "Alfajores"
    }
  },
  "message": "Producto encontrado"
}
```

**Errores**:
- `404`: Producto no encontrado

---

## 🛍️ Órdenes (`/api/orders`)

### POST `/api/orders/create`
Crear una orden de compra y generar pago con PayPal.

**Headers**: `Authorization: Bearer {token}`

**Body**:
```json
{
  "items": [
    {
      "productId": "prod123",
      "name": "Alfajor Clásico",
      "quantity": 2,
      "price": 1290,
      "image": "alfajores.png"
    }
  ],
  "total": 2580,
  "direccion": "Av. Providencia 1234",
  "region": "Metropolitana",
  "comuna": "Providencia",
  "comentarios": "Entregar en portería"
}
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "orderId": "8A123456789",
  "approvalLink": "https://www.sandbox.paypal.com/checkoutnow?token=..."
}
```

**Errores**:
- `400`: Items vacío o total inválido
- `500`: Error creando orden en PayPal

**Nota:** El total en CLP se convierte automáticamente a USD para PayPal.

---

### POST `/api/orders/capture`
Capturar y confirmar el pago realizado en PayPal.

**Headers**: `Authorization: Bearer {token}`

**Body**:
```json
{
  "orderId": "8A123456789"
}
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Pago completado",
  "order": {
    "id": "order_db_id",
    "clientId": "user123",
    "totalAmount": 2580,
    "status": "PENDING",
    "createdAt": "2025-12-10T..."
  }
}
```

**Errores**:
- `400`: orderId requerido
- `500`: Error capturando pago

---

### GET `/api/orders/:orderId`
Obtener detalles de una orden específica.

**Headers**: `Authorization: Bearer {token}`

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "data": {
    "id": "order_db_id",
    "clientId": "user123",
    "totalAmount": 2580,
    "status": "COMPLETED",
    "createdAt": "2025-12-10T...",
    "updatedAt": "2025-12-10T..."
  }
}
```

**Errores**:
- `403`: No autorizado para ver esta orden
- `404`: Orden no encontrada

---

## 🛒 Carrito (`/api/cart`)

### GET `/api/cart/:userId`
Obtener carrito del usuario.

**Respuesta (200)**:
```json
{
  "ok": true,
  "data": {
    "userId": "user123",
    "items": [
      {
        "productId": "prod123",
        "quantity": 2,
        "name": "Alfajor Clásico",
        "price": 1290,
        "image": "alfajores.png"
      }
    ]
  }
}
```

---

### POST `/api/cart/add`
Agregar producto al carrito.

**Body**:
```json
{
  "userId": "user123",
  "productId": "prod123",
  "quantity": 2
}
```

**Respuesta (200)**:
```json
{
  "ok": true,
  "msg": "Producto agregado al carrito",
  "data": { /* carrito actualizado */ }
}
```

---

### PUT `/api/cart/update/:userId/:productId`
Actualizar cantidad de un producto en el carrito.

**Body**:
```json
{
  "quantity": 5
}
```

---

### DELETE `/api/cart/remove/:userId/:productId`
Eliminar producto del carrito.

**Respuesta (200)**:
```json
{
  "ok": true,
  "msg": "Producto eliminado",
  "data": { /* carrito actualizado */ }
}
```

---

### DELETE `/api/cart/clear/:userId`
Vaciar carrito completo.

**Respuesta (200)**:
```json
{
  "ok": true,
  "msg": "Carrito vaciado",
  "data": []
}
```

---

## 🤖 Chatbot (`/api/chat`)

### POST `/api/chat`
Enviar mensaje al chatbot.

**Body**:
```json
{
  "message": "¿Cuál es el stock del Alfajor Clásico?"
}
```

**Respuesta (200)**:
```json
{
  "reply": "El producto \"Alfajor Clásico\" tiene 45 unidades en stock, precio: $1290, categoría: Alfajores."
}
```

**Funcionalidades del chatbot**:
- Consultar stock de productos
- Verificar disponibilidad
- Listar productos por categoría
- Buscar productos por rango de precio
- Búsqueda general de productos
- Respuestas generales usando modelo de IA (DeepSeek)

---

## 👨‍💼 Administración (`/api/admin`)

**Todas las rutas requieren autenticación y rol ADMIN**

### GET `/api/admin/dashboard`
Obtener datos del dashboard de administración.

**Headers**: `Authorization: Bearer {token}`

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Bienvenido al panel administrativo",
  "user": { /* datos del admin */ }
}
```

---

### GET `/api/admin/users`
Listar todos los usuarios.

**Headers**: `Authorization: Bearer {token}`

**Respuesta (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "user123",
      "name": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "active": true
    }
  ],
  "message": "Encontrados 15 clientes"
}
```

---

### PUT `/api/admin/users/:id/suspend`
Suspender cuenta de usuario.

**Headers**: `Authorization: Bearer {token}`

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Usuario suspendido",
  "data": { /* usuario suspendido */ }
}
```

---

### PUT `/api/admin/users/:id/unsuspend`
Reactivar cuenta de usuario.

**Headers**: `Authorization: Bearer {token}`

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Usuario reactivado",
  "data": { /* usuario reactivado */ }
}
```

---

### DELETE `/api/admin/users/:id`
Eliminar usuario permanentemente.

**Headers**: `Authorization: Bearer {token}`

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Usuario eliminado correctamente"
}
```

---

### POST `/api/admin/products`
Crear nuevo producto.

**Headers**: `Authorization: Bearer {token}`

**Body**:
```json
{
  "name": "Nuevo Producto",
  "price": 1500,
  "stock": 100,
  "category": "Alfajores",
  "description": "Descripción del producto",
  "image": "imagen.png"
}
```

**Nota**: La categoría se crea automáticamente si no existe.

**Respuesta (201)**:
```json
{
  "success": true,
  "message": "Producto creado correctamente",
  "data": { /* producto creado */ }
}
```

---

### PUT `/api/admin/products/:id`
Actualizar producto existente.

**Headers**: `Authorization: Bearer {token}`

**Body**:
```json
{
  "name": "Producto Actualizado",
  "price": 1600,
  "stock": 80,
  "category": "Nueva Categoría"
}
```

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Producto actualizado",
  "data": { /* producto actualizado */ }
}
```

---

### DELETE `/api/admin/products/:id`
Eliminar producto.

**Headers**: `Authorization: Bearer {token}`

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Producto eliminado correctamente"
}
```

---

## 🌐 APIs Externas

### A) Chatbot con IA - OpenRouter (DeepSeek)

**✅ IMPLEMENTADO**

**Base URL**: `https://openrouter.ai/api/v1`
**Autenticación**: Bearer Token (OPENROUTER_API_KEY)
**Modelo**: `deepseek/deepseek-chat-v3.1:free`

**Endpoint**:
- `POST /chat/completions` - Enviar consulta al modelo de IA

**Configuración en `.env`**:
```env
OPENROUTER_API_KEY=tu_api_key_aqui
```

**Uso interno**: El chatbot del sistema (`/api/chat`) utiliza esta API para responder consultas generales cuando no encuentra información específica en la base de datos.

**Características**:
- Respuestas contextualizadas sobre productos
- Consultas de stock y disponibilidad
- Búsqueda por categorías y precios
- Interacción natural con usuarios

---

### B) Pagos - PayPal

**✅ IMPLEMENTADO**

**Docs**: https://developer.paypal.com/docs/api/overview/
**Base URL Sandbox**: `https://api-m.sandbox.paypal.com`
**Base URL Production**: `https://api-m.paypal.com`

**Endpoints utilizados**:
- `POST /v1/oauth2/token` - Obtener token de acceso
- `POST /v2/checkout/orders` - Crear orden de pago
- `POST /v2/checkout/orders/{id}/capture` - Capturar pago aprobado

**Configuración en `.env`**:
```env
PAYPAL_CLIENT_ID=tu_client_id
PAYPAL_SECRET=tu_secret
PAYPAL_API=https://api-m.sandbox.paypal.com
```

**Notas**:
- El sistema convierte automáticamente CLP a USD (tasa: 1000 CLP ≈ 1 USD)
- Usa PayPal Sandbox en desarrollo
- Limpia automáticamente el carrito tras compra exitosa

---

### C) Información Nutricional - USDA FoodData Central

**⏳ PLANIFICADO - NO IMPLEMENTADO**

**Base URL**: `https://api.nal.usda.gov/fdc`
**Autenticación**: API Key (query param)

**Endpoints**:
- `GET /v1/foods/search?query={texto}&pageSize=10&api_key={API_KEY}`
- `GET /v1/food/{fdcId}?api_key={API_KEY}`

---

### D) Pagos Adicionales (Chile)

**⏳ PLANIFICADO - NO IMPLEMENTADO**

#### D.1 - Flow CL
**Docs**: https://www.flow.cl/documentacion/api.html
**Base URL**: `https://www.flow.cl/api`

**Endpoints**:
- `POST /payment/create` - Crear pago
- `GET /payment/getStatus` - Consultar estado

#### D.2 - Webpay Plus (Transbank)
**Docs**: https://www.transbankdevelopers.cl/referencia/webpay
**Base URL**: `https://webpay3gint.transbank.cl` (sandbox)

**Endpoints**:
- `POST /rswebpaytransaction/api/webpay/v1.2/transactions` - Crear transacción
- `PUT /rswebpaytransaction/api/webpay/v1.2/transactions/{token}` - Confirmar
- `GET /rswebpaytransaction/api/webpay/v1.2/transactions/{token}` - Consultar estado

---

### E) Notificaciones

**⏳ PLANIFICADO - NO IMPLEMENTADO**

#### E.1 - EmailJS
**Sitio**: https://www.emailjs.com/
**Uso**: Envío de correos desde frontend sin backend

#### E.2 - Twilio (SMS/WhatsApp)
**Sitio**: https://www.twilio.com/
**Endpoint**: `POST /2010-04-01/Accounts/{AccountSid}/Messages.json`

---

## 🔧 Tecnologías Utilizadas

### Backend
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: JWT (jsonwebtoken)
- **Seguridad**: bcryptjs, helmet, express-rate-limit
- **Validación**: express-validator

### Librerías Principales
- `@prisma/client` - ORM para PostgreSQL
- `bcryptjs` - Hasheo de contraseñas
- `jsonwebtoken` - Gestión de tokens JWT
- `express-validator` - Validación de datos
- `helmet` - Seguridad HTTP
- `cors` - Control de acceso CORS
- `express-rate-limit` - Limitación de peticiones

---

## 📊 Códigos de Estado HTTP

- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado exitosamente
- `400 Bad Request` - Datos inválidos
- `401 Unauthorized` - No autenticado o credenciales incorrectas
- `403 Forbidden` - No autorizado (cuenta desactivada o sin permisos)
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Conflicto (ej: email duplicado)
- `500 Internal Server Error` - Error del servidor

---

## 🔒 Seguridad

### Rate Limiting
- **API General**: 100 peticiones por 15 minutos
- **Login/Register**: 5 intentos por 15 minutos

### Headers de Seguridad
- Content Security Policy (CSP)
- CORS configurado
- Helmet para headers seguros

### Validaciones
- Sanitización de inputs
- Validación de formatos (email, teléfono, etc.)
- Protección contra inyección SQL (Prisma ORM)
- Hasheo de contraseñas con bcrypt (factor 10)