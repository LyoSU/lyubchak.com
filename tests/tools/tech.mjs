// Writes the stack card's icon field into index.html between <!-- tech:start --> and <!-- tech:end -->.
// Chaos = a jittered 6×4 scatter (seeded, so it never changes between deploys); hover tidies it into an 8×3 grid.
import { readFile, writeFile } from 'node:fs/promises';
const ICONS = [['typescript', 'TypeScript'], ['python', 'Python'], ['claude', 'Claude'], ['docker', 'Docker'], ['react', 'React'], ['azure', 'Azure'],
  ['nodedotjs', 'Node.js'], ['postgresql', 'PostgreSQL'], ['vertexai', 'Vertex AI'], ['telegram', 'Telegram'], ['go', 'Go'], ['openai', 'OpenAI'],
  ['redis', 'Redis'], ['kotlin', 'Kotlin'], ['nextdotjs', 'Next.js'], ['googlegemini', 'Gemini'], ['mongodb', 'MongoDB'], ['linux', 'Linux'],
  ['nestjs', 'NestJS'], ['cloudflare', 'Cloudflare'], ['tailwindcss', 'Tailwind CSS'], ['githubactions', 'GitHub Actions'], ['android', 'Android'], ['sentry', 'Sentry']];
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const cells = ICONS.map((_, i) => i).sort(() => rnd() - .5);          // chaos cell ≠ grid cell, so every icon travels
const f = n => +n.toFixed(1);
const items = ICONS.map(([file], i) => {
  const c = cells[i], cx = c % 6, cy = Math.floor(c / 6);
  const x = 9 + (cx + .5) / 6 * 82 + (rnd() - .5) * 9, y = 17 + (cy + .5) / 4 * 66 + (rnd() - .5) * 10;
  const gx = (i % 8 + .5) / 8 * 100, gy = (Math.floor(i / 8) + .5) / 3 * 100;
  const r = Math.round((rnd() - .5) * 70), s = f(.8 + rnd() * .5), o = f(.35 + rnd() * .5);
  return `<i style="--m:url(/images/tech/${file}.svg);--x:${f(x)};--y:${f(y)};--gx:${f(gx)};--gy:${f(gy)};--r:${r}deg;--s:${s};--o:${o};--d:${i * 12}ms"></i>`;
});
const block = `<!-- tech:start -->
    <div class="chaos" aria-hidden="true">${items.join('')}</div>
    <p class="sr">${ICONS.map(i => i[1]).join(', ')}</p>
    <!-- tech:end -->`;
const path = new URL('../../index.html', import.meta.url);
const html = await readFile(path, 'utf8');
if (!html.includes('<!-- tech:start -->')) throw new Error('markers missing');
await writeFile(path, html.replace(/<!-- tech:start -->[\s\S]*?<!-- tech:end -->/, block));
console.log('stack icons written');
