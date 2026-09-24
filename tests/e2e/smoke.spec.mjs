import { test, expect } from '@playwright/test';
test('home page serves', async ({ page }) => {
  const res = await page.goto('/');
  expect(res.status()).toBe(200);
  await expect(page).toHaveTitle(/Lyubchak|Liubchak/);
});
