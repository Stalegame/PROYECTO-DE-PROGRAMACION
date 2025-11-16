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
  return String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
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
  err.details = data && data.details;
  err.payload = data;
  throw err;
}

function formatApiError(err) {
  const lines = [];
  if (err && err.message) lines.push(err.message);

  if (err && err.details && typeof err.details === 'object') {
    const msgs = Object.values(err.details)
      .map(v => v && v.msg)
      .filter(Boolean);
    if (msgs.length) lines.push(...msgs);
  }

  if (err && err.code) lines.push(`Código: ${err.code}`);

  return '• ' + lines.map(escapeHTML).join('\n• ');
}

// ===================== Estado del modal (crear/editar) =====================
let currentEditId = null;
let pendingAction = null;
let pendingUserId = null;

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
    const p = data.data || data;
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

// ===================== GESTIÓN DE CLIENTES - SUSPENSIÓN DE CUENTAS =====================
async function loadClients() {
  const tbody = document.getElementById('clients-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7">Cargando clientes...</td></tr>';
  try {
    const data = await apiFetchJSON('/api/admin/clientes');
    const items = Array.isArray(data.data) ? data.data : [];
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="7">No hay clientes.</td></tr>';
      return;
    }
    
    tbody.innerHTML = items.map(u => {
      const isSuspended = u.activo === false;
      const statusClass = isSuspended ? 'suspended' : 'active';
      const statusText = isSuspended ? 'Suspendido' : 'Activo';
      
      return `
        <tr>
          <td>${escapeHTML(u.id)}</td>
          <td>${escapeHTML(u.nombre)}</td>
          <td>${escapeHTML(u.email)}</td>
          <td>${escapeHTML(u.telefono ?? '')}</td>
          <td>${escapeHTML(u.role || 'user')}</td>
          <td><span class="status ${statusClass}">${statusText}</span></td>
          <td>
            <div class="client-actions">
              ${isSuspended ? 
                `<button class="btn-unsuspend" data-action="unsuspend" data-id="${escapeHTML(u.id)}" data-name="${escapeHTML(u.nombre)}">
                  Reactivar
                </button>` : 
                `<button class="btn-suspend" data-action="suspend" data-id="${escapeHTML(u.id)}" data-name="${escapeHTML(u.nombre)}">
                  Suspender
                </button>`
              }
              <button class="btn-delete-user" data-action="delete-user" data-id="${escapeHTML(u.id)}" data-name="${escapeHTML(u.nombre)}">
                Eliminar
              </button>
            </div>
          </td>
        </tr>`;
    }).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7">${formatApiError(e)}</td></tr>`;
  }
}

// ===================== MANEJO DE ACCIONES DE USUARIO =====================
document.addEventListener('click', async (e) => {
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
  } else if (action === 'delete-user') {
    showConfirmModal(
      `¿Estás seguro de que quieres ELIMINAR permanentemente la cuenta de ${userName}? Esta acción no se puede deshacer.`,
      'Eliminar cuenta',
      () => deleteUser(userId)
    );
  }
});

// ===================== MODAL DE CONFIRMACIÓN =====================
function showConfirmModal(message, title, callback) {
  const modal = document.getElementById('modalConfirmAction');
  const messageEl = document.getElementById('confirm-message');
  const titleEl = document.getElementById('confirm-title');
  const okBtn = document.getElementById('confirm-ok');
  
  if (messageEl) messageEl.textContent = message;
  if (titleEl) titleEl.textContent = title;
  
  // Remover listeners anteriores
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

// ===================== FUNCIONES DE SUSPENSIÓN Y ELIMINACIÓN =====================
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
    alert(`No se pudo completar la acción:\n${formatApiError(e)}`);
  }
}

async function deleteUser(userId) {
  try {
    await apiFetchJSON(`/api/admin/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    
    alert('Cuenta eliminada correctamente');
    await loadClients();
  } catch (e) {
    alert(`No se pudo eliminar la cuenta:\n${formatApiError(e)}`);
  }
}

// ===================== NAVEGACIÓN =====================
function activateSection(sectionId, clickedItem) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.toggle('active', s.id === sectionId));
  if (clickedItem) {
    document.querySelectorAll('.sidebar .menu-item').forEach(mi => mi.classList.remove('active'));
    clickedItem.classList.add('active');
  }
}