# 🏗️ Arquitectura por Capas – Proyecto **Fruna**

El proyecto **Fruna** está diseñado utilizando una **arquitectura por capas**, lo que facilita la separación de responsabilidades, el mantenimiento del sistema y la futura migración de la persistencia desde archivos JSON hacia una base de datos SQL.

---

## 1) **Frontend**
- **Rol:** El **Frontend** es la capa del sistema con la que el usuario interactúa directamente. Su responsabilidad es mostrar los datos de manera visual y gestionar la interacción del usuario con el sistema. Además, se conecta con el **Backend** para obtener o enviar datos.
- **Función:**  
  - **Visualización de datos:** Presenta la información de manera amigable y accesible para el usuario.  
  - **Interactividad:** Permite que el usuario interactúe con formularios, botones, menús, etc.  
  - **Validación de datos:** Verifica los datos del usuario antes de enviarlos al **Backend**.  
  - **Comunicación con el Backend:** Realiza peticiones a los endpoints del **Backend** para realizar acciones como el inicio de sesión, la compra de productos, etc.
  
- **Ejemplos:**  
  - **Páginas web:**  
    - Página de inicio (`index.html`).  
    - Página de productos (`productos.html`).  
    - Página de detalles de un producto (`one_product.html`).

---

## 2) **Backend**
- **Rol:** El **Backend** gestiona la lógica del sistema, controla las reglas de negocio y se encarga de la seguridad, validación de datos y el procesamiento de las solicitudes provenientes del **Frontend**. Además, interactúa con la base de datos **SQL** para manejar los datos de manera persistente.
- **Función:**  
  - **Gestión de rutas y endpoints:** Define los puntos de acceso (endpoints) que el **Frontend** utilizará para interactuar con el sistema.  
  - **Lógica de negocio:** Procesa las solicitudes del usuario, valida la entrada, aplica las reglas de negocio y realiza cambios en la base de datos cuando sea necesario.  
  - **Seguridad y autenticación:** Verifica que los usuarios sean quienes dicen ser y que tengan los permisos adecuados para realizar las acciones solicitadas.  
  - **Comunicación con la base de datos:** Realiza consultas o actualizaciones en la base de datos según sea necesario.

- **Ejemplos:**  
  - Validación de que un correo electrónico de usuario sea único al registrarse.  
  - Cálculo del total de un carrito de compras.  
  - Validación de stock disponible antes de procesar una compra.

---

## 3) **SQL**
- **Rol:** La capa **SQL** es responsable de la **persistencia de los datos**. Utiliza un sistema de base de datos **PostgreSQL** con **Prisma ORM** para almacenar y consultar la información de manera estructurada y eficiente.  
- **Función:**  
  - **Almacenamiento de datos:** Guarda datos relacionados con usuarios, productos, pedidos, categorías, etc.  
  - **Consultas y actualizaciones:** Permite realizar consultas complejas sobre los datos y actualizar registros existentes de manera eficiente mediante Prisma Client.  
  - **Integridad y relaciones:** Asegura que los datos sean consistentes, manteniendo relaciones entre las tablas para garantizar la integridad referencial y de los datos.  
  - **Migraciones:** Prisma gestiona las migraciones de la base de datos, permitiendo evolucionar el esquema de forma controlada.

- **Ejemplos:**  
  - **Usuarios (Client):** Guarda los datos de los usuarios registrados, como nombre, correo electrónico, contraseñas encriptadas, rol (USER/ADMIN) y estado activo.  
  - **Productos (Product):** Contiene la información del catálogo de productos, incluyendo nombre, precio, stock disponible, descripción, imagen y si es destacado (famous).  
  - **Categorías (Category):** Organiza los productos en categorías como Alfajores, Chocolates, Snacks, etc.  
  - **Pedidos (Order):** Registra las compras realizadas por los usuarios, incluyendo monto total, estado (PENDING, PREPARING, COMPLETED, CANCELLED) y relación con el cliente.

---

## 4) **PersistenceFactory**
- **Rol:** El patrón **Factory** implementado en `PersistenceFactory.js` permite **abstraer la capa de persistencia**, facilitando el cambio entre diferentes implementaciones (JSON, PostgreSQL) sin modificar el código de las rutas o controladores.
- **Función:**  
  - **Flexibilidad:** Permite cambiar entre JSON y PostgreSQL mediante la variable de entorno `PERSISTENCE`.  
  - **Consistencia:** Todos los DAOs (Data Access Objects) implementan la misma interfaz, garantizando que el código del backend funcione independientemente del sistema de persistencia.  
  - **Mantenibilidad:** Facilita las pruebas y el desarrollo al poder usar JSON localmente y PostgreSQL en producción.

- **Implementaciones:**  
  - **JSON DAOs:** `JsonClientesDAO`, `JsonProductosDAO`, `JsonCartDAO` (almacenamiento en archivos `.json`)  
  - **Prisma Repositories:** `clientRepo.prisma.js`, `productRepo.prisma.js`, `categoryRepo.prisma.js`, `orderRepo.prisma.js` (almacenamiento en PostgreSQL)

---

## 5) **Variables de Entorno (.env)**
El proyecto utiliza archivos `.env` para configurar aspectos críticos del sistema sin exponer información sensible en el código:

- **PORT:** Puerto del servidor (por defecto 3000)
- **NODE_ENV:** Entorno de ejecución (development/production/test)
- **DATABASE_URL:** URL de conexión a PostgreSQL
- **PERSISTENCE:** Tipo de persistencia a usar (postgres/json)
- **JWT_SECRET_KEY:** Clave secreta para tokens JWT
- **JWT_EXPIRES:** Tiempo de expiración de tokens
- **OPENROUTER_API_KEY:** Clave para API de chatbot con IA
- **PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_API:** Credenciales de PayPal

Consulta el archivo `.env.example` para ver todas las variables disponibles.

---