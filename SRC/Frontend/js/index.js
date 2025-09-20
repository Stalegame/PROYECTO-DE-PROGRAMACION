// Frontend/js/index.js

document.addEventListener("DOMContentLoaded", () => {
    const carritoBtn = document.querySelector(".btn-shop-bag");
    const sidebar = document.querySelector(".sidebar");

    carritoBtn.addEventListener("click", () => {
        sidebar.classList.toggle("active"); 
    });
});

// --- UI de sesión (mostrar nombre y logout si hay sesión) ---
document.addEventListener('DOMContentLoaded', () => {
  const loginLink = document.getElementById('authLoginLink');   // <a href="login_users.html">
  const nameSpan  = document.getElementById('authName');        // <span id="authName">
  const logoutBtn = document.getElementById('authLogoutBtn');   // <button id="authLogoutBtn">
  const authBox   = document.getElementById('authBox');         // contenedor opcional

  // Si no existen estos elementos en la página, return
  if (!loginLink && !nameSpan && !logoutBtn) return;

  const token  = localStorage.getItem('fruna_token');
  const raw    = localStorage.getItem('fruna_user');

  let user = null;
  try { user = raw ? JSON.parse(raw) : null; } catch { user = null; }

  const hasSession = Boolean(token && user && (user.email || user.nombre));

  if (hasSession) {
    // Construye nombre a mostrar
    const nombreMostrar =
      (user.nombre && String(user.nombre).trim()) ||
      (user.email ? String(user.email).split('@')[0] : 'Usuario');

    if (nameSpan) {
      nameSpan.textContent = `Hola, ${nombreMostrar}`;
      nameSpan.style.display = '';
    }
    if (logoutBtn) {
      logoutBtn.style.display = '';
      // Evita registrar múltiples listeners si recargas módulos
      logoutBtn.onclick = () => {
        localStorage.removeItem('fruna_token');
        localStorage.removeItem('fruna_user');
        // Redirige donde prefieras tras salir:
        window.location.replace('/index.html');
      };
    }
    if (loginLink) loginLink.style.display = 'none';
    if (authBox)   authBox.dataset.logged = 'true';
  } else {
    // Sin sesión: muestra "Iniciar sesión"
    if (nameSpan)  nameSpan.textContent = '', nameSpan.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none', logoutBtn.onclick = null;
    if (loginLink) loginLink.style.display = '';
    if (authBox)   authBox.dataset.logged = 'false';
  }
});