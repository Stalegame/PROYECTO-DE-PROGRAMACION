document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.getElementById('authLoginLink');
    const nameSpan  = document.getElementById('authName');
    const editBoton = document.getElementById('editUserBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const authBox   = document.getElementById('authBox');

    // Leer sesión
    const token    = localStorage.getItem('fruna_token');
    const rawUser  = localStorage.getItem('fruna_user');
    let user = null;
    user = rawUser ? JSON.parse(rawUser) : null;

    const hasSession = Boolean(token && user && (user.nombre));

    if (hasSession) {
        const nombreMostrar = user.nombre?.trim() || 'Usuario';

        if (nameSpan) {
            nameSpan.textContent = `Hola, ${nombreMostrar}`;
            nameSpan.style.display = '';
        }
        if (editBoton) {
            editBoton.style.display = '';
            editBoton.onclick = () => {
                window.location.replace('/edit_user.html');
            };
        }
        // NUEVO: Mostrar y configurar botón de cerrar sesión
        if (logoutBtn) {
            logoutBtn.style.display = '';
            logoutBtn.onclick = () => {
                // Limpiar localStorage
                localStorage.removeItem('fruna_token');
                localStorage.removeItem('fruna_user');
                // Mostrar mensaje de confirmación
                showNotification('Sesión cerrada correctamente', 'success');
                // Redirigir al login después de un breve delay
                setTimeout(() => {
                    window.location.href = 'login_users.html';
                }, 1500);
            };
        }
        if (loginLink) loginLink.style.display = 'none';
        if (authBox)   authBox.dataset.logged = 'true';
    } else {
        if (nameSpan)  { nameSpan.textContent = ''; nameSpan.style.display = 'none'; }
        if (editBoton) { editBoton.style.display = 'none'; editBoton.onclick = null; }
        if (logoutBtn) { logoutBtn.style.display = 'none'; logoutBtn.onclick = null; }
        if (loginLink) loginLink.style.display = '';
        if (authBox)   authBox.dataset.logged = 'false';
    }
});

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notif = document.getElementById('notif');
    if (!notif) return;
    
    notif.textContent = message;
    notif.className = 'notif show';
    
    // Colores según el tipo
    if (type === 'success') {
        notif.style.background = '#4CAF50';
        notif.style.color = 'white';
    } else if (type === 'error') {
        notif.style.background = '#f44336';
        notif.style.color = 'white';
    } else {
        notif.style.background = 'var(--amarillo)';
        notif.style.color = '#333';
    }
    
    setTimeout(() => {
        notif.classList.remove('show');
    }, 3000);
}