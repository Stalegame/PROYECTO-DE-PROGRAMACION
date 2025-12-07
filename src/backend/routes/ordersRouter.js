const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const PersistenceFactory = require('../PersistenceFactory');

// Variables de configuración de PayPal
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API = process.env.PAYPAL_API;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

// Tasa de conversión aproximada CLP a USD (actualizar periódicamente)
const CLP_TO_USD_RATE = 0.0010; // 1 CLP ≈ 0.001 USD (1000 CLP = 1 USD)

// DAO de órdenes
const orderRepo = PersistenceFactory.getDAO('orders');

// ============ UTILIDADES ============

/**
 * Obtiene un token de acceso OAuth de PayPal
 */
async function getPayPalAccessToken() {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error obteniendo token PayPal:', error);
      throw new Error(`PayPal OAuth failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (err) {
    console.error('getPayPalAccessToken error:', err.message);
    throw err;
  }
}

/**
 * Convierte CLP a USD usando tasa de conversión
 */
function convertCLPtoUSD(amountCLP) {
  const usd = Math.round(amountCLP * CLP_TO_USD_RATE * 100) / 100; // Redondear a 2 decimales
  return usd < 0.01 ? 0.01 : usd; // Mínimo 0.01 USD
}

/**
 * Limpia el carrito de un usuario específico
 */
async function clearUserCart(userId) {
  try {

    const response = await fetch(`${FRONTEND_ORIGIN}/api/cart/clear/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      console.warn(`No se pudo limpiar carrito para ${userId}:`, response.status);
      return false;
    }

    //console.log(`✅ Carrito limpiado para usuario: ${userId}`);
    return true;
  } catch (err) {
    console.error('Error al limpiar carrito:', err.message);
    return false;
  }
}

// ============ RUTAS ============

/**
 * POST /api/orders/create
 * Crea una orden en PayPal
 * Body: { items: [...], total, direccion, region, comuna, comentarios }
 * Retorna: { orderId, approvalLink }
 */
