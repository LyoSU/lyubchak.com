// Builds /uk/index.html from index.html: the same page with its Ukrainian copy baked in, so each language
// has its own URL (Google indexes one language per URL; the in-page switch alone left /uk content unseen).
// stamp.mjs runs this after stamping; tests/unit/uk.test.mjs fails if uk/index.html is out of date.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');
const QUOTES = [['/images/quotes/uk-1.webp', 253, 39], ['/images/quotes/uk-2.webp', 253, 52]];
const HEAD = [
  ['<html lang="en">', '<html lang="uk">'],
  ['<title>Yuri Lyubchak — AI Platform Architect</title>', '<title>Юрій Любчак — AI Platform Architect</title>'],
  [/<meta name="description" content="[^"]*">/, '<meta name="description" content="Юрій Любчак (Yuri Lyubchak) — AI Platform Architect. Будує AI-системи для продакшну й розвиває Telegram-продукти, якими користуються мільйони: fStik (800K користувачів на місяць), QuotLy (80K груп), Capka (agent harness з відкритим кодом).">'],
  ['<link rel="canonical" href="https://lyubchak.com/">', '<link rel="canonical" href="https://lyubchak.com/uk/">'],
  ['<meta property="og:title" content="Yuri Lyubchak — AI Platform Architect">', '<meta property="og:title" content="Юрій Любчак — AI Platform Architect">'],
  ['<meta name="twitter:title" content="Yuri Lyubchak — AI Platform Architect">', '<meta name="twitter:title" content="Юрій Любчак — AI Platform Architect">'],
  [/(<meta (?:property="og|name="twitter):description" content=")[^"]*"/g, '$1AI Platform Architect. Будую AI-системи для продакшну і розвиваю Telegram-продукти, якими користуються мільйони людей."'],
  [/(<meta (?:property="og|name="twitter):image:alt" content=")[^"]*"/g, '$1Юрій Любчак — AI Platform Architect."'],
  ['<meta property="og:url" content="https://lyubchak.com/">', '<meta property="og:url" content="https://lyubchak.com/uk/">'],
  ['<meta property="og:locale" content="en_US">\n    <meta property="og:locale:alternate" content="uk_UA">', '<meta property="og:locale" content="uk_UA">\n    <meta property="og:locale:alternate" content="en_US">'],
  [/\s*<script data-root-only>.*?<\/script>/, ''],
  ['"@id": "https://lyubchak.com/#webpage"', '"@id": "https://lyubchak.com/uk/#webpage"'],
  ['"url": "https://lyubchak.com/",\n        "name": "Yuri Lyubchak — AI Platform Architect",\n        "description": "Official personal site of Yuri Lyubchak, AI Platform Architect, creator of fStik, QuotLy and Capka.",\n        "inLanguage": "en",',
   '"url": "https://lyubchak.com/uk/",\n        "name": "Юрій Любчак — AI Platform Architect",\n        "description": "Особистий сайт Юрія Любчака, AI Platform Architect, автора fStik, QuotLy і Capka.",\n        "inLanguage": "uk",'],
  [/\s*<script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema.org",\s*"@type": "FAQPage"[\s\S]*?<\/script>/, ''],   // English Q&A; the Ukrainian page keeps Person and ProfilePage
  ['aria-label="Language"', 'aria-label="Мова"'],
  ['aria-label="Toggle theme"', 'aria-label="Змінити тему"'],
  ['<button aria-pressed="true" data-lang="en">EN</button><button aria-pressed="false" data-lang="uk">', '<button aria-pressed="false" data-lang="en">EN</button><button aria-pressed="true" data-lang="uk">'],
  ['<a id="alt-lang" href="/uk/" hreflang="uk" lang="uk">Українською</a>', '<a id="alt-lang" href="/" hreflang="en" lang="en">In English</a>'],
];

// replaces the inner HTML of every element carrying data-i="key", honouring nested tags of the same name
function fillI18n(html, dict) {
  let out = '', i = 0;
  const open = /<(\w+)\b[^>]*\sdata-i="(\w+)"[^>]*>/g;
  for (let m; (m = open.exec(html));) {
    const [tag, name, key] = m, start = m.index + tag.length;
    if (dict[key] == null) continue;
    const re = new RegExp(`<(/?)${name}\\b[^>]*>`, 'g'); re.lastIndex = start;
    let depth = 1, end;
    for (let t; (t = re.exec(html));) { depth += t[1] ? -1 : 1; if (!depth) { end = t.index; break; } }
    out += html.slice(i, start) + dict[key]; i = end; open.lastIndex = end;
  }
  return out + html.slice(i);
}

export function build(html = read('index.html'), js = read('assets/site.js')) {
  const T = new Function(`return ${js.match(/const T = (\{[\s\S]*?\n\});/)[1]}`)(), uk = T.uk;
  for (const [a, b] of HEAD) {
    const before = html; html = html.replace(a, b);
    if (html === before) throw new Error(`uk.mjs: pattern not found: ${String(a).slice(0, 80)}`);
  }
  html = fillI18n(html, uk);
  html = html.replace(/<img data-q="(\d)" src="[^"]*" width="\d+" height="\d+"/g, (_, n) => { const [src, w, h] = QUOTES[n - 1]; return `<img data-q="${n}" src="${src}" width="${w}" height="${h}"`; });
  const U = 'https://lyubchak.com/llms-full.txt', [a, b] = uk.prompt.split(U), q = encodeURIComponent(uk.prompt);
  html = html.replace(/(<span class="prompt" id="prompt">)[\s\S]*?(<\/span><span class="hint")/, `$1“${a}<span class="url">${U}</span>${b}”$2`)
    .replace(/(id="ai-chatgpt" href="https:\/\/chatgpt\.com\/\?q=)[^"]*/, `$1${q}`)
    .replace(/(id="ai-claude" href="https:\/\/claude\.ai\/new\?q=)[^"]*/, `$1${q}`)
    .replace(/(id="ai-perplexity" href="https:\/\/www\.perplexity\.ai\/search\?q=)[^"]*/, `$1${q}`)
    .replace(/(<span class="hint"[^>]*>)[^<]*/, `$1${uk.ai_copy}`);
  return html;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mkdirSync(new URL('uk/', root), { recursive: true });
  writeFileSync(new URL('uk/index.html', root), build());
  console.log('uk/index.html built');
}
