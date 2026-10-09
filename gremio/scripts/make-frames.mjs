// Converte os vídeos da cena em arquivos prontos para public/media/hero (requer ffmpeg instalado).
//   npm run scene:frames -- caminho/da/filmagem-horizontal.mp4 caminho/da/filmagem-vertical.mp4
// Gera: frames-desktop/ (1280px), frames-mobile/ (720px), hero-desktop.mp4, hero-mobile.mp4 (todos keyframes) e poster.webp
import { spawnSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const [desktop, mobile] = process.argv.slice(2)
if (!desktop) {
  console.error('Uso: npm run scene:frames -- <video-horizontal.mp4> [video-vertical.mp4]')
  process.exit(1)
}
const out = join(import.meta.dirname, '..', 'public', 'media', 'hero')
const FRAMES = 150

const run = (args) => {
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' })
  if (r.error || r.status !== 0) {
    console.error('Falha ao executar o ffmpeg. Ele está instalado? (https://ffmpeg.org)')
    process.exit(1)
  }
}

function frames(input, label, width) {
  const dir = join(out, `frames-${label}`)
  mkdirSync(dir, { recursive: true })
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', input], { encoding: 'utf8' })
  const dur = parseFloat(probe.stdout)
  if (!dur) { console.error('Não foi possível ler a duração de', input); process.exit(1) }
  run(['-i', input, '-vf', `fps=${(FRAMES / dur).toFixed(5)},scale=${width}:-2`, '-frames:v', String(FRAMES), '-c:v', 'libwebp', '-quality', '82', join(dir, 'frame_%04d.webp')])
  // vídeo "só keyframes": permite rolar para trás/frente sem engasgar
  run(['-i', input, '-vf', `scale=${width}:-2`, '-an', '-c:v', 'libx264', '-g', '1', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(out, `hero-${label}.mp4`)])
  console.log(`✔ ${label}: ${FRAMES} frames + hero-${label}.mp4`)
}

frames(desktop, 'desktop', 1280)
if (mobile) frames(mobile, 'mobile', 720)
run(['-i', desktop, '-frames:v', '1', '-vf', 'scale=1280:-2', join(out, 'poster.webp')])
console.log('Agora edite public/media/hero/manifest.json: "enabled": true')
