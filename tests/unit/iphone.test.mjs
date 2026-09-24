import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const css = readFileSync(new URL('../../assets/site.css', import.meta.url), 'utf8');

test('phone sheet height uses the small viewport (svh), not vh which iOS Safari measures with the toolbars hidden', () => {
  const phone = css.match(/@media \(max-width:640px\)\{\s*\.sheet\{[^}]*\}/)[0];
  assert.match(phone, /max-height:[^;}]*svh/);
});

test('close button hides its focus ring only for a pointer-opened sheet', () => {
  assert.match(css, /\.sheet\[data-input="pointer"\] \.x:focus\{outline:none\}/);
});
