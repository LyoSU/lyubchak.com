import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.route('**/api/stickers', r => r.fulfill({ status: 500, body: 'down' }));
  await page.addInitScript(() => { try { localStorage.setItem('lang', 'en'); } catch {} });
});

const EN = 'Who is Yuri Lyubchak? Read https://lyubchak.com/llms-full.txt and check other public sources. What has he built, and what does he work on now?';

test('clicking the prompt copies it (plain, no quote marks) for any agent', async ({ page }) => {
  await page.goto('/');
  const btn = page.locator('#ai-copy');
  await expect(btn).toHaveJSProperty('tagName', 'BUTTON');
  await expect(btn.locator('.hint')).toHaveText('Copy prompt');
  await page.locator('#prompt').click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EN);
  await expect(btn.locator('.hint')).toHaveText('Copied — paste it into any AI');
  await expect(btn.locator('.hint')).toHaveText('Copy prompt', { timeout: 4000 });
});

test('copies the prompt in the current language', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-lang="uk"]');
  await expect(page.locator('#ai-copy .hint')).toHaveText('Скопіювати промпт');
  await page.locator('#ai-copy').click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/^Хто такий Юрій Любчак\?.*зараз\?$/);
  await expect(page.locator('#ai-copy .hint')).toHaveText('Скопійовано — встав у будь-який AI');
});

test('no clipboard: the prompt text gets selected, never a false "Copied"', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('no')) } }); });
  await page.goto('/');
  await page.locator('#ai-copy').click();
  await expect(page.locator('#ai-copy .hint')).toHaveText('Copy prompt');
  expect(await page.evaluate(() => getSelection().toString())).toContain('llms-full.txt');
});
