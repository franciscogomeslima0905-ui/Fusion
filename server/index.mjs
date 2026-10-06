/**
 * Servidor Node.js de produção (sem dependências) para a pasta dist/.
 * - Arquivos com hash (assets/) recebem cache de 1 ano.
 * - Compressão gzip/brotli para texto.
 * - Cabeçalhos de segurança básicos.
 *
 * Uso: npm run build && npm start   (porta: variável PORT, padrão 3000)
 */
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createBrotliCompress, createGzip } from 'node:zlib'

const root = resolve(fileURLToPath(new URL('../dist', import.meta.url)))
const port = Number(process.env.PORT) || 3000

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.mp4': 'video/mp4',
}
const compressible = new Set(['.html', '.js', '.css', '.json', '.svg', '.webmanifest', '.txt'])

if (!existsSync(join(root, 'index.html'))) {
  console.error('dist/ não encontrado. Rode "npm run build" antes de "npm start".')
  process.exit(1)
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  let path = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '')
  let file = join(root, path)
  if (!file.startsWith(root)) {
    res.writeHead(403).end()
    return
  }
  if (!existsSync(file) || statSync(file).isDirectory()) {
    file = join(root, 'index.html') // fallback SPA
    path = 'index.html'
  }

  const ext = extname(file).toLowerCase()
  const headers = {
    'Content-Type': types[ext] ?? 'application/octet-stream',
    'Cache-Control': path.startsWith('assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN',
    Vary: 'Accept-Encoding',
  }

  const accept = String(req.headers['accept-encoding'] ?? '')
  let stream = createReadStream(file)
  if (compressible.has(ext) && /\bbr\b/.test(accept)) {
    headers['Content-Encoding'] = 'br'
    stream = stream.pipe(createBrotliCompress())
  } else if (compressible.has(ext) && /\bgzip\b/.test(accept)) {
    headers['Content-Encoding'] = 'gzip'
    stream = stream.pipe(createGzip())
  }
  res.writeHead(200, headers)
  if (req.method === 'HEAD') return res.end()
  stream.pipe(res)
}).listen(port, () => console.log(`Fusion Gym rodando em http://localhost:${port}`))
