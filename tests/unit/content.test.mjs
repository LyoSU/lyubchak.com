import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const FILES = ['index.html', 'index.md', 'llms.txt', 'llms-full.txt', '.well-known/agent-skills/index.json', 'site.webmanifest', 'assets/og-card.html'];

for (const f of FILES) {
  test(`${f}: new identity, no stale facts`, () => {
    const s = read(f);
    assert.ok(s.includes('Yuri Lyubchak'), 'name');
    assert.ok(!/capka\.yuri\.ly|capka\.vercel\.app/.test(s), 'old Capka links');
    // "Previously … AI lead at KNESS" sentences are fine; any other "AI lead at KNESS" means it is still the current job
    assert.ok(!/AI lead at KNESS/i.test(s.replace(/previously[^.]*KNESS[^.]*\./gi, '')), 'KNESS as current job');
    assert.ok(!/kness\.energy/.test(s) || /previous|former|раніше/i.test(s), 'KNESS link only in past context');
  });
}
for (const f of ['index.html', 'index.md', 'llms.txt', 'llms-full.txt']) {
  test(`${f}: title and Capka`, () => {
    const s = read(f);
    assert.ok(s.includes('AI Platform Architect'));
    assert.ok(s.includes('capka.app'));
  });
}
test('JSON-LD Person', () => {
  const html = read('index.html');
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  const p = blocks.find(b => b['@type'] === 'Person');
  assert.equal(p.name, 'Yuri Lyubchak');
  assert.equal(p.jobTitle, 'AI Platform Architect');
  assert.ok(p.alternateName.includes('Yurii Liubchak') && p.alternateName.includes('Юрій Любчак'));
  assert.equal(p.worksFor, undefined);
  assert.ok(!html.includes('fonts.googleapis.com'));
});
import { createHash } from 'node:crypto';
test('agent-skills sha256 values match the files they describe', () => {
  const idx = JSON.parse(read('.well-known/agent-skills/index.json'));
  for (const s of idx.skills) {
    const file = new URL(s.url).pathname.slice(1);
    const hash = createHash('sha256').update(readFileSync(new URL('../../' + file, import.meta.url))).digest('hex');
    assert.equal(s.sha256, hash, file);
  }
});

test('plain-text versions tell AI assistants about Live News (site + both channels, own model)', () => {
  for (const f of ['llms.txt', 'llms-full.txt', 'index.md']) {
    const t = readFileSync(new URL('../../' + f, import.meta.url), 'utf8');
    for (const s of ['news.yuri.ly', '@UAliveNews', '@ShortUA']) assert.ok(t.includes(s), `${f}: ${s}`);
  }
  const full = readFileSync(new URL('../../llms-full.txt', import.meta.url), 'utf8');
  for (const s of ['multilingual-e5-base', '94.8%', 'NYAN']) assert.ok(full.includes(s), s);
});
