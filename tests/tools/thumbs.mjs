// Product/bot icons are shown at 36–64 CSS px; the 640px originals cost ~200 KB on first load.
// Re-encodes them in place at 192px (3× the largest use). Run once after adding a new icon.
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../../images/', import.meta.url);
const FILES = ['KNESS.jpg', 'LyAdminBot.jpg', 'LySupportBot.jpg', 'LyBot.jpg', 'LyOSBot.jpg', 'QuotLyBot.jpg', 'fStikBot.jpg', 'hortay.jpg'];
for (const f of FILES) {
  const src = readFileSync(new URL(f, root)), { width } = await sharp(src).metadata();
  if (width <= 192) { console.log(f, 'already', width); continue; }
  const out = await sharp(src).resize(192, 192).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
  writeFileSync(new URL(f, root), out);
  console.log(f, src.length, '→', out.length);
}
