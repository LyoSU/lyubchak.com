import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const img = p => new URL('../../images/' + p, import.meta.url).pathname;

test('avatar is at least 512px square', async () => {
  const m = await sharp(img('avatar.jpg')).metadata();
  assert.ok(m.width >= 512 && m.width === m.height, `${m.width}x${m.height}`);
});
test('card avatar webp is 256px', async () => {
  const m = await sharp(img('avatar-256.webp')).metadata();
  assert.equal(m.width, 256); assert.equal(m.format, 'webp');
});
for (const q of ['en-1', 'en-2', 'uk-1', 'uk-2']) {
  test(`quote ${q} is a trimmed webp`, async () => {
    const m = await sharp(img(`quotes/${q}.webp`)).metadata();
    assert.equal(m.format, 'webp'); assert.ok(m.width > 300 && m.height < 200, `${m.width}x${m.height}`);
  });
}
