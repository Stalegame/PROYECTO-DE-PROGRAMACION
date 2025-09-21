// Frontend/js/admin_controller.js

// ===== Guardia de sesión/rol =====
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
    init.headers = Object.assign({}, init.headers, { Authorization: `Bearer ${token}` });
    return _fetch(input, init);
  };
})();

// ===== Utilidades =====
function escapeHTML(s){return String(s??'').replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function updateDate(){
  const el=document.getElementById('current-date');
  if(!el) return;
  const now=new Date();
  el.textContent=now.toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
}

// ======= Estado del modal (crear/editar) =======
let currentEditId = null; // null = creando; string = editando

// ===== Carga de productos =====
async function loadProducts(){
  const tbody=document.getElementById('products-tbody');
  if(!tbody) return;
  tbody.innerHTML='<tr><td colspan="6">Cargando productos...</td></tr>';
  try{
    const res=await fetch('/api/products');
    const data=await res.json();
    if(!res.ok||data.success===false) throw new Error(data.error||'Error cargando productos');
    const items=Array.isArray(data.data)?data.data:(Array.isArray(data)?data:[]);
    if(!items.length){tbody.innerHTML='<tr><td colspan="6">No hay productos.</td></tr>';return;}
    tbody.innerHTML=items.map(p=>`
      <tr>
        <td>${escapeHTML(p.id)}</td>
        <td>${escapeHTML(p.name)}</td>
        <td>${escapeHTML(p.category??'')}</td>
        <td>${p.price!=null?`$${p.price}`:''}</td>
        <td>${p.stock!=null?p.stock:''}</td>
        <td>
          <button class="btn btn-secondary" data-action="edit" data-id="${escapeHTML(p.id)}">Editar</button>
          <button class="btn" style="background:#f44336;color:white" data-action="del" data-id="${escapeHTML(p.id)}">Eliminar</button>
        </td>
      </tr>`).join('');
  }catch(e){
    tbody.innerHTML=`<tr><td colspan="6">Error: ${escapeHTML(e.message)}</td></tr>`;
  }
}

// ====== Eliminar producto ======
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
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json().catch(()=> ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.error || 'Error eliminando producto');
    }

    alert(`Producto ${id} eliminado correctamente`);
    await loadProducts();
  } catch (err) {
    alert(`No se pudo eliminar: ${err.message}`);
  }
}

// ====== Editar producto (reutiliza el modal) ======
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action="edit"]');
  if (!btn) return;

  const id = btn.getAttribute('data-id');
  if (!id) return;

  try {
    // Trae datos actuales del producto para prellenar el modal
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
    const data = await res.json().catch(()=> ({}));
    if (!res.ok || data.success === false) {
      throw new Error(data.error || 'No se pudo cargar el producto');
    }
    const p = data.data || data; // por si tu API devuelve directo el objeto

    openProductModalForEdit(p); // abre el modal en modo edición
  } catch (err) {
    alert(`No se pudo abrir edición: ${err.message}`);
  }
});

