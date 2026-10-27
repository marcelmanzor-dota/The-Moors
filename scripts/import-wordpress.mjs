#!/usr/bin/env node
/*
 * Imports the current themoors.com content verbatim through the WordPress REST API.
 *
 *   node scripts/import-wordpress.mjs [--site https://www.themoors.com] [--dry-run]
 *
 * Writes:
 *   content/_import/pages/*.md     every WordPress page, English text, with its original path
 *   content/_import/news/*.md      every post, with original slug, date and categories
 *   content/_import/events/*.md    events, if The Events Calendar plugin is installed
 *   content/_import/report.json    a list of everything found, menus, and what still needs review
 *   public/files/                  PDFs and other documents linked from the content
 *   public/images/                 images used in the content
 *
 * The files land in content/_import/ (ignored by the site build) so they can be reviewed,
 * translated and moved into content/pages, content/news and content/events.
 * Nothing here was run against the live site yet; see docs/CONTENT-IMPORT.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const arg = (name, def) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : def; };
const SITE = arg('site', 'https://www.themoors.com').replace(/\/$/, '');
const dry = process.argv.includes('--dry-run');
const OUT = path.resolve('content/_import');
const UA = { 'User-Agent': 'TheMoorsSiteMigration/1.0' };

const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced' });
td.use(gfm);
td.remove(['script', 'style', 'iframe', 'noscript']);

async function getJson(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return { data: await res.json(), total: Number(res.headers.get('x-wp-totalpages') ?? 1) };
}

/** Every item of a WP collection, following pagination. */
async function all(endpoint, params = '') {
  const items = [];
  for (let page = 1; ; page++) {
    const { data, total } = await getJson(`${SITE}/wp-json/wp/v2/${endpoint}?per_page=100&page=${page}${params}`);
    items.push(...data);
    if (page >= total) break;
  }
  return items;
}

const decode = (s = '') => s
  .replace(/&#8217;|&rsquo;/g, '’').replace(/&#8216;|&lsquo;/g, '‘').replace(/&#8220;|&ldquo;/g, '“').replace(/&#8221;|&rdquo;/g, '”')
  .replace(/&#8211;|&ndash;/g, '–').replace(/&#8212;|&mdash;/g, '—').replace(/&#038;|&amp;/g, '&').replace(/&nbsp;/g, ' ')
  .replace(/&#8230;/g, '…').replace(/<[^>]+>/g, '').trim();

const yaml = (s) => JSON.stringify(s ?? '');

const assets = new Map(); // remote URL -> local path
function localizeAssets(html) {
  return html.replace(/(href|src)="(https?:\/\/[^"]*themoors\.com\/wp-content\/uploads\/[^"]+)"/g, (m, attr, url) => {
    const clean = url.split('?')[0];
    const ext = path.extname(clean).toLowerCase();
    const dir = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext) ? 'images' : 'files';
    const local = `/${dir}/${path.basename(clean)}`;
    assets.set(clean, local);
    return `${attr}="${local}"`;
  });
}

function internalLinks(md) {
  // Absolute links to the old site become site-relative so they keep working on the new domain setup.
  return md.replace(/\]\(https?:\/\/(www\.)?themoors\.com(\/[^)\s]*)?\)/g, (m, w, p) => `](${p || '/'})`);
}

function toMd(html) {
  return internalLinks(td.turndown(localizeAssets(html ?? ''))).replace(/\n{3,}/g, '\n\n').trim();
}

