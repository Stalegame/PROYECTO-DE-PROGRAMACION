// Frontend/js/one_product.js

document.addEventListener('DOMContentLoaded', () => {
  // =============== 2) UI de sesión (nombre + logout) ===============
  const loginLink = document.getElementById('authLoginLink');
  const nameSpan  = document.getElementById('authName');
  const logoutBtn = document.getElementById('authLogoutBtn');
  const authBox   = document.getElementById('authBox');

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

  // =============== 3) Cargar ficha de producto por ?id= ===============
  const $ = (id) => document.getElementById(id);

  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) {
    alert('Producto no especificado');
    location.replace('/productos.html');
    return;
  }

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

  (async function loadProduct() {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        throw new Error(json.error || 'Producto no encontrado');
      }

      const p = json.data || json;

      $('p-name').textContent = p.name ?? p.nombre ?? 'Producto';
      $('p-price').textContent = fmtCLP(p.price ?? p.precio);
      $('p-category').textContent = p.category ?? p.categoria ?? '';
      $('p-desc').textContent = p.description ?? p.descripcion ?? '';
      $('p-stock').textContent = p.stock ?? '';

      const stock = p.stock;
      const stockElement = document.getElementById("p-stock");

      if (stock > 0) {
        stockElement.textContent = `Cantidad de stock: ${stock}`;
        stockElement.parentElement.style.backgroundColor = "#F1F8E9"; // verde claro
        stockElement.style.color = "#33691E";
      } else {
        stockElement.textContent = "Sin stock";
        stockElement.parentElement.style.backgroundColor = "#FFEBEE"; // rojo claro
        stockElement.parentElement.style.borderColor = "#fc7f7fff";
        stockElement.style.color = "#C62828";
      }

      const img = $('p-image');
      const src = resolveImage(p.image ?? p.imagen);
      img.src = src;
      img.alt = p.name ?? p.nombre ?? 'Producto';

      // Acción de carrito (placeholder)
      const addBtn = document.getElementById('btn-comprar');
      if (addBtn) {
        addBtn.onclick = () => {
          
        };
      }
    } catch (e) {
      alert('Error cargando el producto');
      location.replace('/productos.html');
    }
  })();
});