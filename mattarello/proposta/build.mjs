// Gera as capturas da landing page e o PDF da proposta.
// Uso: node build.mjs   (requer Playwright e o Chromium instalados)
import { chromium } from 'playwright'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const site = pathToFileURL(path.join(here, '..', 'mattarello-unico.html')).href
const proposta = pathToFileURL(path.join(here, 'proposta.html')).href

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH })

// capturas do site
const d = await browser.newPage({ viewport: { width: 1440, height: 860 }, deviceScaleFactor: 1.5 })
await d.goto(site)
await d.waitForTimeout(2200)
await d.screenshot({ path: path.join(here, 'assets/desktop.jpg'), type: 'jpeg', quality: 88 })

const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await m.goto(site)
await m.waitForTimeout(2200)
await m.screenshot({ path: path.join(here, 'assets/mobile.jpg'), type: 'jpeg', quality: 88 })

// PDF
const p = await browser.newPage()
await p.goto(proposta)
await p.evaluate(() => document.fonts.ready)
await p.waitForTimeout(500)
await p.pdf({
  path: path.join(here, 'Proposta-Mattarello-Gourmet.pdf'),
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
})
await browser.close()
console.log('ok')
