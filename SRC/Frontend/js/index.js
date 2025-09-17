// Frontend/js/index.js

document.addEventListener("DOMContentLoaded", () => {
    const carritoBtn = document.querySelector(".btn-shop-bag");
    const sidebar = document.querySelector(".sidebar");

    carritoBtn.addEventListener("click", () => {
        sidebar.classList.toggle("active"); 
    });
});