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
