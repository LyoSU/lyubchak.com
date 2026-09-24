import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet } from '../../functions/api/stickers.js';
const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

const pack = id => ({ name: id, stickers: [{ file_id: 'F' + id, thumb: { file_id: 'T' + id } }] });

test('returns 8 thumb URLs from verified packs with a day of cache', async () => {
  let called;
  globalThis.fetch = async url => { called = String(url);
    return new Response(JSON.stringify({ ok: true, result: { stickerSets: Array.from({ length: 12 }, (_, i) => pack(i)) } })); };
  const res = await onRequestGet({ request: new Request('https://x/api/stickers') });
  assert.match(called, /searchStickerSet\?type=verified&safe=true&public=true&limit=12/);
  assert.equal(res.headers.get('Cache-Control'), 'public, max-age=86400');
  const { stickers } = await res.json();
  assert.equal(stickers.length, 8);
  assert.equal(stickers[0], 'https://api.fstik.app/file/T0/sticker.webp');
});

test('skips packs without stickers and URL-encodes ids', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ ok: true, result: { stickerSets: [
    { name: 'empty', stickers: [] }, { name: 'a', stickers: [{ file_id: 'x/y' }] } ] } }));
  const { stickers } = await (await onRequestGet({ request: new Request('https://x/api/stickers') })).json();
  assert.deepEqual(stickers, ['https://api.fstik.app/file/x%2Fy/sticker.webp']);
});

test('upstream failure → empty list, short cache, still 200', async () => {
  globalThis.fetch = async () => { throw new Error('down'); };
  const res = await onRequestGet({ request: new Request('https://x/api/stickers') });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Cache-Control'), 'public, max-age=300');
  assert.deepEqual(await res.json(), { stickers: [] });
});

test('slow upstream is aborted', async () => {
  globalThis.fetch = (url, { signal }) => new Promise((_, rej) => signal.addEventListener('abort', () => rej(new Error('aborted'))));
  const t = Date.now();
  const res = await onRequestGet({ request: new Request('https://x/api/stickers') });
  assert.ok(Date.now() - t < 5000);
  assert.deepEqual(await res.json(), { stickers: [] });
});
