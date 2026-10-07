// Embute em base64 as fotos referenciadas (images/...) no HTML de arquivo único.
import { readFile, writeFile } from 'node:fs/promises'
import { extname } from 'node:path'

const file = process.argv[2] ?? 'dist-single/index.html'
const mime = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.avif': 'image/avif' }
let html = await readFile(file, 'utf8')
const refs = [...new Set(html.match(/images\/[\w\-/]+\.(?:webp|png|jpg|avif)/g) ?? [])]
for (const ref of refs) {
  const data = await readFile(`public/${ref}`)
  html = html.replaceAll(ref, `data:${mime[extname(ref)]};base64,${data.toString('base64')}`)
}
await writeFile(file, html)
console.log(`${refs.length} imagens embutidas →`, file, `(${(html.length / 1048576).toFixed(1)} MB)`)
