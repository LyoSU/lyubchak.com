// Renders the site icon (bento motif) to every size the site references.
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
const out = f => new URL('../../images/' + f, import.meta.url).pathname;
const svg = (radius = 15) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="${radius}" fill="#111113"/>
  <rect x="12" y="12" width="18" height="40" rx="5" fill="#f5f5f7"/>
  <rect x="34" y="12" width="18" height="18" rx="5" fill="#3b8cf2"/>
  <rect x="34" y="34" width="18" height="18" rx="5" fill="#ff7a3d"/>
</svg>
`;
await writeFile(out('favicon.svg'), svg());
const render = (size, radius) => sharp(Buffer.from(svg(radius)), { density: 72 * size / 64 * 4 }).resize(size, size).png();
for (const [f, size] of [['favicon-32.png', 32], ['favicon-64.png', 64], ['icon-192.png', 192], ['icon-512.png', 512]])
  await render(size, 15).toFile(out(f));
await render(180, 0).toFile(out('apple-touch-icon.png'));   // iOS applies its own mask
// favicon.ico: PNG-in-ICO container with 16/32/48 frames
const frames = await Promise.all([16, 32, 48].map(s => render(s, 15).toBuffer()));
const header = Buffer.alloc(6 + 16 * frames.length);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(frames.length, 4);
let offset = header.length;
frames.forEach((buf, i) => { const s = [16, 32, 48][i], e = 6 + 16 * i;
  header.writeUInt8(s, e); header.writeUInt8(s, e + 1); header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(buf.length, e + 8); header.writeUInt32LE(offset, e + 12); offset += buf.length; });
await writeFile(out('favicon.ico'), Buffer.concat([header, ...frames]));
console.log('icons written');
