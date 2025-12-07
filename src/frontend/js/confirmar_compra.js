// /js/confirmar_compra.js
document.addEventListener("DOMContentLoaded", async () => {
  const pasos = {
    carrito: document.getElementById("paso-carrito"),
    entrega: document.getElementById("paso-entrega"),
    confirmacion: document.getElementById("paso-confirmacion"),
  };

  const progresoFill = document.getElementById("progreso-fill");
  const indicadores = [document.getElementById("paso1"), document.getElementById("paso2"), document.getElementById("paso3")];

  const container = document.getElementById("productos-container");
  const totalDiv = document.getElementById("total");
  const resumenDiv = document.getElementById("resumen-compra");

  const btnContinuar = document.getElementById("btn-continuar");
  const btnVolver = document.getElementById("btn-volver");
  const btnVolver2 = document.getElementById("btn-volver2");
  const btnResumen = document.getElementById("btn-resumen");
  const btnConfirmar = document.getElementById("btn-confirmar");

  const direccion = document.getElementById("direccion");
  const region = document.getElementById("region");
  const comuna = document.getElementById("comuna");
  const comentarios = document.getElementById("comentarios");

  let carrito = [];
  let total = 0;
  let pasoActual = 1;

  // Obtener usuario actual
  const rawUser  = localStorage.getItem('fruna_user');
  const user = rawUser ? JSON.parse(rawUser) : null;

  const userId = user.id;

  // Cargar carrito desde backend
  async function cargarCarrito() {
    try {
      const res = await fetch(`/api/cart/${userId}`, { cache: 'no-store' });
      const data = await res.json();
      carrito = Array.isArray(data?.data?.items) ? data.data.items : [];
    } catch (err) {
      console.error('Error al cargar carrito:', err.message);
      carrito = [];
    }

    container.innerHTML = "";
    total = 0;

    carrito.forEach(item => {
      const nombre = item.name || "Producto eliminado";
      const precio = item.price ?? 0;
      const cantidad = item.quantity || 1;
      const subtotal = precio * cantidad;
      total += subtotal;

      const div = document.createElement("div");
      div.classList.add("producto");
      div.innerHTML = `
        <span>${nombre} x${cantidad}</span>
        <span>$${subtotal.toLocaleString()}</span>
      `;
      container.appendChild(div);
    });

    totalDiv.textContent = `Total: $${total.toLocaleString()}`;
  }

  await cargarCarrito();

  // Función para mostrar un paso específico
  function mostrarPaso(nombrePaso, numero) {
    Object.values(pasos).forEach(p => p.classList.remove("activo"));
    pasos[nombrePaso].classList.add("activo");
    pasoActual = numero;

    // Actualizar barra de progreso
    const porcentaje = (numero - 1) / 2 * 100;
    progresoFill.style.width = `${porcentaje}%`;

    // Actualizar texto de pasos
    indicadores.forEach((el, i) => {
      el.classList.toggle("activo", i + 1 <= numero);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  btnContinuar.onclick = () => mostrarPaso("entrega", 2);
  btnVolver.onclick = () => mostrarPaso("carrito", 1);
  btnVolver2.onclick = () => mostrarPaso("entrega", 2);

  btnResumen.onclick = () => {
    if (!direccion.value || !region.value || !comuna.value) {
      alert("Por favor, complete todos los campos requeridos.");
      return;
    }

    // Construir resumen
    resumenDiv.innerHTML = `
      <h3>Resumen de tu compra</h3>
      <p><strong>Dirección:</strong> ${direccion.value}</p>
      <p><strong>Región:</strong> ${region.value}</p>
      <p><strong>Comuna:</strong> ${comuna.value}</p>
      <p><strong>Comentarios:</strong> ${comentarios.value || "Sin comentarios"}</p>
      <hr>
      <h4>Productos:</h4>
      <ul>
        ${carrito.map(i => {
          const nombre = i.name || "Producto eliminado";
          const precio = i.price ?? 0;
          const cantidad = i.quantity || 1;
          return `<li>${nombre} x${cantidad} - $${(precio * cantidad).toLocaleString()}</li>`;
        }).join("")}
      </ul>
      <p class="resumen-total"><strong>Total: $${total.toLocaleString()}</strong></p>
    `;

    mostrarPaso("confirmacion", 3);
  };


  // Click en "Confirmar"
  btnConfirmar.onclick = async () => {
    try {
      btnConfirmar.disabled = true;
      btnConfirmar.textContent = 'Procesando...';

      const token = localStorage.getItem('fruna_token');
      if (!token) {
        alert('Sesión expirada. Por favor inicia sesión nuevamente.');
        window.location.href = '/login_users.html';
        return;
      }

      // Guardar datos de entrega en localStorage para después
      localStorage.setItem('fruna_address', direccion.value);
      localStorage.setItem('fruna_region', region.value);
      localStorage.setItem('fruna_comuna', comuna.value);

      // Crear orden en backend
      const createRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: carrito,
          direccion: direccion.value,
          region: region.value,
          comuna: comuna.value,
          comentarios: comentarios.value,
          total
        })
      });

      const createData = await createRes.json();

      if (!createRes.ok || !createData.success) {
        alert(`Error: ${createData.error || 'No se pudo crear la orden'}`);
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = 'Confirmar y Pagar';
        return;
      }

      const { orderId, approvalLink } = createData;

      if (!approvalLink) {
        alert('Error al obtener enlace de PayPal');
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = 'Confirmar y Pagar';
        return;
      }

      // Guardar orderId en localStorage
      localStorage.setItem('fruna_orderId', orderId);

      // Redirigir a PayPal para que apruebe
      window.location.href = approvalLink;

    } catch (err) {
      console.error('Error al confirmar compra:', err);
      alert(`Error de conexión: ${err.message}`);
      btnConfirmar.disabled = false;
      btnConfirmar.textContent = 'Confirmar y Pagar';
    }
  };
});