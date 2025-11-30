// Frontend/js/admin_controller.js - VERSIÓN COMPLETA

// ===================== GUARDIA DE SESIÓN =====================
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

  // Inyecta Authorization en todos los fetch
  const _fetch = window.fetch;
  window.fetch = (input, init = {}) => {
    const base = init && init.headers ? init.headers : {};
    const headers = base instanceof Headers ? new Headers(base) : new Headers(base);
    if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
    return _fetch(input, { ...init, headers });
  };
})();

// ===================== UTILIDADES =====================
function escapeHTML(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function updateDate() {
  const el = document.getElementById('current-date');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

async function apiFetchJSON(input, init) {
  const res = await fetch(input, init);
  let data = null;
  try { data = await res.json(); } catch { }

  if (!res.ok || (data && data.success === false)) {
    const message = (data && (data.error || data.message)) || `Error HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data ?? {};
}

function setTime(time) {
  const fecha = new Date(time);

  const opciones = {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  };

  const fechaChile = new Intl.DateTimeFormat("es-CL", opciones).format(fecha);

  return fechaChile; 
}

// ===================== NAVEGACIÓN =====================
function activateSection(sectionId, clickedItem) {
  //console.log('Activando sección:', sectionId);

  // Ocultar todas las secciones
  document.querySelectorAll('.content-section').forEach(s => {
    s.classList.remove('active');
  });

  // Mostrar sección seleccionada
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Actualizar menú activo
  document.querySelectorAll('.sidebar .menu-item').forEach(mi => {
    mi.classList.remove('active');
  });

  if (clickedItem) {
    clickedItem.classList.add('active');
  }

  // Cargar datos según la sección
  if (sectionId === 'dashboard') {
    loadResume();
  } else if (sectionId === 'products') {
    loadProducts();
  } else if (sectionId === 'customers') {
    loadClients();
  } else if (sectionId === 'orders') {
    loadOrders();
  }
}

// Cargar Resumen de dashboard
async function loadResume() {
  const dataTotal = await apiFetchJSON('/api/admin/dashboard');

  await loadResumeOrders(dataTotal.data.resumenOrders);
  await loadVentasHoy(dataTotal.data.sumOfDay);
  await loadPending(dataTotal.data.pendingOrders);
  await loadLowStock(dataTotal.data.lowStockProducts);
  await loadCreatedThisMonth(dataTotal.data.createdThisMonth);
}

async function loadResumeOrders(data) {
  const tbody = document.getElementById('orders-resumen-tbody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="5">Cargando resumen de pedidos...</td></tr>';

  try {
    const items = Array.isArray(data) ? data : [];

    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="5">No hay pedidos registrados.</td></tr>';
      return;
    }

    tbody.innerHTML = items.map(o => `
      <tr>
        <td>${escapeHTML(o.id)}</td>
        <td>${escapeHTML(o.client.name)}</td>
        <td>${escapeHTML(setTime(o.createdAt))}</td>
        <td>${escapeHTML(o.totalAmount)}</td>
        <td>${escapeHTML(o.status)}</td>
      </tr>`).join('');

  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6">Error: ${e.message}</td></tr>`;
  }
}

async function loadVentasHoy(data) {
  const tbody = document.getElementById('ventas-hoy');
  if (!tbody) return;
  const items = Array.isArray(data) ? data : [];

  let sumaTotal = 0;
  items.forEach(venta => {
    sumaTotal += venta.totalAmount;
  });

  tbody.innerHTML = `$${sumaTotal}`;
}

async function loadPending(data) {
  const tbody = document.getElementById('pedidos-activos');
  if (!tbody) return;

  tbody.innerHTML = data;
}

async function loadLowStock(data) {
  const tbody = document.getElementById('productos-bajo-stock');
  if (!tbody) return;

  tbody.innerHTML = data
}

async function loadCreatedThisMonth(data) {
  const tbody = document.getElementById('nuevo-clientes');
  if (!tbody) return;
  
  tbody.innerHTML = data;
}


// ===================== GESTIÓN DE CLIENTES =====================
async function loadClients() {
  const tbody = document.getElementById('clients-tbody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7">Cargando clientes...</td></tr>';

  try {
    const data = await apiFetchJSON('/api/admin/users');
    const items = Array.isArray(data.data) ? data.data : [];

    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="7">No hay clientes registrados.</td></tr>';
      return;
    }

    tbody.innerHTML = items.map(u => {
      const isSuspended = u.active === false;
      const statusClass = isSuspended ? 'suspended' : 'active';
      const statusText = isSuspended ? 'Suspendido' : 'Activo';

      return `
        <tr>
          <td>${escapeHTML(u.id)}</td>
          <td>${escapeHTML(u.name)}</td>
          <td>${escapeHTML(u.email)}</td>
          <td>${escapeHTML(u.phone || '')}</td>
          <td>${escapeHTML(u.role)}</td>
          <td><span class="status ${statusClass}">${statusText}</span></td>
          <td>
            <div class="client-actions">
              ${isSuspended ?
          `<button class="btn-unsuspend" data-action="unsuspend" data-id="${escapeHTML(u.id)}" data-name="${escapeHTML(u.name)}">
                  Reactivar
                </button>` :
          `<button class="btn-suspend" data-action="suspend" data-id="${escapeHTML(u.id)}" data-name="${escapeHTML(u.name)}">
                  Suspender
                </button>`
        }
            </div>
          </td>
        </tr>`;
    }).join('');

  } catch (e) {
    console.error('Error cargando clientes:', e);
    tbody.innerHTML = `<tr><td colspan="7">Error al cargar clientes: ${e.message}</td></tr>`;
  }
}

// Manejar acciones de clientes
async function handleClientAction(e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const action = btn.getAttribute('data-action');
  const userId = btn.getAttribute('data-id');
  const userName = btn.getAttribute('data-name');

  if (action === 'suspend') {
    showConfirmModal(
      `¿Estás seguro de que quieres suspender la cuenta de ${userName}?`,
      'Suspender cuenta',
      () => suspendUser(userId, true)
    );
  } else if (action === 'unsuspend') {
    showConfirmModal(
      `¿Estás seguro de que quieres reactivar la cuenta de ${userName}?`,
      'Reactivar cuenta',
      () => suspendUser(userId, false)
    );
  }
}

// ===================== SUSPENSIÓN Y ELIMINACIÓN =====================
async function suspendUser(userId, suspend) {
  try {
    const action = suspend ? 'suspend' : 'unsuspend';
    await apiFetchJSON(`/api/admin/users/${encodeURIComponent(userId)}/${action}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });

    const actionText = suspend ? 'suspendida' : 'reactivada';
    alert(`Cuenta ${actionText} correctamente`);
    await loadClients();
  } catch (e) {
    alert(`Error: ${e.message}`);
  }
}

// ===================== GESTIÓN DE PRODUCTOS =====================
let currentEditId = null;

async function loadProducts() {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6">Cargando productos...</td></tr>';

  try {
    const data = await apiFetchJSON('/api/products');
    const items = Array.isArray(data.data) ? data.data : [];

    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="6">No hay productos.</td></tr>';
      return;
    }

    tbody.innerHTML = items.map(p => `
      <tr>
        <td>${escapeHTML(p.id)}</td>
        <td>${escapeHTML(p.name)}</td>
        <td>${escapeHTML(p.category.name || '')}</td>
        <td>${p.price != null ? `$${p.price}` : ''}</td>
        <td>${p.stock != null ? p.stock : ''}</td>
        <td>
          <button class="btn-edit" data-action="edit" data-id="${escapeHTML(p.id)}">Editar</button>
          <button class="btn-delete" data-action="del" data-id="${escapeHTML(p.id)}">Eliminar</button>
        </td>
      </tr>`).join('');

  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6">Error: ${e.message}</td></tr>`;
  }
}

// Eliminar producto
async function deleteProduct(id) {
  try {
    await apiFetchJSON(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    alert(`Producto ${id} eliminado correctamente`);
    await loadProducts();
  } catch (e) {
    alert(`No se pudo eliminar: ${e.message}`);
  }
}

// Editar producto
async function openProductModalForEditById(id) {
  try {
    const data = await apiFetchJSON(`/api/products/${encodeURIComponent(id)}`);
    const p = data.data || data;
    openProductModalForEdit(p);
  } catch (e) {
    alert(`No se pudo abrir edición: ${e.message}`);
  }
}

// ===================== MODAL PRODUCTOS =====================
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

  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
  setVal('np-name', p.name);
  setVal('np-price', p.price);
  setVal('np-stock', p.stock);
  setVal('np-category', p.category.name);
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
      await apiFetchJSON(`/api/admin/products/${encodeURIComponent(currentEditId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await apiFetchJSON('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    np_close();
    await loadProducts();
  } catch (e) {
    if (err) { err.textContent = e.message; err.style.display = 'block'; }
  }
}

// Cargar Orders
async function loadOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6">Cargando pedidos...</td></tr>';

  try {
    const data = await apiFetchJSON('/api/admin/orders');
    const items = Array.isArray(data.data) ? data.data : [];

    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="6">No hay pedidos registrados.</td></tr>';
      return;
    }

    tbody.innerHTML = items.map(o => `
      <tr>
        <td>${escapeHTML(o.id)}</td>
        <td>${escapeHTML(o.client.name)}</td>
        <td>${escapeHTML(setTime(o.createdAt))}</td>
        <td>${escapeHTML(o.totalAmount)}</td>
        <td>${escapeHTML(o.status)}</td>
        <td>
          <button class="btn-delete"  data-action="del" data-id="${escapeHTML(o.id)}">Eliminar</button>
        </td>
      </tr>`).join('');

  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6">Error: ${e.message}</td></tr>`;
  }
}


// ===================== MODALES =====================
function showConfirmModal(message, title, callback) {
  const modal = document.getElementById('modalConfirmAction');
  const messageEl = document.getElementById('confirm-message');
  const titleEl = document.getElementById('confirm-title');
  const okBtn = document.getElementById('confirm-ok');

  if (messageEl) messageEl.textContent = message;
  if (titleEl) titleEl.textContent = title;

  // Reemplazar botón para evitar múltiples listeners
  const newOkBtn = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOkBtn, okBtn);

  newOkBtn.addEventListener('click', () => {
    callback();
    closeConfirmModal();
  });

  modal.classList.add('show');
}

function closeConfirmModal() {
  document.getElementById('modalConfirmAction')?.classList.remove('show');
}

// ===================== INICIALIZACIÓN =====================
document.addEventListener('DOMContentLoaded', () => {
  //console.log('Admin Controller iniciado');

  // Actualizar fecha
  updateDate();

  // Configurar navegación del sidebar
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.addEventListener('click', (e) => {
      const item = e.target.closest('.menu-item');
      if (!item) return;

      // Manejar logout
      if (item.id === 'logoutBtn') {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
          localStorage.removeItem('fruna_token');
          localStorage.removeItem('fruna_user');
          window.location.replace('/login_users.html');
        }
        return;
      }

      // Manejar navegación
      const target = item.getAttribute('data-target');
      //console.log('Click en menú:', target);
      if (target) {
        activateSection(target, item);
      }
    });
  }

  // Botón "Nuevo producto"
  const btnNew = document.getElementById('btnNewProduct');
  if (btnNew) {
    btnNew.addEventListener('click', np_open_create);
  }

  // Modal de productos
  document.getElementById('np-close')?.addEventListener('click', np_close);
  document.getElementById('np-cancel')?.addEventListener('click', np_close);
  document.getElementById('np-save')?.addEventListener('click', np_save);

  // Modal de confirmación
  document.getElementById('confirm-close')?.addEventListener('click', closeConfirmModal);
  document.getElementById('confirm-cancel')?.addEventListener('click', closeConfirmModal);

  // Cerrar modales al hacer clic fuera
  document.getElementById('modalNewProduct')?.addEventListener('click', (e) => {
    if (e.target.id === 'modalNewProduct') np_close();
  });

  document.getElementById('modalConfirmAction')?.addEventListener('click', (e) => {
    if (e.target.id === 'modalConfirmAction') closeConfirmModal();
  });

  // Delegación de eventos para botones dinámicos
  document.addEventListener('click', (e) => {
    // Botones de clientes
    if (e.target.closest('.client-actions button')) {
      handleClientAction(e);
    }

    // Botones de productos
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');

    if (action === 'del') {
      if (confirm(`¿Eliminar producto ${id}?`)) {
        deleteProduct(id);
      }
    } else if (action === 'edit') {
      openProductModalForEditById(id);
    }
  });

  // Activar sección inicial
  const activeItem = document.querySelector('.sidebar .menu-item.active');
  const initialSection = activeItem?.getAttribute('data-target') || 'dashboard';
  //console.log('Sección inicial:', initialSection);
  activateSection(initialSection, activeItem);
});