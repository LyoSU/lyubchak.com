import { test, expect } from '@playwright/test';
const STK = n => Array.from({ length: n }, (_, i) => `https://api.fstik.app/file/T${i}/sticker.webp`);

test.beforeEach(async ({ page }) => {
  await page.route('**/api/stickers', r => r.fulfill({ json: { stickers: STK(8) } }));
  // serve the fake sticker URLs locally: a real fStik 404 would trigger the (correct) local fallback and race the assertion
  await page.route('https://api.fstik.app/file/**', r => r.fulfill({ path: new URL('../../images/stickers/1.webp', import.meta.url).pathname, contentType: 'image/webp' }));
});

test('sheet: opens from card, traps focus, Esc returns focus', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('[data-sheet="fstik"]');
  await card.focus(); await page.keyboard.press('Enter');
  const sheet = page.locator('#sheet');
  await expect(sheet).toBeVisible();
  await expect(page.locator('#x')).toBeFocused();
  await expect(sheet.locator('h2')).toHaveText('fStik');
  for (let i = 0; i < 25; i++) await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.getElementById('sheet').contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
  await expect(card).toBeFocused();
});

test('sheet: backdrop click closes', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-sheet="capka"]').click();
  await expect(page.locator('#sheet')).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(page.locator('#sheet')).toBeHidden();
});

test('language: switch, persist, quotes and AI links follow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-lang="uk"]');
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await expect(page.locator('[data-i="role"]')).toContainText('Будую');
  await expect(page.locator('img[data-q="1"]')).toHaveAttribute('src', '/images/quotes/uk-1.webp');
  const href = await page.locator('#ai-chatgpt').getAttribute('href');
  expect(href.startsWith('https://chatgpt.com/?q=')).toBe(true);
  expect(decodeURIComponent(href.split('q=')[1])).toContain('Юрій Любчак');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await page.locator('[data-sheet="quotly"]').click();
  await expect(page.locator('#sheet-body')).toContainText('Додати в групу');
});

test('language: storage that throws falls back to navigator.language', async ({ browser }) => {
  const ctx = await browser.newContext({ locale: 'uk-UA' });
  const page = await ctx.newPage();
  await page.route('**/api/stickers', r => r.fulfill({ json: { stickers: [] } }));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await ctx.close();
});

test('AI links carry the llms-full prompt', async ({ page }) => {
  await page.goto('/');
  for (const [id, prefix] of [['#ai-chatgpt', 'https://chatgpt.com/?q='], ['#ai-claude', 'https://claude.ai/new?q='], ['#ai-perplexity', 'https://www.perplexity.ai/search?q=']]) {
    const href = await page.locator(id).getAttribute('href');
    expect(href.startsWith(prefix)).toBe(true);
    expect(decodeURIComponent(href.slice(prefix.length))).toContain('https://lyubchak.com/llms-full.txt');
  }
});

test('copy email shows confirmation and writes clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const btn = page.locator('#me [data-copy]');
  await btn.click();
  await expect(btn).toHaveClass(/done/);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('hi@lyubchak.com');
});

test('stickers: API list fills card and sheet', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.fs .stk img').first()).toHaveAttribute('src', STK(8)[0]);
  await page.locator('[data-sheet="fstik"]').click();
  await expect(page.locator('#sheet-body .stickers img')).toHaveCount(8);
});

test('stickers: API failure keeps the static fallback', async ({ page }) => {
  await page.unroute('**/api/stickers');
  await page.route('**/api/stickers', r => r.fulfill({ status: 500, body: 'x' }));
  await page.goto('/');
  const srcs = await page.$$eval('.fs .stk img', is => is.map(i => i.getAttribute('src')));
  expect(srcs).toHaveLength(3);
  for (const s of srcs) expect(s).toMatch(/^\/images\/stickers\/\d\.webp$/);   // local fallback (survives fStik outages)
});

test('reduced motion: Capka video never autoplays; sheets still work', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('.capka').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  expect(await page.$eval('.capka .win video', v => v.paused)).toBe(true);
  await page.locator('[data-sheet="path"]').click();
  await expect(page.locator('#sheet')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#sheet')).toBeHidden();
});

test('glass header appears after scrolling past the hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#hdr')).not.toHaveClass(/show/);
  await page.mouse.wheel(0, 900);
  await expect(page.locator('#hdr')).toHaveClass(/show/);
});
