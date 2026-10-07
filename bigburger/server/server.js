// Servidor estático mínimo (sem dependências) para servir /dist em produção.
import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist')
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain',
}

http
  .createServer(async (req, res) => {
    try {
      const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '')
      let file = join(root, path)
      if (!file.startsWith(root)) throw new Error('forbidden')
      if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, 'index.html')
      const data = await readFile(file).catch(() => readFile(join(root, 'index.html')))
      const ext = extname(file)
      res.writeHead(200, {
        'Content-Type': types[ext] ?? 'text/html; charset=utf-8',
        'Cache-Control': file.includes('/assets/') || /\.(webp|avif|woff2?)$/.test(ext) ? 'public, max-age=31536000, immutable' : 'no-cache',
      })
      res.end(data)
    } catch {
      res.writeHead(404).end('Not found')
    }
  })
  .listen(process.env.PORT || 3000, () => console.log(`Big Burger em http://localhost:${process.env.PORT || 3000}`))
