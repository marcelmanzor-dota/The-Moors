# The Moors website

The new site for The Moors Master Maintenance Association, in English and Spanish.

- **Design:** Concept A, "Gilded Gate": the original crimson and gold palette, a gold-outlined logo, metallic buttons, Cormorant Garamond headlines and Libre Franklin text.
- **Site:** [Astro](https://astro.build), built to static HTML. No database or plugins to patch.
- **Editing:** the manager and board post news and events, upload documents and change settings in [Sanity Studio](studio/), with English and Spanish side by side. See [docs/EDITING.md](docs/EDITING.md).
- **Search:** [Pagefind](https://pagefind.app), built at deploy time, separate indexes for English and Spanish.
- **Old links keep working:** page paths match the old WordPress site, and `vercel.json` redirects the rest.

## Run it

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/, plus the search index
```

Requires Node 22.22 or newer.

Without Sanity settings, the site builds from the Markdown files in `content/`. With `SANITY_PROJECT_ID` set (see `.env.example`), it builds from Sanity.

## Where things are

| Path | What it is |
| --- | --- |
| `content/` | Seed content: pages, news, events, documents, each with `<!-- en -->` and `<!-- es -->` halves |
| `src/data/nav.ts` | The main menu, dropdowns and top links, in both languages |
| `src/data/site.ts` | Default settings: phones, hours, payment link, home page task tiles |
| `src/i18n/ui.ts` | Every interface label in English and Spanish |
| `src/styles/global.css` | The design system: colors, type, metallic buttons, motion |
| `src/lib/content.ts` | Reads content from Sanity or from `content/` |
| `studio/` | Sanity Studio (the editing dashboard) |
| `scripts/gild-logo.mjs` | Adds the gold outline to the logo |
| `scripts/import-wordpress.mjs` | Pulls the current site's content through the WordPress API |
| `scripts/seed-sanity.mjs` | Loads `content/` into Sanity at launch |
| `docs/` | Content import plan, editor guide, Higgsfield plan |

## Launch checklist

1. **Import the real content.** Follow [docs/CONTENT-IMPORT.md](docs/CONTENT-IMPORT.md). Until then, pages hold short summaries confirmed from the current site, marked `import: pending`.
2. **Logo.** Save the original logo as `public/brand/logo-source.png` (or `.svg`), then run `npm run gild-logo` and `node scripts/make-og.mjs`.
3. **Sanity.** Create a free project at [sanity.io](https://www.sanity.io), then:
   - `cd studio && cp .env.example .env`, fill in the project ID, run `npm install` and `npx sanity deploy`. The dashboard goes live at `https://the-moors.sanity.studio`.
   - Create an Editor API token and run `SANITY_PROJECT_ID=… SANITY_WRITE_TOKEN=… npm run seed-sanity` once.
   - Invite the manager and board members (Manage → Members). The free plan includes 20 seats.
4. **Hosting.** Import the GitHub repo into Vercel (or Netlify or Cloudflare Pages). Set `SANITY_PROJECT_ID` and `SANITY_DATASET`.
   - Vercel's free Hobby plan is for non-commercial use. If the association is the client, use Vercel Pro, or Netlify or Cloudflare Pages, which allow it on their free tiers.
5. **Publish on save.** In Vercel, create a Deploy Hook. In Sanity (Manage → API → Webhooks), add a webhook to that URL for create, update and delete. Edits then go live in about a minute.
6. **Daily rebuild.** Add the same hook as the `VERCEL_DEPLOY_HOOK` repository secret, so past events drop off each morning.
7. **Domain.** Point `themoors.com` at the host once the board approves.
