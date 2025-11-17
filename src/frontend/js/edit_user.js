document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('profile-form');
  const loading = document.getElementById('loading');

  /* ------------------------- TOKEN + USER HELPERS ------------------------- */

  function getToken() {
    return localStorage.getItem("fruna_token") || null;
  }

  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

  function getUserId() {
    const token = getToken();
    const payload = token ? parseJwt(token) : null;

    // Intentamos primero desde JWT, luego desde localStorage
    const rawUser = JSON.parse(localStorage.getItem("fruna_user") || "{}");

    return payload?.id || rawUser?.id || null;
  }

  /* ----------------------------- UI HELPERS ----------------------------- */

  function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    form.style.display = show ? 'none' : 'block';
  }

  function showMessage(type, text, id) {
    const el = document.getElementById(id || (type === 'error' ? 'form-message' : 'form-success'));
    if (!el) return;
    el.textContent = text;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
  }

  function populateForm(user) {
    document.getElementById('email').value = user.email || '';
    document.getElementById('nombre').value = user.nombre || '';
    const tel = String(user.telefono || '');
    document.getElementById('telefono').value = tel.replace(/^\+569/, '').replace(/[^0-9]/g, '');
    document.getElementById('direccion').value = user.direccion || '';
  }

  /* -------------------------- GUARDAR CAMBIOS -------------------------- */

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      showMessage('error', 'Token no encontrado. Inicia sesión.');
      return;
    }

    const id = getUserId();
    if (!id) {
      showMessage('error', 'ID de usuario no disponible. Inicia sesión de nuevo.');
      return;
    }

    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const direccion = document.getElementById('direccion').value.trim();

    try {
      const res = await fetch(`/api/clients/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, telefono, direccion })
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok || !body?.success) {
        showMessage('error', body?.error || `Error al guardar (status ${res.status})`);
        return;
      }

      const updated = body.data;
      populateForm(updated);

      localStorage.setItem("fruna_user", JSON.stringify(updated));

      showMessage('success', 'Cambios guardados correctamente.', 'form-success');
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error de comunicación con el servidor');
    }
  });

  /* -------------------------- ELIMINAR / DESACTIVAR -------------------------- */

  const btnEliminar = document.getElementById('btn-eliminar-cuenta');
  const modal = document.getElementById('modal-eliminar');
  const cancelar = document.getElementById('btn-cancelar-eliminar');
  const confirmar = document.getElementById('btn-confirmar-eliminar');
  const passInput = document.getElementById('password-confirm');
  const showPasswordCheckbox = document.getElementById('showPasswordConfirm');
  const modalMessage = document.getElementById('modal-message');

  if (showPasswordCheckbox) {
    showPasswordCheckbox.addEventListener('change', () => {
      passInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
    });
  }

  btnEliminar.addEventListener('click', () => {
    modal.style.display = 'flex';
    modalMessage.style.display = 'none';
    passInput.value = '';
    confirmar.disabled = true;
  });

  cancelar.addEventListener('click', () => {
    modal.style.display = 'none';
    passInput.value = '';
    confirmar.disabled = true;
  });

  passInput.addEventListener('input', () => {
    confirmar.disabled = passInput.value.trim().length === 0;
  });

  confirmar.addEventListener('click', async () => {
    confirmar.disabled = true;
    modalMessage.style.display = 'none';

    try {
      const token = getToken();
      if (!token) throw new Error('No autenticado');

      const id = getUserId();
      if (!id) throw new Error('ID de usuario no disponible');

      const res = await fetch(`/api/clients/${encodeURIComponent(id)}/desactivar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: passInput.value })
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        modalMessage.textContent = body.error || 'No se pudo suspender la cuenta';
        modalMessage.style.display = 'block';
        return;
      }

      modalMessage.textContent = 'Cuenta suspendida correctamente.';
      modalMessage.style.display = 'block';

      setTimeout(() => {
        localStorage.removeItem('fruna_token');
        localStorage.removeItem('fruna_user');
        window.location.href = '/login_users.html';
      }, 1100);

    } catch (err) {
      modalMessage.textContent = err.message || 'Error de comunicación';
      modalMessage.style.display = 'block';
    } finally {
      confirmar.disabled = false;
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      passInput.value = '';
      confirmar.disabled = true;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      modal.style.display = 'none';
      passInput.value = '';
      confirmar.disabled = true;
    }
  });

  /* -------------------------- CARGAR DATOS AL INICIAR -------------------------- */

  (async function init() {
    showLoading(true);

    const token = getToken();
    const id = getUserId();

    if (!token || !id) {
      showLoading(false);
      showMessage('error', 'No se encontró usuario autenticado. Inicia sesión.');
      return;
    }

    try {
      const resp = await fetch(`/api/clients/${encodeURIComponent(id)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok || !data?.success) {
        showMessage('error', data.error || 'No se pudo cargar usuario.');
        showLoading(false);
        return;
      }

      const user = data.data;
      populateForm(user);

      localStorage.setItem("fruna_user", JSON.stringify(user));

    } catch (err) {
      console.error(err);
      showMessage('error', 'Error de comunicación con el servidor');
    }

    showLoading(false);
  })();

});
