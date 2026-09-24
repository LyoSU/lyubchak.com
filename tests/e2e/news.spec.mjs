import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/stickers', r => r.fulfill({ status: 500, body: 'down' }));
});

for (const [lang, name] of [['uk', 'Живі новини'], ['en', 'Live News']]) {
  test(`Live News card: name, what it reads, own model (${lang})`, async ({ page }) => {
    await page.addInitScript(l => { try { localStorage.setItem('lang', l); } catch {} }, lang);
    await page.goto('/');
    const card = page.locator('[data-sheet="news"]');
    await expect(card.locator('.t')).toHaveText(name);
    await expect(card).toContainText('354');
    await expect(card).toContainText('94.8%');
    await expect(card).toContainText('@UAliveNews');
    await expect(card).toContainText('@ShortUA');
  });
}

test('Live News sheet: site, both channels and the code are one system, with the model and NYAN credited', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('lang', 'uk'); } catch {} });
  await page.goto('/');
  await page.locator('[data-sheet="news"]').click();
  const body = page.locator('#sheet-body');
  await expect(body.locator('h2')).toHaveText('Живі новини');
  for (const href of ['https://news.yuri.ly', 'https://t.me/UAliveNews', 'https://t.me/ShortUA', 'https://github.com/LyoSU/nyan'])
    await expect(body.locator(`a[href="${href}"]`).first()).toBeVisible();
  await expect(body).toContainText('Коротко про головне');
  await expect(body).toContainText('multilingual-e5-base');
  await expect(body).toContainText('NYAN');
  await expect(body.locator('.sh-actions .btn.primary')).toHaveAttribute('href', 'https://news.yuri.ly');
});
