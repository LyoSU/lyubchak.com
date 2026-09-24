import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => { await page.route('**/api/stickers', r => r.fulfill({ json: { stickers: [] } })); });

for (const w of [320, 360, 390]) for (const lang of ['en', 'uk']) {
  test(`phone @${w} ${lang}: card titles never run under the + button, stat captions stay compact`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 800 });
    await page.goto('/');
    await page.locator(`[data-lang="${lang}"]`).first().click();
    await page.waitForTimeout(300);
    const bad = await page.evaluate(() => [...document.querySelectorAll('.bento > .card')].flatMap(c => {
      const out = [], more = c.querySelector('.hd .more');
      if (more) {
        const a = more.getBoundingClientRect();
        for (const t of c.querySelectorAll('.hd .t, .hd .lab, .hd .s')) {
          const r = document.createRange(); r.selectNodeContents(t);
          for (const b of r.getClientRects()) if (b.right > a.left - 4 && b.bottom > a.top && b.top < a.bottom) out.push(`title under +: ${t.textContent.trim()}`);
        }
      }
      for (const s of c.querySelectorAll('.stats .s')) {
        const lh = parseFloat(getComputedStyle(s).lineHeight), fs = parseFloat(getComputedStyle(s).fontSize);
        if (lh / fs > 1.5) out.push(`loose caption ${lh}/${fs}: ${s.textContent}`);
        if (s.getClientRects().length > 2) out.push(`caption > 2 lines: ${s.textContent}`);
      }
      return out;
    }));
    expect(bad).toEqual([]);
  });
}
