import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/stickers', r => r.fulfill({ status: 500, body: 'down' }));
  await page.addInitScript(() => { try { localStorage.setItem('lang', 'en'); } catch {} });
});

const IDS = ['fstik', 'capka', 'quotly', 'path', 'kness', 'hortay', 'github', 'bots'];
for (const id of IDS) {
  test(`sheet ${id}: product hero and a visual`, async ({ page }) => {
    await page.goto('/');
    await page.locator(`[data-sheet="${id}"]`).click();
    await expect(page.locator('#sheet')).toHaveAttribute('data-kind', id);
    await expect(page.locator('#sheet-body .sh-hero h2')).toBeVisible();
    await expect(page.locator('#sheet-body .sh-media')).toBeVisible();
  });
}

test('primary action stays visible while the sheet scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto('/');
  await page.locator('[data-sheet="fstik"]').click();
  const cta = page.locator('#sheet-body .sh-actions .btn.primary');
  await expect(cta).toBeInViewport();
  await page.locator('#sheet-body').evaluate(b => { b.scrollTop = b.scrollHeight; });
  await expect(cta).toBeInViewport();
  await page.locator('#sheet-body').evaluate(b => { b.scrollTop = 0; });
  await expect(cta).toBeInViewport();
});

test('API down: fStik sheet still shows 8 stickers', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-sheet="fstik"]').click();
  await expect(page.locator('#sheet-body .stickers img')).toHaveCount(8);
});

test('GitHub sheet: star bars are proportional', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-sheet="github"]').click();
  const w = await page.$$eval('#sheet-body .repo i', is => is.map(i => i.getBoundingClientRect().width));
  expect(w.length).toBe(6);
  expect(w[0]).toBeGreaterThan(w[5] * 5);
});

test('QuotLy sheet shows the real quote stickers in the current language', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-lang="uk"]');
  await page.locator('[data-sheet="quotly"]').click();
  await expect(page.locator('#sheet-body .sh-media img')).toHaveCount(2);
  await expect(page.locator('#sheet-body .sh-media img').first()).toHaveAttribute('src', '/images/quotes/uk-1.webp');
});

test('fStik sheet stickers actually load', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-sheet="fstik"]').click();
  await page.waitForTimeout(1500);
  const loaded = await page.$$eval('#sheet-body .stickers img', is => is.filter(i => i.complete && i.naturalWidth > 0).length);
  expect(loaded).toBe(8);
});

test('sheet scrollbar is thin, not the default bar', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-sheet="fstik"]').click();
  expect(await page.$eval('#sheet-body', b => getComputedStyle(b).scrollbarWidth)).toBe('thin');
});

test('compact title bar appears once the hero scrolls away', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto('/');
  await page.locator('[data-sheet="fstik"]').click();
  const bar = page.locator('#sh-bar');
  await expect(bar).toHaveText('fStik');
  await expect(bar).toHaveCSS('opacity', '0');
  await page.locator('#sheet-body').evaluate(b => { b.scrollTop = 200; b.dispatchEvent(new Event('scroll')); });
  await expect(bar).toHaveCSS('opacity', '1');
  await page.locator('#sheet-body').evaluate(b => { b.scrollTop = 0; b.dispatchEvent(new Event('scroll')); });
  await expect(bar).toHaveCSS('opacity', '0');
});
