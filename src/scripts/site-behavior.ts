const media = matchMedia('(prefers-color-scheme: dark)');
const themeIconClasses = ['fa-circle-half-stroke', 'fa-sun', 'fa-moon'];

const applyTheme = (preference: string) => {
  const resolved = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.dataset.theme = resolved;
};

const updateThemeControls = (preference: string) => {
  document.querySelectorAll<HTMLElement>('[data-theme-current-icon]').forEach((themeIcon) => {
    themeIcon.classList.remove(...themeIconClasses);
    themeIcon.classList.add(preference === 'light' ? 'fa-sun' : preference === 'dark' ? 'fa-moon' : 'fa-circle-half-stroke');
  });

  document.querySelectorAll<HTMLElement>('[data-theme-option]').forEach((option) => {
    const active = option.dataset.themeOption === preference;
    option.setAttribute('aria-checked', String(active));
    const check = option.querySelector<HTMLElement>('[data-theme-check]');
    if (check) check.hidden = !active;
  });
};

const syncTheme = () => {
  const preference = localStorage.getItem('theme') || 'system';
  applyTheme(preference);
  updateThemeControls(preference);
};

const handleDocumentClick = (event: MouseEvent) => {
  const clicked = event.target;
  const target = clicked instanceof Element
    ? clicked
    : clicked instanceof Node
      ? clicked.parentElement
      : null;

  document.querySelectorAll<HTMLElement>('.control-menu[open]').forEach((menu) => {
    if (!target?.closest('.control-menu') || !menu.contains(target)) menu.removeAttribute('open');
  });

  const option = target?.closest<HTMLElement>('[data-theme-option]');
  if (!option) return;

  const preference = option.dataset.themeOption || 'system';
  localStorage.setItem('theme', preference);
  applyTheme(preference);
  updateThemeControls(preference);
  option.closest('details')?.removeAttribute('open');
};

const handleMediaChange = () => {
  if ((document.documentElement.dataset.themePreference || 'system') === 'system') {
    applyTheme('system');
    updateThemeControls('system');
  }
};

const decorateContentLinks = () => {
  document.querySelectorAll<HTMLAnchorElement>('main a[href]').forEach((link) => {
    if (link.hasAttribute('data-link-plain') || link.closest('[data-link-card]')) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;

    const target = new URL(href, location.href);
    link.classList.add('content-link');
    if (target.origin === location.origin) {
      link.classList.add('link-internal');
    } else {
      link.classList.add('link-external');
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noreferrer');
    }
  });
};

document.addEventListener('click', handleDocumentClick);
document.addEventListener('astro:after-swap', syncTheme);
document.addEventListener('astro:page-load', syncTheme);
document.addEventListener('astro:page-load', decorateContentLinks);
media.addEventListener('change', handleMediaChange);

syncTheme();
decorateContentLinks();
