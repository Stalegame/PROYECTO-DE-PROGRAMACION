document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("profile-form");
  const loading = document.getElementById("loading");

  // Simular carga de datos de usuario
  setTimeout(() => {
    loading.style.display = "none";
    form.style.display = "block";
    document.getElementById("email").value = "usuario@fruna.cl";
    document.getElementById("nombre").value = "Juan Pérez";
    document.getElementById("telefono").value = "987654321";
    document.getElementById("direccion").value = "Av. Dulce 123";
  }, 1000);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("✅ Cambios guardados con éxito");
  });

  const btnEliminar = document.getElementById("btn-eliminar-cuenta");
  const modal = document.getElementById("modal-eliminar");
  const cancelar = document.getElementById("btn-cancelar-eliminar");
  const confirmar = document.getElementById("btn-confirmar-eliminar");
  const passInput = document.getElementById("password-confirm");

  btnEliminar.onclick = () => modal.style.display = "flex";
  cancelar.onclick = () => modal.style.display = "none";
  passInput.oninput = () => confirmar.disabled = passInput.value.length < 4;

  confirmar.onclick = () => {
    alert("🗑️ Cuenta eliminada exitosamente");
    window.location.href = "index.html";
  };
});
