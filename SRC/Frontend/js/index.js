document.addEventListener("DOMContentLoaded", () => {
    const loginLink = document.getElementById('authLoginLink');
    const nameSpan  = document.getElementById('authName');
    const editBoton = document.getElementById('editUserBtn');
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
        if (editBoton) {
            editBoton.style.display = '';
            // Evita registrar múltiples listeners si recargas módulos
            editBoton.onclick = () => {
                window.location.replace('/edit_user.html');
            };
        }
        if (loginLink) loginLink.style.display = 'none';
        if (authBox)   authBox.dataset.logged = 'true';
    } else {
        if (nameSpan)  { nameSpan.textContent = ''; nameSpan.style.display = 'none'; }
        if (editBoton) { editBoton.style.display = 'none'; editBoton.onclick = null; }
        if (loginLink) loginLink.style.display = '';
        if (authBox)   authBox.dataset.logged = 'false';
    }
});