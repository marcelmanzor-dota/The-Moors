# Content import plan

The site was built in a session that could not reach `www.themoors.com`, so the pages in `content/` hold short summaries made only from facts confirmed on the current site via search. Every one of them is marked `import: pending`. This file is the runbook for the session that *can* reach the site.

## 1. Confirm access

```sh
curl -sI https://www.themoors.com/ | head -1      # expect HTTP/2 200
curl -s https://www.themoors.com/wp-json/ | head -c 200
```

If either fails, `www.themoors.com` must be added to the environment's allowed network domains, then start a new session.

## 2. Pull everything

```sh
node scripts/import-wordpress.mjs --dry-run   # counts only
node scripts/import-wordpress.mjs
```

This writes verbatim English content to `content/_import/` and downloads PDFs and images to `public/files/` and `public/images/`. Read `content/_import/report.json` for anything it could not fetch. The script has not been run against the live site yet, so expect small fixes.

If the REST API is disabled, fall back to the sitemap: `https://www.themoors.com/sitemap/` (and `wp-sitemap.xml` or `sitemap_index.xml`), fetch each page, and extract the main content area.

## 3. Things to capture by hand from the live site

- [ ] **Logo:** the original file (`wp-content/uploads/...`, ideally SVG or a large PNG). Save as `public/brand/logo-source.png`, run `npm run gild-logo` and `node scripts/make-og.mjs`. Check `--gold`/`--bronze` thickness against the real artwork.
- [ ] **Payments button URL:** set `paymentsUrl` in `src/data/site.ts` (and later in Sanity Site settings).
- [ ] **YouTube channel URL:** set `youtubeUrl`.
- [ ] **Menus:** compare every top menu and dropdown with `src/data/nav.ts`. Add any missing item and its page.
- [ ] **Subscribe:** find which service the current Subscribe link uses (MailPoet, Mailchimp, Jetpack…) and set `subscribeAction`, or keep the "call the office" fallback.
- [ ] **Office email and Saturday hours:** the About page and the Residents page disagree on Saturday hours. Confirm with the office.
- [ ] **Board meeting time:** the homepage says 7 PM and the association pages say 6:30 PM. Confirm.
- [ ] **Full Master Board roster** for `/about-the-moors/moors-master-association/`.
- [ ] **Photos for the hero and Club Center:** the largest originals from the media library.

## 4. Merge into `content/`

For each imported file:

1. Keep the original `path` or `slug`. Old links depend on it.
2. Move it to the matching folder (`content/pages/<section>/`, `content/news/`, `content/events/`) and set `section` and `order` for pages, matching `src/data/nav.ts`.
3. Replace the summary content in the existing file of the same path, and remove `import: pending`.
4. Write the Spanish half (`<!-- es -->`) and the `es:` fields. Use "usted", neutral Latin American Spanish, and keep proper names (Club Center, Moors ID, SmartPlus, Hotwire Fision) as they are. Have a native speaker from the community review it before launch.
5. Pages that exist on the old site but not in the menu still get a file, so their URLs keep working.
6. Old URLs that change go into `redirects` in `vercel.json`.

Then `npm run build` and check the warnings, the sitemap and the search.

## 5. Flag stale content for the manager

Do not delete anything. List it for the manager to decide:

- Comcast pages and posts (the agreement ended in 2023)
- the 2016 asphalt overlay notice and other past project notices
- events from past years
