import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/stickers', r => r.fulfill({ status: 500, body: 'down' }));
  await page.addInitScript(() => { try { localStorage.setItem('lang', 'en'); } catch {} });
  await page.setViewportSize({ width: 390, height: 844 });
});

test('phone sheet: role chips wrap as chips, not full-width bars', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-sheet="kness"]').click();
  await expect(page.locator('#sheet')).toHaveClass(/content-on/);
  const r = await page.$eval('#sheet-body .sh-media.stack', m => ({ w: m.clientWidth, chips: [...m.children].map(s => s.getBoundingClientRect().width), dir: getComputedStyle(m).flexDirection }));
  expect(r.dir).toBe('row');
  for (const c of r.chips) expect(c).toBeLessThan(r.w * .75);
});

test('phone sheet: list rows put the detail under the name, left-aligned', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-sheet="kness"]').click();
  await expect(page.locator('#sheet')).toHaveClass(/content-on/);
  const rows = await page.$$eval('#sheet-body .list > div', ds => ds.map(d => { const s = d.querySelector('span'), a = d.getBoundingClientRect(), b = s.getBoundingClientRect();
    return { left: Math.round(b.left - a.left), below: b.top > a.top + 10, align: getComputedStyle(s).textAlign }; }));
  expect(rows.length).toBeGreaterThan(3);
  for (const r of rows) expect(r).toEqual({ left: 0, below: true, align: expect.stringMatching(/start|left/) });
});

test('close button: sheet remembers it was opened by pointer vs keyboard (Safari shows a ring on scripted focus)', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-sheet="kness"]').click();
  await expect(page.locator('#x')).toBeFocused();
  await expect(page.locator('#sheet')).toHaveAttribute('data-input', 'pointer');
  await page.keyboard.press('Escape');
  await expect(page.locator('#sheet')).toBeHidden();
  await page.locator('[data-sheet="kness"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#x')).toBeFocused();
  await expect(page.locator('#sheet')).toHaveAttribute('data-input', 'keyboard');
  await page.keyboard.press('Tab');   // any key after a pointer open brings the ring back
  await expect(page.locator('#sheet')).toHaveAttribute('data-input', 'keyboard');
});
