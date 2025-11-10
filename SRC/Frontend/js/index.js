document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.getElementById('authLoginLink');
    const nameSpan  = document.getElementById('authName');
    const logoutBtn = document.getElementById('authLogoutBtn');
    const authBox   = document.getElementById('authBox');

    // Leer sesión
    const token    = localStorage.getItem('fruna_token');
    const rawUser  = localStorage.getItem('fruna_user');
    let user = null;
    try { user = rawUser ? JSON.parse(rawUser) : null; } catch {}

    const hasSession = Boolean(token && user && (user.email || user.nombre));

    if (hasSession) {
        const nombreMostrar = user.nombre?.trim() || (user.email?.split('@')[0] || 'Usuario');

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
        if (nameSpan)  { nameSpan.textContent = ''; nameSpan.style.display = 'none'; }
        if (logoutBtn) { logoutBtn.style.display = 'none'; logoutBtn.onclick = null; }
        if (loginLink) loginLink.style.display = '';
        if (authBox)   authBox.dataset.logged = 'false';
    }
});