const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 960, height: 1970 }, deviceScaleFactor: 2 });
  await p.goto('file://' + __dirname + '/index.html');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  await p.locator('.poster').screenshot({ path: process.argv[2] || 'cardapio-natal.png' });
  await b.close();
})();
