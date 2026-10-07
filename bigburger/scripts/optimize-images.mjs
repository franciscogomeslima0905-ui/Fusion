// Otimiza fotos novas: coloque os originais em  originals/<pasta>/*.jpg|png|webp
// (pastas: products, menu, gallery, restaurant, branding) e rode  npm run images
// Gera /public/images/<pasta>/<nome>.webp e .avif, com no máximo 1800px de largura.
import { readdir, mkdir } from 'node:fs/promises'
import { join, parse } from 'node:path'
import sharp from 'sharp'

const src = 'originals'
const out = 'public/images'
for (const dir of await readdir(src).catch(() => [])) {
  await mkdir(join(out, dir), { recursive: true })
  for (const f of await readdir(join(src, dir))) {
    if (!/\.(jpe?g|png|webp)$/i.test(f)) continue
    const img = sharp(join(src, dir, f)).rotate().resize({ width: 1800, withoutEnlargement: true })
    const name = parse(f).name
    await img.clone().webp({ quality: 82 }).toFile(join(out, dir, `${name}.webp`))
    await img.clone().avif({ quality: 55 }).toFile(join(out, dir, `${name}.avif`))
    console.log('ok', dir, name)
  }
}
