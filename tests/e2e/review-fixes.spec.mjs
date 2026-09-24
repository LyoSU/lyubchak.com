import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('lang', 'en'); } catch {} });
});

test('#1 selecting text with the mouse does not close the sheet', async ({ page }) => {
  await page.route('**/api/stickers', r => r.fulfill({ json: { stickers: [] } }));
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto('/');
  await page.locator('[data-sheet="path"]').click();
  await page.waitForTimeout(600);
  const p = page.locator('#sheet-body > p').first();   // body copy, not the hero (the hero is a drag handle)
  const b = await p.boundingBox();
  await page.mouse.move(b.x + 10, b.y + 5); await page.mouse.down();
  await page.mouse.move(b.x + 200, b.y + 240, { steps: 12 }); await page.mouse.up();
  await page.waitForTimeout(500);
  await expect(page.locator('#sheet')).toBeVisible();
});

test('#1 dragging the hero down with the mouse still dismisses', async ({ page }) => {
  await page.route('**/api/stickers', r => r.fulfill({ json: { stickers: [] } }));
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto('/');
  await page.locator('[data-sheet="path"]').click();
  await page.waitForTimeout(600);
  const h = await page.locator('#sheet-body .sh-hero').boundingBox();
  await page.mouse.move(h.x + 60, h.y + 20); await page.mouse.down();
  await page.mouse.move(h.x + 60, h.y + 260, { steps: 12 }); await page.mouse.up();
  await expect(page.locator('#sheet')).toBeHidden();
});

test('#2 fStik down: card and sheet stickers still render from local fallback', async ({ page }) => {
  await page.route('**/api/stickers', r => r.fulfill({ status: 500, body: '' }));
  await page.route('https://api.fstik.app/**', r => r.abort());
  await page.goto('/');
  await page.waitForTimeout(1200);
  const card = await page.$$eval('.fs .stk img', is => is.map(i => i.complete && i.naturalWidth > 0));
  expect(card).toEqual([true, true, true]);
  await page.locator('[data-sheet="fstik"]').click();
  await page.waitForTimeout(1200);
  expect(await page.$$eval('#sheet-body .stickers img', is => is.filter(i => i.naturalWidth > 0).length)).toBe(8);
});

test('#2 API list with dead images falls back per image', async ({ page }) => {
  await page.route('**/api/stickers', r => r.fulfill({ json: { stickers: [1,2,3,4,5,6,7,8].map(i => `https://api.fstik.app/file/DEAD${i}/sticker.webp`) } }));
  await page.route('https://api.fstik.app/file/DEAD*/**', r => r.fulfill({ status: 404, body: '' }));
  await page.goto('/');
  await page.waitForTimeout(1500);
  expect(await page.$$eval('.fs .stk img', is => is.every(i => i.complete && i.naturalWidth > 0))).toBe(true);
});

test('#5 failed clipboard never claims "Copied"', async ({ page }) => {
  await page.route('**/api/stickers', r => r.fulfill({ json: { stickers: [] } }));
  await page.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) } }); });
  await page.goto('/');
  const btn = page.locator('#me [data-copy]');
  await btn.click();
  await page.waitForTimeout(150);
  // read once: the "done" class auto-clears after 1.6s, so a retrying assertion would pass vacuously
  expect(await btn.getAttribute('class')).not.toContain('done');
});
