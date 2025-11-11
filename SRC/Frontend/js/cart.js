// /js/carrito.js

document.addEventListener("DOMContentLoaded", async () => {
  const carritoBtn       = document.querySelector(".btn-shop-bag");
  const sidebar          = document.querySelector(".sidebar");
  const cerrarSidebar    = document.querySelector(".cerrar-sidebar");
  const overlay          = document.querySelector(".sidebar-overlay");
  const contenedorItems  = document.querySelector(".carrito-items");
  const totalTexto       = document.querySelector(".carrito-total strong");
  const contador         = document.getElementById("contadorCarrito") || document.getElementById("contador");
  const btnFinalizar     = document.querySelector(".btn-buy-bag");

  let carrito = [];

  async function actualizarCarritoProducto(productId, cantidad) {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: String(productId), quantity: Number(cantidad) })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        alert(data?.error || "No se pudo actualizar el carrito");
        return;
      }

      await fetchCart();
      actualizarCarritoUI();
    } catch (err) {
      alert("Error de red al actualizar el carrito");
      console.error(err);
    }
  }

  async function fetchCart() {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      carrito = Array.isArray(data?.data) ? data.data : [];
    } catch (err) {
      console.error("Error al cargar carrito:", err.message);
      carrito = [];
    }
  }

  function actualizarCarritoUI() {
    if (!contenedorItems || !totalTexto || !contador) return;

    contenedorItems.innerHTML = "";

    if (!carrito.length) {
      contenedorItems.innerHTML = `<p class="mensaje-vacio">Tu carrito está vacío 😞...</p>`;
      totalTexto.textContent = "$0";
      contador.textContent = "0";
      return;
    }

    let total = 0;

    carrito.forEach(item => {
      const p         = item.product || {};
      const nombre    = p.name || p.nombre || "Producto eliminado";
      const precio    = Number(p.price ?? p.precio ?? 0);
      const imagen    = p.image || p.imagen || "placeholder.png";
      const cantidad  = Number(item.quantity || 1);
      const subtotal  = precio * cantidad;
      total += subtotal;

      const esAbsoluta = /^https?:\/\//i.test(imagen);
      const src = esAbsoluta ? imagen : `/img/products/${imagen}`;

      const div = document.createElement("div");
      div.className = "carrito-item";
      div.innerHTML = `
        <img class="item-img" src="${src}" alt="${nombre}" />
        <div class="item-info">
          <p class="item-nombre">${nombre}</p>
          <p class="item-detalle">$${subtotal.toLocaleString()}</p>
          <div class="item-cantidad">
            <button class="cantidad-btn btn-restar" data-id="${item.productId}">−</button>
            <span class="cantidad-texto">${cantidad}</span>
            <button class="cantidad-btn btn-sumar" data-id="${item.productId}">+</button>
          </div>
        </div>
        <button class="btn-eliminar" data-id="${item.productId}">✖</button>
      `;
      contenedorItems.appendChild(div);
    });

    totalTexto.textContent = `$${total.toLocaleString()}`;
    contador.textContent = carrito.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);

    // Listeners dinámicos (elementos recién pintados)
    contenedorItems.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        await fetch(`/api/cart/${encodeURIComponent(id)}`, { method: "DELETE" });
        await fetchCart();
        actualizarCarritoUI();
      };
    });

    contenedorItems.querySelectorAll(".btn-sumar").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        actualizarCarritoProducto(id, 1);
      };
    });

    contenedorItems.querySelectorAll(".btn-restar").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const item = carrito.find(p => p.productId === id);
        if (item && item.quantity > 1) {
          actualizarCarritoProducto(id, -1);
        }
      };
    });
  }

  // ================== Delegación para "Añadir al carrito" ==================
  // En lugar de capturar NodeList al cargar (que no incluye productos renderizados después),
  // usamos delegación para que funcione con tarjetas futuras.
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-to-cart], .btn-comprar");
    if (!btn) return;

    // Evita que un <a> padre interrumpa el flujo
    e.preventDefault();
    e.stopPropagation();

    const card = btn.closest(".producto");
    const id = btn.dataset.productId || card?.dataset?.id;
    if (!id) {
      console.warn("[carrito] No se encontró productId en el botón/tarjeta");
      return;
    }

    actualizarCarritoProducto(String(id), 1);
    // Abrir sidebar para feedback
    sidebar?.classList.add("active");
    overlay?.classList.add("active");
  });

  // ================== Abrir/cerrar sidebar ==================
  carritoBtn?.addEventListener("click", () => {
    sidebar?.classList.add("active");
    overlay?.classList.add("active");
    fetchCart().then(actualizarCarritoUI);
  });

  cerrarSidebar?.addEventListener("click", () => {
    sidebar?.classList.remove("active");
    overlay?.classList.remove("active");
  });

  overlay?.addEventListener("click", () => {
    sidebar?.classList.remove("active");
    overlay?.classList.remove("active");
  });

  // ================== Finalizar compra ==================
  btnFinalizar?.addEventListener("click", async () => {
    if (!carrito.length) {
      alert("Tu carrito está vacío.");
      return;
    }
    // redirigir a confirmar_compra.html
    window.location.href = "/confirmar_compra.html";
  });

  // ================== Carga inicial ==================
  await fetchCart();
  actualizarCarritoUI();
});