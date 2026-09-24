import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => { await page.route('**/api/stickers', r => r.fulfill({ json: { stickers: [] } })); });
const T = { en: 'I orchestrate AI agents', uk: 'Оркеструю AI-агентів' };

for (const [w, lang] of [[1280, 'en'], [1280, 'uk'], [800, 'uk'], [375, 'uk'], [375, 'en']]) {
  test(`how-I-work hub: me in the centre, four agents around, all inside the card @${w} ${lang}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/');
    await page.locator(`[data-lang="${lang}"]`).first().click();
    const card = page.locator('.card.work');
    await expect(card.locator('.t')).toHaveText(T[lang]);
    await expect(card.locator('.hub .node.me')).toHaveCount(1);
    await expect(card.locator('.hub .node.agent')).toHaveCount(4);
    await expect(card.locator('.hub svg line')).toHaveCount(4);
    const m = await card.evaluate(c => {
      const cr = c.getBoundingClientRect(), tr = c.querySelector('.txt').getBoundingClientRect();
      const nodes = [c.querySelector('.hub .node.me'), ...c.querySelectorAll('.hub .node.agent')].map(n => n.getBoundingClientRect());
      const me = nodes[0], mid = r => [(r.left + r.right) / 2, (r.top + r.bottom) / 2];
      const hit = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      return {
        fits: c.scrollHeight <= c.clientHeight + 1,
        inside: nodes.every(b => b.left >= cr.left && b.right <= cr.right && b.top >= cr.top && b.bottom <= cr.bottom),
        onText: nodes.some(b => hit(b, tr)),
        nodesOverlap: nodes.some((a, i) => nodes.some((b, j) => i < j && hit(a, b))),
        centred: (() => { const [x, y] = mid(me), a = nodes.slice(1).map(mid); return Math.min(...a.map(p => p[0])) < x && x < Math.max(...a.map(p => p[0])) && Math.min(...a.map(p => p[1])) < y && y <= Math.max(...a.map(p => p[1])); })(),
      };
    });
    expect(m).toEqual({ fits: true, inside: true, onText: false, nodesOverlap: false, centred: true });
  });
}

test('how-I-work hub: tasks go out and results come back once the card is on screen', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1280, height: 500 });
  await page.goto('/');
  const card = page.locator('.card.work');
  await page.waitForTimeout(600);
  await expect(card).not.toHaveClass(/run/);                                  // off-screen: nothing yet
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveClass(/run/);
  const dots = card.locator('.hub .dot');
  await expect(dots).toHaveCount(4);
  expect(await dots.evaluateAll(d => d.map(x => getComputedStyle(x).animationName))).toEqual(['trip', 'trip', 'trip', 'trip']);
  expect(await dots.first().evaluate(d => getComputedStyle(d).animationDirection)).toBe('alternate');   // there and back
});

test('how-I-work hub: reduced motion keeps it static', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('.card.work').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  expect(await page.locator('.card.work .hub .dot').evaluateAll(d => d.map(x => getComputedStyle(x).animationName))).toEqual(['none', 'none', 'none', 'none']);
});

test('how-I-work hub: sub copy says who decides', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-lang="uk"]').first().click();
  await expect(page.locator('.card.work .s')).toHaveText('Ставлю задачі, збираю результати й вирішую, що йде в прод.');
  await page.locator('[data-lang="en"]').first().click();
  await expect(page.locator('.card.work .s')).toHaveText('I set the tasks, bring the results together and decide what ships.');
});
