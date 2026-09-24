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

test('skips packs without stickers and rejects ids with path characters', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ ok: true, result: { stickerSets: [
    { name: 'empty', stickers: [] }, { name: 'a', stickers: [{ file_id: 'x/y' }] }, { name: 'b', stickers: [{ file_id: 'AAMC_b-1' }] } ] } }));
  const { stickers } = await (await onRequestGet({ request: new Request('https://x/api/stickers') })).json();
  assert.deepEqual(stickers, ['https://api.fstik.app/file/AAMC_b-1/sticker.webp']);
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

test('#3 packs without a usable id are dropped; fewer than 3 is not cached', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ ok: true, result: { stickerSets: [
    { stickers: [{}] }, { stickers: [{ thumb: {} }] }, { stickers: [{ file_id: 'ok_1' }] }, { stickers: [{ file_id: 'bad id/../x' }] } ] } }));
  const res = await onRequestGet({ request: new Request('https://x/api/stickers') });
  const { stickers } = await res.json();
  assert.ok(!stickers.some(u => u.includes('undefined')), 'no undefined ids');
  assert.deepEqual(stickers, ['https://api.fstik.app/file/ok_1/sticker.webp']);
  assert.equal(res.headers.get('Cache-Control'), 'public, max-age=300');
});
