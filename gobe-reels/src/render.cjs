// Renderiza quadros do comercial com Chromium (Playwright). Uso:
//   node render.js <pastaSaida> <quadroInicial> <quadroFinal> [passo]
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
(async () => {
  const [out, a, b, step] = [process.argv[2], +process.argv[3], +process.argv[4], +(process.argv[5] || 1)];
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-gpu', '--force-color-profile=srgb'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  page.on('pageerror', e => console.error('pageerror:', e.message));
  await page.goto('file://' + path.resolve(__dirname, 'index.html'));
  await page.waitForFunction('window.READY || window.ERR', null, { timeout: 60000 });
  const err = await page.evaluate('window.ERR'); if (err) { console.error('INIT ERR', err); process.exit(1); }
  const t0 = Date.now();
  for (let f = a; f <= b; f += step) {
    const data = await page.evaluate((f) => { render(f / 30); return document.getElementById('c').toDataURL('image/jpeg', 0.96); }, f);
    fs.writeFileSync(path.join(out, 'f' + String(f).padStart(5, '0') + '.jpg'), Buffer.from(data.split(',')[1], 'base64'));
    if ((f - a) % 30 === 0) console.log('frame', f, ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
  await browser.close();
})();
