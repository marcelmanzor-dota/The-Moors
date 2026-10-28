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

// ---------------------------------------------------------------- reveal on scroll
// Each child of a [data-reveal] block gets its place in the sequence, so they rise one after another.
const revealables = document.querySelectorAll<HTMLElement>('[data-reveal], .rule[data-draw]');
document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((block) => {
  [...block.children].forEach((child, i) => (child as HTMLElement).style.setProperty('--ri', String(Math.min(i, 8))));
});
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealables.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }
  }, { rootMargin: '0px 0px -10% 0px' });
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
    // Fade the loop in over the still photo only once it is actually playing.
    video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
    video.play().catch(() => video.remove());
  }
}

// ---------------------------------------------------------------- gold dust drifting over the hero
const dust = document.querySelector<HTMLCanvasElement>('[data-dust]');
if (dust && !reduceMotion) {
  const ctx = dust.getContext('2d')!;
  type Mote = { x: number; y: number; r: number; vy: number; sway: number; phase: number; tw: number };
  let motes: Mote[] = [];
  let w = 0, h = 0, raf = 0, visible = true;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const spawn = (anywhere: boolean): Mote => ({
    x: Math.random() * w,
    y: anywhere ? Math.random() * h : h + 10,
    r: 0.5 + Math.random() * 1.8,
    vy: 0.12 + Math.random() * 0.35,
    sway: 8 + Math.random() * 22,
    phase: Math.random() * Math.PI * 2,
    tw: 0.6 + Math.random() * 1.6,
  });
  const resize = () => {
    w = dust.clientWidth; h = dust.clientHeight;
    dust.width = w * dpr; dust.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    motes = Array.from({ length: Math.round(Math.min(90, w / 16)) }, () => spawn(true));
  };
  const frame = (t: number) => {
    ctx.clearRect(0, 0, w, h);
    for (const m of motes) {
      m.y -= m.vy;
      if (m.y < -10) Object.assign(m, spawn(false));
      const x = m.x + Math.sin(t / 2400 + m.phase) * m.sway;
      const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t / (600 * m.tw) + m.phase));
      const g = ctx.createRadialGradient(x, m.y, 0, x, m.y, m.r * 4);
      g.addColorStop(0, `rgba(255, 226, 150, ${a})`);
      g.addColorStop(1, 'rgba(233, 180, 76, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, m.y, m.r * 4, 0, Math.PI * 2); ctx.fill();
    }
    raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
  };
  const start = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };
  resize();
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', start);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }).observe(dust);
}

// ---------------------------------------------------------------- back to top, with a gold ring showing progress
const toTop = document.querySelector<HTMLElement>('[data-to-top]');
if (toTop) {
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? scrollY / max : 0;
    toTop.style.setProperty('--p', p.toFixed(3));
    toTop.classList.toggle('is-shown', scrollY > innerHeight * 0.8);
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
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
