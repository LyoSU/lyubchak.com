import { chromium } from '@playwright/test';
// images/og.png for / and images/og-uk.png for /uk/, both from assets/og-card.html
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const card = 'file://' + new URL('../../assets/og-card.html', import.meta.url).pathname;
for (const [q, out] of [['', 'og.png'], ['?lang=uk', 'og-uk.png']]) {
  await p.goto(card + q);
  await p.waitForTimeout(500);
  await p.screenshot({ path: new URL('../../images/' + out, import.meta.url).pathname });
  console.log(out + ' written');
}
await b.close();
