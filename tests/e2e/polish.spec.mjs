import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.route('**/api/stickers', r => r.fulfill({ json: { stickers: [] } }));
  await page.addInitScript(() => { try { localStorage.setItem('lang', 'en'); } catch {} });
  await page.setViewportSize({ width: 1280, height: 860 });
});

test('path sheet timeline text keeps normal letter spacing', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-sheet="path"]').click();
  expect(await page.$eval('#sheet-body .sh-media.path li', li => getComputedStyle(li).letterSpacing)).toBe('normal');
});

for (const w of [1280, 375]) test(`fStik stickers sit inside the card, clear of the top edge @${w}`, async ({ page }) => {
  await page.setViewportSize({ width: w, height: 860 });
  await page.goto('/'); await page.waitForTimeout(1600);
  const gaps = await page.$$eval('.fs .stk img', is => is.map(i => {
    const c = i.closest('.card').getBoundingClientRect(), b = i.getBoundingClientRect(); return Math.round(b.top - c.top); }));
  for (const g of gaps) expect(g).toBeGreaterThanOrEqual(12);
});

test('bots card: four icons on identical tiles', async ({ page }) => {
  await page.goto('/'); await page.waitForTimeout(1600);
  const tiles = await page.$$eval('.bots .row > span', ts => ts.map(t => { const s = getComputedStyle(t), r = t.getBoundingClientRect();
    return `${Math.round(r.width)}x${Math.round(r.height)}:${s.backgroundColor !== 'rgba(0, 0, 0, 0)'}`; }));
  expect(tiles).toHaveLength(4);
  expect(new Set(tiles).size).toBe(1);
  expect(tiles[0]).toMatch(/:true$/);
});

test('footer: working llms.txt link, no copyright line', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer a', { hasText: 'llms.txt' })).toHaveAttribute('href', '/llms.txt');
  await expect(page.locator('footer')).not.toContainText('©');
});

for (const [w, lang] of [[1280, 'uk'], [1280, 'en'], [375, 'uk'], [800, 'uk']]) {
  test(`AI prompt is shown in full, URL unbroken @${w} ${lang}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/');
    await page.locator(`[data-lang="${lang}"]`).first().click();
    const p = page.locator('#prompt');
    const m = await p.evaluate(el => ({ sh: el.scrollHeight, ch: el.clientHeight, text: el.textContent }));
    expect(m.sh).toBeLessThanOrEqual(m.ch + 1);                       // nothing clipped
    expect(m.text).toContain('https://lyubchak.com/llms-full.txt');
    const url = p.locator('.url');
    await expect(url).toHaveText('https://lyubchak.com/llms-full.txt');
    const rects = await url.evaluate(el => el.getClientRects().length);
    expect(rects).toBe(1);                                            // not split across lines
    const card = await page.locator('.card.ai').evaluate(el => el.scrollHeight <= el.clientHeight + 1);
    expect(card).toBe(true);
  });
}

test.describe('sheet scrolling chrome', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await page.goto('/');
    await page.locator('[data-sheet="fstik"]').click();
    await expect(page.locator('#sheet')).toHaveClass(/content-on/);
  });
  test('no native scrollbar strip: coloured hero spans the full sheet width', async ({ page }) => {
    const m = await page.evaluate(() => {
      const b = document.querySelector('#sheet-body'), s = document.querySelector('#sheet'), h = b.querySelector('.sh-hero');
      return { gutter: b.offsetWidth - b.clientWidth, hero: h.offsetWidth, sheet: s.clientWidth, scrollable: b.scrollHeight > b.clientHeight };
    });
    expect(m.scrollable).toBe(true);
    expect(m.gutter).toBe(0);
    expect(Math.abs(m.hero - m.sheet)).toBeLessThanOrEqual(1);
  });
  test('no rubber-band gap above the hero', async ({ page }) => {
    expect(await page.locator('#sheet-body').evaluate(b => getComputedStyle(b).overscrollBehaviorY)).toBe('none');
  });
  test('overlay scroll indicator shows while scrolling, tracks position, then fades', async ({ page }) => {
    const t = page.locator('#sheet .sh-thumb');
    await expect(t).toHaveCSS('opacity', '0');
    await page.mouse.move(400, 600);
    const rel = () => t.evaluate(el => el.getBoundingClientRect().top - el.parentElement.getBoundingClientRect().top);
    await page.mouse.wheel(0, 120);
    await expect(t).toHaveClass(/on/);
    const top1 = await rel();
    await page.mouse.wheel(0, 120);
    await expect.poll(rel).toBeGreaterThan(top1 + 5);
    await expect(t).not.toHaveClass(/on/, { timeout: 3000 });
  });
});

for (const w of [1280, 375]) {
  test(`sticky actions bar is clipped to the sheet's rounded corners @${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 800 });
    await page.goto('/');
    await page.locator('[data-sheet="fstik"]').click();
    await expect(page.locator('#sheet')).toHaveClass(/content-on/);
    const r = await page.evaluate(() => {
      const s = getComputedStyle(document.querySelector('#sheet')), a = getComputedStyle(document.querySelector('#sheet .sh-actions'));
      return [s.borderBottomLeftRadius, a.borderBottomLeftRadius, s.borderBottomRightRadius, a.borderBottomRightRadius];
    });
    expect(r[1]).toBe(r[0]);   // backdrop-filter ignores the parent's radius, so the bar carries its own
    expect(r[3]).toBe(r[2]);
  });
}
