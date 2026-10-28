/*
 * One place to read all site content.
 *
 * With SANITY_PROJECT_ID set, everything comes from Sanity, where the manager and board edit it.
 * Without it, everything comes from the Markdown files in /content, which are also what
 * scripts/seed-sanity.mjs loads into Sanity the first time.
 */
import matter from 'gray-matter';
import { marked } from 'marked';
import { createClient, type SanityClient } from '@sanity/client';
import { toHTML } from '@portabletext/to-html';
import { withBase, withBaseHtml, type Lang, type L10n } from '../i18n/ui';
import { defaultSettings, type Settings } from '../data/site';

export interface Localized {
  /** HTML per language. */
  html: L10n;
  /** True for a language that had no text of its own and shows the English version. */
  fallback: Record<Lang, boolean>;
}

export interface Page {
  path: string;
  section: string;
  order: number;
  title: L10n;
  summary: L10n;
  body: Localized;
  updated?: string;
}

export interface Post {
  slug: string;
  path: string;
  date: string;
  categories: string[];
  title: L10n;
  excerpt: L10n;
  image?: string;
  body: Localized;
}

export interface Event {
  slug: string;
  path: string;
  title: L10n;
  summary: L10n;
  /** ISO date-time with offset, or a plain date for all-day events. Absent for standing meetings. */
  start?: string;
  end?: string;
  recurrence?: L10n;
  location: L10n;
  body: Localized;
}

export interface Doc {
  id: string;
  title: L10n;
  description: L10n;
  url: string;
  category: string;
  updated?: string;
}

// ---------------------------------------------------------------- helpers

function md(src: string): string {
  return withBaseHtml(marked.parse(src.trim(), { async: false }) as string);
}

/** Split a Markdown body into its English and Spanish halves, marked with <!-- en --> and <!-- es -->. */
function splitLangs(body: string): L10n {
  const parts: L10n = { en: '', es: '' };
  const re = /<!--\s*(en|es)\s*-->/g;
  const marks = [...body.matchAll(re)];
  if (marks.length === 0) return { en: body, es: '' };
  marks.forEach((m, i) => {
    const start = m.index! + m[0].length;
    const end = i + 1 < marks.length ? marks[i + 1].index! : body.length;
    parts[m[1] as Lang] = body.slice(start, end).trim();
  });
  return parts;
}

function localizeHtml(en: string, es: string): Localized {
  return {
    html: { en, es: es || en },
    fallback: { en: false, es: !es },
  };
}

function l10n(v: unknown): L10n {
  if (v && typeof v === 'object') {
    const o = v as Partial<L10n>;
    return { en: o.en ?? '', es: o.es || o.en || '' };
  }
  const s = typeof v === 'string' ? v : '';
  return { en: s, es: s };
}

