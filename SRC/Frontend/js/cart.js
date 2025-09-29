// /js/carrito.js

document.addEventListener("DOMContentLoaded", async () => {
  const carritoBtn     = document.querySelector(".btn-shop-bag");
  const sidebar        = document.querySelector(".sidebar");
  const cerrarSidebar  = document.querySelector(".cerrar-sidebar");
  const overlay        = document.querySelector(".sidebar-overlay");
  const contenedorItems = document.querySelector(".carrito-items");
  const totalTexto     = document.querySelector(".carrito-total strong");
  const contador       = document.getElementById("contadorCarrito") || document.getElementById("contador");
  const btnFinalizar   = document.querySelector(".btn-buy-bag");
  const botonesComprar = document.querySelectorAll(".btn-comprar");

  let carrito = [];

  async function actualizarCarritoProducto(productId, cantidad) {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: cantidad })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo actualizar el carrito");
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
      const res = await fetch("/api/cart");
      const data = await res.json();
      carrito = data.data || [];
    } catch (err) {
      console.error("Error al cargar carrito:", err.message);
      carrito = [];
    }
  }

  function actualizarCarritoUI() {
    if (!contenedorItems || !totalTexto || !contador) return;

    contenedorItems.innerHTML = "";

    if (carrito.length === 0) {
      contenedorItems.innerHTML = `<p class="mensaje-vacio">Tu carrito está vacío 😞...</p>`;
      totalTexto.textContent = "$0";
      contador.textContent = "0";
      return;
    }

    let total = 0;

    carrito.forEach(item => {
      const p = item.product || {};
      const nombre = p.name || "Producto eliminado";
      const precio = p.price || 0;
      const imagen = p.image || "placeholder.png";
      const cantidad = item.quantity || 1;
      const subtotal = precio * cantidad;
      total += subtotal;

      const div = document.createElement("div");
      div.className = "carrito-item";
      div.innerHTML = `
        <img class="item-img" src="/img/products/${imagen}" alt="${nombre}" />
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
    contador.textContent = carrito.reduce((acc, p) => acc + p.quantity, 0);

    // Listeners dinámicos
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        await fetch(`/api/cart/${id}`, { method: "DELETE" });
        await fetchCart();
        actualizarCarritoUI();
      };
    });

    document.querySelectorAll(".btn-sumar").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        actualizarCarritoProducto(id, 1);
      };
    });

    document.querySelectorAll(".btn-restar").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const item = carrito.find(p => p.productId === id);
        if (item && item.quantity > 1) {
          actualizarCarritoProducto(id, -1);
        }
      };
    });
  }

  // Botón de compra en cards de productos
  botonesComprar.forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".producto");
      const id = card?.dataset?.id;
      if (!id) return;

      actualizarCarritoProducto(id, 1);
      sidebar?.classList.add("active");
      overlay?.classList.add("active");
    });
  });

  // Abrir/cerrar sidebar
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

  // Finalizar compra
  btnFinalizar?.addEventListener("click", async () => {
    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    try {
      const res = await fetch("/api/cart/checkout", { method: "POST" });
      if (!res.ok) throw new Error("Error al finalizar compra");
      alert("¡Gracias por tu compra!");
      await fetchCart();
      actualizarCarritoUI();
    } catch (err) {
      alert("Error al procesar compra: " + err.message);
    }
  });

  // Carga inicial
  await fetchCart();
  actualizarCarritoUI();
});
