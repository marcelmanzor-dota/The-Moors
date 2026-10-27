#!/usr/bin/env node
/*
 * Adds the gold outline to The Moors logo without changing the artwork.
 *
 *   npm run gild-logo -- [source] [--gold 5] [--bronze 8] [--width 1200]
 *
 * source   SVG or PNG with a transparent background (default public/brand/logo-source.svg,
 *          or logo-source.png if that exists). White artwork, as on the current site.
 * --gold   Gold line thickness in pixels at --width. --bronze is the darker edge under it.
 *
 * Writes public/brand/logo-gilded.png, logo-gilded.webp and logo-gilded@1x.webp.
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args[i + 1]) : def;
};
const brand = path.resolve('public/brand');
const defaultSrc = ['logo-source.png', 'logo-source.svg'].map((f) => path.join(brand, f)).find((f) => fs.existsSync(f));
const src = args.find((a, i) => !a.startsWith('--') && !(args[i - 1] ?? '').startsWith('--')) ?? defaultSrc;
const W = flag('width', 1200);
const GOLD = flag('gold', 5);
const BRONZE = flag('bronze', 8);

if (!src || !fs.existsSync(src)) {
  console.error('No logo source found. Put the logo at public/brand/logo-source.svg or .png.');
  process.exit(1);
}

const base = sharp(src, { density: 600 }).resize({ width: W }).ensureAlpha();
const { data: rgba, info } = await base.clone().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

// Alpha channel of the artwork.
const alpha = new Uint8Array(width * height);
for (let i = 0; i < width * height; i++) alpha[i] = rgba[i * 4 + 3];

/** Grow a mask outward by r pixels with a round brush (max filter over a disk). */
function dilate(mask, r) {
  // Two passes of a separable square max would give square corners; a disk keeps the line even.
  const offsets = [];
  const rr = Math.ceil(r);
  for (let dy = -rr; dy <= rr; dy++) {
    // Row half-width of the disk at this dy.
    const dx = Math.floor(Math.sqrt(r * r - dy * dy));
    if (!Number.isNaN(dx)) offsets.push([dy, dx]);
  }
  // Horizontal max over each row span, computed per dy with a sliding window.
  const out = new Uint8Array(mask.length);
  for (const [dy, dx] of offsets) {
    for (let y = 0; y < height; y++) {
      const sy = y + dy;
      if (sy < 0 || sy >= height) continue;
      const row = sy * width;
      const orow = y * width;
      for (let x = 0; x < width; x++) {
        let m = 0;
        const x0 = Math.max(0, x - dx);
        const x1 = Math.min(width - 1, x + dx);
        for (let k = x0; k <= x1; k++) if (mask[row + k] > m) { m = mask[row + k]; if (m === 255) break; }
        if (m > out[orow + x]) out[orow + x] = m;
      }
    }
  }
  return out;
}

const goldMask = dilate(alpha, GOLD);
const bronzeMask = dilate(alpha, BRONZE);

const rawOpts = { raw: { width, height, channels: 1 } };
// Soften the edges a touch so the line reads as smooth metal, not a stamp.
const soft = async (m) => sharp(Buffer.from(m), rawOpts).blur(0.8).extractChannel(0).raw().toBuffer();

const goldGradient = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0.35" y2="1">
    <stop offset="0" stop-color="#FCE6A8"/><stop offset="0.38" stop-color="#E9B44C"/>
    <stop offset="0.55" stop-color="#B5822A"/><stop offset="0.75" stop-color="#F2CB6E"/>
    <stop offset="1" stop-color="#C9963A"/></linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/></svg>`);

// sharp applies removeAlpha at the end of a pipeline, so flatten the gradient to raw RGB first.
const goldRGB = await sharp(goldGradient).removeAlpha().raw().toBuffer();
const goldLayer = await sharp(goldRGB, { raw: { width, height, channels: 3 } })
  .joinChannel(await soft(goldMask), rawOpts).png().toBuffer();
const bronzeLayer = await sharp({ create: { width, height, channels: 3, background: '#6E4A12' } })
  .joinChannel(await soft(bronzeMask), rawOpts).png().toBuffer();
const art = await base.clone().png().toBuffer();

const gilded = sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: bronzeLayer }, { input: goldLayer }, { input: art }]);

const png = await gilded.png({ compressionLevel: 9 }).toBuffer();
await sharp(png).trim({ threshold: 0 }).toFile(path.join(brand, 'logo-gilded.png'));
await sharp(png).trim({ threshold: 0 }).webp({ quality: 90 }).toFile(path.join(brand, 'logo-gilded.webp'));
await sharp(png).trim({ threshold: 0 }).resize({ width: Math.round(W / 2) }).webp({ quality: 90 }).toFile(path.join(brand, 'logo-gilded@1x.webp'));
const meta = await sharp(path.join(brand, 'logo-gilded.png')).metadata();
console.log(`Gilded ${path.basename(src)} -> logo-gilded.{png,webp} (${meta.width}x${meta.height})`);
