document.addEventListener('DOMContentLoaded', () => {
  // =============== 1) UI de sesión (nombre + logout) ===============
  const loginLink = document.getElementById('authLoginLink');   // <a href="login_users.html">
  const nameSpan  = document.getElementById('authName');        // <span id="authName">
  const logoutBtn = document.getElementById('authLogoutBtn');   // <button id="authLogoutBtn">
  const authBox   = document.getElementById('authBox');         // contenedor opcional

  // Lee sesión
  const token  = localStorage.getItem('fruna_token');
  const raw    = localStorage.getItem('fruna_user');
  let user = null;
  try { user = raw ? JSON.parse(raw) : null; } catch { user = null; }

  const hasSession = Boolean(token && user && (user.email || user.nombre));
  if (hasSession) {
    const nombreMostrar =
      (user.nombre && String(user.nombre).trim()) ||
      (user.email ? String(user.email).split('@')[0] : 'Usuario');

    if (nameSpan) { nameSpan.textContent = `Hola, ${nombreMostrar}`; nameSpan.style.display = ''; }
    if (logoutBtn) {
      logoutBtn.style.display = '';
      logoutBtn.onclick = () => {
        localStorage.removeItem('fruna_token');
        localStorage.removeItem('fruna_user');
        window.location.replace('/index.html');
      };
    }
    if (loginLink) loginLink.style.display = 'none';
    if (authBox)   authBox.dataset.logged = 'true';
  } else {
    if (nameSpan)  { nameSpan.textContent = ''; nameSpan.style.display = 'none'; }
    if (logoutBtn) { logoutBtn.style.display = 'none'; logoutBtn.onclick = null; }
    if (loginLink) loginLink.style.display = '';
    if (authBox)   authBox.dataset.logged = 'false';
  }

  // =============== 2) Cargar y pintar productos ===============
  const grid = document.getElementById('products-grid'); // <div id="products-grid"></div>
  if (!grid) return;

  grid.innerHTML = '<div class="loading">Cargando productos…</div>';

  const escapeHTML = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m]));

  const fmtCLP = (n) => {
    if (n == null || isNaN(n)) return '';
    try {
      return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
    } catch {
      return `$${Number(n).toLocaleString('es-CL')}`;
    }
  };

  const resolveImage = (val) => {
    const v = String(val || '').trim();
    if (!v) return '/img/placeholder.png';
    if (/^https?:\/\//i.test(v)) return v;
    return `/img/products/${encodeURIComponent(v)}`;
  };

  async function loadProducts() {
    try {
      const res = await fetch('/api/products');
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload.success === false) {
        throw new Error(payload.error || `No se pudo obtener la lista de productos (HTTP ${res.status})`);
      }

      const items = Array.isArray(payload.data) ? payload.data
                  : (Array.isArray(payload) ? payload : []);

      if (!items.length) {
        grid.innerHTML = '<div class="empty">No hay productos disponibles.</div>';
        return;
      }

      grid.innerHTML = items.map((p) => {
        const id    = p.id ?? p._id ?? '';
        const name  = p.name ?? p.nombre ?? 'Producto';
        const price = p.price ?? p.precio;
        const img   = resolveImage(p.image ?? p.imagen);
        const stock = p.stock; // si no manejas stock, asume alto

        return `
          <article class="producto">
            <a class="product-media" href="one_product.html?id=${encodeURIComponent(String(id))}" aria-label="${escapeHTML(name)}">
              <img loading="lazy" src="${escapeHTML(img)}" alt="${escapeHTML(name)}">
            </a>
            <div class="producto-info">
              <h3>
                <a href="one_product.html?id=${encodeURIComponent(String(id))}">${escapeHTML(name)}</a>
              </h3>
              <div class="product-meta">
                <span class="precio">${fmtCLP(price)}</span>
                IVA incluido
              </div>
              <br>
              <div>
                <button
                  class="btn-comprar"
                  data-add-to-cart
                  data-product-id="${escapeHTML(String(id))}"
                  ${stock <= 0 ? 'disabled' : ''}
                >
                  ${stock <= 0 ? 'Sin stock' : 'Añadir al carrito'}
                </button>
              </div>
            </div>
          </article>
        `;
      }).join('');
    } catch (e) {
      grid.innerHTML = `<div class="error">Error: ${escapeHTML(e.message)}</div>`;
    }
  }

  loadProducts();
});