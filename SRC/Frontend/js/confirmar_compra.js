// /js/confirmar_compra.js

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("productos-container");
  const totalDiv = document.getElementById("total");
  const btnConfirmar = document.getElementById("btn-confirmar");

  let carrito = [];
  let total = 0;

  // 1. Cargar carrito actual desde el backend
  try {
    const res = await fetch("/api/cart", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    carrito = Array.isArray(data?.data) ? data.data : [];
  } catch (err) {
    console.error("Error al cargar carrito:", err.message);
    carrito = [];
  }

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

  // 3. Confirmar compra
  btnConfirmar.onclick = async () => {
    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        alert(data?.error || "No se pudo confirmar la compra.");
        return;
      }

      alert("✅ Compra confirmada con éxito. ¡Gracias por preferir FRUNA!");
      // Redirige a la página principal
      window.location.href = "/index.html";

    } catch (err) {
      console.error("Error en la confirmación:", err);
      alert("Error de conexión. Intenta nuevamente.");
    }
  };
});
