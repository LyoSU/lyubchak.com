import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/stickers', r => r.fulfill({ status: 500, body: 'down' }));
});

const GLYPHS = /[★☆◐↗✓✕]/;

for (const lang of ['en', 'uk']) {
  test(`no font-dependent glyphs as icons, page and every sheet (${lang})`, async ({ page }) => {
    await page.addInitScript(l => { try { localStorage.setItem('lang', l); } catch {} }, lang);
    await page.goto('/');
    const found = await page.evaluate(re => {
      const rx = new RegExp(re), out = [];
      const walk = root => { const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (rx.test(n.data)) out.push(n.data.trim().slice(0, 40)); };
      walk(document.body);
      document.querySelectorAll('[aria-label]').forEach(e => { if (rx.test(e.getAttribute('aria-label'))) out.push('aria:' + e.getAttribute('aria-label')); });
      return out;
    }, GLYPHS.source);
    expect(found).toEqual([]);
    await page.locator('.copy').first().click().catch(() => {});
    expect(await page.locator('.copy .ok').first().textContent()).not.toMatch(GLYPHS);
  });
}

test('buttons that need a symbol get a real SVG icon that follows the text colour', async ({ page }) => {
  await page.goto('/');
  const ic = await page.evaluate(() => {
    const probe = sel => { const i = document.querySelector(sel); if (!i) return null; const s = getComputedStyle(i), r = i.getBoundingClientRect();
      return { w: Math.round(r.width), mask: (s.maskImage || s.webkitMaskImage).startsWith('url("data:image/svg'), paint: s.backgroundColor === getComputedStyle(i.parentElement).color }; };
    return { theme: probe('#theme .ic'), star: probe('.gh .big .ic'), ext: probe('#ai-chatgpt .ic') };
  });
  for (const [k, v] of Object.entries(ic)) { expect(v, k).not.toBeNull(); expect(v.w, k).toBeGreaterThan(8); expect(v.mask, k).toBe(true); expect(v.paint, k).toBe(true); }
});

test('theme toggle is an icon button with a label, and still toggles', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#theme')).toHaveAttribute('aria-label', /theme/i);
  await expect(page.locator('#theme')).toHaveText('');
  await page.click('#theme');
  await expect(page.locator('html')).toHaveAttribute('data-theme', /dark|light/);
});

test('icons sit on the same line as their text and take its colour (repo stars, Copied)', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.locator('#me .copy').click();
  const ok = await page.$eval('#me .copy .ok', o => { const t = o.firstChild, r = document.createRange(); r.selectNodeContents(t); const a = r.getBoundingClientRect(), b = o.querySelector('.ic').getBoundingClientRect(); return Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2); });
  expect(ok).toBeLessThan(4);
  await page.locator('[data-sheet="github"]').click();
  await expect(page.locator('#sheet-body .repo').first()).toBeVisible();
  const star = await page.$eval('#sheet-body .repo span', s => { const i = s.querySelector('.ic'), r = document.createRange(); r.selectNodeContents(s.firstChild); const a = r.getBoundingClientRect(), b = i.getBoundingClientRect();
    return { sameLine: Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2) < 4, colour: getComputedStyle(i).backgroundColor === getComputedStyle(s).color, w: Math.round(b.width) }; });
  expect(star).toEqual({ sameLine: true, colour: true, w: expect.any(Number) });
  expect(star.w).toBeGreaterThan(8);
});

test('card corner button reads as "expand", not "add": an expand icon, no plus bars', async ({ page }) => {
  await page.goto('/');
  const r = await page.$$eval('.card .more', ms => ms.map(m => { const b = getComputedStyle(m, '::before'), a = getComputedStyle(m, '::after');
    return { icon: (b.maskImage || b.webkitMaskImage).includes('data:image/svg'), after: a.content, text: m.textContent.trim() }; }));
  expect(r.length).toBe(8);
  for (const m of r) expect(m).toEqual({ icon: true, after: 'none', text: '' });
});
