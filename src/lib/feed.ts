import { getPosts } from './content';
import { localize, type Lang } from '../i18n/ui';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function rss(lang: Lang, site: URL): Promise<Response> {
  const posts = (await getPosts()).slice(0, 30);
  const items = posts.map((p) => `
    <item>
      <title>${esc(p.title[lang])}</title>
      <link>${new URL(localize(p.path, lang), site).href}</link>
      <guid>${new URL(localize(p.path, lang), site).href}</guid>
      <pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(p.excerpt[lang])}</description>
    </item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>The Moors</title>
    <link>${new URL(localize('/', lang), site).href}</link>
    <description>${lang === 'en' ? 'News from The Moors Master Maintenance Association' : 'Noticias de The Moors Master Maintenance Association'}</description>
    <language>${lang === 'en' ? 'en-us' : 'es-us'}</language>${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
