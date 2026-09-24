import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TYPES = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.mjs':'text/javascript',
  '.json':'application/json', '.md':'text/markdown; charset=utf-8', '.txt':'text/plain; charset=utf-8',
  '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.ico':'image/x-icon',
  '.webmanifest':'application/manifest+json' };

createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = normalize(join(ROOT, p));
  if (!file.startsWith(ROOT) || file.includes('/.superpowers/') || file.includes('/tests/')) { res.writeHead(404).end(); return; }
  try {
    if (!(await stat(file)).isFile()) throw 0;
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch { res.writeHead(404).end('not found'); }
}).listen(4173, () => console.log('serving on http://localhost:4173'));
