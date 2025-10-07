// =====================================================
// Carrito FRUNA (sidebar + carrito.html)
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  const isCarritoPage = location.pathname.endsWith("carrito.html");

  const ui = {
    // Sidebar
    sidebar: document.querySelector(".sidebar"),
    overlay: document.querySelector(".sidebar-overlay"),
    cerrarSidebar: document.querySelector(".cerrar-sidebar"),
    carritoBtn: document.querySelector(".btn-shop-bag"),
    contSidebar: document.querySelector(".carrito-items"),
    totalSidebar: document.querySelector(".carrito-total strong"),
    contador: document.getElementById("contadorCarrito"),

    // Página carrito.html
    contPagina: document.querySelector(".carrito-lista"),
    totalPagina: document.querySelector(".resumen-compra .subtotal strong"),
    estadoPagina: document.getElementById("estado-carrito"),
    btnFinalizar: document.querySelector(".btn-buy-bag"),
  };

  let carrito = [];

  // =====================================================
  // Utilidad de API
  // =====================================================
  async function api(url, options = {}) {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      ...options,
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    return res.json();
  }

  // =====================================================
  // Cargar carrito desde backend
  // =====================================================
  async function fetchCart() {
    try {
      const data = await api("/api/cart");
      carrito = Array.isArray(data?.data) ? data.data : [];
      render();
    } catch (err) {
      console.error("[cart] Error al obtener carrito:", err);
      if (isCarritoPage && ui.estadoPagina)
        ui.estadoPagina.textContent = "No se pudo cargar el carrito 😞";
    }
  }

  // =====================================================
  // Render dinámico
  // =====================================================
  function render() {
    const cont = isCarritoPage ? ui.contPagina : ui.contSidebar;
    const totalEl = isCarritoPage ? ui.totalPagina : ui.totalSidebar;
    if (!cont) return;

    cont.innerHTML = "";

    if (!carrito.length) {
      cont.innerHTML = `<p class="mensaje-vacio">Tu carrito está vacío 😞...</p>`;
      if (totalEl) totalEl.textContent = "$0";
      if (ui.contador) ui.contador.textContent = "0";
      return;
    }

    let total = 0;
    carrito.forEach(({ productId, quantity, product = {} }) => {
      const nombre = product.name || "Producto sin nombre";
      const precio = Number(product.price || 0);
      const cantidad = Number(quantity || 1);
      const imagen = product.image?.startsWith("http")
        ? product.image
        : `/img/products/${product.image}`;
      const subtotal = precio * cantidad;
      total += subtotal;

      cont.insertAdjacentHTML(
        "beforeend",
        `
        <div class="carrito-item" data-id="${productId}">
          <img src="${imagen}" alt="${nombre}" class="item-img"/>
          <div class="item-info">
            <p class="item-nombre">${nombre}</p>
            <p class="item-detalle">$${precio.toLocaleString()} c/u</p>
            <div class="item-cantidad">
              <button class="cantidad-btn" data-act="restar" data-id="${productId}">−</button>
              <span class="cantidad-texto">${cantidad}</span>
              <button class="cantidad-btn" data-act="sumar" data-id="${productId}">+</button>
            </div>
          </div>
          <p class="subtotal-item">$${subtotal.toLocaleString()}</p>
          <button class="btn-eliminar" data-act="eliminar" data-id="${productId}">✖</button>
        </div>`
      );
    });

    totalEl.textContent = `$${total.toLocaleString()}`;
    if (ui.contador)
      ui.contador.textContent = carrito.reduce(
        (acc, i) => acc + (Number(i.quantity) || 0),
        0
      );
  }

  // =====================================================
  // Delegación de eventos (global)
  // =====================================================
  document.body.addEventListener("click", async (e) => {
    const btn = e.target.closest(".cantidad-btn, .btn-eliminar, .btn-comprar");
    if (!btn) return;

    try {
      // --- Agregar desde index o productos ---
      if (btn.classList.contains("btn-comprar")) {
        const card = btn.closest(".producto");
        const pid = card?.dataset?.id; 

        if (!pid) {
          console.warn("[carrito] No se encontró ID del producto");
          alert("No se pudo identificar el producto.");
          return;
        }

        try {
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: pid, quantity: 1 }),
          });

          const data = await res.json().catch(() => ({}));
          console.log("[carrito] POST /api/cart →", res.status, data);

          if (!res.ok) {
            if (res.status === 409 || data.error?.toLowerCase().includes("stock")) {
              alert("No hay suficiente stock disponible.");
            } else {
              alert(data.error || "Error al agregar el producto.");
            }
            return;
          }

          // Feedback visual (✔ añadido)
          const original = btn.textContent;
          btn.textContent = "Añadido ✓";
          btn.disabled = true;
          btn.style.background = "linear-gradient(135deg,#43A047,#2E7D32)";
          setTimeout(() => {
            btn.textContent = original;
            btn.disabled = false;
            btn.style.background = "";
          }, 1200);

          await fetchCart();
          if (ui.sidebar) ui.sidebar.classList.add("active");
          if (ui.overlay) ui.overlay.classList.add("active");
        } catch (err) {
          console.error("[carrito] Error al agregar:", err);
          alert("No se pudo conectar con el carrito.");
        }

        return;
      }


      // --- Sumar/restar/eliminar dentro del carrito ---
      const id = btn.dataset.id;
      const act = btn.dataset.act;
      const item = carrito.find((p) => p.productId === id);

      if (!item) {
        console.warn("[carrito] Producto no encontrado en carrito:", id);
        return;
      }

      const stock = Number(item?.product?.stock ?? 0);
      const cantidad = Number(item?.quantity ?? 0);

      if (act === "sumar") {
        // Validación: no permitir más que el stock
        if (stock && cantidad >= stock) {
          const notif = document.getElementById("notif");
          if (notif) {
            notif.textContent = `Solo hay ${stock} unidades disponibles.`;
            notif.classList.add("show");
            setTimeout(() => notif.classList.remove("show"), 2500);
          } else {
            alert(`No puedes agregar más de ${stock} unidades. Stock máximo alcanzado.`);
          }
          return;
        }

        await api("/api/cart", {
          method: "POST",
          body: JSON.stringify({ productId: id, quantity: 1 }),
        });
      } else if (act === "restar") {
        await api("/api/cart", {
          method: "POST",
          body: JSON.stringify({ productId: id, quantity: -1 }),
        });
      } else if (act === "eliminar") {
        await api(`/api/cart/${id}`, { method: "DELETE" });
      }

      await fetchCart();
    } catch (err) {
      console.error("Error al actualizar carrito:", err);
      alert("Error al actualizar carrito.");
    }
  });

  // =====================================================
  // Sidebar control
  // =====================================================
  if (ui.carritoBtn && ui.sidebar) {
    const toggleSidebar = (show) => {
      ui.sidebar.classList.toggle("active", show);
      ui.overlay?.classList.toggle("active", show);
    };
    ui.carritoBtn.addEventListener("click", async () => {
      toggleSidebar(true);
      await fetchCart();
    });
    ui.cerrarSidebar?.addEventListener("click", () => toggleSidebar(false));
    ui.overlay?.addEventListener("click", () => toggleSidebar(false));
  }

  // =====================================================
  // Finalizar compra (redirige o procesa según contexto)
  // =====================================================
  ui.btnFinalizar?.addEventListener("click", async () => {
    if (!carrito.length) return alert("Tu carrito está vacío.");

    // Si no estamos en carrito.html, animar y redirigir
    if (!isCarritoPage) {
      if (ui.sidebar) {
        ui.sidebar.style.transition = "transform 0.4s ease, opacity 0.4s ease";
        ui.sidebar.style.transform = "translateX(-40px)";
        ui.sidebar.style.opacity = "0";
      }
      if (ui.overlay) {
        ui.overlay.style.transition = "opacity 0.4s ease";
        ui.overlay.style.opacity = "0";
      }

      setTimeout(() => {
        window.location.href = "carrito.html";
      }, 400);
      return;
    }

    // Si ya estamos en carrito.html → procesar compra real
    try {
      await api("/api/cart/checkout", { method: "POST" });
      alert("¡Gracias por tu compra!");
      await fetchCart();
    } catch (err) {
      alert("Error al finalizar la compra.");
      console.error(err);
    }
  });

  // =====================================================
  // Simulador de envío dinámico (solo en carrito.html)
  // =====================================================
  if (isCarritoPage) {
    const envioSelect = document.getElementById("envioSelect");
    const subtotalEl = document.getElementById("subtotal");
    const totalEl = document.getElementById("total");

    // Función para calcular total con envío
    const actualizarTotal = () => {
      if (!subtotalEl || !totalEl || !envioSelect) return;
      const subtotal = carrito.reduce((acc, item) => {
        const price = Number(item.product?.price || 0);
        const qty = Number(item.quantity || 0);
        return acc + price * qty;
      }, 0);

      const envio = Number(envioSelect.value || 0);
      subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
      totalEl.textContent = `$${(subtotal + envio).toLocaleString()}`;
    };

    // Actualizar al cambiar opción
    envioSelect?.addEventListener("change", actualizarTotal);

    // Actualizar después de renderizar el carrito
    const originalRender = render;
    render = function () {
      originalRender();
      actualizarTotal();
    };
  }

  // =====================================================
  // Carga inicial
  // =====================================================
  fetchCart();
});
