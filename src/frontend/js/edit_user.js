document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("profile-form");
  const loading = document.getElementById("loading");

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

  // Simular carga de datos de usuario
  setTimeout(() => {
    loading.style.display = "none";
    form.style.display = "block";
    
    // Datos de ejemplo - en producción vendrían de la API
    document.getElementById("email").value = "pepeacosta@example.com";
    document.getElementById("nombre").value = "Pepe Acosta";
    document.getElementById("telefono").value = "+56912345678";
    document.getElementById("direccion").value = "Calle de Pepe Acosta";
  }, 1000);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Mostrar mensaje de éxito
    const successMsg = document.getElementById("form-success");
    successMsg.textContent = "✅ Cambios guardados con éxito";
    successMsg.style.display = "block";
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      successMsg.style.display = "none";
    }, 3000);
  });
});