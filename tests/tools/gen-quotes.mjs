import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
const TEXTS = {
  'en-1': 'Reply with /q to any message',
  'en-2': 'It becomes a sticker. Like this one.',
  'uk-1': 'Відповідай /q на будь-яке повідомлення',
  'uk-2': 'Воно стане стікером. Як цей.',
};
const dir = new URL('../../images/quotes/', import.meta.url).pathname;
await mkdir(dir, { recursive: true });
for (const [name, text] of Object.entries(TEXTS)) {
  const res = await fetch('https://quote.yuri.ly/generate.webp', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'quote', format: 'webp', backgroundColor: '#1b1429', width: 512, height: 768, scale: 2,
      messages: [{ from: { id: 66478514, name: 'Yuri Lyubchak' }, text, avatar: true }] }),
  });
  if (!res.ok || !res.headers.get('content-type')?.includes('image/webp')) throw new Error(`${name}: ${res.status}`);
  const trimmed = await sharp(Buffer.from(await res.arrayBuffer())).trim().webp({ quality: 90 }).toBuffer();
  await writeFile(dir + name + '.webp', trimmed);
  console.log(name, trimmed.length, 'bytes');
}