// ====== Modal "Nuevo / Editar Producto" ======
function np_clear() {
  ['np-name','np-price','np-stock','np-category','np-description','np-image'].forEach(id=>{
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const err = document.getElementById('np-error');
  if (err) { err.style.display='none'; err.textContent=''; }
}

function np_open_create() {
  currentEditId = null;
  np_clear();
  const titleEl = document.getElementById('np-title');
  const saveBtn = document.getElementById('np-save');
  if (titleEl) titleEl.textContent = 'Crear producto';
  if (saveBtn)  saveBtn.textContent = 'Crear';
  document.getElementById('modalNewProduct')?.classList.add('show');
  document.getElementById('np-name')?.focus();
}

function openProductModalForEdit(p) {
  currentEditId = p.id;
  np_clear();
  const titleEl = document.getElementById('np-title');
  const saveBtn = document.getElementById('np-save');
  if (titleEl) titleEl.textContent = `Editar producto`;
  if (saveBtn)  saveBtn.textContent = 'Guardar cambios';

  // Prellenar
  document.getElementById('np-name') && (document.getElementById('np-name').value = p.name ?? '');
  document.getElementById('np-price') && (document.getElementById('np-price').value = p.price ?? '');
  document.getElementById('np-stock') && (document.getElementById('np-stock').value = p.stock ?? '');
  document.getElementById('np-category') && (document.getElementById('np-category').value = p.category ?? '');
  document.getElementById('np-description') && (document.getElementById('np-description').value = p.description ?? '');
  document.getElementById('np-image') && (document.getElementById('np-image').value = p.image ?? '');

  document.getElementById('modalNewProduct')?.classList.add('show');
}

function np_close() {
  document.getElementById('modalNewProduct')?.classList.remove('show');
}

async function np_save() {
  const name = document.getElementById('np-name')?.value.trim();
  const price = Number(document.getElementById('np-price')?.value);
  const stock = Number(document.getElementById('np-stock')?.value);
  const category = document.getElementById('np-category')?.value.trim();
  const description = document.getElementById('np-description')?.value.trim();
  const image = document.getElementById('np-image')?.value.trim();
  const err = document.getElementById('np-error');

  // Validación mínima
  const problems = [];
  if (!name) problems.push('El nombre es obligatorio');
  if (!Number.isFinite(price) || price < 0) problems.push('Precio inválido');
  if (!Number.isInteger(stock) || stock < 0) problems.push('Stock inválido');

  if (problems.length) {
    if (err) { err.textContent = '• ' + problems.join('\n• '); err.style.display = 'block'; }
    return;
  }

  const payload = { name, price, stock, category, description, image };

  try {
    let res;
    if (currentEditId) {
      // Editando
      res = await fetch(`/api/products/${encodeURIComponent(currentEditId)}`, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      // Creando
      res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json().catch(()=> ({}));
    if (!res.ok || data.success === false) {
      throw new Error(data.error || 'No se pudo guardar el producto');
    }

    np_close();
    if (typeof loadProducts === 'function') loadProducts();
  } catch (e) {
    if (err) { err.textContent = e.message; err.style.display = 'block'; }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Botón en la cabecera de Productos -> abrir modal en modo crear
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
});

// ===== Navegación (delegación compatible con CSP) =====
function activateSection(sectionId, clickedItem){
  document.querySelectorAll('.content-section').forEach(s=>s.classList.toggle('active', s.id===sectionId));
  if(clickedItem){
    document.querySelectorAll('.sidebar .menu-item').forEach(mi=>mi.classList.remove('active'));
    clickedItem.classList.add('active');
  }
  if(sectionId==='products')  loadProducts();
  if(sectionId==='customers') loadClients();
}

// ===== Cargar clientes =====
async function loadClients(){
  const tbody=document.getElementById('clients-tbody');
  if(!tbody) return;
  tbody.innerHTML='<tr><td colspan="6">Cargando clientes...</td></tr>';
  try{
    const res=await fetch('/api/admin/clientes');
    const data=await res.json();
    if(!res.ok||data.success===false) throw new Error(data.error||'Error cargando clientes');
    const items=Array.isArray(data.data)?data.data:[];
    if(!items.length){tbody.innerHTML='<tr><td colspan="6">No hay clientes.</td></tr>';return;}
    tbody.innerHTML=items.map(u=>`
      <tr>
        <td>${escapeHTML(u.id)}</td>
        <td>${escapeHTML(u.nombre)}</td>
        <td>${escapeHTML(u.email)}</td>
        <td>${escapeHTML(u.telefono??'')}</td>
        <td>${escapeHTML(u.role||'user')}</td>
        <td><span class="status ${u.activo===false?'pending':'active'}">${u.activo===false?'No':'Sí'}</span></td>
      </tr>`).join('');
  }catch(e){
    tbody.innerHTML=`<tr><td colspan="6">Error: ${escapeHTML(e.message)}</td></tr>`;
  }
}

// ====== Bootstrap inicial ======
document.addEventListener('DOMContentLoaded', () => {
  updateDate();

  // Delegación en la sidebar
  const sidebar=document.querySelector('.sidebar');
  if(sidebar){
    sidebar.addEventListener('click',(e)=>{
      const item=e.target.closest('.menu-item');
      if(!item) return;
      if(item.id==='logoutBtn'){
        if(confirm('¿Estás seguro de que quieres cerrar sesión?')){
          localStorage.removeItem('fruna_token');
          localStorage.removeItem('fruna_user');
          window.location.replace('/login_users.html');
        }
        return;
      }
      const target=item.getAttribute('data-target');
      if(target) activateSection(target, item);
    });
  }

  // Activa la sección marcada inicialmente en el HTML
  const initial = document.querySelector('.sidebar .menu-item.active')?.getAttribute('data-target') || 'dashboard';
  activateSection(initial, document.querySelector('.sidebar .menu-item.active'));
});