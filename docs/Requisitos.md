## Requisitos Funcionales

- **RF1:** El sistema debe permitir registrar nuevos productos con nombre, ID, precio, categoría y stock.  
- **RF2:** El sistema debe permitir actualizar la información de un producto existente.  
- **RF3:** El sistema debe permitir consultar productos disponibles.  
- **RF4:** El sistema debe permitir eliminar productos del catálogo.  
- **RF5:** El usuario debe ingresar con un nombre de usuario y una contraseña.  
- **RF6:** El sistema debe almacenar un historial de compras por cliente.  
- **RF7:** El sistema debe permitir al usuario añadir productos a un carrito de compras.  
- **RF8:** El sistema debe calcular automáticamente el total de compra.  
- **RF9:** El sistema debe permitir confirmar y registrar la compra en la base de datos.  
- **RF10:** El sistema debe permitir consultar el historial de pedidos realizados.  
- **RF11:** El sistema debe permitir autenticación de administradores para gestionar productos.  
- **RF12:** El sistema debe permitir a los clientes autenticarse para consultar su historial.  

---

## Requisitos No Funcionales

- **RNF1:** Las consultas al catálogo de productos deben ejecutarse en menos de 2 segundos.  
- **RNF2:** Las contraseñas deben almacenarse encriptadas.  
- **RNF3:** La comunicación entre frontend y backend debe estar protegida con HTTPS.  
- **RNF4:** La interfaz debe ser intuitiva y accesible para usuarios sin experiencia técnica.  
- **RNF5:** El backend debe estar estructurado bajo una arquitectura por capas para facilitar la migración de JSON a SQLite/Postgres.  
- **RNF6:** El código debe seguir estándares de legibilidad y buenas prácticas de desarrollo.  
- **RNF7:** El sistema debe contar con un almacenamiento de acuerdo a la cantidad de usuarios.  
- **RNF8:** Se debe garantizar que la página estará en funcionamiento el 95% del tiempo.  