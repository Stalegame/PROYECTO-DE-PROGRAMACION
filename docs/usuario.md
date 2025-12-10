# Manual de Usuario – Fruna

Este documento describe el uso del sistema desde la perspectiva del **usuario cliente** y el **administrador**, incluyendo navegación, funcionalidades, procesos de compra y gestión interna.

---

# 1. Introducción

El sistema de mejora de la página de **FRUNA** permite a los usuarios registrarse, realizar compras, acceder al historial de pedidos y navegar por un catálogo actualizado de productos.  
Además, incorpora un **panel de administración** donde se pueden gestionar productos, clientes y pedidos.

Este manual explica cómo utilizar cada módulo del sistema.

---

# 2. Requisitos del usuario

### Usuario cliente
- Navegador actualizado (Chrome, Firefox, Edge).
- Conexión a Internet.
- Cuenta registrada en el sistema.

### Administrador
- Credenciales de administrador otorgadas por el equipo responsable.
- Acceso al panel administrativo desde la sección correspondiente.

---

# 3. Acceso al sistema

## 3.1 Registro de usuario
Para crear una cuenta:
1. Ir a **Iniciar Sesión**.
2. Seleccionar **Crear cuenta**.
3. Ingresar datos personales requeridos.
4. Confirmar registro.

El usuario podrá iniciar sesión inmediatamente después.

## 3.2 Inicio de sesión
1. Ingresar correo y contraseña.
2. Presionar **Iniciar sesión**.
3. En caso de error, verificar credenciales.

## 3.3 Roles disponibles
- **Usuario Cliente:** realiza compras, accede a catálogo y su historial.
- **Administrador:** gestiona productos, clientes y pedidos desde el panel administrativo.

---

# 4. Uso del Sistema – Usuario Cliente

## 4.1 Catálogo de productos
El usuario puede:
- Navegar por categorías (Alfajores, Chocolates, Snacks, etc.).
- Ver detalles del producto (nombre, precio, descripción, stock).
- Filtrar y buscar productos por nombre o categoría.
- Ver productos destacados en la página principal.

### Búsqueda de productos
El sistema incluye una funcionalidad de búsqueda que permite:
- Buscar por nombre del producto
- Filtrar por categoría
- Ver resultados en tiempo real

### Productos destacados
Los productos marcados como "destacados" (famous) aparecen:
- En la página principal
- Con indicador visual especial
- Priorizados en las búsquedas

## 4.2 Carrito de compras
1. Presionar **Agregar al carrito** en el producto deseado.  
2. Revisar la cantidad y el total en la vista del carrito.  
3. Editar cantidades o eliminar productos.

## 4.3 Realizar pedido
El proceso de compra incluye:
1. Revisar carrito con todos los productos seleccionados.
2. Ingresar o confirmar datos de envío (dirección, región, comuna).
3. Agregar comentarios adicionales (opcional).
4. **Procesar pago con PayPal:**
   - El sistema convierte automáticamente el total de CLP a USD
   - Se redirige a PayPal Sandbox (desarrollo) o Production (producción)
   - El usuario aprueba el pago en la plataforma de PayPal
   - Al confirmar, regresa al sitio y se captura el pago
5. Recibir confirmación del pedido con número de orden.
6. El carrito se vacía automáticamente tras compra exitosa.

**Nota sobre pagos:**
- En desarrollo se usa PayPal Sandbox (dinero ficticio)
- Los pagos se procesan en USD con conversión automática
- Tasa aproximada: 1000 CLP ≈ 1 USD

## 4.4 Historial de pedidos
Permite ver:
- Fecha del pedido.
- Productos incluidos.
- Monto total.
- Estado del pedido (si el sistema los maneja).

## 4.5 Perfil del usuario
Incluye:
- Datos personales (nombre, email, teléfono, dirección).
- Cambiar contraseña.
- Actualizar correo u otra información.
- Desactivar cuenta (requiere confirmar contraseña).

## 4.6 Chatbot con Inteligencia Artificial
El sistema incluye un chatbot interactivo que permite:
- **Consultar stock de productos:** "¿Cuál es el stock del Alfajor Clásico?"
- **Verificar disponibilidad:** "¿Está disponible el Chocolate Fruna?"
- **Listar por categoría:** "Muéstrame productos de la categoría Alfajores"
- **Buscar por precio:** "Productos entre 1000 y 3000 pesos"
- **Búsqueda general:** "Quiero comprar chocolates"
- **Consultas generales:** El chatbot usa IA (DeepSeek) para responder otras preguntas

**Acceso:** Disponible en todas las páginas mediante botón flotante.

---

# 5. Uso del Sistema – Administrador

El administrador accede al panel mediante la sección **“Administración”** disponible solo para usuarios autorizados.

## 5.1 Dashboard administrativo
Presenta:
- Resumen general del sistema (ventas del día, productos con bajo stock).
- Órdenes pendientes de preparación.
- Clientes registrados este mes.
- Vista rápida de actividades recientes.
- Productos destacados.

