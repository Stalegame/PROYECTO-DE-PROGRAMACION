PARA EL PROYECTO:
Extensión                                       Qué hace
ES7+ React/Redux/React-Native snippets          Atajos de código para JavaScript/Node.js
Node.js Modules Intellisense                    Autocompletado para módulos Node.js
REST Client                                     Probar APIs directamente desde VS Code
Thunder Client                                  Cliente HTTP para probar endpoints (alternativa a Postman)
Auto Rename Tag                                 Renombra automáticamente etiquetas HTML
Bracket Pair Colorizer                          Colorea pares de corchetes para mejor legibilidad
GitLens                                         Mejora la integración con Git
Live Server                                     Servidor local con recarga automática
Path Intellisense                               Autocompletado para rutas de archivos
Prettier - Code formatter                       Formatea código automáticamente

instalaciones:
npm install jsonwebtoken bcryptjs
npm install 
packages: 158

PARA BASE DE DATOS:
1. Instalar postgres version 18.0 anotar usario, contraseña y puerto (normalmente5432)

2. dependencias de proyecto
cd SRC\Backend
npm init -y
npm i express cors helmet express-rate-limit bcryptjs jsonwebtoken dotenv
npm i @prisma/client
npm i -D prisma dotenv-cli nodemon

3. inicializar prisma
npx prisma init

4. configurar le .env
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/fruna?schema=public"
PERSITENCE=postgres

5. conectar a la base de datos
cd SRC\Backend
npx prisma db pull --schema .\db\prisma\schema.prisma
npx prisma generate --schema .\db\prisma\schema.prisma
