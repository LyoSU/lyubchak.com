import { test, expect } from '@playwright/test';
const rot = t => { if (t === 'none') return 0; const [a, b] = t.match(/matrix\(([^)]+)\)/)[1].split(',').map(Number); return Math.round(Math.atan2(b, a) * 180 / Math.PI); };

for (const w of [1280, 800, 375]) {
  test(`stack card: chaos of icons stays inside the card, text fits @${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/');
    const card = page.locator('.card.stack');
    await expect(card.locator('.chaos i')).toHaveCount(24);
    const m = await card.evaluate(c => {
      const r = c.getBoundingClientRect(), t = c.querySelector('.txt');
      const out = [...c.querySelectorAll('.chaos i')].filter(i => { const b = i.getBoundingClientRect(); return b.left < r.left - 1 || b.right > r.right + 1 || b.top < r.top - 1 || b.bottom > r.bottom + 1; }).length;
      const tr = t.getBoundingClientRect();
      return { out, fits: c.scrollHeight <= c.clientHeight + 1, overlap: [...c.querySelectorAll('.chaos i')].filter(i => { const b = i.getBoundingClientRect(); return b.left < tr.right && b.right > tr.left && b.top < tr.bottom && b.bottom > tr.top; }).length };
    });
    expect(m.out).toBe(0);
    expect(m.fits).toBe(true);
    expect(m.overlap).toBe(0);           // icons never sit on top of the text
  });
}

test('stack card: chaos is varied, hover tidies it into a grid', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const icons = page.locator('.card.stack .chaos i');
  const before = await icons.evaluateAll(els => els.map(e => getComputedStyle(e).transform));
  expect(new Set(before.map(rot)).size).toBeGreaterThanOrEqual(10);
  await page.locator('.card.stack').hover();
  await expect.poll(async () => (await icons.evaluateAll(els => els.map(e => getComputedStyle(e).transform))).map(rot).every(r => r === 0), { timeout: 3000 }).toBe(true);
  await page.waitForTimeout(900);
  const pos = await icons.evaluateAll(els => els.map(e => { const b = e.getBoundingClientRect(); return [Math.round(b.left + b.width / 2), Math.round(b.top + b.height / 2)]; }));
  expect(new Set(pos.map(p => p[1])).size).toBe(3);   // three tidy rows
  expect(new Set(pos.map(p => p[0])).size).toBe(8);   // eight tidy columns
});

test('stack card: copy is localised and icons follow the ink colour in dark mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await page.locator('[data-lang="uk"]').first().click();
  await expect(page.locator('.card.stack .t')).toHaveText('Стек тепер важить менше');
  const [bg, ink] = await page.locator('.card.stack .chaos i').first().evaluate(i => [getComputedStyle(i).backgroundColor, getComputedStyle(i).color]);
  expect(bg).toBe(ink);
  expect(bg).not.toBe('rgb(0, 0, 0)');
});