function write(rel, text) {
  const file = path.join(OUT, rel);
  if (dry) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

const report = { site: SITE, at: new Date().toISOString(), pages: [], posts: [], events: [], categories: [], menus: null, assets: [], problems: [] };

// ---------------------------------------------------------------- categories
const cats = await all('categories');
const catSlug = new Map(cats.map((c) => [c.id, c.slug]));
report.categories = cats.map((c) => ({ slug: c.slug, name: decode(c.name), count: c.count, parent: catSlug.get(c.parent) ?? null }));

// ---------------------------------------------------------------- pages
for (const p of await all('pages', '&status=publish')) {
  const url = new URL(p.link);
  const rel = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
  const name = rel === '/' ? 'home' : rel.slice(1, -1).replace(/\//g, '__');
  write(`pages/${name}.md`, `---
path: ${rel}
title:
  en: ${yaml(decode(p.title.rendered))}
  es: ""
summary:
  en: ${yaml(decode(p.excerpt?.rendered ?? '').slice(0, 220))}
  es: ""
updated: ${p.modified.slice(0, 10)}
wpId: ${p.id}
---
<!-- en -->
${toMd(p.content.rendered)}

<!-- es -->
`);
  report.pages.push({ path: rel, title: decode(p.title.rendered), modified: p.modified });
}

// ---------------------------------------------------------------- posts
for (const p of await all('posts', '&status=publish&_embed=wp:featuredmedia')) {
  const img = p._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  if (img) assets.set(img.split('?')[0], `/images/${path.basename(img.split('?')[0])}`);
  write(`news/${p.slug}.md`, `---
slug: ${p.slug}
date: ${p.date.slice(0, 10)}
categories: [${p.categories.map((id) => catSlug.get(id)).filter(Boolean).join(', ')}]
title:
  en: ${yaml(decode(p.title.rendered))}
  es: ""
excerpt:
  en: ${yaml(decode(p.excerpt.rendered).slice(0, 260))}
  es: ""${img ? `\nimage: /images/${path.basename(img.split('?')[0])}` : ''}
wpId: ${p.id}
---
<!-- en -->
${toMd(p.content.rendered)}

<!-- es -->
`);
  report.posts.push({ slug: p.slug, date: p.date, title: decode(p.title.rendered), categories: p.categories.map((id) => catSlug.get(id)) });
}

// ---------------------------------------------------------------- events (The Events Calendar), if present
try {
  for (let page = 1; ; page++) {
    const res = await fetch(`${SITE}/wp-json/tribe/events/v1/events?per_page=50&page=${page}&start_date=2000-01-01`, { headers: UA });
    if (!res.ok) break;
    const json = await res.json();
    for (const e of json.events ?? []) {
      const venue = e.venue?.venue ? decode(e.venue.venue) : '';
      const start = e.all_day ? e.start_date.slice(0, 10) : `${e.start_date.replace(' ', 'T')}${e.utc_start_date ? '' : ''}`;
      write(`events/${e.slug}.md`, `---
slug: ${e.slug}
start: ${yaml(start)}
end: ${yaml(e.all_day ? e.end_date.slice(0, 10) : e.end_date.replace(' ', 'T'))}
timezone: ${yaml(e.timezone ?? 'America/New_York')}
title:
  en: ${yaml(decode(e.title))}
  es: ""
summary:
  en: ${yaml(decode(e.excerpt ?? '').slice(0, 220))}
  es: ""
location:
  en: ${yaml(venue)}
  es: ${yaml(venue)}
wpId: ${e.id}
---
<!-- en -->
${toMd(e.description)}

<!-- es -->
`);
      report.events.push({ slug: e.slug, start: e.start_date, title: decode(e.title), recurring: !!e.recurring });
    }
    if (!json.next_rest_url) break;
  }
} catch (err) {
  report.problems.push(`Events API not available: ${err.message}`);
}

// ---------------------------------------------------------------- menus (WordPress 5.9+ exposes them to logged-in users only; try anyway)
try {
  report.menus = (await getJson(`${SITE}/wp-json/wp/v2/menu-items?per_page=100`)).data;
} catch {
  report.problems.push('Menus are not public. Compare the menu in src/data/nav.ts against the live site by hand.');
}

// ---------------------------------------------------------------- download assets
for (const [remote, local] of assets) {
  const file = path.resolve('public', local.slice(1));
  report.assets.push({ remote, local });
  if (dry || fs.existsSync(file)) continue;
  try {
    const res = await fetch(remote, { headers: UA });
    if (!res.ok) throw new Error(String(res.status));
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  } catch (err) {
    report.problems.push(`Could not download ${remote}: ${err.message}`);
  }
}

write('report.json', JSON.stringify(report, null, 2));
console.log(`${dry ? '[dry run] ' : ''}${report.pages.length} pages, ${report.posts.length} posts, ${report.events.length} events, ${report.assets.length} files.`);
if (report.problems.length) console.log('Needs attention:\n- ' + report.problems.join('\n- '));
