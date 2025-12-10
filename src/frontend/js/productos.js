document.addEventListener('DOMContentLoaded', () => {
  // Cargar y pintar productos
  const grid = document.getElementById('products-grid');
  const pagination = document.getElementById('pagination');
  if (!grid) return;

  grid.innerHTML = '<div class="loading">Cargando productos…</div>';

  const escapeHTML = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;'
    }[m]));

  const fmtCLP = (n) => {
    if (n == null || isNaN(n)) return '';
    try {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
      }).format(n);
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

  let PRODUCTS_CACHE = [];  
  let currentPage = 1;
  const ITEMS_PER_PAGE = 2;

  function renderPagination(totalItems) {
    if (!pagination) return;

    pagination.innerHTML = "";

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    if (totalPages <= 1) return; // no mostrar paginación si solo hay 1 página

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = "pag-btn";
      if (i === currentPage) btn.classList.add("active");

      btn.addEventListener("click", () => {
        currentPage = i;
        paintPage();
      });

      pagination.appendChild(btn);
    }
  }

  function paintPage() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    const pageItems = PRODUCTS_CACHE.slice(start, end);

    renderProducts(pageItems);
    renderPagination(PRODUCTS_CACHE.length);
  }

  function renderProducts(items) {
    try {
      grid.innerHTML = items.map((p) => {
        const id    = p.id ?? p._id ?? '';
        const name  = p.name ?? p.nombre ?? 'Producto';
        const price = p.price ?? p.precio;
        const img   = resolveImage(p.image ?? p.imagen);
        const stock = p.stock;

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

  function loadProducts(items) {
    PRODUCTS_CACHE = items;
    currentPage = 1;   
    paintPage();  
  }

  async function allProducts() {
    const res = await fetch('/api/products');
    const payload = await res.json();

    if (!res.ok || payload.success === false) {
      throw new Error(payload.error || `No se pudo obtener la lista de productos (HTTP ${res.status})`);
    }

    const items = Array.isArray(payload.data)
      ? payload.data
      : (Array.isArray(payload) ? payload : []);

    if (!items.length) {
      grid.innerHTML = '<div class="empty">No hay productos disponibles.</div>';
      return;
    }

    loadProducts(items);
  }

  async function searchProducts(search) {
    const res = await fetch(`/api/products/search?q=${encodeURIComponent(String(search))}`);
    const payload = await res.json();

    if (!res.ok || payload.success === false) {
      throw new Error(payload.error || `No se pudo buscar productos (HTTP ${res.status})`);
    }

    const items = Array.isArray(payload.data)
      ? payload.data
      : (Array.isArray(payload) ? payload : []);

    if (!items.length) {
      grid.innerHTML = '<div class="empty">No se encontraron productos que coincidan con la búsqueda.</div>';
      pagination.innerHTML = "";
      return;
    }

    loadProducts(items);
  }

  allProducts();

  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');

  if (searchForm && searchInput) {
    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const query = String(e.target.value || '').trim();

      debounceTimer = setTimeout(() => {
        if (query) {
          grid.innerHTML = '<div class="loading">Buscando productos…</div>';
          searchProducts(query);
        } else {
          grid.innerHTML = '<div class="loading">Cargando productos…</div>';
          allProducts();
        }
      }, 500);
    });
  }
});
