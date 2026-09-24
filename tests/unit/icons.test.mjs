import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
const p = f => new URL('../../images/' + f, import.meta.url).pathname;

test('favicon.svg is pure geometry (no font-dependent text): white "ly" on a violet gradient', () => {
  const svg = readFileSync(p('favicon.svg'), 'utf8');
  assert.ok(!/<text/.test(svg), 'no <text>');
  assert.ok(svg.includes('#9b7bff') && svg.includes('#5b3fd9'), 'violet gradient');
  assert.ok(!svg.includes('#3b8cf2'), 'old bento icon gone');
});
for (const [f, size] of [['favicon-32.png', 32], ['favicon-64.png', 64], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  test(`${f} is ${size}px and rendered from the new svg`, async () => {
    const img = sharp(p(f)); const m = await img.metadata();
    assert.equal(m.width, size); assert.equal(m.height, size);
    const { data } = await img.raw().toBuffer({ resolveWithObject: true });
    const px = (fx, fy) => { const x = Math.round(size * fx), y = Math.round(size * fy), i = (y * size + x) * m.channels; return [data[i], data[i + 1], data[i + 2]]; };
    const [r, g, b] = px(0.84, 0.2);                 // background near the top-right: violet
    assert.ok(b > 200 && r > 100 && r < 190 && g < 150, `violet bg: ${r},${g},${b}`);
    const l = px(19 / 64, 30 / 64);                  // stem of the "l": white
    assert.ok(l.every(c => c > 235), `white l: ${l}`);
  });
}
