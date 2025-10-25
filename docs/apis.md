# 📄 Selección y Documentación de APIs — Proyecto Fruna

Este documento detalla todas las interfaces de programación utilizadas en el proyecto, incluyendo las librerías de terceros (APIs internas de Node/Express) y los servicios web externos (Nutrición, Pagos y Notificaciones) que se planean integrar.

---

# APIS externas
## A) Información Nutricional

### A.1 — **USDA FoodData Central (oficial)**
- **Guía:** https://fdc.nal.usda.gov/api-guide.html
- **Base URL:** `https://api.nal.usda.gov/fdc`
- **Auth:** `api_key` (query param).

**Endpoints clave**
1) **Buscar alimentos**
GET /v1/foods/search?query={texto}&pageSize=10&api_key={API_KEY}**Ejemplo de respuesta (recortado)**
```json
{
  "totalHits": 2,
  "foods": [
    {
      "fdcId": 1104067,
      "description": "Banana, raw",
      "brandOwner": null,
      "dataType": "Survey (FNDDS)",
      "servingSize": 118.0,
      "servingSizeUnit": "g"
    }
  ]
}
Detalle por fdcIdGET /v1/food/{fdcId}?api_key={API_KEY}
Ejemplo (recortado)JSON{
  "fdcId": 1104067,
  "description": "Banana, raw",
  "labelNutrients": {
    "calories": {"value": 105},
    "protein": {"value": 1.3},
    "fat": {"value": 0.4},
    "carbohydrates": {"value": 27.0}
  }
}
B) Pagos / Transacciones (Chile)B.1 — Flow CLDocs: https://www.flow.cl/documentacion/api.htmlBase URL frecuente: https://www.flow.cl/apiFlujo común: 
// crear pago → redirigir a Flow → confirmar/consultar estado.Endpoints clave (nombres referenciales)Crear pagoPOST /payment/create
Body (ej.): {
  "apiKey": "...",
  "amount": 19990,
  "currency": "CLP",
  "subject": "Pedido #123",
  "email": "cliente@correo.com",
  "urlConfirmation": "[https://tuapp.com/flow/confirm](https://tuapp.com/flow/confirm)",
  "urlReturn": "[https://tuapp.com/flow/return](https://tuapp.com/flow/return)"
}
JSON{ "token": "abcd1234", "url": "[https://www.flow.cl/payment/init/abcd1234](https://www.flow.cl/payment/init/abcd1234)" }
Estado del pagoGET /payment/getStatus?apiKey=...&token=abcd1234
JSON{ "status": 2, "status_desc": "paid", "amount": 19990, "currency": "CLP" }
Webhook: configurar urlConfirmation para notificaciones de pago (server-to-server).B.2 — Webpay Plus (Transbank)Docs: https://www.transbankdevelopers.cl/referencia/webpayBase URL (sandbox): https://webpay3gint.transbank.cl (según ambiente).Flujo: crear → redirigir → commit → status/refund.Endpoints claveCrear transacciónPOST /rswebpaytransaction/api/webpay/v1.2/transactions
Body: { "buy_order":"O-123", "session_id":"S-123", "amount":19990, "return_url":"[https://tuapp.com/tbk/return](https://tuapp.com/tbk/return)" }
JSON{ "token": "abc123", "url": "[https://webpay3gint.transbank.cl/webpayserver/initTransaction](https://webpay3gint.transbank.cl/webpayserver/initTransaction)" }
Commit (confirmar)PUT /rswebpaytransaction/api/webpay/v1.2/transactions/{token}
JSON{ "status":"AUTHORIZED", "amount":19990, "buy_order":"O-123", "authorization_code":"012345" }
StatusGET /rswebpaytransaction/api/webpay/v1.2/transactions/{token}
RefundPOST /rswebpaytransaction/api/webpay/v1.2/transactions/{token}/refunds
C) Notificaciones (Email/SMS/WhatsApp)C.1 — EmailJS (sin backend)Sitio: https://www.emailjs.com/Uso: enviar correo desde el frontend sin servidor.Ejemplo (JS):HTML<script src="[https://cdn.emailjs.com/sdk/3.11.0/email.min.js](https://cdn.emailjs.com/sdk/3.11.0/email.min.js)"></script>
<script>
  (function(){ emailjs.init("PUBLIC_KEY"); })();
  function sendContact() {
    emailjs.send("service_id","template_id", { name, email, message })
      .then(() => console.log("enviado"))
      .catch(console.error);
  }
</script>
C.2 — Twilio (SMS/WhatsApp)Sitio: https://www.twilio.com/Endpoint (mensajes): POST /2010-04-01/Accounts/{AccountSid}/Messages.jsonEjemplo (Node)JavaScriptimport twilio from "twilio";
const client = twilio(ACCOUNT_SID, AUTH_TOKEN);
await client.messages.create({
  from: "whatsapp:+14155238886",
  to: "whatsapp:+569XXXXXXXX",
  body: "Tu pedido #123 fue pagado ✅"
});
APIS internas (Librerías de Node.js y Estructura del Proyecto)La estructura interna se basa en el framework Express.js, utilizando APIs nativas de Node.js (fs, path) y librerías de terceros para la seguridad (jsonwebtoken, bcryptjs).I. APIs de Persistencia (DAO - Data Access Object)I.1 — fs.promises (File System API)Uso: Acceso asíncrono a archivos. Es el motor de persistencia del proyecto (guarda datos en JSON).Librería: Nativa de Node.js.Funcionalidad: Lectura, escritura, creación y verificación de archivos/directorios.Endpoints clave (Funciones del DAO)Lectura de DatosJavaScriptasync function _readAllRaw() {
  const data = await fs.readFile(this.filePath, 'utf8');
  return JSON.parse(data);
}
Ejemplo de uso// JsonClientesDAO.js
const fs = require('fs').promises; 
// ...
const raw = await this._readAllRaw();
Escritura de DatosJavaScriptasync function _writeAllRaw(arr) {
  await fs.writeFile(this.filePath, JSON.stringify(arr, null, 2));
}
Ejemplo de uso// JsonProductosDAO.js
await fs.writeFile(this.filePath, JSON.stringify(productos, null, 2));
II. APIs de Seguridad y AutenticaciónII.1 — jsonwebtoken (jwt)Uso: Crea, firma y verifica los tokens de sesión de los clientes.Librería: jsonwebtoken (Terceros).Funcionalidad: Gestión del ciclo de vida de la sesión (login/auth).Endpoints clave (Middleware auth)Verificación del TokenJavaScriptlet payload;
try {
  payload = jwt.verify(token, secret); // Verifica firma y expiración
} catch {
  // Manejo de token inválido o expirado
}
Ejemplo de uso// SRC/Backend/middlewares/auth.js
const jwt = require('jsonwebtoken');
// ...
payload = jwt.verify(token, secret); // { id, email, role, iat, exp }
II.2 — bcryptjsUso: Hasheo criptográfico de contraseñas.Librería: bcryptjs (Terceros).Funcionalidad: Garantiza que las contraseñas se almacenen de forma segura.Endpoints clave (Función save)Hashear ContraseñaJavaScript// En registro de cliente
passwordHash: bcrypt.hashSync(input.password, 10) // 10 es el factor de coste (salt)
Ejemplo de uso // SRC/Backend/json/JsonClientesDAO.js
const bcrypt = require('bcryptjs');
// ...
passwordHash: bcrypt.hashSync(input.password, 10),
III. APIs de la Aplicación (Express.js Routes)Estas son las rutas principales que se exponen a través del framework Express.FuncionalidadMétodoURL/EndpointFragmento de Código (Ej.)LoginPOST/api/clients/login`app.use('/api/clients/login', strictLimiter);`RegistroPOST/api/clients/register`app.use('/api/clients/register', strictLimiter);`ProductosGET/api/products`app.use('/api/products', productsRouter);`Carrito (Agregar)POST/api/cart`await fetch("/api/cart", { method: "POST", ... });` (Frontend)Carrito (Checkout)POST/api/cart/checkout`await fetch("/api/cart/checkout", { method: "POST" });` (Frontend)AdministraciónGET/POST/.../api/admin/...`app.use('/api/admin', auth, onlyAdminEmail(...), adminRouter);`D) Integración en Fruna:Nutrición : USDA FDC — guardar fdcId en productos.nutricion_ref y mostrar calorías/macros.Pagos : Flow o Webpay Plus; usar urlConfirmation/return_url y registrar pedido al confirmar.Notificaciones : EmailJS (formulario de contacto) o Twilio (SMS/WhatsApp) para avisos de compra.