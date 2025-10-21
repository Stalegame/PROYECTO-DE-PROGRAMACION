# 🚀 Guía de Inicio del Servidor de **Fruna**

Esta guía explica cómo preparar el entorno y levantar el backend de **Fruna** en tu máquina de manera segura y reproducible.


## 🔹 Configuración Importante

Debes tener un archivo .env en la raíz del proyecto con las variables necesarias.

Las cuales estan indicadas en .env.example :

```bash
PORT=3000
JWT_SECRET_KEY=generic_key
JWT_EXPIRES=2h
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/fruna?schema=public
PERSISTENCE=postgres
NODE_ENV=development
```

Una vez configurado se puede iniciar la instalación.

---

## 1️⃣ Instalar Node.js

1. Descarga e instala **Node.js v22.19.0 LTS** desde la página oficial:  
   [https://nodejs.org](https://nodejs.org)

2. Durante la instalación, asegúrate de marcar la opción **"Add to PATH"** para poder usar `node` y `npm` desde la terminal.

---

## 2️⃣ Abrir PowerShell (Windows) o Terminal (Linux/Mac)

- **Windows:** haz clic derecho y selecciona **"Ejecutar como Administrador"**.  
- **Linux/Mac:** abre tu terminal favorita con permisos normales.

---

## 3️⃣ Verificar instalación de Node y npm

Ejecuta los siguientes comandos:

```bash
node -v
npm -v
```

Si ambos muestran la versión correctamente → ✅ continúa.

Si npm -v falla → aplica el paso 3.1.

---

### 3.1 Ajustar políticas de ejecución (solo Windows)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Presiona S ( Y en inglés ) cuando te pregunte por confirmación.

Cierra y vuelve a abrir PowerShell, luego verifica npm -v nuevamente.

## 4️⃣ Navegar al directorio del backend

En tu editor (VS Code, etc.), haz clic derecho sobre la carpeta raíz del proyecto y selecciona "Copiar ruta de acceso".

En la terminal, ejecuta:

```bash
cd "RUTA_RAIZ_PROYECTO"
```

⚠️ Usa comillas si la ruta contiene espacios.

---

## 5️⃣ Preparar el proyecto y la base de datos

Ejecuta:

```bash
npm run init_server
```

### 🔹 Qué hace este comando:

1. Instala todas las dependencias (node_modules).

2. Genera Prisma Client (npx prisma generate).

3. Sincroniza el esquema de la base de datos (npx prisma db push).

4. Crea datos iniciales mediante la semilla (seed.js).

⚠️ Si la base de datos ya tiene datos, la semilla no sobrescribirá registros existentes.


## 6️⃣ Iniciar el servidor en modo desarrollo

```bash
npm run dev
```


El backend quedará corriendo con recarga automática (nodemon).

Por defecto, estará disponible en: http://localhost:3000

## 7️⃣ Verificar funcionamiento

Prueba un endpoint en el navegador o con Postman:

```bash
GET http://localhost:3000/api/clients
```

Revisa los logs en la consola para confirmar que no hay errores.
