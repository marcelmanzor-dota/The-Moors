#!/usr/bin/env node
// Builds public/brand/og.png (the preview image for links shared on social media and in texts).
import sharp from 'sharp';
const W = 1200, H = 630;
const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a31f37"/><stop offset="1" stop-color="#6a1224"/></linearGradient>
    <pattern id="d" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="2" fill="#e9b44c" fill-opacity=".12"/></pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="100%" fill="url(#d)"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="#e9b44c" stroke-width="2"/>
</svg>`);
const logo = await sharp('public/brand/logo-gilded.png').resize({ width: 760 }).toBuffer();
const { height } = await sharp(logo).metadata();
await sharp(bg).composite([{ input: logo, left: Math.round((W - 760) / 2), top: Math.round((H - height) / 2) }]).png().toFile('public/brand/og.png');
console.log('public/brand/og.png');
