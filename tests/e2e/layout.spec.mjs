import { test, expect } from '@playwright/test';

const WIDTHS = [[1280, 860], [800, 1000], [375, 812]];
for (const lang of ['en', 'uk']) for (const [w, h] of WIDTHS) {
  test(`no overflow, no h-scroll @${w} ${lang}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.addInitScript(l => { try { localStorage.setItem('lang', l); } catch {} }, lang);
    await page.goto('/');
    await page.waitForTimeout(1600); // intro finished
    await expect(page.locator('#bento > .card')).toHaveCount(15);
    const bad = await page.$$eval('#bento > .card:not(.capka)', cs =>
      cs.filter(c => c.scrollHeight > c.clientHeight + 1 || c.scrollWidth > c.clientWidth + 1).map(c => c.className));
    expect(bad).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(w);
  });
}

test('4-column grid closes with no holes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto('/');
  const r = await page.$$eval('#bento > .card', cs => {
    const g = cs[0].parentElement.getBoundingClientRect(); const cell = 168, gap = 14;
    let area = 0, maxBottom = 0;
    for (const c of cs) { const b = c.getBoundingClientRect();
      area += Math.round((b.width + gap) / ((g.width + gap) / 4)) * Math.round((b.height + gap) / (cell + gap));
      maxBottom = Math.max(maxBottom, b.bottom - g.top); }
    return { area, rows: Math.round((maxBottom + gap) / (cell + gap)) };
  });
  expect(r).toEqual({ area: 32, rows: 8 });
});

test('every "+" sits at the same spot', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto('/');
  const pos = await page.$$eval('#bento .card .hd .more', ms => ms.map(m => {
    const c = m.closest('.card').getBoundingClientRect(), r = m.getBoundingClientRect();
    return `${Math.round(r.top - c.top)}/${Math.round(c.right - r.right)}`; }));
  expect(pos.length).toBeGreaterThan(0);
  expect(new Set(pos).size).toBe(1);
});
