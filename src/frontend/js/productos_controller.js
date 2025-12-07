// ================================
// CONFIGURACIÓN
// ================================
const PRODUCTS_PER_PAGE = 20;   // <<-- cambia aquí el número de productos por página
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;

// ================================
// SELECTORES
// ================================
const grid = document.getElementById("products-grid");
const filtros = document.querySelectorAll(".filtros a");
const searchInput = document.createElement("input");
searchInput.className = "search-input";
searchInput.placeholder = "Buscar por nombre o categoría...";
searchInput.style.marginBottom = "20px";

// Insertar buscador arriba del grid
grid.insertAdjacentElement("beforebegin", searchInput);

// Contenedor de paginación
const paginationContainer = document.createElement("div");
paginationContainer.id = "pagination";
paginationContainer.className = "pagination";
grid.insertAdjacentElement("afterend", paginationContainer);

// ================================
// FUNCIONES
// ================================

// Formato CLP
function fmtCLP(n) {
  if (!n) return "";
  try {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0
    }).format(n);
  } catch {
    return `$${Number(n).toLocaleString("es-CL")}`;
  }
}

// Escapar HTML
function escapeHTML(s) {
  return String(s ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}

// Imagen
function resolveImage(v) {
  if (!v) return "/img/placeholder.png";
  const s = String(v).trim();
  if (/^https?:/.test(s)) return s;
  return `/img/products/${encodeURIComponent(s)}`;
}

// ================================
// LOAD PRODUCTS
// ================================
async function loadProducts() {
  try {
    grid.innerHTML = `<div class="loading">Cargando productos…</div>`;

    const res = await fetch("/api/products");
    const payload = await res.json();

    const items = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];

    allProducts = items;
    filteredProducts = items;

    renderProducts();
    renderPagination();
  } catch (err) {
    grid.innerHTML = `<div class="error">Error al cargar productos.</div>`;
  }
}

// ================================
// FILTRAR Y BUSCAR
// ================================
function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();

  filteredProducts = allProducts.filter((p) => {
    const name = (p.name || p.nombre || "").toLowerCase();
    const cat = (p.category || p.categoria || "").toLowerCase();

    return (
      name.includes(query) ||
      cat.includes(query)
    );
  });

  currentPage = 1;
  renderProducts();
  renderPagination();
}

// ================================
// RENDERIZAR PRODUCTOS
// ================================
function renderProducts() {
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE;

  const pageItems = filteredProducts.slice(start, end);

  if (!pageItems.length) {
    grid.innerHTML = `<div class="empty">No hay productos disponibles.</div>`;
    return;
  }

  grid.innerHTML = pageItems
    .map((p) => {
      const id = p.id ?? p._id;
      const name = p.name ?? p.nombre;
      const price = p.price ?? p.precio;
      const img = resolveImage(p.image ?? p.imagen);

      return `
        <article class="producto">
          <a class="product-media" href="one_product.html?id=${encodeURIComponent(id)}">
            <img loading="lazy" src="${escapeHTML(img)}" alt="${escapeHTML(name)}">
          </a>
          <div class="producto-info">
            <h3>
              <a href="one_product.html?id=${encodeURIComponent(id)}">
                ${escapeHTML(name)}
              </a>
            </h3>
            <div class="product-meta">
              <span class="precio">${fmtCLP(price)}</span>
              IVA incluido
            </div>
            <br>
            <button class="btn-comprar" data-add-to-cart data-product-id="${id}">
              Añadir al carrito
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

// ================================
// PAGINACIÓN
// ================================
function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  if (totalPages <= 1) {
    paginationContainer.innerHTML = "";
    return;
  }

  let html = "";

  // botón prev
  html += `<button class="pag-btn" ${currentPage === 1 ? "disabled" : ""} data-page="${currentPage - 1}">◀</button>`;

  // páginas numeradas
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="pag-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
  }

  // botón next
  html += `<button class="pag-btn" ${currentPage === totalPages ? "disabled" : ""} data-page="${currentPage + 1}">▶</button>`;

  paginationContainer.innerHTML = html;

  // eventos
  paginationContainer.querySelectorAll(".pag-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = Number(btn.dataset.page);
      if (page >= 1) {
        currentPage = page;
        renderProducts();
        renderPagination();
      }
    });
  });
}

// ================================
// EVENTOS
// ================================
searchInput.addEventListener("input", applyFilters);

filtros.forEach((enlace) => {
  enlace.addEventListener("click", (e) => {
    e.preventDefault();

    const cat = enlace.dataset.cat.toLowerCase();

    searchInput.value = cat;
    applyFilters();
  });
});

// ================================
// INICIALIZAR
// ================================
document.addEventListener("DOMContentLoaded", loadProducts);
