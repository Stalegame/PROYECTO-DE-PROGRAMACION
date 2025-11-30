// Frontend/js/one_product.js

document.addEventListener('DOMContentLoaded', () => {
  // Cargar ficha de producto por id
  const $ = (id) => document.getElementById(id);

  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) {
    alert('Producto no especificado');
    location.replace('/productos.html');
    return;
  }

  const fmtCLP = (n) => {
    if (n == null || isNaN(n)) return '';
    try {
      return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
    } catch {
      return `$${Number(n).toLocaleString('es-CL')}`;
    }
  };

  const resolveImage = (val) => {
    const v = String(val || '').trim();
    if (!v) return '/img/placeholder.png';
    if (/^https?:\/\//i.test(v)) return v;
    return `/img/products/${encodeURIComponent(v)}`;
  };

  (async function loadProduct() {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        throw new Error('Producto no encontrado');
      }

      const p = json.data || json;

      $('p-name').textContent = p.name ?? 'Producto';
      $('p-price').textContent = fmtCLP(p.price);
      $('p-category').textContent = p.category.name ?? '';
      $('p-desc').textContent = p.description ?? '';
      $('p-stock').textContent = p.stock ?? '';
      $('btn-comprar').dataset.productId = String(p.id ?? '');

      const stock = p.stock;
      const stockElement = document.getElementById('p-stock');

      if (stock > 0) {
        stockElement.textContent = `Cantidad de stock: ${stock}`;
        stockElement.parentElement.style.backgroundColor = '#F1F8E9';
        stockElement.style.color = '#33691E';
      } else {
        stockElement.textContent = 'Sin stock';
        stockElement.parentElement.style.backgroundColor = '#FFEBEE';
        stockElement.parentElement.style.borderColor = '#fc7f7fff';
        stockElement.style.color = '#C62828';
      }

      const img = $('p-image');
      const src = resolveImage(p.image ?? p.imagen);
      img.src = src;
      img.alt = p.name ?? p.nombre ?? 'Producto';

    } catch (e) {
      alert('Error cargando el producto');
      location.replace('/productos.html');
    }
  })();
});