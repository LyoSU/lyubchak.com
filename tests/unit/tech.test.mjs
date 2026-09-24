import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
const root = p => new URL('../../' + p, import.meta.url);
const html = readFileSync(root('index.html'), 'utf8');
const used = [...html.matchAll(/--m:url\(\/images\/tech\/([a-z0-9]+)\.svg\)/g)].map(m => m[1]);

test('stack card uses 24 local tech icons including Azure, Vertex AI and Claude', () => {
  assert.equal(used.length, 24);
  assert.equal(new Set(used).size, 24);
  for (const n of ['azure', 'vertexai', 'claude', 'typescript', 'python', 'docker']) assert.ok(used.includes(n), n);
});
for (const n of used) test(`images/tech/${n}.svg is a small, script-free svg`, () => {
  const f = root(`images/tech/${n}.svg`);
  assert.ok(existsSync(f));
  const s = readFileSync(f, 'utf8');
  assert.match(s, /^<svg[^>]*viewBox="0 0 24 24"/);
  assert.ok(!/<script|on\w+=/i.test(s));
  assert.ok(statSync(f).size < 8192);
});
test('icon names are available to screen readers and crawlers', () => {
  const sr = html.match(/<p class="sr"[^>]*>([^<]+)<\/p>/)?.[1] || '';
  for (const n of ['TypeScript', 'Python', 'Azure', 'Vertex AI', 'Claude', 'Docker']) assert.ok(sr.includes(n), n);
});
