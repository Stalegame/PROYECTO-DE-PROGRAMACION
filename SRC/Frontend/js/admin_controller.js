// Frontend/js/admin_controller.js

// ===================== Guardia de sesión/rol + Inyección Authorization =====================
(function guard() {
  const token = localStorage.getItem('fruna_token');
  const userStr = localStorage.getItem('fruna_user');

  const deny = (to) => {
    localStorage.removeItem('fruna_token');
    localStorage.removeItem('fruna_user');
    window.location.replace(to || '/login_users.html');
  };

  if (!token || !userStr) return deny('/login_users.html');

  let user = null;
  try { user = JSON.parse(userStr); } catch { return deny('/login_users.html'); }
  if ((user.role || '').toLowerCase() !== 'admin') return deny('/productos.html');

  // Inyecta Authorization en todos los fetch sin romper cabeceras existentes
  const _fetch = window.fetch;
  window.fetch = (input, init = {}) => {
    const base = init && init.headers ? init.headers : {};
    const headers = base instanceof Headers ? new Headers(base) : new Headers(base);
    if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
    return _fetch(input, { ...init, headers });
  };
})();

// ===================== Utilidades =====================
function escapeHTML(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[m]));
}

function updateDate() {
  const el = document.getElementById('current-date');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ===================== Fetch helper con manejo de errores uniforme =====================
async function apiFetchJSON(input, init) {
  const res = await fetch(input, init);
  let data = null;
  try { data = await res.json(); } catch { /* puede no venir JSON */ }

  const isError = !res.ok || (data && data.success === false);
  if (!isError) return data ?? {};

  const message = (data && (data.error || data.message)) || `Error HTTP ${res.status}`;
  const err = new Error(message);
  err.status = res.status;
  err.code = data && data.code;
  err.details = data && data.details; // <- express-validator
  err.payload = data;
  throw err;
}

function formatApiError(err) {
  const lines = [];
  if (err && err.message) lines.push(err.message);

  // express-validator: details: { campo: { msg, ...}, ... }
  if (err && err.details && typeof err.details === 'object') {
    const msgs = Object.values(err.details)
      .map(v => v && v.msg)
      .filter(Boolean);
    if (msgs.length) lines.push(...msgs);
  }

  // Códigos de negocio del DAO (PRICE_INVALID, STOCK_INVALID, etc.)
  if (err && err.code) lines.push(`Código: ${err.code}`);

  return '• ' + lines.map(escapeHTML).join('\n• ');
}

// ===================== Estado del modal (crear/editar) =====================
let currentEditId = null; // null = creando; string = editando

// ===================== Carga de productos =====================
async function loadProducts() {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6">Cargando productos...</td></tr>';
  try {
    const data = await apiFetchJSON('/api/products');
    const items = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="6">No hay productos.</td></tr>';
      return;
    }
    tbody.innerHTML = items.map(p => `
      <tr>
        <td>${escapeHTML(p.id)}</td>
        <td>${escapeHTML(p.name)}</td>
        <td>${escapeHTML(p.category ?? '')}</td>
        <td>${p.price != null ? `$${p.price}` : ''}</td>
        <td>${p.stock != null ? p.stock : ''}</td>
        <td>
          <button class="btn btn-secondary" data-action="edit" data-id="${escapeHTML(p.id)}">Editar</button>
          <button class="btn" style="background:#f44336;color:white" data-action="del" data-id="${escapeHTML(p.id)}">Eliminar</button>
        </td>
      </tr>`).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6">${formatApiError(e)}</td></tr>`;
  }
}

// ===================== Eliminar producto =====================
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action="del"]');
  if (!btn) return;

  const id = btn.getAttribute('data-id');
  if (!id) return;

  if (!confirm(`¿Seguro que quieres eliminar el producto id: ${id}?`)) return;
  await deleteProduct(id);
});

