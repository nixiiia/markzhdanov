'use strict';
(() => {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const supportsGlass = CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
  const surfaces = [...document.querySelectorAll('.practice-preview, .project-card, .telegram-card')];
  let controller;
  let frame = 0;
  let pending;

  function clear(surface) {
    surface.style.removeProperty('--glass-x');
    surface.style.removeProperty('--glass-y');
  }

  function stop() {
    controller?.abort();
    controller = undefined;
    cancelAnimationFrame(frame);
    frame = 0;
    pending = undefined;
    surfaces.forEach(clear);
  }

  function flush() {
    frame = 0;
    if (!pending) return;
    const {surface, x, y} = pending;
    surface.style.setProperty('--glass-x', `${x}%`);
    surface.style.setProperty('--glass-y', `${y}%`);
    pending = undefined;
  }

  function update() {
    stop();
    if (!supportsGlass || !finePointer.matches || reducedMotion.matches) return;
    controller = new AbortController();
    const options = {signal: controller.signal, passive: true};
    for (const surface of surfaces) {
      surface.addEventListener('pointermove', event => {
        const bounds = surface.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        pending = {
          surface,
          x: Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100)),
          y: Math.max(0, Math.min(100, (event.clientY - bounds.top) / bounds.height * 100))
        };
        if (!frame) frame = requestAnimationFrame(flush);
      }, options);
      surface.addEventListener('pointerleave', () => {
        if (pending?.surface === surface) pending = undefined;
        clear(surface);
      }, options);
    }
  }

  finePointer.addEventListener('change', update);
  reducedMotion.addEventListener('change', update);
  window.addEventListener('hashchange', update);
  update();
})();
