// Frontend/js/login_users.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-login');
  
  if (!form) return;  // por si cargan el script en otra página

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const showPasswordCheckbox = document.getElementById('showPassword');
  const loadingElement = document.getElementById('loading');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Alternar visibilidad de contraseña
  if (showPasswordCheckbox) {
    showPasswordCheckbox.addEventListener('change', () => {
      if (passwordInput) {
        passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = String(emailInput?.value || '').trim();
    const password = String(passwordInput?.value || '');

    if (!email || !password) {
      alert('Por favor, completa todos los campos');
      return;
    }

    // UI: enviando…
    if (loadingElement) loadingElement.style.display = 'block';
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch('/api/clients/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password })
      });

      let data = {};
      try { data = await res.json(); } catch {}

      if (loadingElement) loadingElement.style.display = 'none';
      if (submitBtn) submitBtn.disabled = false;

      if (!res.ok || data.success === false) {
        const msg = (data && data.error) || 'Credenciales incorrectas. Intenta nuevamente.';
        alert(msg);
        return;
      }

      // Guardar sesión
      if (data.token) localStorage.setItem('fruna_token', data.token);
      if (data.user)  localStorage.setItem('fruna_user', JSON.stringify(data.user));

      // Redirección según rol
      const redirect =
        data.redirect ||
        (data.user && data.user.role === 'admin' ? '/admin_controller.html' : '/productos.html');

      window.location.href = redirect;
    } catch {
      if (loadingElement) loadingElement.style.display = 'none';
      if (submitBtn) submitBtn.disabled = false;
      alert('Error de conexión. Intenta nuevamente.');
    }
  });

  // Efecto de enfoque
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => {
      const p = input.parentElement;
      if (!p) return;
      p.style.transform = 'translateY(-2px)';
      p.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
    });
    input.addEventListener('blur', () => {
      const p = input.parentElement;
      if (!p) return;
      p.style.transform = 'translateY(0)';
      p.style.boxShadow = 'none';
    });
  });
});