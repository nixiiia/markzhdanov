'use strict';
(() => {
  const routes = new Set(['home', 'about', 'experience', 'projects', 'contact']);
  const sections = [...document.querySelectorAll('.page-section')];
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.menu-toggle');
  const header = document.querySelector('.header');
  const navigationShell = document.querySelector('.navigation-shell');
  const mobileMenu = window.matchMedia('(width < 900px)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let lensFrame = 0;
  const labels = {home:'AI-разработчик',about:'Обо мне',experience:'Опыт',projects:'Проекты',contact:'Контакты'};
  function syncHeaderScroll() {
    const scrolled = document.body.dataset.view !== 'home' && window.scrollY > 8;
    if (header.hasAttribute('data-scrolled') !== scrolled) header.toggleAttribute('data-scrolled', scrolled);
  }
  window.addEventListener('scroll', syncHeaderScroll, {passive:true});
  function closeMenu() { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.querySelector('.sr-only').textContent = 'Открыть меню'; }
  function moveLens(link) {
    if (mobileMenu.matches || !link) { nav.removeAttribute('data-lens-ready'); return; }
    nav.style.setProperty('--menu-lens-x', `${link.offsetLeft}px`);
    nav.style.setProperty('--menu-lens-y', `${link.offsetTop}px`);
    nav.style.setProperty('--menu-lens-width', `${link.offsetWidth}px`);
    nav.style.setProperty('--menu-lens-height', `${link.offsetHeight}px`);
    nav.setAttribute('data-lens-ready', '');
  }
  function restoreLens() {
    const focused = nav.contains(document.activeElement) && document.activeElement.matches('a:focus-visible') ? document.activeElement : null;
    moveLens(focused || nav.querySelector('[aria-current=page]'));
  }
  function scheduleLens() {
    cancelAnimationFrame(lensFrame);
    lensFrame = requestAnimationFrame(restoreLens);
  }
  function renderRoute(moveFocus = false) {
    let route = location.hash.slice(1) || 'home';
    if (route === 'main') route = document.body.dataset.view && document.body.dataset.view !== 'home' ? document.body.dataset.view : 'about';
    if (!routes.has(route)) route = 'home';
    document.body.dataset.view = route;
    sections.forEach(section => { section.hidden = section.id !== route; });
    nav.querySelectorAll('a').forEach(link => { if (link.hash === '#' + route) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
    toggle.querySelector('.menu-current').textContent = nav.querySelector('[aria-current=page]').textContent.trim();
    document.title = `Марк Жданов — ${labels[route]}`;
    closeMenu();
    scheduleLens();
    window.scrollTo({top:0,behavior:'instant'});
    syncHeaderScroll();
    if (moveFocus) {
      const target = route === 'home' ? document.querySelector('h1 a') : document.querySelector(`#${route} h2`);
      target.setAttribute('tabindex','-1'); target.focus({preventScroll:true});
    }
  }
  toggle.addEventListener('click', () => { if (!mobileMenu.matches) return; const isOpen = toggle.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('open',isOpen); toggle.setAttribute('aria-expanded',String(isOpen)); toggle.querySelector('.sr-only').textContent = isOpen ? 'Закрыть меню' : 'Открыть меню'; });
  nav.addEventListener('click', event => { const link = event.target.closest('a'); if(link && link.hash === location.hash) renderRoute(true); });
  document.addEventListener('keydown', event => { if(event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); toggle.focus(); } });
  document.addEventListener('pointerdown', event => { if(!navigationShell.contains(event.target) && nav.classList.contains('open')) closeMenu(); });
  navigationShell.addEventListener('focusout', event => { if(!navigationShell.contains(event.relatedTarget)) { closeMenu(); scheduleLens(); } });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('pointerenter', event => { if(finePointer.matches && event.pointerType !== 'touch' && !nav.querySelector('a:focus-visible')) moveLens(link); });
    link.addEventListener('focus', () => moveLens(link));
  });
  nav.addEventListener('pointerleave', restoreLens);
  nav.addEventListener('focusout', scheduleLens);
  mobileMenu.addEventListener('change', event => { const wasFocused = nav.contains(document.activeElement); closeMenu(); if(event.matches && wasFocused) toggle.focus(); scheduleLens(); });
  new ResizeObserver(scheduleLens).observe(nav);
  document.fonts.ready.then(scheduleLens);
  window.addEventListener('hashchange', () => renderRoute(true));
  const filters = [...document.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('.project-card')];
  function selectFilter(value) {
    filters.forEach(filter => { const selected = filter.dataset.filter === value; filter.classList.toggle('active',selected); filter.setAttribute('aria-pressed',String(selected)); });
    let count = 0;
    projects.forEach(project => { const visible = value === 'all' || project.dataset.category.split(' ').includes(value); project.hidden = !visible; if(visible) count++; });
    document.querySelector('#filter-status').textContent = `Показано проектов: ${count}`;
  }
  filters.forEach(button => button.addEventListener('click', () => selectFilter(button.dataset.filter)));
  document.querySelectorAll('[data-project-filter]').forEach(link => link.addEventListener('click', () => selectFilter(link.dataset.projectFilter)));
  // General work links open the full selection; practice links select their own track.
  document.querySelectorAll('a[href="#projects"]:not([data-project-filter])').forEach(link => link.addEventListener('click', () => selectFilter('all')));
  renderRoute();
})();
