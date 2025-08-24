# 📋 Requisitos Funcionales

## 👤 Usuarios (Clientes)
1. **Autenticación de usuarios**: El sistema debe permitir que los clientes se registren e inicien sesión con nombre de usuario y contraseña.  
2. **Gestión de perfil**: El sistema debe permitir a los clientes actualizar su información personal (ej: dirección, correo, teléfono).  
3. **Consulta de productos**: El sistema debe mostrar los productos disponibles con nombre, precio, categoría y stock.  
4. **Búsqueda y filtrado**: El sistema debe permitir a los clientes buscar productos y filtrarlos por categoría, precio, disponibilidad, etc.  
5. **Carrito de compras**: El sistema debe permitir añadir productos al carrito, modificarlos (cantidad, eliminar) y visualizar el total de la compra.  
6. **Procesar compra**: El sistema debe permitir confirmar la compra, registrar la transacción y generar un comprobante (ej: boleta/factura).  
7. **Historial de compras**: El sistema debe almacenar y mostrar al cliente el historial de pedidos realizados.  
8. **Notificaciones**: El sistema debe notificar al cliente sobre el estado de su pedido (ej: confirmado, en proceso, enviado).  



## 🛠 Administradores
1. **Autenticación de administradores**: El sistema debe permitir acceso con credenciales seguras a los administradores.  
2. **Gestión de productos**:  
   - Registrar nuevos productos (nombre, ID, precio, categoría y stock).  
   - Actualizar información de productos existentes.  
   - Eliminar productos del catálogo.  
3. **Gestión de clientes**: El sistema debe permitir visualizar información básica de los clientes y sus pedidos.  
4. **Gestión de pedidos**: El sistema debe permitir consultar, actualizar el estado y administrar los pedidos realizados.  
5. **Dashboard**: El sistema debe proporcionar estadísticas e información relevante como ventas totales, pedidos activos, stock disponible y clientes registrados.  
6. **Interfaz de administración**: El sistema debe contar con una interfaz dedicada para las funcionalidades de administración. 

---

# ⚙️ Requisitos No Funcionales

1. **Rendimiento de consultas:** Las consultas al catálogo de productos deben ejecutarse en menos de 2 segundos bajo carga promedio de usuarios.  
2. **Seguridad de contraseñas:** Las contraseñas deben almacenarse encriptadas utilizando algoritmos seguros (ej: bcrypt o Argon2).  
3. **Comunicación segura:** Toda comunicación entre el cliente y el servidor debe realizarse a través de HTTPS con certificados válidos.  
4. **Usabilidad y accesibilidad:** La interfaz debe ser intuitiva y accesible.  
5. **Arquitectura escalable:** El backend debe implementarse bajo una arquitectura en capas que facilite la migración entre diferentes motores de base de datos (ej: SQLite, PostgreSQL).  
6. **Calidad del código:** El código debe seguir estándares de legibilidad y buenas prácticas de desarrollo.  
7. **Almacenamiento:** El sistema debe garantizar suficiente capacidad de almacenamiento como minimo 4GB de memoria
8. **Disponibilidad del sistema:** El sistema debe garantizar una disponibilidad mínima del 99.5%. 

---