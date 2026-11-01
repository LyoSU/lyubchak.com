import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from '../tools/uk.mjs';
const read = p => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');

test('uk/index.html is up to date with index.html (run tests/tools/stamp.mjs)', () => {
  assert.equal(read('uk/index.html'), build());
});
test('each language has its own URL, linked both ways', () => {
  const en = read('index.html'), uk = read('uk/index.html');
  for (const s of [en, uk]) {
    assert.ok(s.includes('<link rel="alternate" hreflang="en" href="https://lyubchak.com/">'));
    assert.ok(s.includes('<link rel="alternate" hreflang="uk" href="https://lyubchak.com/uk/">'));
    assert.ok(s.includes('<link rel="alternate" hreflang="x-default" href="https://lyubchak.com/">'));
  }
  assert.ok(uk.includes('<html lang="uk">') && uk.includes('<link rel="canonical" href="https://lyubchak.com/uk/">'));
  assert.ok(uk.includes('<title>Юрій Любчак') && uk.includes('<h1 class="display" data-i="nm">Юрій Любчак</h1>'));
  assert.ok(!uk.includes('data-root-only'), 'no language redirect on /uk/');
  assert.ok(!/(?:href|src|content)="images\//.test(en), 'asset paths are absolute so /uk/ can share them');
});