function asDate(v: unknown): string | undefined {
  if (!v) return undefined;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

// ---------------------------------------------------------------- local source

const files = {
  pages: import.meta.glob('/content/pages/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>,
  news: import.meta.glob('/content/news/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>,
  events: import.meta.glob('/content/events/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>,
  documents: import.meta.glob('/content/documents/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>,
};

function localPages(): Page[] {
  return Object.values(files.pages).map((raw) => {
    const { data, content } = matter(raw);
    const b = splitLangs(content);
    return {
      path: data.path,
      section: data.section,
      order: data.order ?? 50,
      title: l10n(data.title),
      summary: l10n(data.summary),
      body: localizeHtml(md(b.en), b.es ? md(b.es) : ''),
      updated: asDate(data.updated),
    };
  });
}

function localPosts(): Post[] {
  return Object.values(files.news).map((raw) => {
    const { data, content } = matter(raw);
    const b = splitLangs(content);
    return {
      slug: data.slug,
      path: `/${data.slug}/`,
      date: asDate(data.date)!,
      categories: data.categories ?? [],
      title: l10n(data.title),
      excerpt: l10n(data.excerpt),
      image: data.image ? withBase(data.image) : undefined,
      body: localizeHtml(md(b.en), b.es ? md(b.es) : ''),
    };
  });
}

function localEvents(): Event[] {
  return Object.values(files.events).map((raw) => {
    const { data, content } = matter(raw);
    const b = splitLangs(content);
    return {
      slug: data.slug,
      path: `/events/${data.slug}/`,
      title: l10n(data.title),
      summary: l10n(data.summary),
      start: data.start ? (data.start instanceof Date ? data.start.toISOString() : String(data.start)) : undefined,
      end: data.end ? (data.end instanceof Date ? data.end.toISOString() : String(data.end)) : undefined,
      recurrence: data.recurrence ? l10n(data.recurrence) : undefined,
      location: l10n(data.location),
      body: localizeHtml(md(b.en), b.es ? md(b.es) : ''),
    };
  });
}

function localDocs(): Doc[] {
  return Object.entries(files.documents).map(([file, raw]) => {
    const { data } = matter(raw);
    return {
      id: file.split('/').pop()!.replace(/\.md$/, ''),
      title: l10n(data.title),
      description: l10n(data.description),
      url: withBase(data.url),
      category: data.category ?? 'general',
      updated: asDate(data.updated),
    };
  });
}

// ---------------------------------------------------------------- Sanity source

const projectId = import.meta.env.SANITY_PROJECT_ID as string | undefined;
const dataset = (import.meta.env.SANITY_DATASET as string | undefined) || 'production';

let client: SanityClient | undefined;
if (projectId) {
  client = createClient({
    projectId,
    dataset,
    apiVersion: '2025-01-01',
    useCdn: false,
    token: import.meta.env.SANITY_READ_TOKEN || undefined,
    perspective: 'published',
  });
}

const ptComponents = {
  types: {
    image: ({ value }: { value: { url?: string; alt?: string; caption?: string } }) =>
      value.url
        ? `<figure><img src="${value.url}?w=1200&auto=format" alt="${value.alt ?? ''}" loading="lazy">${value.caption ? `<figcaption>${value.caption}</figcaption>` : ''}</figure>`
        : '',
    fileLink: ({ value }: { value: { url?: string; label?: string } }) =>
      value.url ? `<p><a class="doc-link" href="${value.url}">${value.label ?? value.url}</a></p>` : '',
    callout: ({ value }: { value: { tone?: string; text?: string } }) => {
      const cls = value.tone === 'emergency' ? 'emergency' : value.tone === 'gold' ? 'callout callout--gold' : 'callout';
      return `<div class="${cls}">${md(value.text ?? '')}</div>`;
    },
    table: ({ value }: { value: { hasHeader?: boolean; rows?: { cells?: string[] }[] } }) => {
      const rows = value.rows ?? [];
      const cell = (tag: string) => (c: string) => `<${tag}>${marked.parseInline(c ?? '')}</${tag}>`;
      const head = value.hasHeader && rows.length ? `<thead><tr>${(rows[0].cells ?? []).map(cell('th')).join('')}</tr></thead>` : '';
      const body = (value.hasHeader ? rows.slice(1) : rows).map((r) => `<tr>${(r.cells ?? []).map(cell('td')).join('')}</tr>`).join('');
      return `<div class="table-wrap"><table>${head}<tbody>${body}</tbody></table></div>`;
    },
  },
  marks: {
    link: ({ children, value }: { children: string; value?: { href?: string } }) => {
      const href = value?.href ?? '#';
      const ext = /^https?:/.test(href) && !href.includes('themoors.com');
      return `<a href="${href}"${ext ? ' rel="noopener" target="_blank"' : ''}>${children}</a>`;
    },
  },
};

function pt(blocks: unknown): string {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';
  return withBaseHtml(toHTML(blocks as never, { components: ptComponents as never }));
}

function ptLocalized(body: { en?: unknown; es?: unknown } | undefined): Localized {
  return localizeHtml(pt(body?.en), pt(body?.es));
}

const bodyProjection = `body{ "en": en[]{..., _type == "image" => {..., "url": asset->url}, _type == "fileLink" => {..., "url": file.asset->url}}, "es": es[]{..., _type == "image" => {..., "url": asset->url}, _type == "fileLink" => {..., "url": file.asset->url}} }`;

async function sanityPages(c: SanityClient): Promise<Page[]> {
  const rows = await c.fetch(`*[_type == "page"]{ path, section, order, title, summary, _updatedAt, ${bodyProjection} }`);
  return rows.map((r: any) => ({
    path: r.path,
    section: r.section,
    order: r.order ?? 50,
    title: l10n(r.title),
    summary: l10n(r.summary),
    body: ptLocalized(r.body),
    updated: r._updatedAt?.slice(0, 10),
  }));
}

async function sanityPosts(c: SanityClient): Promise<Post[]> {
  const rows = await c.fetch(`*[_type == "post" && defined(slug.current)]{ "slug": slug.current, date, categories, title, excerpt, "image": image.asset->url, ${bodyProjection} }`);
  return rows.map((r: any) => ({
    slug: r.slug,
    path: `/${r.slug}/`,
    date: r.date,
    categories: r.categories ?? [],
    title: l10n(r.title),
    excerpt: l10n(r.excerpt),
    image: r.image ? `${r.image}?w=1200&auto=format` : undefined,
    body: ptLocalized(r.body),
  }));
}

async function sanityEvents(c: SanityClient): Promise<Event[]> {
  const rows = await c.fetch(`*[_type == "event" && defined(slug.current)]{ "slug": slug.current, title, summary, start, end, allDay, recurrence, location, ${bodyProjection} }`);
  return rows.map((r: any) => ({
    slug: r.slug,
    path: `/events/${r.slug}/`,
    title: l10n(r.title),
    summary: l10n(r.summary),
    start: r.start ? (r.allDay ? String(r.start).slice(0, 10) : r.start) : undefined,
    end: r.end ?? undefined,
    recurrence: r.recurrence?.en ? l10n(r.recurrence) : undefined,
    location: l10n(r.location),
    body: ptLocalized(r.body),
  }));
}

async function sanityDocs(c: SanityClient): Promise<Doc[]> {
  const rows = await c.fetch(`*[_type == "document"]{ _id, title, description, category, _updatedAt, "url": coalesce(file.asset->url, externalUrl) }`);
  return rows.map((r: any) => ({
    id: r._id,
    title: l10n(r.title),
    description: l10n(r.description),
    url: r.url,
    category: r.category ?? 'general',
    updated: r._updatedAt?.slice(0, 10),
  }));
}

async function sanitySettings(c: SanityClient): Promise<Settings> {
  const s = await c.fetch(`*[_id == "siteSettings"][0]{ ..., "heroImage": heroImage.asset->url, "heroVideo": heroVideo.asset->url }`);
  if (!s) return defaultSettings;
  const d = defaultSettings;
  return {
    ...d,
    paymentsUrl: s.paymentsUrl || d.paymentsUrl,
    youtubeUrl: s.youtubeUrl || d.youtubeUrl,
    subscribeAction: s.subscribeAction || d.subscribeAction,
    office: {
      ...d.office,
      phone: s.officePhone || d.office.phone,
      email: s.officeEmail || d.office.email,
      address: s.officeAddress || d.office.address,
      hours: s.officeHours?.en?.length ? { en: s.officeHours.en, es: s.officeHours.es?.length ? s.officeHours.es : s.officeHours.en } : d.office.hours,
    },
    security: { ...d.security, phone: s.securityPhone || d.security.phone },
    alert: s.alert?.active && s.alert?.text?.en ? { level: s.alert.level ?? 'info', text: l10n(s.alert.text), path: s.alert.path } : undefined,
    hero: {
      image: s.heroImage ? `${s.heroImage}?w=2400&auto=format` : d.hero.image,
      video: s.heroVideo ?? d.hero.video,
      alt: s.heroAlt?.en ? l10n(s.heroAlt) : d.hero.alt,
    },
  };
}

// ---------------------------------------------------------------- public API (cached per build)

interface All {
  pages: Page[];
  posts: Post[];
  events: Event[];
  docs: Doc[];
  settings: Settings;
}

let cache: Promise<All> | undefined;

function load(): Promise<All> {
  if (!cache) {
    cache = (async () => {
      if (client) {
        const [pages, posts, events, docs, settings] = await Promise.all([
          sanityPages(client), sanityPosts(client), sanityEvents(client), sanityDocs(client), sanitySettings(client),
        ]);
        return { pages, posts, events, docs, settings };
      }
      return { pages: localPages(), posts: localPosts(), events: localEvents(), docs: localDocs(), settings: defaultSettings };
    })().then((all) => {
      all.posts.sort((a, b) => b.date.localeCompare(a.date));
      all.pages.sort((a, b) => a.order - b.order);
      return all;
    });
  }
  return cache;
}

export const getPages = async () => (await load()).pages;
export const getPosts = async () => (await load()).posts;
export const getEvents = async () => (await load()).events;
export const getDocs = async () => (await load()).docs;
export const getSettings = async () => (await load()).settings;

export async function getPage(path: string): Promise<Page | undefined> {
  return (await getPages()).find((p) => p.path === path);
}

/** Events split into upcoming dated ones, standing meetings, and past ones. */
export async function getEventGroups(now = new Date()) {
  const events = await getEvents();
  const today = now.toISOString().slice(0, 10);
  const endOf = (e: Event) => (e.end ?? e.start ?? '').slice(0, 10);
  const upcoming = events.filter((e) => e.start && endOf(e) >= today).sort((a, b) => a.start!.localeCompare(b.start!));
  const past = events.filter((e) => e.start && endOf(e) < today).sort((a, b) => b.start!.localeCompare(a.start!));
  const recurring = events.filter((e) => !e.start);
  return { upcoming, recurring, past };
}
