#!/usr/bin/env node
/*
 * Turns one source photo into the web sizes the site uses.
 *
 *   node scripts/process-images.mjs <source> <output-base> [widths...]
 *   node scripts/process-images.mjs ~/photos/gate.jpg public/images/sections/about 960 1600
 *
 * Writes <output-base>-<width>.webp for each width (default 960 and 1600).
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const [src, out, ...w] = process.argv.slice(2);
if (!src || !out) {
  console.error('Usage: node scripts/process-images.mjs <source> <output-base> [widths...]');
  process.exit(1);
}
const widths = (w.length ? w : ['960', '1600']).map(Number);
fs.mkdirSync(path.dirname(out), { recursive: true });
for (const width of widths) {
  const file = `${out}-${width}.webp`;
  await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality: width > 1600 ? 72 : 78, effort: 6 }).toFile(file);
  console.log(file, Math.round(fs.statSync(file).size / 1024) + ' KB');
}
