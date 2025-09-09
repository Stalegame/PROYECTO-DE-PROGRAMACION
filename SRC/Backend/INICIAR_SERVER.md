# Guía para Iniciar el Servidor de **Fruna Backend**

1. **Instalar Node.js desde la página oficial** (v22.19.0 LTS).

2. **Abrir PowerShell como "Administrador"**.

3. **Intentar revisar "node -v" y "npm -v"**.
**SI NO SE PUEDE EL "npm -v" APLICAR PASO 3.1**.

3.1. **Copiar este código:**
*"Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser"*
**y seleccionar letra "S".**

4. **Volve a Visual Studio y hacer click derecho en carpeta "Backend" y seleccionar "Copiar ruta de acceso"**.

5. **En la PowerShell colocar "cd " y PEGAR LA DIRECCION DE SU REPOSITORIO DEL PASO 4 (MUY IMPORTANTE QUE SEA AHÍ)**.

6. **Hacer "npm install" para installar la carpeta "node_modules" con todos los requirements especificados en "server.js" (se descargan todos automaticamente)**.

7. **Comprovar el servidor con "npm run dev"**.

8. **Revisar que no salga ningun error, en caso contrario, avisar por grupo a Frontend o Backend correspondientes**.