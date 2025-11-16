/* Loader page */

(function() {
  // Nombres de archivo
  const IMG_FILES = [
    'caramelo.png',
    'corazon.png',
    'paleta.png',
    'chocolate.png',
    'menta.png',
    'baston.png'
  ];

  // Construye rutas RELATIVAS AL DOCUMENTO (funciona en / y subcarpetas)
  const IMG_PATHS = IMG_FILES.map(name =>
    new URL('img/dulces/' + name, document.baseURI).href
  );

  const loader = document.getElementById('loader-fruna');
  if (!loader) return;
  const stage = loader.querySelector('.lf-stage');

  // Cantidad concurrente de dulces.
  const CANDY_COUNT = 25;

  // Crea los elementos candy
  function createCandies() {
    // Usa varios métodos y cae a viewport si todo da 0
    const w = stage.clientWidth || stage.offsetWidth || Math.floor(window.innerWidth * 0.9);
    const h = stage.clientHeight || stage.offsetHeight || Math.floor(window.innerHeight * 0.6);

    const candies = [];

    for (let i = 0; i < CANDY_COUNT; i++) {
        const el = document.createElement('img');
        el.className = 'lf-candy';
        el.src = IMG_PATHS[i % IMG_PATHS.length];

        // Oleada rápida para cargas cortas
        const FAST_MAX_DELAY = 150;
        const isFirstWave = i < 8;

        // X aleatoria respetando bordes (16px a w-72 aprox)
        const x = Math.max(16, Math.min(w - 72, Math.round(Math.random() * w)));
        const r = Math.round(Math.random() * 180 - 90);
        const delay = isFirstWave ? 0 : Math.round(Math.random() * FAST_MAX_DELAY);
        const dur   = 600 + Math.round(Math.random() * 400);

        // Pequeño “drift” horizontal para que no caigan en línea (±40px)
        const drift = Math.round(Math.random() * 80 - 20);

        el.style.setProperty('--x', x + 'px');
        el.style.setProperty('--r', r + 'deg');
        el.style.setProperty('--delay', delay + 'ms');
        el.style.setProperty('--dur', dur + 'ms');
        el.style.setProperty('--drift', drift + 'px');

        candies.push(el);
    }
    return candies;
  }

  // Mostrar loader (activo)
  function showLoader() {
    const loader = document.getElementById('loader-fruna');
    const stage  = loader.querySelector('.lf-stage');

    // 1) Mostrar primero para que tenga ancho/alto reales
    loader.classList.remove('hidden');
    loader.classList.add('active');

    // 2) Forzar reflow (asegura medidas)
    stage.getBoundingClientRect();

    // 3) Crear dulces ya con medidas correctas
    stage.innerHTML = '';
    createCandies().forEach(c => stage.appendChild(c));

    // 4) Timer de seguridad
    clearTimeout(safetyTimer);
    safetyTimer = setTimeout(() => finishLoader(true), 12000);
  }

  // Terminar: desvanecer
  function finishLoader(fromSafety = false) {
    if (!loader.classList.contains('active')) return;

    // hacemos fade-out
    setTimeout(() => {
      loader.classList.add('done');
      // Remover del DOM tras fade (limpio)
      setTimeout(() => {
        loader.classList.remove('active', 'finishing', 'done');
        loader.classList.add('hidden');
        stage.innerHTML = '';
      }, 220);
    }, 320);
  }

  // Cerrar con tecla ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loader.classList.contains('active')) finishLoader();
  });

  // Recalcular en resize (para pantalla de carga adaptable)
  window.addEventListener('resize', () => {
    if (!loader.classList.contains('active')) return;
    // Reasignar posiciones aleatorias de dulces
    const els = stage.querySelectorAll('.lf-candy');
    els.forEach(el => {
      const x = Math.max(16, Math.min(stage.clientWidth - 72, Math.round(Math.random() * stage.clientWidth)));
      el.style.setProperty('--x', x + 'px');
    });
  });

  // INTEGRACIÓN
  // 1) Mostrar loader cuanto antes (inicio de carga de la página)
  // Nota: este script debe estar en <head> con "defer" o al final de <body>.
  let safetyTimer = null;
  showLoader();

  // 2) Cuando el DOM está listo, cerramos (o espera a tus datos si necesitas)
  // Si tu app hace fetch/axios, usa el contador de solicitudes para decidir.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      finishWhenNetworkIdle();
    });
  } else {
    finishWhenNetworkIdle();
  }

  // Opción “contador de solicitudes” simple
  let inflight = 0;
  const origFetch = window.fetch;
  window.fetch = function(...args) {
    inflight++;
    return origFetch.apply(this, args).finally(() => {
      inflight = Math.max(0, inflight - 1);
    });
  };

  function finishWhenNetworkIdle() {
    const MIN_VISIBLE_TIME = 300;
    const startTime = performance.now();
    const check = () => {
      const elapsed = performance.now() - startTime;
      if (inflight === 0 && elapsed >= MIN_VISIBLE_TIME) finishLoader();
      else setTimeout(check, 100);
    };
    setTimeout(check, 120);
  }
})();
