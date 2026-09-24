/**
 * GET /api/stickers — a few hand-curated ("verified") fStik stickers for the homepage.
 * Edge-cached for a day; on any upstream problem returns an empty list so the page keeps
 * its static fallback stickers.
 */
const API = 'https://api.fstik.app/searchStickerSet?type=verified&safe=true&public=true&limit=12';
const FILE = id => `https://api.fstik.app/file/${encodeURIComponent(id)}/sticker.webp`;

const json = (body, maxAge) => new Response(JSON.stringify(body), {
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${maxAge}` },
});

async function load() {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3000);
  try {
    const res = await fetch(API, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.result?.stickerSets ?? [])
      .map(s => s?.stickers?.[0]?.thumb?.file_id || s?.stickers?.[0]?.file_id)
      .filter(id => typeof id === 'string' && /^[\w-]+$/.test(id))   // never cache "undefined" or odd ids
      .map(FILE)
      .slice(0, 8);
  } catch { return []; } finally { clearTimeout(timer); }
}

export async function onRequestGet({ request }) {
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const key = new Request(new URL('/api/stickers', request.url).toString());
  if (cache) { const hit = await cache.match(key); if (hit) return hit; }
  const stickers = await load();
  const good = stickers.length >= 3;          // a thin list is served but not pinned for a day
  const res = json({ stickers }, good ? 86400 : 300);
  if (cache && good) await cache.put(key, res.clone());
  return res;
}
