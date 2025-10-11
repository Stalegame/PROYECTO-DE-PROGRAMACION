document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("fruna_token");
  const rawUser = localStorage.getItem("fruna_user");
  let user = null;

  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {}

  const formPerfil = document.getElementById("formPerfil");
  const formCambioContraseña = document.getElementById("formCambioContraseña");
  const btnCambiarClave = document.getElementById("btnCambiarClave");
  const modal = document.getElementById("modalCambiarClave");
  const span = document.getElementById("closeModal");
  const body = document.body;
  const miPerfilSection = document.getElementById("miPerfilSection");
  const direccionActualSpan = document.getElementById("direccionActual");
  const menuItems = document.querySelectorAll(".menu-item");
  const sections = document.querySelectorAll(".content-section");

  // ============================
  // 🧠 AUTENTICACIÓN HEADER
  // ============================
  const loginLink = document.getElementById("authLoginLink");
  const nameSpan = document.getElementById("authName");
  const logoutBtn = document.getElementById("authLogoutBtn");
  const authBox = document.getElementById("authBox");

  const hasSession = Boolean(token && user && (user.email || user.nombre));
  if (hasSession) {
    const nombreMostrar = user.nombre?.trim() || user.email?.split("@")[0] || "Usuario";
    nameSpan.textContent = `Hola, ${nombreMostrar}`;
    nameSpan.style.display = "";
    logoutBtn.style.display = "";
    loginLink.style.display = "none";
    authBox.dataset.logged = "true";
  }

  // ============================
  // 🔓 CERRAR SESIÓN
  // ============================
  const cerrarSesion = () => {
    localStorage.removeItem("fruna_token");
    localStorage.removeItem("fruna_user");
    window.location.href = "login_users.html";
  };

  logoutBtn?.addEventListener("click", cerrarSesion);
  document.getElementById("cerrarSesionLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    cerrarSesion();
  });

  // ============================
  // 📝 CARGAR DATOS USUARIO
  // ============================
  if (user) {
    document.getElementById("nombre").value = user.nombre || "";
    document.getElementById("rut").value = user.rut || "";
    document.getElementById("fechaNacimiento").value = user.fechaNacimiento || "";
    document.getElementById("telefono").value = user.telefono || "";
    document.getElementById("direccion").value = user.direccion || "";
    document.getElementById("email").value = user.email || "";
    document.getElementById("aceptoOfertas").checked = user.aceptoOfertas || false;

    if (direccionActualSpan) {
      direccionActualSpan.textContent = user.direccion || "No definida";
    }
  }

  // Obtener datos actualizados del backend
  if (user?.id && token) {
    fetch(`/api/clients/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.user) return;
        const u = data.user;

        document.getElementById("nombre").value = u.nombre || "";
        document.getElementById("rut").value = u.rut || "";
        document.getElementById("fechaNacimiento").value = u.fechaNacimiento || "";
        document.getElementById("telefono").value = u.telefono || "";
        document.getElementById("direccion").value = u.direccion || "";
        document.getElementById("email").value = u.email || "";
        document.getElementById("aceptoOfertas").checked = u.aceptoOfertas || false;

        if (direccionActualSpan) {
          direccionActualSpan.textContent = u.direccion || "No definida";
        }

        user = u;
        localStorage.setItem("fruna_user", JSON.stringify(u));
      })
      .catch((err) => console.error("❌ Error al obtener usuario:", err));
  }

  // ============================
  // 🚀 NAVEGACIÓN ENTRE SECCIONES
  // ============================
  const resetSections = () => {
    sections.forEach((s) => s.classList.remove("active"));
    menuItems.forEach((i) => i.classList.remove("active"));
  };

  menuItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      const targetSectionId = item.getAttribute("href").substring(1);

      resetSections();
      document.getElementById(targetSectionId)?.classList.add("active");
      item.classList.add("active");

      // Cerrar modal si está abierto
      modal.style.display = "none";
      body.classList.remove("blur-background");
    });
  });

  // Desde "Mis Direcciones" → "Mi Perfil"
  document.querySelector(".enlace-a-perfil")?.addEventListener("click", (e) => {
    e.preventDefault();
    resetSections();
    miPerfilSection.classList.add("active");
    document.querySelector('a.menu-item[href="#miPerfilSection"]')?.classList.add("active");
  });

  // ============================
  // 🔐 CAMBIAR CONTRASEÑA (MODAL)
  // ============================
  btnCambiarClave?.addEventListener("click", () => {
    modal.style.display = "block";
    resetSections();
    miPerfilSection.classList.add("active");
    body.classList.add("blur-background");
  });

  span.onclick = () => {
    modal.style.display = "none";
    body.classList.remove("blur-background");
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
      body.classList.remove("blur-background");
    }
  };

  formCambioContraseña?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nueva = document.getElementById("nuevaContraseña").value;
    const confirmar = document.getElementById("confirmarContraseña").value;
    const regex = /^(?=.*\d)[^\s]{8,64}$/;

    if (!regex.test(nueva)) {
      return alert("La contraseña debe tener entre 8 y 64 caracteres, incluir al menos un número y no contener espacios.");
    }

    if (nueva !== confirmar) {
      return alert("Las contraseñas no coinciden.");
    }

    try {
      const res = await fetch(`/api/clients/${user.id}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nuevaContraseña: nueva }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ Contraseña actualizada correctamente");
        modal.style.display = "none";
        body.classList.remove("blur-background");
        formCambioContraseña.reset();
      } else {
        alert(result.error || "Error al cambiar contraseña");
      }
    } catch (err) {
      console.error("❌ Error al cambiar contraseña:", err);
      alert("Error de red al cambiar contraseña");
    }
  });

  // ============================
  // 📝 FORMULARIO PERFIL
  // ============================
  formPerfil?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const password = document.getElementById("password").value.trim();
    if (!password) {
      return alert("Debes ingresar tu contraseña actual para guardar los cambios.");
    }

    const updatedData = {
      nombre: document.getElementById("nombre").value.trim(),
      rut: document.getElementById("rut").value.trim() || null,
      fechaNacimiento: document.getElementById("fechaNacimiento").value || null,
      telefono: document.getElementById("telefono").value.trim(),
      direccion: document.getElementById("direccion").value.trim(),
      email: document.getElementById("email").value.trim(),
      aceptoOfertas: document.getElementById("aceptoOfertas").checked,
      passwordActual: password,
    };

    try {
      const res = await fetch(`/api/clients/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ Perfil actualizado correctamente");
        localStorage.setItem("fruna_user", JSON.stringify(result.data));
        if (direccionActualSpan) {
          direccionActualSpan.textContent = result.data.direccion || "No definida";
        }
      } else {
        alert("❌ " + (result.error || "Error al actualizar el perfil"));
      }
    } catch (err) {
      console.error("❌ Error al actualizar perfil:", err);
      alert("Hubo un error de red al actualizar el perfil.");
    }
  });

  // ============================
  // 👁️ VER DETALLES DE PEDIDOS
  // ============================
  document.querySelectorAll(".btn-ver-detalles").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".historial-card");
      const detalles = card.querySelector(".historial-detalles");
      detalles.classList.toggle("oculto");

      btn.innerHTML = detalles.classList.contains("oculto")
        ? '<i class="fa-solid fa-eye"></i> Ver Detalles'
        : '<i class="fa-solid fa-eye-slash"></i> Ocultar';
    });
  });
});
