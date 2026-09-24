import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const read = p => readFileSync(new URL('../../' + p, import.meta.url));
const short = p => createHash('sha256').update(read(p)).digest('hex').slice(0, 10);

for (const f of ['assets/site.css', 'assets/site.js']) {
  test(`index.html references ${f} with its current content hash`, () => {
    const html = read('index.html').toString();
    assert.ok(html.includes(`/${f}?v=${short(f)}`), `expected /${f}?v=${short(f)} — run: node tests/tools/stamp.mjs`);
  });
}
test('images are not cached as immutable (they get replaced in place)', () => {
  const h = read('_headers').toString();
  const block = h.slice(h.indexOf('/images/*'), h.indexOf('\n\n', h.indexOf('/images/*')));
  assert.ok(!/immutable/.test(block), block);
});

// Cloudflare's edge may still hold old copies of these paths (they used to be served "immutable" for 30 days),
// so every reference must carry the current content hash, which makes it a new URL.
const VERSIONED = ['favicon.svg', 'favicon-32.png', 'favicon-64.png', 'favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'og.png', 'avatar.jpg'];
for (const f of ['index.html', 'site.webmanifest']) {
  test(`${f}: icon/og/avatar references carry their content hash`, () => {
    const s = read(f).toString();
    const refs = [...s.matchAll(/images\/([\w.-]+\.(?:svg|png|ico|jpg))(\?v=([0-9a-f]+))?/g)].filter(m => VERSIONED.includes(m[1]));
    assert.ok(refs.length > 0);
    for (const m of refs) assert.equal(m[3], short('images/' + m[1]), `images/${m[1]} needs ?v=${short('images/' + m[1])}`);
  });
}
test('root /favicon.ico exists and is the new icon', () => {
  assert.deepEqual(read('favicon.ico'), read('images/favicon.ico'));
});
