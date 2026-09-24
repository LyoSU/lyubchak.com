import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.goto('file://' + new URL('../../assets/og-card.html', import.meta.url).pathname);
await p.waitForTimeout(500);
await p.screenshot({ path: new URL('../../images/og.png', import.meta.url).pathname });
await b.close(); console.log('og.png written');
