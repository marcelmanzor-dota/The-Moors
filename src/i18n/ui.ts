export type Lang = 'en' | 'es';
export const LANGS: Lang[] = ['en', 'es'];

/** A field that exists in both languages. */
export type L10n<T = string> = Record<Lang, T>;

const ui = {
  'skip': { en: 'Skip to content', es: 'Saltar al contenido' },
  'links': { en: 'Links:', es: 'Enlaces:' },
  'menu': { en: 'Menu', es: 'Menú' },
  'close': { en: 'Close', es: 'Cerrar' },
  'payments': { en: 'Payments', es: 'Pagos' },
  'search': { en: 'Search', es: 'Buscar' },
  'search.placeholder': { en: 'Search rules, forms, news…', es: 'Buscar reglas, formularios, noticias…' },
  'rss': { en: 'News feed (RSS)', es: 'Canal de noticias (RSS)' },
  'youtube': { en: 'The Moors on YouTube', es: 'The Moors en YouTube' },
  'lang.switch': { en: 'Español', es: 'English' },
  'lang.switch.label': { en: 'Ver esta página en español', es: 'View this page in English' },
  'home': { en: 'Home', es: 'Inicio' },
  'home.welcome': { en: 'Welcome to', es: 'Bienvenidos a' },
  'home.lede': {
    en: 'A gated community in northwest Miami-Dade. Pay your association fees, get your Moors ID and barcodes, and keep up with the Club Center, the board and community news.',
    es: 'Una comunidad cerrada en el noroeste de Miami-Dade. Pague sus cuotas de asociación, obtenga su Moors ID y códigos de barra, y manténgase al día con el Club Center, la junta y las noticias de la comunidad.',
  },
  'home.tasks': { en: 'Popular tasks', es: 'Trámites frecuentes' },
  'home.news': { en: 'Latest news', es: 'Últimas noticias' },
  'home.news.all': { en: 'All news', es: 'Todas las noticias' },
  'home.events': { en: 'Upcoming events', es: 'Próximos eventos' },
  'home.events.all': { en: 'Full calendar', es: 'Calendario completo' },
  'home.events.none': { en: 'No events are scheduled right now. Check back soon.', es: 'No hay eventos programados por ahora. Vuelva pronto.' },
  'home.club': { en: 'The Moors Club Center', es: 'The Moors Club Center' },
  'home.club.text': {
    en: 'The Club Center is open to residents and their guests. Bring your Moors ID to use the pool, courts and facilities, and watch the calendar for the flea market, food truck nights and the tennis program.',
    es: 'El Club Center está abierto para los residentes y sus invitados. Traiga su Moors ID para usar la piscina, las canchas y las instalaciones, y consulte el calendario para el mercado de pulgas, las noches de food trucks y el programa de tenis.',
  },
  'home.club.cta': { en: 'Visit the Club Center page', es: 'Ver la página del Club Center' },
  'office': { en: 'Management office', es: 'Oficina de administración' },
  'office.hours': { en: 'Office hours', es: 'Horario de oficina' },
  'phone': { en: 'Phone', es: 'Teléfono' },
  'security': { en: 'Security', es: 'Seguridad' },
  'security.247': { en: 'Security patrol', es: 'Patrulla de seguridad' },
  'emergency': { en: 'Emergency: call 911 first', es: 'Emergencia: llame primero al 911' },
  'police.nonemergency': { en: 'Police non-emergency', es: 'Policía (no emergencias)' },
  'address': { en: 'Address', es: 'Dirección' },
  'email': { en: 'Email', es: 'Correo electrónico' },
  'copy': { en: 'Copy', es: 'Copiar' },
  'copied': { en: 'Copied', es: 'Copiado' },
  'in.section': { en: 'In this section', es: 'En esta sección' },
  'need.help': { en: 'Need help?', es: '¿Necesita ayuda?' },
  'need.help.text': { en: 'Call or visit the management office.', es: 'Llame o visite la oficina de administración.' },
  'updated': { en: 'Last updated', es: 'Última actualización' },
  'read.more': { en: 'Read more', es: 'Leer más' },
  'news': { en: 'News', es: 'Noticias' },
  'news.lede': { en: 'Updates from the board, the manager and the community.', es: 'Novedades de la junta, la administración y la comunidad.' },
  'news.all': { en: 'All', es: 'Todas' },
  'news.back': { en: 'Back to news', es: 'Volver a noticias' },
  'news.filed': { en: 'Filed under', es: 'Archivado en' },
  'news.older': { en: 'Older posts', es: 'Publicaciones anteriores' },
  'news.newer': { en: 'Newer posts', es: 'Publicaciones recientes' },
  'news.page': { en: 'Page', es: 'Página' },
  'events': { en: 'Events', es: 'Eventos' },
  'events.lede': { en: 'Board meetings, community events and activities at the Club Center.', es: 'Reuniones de la junta, eventos comunitarios y actividades en el Club Center.' },
  'events.upcoming': { en: 'Upcoming', es: 'Próximos' },
  'events.recurring': { en: 'Regular meetings and activities', es: 'Reuniones y actividades regulares' },
  'events.past': { en: 'Past events', es: 'Eventos pasados' },
  'events.when': { en: 'When', es: 'Cuándo' },
  'events.where': { en: 'Where', es: 'Dónde' },
  'events.back': { en: 'Back to events', es: 'Volver a eventos' },
  'events.add': { en: 'Add to calendar', es: 'Agregar al calendario' },
  'documents': { en: 'Documents', es: 'Documentos' },
  'documents.download': { en: 'Open document', es: 'Abrir documento' },
  'subscribe': { en: 'Subscribe', es: 'Suscribirse' },
  'subscribe.lede': { en: 'Get news and event notices from The Moors by email.', es: 'Reciba noticias y avisos de eventos de The Moors por correo electrónico.' },
  'subscribe.email': { en: 'Email address', es: 'Correo electrónico' },
  'subscribe.button': { en: 'Subscribe', es: 'Suscribirse' },
  'subscribe.fallback': { en: 'To join the mailing list, email or call the management office.', es: 'Para unirse a la lista de correo, escriba o llame a la oficina de administración.' },
  'footer.quick': { en: 'Quick links', es: 'Enlaces rápidos' },
  'footer.editors': { en: 'Site editors sign in', es: 'Acceso para editores' },
  'footer.rights': { en: 'The Moors Master Maintenance Association. All rights reserved.', es: 'The Moors Master Maintenance Association. Todos los derechos reservados.' },
  'notfound.title': { en: 'Page not found', es: 'Página no encontrada' },
  'notfound.text': { en: 'This page may have moved. Try the search, or start from the home page.', es: 'Es posible que esta página se haya movido. Use la búsqueda o comience desde la página de inicio.' },
  'search.title': { en: 'Search the site', es: 'Buscar en el sitio' },
  'search.noscript': { en: 'Search needs JavaScript. You can browse every page from the menu instead.', es: 'La búsqueda necesita JavaScript. También puede navegar todas las páginas desde el menú.' },
} as const satisfies Record<string, L10n>;

export type UIKey = keyof typeof ui;

export function t(lang: Lang, key: UIKey): string {
  return ui[key][lang];
}

/** Prefix an internal path for the given language. Paths always start and end with "/". */
export function localize(path: string, lang: Lang): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return lang === 'es' ? `/es${clean}` : clean;
}

/** Strip the language prefix from a pathname. */
export function unlocalize(pathname: string): { lang: Lang; path: string } {
  if (pathname === '/es' || pathname.startsWith('/es/')) {
    return { lang: 'es', path: pathname.slice(3) || '/' };
  }
  return { lang: 'en', path: pathname };
}

const dateFmt: Record<Lang, string> = { en: 'en-US', es: 'es-US' };

export function formatDate(iso: string, lang: Lang, opts: Intl.DateTimeFormatOptions = { dateStyle: 'long' }): string {
  // Dates without a time are treated as local calendar dates, not UTC midnight.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date(iso);
  return new Intl.DateTimeFormat(dateFmt[lang], { timeZone: 'America/New_York', ...opts }).format(d);
}
