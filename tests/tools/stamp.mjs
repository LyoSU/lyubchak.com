// Stamps content hashes onto /assets/site.css and /assets/site.js in index.html so the
// immutable 30-day cache in _headers can never serve a stale file. Run after editing either.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../../', import.meta.url);
const hash = f => createHash('sha256').update(readFileSync(new URL(f, root))).digest('hex').slice(0, 10);
let html = readFileSync(new URL('index.html', root), 'utf8');
for (const f of ['assets/site.css', 'assets/site.js'])
  html = html.replace(new RegExp(`/${f.replace('.', '\\.')}(\\?v=[0-9a-f]+)?"`), `/${f}?v=${hash(f)}"`);
writeFileSync(new URL('index.html', root), html);
console.log('stamped');
