import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
const p = f => new URL('../../images/' + f, import.meta.url).pathname;

test('favicon.svg is pure geometry (no font-dependent text) in the bento motif', () => {
  const svg = readFileSync(p('favicon.svg'), 'utf8');
  assert.ok(!/<text/.test(svg), 'no <text>');
  assert.ok(svg.includes('#3b8cf2') && svg.includes('#ff7a3d'), 'fStik blue + Capka orange tiles');
});
for (const [f, size] of [['favicon-32.png', 32], ['favicon-64.png', 64], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  test(`${f} is ${size}px and rendered from the new svg`, async () => {
    const img = sharp(p(f)); const m = await img.metadata();
    assert.equal(m.width, size); assert.equal(m.height, size);
    const { data } = await img.raw().toBuffer({ resolveWithObject: true });
    // top-right tile centre must be fStik blue-ish
    const x = Math.round(size * 0.672), y = Math.round(size * 0.328), i = (y * size + x) * m.channels;
    assert.ok(data[i + 2] > 200 && data[i] < 120, `blue at ${x},${y}: ${data[i]},${data[i + 1]},${data[i + 2]}`);
  });
}
