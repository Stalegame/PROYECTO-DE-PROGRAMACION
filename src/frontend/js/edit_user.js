// Frontend/js/edit_user.js - VERSIÓN COMPLETA CON SUSPENSIÓN

document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const menuItems = document.querySelectorAll('.menu-item');
  const contentSections = document.querySelectorAll('.content-section');
  const welcomeText = document.getElementById('welcome-text');
  const logoutBtn = document.getElementById('logoutBtn');

  // Verificar autenticación
  const token = localStorage.getItem('fruna_token');
  const userStr = localStorage.getItem('fruna_user');
  
  if (!token || !userStr) {
    window.location.href = '/login_users.html';
    return;
  }

  let currentUser = null;
  try {
    currentUser = JSON.parse(userStr);
    welcomeText.textContent = `Bienvenido, ${currentUser.nombre || 'Usuario'}`;
  } catch {
    window.location.href = '/login_users.html';
    return;
  }

  // Navegación entre secciones
  menuItems.forEach(item => {
    if (item.id !== 'logoutBtn') {
      item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        activateSection(target, item);
      });
    }
  });

  function activateSection(sectionId, clickedItem) {
    // Actualizar secciones
    contentSections.forEach(section => {
      section.classList.toggle('active', section.id === sectionId);
    });
    
    // Actualizar menú
    menuItems.forEach(item => {
      if (item.id !== 'logoutBtn') {
        item.classList.remove('active');
      }
    });
    
    if (clickedItem) {
      clickedItem.classList.add('active');
    }

    // Cargar datos específicos de la sección
    if (sectionId === 'informacion') {
      loadUserInfo();
    } else if (sectionId === 'editar') {
      loadEditForm();
    } else if (sectionId === 'pedidos') {
      loadUserOrders();
    }
    // La sección de suspensión no necesita carga inicial
  }

  // Cargar información del usuario
  async function loadUserInfo() {
    const loading = document.getElementById('loading-info');
    const profileInfo = document.getElementById('profile-info');
    
    try {
      const userData = await fetchUserData();
      
      document.getElementById('info-nombre').textContent = userData.nombre || 'No especificado';
      document.getElementById('info-email').textContent = userData.email || 'No especificado';
      document.getElementById('info-telefono').textContent = userData.telefono || 'No especificado';
      document.getElementById('info-direccion').textContent = userData.direccion || 'No especificado';
      
      loading.style.display = 'none';
      profileInfo.style.display = 'grid';
      
    } catch (error) {
      console.error('Error cargando información:', error);
      loading.innerHTML = '❌ Error al cargar la información';
    }
  }

  // Cargar formulario de edición
  async function loadEditForm() {
    const loading = document.getElementById('loading-edit');
    const form = document.getElementById('profile-form');
    
    try {
      const userData = await fetchUserData();
      
      document.getElementById('email').value = userData.email || '';
      document.getElementById('nombre').value = userData.nombre || '';
      document.getElementById('telefono').value = userData.telefono || '';
      document.getElementById('direccion').value = userData.direccion || '';
      
      loading.style.display = 'none';
      form.style.display = 'block';
      
    } catch (error) {
      console.error('Error cargando formulario:', error);
      loading.innerHTML = '❌ Error al cargar el formulario';
    }
  }

  // Cargar pedidos del usuario
  async function loadUserOrders() {
    const loading = document.getElementById('loading-orders');
    const ordersGrid = document.getElementById('orders-grid');
    const noOrders = document.getElementById('no-orders');
    
    try {
      // Simular carga de pedidos - reemplazar con tu API real
      setTimeout(() => {
        // Por ahora muestra mensaje de no pedidos
        loading.style.display = 'none';
        noOrders.style.display = 'block';
        
        // Para implementar con API real:
        // const orders = await fetchUserOrders();
        // renderOrders(orders);
      }, 1000);
      
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      loading.innerHTML = '❌ Error al cargar los pedidos';
    }
  }

  // Función para obtener datos del usuario
  async function fetchUserData() {
    const response = await fetch(`/api/clients/${currentUser.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al cargar datos del usuario');
    }

    const data = await response.json();
    return data.data || data; // Soporta ambas estructuras de respuesta
  }

  // Manejar envío del formulario
  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('btn-save');
    const originalText = submitBtn.innerHTML;
    
    // Mostrar loading en el botón
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    submitBtn.disabled = true;
    
    const successMsg = document.getElementById('form-success');
    const errorMsg = document.getElementById('form-message');
    
    // Ocultar mensajes anteriores
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    // Obtener datos del formulario
    const formData = {
      nombre: document.getElementById('nombre').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      direccion: document.getElementById('direccion').value.trim()
    };

    // Validaciones
    if (!formData.nombre) {
      showError('El nombre es obligatorio');
      resetButton(submitBtn, originalText);
      return;
    }

    if (!formData.telefono) {
      showError('El teléfono es obligatorio');
      resetButton(submitBtn, originalText);
      return;
    }

    if (!/^\d{8,9}$/.test(formData.telefono)) {
      showError('El teléfono debe tener 8 o 9 dígitos');
      resetButton(submitBtn, originalText);
      return;
    }

    try {
      const response = await fetch(`/api/clients/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar el perfil');
      }

      // Actualizar datos en localStorage
      if (result.user) {
        localStorage.setItem('fruna_user', JSON.stringify(result.user));
        currentUser = result.user;
        welcomeText.textContent = `Bienvenido, ${currentUser.nombre}`;
      }

      // Mostrar mensaje de éxito
      showSuccess('✅ Perfil actualizado correctamente');
      
      // Resetear el botón
      resetButton(submitBtn, originalText);

      // Actualizar la sección de información
      loadUserInfo();

    } catch (error) {
      console.error('Error:', error);
      showError(error.message || 'Error al guardar los cambios');
      resetButton(submitBtn, originalText);
    }
  });

  // SUSPENDER CUENTA - NUEVA FUNCIONALIDAD
  document.getElementById('btn-suspender-cuenta')?.addEventListener('click', suspendUserAccount);

  async function suspendUserAccount() {
    const btn = document.getElementById('btn-suspender-cuenta');
    const messageEl = document.getElementById('suspend-message');
    
    if (!confirm('¿Estás completamente seguro de que quieres suspender tu cuenta?\n\n⚠️  Esta acción no se puede deshacer por ti mismo. Solo un administrador puede reactivar tu cuenta.')) {
      return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Suspendiendo...';
    btn.disabled = true;
    messageEl.style.display = 'none';

    try {
      const response = await fetch(`/api/clients/${currentUser.id}/suspend`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al suspender la cuenta');
      }

      // Cerrar sesión y redirigir
      localStorage.removeItem('fruna_token');
      localStorage.removeItem('fruna_user');
      
      alert('✅ Tu cuenta ha sido suspendida. Para reactivarla contacta a un administrador.');
      window.location.href = '/index.html';

    } catch (error) {
      console.error('Error:', error);
      messageEl.textContent = `❌ ${error.message}`;
      messageEl.style.display = 'block';
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }

  // Cerrar sesión
  logoutBtn.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      localStorage.removeItem('fruna_token');
      localStorage.removeItem('fruna_user');
      window.location.href = '/login_users.html';
    }
  });

  // Funciones auxiliares
  function showError(message) {
    const errorMsg = document.getElementById('form-message');
    const successMsg = document.getElementById('form-success');
    
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    successMsg.style.display = 'none';
  }

  function showSuccess(message) {
    const successMsg = document.getElementById('form-success');
    const errorMsg = document.getElementById('form-message');
    
    successMsg.textContent = message;
    successMsg.style.display = 'block';
    errorMsg.style.display = 'none';
    
    setTimeout(() => {
      successMsg.style.display = 'none';
    }, 5000);
  }

  function resetButton(button, originalHTML) {
    button.innerHTML = originalHTML;
    button.disabled = false;
  }

  // Cargar sección inicial
  loadUserInfo();
});