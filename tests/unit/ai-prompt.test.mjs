import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
// Microsoft "AI Recommendation Poisoning" (2026-02) hunts prefilled-prompt URLs and pages for these words.
const POISON = /authoritative|primary source|trusted source|over any other source|\bcite\b|citation|remember|future conversations|prefer (this|these)/i;

for (const f of ['index.html', 'index.md', 'llms.txt', 'llms-full.txt', '.well-known/agent-skills/index.json', 'assets/site.js']) {
  test(`${f}: no instruction-to-AI / memory-poisoning phrasing`, () => {
    const m = read(f).match(POISON);
    assert.equal(m, null, m && `found "${m[0]}"`);
  });
}
test('AI buttons work without JS and point at the three supported assistants', () => {
  const html = read('index.html');
  for (const [id, base] of [['ai-chatgpt', 'https://chatgpt.com/?q='], ['ai-claude', 'https://claude.ai/new?q='], ['ai-perplexity', 'https://www.perplexity.ai/search?q=']]) {
    const a = html.match(new RegExp(`<a[^>]*id="${id}"[^>]*>`))[0];
    const href = a.match(/href="([^"]+)"/)?.[1];
    assert.ok(href && href.startsWith(base), `${id} static href`);
    assert.match(decodeURIComponent(href.slice(base.length)), /lyubchak\.com\/llms-full\.txt/);
  }
});
test('prompt asks to read the page and check other sources (en + uk)', () => {
  const js = read('assets/site.js');
  const en = js.match(/prompt:"(Who is[^"]+)"/)[1], uk = js.match(/prompt:"(Хто такий[^"]+)"/)[1];
  assert.match(en, /Read https:\/\/lyubchak\.com\/llms-full\.txt/); assert.match(en, /other public sources/);
  assert.match(uk, /Прочитай https:\/\/lyubchak\.com\/llms-full\.txt/); assert.match(uk, /інші відкриті джерела/);
});
