/* Loader page */

(function() {
  'use strict';

  // Configuración
  const CONFIG = {
    IMG_FILES: ['caramelo.png', 'corazon.png', 'paleta.png', 'chocolate.png', 'menta.png', 'baston.png'],
    CANDY_COUNT: 25,
    SAFETY_TIMEOUT: 12000,
    MIN_VISIBLE_TIME: 400,
    FIRST_WAVE_COUNT: 8,
    MAX_DELAY: 150,
    PADDING: 16,
    CANDY_WIDTH: 56,
    RESIZE_DEBOUNCE: 150,
    CHECK_INTERVAL: 100
  };

  // Elementos DOM
  const loader = document.getElementById('loader-fruna');
  if (!loader) return;
  
  const stage = loader.querySelector('.lf-stage');
  if (!stage) return;

  // Estado
  let safetyTimer = null;
  let resizeTimer = null;
  let inflight = 0;
  let stageWidth = 0;

  // Construir rutas de imágenes
  const IMG_PATHS = CONFIG.IMG_FILES.map(name => 
    new URL(`img/dulces/${name}`, document.baseURI).href
  );

  // Crear un dulce optimizado
  function createCandy(index, width) {
    const el = document.createElement('img');
    el.className = 'lf-candy';
    el.src = IMG_PATHS[index % IMG_PATHS.length];
    el.alt = '';
    el.setAttribute('aria-hidden', 'true');

    const isFirstWave = index < CONFIG.FIRST_WAVE_COUNT;
    const x = CONFIG.PADDING + Math.random() * (width - CONFIG.PADDING * 2 - CONFIG.CANDY_WIDTH);
    const r = Math.random() * 180 - 90;
    const delay = isFirstWave ? 0 : Math.random() * CONFIG.MAX_DELAY;
    const dur = 600 + Math.random() * 400;
    const drift = Math.random() * 80 - 40;

    el.style.cssText = `
      --x: ${x}px;
      --r: ${r}deg;
      --delay: ${delay}ms;
      --dur: ${dur}ms;
      --drift: ${drift}px;
    `;

    return el;
  }

  // Inicializar dulces usando DocumentFragment
  function initCandies() {
    stageWidth = stage.clientWidth || window.innerWidth;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < CONFIG.CANDY_COUNT; i++) {
      fragment.appendChild(createCandy(i, stageWidth));
    }

    stage.innerHTML = '';
    stage.appendChild(fragment);

    // Timer de seguridad
    clearTimeout(safetyTimer);
    safetyTimer = setTimeout(() => finishLoader(true), CONFIG.SAFETY_TIMEOUT);
  }

  // Terminar loader con fade-out
  function finishLoader(fromSafety = false) {
    if (!loader.classList.contains('active')) return;

    clearTimeout(safetyTimer);
    clearTimeout(resizeTimer);
    
    loader.classList.add('done');
    
    setTimeout(() => {
      loader.classList.remove('active', 'done');
      loader.classList.add('hidden');
      loader.setAttribute('aria-hidden', 'true');
      stage.innerHTML = '';
      
      // Cleanup listeners
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
    }, 200);
  }

  // Cerrar con ESC
  function handleEscape(e) {
    if (e.key === 'Escape' && loader.classList.contains('active')) {
      finishLoader();
    }
  }

  // Resize optimizado con debounce
  function handleResize() {
    if (!loader.classList.contains('active')) return;
    
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const w = stage.clientWidth;
      const maxX = w - CONFIG.PADDING * 2 - CONFIG.CANDY_WIDTH;
      
      stage.querySelectorAll('.lf-candy').forEach(el => {
        const x = CONFIG.PADDING + Math.random() * maxX;
        el.style.setProperty('--x', `${x}px`);
      });
    }, CONFIG.RESIZE_DEBOUNCE);
  }

  // Interceptar fetch para contador de red
  const origFetch = window.fetch;
  window.fetch = function(...args) {
    inflight++;
    return origFetch.apply(this, args).finally(() => {
      inflight = Math.max(0, inflight - 1);
    });
  };

  // Esperar a que la red esté idle
  function finishWhenNetworkIdle() {
    const startTime = performance.now();
    
    const check = () => {
      const elapsed = performance.now() - startTime;
      
      if (inflight === 0 && elapsed >= CONFIG.MIN_VISIBLE_TIME) {
        finishLoader();
      } else if (elapsed < CONFIG.SAFETY_TIMEOUT) {
        setTimeout(check, CONFIG.CHECK_INTERVAL);
      }
    };
    
    setTimeout(check, 120);
  }

  // Event listeners
  window.addEventListener('keydown', handleEscape, { passive: true });
  window.addEventListener('resize', handleResize, { passive: true });

  // Cleanup al cerrar página
  window.addEventListener('beforeunload', () => {
    clearTimeout(safetyTimer);
    clearTimeout(resizeTimer);
  }, { once: true });

  // INICIAR - El loader ya está visible en el HTML con class="active"
  initCandies();

  // Esperar DOM + red idle
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', finishWhenNetworkIdle, { once: true });
  } else {
    finishWhenNetworkIdle();
  }
})();
