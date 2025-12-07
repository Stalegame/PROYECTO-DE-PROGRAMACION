// exito.js - Captura de pago después de aprobación en PayPal
document.addEventListener('DOMContentLoaded', async () => {
  const titleEl = document.getElementById('title');
  const subtitleEl = document.getElementById('subtitle');
  const errorMsgEl = document.getElementById('errorMsg');
  const successMsgEl = document.getElementById('successMsg');
  const orderIdEl = document.getElementById('orderId');
  const orderNumberEl = document.getElementById('orderNumber');
  const detailsEl = document.getElementById('details');
  const btnVolver = document.getElementById('btnVolver');
  const btnDescargar = document.getElementById('btnDescargar');

  const orderId = localStorage.getItem('fruna_orderId');
  const token = localStorage.getItem('fruna_token');
  const user = JSON.parse(localStorage.getItem('fruna_user') || '{}');

  // Validar que tenemos todo lo necesario
  if (!orderId || !token) {
    titleEl.textContent = '❌ Error';
    subtitleEl.textContent = 'No se pudo completar la operación. Datos faltantes.';
    errorMsgEl.textContent = 'Orden o token no encontrado. Por favor intenta nuevamente.';
    errorMsgEl.style.display = 'block';
    btnVolver.style.display = 'inline-block';
    return;
  }

  try {
    // Capturar el pago en el backend
    const captureRes = await fetch('/api/orders/capture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ orderId })
    });

    const captureData = await captureRes.json();

    if (!captureRes.ok || !captureData.success) {
      throw new Error(captureData.error || 'Error al capturar pago');
    }

    // ✅ PAGO EXITOSO
    console.log('✅ Pago capturado:', captureData);

    titleEl.textContent = '✅ ¡Compra Confirmada!';
    subtitleEl.innerHTML = '¡Gracias por tu compra! Tu pago ha sido procesado exitosamente.';
    successMsgEl.style.display = 'block';

    // Mostrar detalles de la orden
    orderIdEl.style.display = 'block';
    orderNumberEl.textContent = orderId;

    detailsEl.style.display = 'block';
    document.getElementById('monto').textContent = `$${Number(captureData.paidAmount || 0).toLocaleString()}`;
    document.getElementById('directionDetail').textContent = localStorage.getItem('fruna_address') || '—';
    document.getElementById('regionDetail').textContent = localStorage.getItem('fruna_region') || '—';
    document.getElementById('comunaDetail').textContent = localStorage.getItem('fruna_comuna') || '—';
    document.getElementById('fecha').textContent = new Date().toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Botones disponibles
    btnVolver.style.display = 'inline-block';
    btnDescargar.style.display = 'inline-block';

    // Limpiar datos del carrito y temporales
    localStorage.removeItem('fruna_orderId');
    localStorage.removeItem('fruna_address');
    localStorage.removeItem('fruna_region');
    localStorage.removeItem('fruna_comuna');

    // Click en "Volver al inicio"
    btnVolver.onclick = () => {
      window.location.href = '/index.html';
    };

    // Click en "Descargar factura" (implementación futura)
    btnDescargar.onclick = () => {
      alert('La descarga de factura estará disponible pronto.\nTu orden es: ' + orderId);
    };

  } catch (err) {
    console.error('❌ Error capturando pago:', err);

    titleEl.textContent = '❌ Error en la Compra';
    subtitleEl.textContent = 'No pudimos procesar tu pago. Por favor intenta nuevamente.';
    errorMsgEl.textContent = err.message;
    errorMsgEl.style.display = 'block';

    btnVolver.style.display = 'inline-block';
    btnVolver.textContent = 'Volver a Confirmar';
    btnVolver.onclick = () => {
      window.location.href = '/confirmar_compra.html';
    };
  }
});
