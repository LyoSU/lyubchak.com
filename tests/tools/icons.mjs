// Renders the site icon (white "ly" on a violet gradient) to every size the site references.
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
const out = f => new URL('../../images/' + f, import.meta.url).pathname;
const svg = (radius = 15) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9b7bff"/><stop offset="1" stop-color="#5b3fd9"/></linearGradient></defs>
  <rect width="64" height="64" rx="${radius}" fill="url(#g)"/>
  <g fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 12v34"/><path d="M29 24l8 15"/><path d="M47 24l-11 26"/>
  </g>
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
const ico = Buffer.concat([header, ...frames]);
await writeFile(out('favicon.ico'), ico);
await writeFile(new URL('../../favicon.ico', import.meta.url).pathname, ico);   // browsers ask for /favicon.ico by default
console.log('icons written');