async function deleteProduct(id) {
  try {
    await apiFetchJSON(`/api/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    alert(`Producto ${id} eliminado correctamente`);
    await loadProducts();
  } catch (e) {
    alert(`No se pudo eliminar:\n${formatApiError(e)}`);
  }
}

// ===================== Editar producto (abrir modal con datos) =====================
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action="edit"]');
  if (!btn) return;

  const id = btn.getAttribute('data-id');
  if (!id) return;

  openProductModalForEditById(id);
});

async function openProductModalForEditById(id) {
  try {
    const data = await apiFetchJSON(`/api/products/${encodeURIComponent(id)}`);
    const p = data.data || data; // por si el backend devuelve el objeto directo
    openProductModalForEdit(p);
  } catch (e) {
    alert(`No se pudo abrir edición:\n${formatApiError(e)}`);
  }
}

// ===================== Modal "Nuevo / Editar Producto" =====================
function np_clear() {
  ['np-name', 'np-price', 'np-stock', 'np-category', 'np-description', 'np-image'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const err = document.getElementById('np-error');
  if (err) { err.style.display = 'none'; err.textContent = ''; }
}

function np_open_create() {
  currentEditId = null;
  np_clear();
  const titleEl = document.getElementById('np-title');
  const saveBtn = document.getElementById('np-save');
  if (titleEl) titleEl.textContent = 'Crear producto';
  if (saveBtn) saveBtn.textContent = 'Crear';
  document.getElementById('modalNewProduct')?.classList.add('show');
  document.getElementById('np-name')?.focus();
}

function openProductModalForEdit(p) {
  currentEditId = p.id;
  np_clear();
  const titleEl = document.getElementById('np-title');
  const saveBtn = document.getElementById('np-save');
  if (titleEl) titleEl.textContent = 'Editar producto';
  if (saveBtn) saveBtn.textContent = 'Guardar cambios';

  // Prellenar
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
  setVal('np-name', p.name);
  setVal('np-price', p.price);
  setVal('np-stock', p.stock);
  setVal('np-category', p.category);
  setVal('np-description', p.description);
  setVal('np-image', p.image);

  document.getElementById('modalNewProduct')?.classList.add('show');
}

function np_close() {
  document.getElementById('modalNewProduct')?.classList.remove('show');
}

async function np_save() {
  const name = document.getElementById('np-name')?.value.trim();
  const priceRaw = document.getElementById('np-price')?.value;
  const stockRaw = document.getElementById('np-stock')?.value;
  const category = document.getElementById('np-category')?.value.trim();
  const description = document.getElementById('np-description')?.value.trim();
  const image = document.getElementById('np-image')?.value.trim();
  const err = document.getElementById('np-error');

  // Validación cliente alineada con el backend:
  const price = Number(priceRaw);
  const stock = Number(stockRaw);

  const problems = [];
  if (!name) problems.push('El nombre es obligatorio');
  if (!(Number.isInteger(price) && price >= 1 && price <= 1_000_000)) problems.push('El precio debe ser un entero entre 1 y 1.000.000');
  if (!(Number.isInteger(stock) && stock >= 0 && stock <= 1_000_000)) problems.push('El stock debe ser un entero entre 0 y 1.000.000');

  if (problems.length) {
    if (err) { err.textContent = '• ' + problems.map(escapeHTML).join('\n• '); err.style.display = 'block'; }
    return;
  }

  const payload = { name, price, stock, category, description, image };

  try {
    if (currentEditId) {
      await apiFetchJSON(`/api/products/${encodeURIComponent(currentEditId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await apiFetchJSON('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    np_close();
    if (typeof loadProducts === 'function') loadProducts();
  } catch (e) {
    if (err) { err.textContent = formatApiError(e); err.style.display = 'block'; }
  }
}

// ===================== Navegación (delegación compatible con CSP) =====================
function activateSection(sectionId, clickedItem) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.toggle('active', s.id === sectionId));
  if (clickedItem) {
    document.querySelectorAll('.sidebar .menu-item').forEach(mi => mi.classList.remove('active'));
    clickedItem.classList.add('active');
  }
  if (sectionId === 'products') loadProducts();
  if (sectionId === 'customers') loadClients();
}

// ===================== Cargar clientes =====================
async function loadClients() {
  const tbody = document.getElementById('clients-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6">Cargando clientes...</td></tr>';
  try {
    const data = await apiFetchJSON('/api/admin/clientes');
    const items = Array.isArray(data.data) ? data.data : [];
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="6">No hay clientes.</td></tr>';
      return;
    }
    tbody.innerHTML = items.map(u => `
      <tr>
        <td>${escapeHTML(u.id)}</td>
        <td>${escapeHTML(u.nombre)}</td>
        <td>${escapeHTML(u.email)}</td>
        <td>${escapeHTML(u.telefono ?? '')}</td>
        <td>${escapeHTML(u.role || 'user')}</td>
        <td><span class="status ${u.activo === false ? 'pending' : 'active'}">${u.activo === false ? 'No' : 'Sí'}</span></td>
      </tr>`).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6">${formatApiError(e)}</td></tr>`;
  }
}

// ===================== Bootstrap inicial =====================
document.addEventListener('DOMContentLoaded', () => {
  updateDate();

  // Sidebar (delegación)
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.addEventListener('click', (e) => {
      const item = e.target.closest('.menu-item');
      if (!item) return;
      if (item.id === 'logoutBtn') {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
          localStorage.removeItem('fruna_token');
          localStorage.removeItem('fruna_user');
          window.location.replace('/login_users.html');
        }
        return;
      }
      const target = item.getAttribute('data-target');
      if (target) activateSection(target, item);
    });
  }

  // Botón "Nuevo producto" abre modal en modo crear
  const btnNew = document.getElementById('btnNewProduct');
  if (btnNew) btnNew.addEventListener('click', np_open_create);

  // Acciones del modal
  document.getElementById('np-close')?.addEventListener('click', np_close);
  document.getElementById('np-cancel')?.addEventListener('click', np_close);
  document.getElementById('np-save')?.addEventListener('click', np_save);

  // Cerrar al hacer click fuera del cuadro
  document.getElementById('modalNewProduct')?.addEventListener('click', (e) => {
    if (e.target.id === 'modalNewProduct') np_close();
  });

  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') np_close();
  });

  // Activa la sección marcada inicialmente en el HTML
  const activeItem = document.querySelector('.sidebar .menu-item.active');
  const initial = activeItem?.getAttribute('data-target') || 'dashboard';
  activateSection(initial, activeItem);
});