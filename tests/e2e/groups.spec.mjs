import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/stickers', r => r.fulfill({ status: 500, body: 'down' }));
  await page.addInitScript(() => { try { localStorage.setItem('lang', 'en'); } catch {} });
});

const key = c => c.dataset.sheet || c.id || [...c.classList].find(k => !['card', 'tap', 'w2', 'h2', 'm-w2'].includes(k));

test('cards are arranged in four untitled groups: intro, built, experience, contact', async ({ page }) => {
  await page.goto('/');
  const groups = await page.$$eval('#bento .grp', gs => gs.map(g => ({
    cards: [...g.querySelectorAll(':scope > .bento .card')].map(c => c.dataset.sheet || c.id || [...c.classList].find(k => !['card', 'tap', 'w2', 'h2', 'm-w2'].includes(k))),
  })));
  expect(groups).toEqual([
    { cards: ['me', 'kness', 'ai'] },
    { cards: ['quotly', 'capka', 'fstik', 'news', 'hortay', 'bots'] },
    { cards: ['award', 'work', 'path', 'github', 'stack'] },
    { cards: ['talk', 'open'] },
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
          if (!el || !el.closest('.card, .pair') || el.closest('.bento') !== g)   // the slit between a pair's two tiles belongs to the pair out.push(`group ${gi} r${ri}c${ci}`);
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
  // short enough that the Hortay and More-bots tiles sharing its row are not half empty
  for (const c of r) { expect(c.h).toBeLessThan(244); expect(c.bg).toBe(base); expect(c.img).toBe('none'); }
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

test('experience: the path runs down the right edge, the award opens the group', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.waitForTimeout(1600);
  const r = await page.evaluate(() => { const b = s => document.querySelector(s).getBoundingClientRect(), g = document.querySelector('.card.path').closest('.bento').getBoundingClientRect();
    return { pathRight: Math.round(g.right - b('.card.path').right), awardLeft: Math.round(b('.card.award').left - g.left), workAboveStack: b('.card.work').top < b('.card.stack').top }; });
  expect(r).toEqual({ pathRight: 0, awardLeft: 0, workAboveStack: true });
});

for (const w of [1280, 800, 375]) {
  test(`Hortay and More bots are a compact row under the main products, no empty band @${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(1600);
    const r = await page.evaluate(() => {
      const tiles = ['[data-sheet="hortay"]', '[data-sheet="bots"]'].map(s => { const c = document.querySelector(s), h = c.querySelector('.hd'), p = getComputedStyle(c), b = c.getBoundingClientRect();
        return { h: Math.round(b.height), top: Math.round(b.top), slack: Math.round(b.height - h.getBoundingClientRect().height - parseFloat(p.paddingTop) - parseFloat(p.paddingBottom)) }; });
      const below = Math.max(...['fstik', 'news'].map(k => document.querySelector(`[data-sheet="${k}"]`).getBoundingClientRect().bottom));
      return { tiles, below: tiles.every(t => t.top > below) };
    });
    expect(r.below).toBe(true);
    if (w > 900) expect(r.tiles[0].top).toBe(r.tiles[1].top);    // side by side on desktop
    for (const t of r.tiles) { expect(t.h).toBeLessThan(120); expect(t.slack).toBeLessThanOrEqual(16); }
  });
}

for (const w of [1280, 800]) {
  test(`path timeline fills its tall card, the connector stays unbroken @${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(1600);
    const r = await page.$eval('.card.path', c => {
      const hd = c.querySelector('.hd').getBoundingClientRect(), li = [...c.querySelectorAll('li')].map(l => l.getBoundingClientRect());
      const gaps = li.slice(1).map((l, i) => Math.round(l.top - li[i].top));
      const lines = [...c.querySelectorAll('li:not(:last-child)')].map((l, i) => { const a = getComputedStyle(l, '::after'); return Math.round(l.getBoundingClientRect().top + parseFloat(a.top) + parseFloat(a.height) - li[i + 1].top); });
      return { gapUnderHeader: Math.round(li[0].top - hd.bottom), spread: Math.max(...gaps) - Math.min(...gaps), lines };
    });
    expect(r.gapUnderHeader).toBeLessThanOrEqual(24);
    for (const d of r.lines) expect(d).toBeGreaterThanOrEqual(0);   // each segment reaches the next dot
  });
}

for (const lang of ['en', 'uk']) {
  test(`fStik: every number carries its own label right under it (${lang})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.addInitScript(l => { try { localStorage.setItem('lang', l); } catch {} }, lang);
    await page.goto('/');
    const r = await page.$eval('.fs', c => {
      const n = c.querySelector('.n'), lab = n.nextElementSibling, a = n.getBoundingClientRect(), b = lab.getBoundingClientRect();
      return { label: lab.textContent.trim(), under: b.top >= a.bottom - 2 && b.top - a.bottom < 12, left: Math.round(b.left - a.left), sub: c.querySelector('.sub').textContent.trim() };
    });
    expect(r.label).toBe(lang === 'en' ? 'monthly users' : 'користувачів на місяць');
    expect(r.under).toBe(true); expect(r.left).toBe(0);
    expect(r.sub).toBe(lang === 'en' ? 'The largest sticker platform on Telegram' : 'Найбільша платформа стікерів у Telegram');
  });
}

test('fStik header is just the name, like every other product (no "creator" line)', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.fs .hd .lab, .fs [data-i="fs_solo"]')).toHaveCount(0);
  await expect(page.locator('.fs .hd .t')).toHaveText('fStik');
});
