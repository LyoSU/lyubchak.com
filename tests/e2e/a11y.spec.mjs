import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const scheme of ['light', 'dark']) for (const lang of ['en', 'uk']) {
  test(`axe: no violations (${scheme}, ${lang})`, async ({ page }) => {
    await page.route('**/api/stickers', r => r.fulfill({ json: { stickers: [] } }));
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    await page.addInitScript(l => { try { localStorage.setItem('lang', l); } catch {} }, lang);
    await page.goto('/');
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(r.violations.map(v => `${v.id}: ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`)).toEqual([]);
  });
}

test('hidden glass header is not keyboard-reachable', async ({ page }) => {
  await page.route('**/api/stickers', r => r.fulfill({ json: { stickers: [] } }));
  await page.goto('/');
  expect(await page.$eval('#hdr', h => h.inert)).toBe(true);
  await page.mouse.wheel(0, 900);
  await expect(page.locator('#hdr')).toHaveClass(/show/);
  expect(await page.$eval('#hdr', h => h.inert)).toBe(false);
});
