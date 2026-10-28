import { withBase, type L10n } from '../i18n/ui';

/*
 * The photo and copy for each menu section: used for the interior page banners and the
 * "Explore" grid on the home page. The same view-transition name on both makes the photo
 * morph from the home page card into the section banner when you click through.
 *
 * Images are AI stand-ins generated with Higgsfield until the association's own photos
 * are imported (docs/HIGGSFIELD-PLAN.md). Replace the files in public/images/sections/.
 */
export interface Section {
  key: string;
  image: string;
  alt: L10n;
  blurb: L10n;
}

const img = (name: string) => withBase(`/images/sections/${name}`);

export const sections: Record<string, Section> = {
  about: {
    key: 'about',
    image: img('about'),
    alt: { en: 'Ornate gated entrance lined with royal palms', es: 'Entrada con portón ornamental y palmas reales' },
    blurb: { en: 'The associations, the board and how The Moors is run.', es: 'Las asociaciones, la junta y cómo funciona The Moors.' },
  },
  residents: {
    key: 'residents',
    image: img('residents'),
    alt: { en: 'Tree-lined residential street with Mediterranean townhomes', es: 'Calle residencial arbolada con casas de estilo mediterráneo' },
    blurb: { en: 'Moving in, renting, documents and the Moors handbook.', es: 'Mudanzas, alquileres, documentos y el manual de The Moors.' },
  },
  rules: {
    key: 'rules',
    image: img('rules'),
    alt: { en: 'Clubhouse lobby with crimson chairs and brass details', es: 'Recibidor del club con sillas carmesí y detalles de bronce' },
    blurb: { en: 'Moors ID, parking, guests and the common areas.', es: 'Moors ID, estacionamiento, invitados y áreas comunes.' },
  },
  services: {
    key: 'services',
    image: img('services'),
    alt: { en: 'Tennis courts framed by palms and iron fencing', es: 'Canchas de tenis rodeadas de palmas y rejas de hierro' },
    blurb: { en: 'The Club Center, tennis and TV and internet.', es: 'El Club Center, el tenis y la TV e internet.' },
  },
  security: {
    key: 'security',
    image: img('security'),
    alt: { en: 'Gatehouse with glowing lanterns at dusk', es: 'Caseta de entrada con faroles encendidos al anochecer' },
    blurb: { en: 'Gates, barcodes, SmartPlus and who to call.', es: 'Portones, códigos de barra, SmartPlus y a quién llamar.' },
  },
  events: {
    key: 'events',
    image: img('events'),
    alt: { en: 'String lights and food trucks on the clubhouse lawn at dusk', es: 'Luces colgantes y food trucks en el jardín del club al anochecer' },
    blurb: { en: 'Board meetings, the CAC and Club Center events.', es: 'Reuniones de la junta, el CAC y eventos del Club Center.' },
  },
  news: {
    key: 'news',
    image: img('news'),
    alt: { en: 'Lake at golden hour with townhomes and palms', es: 'Lago al atardecer con casas y palmas' },
    blurb: { en: 'From the board, the manager and the President’s Corner.', es: 'De la junta, la administración y el Rincón del Presidente.' },
  },
};

/** srcset for a section image in the two widths scripts/process-images.mjs writes. */
export const srcset = (base: string) => `${base}-960.webp 960w, ${base}-1600.webp 1600w`;
