# Selección y Documentación de APIs  — Proyecto Fruna
nombre, URL, endpoints relevantes y ejemplo de respuesta.
# APIS externas
## A) Información Nutricional

### A.1 — **USDA FoodData Central (oficial)**
- **Guía:** https://fdc.nal.usda.gov/api-guide.html
- **Base URL:** `https://api.nal.usda.gov/fdc`
- **Auth:** `api_key` (query param).

**Endpoints clave**
1) **Buscar alimentos**
```
GET /v1/foods/search?query={texto}&pageSize=10&api_key={API_KEY}
```
**Ejemplo de respuesta (recortado)**
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
```

2) **Detalle por `fdcId`**
```
GET /v1/food/{fdcId}?api_key={API_KEY}
```
**Ejemplo (recortado)**
```json
{
  "fdcId": 1104067,
  "description": "Banana, raw",
  "labelNutrients": {
    "calories": {"value": 105},
    "protein": {"value": 1.3},
    "fat": {"value": 0.4},
    "carbohydrates": {"value": 27.0}
  }
}
```

---

## B) Pagos / Transacciones (Chile)

### B.1 — **Flow CL**
- **Docs:** https://www.flow.cl/documentacion/api.html
- **Base URL frecuente:** `https://www.flow.cl/api`
- **Flujo común:** crear pago → redirigir a Flow → confirmar/consultar estado.

**Endpoints clave (nombres referenciales)**
1) **Crear pago**
```
POST /payment/create
Body (ej.): {
  "apiKey": "...",
  "amount": 19990,
  "currency": "CLP",
  "subject": "Pedido #123",
  "email": "cliente@correo.com",
  "urlConfirmation": "https://tuapp.com/flow/confirm",
  "urlReturn": "https://tuapp.com/flow/return"
}
```
**Respuesta (recortada)**
```json
{ "token": "abcd1234", "url": "https://www.flow.cl/payment/init/abcd1234" }
```

2) **Estado del pago**
```
GET /payment/getStatus?apiKey=...&token=abcd1234
```
**Respuesta (recortada)**
```json
{ "status": 2, "status_desc": "paid", "amount": 19990, "currency": "CLP" }
```

> **Webhook:** configurar `urlConfirmation` para notificaciones de pago (server-to-server).

---

### B.2 — **Webpay Plus (Transbank)**
- **Docs:** https://www.transbankdevelopers.cl/referencia/webpay
- **Base URL (sandbox):** `https://webpay3gint.transbank.cl` (según ambiente).
- **Flujo:** **crear → redirigir → commit → status/refund**.

**Endpoints clave**
1) **Crear transacción**
```
POST /rswebpaytransaction/api/webpay/v1.2/transactions
Body: { "buy_order":"O-123", "session_id":"S-123", "amount":19990, "return_url":"https://tuapp.com/tbk/return" }
```
**Respuesta (recortada)**
```json
{ "token": "abc123", "url": "https://webpay3gint.transbank.cl/webpayserver/initTransaction" }
```

2) **Commit (confirmar)**
```
PUT /rswebpaytransaction/api/webpay/v1.2/transactions/{token}
```
**Respuesta (recortada)**
```json
{ "status":"AUTHORIZED", "amount":19990, "buy_order":"O-123", "authorization_code":"012345" }
```

3) **Status**
```
GET /rswebpaytransaction/api/webpay/v1.2/transactions/{token}
```

4) **Refund**
```
POST /rswebpaytransaction/api/webpay/v1.2/transactions/{token}/refunds
```


---

## C) Notificaciones (Email/SMS/WhatsApp)

### C.1 — **EmailJS** (sin backend)
- **Sitio:** https://www.emailjs.com/
- **Uso:** enviar correo **desde el frontend** sin servidor.
- **Ejemplo (JS)**:
```html
<script src="https://cdn.emailjs.com/sdk/3.11.0/email.min.js"></script>
<script>
  (function(){ emailjs.init("PUBLIC_KEY"); })();
  function sendContact() {
    emailjs.send("service_id","template_id", { name, email, message })
      .then(() => console.log("enviado"))
      .catch(console.error);
  }
</script>
```

### C.2 — **Twilio** (SMS/WhatsApp)
- **Sitio:** https://www.twilio.com/
- **Endpoint (mensajes):** `POST /2010-04-01/Accounts/{AccountSid}/Messages.json`
- **Ejemplo (Node)**
```js
import twilio from "twilio";
const client = twilio(ACCOUNT_SID, AUTH_TOKEN);
await client.messages.create({
  from: "whatsapp:+14155238886",
  to: "whatsapp:+569XXXXXXXX",
  body: "Tu pedido #123 fue pagado ✅"
});
```

---
# APIS internas
TEXTO

## D) Integración en Fruna:
- **Nutrición :** USDA FDC — guardar `fdcId` en `productos.nutricion_ref` y mostrar calorías/macros.
- **Pagos :** Flow o Webpay Plus; usar `urlConfirmation`/`return_url` y registrar `pedido` al confirmar.
- **Notificaciones :** EmailJS (formulario de contacto) o Twilio (SMS/WhatsApp) para avisos de compra.

---
