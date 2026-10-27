#!/usr/bin/env node
/*
 * Loads everything in /content into Sanity, so editors start with the full site.
 *
 *   SANITY_PROJECT_ID=xxxx SANITY_WRITE_TOKEN=sk... npm run seed-sanity [-- --dry-run]
 *
 * Safe to run more than once: each item gets a fixed ID and is replaced, not duplicated.
 * Run it once at launch. After editors start working in Sanity, running it again
 * would overwrite their changes to the same pages.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import matter from 'gray-matter';
import { marked } from 'marked';
import { createClient } from '@sanity/client';

const dry = process.argv.includes('--dry-run');
const { SANITY_PROJECT_ID, SANITY_DATASET = 'production', SANITY_WRITE_TOKEN } = process.env;
if (!dry && (!SANITY_PROJECT_ID || !SANITY_WRITE_TOKEN)) {
  console.error('Set SANITY_PROJECT_ID and SANITY_WRITE_TOKEN (an Editor token from sanity.io/manage), or pass --dry-run.');
  process.exit(1);
}

const key = () => crypto.randomBytes(6).toString('hex');
const root = path.resolve('content');

// ---------------------------------------------------------------- Markdown -> Portable Text

function spans(tokens, marks, markDefs) {
  const out = [];
  for (const t of tokens ?? []) {
    switch (t.type) {
      case 'strong': out.push(...spans(t.tokens, [...marks, 'strong'], markDefs)); break;
      case 'em': out.push(...spans(t.tokens, [...marks, 'em'], markDefs)); break;
      case 'link': {
        const k = key();
        markDefs.push({ _key: k, _type: 'link', href: t.href });
        out.push(...spans(t.tokens, [...marks, k], markDefs));
        break;
      }
      case 'text':
        if (t.tokens?.length) out.push(...spans(t.tokens, marks, markDefs));
        else out.push({ _type: 'span', _key: key(), text: t.text.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'), marks });
        break;
      case 'escape': case 'codespan': out.push({ _type: 'span', _key: key(), text: t.text, marks }); break;
      case 'br': out.push({ _type: 'span', _key: key(), text: '\n', marks }); break;
      default: break; // inline HTML is dropped
    }
  }
  return out;
}

function block(tokens, style = 'normal', extra = {}) {
  const markDefs = [];
  const children = spans(tokens, [], markDefs);
  if (!children.length) children.push({ _type: 'span', _key: key(), text: '', marks: [] });
  return { _type: 'block', _key: key(), style, markDefs, children, ...extra };
}

function toPortableText(src) {
  const out = [];
  const tokens = marked.lexer(src ?? '');
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    switch (t.type) {
      case 'paragraph': out.push(block(t.tokens)); break;
      case 'heading': out.push(block(t.tokens, t.depth <= 2 ? 'h2' : 'h3')); break;
      case 'blockquote': for (const p of t.tokens) if (p.tokens) out.push(block(p.tokens, 'blockquote')); break;
      case 'list':
        for (const item of t.items) {
          const inner = item.tokens.flatMap((x) => (x.type === 'text' || x.type === 'paragraph' ? (x.tokens ?? [{ type: 'text', text: x.text }]) : []));
          out.push(block(inner, 'normal', { listItem: t.ordered ? 'number' : 'bullet', level: 1 }));
        }
        break;
      case 'table': {
        const plain = (cell) => cell.text;
        const hasHeader = t.header.some((h) => h.text.trim());
        const rows = [...(hasHeader ? [t.header] : []), ...t.rows].map((r) => ({ _key: key(), _type: 'row', cells: r.map(plain) }));
        out.push({ _type: 'table', _key: key(), hasHeader, rows });
        break;
      }
      case 'html': {
        const open = t.raw.match(/<div class="([^"]+)">/);
        if (!open) break;
        const tone = open[1].includes('emergency') ? 'emergency' : open[1].includes('gold') ? 'gold' : 'info';
        const parts = [];
        while (i + 1 < tokens.length && !(tokens[i + 1].type === 'html' && tokens[i + 1].raw.includes('</div>'))) parts.push(tokens[++i].raw);
        i++; // skip the closing </div>
        out.push({ _type: 'callout', _key: key(), tone, text: parts.join('').trim() });
        break;
      }
      default: break; // spaces and rules
    }
  }
  return out;
}

// ---------------------------------------------------------------- read /content

function splitLangs(body) {
  const parts = { en: '', es: '' };
  const marks = [...body.matchAll(/<!--\s*(en|es)\s*-->/g)];
  marks.forEach((m, i) => {
    const end = i + 1 < marks.length ? marks[i + 1].index : body.length;
    parts[m[1]] = body.slice(m.index + m[0].length, end).trim();
  });
  return marks.length ? parts : { en: body, es: '' };
}

const files = (dir) => {
  const abs = path.join(root, dir);
  return fs.readdirSync(abs, { recursive: true }).filter((f) => f.endsWith('.md')).map((f) => matter(fs.readFileSync(path.join(abs, f), 'utf8')));
};
const loc = (v) => (v && typeof v === 'object' ? { en: v.en ?? '', es: v.es ?? '' } : { en: v ?? '', es: '' });
const body = (content) => { const b = splitLangs(content); return { en: toPortableText(b.en), es: toPortableText(b.es) }; };
const day = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v));
const slugId = (s) => s.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/^-+|-+$/g, '');

const docs = [];

for (const { data, content } of files('pages')) {
  docs.push({
    _id: `page-${slugId(data.path) || 'home'}`, _type: 'page',
    path: data.path, section: data.section, order: data.order ?? 50,
    title: loc(data.title), summary: loc(data.summary), body: body(content),
  });
}
for (const { data, content } of files('news')) {
  docs.push({
    _id: `post-${slugId(data.slug)}`, _type: 'post',
    slug: { _type: 'slug', current: data.slug }, date: day(data.date), categories: data.categories ?? [],
    title: loc(data.title), excerpt: loc(data.excerpt), body: body(content),
  });
}
for (const { data, content } of files('events')) {
  const allDay = data.start && day(data.start).length === 10 && !(data.start instanceof Date && data.start.getUTCHours());
  docs.push({
    _id: `event-${slugId(data.slug)}`, _type: 'event',
    slug: { _type: 'slug', current: data.slug },
    ...(data.start ? { start: allDay ? `${day(data.start)}T12:00:00.000Z` : new Date(data.start).toISOString(), allDay } : {}),
    ...(data.end ? { end: new Date(data.end).toISOString() } : {}),
    ...(data.recurrence ? { recurrence: loc(data.recurrence) } : {}),
    title: loc(data.title), summary: loc(data.summary), location: loc(data.location), body: body(content),
  });
}
for (const [i, { data }] of files('documents').entries()) {
  docs.push({
    _id: `document-${i + 1}`, _type: 'document',
    title: loc(data.title), description: loc(data.description), category: data.category, externalUrl: data.url,
  });
}

// Mirrors defaultSettings in src/data/site.ts.
docs.push({
  _id: 'siteSettings', _type: 'siteSettings',
  officePhone: '305-821-9923',
  officeAddress: '17321 NW 66th Ct, Miami, FL 33015',
  officeHours: {
    en: ['Monday to Friday: 8 am to 12 noon and 1 pm to 5 pm', 'Saturday: 9 am to 12 noon'],
    es: ['Lunes a viernes: 8 am a 12 del mediodía y 1 pm a 5 pm', 'Sábado: 9 am a 12 del mediodía'],
  },
  securityPhone: '305-723-1800',
  alert: { active: false, level: 'info' },
});

// ---------------------------------------------------------------- write

if (dry) {
  const counts = docs.reduce((a, d) => ({ ...a, [d._type]: (a[d._type] ?? 0) + 1 }), {});
  console.log('Dry run. Would write:', counts);
  console.log(JSON.stringify(docs.find((d) => d._id.includes(process.env.SHOW ?? 'moors-id')), null, 2).slice(0, 1600));
  process.exit(0);
}

const client = createClient({ projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET, apiVersion: '2025-01-01', token: SANITY_WRITE_TOKEN, useCdn: false });
const tx = client.transaction();
for (const d of docs) tx.createOrReplace(d);
await tx.commit();
console.log(`Wrote ${docs.length} documents to ${SANITY_PROJECT_ID}/${SANITY_DATASET}.`);
