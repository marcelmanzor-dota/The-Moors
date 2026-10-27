# Higgsfield plan

Budget agreed with the client: **up to 200 credits** (balance on Oct 27, 2026: 773).
Nothing has been generated yet, because every item below starts from The Moors' own photos, which come in with the content import.

| # | What | Where it goes | Model and settings | Credits each | Count | Total |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Upscale the best 6–8 original photos to 2K | Hero, Club Center frame, news cards | `upscale_image`, 2k | check with `get_cost` (typically a few) | 8 | ~16–40 |
| 2 | Hero cinemagraph: a slow, subtle loop made from the best Club Center / grounds photo (palms moving, light on the pool water, a slight push-in) | Home page hero, desktop only | `kling3_0`, mode `pro`, 5 s, sound off, 16:9, start image = upscaled photo | 8.75 | 3 takes | ~27 |
| 3 | A second loop as a backup option for the board to choose from | Same | same | 8.75 | 2 | ~18 |
| 4 | Optional: extend the chosen loop to 8–10 s so the loop point is less noticeable | Same | `seedance_2_5` video extension, 720p | check with `get_cost` | 1 | ~30–50 |

**Expected total: 60–100 credits, well under 200.**

## Rules for the generations

- Always start from a real Moors photo, never a made-up scene. The board must recognise its own community.
- Keep motion subtle: no camera cuts, no people appearing, no changes to buildings.
- Silent, 16:9, then encode to H.264 MP4 under 4 MB and WebM. Store it in `public/media/` (or upload it in Sanity Site settings → Home page video).
- The site only plays the loop on desktop with motion allowed. Phones, data-saver and reduced-motion users see the still photo (`src/scripts/site.ts`).

## Prompt for #2

> Subtle cinemagraph of this exact photo. Keep every building, tree and object in place. Only gentle natural motion: palm fronds swaying slightly in a light breeze, soft ripples and light glints on the pool water, a few slow-moving clouds. Very slow camera push-in. Warm late-afternoon Florida light. No people, no text, no new objects. Seamless and calm.
