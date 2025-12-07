document.addEventListener('DOMContentLoaded', async () => {
  const carritoBtn       = document.querySelector('.btn-shop-bag');
  const sidebar          = document.querySelector('.sidebar');
  const cerrarSidebar    = document.querySelector('.cerrar-sidebar');
  const overlay          = document.querySelector('.sidebar-overlay');
  const contenedorItems  = document.querySelector('.carrito-items');
  const totalTexto       = document.querySelector('.carrito-total strong');
  const contador         = document.getElementById('contadorCarrito');
  const btnFinalizar     = document.querySelector('.btn-buy-bag');

  // Si intenta agregar al carrito sin estar logueado
  const rawToken = localStorage.getItem('fruna_token');
  if (!rawToken) {
    carritoBtn?.addEventListener('click', () => {
      alert('Debes iniciar sesión para usar el carrito de compras.');
    });
    return;
  }

  // Obtener usuario actual
  const rawUser  = localStorage.getItem('fruna_user');
  const user = rawUser ? JSON.parse(rawUser) : null;

  const userId = user.id;

  let carrito = [];

  // Obtener carrito del usuario
  async function fetchCart() {
    try {
      const res = await fetch(`/api/cart/${userId}`, { cache: 'no-store' });
      const data = await res.json();
      carrito = Array.isArray(data?.data?.items) ? data.data.items : [];
    } catch (err) {
      console.error('Error al cargar carrito:', err.message);
      carrito = [];
    }
  }

  // Agregar producto
  async function agregarProducto(productId, cantidad) {
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity: cantidad })
      });

      console.log(res);

      const data = await res.json();
      if (!res.ok) {
        alert(data?.msg || 'No se pudo agregar el producto');
        return;
      }

      await fetchCart();
      actualizarCarritoUI();
    } catch (err) {
      console.error(err);
      alert('Error al agregar producto al carrito.');
    }
  }

  // Actualizar cantidad
  async function actualizarCantidad(productId, nuevaCantidad) {
    try {
      const res = await fetch(`/api/cart/update/${userId}/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: nuevaCantidad })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.msg || 'No se pudo actualizar la cantidad');
        return;
      }

      await fetchCart();
      actualizarCarritoUI();
    } catch (err) {
      console.error(err);
      alert('Error al actualizar cantidad.');
    }
  }

  // Eliminar producto
  async function eliminarProducto(productId) {
    try {
      const res = await fetch(`/api/cart/remove/${userId}/${productId}`, { method: 'DELETE' });
      if (!res.ok) {
        alert('No se pudo eliminar el producto del carrito');
        return;
      }
      await fetchCart();
      actualizarCarritoUI();
    } catch (err) {
      console.error(err);
    }
  }

  // Renderizar un item
  function renderItem(item) {
    const cantidad = item.quantity || 1;
    const subtotal = cantidad * (item.price || 1);

    const div = document.createElement('div');
    div.className = 'carrito-item';
    div.innerHTML = `
      <img class="item-img" src="/img/products/${item.image}" alt="${item.name}" />
      <div class="item-info">
        <p class="item-nombre">${item.name}</p>
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
  }

  // Actualizar UI del carrito
  function actualizarCarritoUI() {
    if (!contenedorItems || !totalTexto || !contador) return;

    contenedorItems.innerHTML = '';

    if (!carrito.length) {
      contenedorItems.innerHTML = `<p class="mensaje-vacio">Tu carrito está vacío 😞</p>`;
      totalTexto.textContent = '$0';
      contador.textContent = '0';
      return;
    }

    let total = 0;
    carrito.forEach(item => {
      renderItem(item);
      total += (item.price || 0) * (item.quantity || 1);
    });

    totalTexto.textContent = `$${total.toLocaleString()}`;
    contador.textContent = carrito.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);

    // Listeners dinámicos
    contenedorItems.querySelectorAll('.btn-eliminar').forEach(btn => {
      btn.onclick = () => eliminarProducto(btn.dataset.id);
    });

    contenedorItems.querySelectorAll('.btn-sumar').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const item = carrito.find(i => i.productId === id);
        if (item) actualizarCantidad(id, item.quantity + 1);
      };
    });

    contenedorItems.querySelectorAll('.btn-restar').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const item = carrito.find(i => i.productId === id);
        if (item && item.quantity > 1) actualizarCantidad(id, item.quantity - 1);
      };
    });
  }

  // Delegación para "Agregar al carrito"
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-to-cart], .btn-comprar');
    if (!btn) return;
    e.preventDefault();

    const id = btn.dataset.productId || btn.closest('.producto')?.dataset.id;
    if (!id) return;

    agregarProducto(String(id), 1);
    sidebar?.classList.add('active');
    overlay?.classList.add('active');
  });

  // Abrir/cerrar sidebar
  carritoBtn?.addEventListener('click', () => {
    sidebar?.classList.add('active');
    overlay?.classList.add('active');
    fetchCart().then(actualizarCarritoUI);
  });
  cerrarSidebar?.addEventListener('click', () => {
    sidebar?.classList.remove('active');
    overlay?.classList.remove('active');
  });
  overlay?.addEventListener('click', () => {
    sidebar?.classList.remove('active');
    overlay?.classList.remove('active');
  });

  // Finalizar compra
  btnFinalizar?.addEventListener('click', async () => {
    if (!carrito.length) {
      alert('Tu carrito está vacío.');
      return;
    }
    window.location.href = '/confirmar_compra.html';
  });

  // Carga inicial
  await fetchCart();
  actualizarCarritoUI();
});
