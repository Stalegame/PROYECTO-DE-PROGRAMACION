
async function apiFetchJSON(input, init = {}) {
  // Añadir headers por defecto
  init = init || {};
  init.headers = Object.assign({
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }, init.headers || {});

  const token = localStorage.getItem('fruna_token')
  if (token) init.headers['Authorization'] = `Bearer ${token}`;

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

// Editar producto
async function getById(id) {
  try {
    const data = await apiFetchJSON(`/api/clients/${encodeURIComponent(id)}`);
    return data.data || null;
  } catch (e) {
    console.error('getById error', e);
    return null;
  }
}

async function editUser(id, changes) {
  try {
    const body = await apiFetchJSON(`/api/clients/${encodeURIComponent(id)}`,{
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
    return body;
  } catch (error) {
    console.error('editUser error', error);
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("profile-form");
  const loading = document.getElementById("loading");

  // Leer sesión
  const token    = localStorage.getItem('fruna_token');
  const rawUser  = localStorage.getItem('fruna_user');

  let user = null;
  user = rawUser ? JSON.parse(rawUser) : null;

  if (!token || !user) {
    window.location.href = "/login.html";
    return;
  }

  // Efectos de enfoque en inputs
  document.querySelectorAll('.form-group input').forEach(input => {
    input.addEventListener('focus', () => {
      const parent = input.parentElement;
      parent.style.transform = 'translateY(-2px)';
      parent.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
    });
    
    input.addEventListener('blur', () => {
      const parent = input.parentElement;
      parent.style.transform = 'translateY(0)';
      parent.style.boxShadow = 'none';
    });
  });

  // Carga de datos de usuario
  setTimeout(async () => {
    loading.style.display = "none";
    form.style.display = "block";

    const usuario = await getById(user.id);
    if (!usuario) {
      alert('No se pudieron cargar los datos del usuario.');
      return;
    }

    document.getElementById('email').value = usuario.email || '';
    document.getElementById('nombre').value = usuario.name || '';
    // Mostrar sin prefijo +569 si existe
    const telRaw = usuario.phone || '';
    document.getElementById('telefono').value = String(telRaw).replace(/^\+569/, '').replace(/[^0-9]/g, '');
    document.getElementById('direccion').value = usuario.address || '';
  }, 300);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const changes = {};
    changes.name = document.getElementById('nombre').value.trim();
    changes.phone = document.getElementById('telefono').value.trim();
    changes.address = document.getElementById('direccion').value.trim();

    try {
      const res = await editUser(user.id, changes);
      // Si el backend devuelve el usuario actualizado, actualizar UI y localStorage
      document.getElementById('nombre').value = res.data.name || '';
      const tel = res.data.phone || '';
      document.getElementById('telefono').value = String(tel).replace(/^\+569/, '').replace(/[^0-9]/g, '');
      document.getElementById('direccion').value = res.data.address || '';

      const safeUser = {
        id: res.data.id,
        nombre: res.data.name,
        email: res.data.email,
        role: res.data.role
      };
      
      localStorage.setItem('fruna_user', JSON.stringify(safeUser));

      const successMsg = document.getElementById('form-success');
      successMsg.textContent = '✅ Cambios guardados con éxito';
      successMsg.style.display = 'block';
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      successMsg.style.display = "none";
    }, 3000);
    } catch (error) {
      const successMsg = document.getElementById('form-success');
      successMsg.textContent = '❌ Error al guardar los cambios';
      successMsg.style.display = 'block';
    }
  })
});