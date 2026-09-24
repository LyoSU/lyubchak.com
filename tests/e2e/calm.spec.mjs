import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/stickers', r => r.fulfill({ json: { stickers: [] } }));
  await page.setViewportSize({ width: 1280, height: 800 });
});

test('page behind an open sheet does not scroll', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-sheet="path"]').click();
  await expect(page.locator('#sheet')).toBeVisible();
  const y0 = await page.evaluate(() => scrollY);   // the click may scroll the card into view first
  await page.mouse.move(640, 400);
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => scrollY)).toBe(y0);
  await page.mouse.move(20, 780);            // over the backdrop
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => scrollY)).toBe(y0);
  await page.keyboard.press('Escape');
  expect(y0).toBeGreaterThan(100);           // room to scroll back up
  await page.mouse.wheel(0, -600);           // up: the card may already sit at the very bottom
  await expect.poll(() => page.evaluate(() => scrollY)).not.toBe(y0); // unlocked after close
});

test('sheet body neither chains nor rubber-bands its overscroll', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-sheet="fstik"]').click();
  expect(await page.$eval('#sheet-body', b => getComputedStyle(b).overscrollBehaviorY)).toBe('none');
});

for (const scheme of ['light', 'dark']) {
  test(`no card is colour-filled (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/');
    const res = await page.$$eval('#bento .card', cs => {
      const base = getComputedStyle(document.querySelector('#me')).backgroundColor;
      return cs.filter(c => { const s = getComputedStyle(c); return s.backgroundImage !== 'none' || s.backgroundColor !== base; })
               .map(c => c.className.split(' ').find(k => ['fs', 'capka'].includes(k)) || c.className);
    });
    expect(res).toEqual([]);
  });
}
