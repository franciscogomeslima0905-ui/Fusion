import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

// Servidor estático mínimo (sem dependências) para publicar a pasta dist/.
const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist')
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json',
}

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '')
  try {
    const file = await readFile(join(root, path === '/' ? 'index.html' : path))
    res.writeHead(200, {
      'content-type': types[extname(path)] ?? 'application/octet-stream',
      'cache-control': path.startsWith('/assets/') || path.startsWith('/media/hero/frames') ? 'public, max-age=31536000, immutable' : 'no-cache',
    })
    res.end(file)
  } catch {
    // arquivo inexistente: devolve a página (o manifest.json ausente vira "cena provisória")
    res.writeHead(200, { 'content-type': types['.html'], 'cache-control': 'no-cache' })
    res.end(await readFile(join(root, 'index.html')))
  }
}).listen(process.env.PORT ?? 3000, () => console.log(`Escola Grêmio no ar em http://localhost:${process.env.PORT ?? 3000}`))
