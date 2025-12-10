# 🗄️ Configuración de Base de Datos - PostgreSQL + Prisma

Este documento explica cómo configurar la base de datos PostgreSQL con Prisma ORM para el proyecto Fruna.

---

## 📋 Requisitos Previos

1. **PostgreSQL 18.0** (o superior) instalado
2. **Node.js v22.19.0 LTS** instalado
3. **npm** funcionando correctamente

---

## 1️⃣ Instalar PostgreSQL

### Windows
1. Descarga PostgreSQL desde: https://www.postgresql.org/download/windows/
2. Durante la instalación, anota:
   - **Usuario:** postgres (por defecto)
   - **Contraseña:** La que elijas
   - **Puerto:** 5432 (por defecto)

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS
```bash
brew install postgresql@18
brew services start postgresql@18
```

---

## 2️⃣ Crear Base de Datos

### Opción A: Por línea de comandos
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE fruna;

# Salir
\q
```

### Opción B: Con pgAdmin
1. Abre pgAdmin 4
2. Clic derecho en "Databases" → "Create" → "Database"
3. Nombre: `fruna`
4. Guardar

---

## 3️⃣ Configurar Variables de Entorno

### Crear archivo `.env` en la raíz del proyecto

**Usa `.env.example` como plantilla:**

```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

### Editar `.env` con tus credenciales:

```env
# Puerto del servidor
PORT=3000

# Entorno de ejecución
NODE_ENV=development

# JWT para autenticación
JWT_SECRET_KEY=tu_clave_secreta_super_segura_aqui
JWT_EXPIRES=2h

# Base de datos PostgreSQL
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/fruna?schema=public"
DIRECT_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/fruna"

# Tipo de persistencia (postgres o json)
PERSISTENCE=postgres

# API de chatbot (OpenRouter)
OPENROUTER_API_KEY=tu_api_key_aqui

# PayPal (Sandbox para desarrollo)
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_SECRET=tu_paypal_secret
PAYPAL_API=https://api-m.sandbox.paypal.com

# URL del frontend (para CORS)
FRONTEND_ORIGIN=http://localhost:3000,http://localhost:8080
```

**⚠️ IMPORTANTE:**
- Reemplaza `TU_CONTRASEÑA` con tu contraseña de PostgreSQL
- Reemplaza las API keys con las reales (obtener de OpenRouter y PayPal Developer)
- Nunca subas el archivo `.env` a Git (ya está en `.gitignore`)

---

## 4️⃣ Instalar Dependencias del Proyecto

```bash
# Navegar a la raíz del proyecto
cd ruta/al/proyecto

# Instalar todas las dependencias
npm install
```

**Esto instalará:**
- `@prisma/client` - Cliente de Prisma para consultas
- `prisma` - CLI de Prisma para migraciones
- `express`, `cors`, `helmet` - Framework y seguridad
- `bcryptjs`, `jsonwebtoken` - Autenticación
- `node-fetch` - Para APIs externas
- Y todas las demás dependencias listadas en `package.json`

---

## 5️⃣ Configurar Prisma

### Ubicación del Schema
El schema de Prisma está en:
```
src/backend/db/prisma/schema.prisma
```

### Generar Cliente de Prisma
```bash
npx prisma generate --schema=src/backend/db/prisma/schema.prisma
```

### Sincronizar Base de Datos
```bash
npx prisma db push --schema=src/backend/db/prisma/schema.prisma
```

**Esto creará todas las tablas:**
- `Client` - Usuarios del sistema
- `Category` - Categorías de productos
- `Product` - Catálogo de productos
- `Order` - Órdenes de compra

---

## 6️⃣ Poblar Base de Datos (Seed)

### Ejecutar script de semilla
```bash
npm run seed
```

**El script `seed.js` crea:**
- 8 categorías de productos (Alfajores, Chocolates, Snacks, etc.)
- +20 productos con stock y precios
- 1 usuario administrador:
  - **Email:** admin@fruna.cl
  - **Contraseña:** Admin123
  - **Rol:** ADMIN
- 2 usuarios de prueba

**Características del seed:**
- ✅ No duplica datos (verifica antes de crear)
- ✅ Seguro para ejecutar múltiples veces
- ✅ Encripta contraseñas con bcrypt

### Forzar recreación completa (⚠️ Borra todo)
```bash
npm run seed:force
```

---

## 7️⃣ Comando de Inicialización Rápida

### Para configurar todo de una vez:
```bash
npm run init_server
```

**Este comando ejecuta automáticamente:**
1. `npm install` - Instala dependencias
2. `npx prisma generate` - Genera cliente Prisma
3. `npx prisma db push` - Sincroniza base de datos

**Luego ejecuta manualmente el seed:**
```bash
npm run seed
```

---

## 8️⃣ Verificar Configuración

### Revisar tablas creadas
```bash
npx prisma studio --schema=src/backend/db/prisma/schema.prisma
```

Esto abre una interfaz web en `http://localhost:5555` donde puedes ver todas las tablas y datos.

### Probar conexión desde la app
```bash
npm run dev
```

Si ves en consola:
```
✅ Conectado a PostgreSQL
🚀 Servidor corriendo en http://localhost:3000
```

¡Todo está funcionando correctamente!

---

## 🔧 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor en modo desarrollo |
| `npm run seed` | Poblar base de datos con datos de prueba |
| `npm run seed:force` | Recrear seed (borra y crea nuevamente) |
| `npm run init_server` | Configuración inicial completa |
| `npx prisma studio` | Abrir interfaz gráfica de base de datos |
| `npx prisma migrate dev` | Crear nueva migración |
| `npx prisma db push` | Sincronizar schema sin crear migración |
| `npx prisma generate` | Regenerar cliente Prisma |

---

## 📚 Recursos Adicionales

- **Documentación de Prisma:** https://www.prisma.io/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Guía de inicio del servidor:** [init_server.md](./init_server.md)
- **Variables de entorno:** Ver `.env.example` en la raíz del proyecto

---

## ⚠️ Solución de Problemas

### Error: "Cannot connect to database"
- Verifica que PostgreSQL esté corriendo
- Revisa que el puerto 5432 esté disponible
- Confirma usuario y contraseña en `.env`

### Error: "Prisma Client not found"
```bash
npx prisma generate --schema=src/backend/db/prisma/schema.prisma
```

### Error: "Table does not exist"
```bash
npx prisma db push --schema=src/backend/db/prisma/schema.prisma
```

### Reiniciar base de datos completamente
```bash
# Conectar a PostgreSQL
psql -U postgres

# Eliminar y recrear base de datos
DROP DATABASE fruna;
CREATE DATABASE fruna;
\q

# Sincronizar schema y ejecutar seed
npx prisma db push --schema=src/backend/db/prisma/schema.prisma
npm run seed
```

---

**© Sistema Fruna – 2025**
