import { withBase, type L10n } from '../i18n/ui';

/** Site-wide settings. In Sanity these live in the "Site settings" document; these are the defaults. */
export interface Settings {
  name: string;
  /** Output of scripts/gild-logo.mjs: 2x PNG and WebP plus a 1x WebP. */
  logo: { png: string; webp: string; webp1x: string; width: number; height: number };
  paymentsUrl: string;
  youtubeUrl: string;
  subscribeAction: string;
  office: {
    address: string;
    mapUrl: string;
    phone: string;
    email: string;
    hours: L10n<string[]>;
  };
  security: { name: string; phone: string };
  policeNonEmergency: string;
  clubCenterEmail: string;
  alert?: { level: 'info' | 'urgent'; text: L10n; path?: string };
  hero: { image?: string; video?: string; alt: L10n };
}

export const defaultSettings: Settings = {
  name: 'The Moors Master Maintenance Association',
  // Stand-in mark until the original logo file is imported; see docs/CONTENT-IMPORT.md.
  logo: { png: withBase('/brand/logo-gilded.png'), webp: withBase('/brand/logo-gilded.webp'), webp1x: withBase('/brand/logo-gilded@1x.webp'), width: 571, height: 234 },
  // TODO(import): copy the exact URL behind the current Payments button.
  paymentsUrl: 'https://www.themoors.com/',
  // TODO(import): copy the channel URL behind the current YouTube icon.
  youtubeUrl: 'https://www.youtube.com/',
  subscribeAction: '',
  office: {
    address: '17321 NW 66th Ct, Miami, FL 33015',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=17321+NW+66th+Ct+Miami+FL+33015',
    phone: '305-821-9923',
    // TODO(import): the office email, if the old Contact page lists one.
    email: '',
    hours: {
      en: ['Monday to Friday: 8 am to 12 noon and 1 pm to 5 pm', 'Saturday: 9 am to 12 noon'],
      es: ['Lunes a viernes: 8 am a 12 del mediodía y 1 pm a 5 pm', 'Sábado: 9 am a 12 del mediodía'],
    },
  },
  security: { name: 'South Florida Security Group', phone: '305-723-1800' },
  policeNonEmergency: '305-476-5423',
  clubCenterEmail: 'recstaff@themoors.com',
  // Stand-ins generated with Higgsfield (docs/HIGGSFIELD-PLAN.md) until the association's own photos are imported.
  hero: {
    image: withBase('/images/hero-1600.webp'),
    video: withBase('/media/hero-loop.mp4'),
    alt: {
      en: 'The Moors Club Center grounds',
      es: 'Áreas del Club Center de The Moors',
    },
  },
};

export interface NewsCategory {
  slug: string;
  label: L10n;
}

export const newsCategories: NewsCategory[] = [
  { slug: 'president-corner', label: { en: "President's Corner", es: 'Rincón del Presidente' } },
  { slug: 'from-the-manager', label: { en: 'From the Manager', es: 'De la Administración' } },
  { slug: 'hotwire', label: { en: 'Hotwire', es: 'Hotwire' } },
  { slug: 'security', label: { en: 'Security', es: 'Seguridad' } },
  { slug: 'associations', label: { en: 'Associations', es: 'Asociaciones' } },
  { slug: 'community', label: { en: 'Community', es: 'Comunidad' } },
];

export function categoryLabel(slug: string): L10n {
  return newsCategories.find((c) => c.slug === slug)?.label ?? { en: slug, es: slug };
}

/** The task tiles under the home page hero. */
export const quickTasks: { icon: string; title: L10n; text: L10n; path: string; external?: boolean }[] = [
  { icon: 'card', title: { en: 'Pay association fees', es: 'Pagar cuotas' }, text: { en: 'Pay online in a few minutes', es: 'Pague en línea en pocos minutos' }, path: 'payments', external: true },
  { icon: 'id', title: { en: 'Moors ID and barcodes', es: 'Moors ID y códigos de barra' }, text: { en: 'What to bring to the office', es: 'Qué traer a la oficina' }, path: '/the-moors-rules-and-regulations/moors-id/' },
  { icon: 'gate', title: { en: 'SmartPlus gate access', es: 'Acceso SmartPlus' }, text: { en: 'App setup and visitor passes', es: 'Configurar la app y pases para visitas' }, path: '/gates-and-security/smartplus-gate-system/' },
  { icon: 'shield', title: { en: 'Report a concern', es: 'Reportar una situación' }, text: { en: 'Security: 305-723-1800', es: 'Seguridad: 305-723-1800' }, path: '/neighborhood-watch/' },
];
