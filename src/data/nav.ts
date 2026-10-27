import type { L10n } from '../i18n/ui';

export interface NavLink {
  label: L10n;
  /** One line shown under the label in the dropdown. */
  desc?: L10n;
  path: string;
}

export interface NavGroup {
  key: string;
  label: L10n;
  /** Section landing page. */
  path: string;
  items: NavLink[];
}

/*
 * Paths match the old WordPress site wherever the old path is known, so links in
 * emails, flyers and search results keep working. Paths marked "new" did not exist
 * before; docs/CONTENT-IMPORT.md lists the redirects to add once the crawl confirms them.
 */
export const mainNav: NavGroup[] = [
  {
    key: 'about',
    label: { en: 'About Us', es: 'Nosotros' },
    path: '/about-the-moors/',
    items: [
      { label: { en: 'About The Moors', es: 'Acerca de The Moors' }, desc: { en: 'Associations, committees and how they work', es: 'Asociaciones, comités y cómo funcionan' }, path: '/about-the-moors/' },
      { label: { en: 'Board members', es: 'Miembros de la junta' }, desc: { en: 'The Moors Master Association board', es: 'Junta de The Moors Master Association' }, path: '/about-the-moors/moors-master-association/' },
      { label: { en: 'Garden Homes Association', es: 'Garden Homes Association' }, desc: { en: 'Officers and meetings', es: 'Directiva y reuniones' }, path: '/about-the-moors/garden-homes-association/' },
      { label: { en: 'Moors Pointe Condominium', es: 'Moors Pointe Condominium' }, desc: { en: 'Officers, meetings and handbook', es: 'Directiva, reuniones y manual' }, path: '/about-the-moors/moors-pointe-condominium-association/' },
      { label: { en: 'Village Homes', es: 'Village Homes' }, desc: { en: 'Association news and contacts', es: 'Noticias y contactos de la asociación' }, path: '/about-the-moors/village-homes/' },
      { label: { en: 'Patio Homes', es: 'Patio Homes' }, desc: { en: 'Association news and contacts', es: 'Noticias y contactos de la asociación' }, path: '/about-the-moors/patio-homes/' },
      { label: { en: 'Contact', es: 'Contacto' }, desc: { en: 'Office hours, phone and address', es: 'Horario, teléfono y dirección' }, path: '/about-the-moors/contact/' },
    ],
  },
  {
    key: 'residents',
    label: { en: 'Residents', es: 'Residentes' },
    path: '/for-residents/',
    items: [
      { label: { en: 'Resident services', es: 'Servicios para residentes' }, desc: { en: 'Where to start as an owner or renter', es: 'Por dónde empezar como propietario o inquilino' }, path: '/for-residents/' },
      { label: { en: 'Documents', es: 'Documentos' }, desc: { en: 'Moors handbook and architectural form', es: 'Manual de The Moors y formulario arquitectónico' }, path: '/for-residents/documents/' },
      { label: { en: 'Property management', es: 'Administración de la propiedad' }, desc: { en: 'New owners and renters', es: 'Nuevos propietarios e inquilinos' }, path: '/for-residents/property-management/' },
    ],
  },
  {
    key: 'rules',
    label: { en: 'Rules', es: 'Reglas' },
    path: '/the-moors-rules-and-regulations/',
    items: [
      { label: { en: 'Rules and regulations', es: 'Reglas y regulaciones' }, desc: { en: 'Overview and the Moors handbook', es: 'Resumen y el manual de The Moors' }, path: '/the-moors-rules-and-regulations/' },
      { label: { en: 'Moors ID', es: 'Moors ID' }, desc: { en: 'Cost, renewal and guest IDs', es: 'Costo, renovación e identificaciones de invitados' }, path: '/the-moors-rules-and-regulations/moors-id/' },
      { label: { en: 'Guest parking and permits', es: 'Estacionamiento de invitados y permisos' }, path: '/the-moors-rules-and-regulations/guest-parking-and-permits/' },
      { label: { en: 'Street parking', es: 'Estacionamiento en la calle' }, path: '/the-moors-rules-and-regulations/street-parking/' },
      { label: { en: 'EV charging stations', es: 'Estaciones de carga eléctrica' }, path: '/the-moors-rules-and-regulations/ev-charging-stations/' },
      { label: { en: 'Boot enforcement', es: 'Inmovilización de vehículos' }, path: '/the-moors-rules-and-regulations/boot-enforcement/' },
      { label: { en: 'Common areas', es: 'Áreas comunes' }, path: '/the-moors-rules-and-regulations/common-areas/' },
    ],
  },
  {
    key: 'services',
    label: { en: 'Services', es: 'Servicios' },
    path: '/services/',
    items: [
      { label: { en: 'All services', es: 'Todos los servicios' }, desc: { en: 'Club Center events and programs', es: 'Eventos y programas del Club Center' }, path: '/services/' },
      { label: { en: 'The Moors Club Center', es: 'The Moors Club Center' }, desc: { en: 'Pool, courts and facilities', es: 'Piscina, canchas e instalaciones' }, path: '/services/the-moors-club-center/' },
      { label: { en: 'Tennis program', es: 'Programa de tenis' }, path: '/services/tennis-program/' },
      { label: { en: 'Hotwire Fision TV and Internet', es: 'Hotwire Fision TV e Internet' }, desc: { en: 'Community TV and internet service', es: 'Servicio comunitario de TV e internet' }, path: '/services/hotwire-fision-tv-and-internet/' },
      { label: { en: 'Comcast cable', es: 'Cable de Comcast' }, desc: { en: 'Former provider', es: 'Proveedor anterior' }, path: '/services/free-digital-cable-box-to-moors-residents/' },
    ],
  },
  {
    key: 'security',
    label: { en: 'Security', es: 'Seguridad' },
    path: '/gates-and-security/',
    items: [
      { label: { en: 'Gates and security', es: 'Portones y seguridad' }, desc: { en: 'How to get in, who to call', es: 'Cómo entrar y a quién llamar' }, path: '/gates-and-security/' },
      { label: { en: 'Vehicle barcodes', es: 'Códigos de barra para vehículos' }, desc: { en: 'Required for gate access', es: 'Requeridos para entrar por el portón' }, path: '/gates-and-security/vehicle-barcodes/' },
      { label: { en: 'SmartPlus gate system', es: 'Sistema de portón SmartPlus' }, desc: { en: 'App, face access and visitor QR codes', es: 'App, acceso facial y códigos QR para visitas' }, path: '/gates-and-security/smartplus-gate-system/' },
      { label: { en: 'See something, say something', es: 'Si ve algo, diga algo' }, desc: { en: 'How to report a concern', es: 'Cómo reportar una situación' }, path: '/neighborhood-watch/' },
      { label: { en: 'Community safety', es: 'Seguridad comunitaria' }, desc: { en: 'Police recommendations', es: 'Recomendaciones de la policía' }, path: '/community-safety/' },
    ],
  },
  {
    key: 'events',
    label: { en: 'Events', es: 'Eventos' },
    path: '/events/',
    items: [
      { label: { en: 'Calendar', es: 'Calendario' }, desc: { en: 'Everything coming up', es: 'Todo lo que viene' }, path: '/events/' },
      { label: { en: 'Board meetings', es: 'Reuniones de la junta' }, desc: { en: 'Open to all homeowners', es: 'Abiertas a todos los propietarios' }, path: '/events/board-meetings/' },
      { label: { en: 'CAC monthly meeting', es: 'Reunión mensual del CAC' }, desc: { en: 'Citizen Advisory Committee', es: 'Comité Asesor Ciudadano' }, path: '/events/cac-monthly-meeting/' },
    ],
  },
  {
    key: 'news',
    label: { en: 'News', es: 'Noticias' },
    path: '/news/',
    items: [],
  },
];

export const utilityNav: NavLink[] = [
  { label: { en: 'Subscribe', es: 'Suscribirse' }, path: '/subscribe/' },
  { label: { en: 'Hotwire', es: 'Hotwire' }, path: '/category/hotwire/' },
  { label: { en: "President's Corner", es: 'Rincón del Presidente' }, path: '/category/president-corner/' },
  { label: { en: 'From the Manager', es: 'De la Administración' }, path: '/category/from-the-manager/' },
  { label: { en: 'Contact', es: 'Contacto' }, path: '/about-the-moors/contact/' },
];

/** Find the nav group that owns a path (for side navigation and breadcrumbs). */
export function groupForPath(path: string): NavGroup | undefined {
  return mainNav.find((g) => g.path === path || g.items.some((i) => i.path === path));
}
