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

  // Cargar carrito desde backend
  async function cargarCarrito() {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      carrito = Array.isArray(data?.data) ? data.data : [];
    } catch (err) {
      console.error("Error al cargar carrito:", err.message);
      carrito = [];
    }

    container.innerHTML = "";
    total = 0;

    carrito.forEach(item => {
      const p = item.product || {};
      const nombre = p.name || p.nombre || "Producto eliminado";
      const precio = Number(p.price ?? p.precio ?? 0);
      const cantidad = Number(item.quantity || 1);
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
          const p = i.product || {};
          const nombre = p.name || p.nombre;
          const precio = Number(p.price ?? p.precio ?? 0);
          const cantidad = Number(i.quantity || 1);
          return `<li>${nombre} x${cantidad} - $${(precio * cantidad).toLocaleString()}</li>`;
        }).join("")}
      </ul>
      <p class="resumen-total"><strong>Total: $${total.toLocaleString()}</strong></p>
    `;

    mostrarPaso("confirmacion", 3);
  };

  btnConfirmar.onclick = async () => {
    const payload = {
      total,
      direccion: direccion.value,
      region: region.value,
      comuna: comuna.value,
      comentarios: comentarios.value,
    };

    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        alert(data?.error || "No se pudo confirmar la compra.");
        return;
      }

      alert("✅ Compra confirmada con éxito. ¡Gracias por preferir FRUNA!");
      window.location.href = "/index.html";
    } catch (err) {
      console.error("Error en la confirmación:", err);
      alert("Error de conexión. Intenta nuevamente.");
    }
  };
});
