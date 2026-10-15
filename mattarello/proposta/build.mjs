// Gera o PDF da proposta (uma página).
// Uso: node build.mjs   (requer Playwright e o Chromium instalados)
import { chromium } from 'playwright'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const proposta = pathToFileURL(path.join(here, 'proposta.html')).href

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH })

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
