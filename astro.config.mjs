// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Defaults to the real domain. The GitHub Pages preview sets SITE_URL and SITE_BASE
  // (see .github/workflows/pages.yml) because it lives under /The-Moors/.
  site: process.env.SITE_URL || 'https://www.themoors.com',
  base: process.env.SITE_BASE || '/',
  // The old WordPress site used trailing slashes; keeping them keeps every old link working.
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en-US', es: 'es-US' } },
    }),
  ],
});
