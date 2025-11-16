# Retroalimentación sobre la Metodología Aplicada (S8–S12)

Durante el período comprendido entre las semanas S8 y S12, se aplicó una metodología de desarrollo **iterativa e incremental**, orientada a la entrega continua de mejoras y a la refactorización progresiva del sistema. Este enfoque permitió ajustar la arquitectura del proyecto conforme surgieron nuevas necesidades, manteniendo un equilibrio entre la incorporación de funcionalidades, la corrección de errores y la optimización del código.

## S8 – Migraciones y Normalización de Datos
En S8, las actividades se centraron en la definición del script de migración desde archivos JSON hacia Prisma y PostgreSQL, lo cual resultó fundamental para garantizar la integridad y consistencia de la información. Paralelamente, se corrigió el proceso de almacenamiento del número telefónico de los clientes, estableciendo una normalización automática mediante el prefijo “+569”.  
Estas tareas evidenciaron la importancia de adoptar controles robustos sobre la validación y transformación de datos para evitar inconsistencias en el sistema.

## S9 – Pruebas con SQLite y Formalización del Entorno
Durante S9, se procedió a migrar temporalmente una entidad hacia SQLite con el propósito de implementar y evaluar un entorno de persistencia más ligero mediante un CRUD completo.  
Asimismo, se actualizó el archivo `README.md`, incorporando instrucciones destinadas a facilitar la ejecución del servidor en otros equipos, y se depuró el archivo `package.json` para eliminar dependencias redundantes.  
Estas actividades permitieron fortalecer la portabilidad del proyecto y mejorar la claridad del entorno de desarrollo.

## S10 – Exposición de API REST y Decisión sobre el Chatbot
En S10, se avanzó en la exposición de una API REST con manejo de errores y configuración mediante variables de entorno.  
Un hito importante fue la decisión de eliminar el chatbot manual previamente desarrollado, en favor de integrar una API externa de inteligencia artificial.  

La decisión se fundamentó en un análisis técnico sobre el almacenamiento de imágenes en formato Base64 o BLOB, concluyendo que dichos métodos introducen sobrecarga y dificultan el mantenimiento. Como alternativa más eficiente, se mantuvo el uso de almacenamiento local.  

Durante esta etapa también se ajustaron permisos del sistema (centralizados en el rol “admin”), se mejoró el flujo del carrito de compras y se reorganizó la estructura de rutas del backend.

## S11 – Integración de API Externa y Reorganización del Servidor
En S11 se incorporaron datos provenientes de una API externa en la interfaz de usuario, cumpliendo el objetivo de integrar información real.  
Además, se reorganizó la arquitectura del servidor mediante la creación de `app.js`, responsable de la lógica y rutas del servidor, mientras que `server.js` pasó a encargarse exclusivamente del proceso de inicialización.  
Esta separación otorgó mayor claridad arquitectónica y facilitó tareas de prueba y despliegue.

## S12 – Linter, Pruebas y Mejoras en Observabilidad
En S12 se configuró y ejecutó un linter para estandarizar el estilo del código, reforzando la calidad y coherencia del proyecto.  
También se implementaron pruebas unitarias/API (4–6) y se desarrolló un nuevo sistema de registro (logger) que incorpora tiempos de respuesta y códigos de estado.  
Estas mejoras fortalecieron las prácticas de aseguramiento de calidad y aumentaron la observabilidad del sistema.

---

## Conclusión General
La metodología aplicada entre S8 y S12 se caracterizó por su capacidad de adaptación, la mejora iterativa del código y la búsqueda constante de eficiencia arquitectónica.  
No obstante, se identificó la necesidad de una planificación inicial más estructurada y la adopción temprana de estándares de desarrollo para evitar refactorizaciones extensivas.  

A pesar de ello, los avances realizados consolidaron una base técnica más robusta, mantenible y preparada para futuras extensiones del proyecto.
