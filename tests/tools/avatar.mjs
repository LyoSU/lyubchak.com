// usage: node tests/tools/avatar.mjs <source-photo>
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
const src = process.argv[2];
if (!src) { console.error('usage: avatar.mjs <photo>'); process.exit(1); }
const out = p => new URL('../../images/' + p, import.meta.url).pathname;
// read into memory first so the source may be images/avatar.jpg itself
const base = sharp(await readFile(src)).rotate().resize(640, 640, { fit: 'cover', position: 'attention' });
await base.clone().jpeg({ quality: 86, mozjpeg: true }).toFile(out('avatar.jpg'));
await base.clone().resize(256, 256).webp({ quality: 82 }).toFile(out('avatar-256.webp'));
console.log('avatar written');
