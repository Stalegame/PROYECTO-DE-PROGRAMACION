// Frontend/js/crear_user.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-registro');
  const loading = document.getElementById('loading');

  if (!form) return; // por si cargan el script en otra página

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('.btn-registrar');
    if (btn) btn.disabled = true;
    if (loading) loading.style.display = 'block';

    const fd = new FormData(form);
    const body = new URLSearchParams(fd);

    try {
      const res = await fetch('/api/clients/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });

      let data = {};
      try { data = await res.json(); } catch {}

      if (!res.ok || data.success === false) {
        let msg ='No se pudo registrar. Revisa tus datos.';
        if (data && data.details) {
          const details = Array.isArray(data.details)
            ? data.details
            : Object.values(data.details).map(d => d.msg || d);
          if (details && details.length) msg += '\n- ' + details.join('\n- ');
        }
        alert(msg);
        return;
      }

      alert('¡Registro exitoso! Ya puedes iniciar sesión.');
      window.location.href = '/login_users.html';
    } catch {
      alert('Error de conexión. Intenta nuevamente.');
    } finally {
      if (btn) btn.disabled = false;
      if (loading) loading.style.display = 'none';
    }
  });

  // Efectos de enfoque
  document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('focus', () => {
      const p = el.parentElement; if (!p) return;
      p.style.transform = 'translateY(-2px)';
      p.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
    });
    el.addEventListener('blur', () => {
      const p = el.parentElement; if (!p) return;
      p.style.transform = 'translateY(0)';
      p.style.boxShadow = 'none';
    });
  });
});