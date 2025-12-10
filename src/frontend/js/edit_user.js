
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

async function desactivarCuenta(id, password) {
  try {
    const body = await apiFetchJSON(`/api/clients/${encodeURIComponent(id)}/desactivar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    return body;
  } catch (error) {
    console.error('desactivarCuenta error', error);
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
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
  loading.style.display = "none";
  form.style.display = "block";
  document.getElementById('danger-zone').style.display = "block";

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

  // Guardar cambios de perfil
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const changes = {};
    changes.email = document.getElementById('email').value.trim();
    changes.name = document.getElementById('nombre').value.trim();
    changes.phone = document.getElementById('telefono').value.trim();
    changes.address = document.getElementById('direccion').value.trim();

    if (usuario.email == changes.email) changes.email = undefined;
    if (usuario.name == changes.name) changes.name = undefined;
    if (usuario.phone == changes.phone) changes.phone = undefined;
    if (usuario.address == changes.address) changes.address = undefined;

    try {
      const res = await editUser(user.id, changes);
      // Si el backend devuelve el usuario actualizado, actualizar UI y localStorage
      document.getElementById('email').value = res.data.email || '';
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
      if (error.status == 409) successMsg.textContent = '❌ Correo ya existente. Por favor elige otro';
      else if (error.status == 404) successMsg.textContent = '❌ Usuario no encontrado';
      else successMsg.textContent = '❌ Error al guardar los cambios';
      successMsg.style.display = 'block';
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        successMsg.style.display = "none";
      }, 3000);
    }
  });

  // ====== FUNCIONALIDAD DE DESACTIVAR CUENTA ======
  const btnMostrarDesactivar = document.getElementById('btn-mostrar-desactivar');
  const formDesactivar = document.getElementById('form-desactivar');
  const btnCancelar = document.getElementById('btn-cancelar-desactivar');
  const deactivateError = document.getElementById('deactivate-error');

  // Mostrar formulario de confirmación
  btnMostrarDesactivar.addEventListener('click', () => {
    formDesactivar.style.display = 'block';
    btnMostrarDesactivar.style.display = 'none';
    deactivateError.style.display = 'none';
    document.getElementById('password-confirm-1').value = '';
    document.getElementById('password-confirm-2').value = '';
  });

  // Cancelar desactivación
  btnCancelar.addEventListener('click', () => {
    formDesactivar.style.display = 'none';
    btnMostrarDesactivar.style.display = 'flex';
    deactivateError.style.display = 'none';
    document.getElementById('password-confirm-1').value = '';
    document.getElementById('password-confirm-2').value = '';
  });

  // Confirmar desactivación
  formDesactivar.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const pass1 = document.getElementById('password-confirm-1').value;
    const pass2 = document.getElementById('password-confirm-2').value;

    // Validar que las contraseñas coincidan
    if (pass1 !== pass2) {
      deactivateError.textContent = '❌ Las contraseñas no coinciden';
      deactivateError.style.display = 'block';
      return;
    }

    // Validar que no esté vacía
    if (!pass1 || pass1.trim().length < 8) {
      deactivateError.textContent = '❌ La contraseña debe tener al menos 8 caracteres';
      deactivateError.style.display = 'block';
      return;
    }

    // Confirmar con el usuario
    const confirmar = confirm(
      '⚠️ ÚLTIMA ADVERTENCIA\n\n' +
      'Estás a punto de desactivar tu cuenta.\n' +
      'No podrás iniciar sesión hasta que un administrador la reactive.\n\n' +
      '¿Estás completamente seguro?'
    );

    if (!confirmar) return;

    try {
      // Llamar al backend para desactivar
      await desactivarCuenta(user.id, pass1);

      // Limpiar localStorage
      localStorage.removeItem('fruna_token');
      localStorage.removeItem('fruna_user');

      // Mostrar mensaje y redirigir
      alert('✅ Tu cuenta ha sido desactivada exitosamente.\n\nSerás redirigido a la página de inicio.');
      window.location.href = '/index.html';

    } catch (error) {
      const mensaje = error.message || 'Error al desactivar la cuenta';
      deactivateError.textContent = `❌ ${mensaje}`;
      deactivateError.style.display = 'block';
      
      // Si es error de contraseña incorrecta, limpiar campos
      if (mensaje.toLowerCase().includes('contraseña')) {
        document.getElementById('password-confirm-1').value = '';
        document.getElementById('password-confirm-2').value = '';
      }
    }
  });
});