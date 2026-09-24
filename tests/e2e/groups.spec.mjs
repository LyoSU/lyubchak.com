import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/stickers', r => r.fulfill({ status: 500, body: 'down' }));
  await page.addInitScript(() => { try { localStorage.setItem('lang', 'en'); } catch {} });
});

const key = c => c.dataset.sheet || c.id || [...c.classList].find(k => !['card', 'tap', 'w2', 'h2', 'm-w2'].includes(k));

test('cards are arranged in four untitled groups: intro, built, experience, contact', async ({ page }) => {
  await page.goto('/');
  const groups = await page.$$eval('#bento .grp', gs => gs.map(g => ({
    cards: [...g.querySelectorAll(':scope > .bento > .card')].map(c => c.dataset.sheet || c.id || [...c.classList].find(k => !['card', 'tap', 'w2', 'h2', 'm-w2'].includes(k))),
  })));
  expect(groups).toEqual([
    { cards: ['me', 'kness', 'ai'] },
    { cards: ['fstik', 'capka', 'quotly', 'hortay', 'bots'] },
    { cards: ['path', 'stack', 'award', 'work', 'github'] },
    { cards: ['open', 'talk'] },
  ]);
});

test('groups carry no headings; spacing alone separates them', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#bento h2, #bento .gt')).toHaveCount(0);
  const gaps = await page.$$eval('#bento .grp', gs => gs.slice(1).map((g, i) => g.getBoundingClientRect().top - gs[i].getBoundingClientRect().bottom));
  const inner = await page.$eval('#bento .bento', b => parseFloat(getComputedStyle(b).rowGap));
  for (const g of gaps) expect(g).toBeGreaterThan(inner * 2.5);
});

for (const [w, h] of [[1280, 900], [800, 1000]]) {
  test(`every group grid is filled with no holes @${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/');
    await page.waitForTimeout(1600);
    const holes = await page.$$eval('#bento .grp > .bento', gs => gs.flatMap((g, gi) => {
      g.scrollIntoView({ block: 'start' });
      const s = getComputedStyle(g), px = v => v.split(' ').map(parseFloat);
      const cols = px(s.gridTemplateColumns), rows = px(s.gridTemplateRows), gap = parseFloat(s.columnGap), rgap = parseFloat(s.rowGap);
      const r = g.getBoundingClientRect(), out = [];
      let y = r.top;
      rows.forEach((rh, ri) => { let x = r.left;
        cols.forEach((cw, ci) => {
          const el = document.elementFromPoint(x + cw / 2, y + rh / 2);
          if (!el || !el.closest('.card') || el.closest('.bento') !== g) out.push(`group ${gi} r${ri}c${ci}`);
          x += cw + gap; });
        y += rh + rgap; });
      return out;
    }));
    expect(holes).toEqual([]);
  });
}

test('fStik and Capka no longer dominate: one row tall, same surface as every card', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.waitForTimeout(1600);
  const r = await page.$$eval('[data-sheet="fstik"],[data-sheet="capka"]', cs => cs.map(c => ({
    h: c.getBoundingClientRect().height, bg: getComputedStyle(c).backgroundColor, img: getComputedStyle(c).backgroundImage })));
  const base = await page.$eval('#me', m => getComputedStyle(m).backgroundColor);
  for (const c of r) { expect(c.h).toBeLessThan(260); expect(c.bg).toBe(base); expect(c.img).toBe('none'); }
});

for (const scheme of ['light', 'dark']) {
  test(`violet marks only graphics, never text; the award keeps its gold (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/');
    const c = await page.evaluate(() => {
      const cs = sel => getComputedStyle(document.querySelector(sel));
      const probe = document.createElement('i'); probe.style.color = 'var(--accent)'; document.body.append(probe);
      const accent = getComputedStyle(probe).color, ink = (probe.style.color = 'var(--ink)', getComputedStyle(probe).color); probe.remove();
      return { accent, ink,
        dots: [getComputedStyle(document.querySelector('.path li.now'), '::before').backgroundColor, cs('.work .dot').backgroundColor],
        text: [cs('.fs .n').color, cs('.gh .big').color, cs('.role-card .lab').color !== accent],
        award: cs('.award .big').backgroundImage };
    });
    for (const d of c.dots) expect(d).toBe(c.accent);
    expect(c.text).toEqual([c.ink, c.ink, true]);
    expect(c.award).toContain('linear-gradient');
  });
}
