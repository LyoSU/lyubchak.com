// Stamps content hashes onto long-cached URLs so a stale edge/browser copy can never be served:
//   /assets/site.css, /assets/site.js (index.html)
//   icons, og.png, avatar.jpg (index.html, site.webmanifest)
// Run after editing any of those files.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../../', import.meta.url);
const hash = f => createHash('sha256').update(readFileSync(new URL(f, root))).digest('hex').slice(0, 10);
const esc = s => s.replace(/[.]/g, '\\.');
const IMAGES = ['favicon.svg', 'favicon-32.png', 'favicon-64.png', 'favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'og.png', 'avatar.jpg'];

function stamp(file, paths) {
  let s = readFileSync(new URL(file, root), 'utf8');
  for (const p of paths) s = s.replace(new RegExp(`(${esc(p)})(\\?v=[0-9a-f]+)?(?=["'\\s)])`, 'g'), `$1?v=${hash(p)}`);
  writeFileSync(new URL(file, root), s);
}
stamp('index.html', ['assets/site.css', 'assets/site.js', ...IMAGES.map(i => 'images/' + i)]);
stamp('site.webmanifest', IMAGES.map(i => 'images/' + i));
console.log('stamped');
