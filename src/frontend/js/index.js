document.addEventListener('DOMContentLoaded', () => {
  // Cargar y pintar productos
  const grid = document.getElementById('products-famous-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="loading">Cargando productos destacados…</div>';

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
      const res = await fetch('/api/products/famous', { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok || payload.success === false) {
        throw new Error(payload.error || `No se pudo obtener la lista de productos (HTTP ${res.status})`);
      }

      const items = Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);

      if (!items.length) {
        grid.innerHTML = '<div class="empty">No hay productos destacados disponibles.</div>';
        return;
      }

      grid.innerHTML = items.map((p) => {
        const id    = p.id ?? '';
        const name  = p.name ?? 'Producto';
        const price = p.price;
        const img   = resolveImage(p.image);

        return `
          <article class="producto">
            <a class="product-media" href="one_product.html?id=${encodeURIComponent(String(id))}" aria-label="${escapeHTML(name)}">
              <img loading="lazy" src="${escapeHTML(img)}" alt="${escapeHTML(name)}">
            </a>
            <div class="producto-info">
              <h3>
                <a>${escapeHTML(name)}</a>
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
                > Añadir al carrito
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