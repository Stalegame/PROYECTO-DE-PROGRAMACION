# Retroalimentación sobre la Metodología Aplicada (S8–S13)

Durante el período comprendido entre las semanas S8 y S13, se aplicó una metodología de desarrollo **Kanban**, orientada a la entrega continua de mejoras y a la refactorización progresiva del sistema. Este enfoque permitió ajustar la arquitectura del proyecto conforme surgieron nuevas necesidades, manteniendo un equilibrio entre la incorporación de funcionalidades, la corrección de errores y la optimización del código.

## S8 – Migraciones y Normalización de Datos
En S8, las actividades se centraron en la definición del script de migración desde archivos JSON hacia Prisma y PostgreSQL, lo cual resultó fundamental para garantizar la integridad y consistencia de la información. Paralelamente, se corrigió el proceso de almacenamiento del número telefónico de los clientes, estableciendo una normalización automática mediante el prefijo “+569”.  
Estas tareas evidenciaron la importancia de adoptar controles robustos sobre la validación y transformación de datos para evitar inconsistencias en el sistema.

## S9 – Portabilidad del Proyecto y Optimización del Entorno de Desarrollo
Durante S9, se actualizó y amplió el contenido del archivo `README.md`, añadiendo instrucciones claras para la ejecución del servidor en distintos equipos, lo que mejora la transferibilidad y comprensión del proyecto por parte de otros desarrolladores.
Además, se depuró el archivo `package.json`, eliminando dependencias innecesarias y ajustando configuraciones redundantes.
Estas tareas contribuyeron a fortalecer la portabilidad del proyecto y a garantizar un entorno de desarrollo más ordenado y eficiente.

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

## S13 - Revision y mejoramiento para entrega hito 2
Durante S13 se realizaron mejoras clave orientadas a consolidar la segunda entrega del proyecto.
Se implementaron las correcciones sugeridas por el profesor, especialmente en el CRUD de usuarios, agregando funcionalidades de edición y suspensión de cuentas para lograr una administración más completa y consistente.

Además, se realizaron ajustes de renderizado para asegurar una correcta visualización en las vistas críticas del sistema.
Se incorporaron nuevas pantallas asociadas al flujo de pago y se integró la API de PayPal, permitiendo simular transacciones reales dentro del proyecto, lo que enriquece la experiencia del usuario y fortalece la funcionalidad general del sistema.

---

## Conclusión General
La metodología Kanban aplicada entre las semanas S8 y S13 permitió mantener un ritmo continuo de entrega, priorizando la refactorización progresiva y la evolución arquitectónica del sistema.
Gracias a este enfoque, el equipo pudo responder oportunamente a nuevas necesidades técnicas, mejorar la calidad del código y optimizar procesos clave como la validación de datos, la exposición de servicios y la integración de APIs externas.

Si bien algunos ajustes surgieron de la retroalimentación del profesor —especialmente en S13— este proceso evidenció la importancia de una planificación más anticipada y de establecer estándares sólidos desde las primeras fases del desarrollo. Aun así, las mejoras implementadas consolidaron una base técnica más madura, escalable y preparada para integrar funcionalidades avanzadas como sistemas de pago y servicios basados en IA.

En conjunto, el trabajo realizado fortaleció la estabilidad del proyecto, mejoró la experiencia del usuario final y dejó un entorno de desarrollo más organizado, mantenible y apto para futuras extensiones.