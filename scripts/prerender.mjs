/**
 * Pré-renderiza a página (React no Node) e injeta o HTML no arquivo gerado pelo build.
 * Assim o conteúdo aparece mesmo onde o JavaScript não roda.
 *
 * Uso: node scripts/prerender.mjs <arquivo.html> [--inline]
 *   --inline  embute as imagens como data URI (para o build em arquivo único)
 */
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'

const [target, flag] = process.argv.slice(2)
if (!target) throw new Error('Informe o HTML de destino, ex.: dist/index.html')
const outDir = resolve('node_modules/.prerender')

await build({
  configFile: resolve('vite.config.ts'),
  logLevel: 'warn',
  build: {
    ssr: 'src/entry-server.tsx',
    outDir,
    emptyOutDir: true,
    assetsInlineLimit: flag === '--inline' ? Number.MAX_SAFE_INTEGER : undefined,
    rollupOptions: { output: { manualChunks: undefined } },
  },
  plugins: [
    {
      name: 'secoes-sincronas',
      enforce: 'pre',
      resolveId(source, importer) {
        if (source.endsWith('/sections/deferred') && importer) return resolve('src/sections/eager.ts')
      },
    },
  ],
  ssr: { noExternal: ['motion', 'framer-motion', 'motion-dom', 'motion-utils'] },
})

const { render } = await import(pathToFileURL(resolve(outDir, 'entry-server.js')).href)
let markup = await render()
// no arquivo único as imagens já estão embutidas: carregamento "lazy" só atrasaria a exibição
if (flag === '--inline') markup = markup.replaceAll(' loading="lazy"', '')
const file = resolve(target)
const html = readFileSync(file, 'utf8')
const slot = '<div id="root"></div>'
if (!html.includes(slot)) throw new Error(`"${slot}" não encontrado em ${target}`)
writeFileSync(file, html.replace(slot, `<div id="static">${markup}</div>${slot}`))
rmSync(outDir, { recursive: true, force: true })
console.log(`✓ pré-renderizado: ${target} (+${Math.round(markup.length / 1024)} kB de HTML)`)