router.post('/create', auth, async (req, res) => {
  try {
    const { items, total, direccion, region, comuna, comentarios } = req.body;
    const userId = req.user.id;

    // Validar datos
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Items vacío' });
    }
    if (!total || total <= 0) {
      return res.status(400).json({ success: false, error: 'Total inválido' });
    }
    if (!direccion || !region || !comuna) {
      return res.status(400).json({ success: false, error: 'Faltan datos de entrega' });
    }

    // Obtener token de PayPal
    const accessToken = await getPayPalAccessToken();

    // Calcular subtotal en CLP
    const subtotalCLP = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCLP = 0;
    const taxCLP = 0;
    const orderTotalCLP = subtotalCLP + shippingCLP + taxCLP;

    // Verificar que el total coincida (medida de seguridad)
    if (Math.abs(orderTotalCLP - total) > 0.01) {
      console.warn(`Total mismatch: esperado ${orderTotalCLP}, recibido ${total}`);
      return res.status(400).json({ success: false, error: 'Monto no coincide' });
    }

    // Convertir montos a USD (PayPal sandbox no soporta CLP)
    const orderTotalUSD = convertCLPtoUSD(orderTotalCLP);

    //console.log(`Conversión: ${orderTotalCLP} CLP → ${orderTotalUSD} USD`);

    // Construir desglose de items para PayPal (en USD)
    const itemsPayPal = items.map(item => {
      const priceUSD = convertCLPtoUSD(item.price || 0);
      return {
        name: item.name || 'Producto',
        unit_amount: {
          currency_code: 'USD',
          value: String(priceUSD.toFixed(2))
        },
        quantity: String(item.quantity || 1),
        category: 'PHYSICAL_GOODS'
      };
    });

    // Recalcular subtotal basado en items convertidos (para evitar diferencias de redondeo)
    const calculatedSubtotal = itemsPayPal.reduce((sum, item) => {
      return sum + (parseFloat(item.unit_amount.value) * parseInt(item.quantity));
    }, 0);

    // Asegurar que el total coincida exactamente con el desglose
    const finalSubtotal = parseFloat(calculatedSubtotal.toFixed(2));
    const finalTotal = finalSubtotal; // Sin shipping ni tax

    //console.log(`Desglose PayPal: subtotal=${finalSubtotal}, total=${finalTotal}`);

    // Crear orden en PayPal
    const paypalPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `order_${userId}_${Date.now()}`,
          description: `Compra FRUNA - ${items.length} producto(s) (${orderTotalCLP} CLP)`,
          amount: {
            currency_code: 'USD',
            value: String(finalTotal.toFixed(2)),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: String(finalSubtotal.toFixed(2))
              }
            }
          },
          items: itemsPayPal,
          shipping: {
            name: {
              full_name: req.user.nombre || 'Cliente'
            },
            address: {
              address_line_1: direccion,
              admin_area_2: comuna,
              admin_area_1: region,
              country_code: 'CL'
            }
          }
        }
      ],
      payer: {
        name: {
          given_name: req.user.nombre || 'Cliente',
          surname: ''
        },
        email_address: req.user.email
      },
      application_context: {
        brand_name: 'Dulceria FRUNA',
        locale: 'es-CL',
        return_url: `${FRONTEND_ORIGIN}/exito.html`,
        cancel_url: `${FRONTEND_ORIGIN}/confirmar_compra.html`
      }
    };

    const createOrderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `${Date.now()}-${Math.random()}`
      },
      body: JSON.stringify(paypalPayload)
    });

    if (!createOrderResponse.ok) {
      const errorData = await createOrderResponse.text();
      console.error('PayPal create order error:', errorData);
      return res.status(400).json({ success: false, error: 'No se pudo crear la orden en PayPal' });
    }

    const orderData = await createOrderResponse.json();
    const orderId = orderData.id;
    const approvalLink = orderData.links.find(l => l.rel === 'approve')?.href;

    if (!approvalLink) {
      return res.status(500).json({ success: false, error: 'No approval link from PayPal' });
    }

    // Por ahora solo retornamos el orderId y approvalLink
    //console.log(`Order created: ${orderId} for user ${userId}`);

    res.json({
      success: true,
      orderId,
      approvalLink,
      amount: orderTotalCLP, // Retornar el monto en CLP (original)
      amountUSD: orderTotalUSD // También incluir el monto en USD para referencia
    });

  } catch (err) {
    console.error('Error en /create:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/orders/capture
 * Captura (confirma) el pago de una orden en PayPal
 * Body: { orderId }
 * Retorna: { success, orderId, paidAmount, ... }
 */
router.post('/capture', auth, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'orderId requerido' });
    }

    // Obtener token de PayPal
    const accessToken = await getPayPalAccessToken();

    // Capturar la orden en PayPal
    const captureResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `${Date.now()}-${Math.random()}`
      }
    });

    if (!captureResponse.ok) {
      const errorData = await captureResponse.text();
      console.error('PayPal capture error:', errorData);
      return res.status(400).json({ success: false, error: 'No se pudo capturar el pago' });
    }

    const capturedOrder = await captureResponse.json();
    const status = capturedOrder.status;
    const paidAmount = capturedOrder.purchase_units[0]?.payments?.captures[0]?.amount?.value || 0;

    if (status === 'COMPLETED') {
      //console.log(`Order ${orderId} captured successfully. Amount: ${paidAmount}`);

      // Guardar orden en base de datos con estado PREPARING
      try {
        const orderTotal = parseFloat(paidAmount) / CLP_TO_USD_RATE; // Convertir de USD a CLP para guardar
        const savedOrder = await orderRepo.save({
          clientId: req.user.id,
          totalAmount: Math.round(orderTotal), // Guardar en CLP
          status: 'PREPARING'
        });
        //console.log(`Orden pagada guardada en BD: ${savedOrder.id}`);
      } catch (err) {
        console.warn(`Error al guardar orden pagada en BD: ${err.message}`);
      }

      // Limpiar el carrito del usuario después de pago exitoso
      clearUserCart(req.user.id);

      res.json({
        success: true,
        orderId,
        status,
        paidAmount,
        message: 'Pago capturado exitosamente'
      });
    } else {
      console.warn(`Order ${orderId} status: ${status}`);
      res.status(400).json({
        success: false,
        error: `Pago no completado. Estado: ${status}`
      });
    }

  } catch (err) {
    console.error('Error en /capture:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/orders/:orderId
 * Obtiene el estado de una orden
 */
router.get('/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      return res.status(400).json({ success: false, error: 'Order not found' });
    }

    const order = await response.json();
    res.json({ success: true, data: order });

  } catch (err) {
    console.error('Error en GET /:orderId:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
