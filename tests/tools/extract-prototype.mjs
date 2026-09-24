import { readFile, writeFile } from 'node:fs/promises';
const P = new URL('../../.superpowers/brainstorm/90829-1790245265/content/prototype.html', import.meta.url);
const src = await readFile(P, 'utf8');
const css = src.slice(src.indexOf('<style>') + 7, src.indexOf('</style>'));
let body = src.slice(src.indexOf('<header class="hdr"'), src.indexOf('<script>'));
body = body
  .replaceAll('https://lyubchak.com/images/avatar.jpg', '/images/avatar-256.webp')
  .replaceAll('https://lyubchak.com/images/', '/images/')
  .replace(/<img data-q="1" src="data:[^"]+"/, '<img data-q="1" src="/images/quotes/en-1.webp" width="253" height="56"')
  .replace(/<img data-q="2" src="data:[^"]+"/, '<img data-q="2" src="/images/quotes/en-2.webp" width="253" height="50"');
await writeFile(new URL('../../assets/site.css', import.meta.url), css.trim() + '\n');
await writeFile(new URL('./.body.html', import.meta.url), body);
console.log('css', css.length, 'body', body.length);
