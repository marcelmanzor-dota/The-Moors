/*
 * Behaviour for every page: dropdown menus, the mobile drawer, the condensing header,
 * the one-time logo glint, reveal-on-scroll, and hiding events that ended since the last build.
 * Everything works without this file; it only adds keyboard support and motion.
 */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------- dropdowns
const dropdowns = [...document.querySelectorAll<HTMLElement>('[data-dropdown]')];

function closeAll(except?: HTMLElement) {
  for (const d of dropdowns) {
    if (d === except) continue;
    d.querySelector('button')?.setAttribute('aria-expanded', 'false');
    d.querySelector('.drop')?.classList.remove('is-open');
  }
}

for (const item of dropdowns) {
  const btn = item.querySelector('button')!;
  const panel = item.querySelector<HTMLElement>('.drop')!;
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    closeAll(item);
    btn.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    if (open && window.matchMedia('(hover: none)').matches) requestAnimationFrame(() => panel.querySelector('a')?.focus());
  });
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      btn.setAttribute('aria-expanded', 'true');
      panel.classList.add('is-open');
      requestAnimationFrame(() => panel.querySelector('a')?.focus());
    }
  });
  panel.addEventListener('keydown', (e) => {
    const links = [...panel.querySelectorAll('a')];
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); links[(i + 1) % links.length]?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); links[(i - 1 + links.length) % links.length]?.focus(); }
  });
  item.addEventListener('focusout', (e) => {
    if (!item.contains(e.relatedTarget as Node)) {
      btn.setAttribute('aria-expanded', 'false');
      panel.classList.remove('is-open');
    }
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const open = dropdowns.find((d) => d.querySelector('.drop.is-open'));
  if (open) { closeAll(); open.querySelector('button')?.focus(); }
  if (drawer?.classList.contains('is-open')) setDrawer(false);
});
document.addEventListener('click', (e) => {
  if (!(e.target as HTMLElement).closest('[data-dropdown]')) closeAll();
});

// ---------------------------------------------------------------- mobile drawer
const drawer = document.querySelector<HTMLElement>('[data-drawer]');
const drawerOpener = document.querySelector<HTMLButtonElement>('[data-drawer-open]');

function setDrawer(open: boolean) {
  if (!drawer || !drawerOpener) return;
  drawer.classList.toggle('is-open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  drawerOpener.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('has-drawer', open);
  if (open) drawer.querySelector<HTMLElement>('.drawer__close')?.focus();
  else drawerOpener.focus();
}
drawerOpener?.addEventListener('click', () => setDrawer(true));
drawer?.querySelectorAll('[data-drawer-close]').forEach((b) => b.addEventListener('click', () => setDrawer(false)));
// Keep keyboard focus inside the open drawer.
drawer?.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const f = [...drawer.querySelectorAll<HTMLElement>('.drawer__panel a, .drawer__panel button, .drawer__panel summary')];
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

// ---------------------------------------------------------------- condensing header
const masthead = document.querySelector<HTMLElement>('[data-masthead]');
if (masthead) {
  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:140px;pointer-events:none';
  document.body.prepend(sentinel);
  new IntersectionObserver(([e]) => document.documentElement.classList.toggle('is-condensed', !e.isIntersecting)).observe(sentinel);
}

// ---------------------------------------------------------------- logo glint, once per visit
const brand = document.querySelector<HTMLElement>('[data-brand]');
if (brand && !reduceMotion) {
  let seen = false;
  try { seen = sessionStorage.getItem('moors-glint') === '1'; sessionStorage.setItem('moors-glint', '1'); } catch { /* storage blocked */ }
  if (!seen) brand.classList.add('glint');
}

// ---------------------------------------------------------------- reveal on scroll (task tiles, gold rules)
const revealables = document.querySelectorAll<HTMLElement>('[data-reveal], .rule[data-draw]');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealables.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  revealables.forEach((el) => io.observe(el));
}

// ---------------------------------------------------------------- hero video only when it helps
const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
if (video) {
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  if (reduceMotion || saveData || window.matchMedia('(max-width: 640px)').matches) {
    video.remove();
  } else {
    video.src = video.dataset.src!;
    video.play().catch(() => video.remove());
  }
}

// ---------------------------------------------------------------- events that ended since the last build
const today = new Date().toISOString().slice(0, 10);
document.querySelectorAll<HTMLElement>('[data-event-end]').forEach((el) => {
  if (el.dataset.eventEnd! < today) el.hidden = true;
});

// ---------------------------------------------------------------- copy buttons for phone numbers
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy!);
      const label = btn.textContent;
      btn.textContent = btn.dataset.copied ?? 'Copied';
      setTimeout(() => (btn.textContent = label), 1500);
    } catch { /* clipboard unavailable; the number is visible as text */ }
  });
});

export {};
