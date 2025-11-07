document.addEventListener("DOMContentLoaded", () => {
  const productos = JSON.parse(localStorage.getItem("fruna_carrito")) || [
    { nombre: "Chocman", cantidad: 2, precio: 800 },
    { nombre: "Trululú", cantidad: 1, precio: 1000 }
  ];

  const container = document.getElementById("productos-container");
  const totalDiv = document.getElementById("total");
  const btnConfirmar = document.getElementById("btn-confirmar");

  let total = 0;
  productos.forEach(p => {
    const div = document.createElement("div");
    div.classList.add("producto");
    const subtotal = p.cantidad * p.precio;
    total += subtotal;
    div.innerHTML = `
      <span>${p.nombre} x${p.cantidad}</span>
      <span>$${subtotal}</span>
    `;
    container.appendChild(div);
  });

  totalDiv.textContent = `Total: $${total}`;

  btnConfirmar.onclick = () => {
    alert("✅ Compra confirmada con éxito. ¡Gracias por preferir FRUNA!");
    localStorage.removeItem("fruna_carrito");
    window.location.href = "productos.html";
  };
});