## 5.2 Gestión de productos
Permite:
- **Añadir productos:** nombre, descripción, precio, stock, imagen.
- **Editar productos:** actualizar información.
- **Eliminar productos:** con validación previa.
- **Controlar stock:** revisar disponibilidad.

## 5.3 Gestión de clientes
Incluye:
- Listado de todos los clientes registrados.
- Información básica del cliente (nombre, email, teléfono, rol, estado).
- **Suspender usuarios:** Desactivar cuenta temporalmente (active = false).
- **Reactivar usuarios:** Volver a activar cuenta suspendida (active = true).
- **Eliminar usuarios:** Borrar permanentemente del sistema.
- **Protección:** El administrador no puede suspender su propia cuenta.

## 5.4 Gestión de pedidos
El administrador puede:
- Ver todas las órdenes realizadas en el sistema.
- Revisar detalles del pedido (cliente, monto, fecha).
- Ver estado del pedido (PENDING, PREPARING, COMPLETED, CANCELLED).
- Eliminar órdenes del sistema.
- Filtrar órdenes por estado o fecha.

---

# 6. Flujos importantes

## 6.1 Flujo de compra (Usuario)
1. Navega por catálogo o usa búsqueda/chatbot.  
2. Agrega productos al carrito.  
3. Revisa carrito y cantidades.  
4. Ingresa datos de envío (dirección, región, comuna).  
5. Confirma compra y es redirigido a PayPal.  
6. Aprueba pago en PayPal Sandbox.  
7. Regresa al sitio y el sistema captura el pago.  
8. Recibe confirmación con número de orden.  
9. Carrito se vacía automáticamente.  

## 6.2 Flujo para añadir un producto (Administrador)
1. Entrar al panel.  
2. Ir a **Productos**.  
3. Seleccionar **Añadir producto**.  
4. Completar formulario.  
5. Guardar.  

## 6.3 Flujo para gestionar un pedido (Administrador)
1. Abrir módulo **Pedidos** en el panel administrativo.  
2. Ver lista completa de órdenes con filtros.  
3. Seleccionar pedido específico para ver detalles.  
4. Revisar información (cliente, monto, estado, fecha).  
5. Opcionalmente eliminar orden si es necesario.

## 6.4 Flujo para suspender/reactivar usuario (Administrador)
1. Acceder a **Gestión de usuarios**.  
2. Buscar usuario en la lista.  
3. Seleccionar opción **Suspender** o **Reactivar**.  
4. Confirmar acción.  
5. El usuario suspendido no podrá iniciar sesión hasta ser reactivado.  

---

# 7. Mensajes y validaciones del sistema

El sistema cuenta con validaciones tanto en **frontend** como en **backend** para garantizar seguridad y consistencia.

### Ejemplos comunes:

| Mensaje | Explicación | Acción recomendada |
|--------|-------------|---------------------|
| “Campo requerido” | Falta información obligatoria | Completar el campo |
| “Credenciales incorrectas” | Correo o contraseña inválida | Reintentar o recuperar contraseña |
| “Stock insuficiente” | No hay unidades disponibles | Reducir cantidad o elegir otro producto |
| “Producto agregado correctamente” | Acción exitosa | Continuar compra |
| “Error inesperado” | Problema interno | Reintentar o contactar soporte |

---

# 8. Preguntas Frecuentes (FAQ)

**¿Puedo comprar sin tener cuenta?**  
No, es necesario registrarse para realizar pedidos y ver historial.

**¿Cómo actualizo mis datos?**  
Desde la sección **Perfil**.

**¿El administrador puede ver mis pedidos?**  
Sí, para gestionar procesos internos del sistema.

**¿Qué métodos de pago están disponibles?**  
Actualmente el sistema usa PayPal (Sandbox en desarrollo). En producción se procesa con PayPal real.

**¿Puedo usar el chatbot sin cuenta?**  
Sí, el chatbot está disponible para todos los visitantes del sitio.

**¿Cómo funciona la conversión de moneda en PayPal?**  
El sistema convierte automáticamente de CLP a USD usando una tasa aproximada (1000 CLP ≈ 1 USD).

**¿Qué pasa si mi cuenta es suspendida?**  
No podrás iniciar sesión hasta que un administrador reactive tu cuenta.

**¿Puedo eliminar mi propia cuenta?**  
Sí, desde tu perfil puedes desactivar tu cuenta (requiere confirmar contraseña). Para eliminarla permanentemente, contacta a un administrador.

---

# 9. Contacto / Soporte

Para dudas o problemas técnicos:
- Email soporte: *soporte@fruna.cl*  
- Horario: Lunes a viernes, 9:00 – 18:00  
- Equipo responsable del sistema: Área de Desarrollo FRUNA  

---

**© Sistema de Mejoras FRUNA – 2025**
