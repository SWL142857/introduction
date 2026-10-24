(() => {
  'use strict';

  const html = document.documentElement;
  html.classList.add('js');
  const themeButton = document.querySelector('.theme-toggle');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const applyTheme = theme => {
    html.dataset.theme = theme;
    themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
    themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  };
  let hasCustomTheme = false;
  try { hasCustomTheme = ['light', 'dark'].includes(localStorage.getItem('shiwei-theme')); } catch { /* Private browsing can disable storage. */ }
  applyTheme(html.dataset.theme || (systemTheme.matches ? 'dark' : 'light'));
  themeButton.addEventListener('click', () => {
    const theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    hasCustomTheme = true;
    try { localStorage.setItem('shiwei-theme', theme); } catch { /* Theme still works without persistence. */ }
  });
  systemTheme.addEventListener('change', event => { if (!hasCustomTheme) applyTheme(event.matches ? 'dark' : 'light'); });

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const closeMenu = () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  };
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', `${open ? 'Close' : 'Open'} navigation`);
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('click', event => { if (!event.target.closest('.header-actions')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menuButton.focus(); } });
  window.matchMedia('(min-width: 651px)').addEventListener('change', closeMenu);

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -15px 0px' });
    revealElements.forEach(section => revealObserver.observe(section));
  } else revealElements.forEach(section => section.classList.add('visible'));

  const navLinks = [...nav.querySelectorAll('a')];
  const navSections = navLinks.map(link => document.querySelector(link.hash));
  const progress = document.querySelector('.reading-progress');
  let scrollFrame = 0;
  const updateScroll = () => {
    scrollFrame = 0;
    const scrollableHeight = html.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${scrollableHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight)) : 0})`;
    let active = navSections[0];
    navSections.forEach(section => { if (section.getBoundingClientRect().top <= 170) active = section; });
    navLinks.forEach(link => {
      const current = link.hash === `#${active.id}`;
      link.classList.toggle('active', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  window.addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  const dialog = document.querySelector('#bibtex-dialog');
  const toast = document.querySelector('.toast');
  let toastTimer;
  const announce = message => {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  };
  document.querySelector('[data-open-bibtex]').addEventListener('click', () => dialog.showModal());
  document.querySelector('[data-close-bibtex]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
  const copyButton = document.querySelector('[data-copy-bibtex]');
  copyButton.addEventListener('click', async () => {
    const code = document.querySelector('#bibtex-code');
    const citation = code.textContent.trim();
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(citation);
      copyButton.querySelector('span').textContent = 'Copied!';
      announce('BibTeX copied to clipboard');
      setTimeout(() => { copyButton.querySelector('span').textContent = 'Copy BibTeX'; }, 2200);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(range);
      announce('Citation selected. Press ⌘C or Ctrl+C to copy.');
    }
  });
})();
