// Gera as 9 camadas PLACEHOLDER do hambúrguer (ilustração vetorial → WebP com transparência).
//
// ⚠️  Estes arquivos NÃO são fotos reais do Aquele Hambúrguer. Eles existem para o efeito de
//     montagem funcionar de ponta a ponta. Para usar as fotos reais, coloque WebP/PNG recortados
//     (fundo transparente) com os MESMOS nomes em  src/assets/burger/  — eles têm prioridade
//     automática sobre os placeholders (veja src/components/BurgerAssembly/layers.ts).
//
// Uso: node scripts/generate-placeholder-layers.mjs
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const OUT = new URL('../src/assets/burger/placeholder/', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })

let seed = 7
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const W = 600

const noise = (id, f = 0.9, a = 0.22) => `
  <filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="${f}" numOctaves="3" seed="4" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${a * 2} -${a * 0.4}" result="m"/>
    <feComposite in="m" in2="SourceGraphic" operator="in" result="t"/>
    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="t"/></feMerge>
  </filter>`
const soft = (id, s) => `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${s}"/></filter>`
const shadow = `<filter id="drop" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#000" flood-opacity=".45"/></filter>`

// borda ondulada e orgânica ao redor de uma elipse/retângulo
function wobbly(cx, cy, rx, ry, n, amp) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2
    const k = 1 + (rnd() - 0.5) * amp
    pts.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k])
  }
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d + ' Z'
}

const layers = {}

// 1 — pão superior
{
  const H = 240
  let seeds = ''
  for (let i = 0; i < 34; i++) {
    const x = 110 + rnd() * 380, y = 36 + rnd() * 90
    const edge = Math.abs(x - 300) / 190
    if (y > 40 + (1 - edge * edge) * 40 + 30 && edge > 0.85) continue
    seeds += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="9" ry="4.6" transform="rotate(${(rnd() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#F7E3B2"/><ellipse cx="${x.toFixed(1)}" cy="${(y + 1.6).toFixed(1)}" rx="8" ry="3" transform="rotate(${(rnd() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#B9852F" opacity=".35"/>`
  }
  layers['top-bun'] = [W, H, `
    <defs>${noise('nz', 0.8, 0.28)}${soft('b1', 14)}${soft('b2', 6)}${shadow}
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6BE6B"/><stop offset=".45" stop-color="#DE8A2E"/><stop offset=".85" stop-color="#A9551A"/><stop offset="1" stop-color="#7C3B10"/></linearGradient>
      <radialGradient id="rg" cx=".3" cy=".25" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <clipPath id="c"><path d="M 28 208 C 14 96 120 14 300 14 C 480 14 586 96 572 208 C 570 224 556 230 538 230 L 62 230 C 44 230 30 224 28 208 Z"/></clipPath>
    </defs>
    <g filter="url(#drop)"><path filter="url(#nz)" fill="url(#g)" d="M 28 208 C 14 96 120 14 300 14 C 480 14 586 96 572 208 C 570 224 556 230 538 230 L 62 230 C 44 230 30 224 28 208 Z"/></g>
    <g clip-path="url(#c)">
      <ellipse cx="190" cy="70" rx="150" ry="46" fill="#fff" opacity=".42" filter="url(#b1)" transform="rotate(-14 190 70)"/>
      <ellipse cx="205" cy="52" rx="62" ry="12" fill="#fff" opacity=".55" filter="url(#b2)" transform="rotate(-16 205 52)"/>
      <rect x="0" y="176" width="600" height="60" fill="#3a1604" opacity=".38" filter="url(#b1)"/>
      <path d="M 30 215 Q 300 188 570 215 L 570 240 L 30 240 Z" fill="#5a2608" opacity=".55"/>
      ${seeds}
    </g>`]
}

// 2 — molho superior
{
  const H = 70
  layers['sauce-top'] = [W, H, `
    <defs>${soft('b', 3)}${shadow}
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF4D6"/><stop offset="1" stop-color="#E7C88A"/></linearGradient></defs>
    <g filter="url(#drop)"><path fill="url(#g)" d="M 52 30 C 90 12 150 22 210 18 C 290 10 360 24 430 16 C 490 10 540 20 552 36 C 560 50 520 56 490 54 C 470 66 440 58 420 54 C 380 62 340 52 300 56 C 260 62 230 54 190 56 C 150 62 120 54 90 52 C 60 54 44 44 52 30 Z"/></g>
    <ellipse cx="190" cy="26" rx="120" ry="5" fill="#fff" opacity=".7" filter="url(#b)"/>`]
}

// 3 — cebola
{
  const H = 84
  let rings = ''
  ;[[130, 46, 78], [235, 40, 84], [345, 46, 90], [450, 40, 80], [525, 44, 62]].forEach(([x, y, r], i) => {
    rings += `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.26}" fill="none" stroke="#B2487F" stroke-width="9"/>
    <ellipse cx="${x}" cy="${y}" rx="${r - 10}" ry="${(r - 10) * 0.26}" fill="none" stroke="#F4E3EF" stroke-width="7"/>
    <ellipse cx="${x}" cy="${y}" rx="${r - 19}" ry="${(r - 19) * 0.26}" fill="none" stroke="#C86B9C" stroke-width="3" opacity=".8"/>`
  })
  layers['onion'] = [W, H, `<defs>${shadow}</defs><g filter="url(#drop)">${rings}</g>`]
}

// 4 — tomate
{
  const H = 84
  const slice = (cx, cy, rx) => `
    <ellipse cx="${cx}" cy="${cy + 5}" rx="${rx}" ry="${rx * 0.25}" fill="#8E1B12"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.25}" fill="url(#t)"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.8}" ry="${rx * 0.19}" fill="#F4624A" opacity=".75"/>
    ${[...Array(7)].map((_, i) => `<ellipse cx="${cx - rx * 0.6 + i * rx * 0.2}" cy="${cy + (i % 2 ? 4 : -4)}" rx="6" ry="2.6" fill="#F8D9A0"/>`).join('')}`
  layers['tomato'] = [W, H, `<defs>${shadow}<radialGradient id="t" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#EE3F2B"/><stop offset="1" stop-color="#B3200F"/></radialGradient></defs>
    <g filter="url(#drop)">${slice(130, 42, 112)}${slice(300, 44, 120)}${slice(470, 42, 112)}</g>`]
}

// 5 — alface
{
  const H = 120
  const top = [], bot = []
  for (let i = 0; i <= 28; i++) {
    const x = 6 + (i / 28) * 588
    top.push([x, 40 + Math.sin(i * 1.7) * 14 + (rnd() - 0.5) * 12])
    bot.push([x, 80 + Math.sin(i * 1.3 + 1) * 14 + (rnd() - 0.5) * 12])
  }
  const line = pts => pts.map((p, i) => (i ? `L ${p[0].toFixed(1)} ${p[1].toFixed(1)}` : `M ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)).join(' ')
  const smooth = pts => { let d = `M ${pts[0][0]} ${pts[0][1]}`; for (let i = 1; i < pts.length; i++) { const p = pts[i - 1], q = pts[i]; d += ` Q ${p[0] + (q[0] - p[0]) / 2} ${p[1] - 14 * (i % 2 ? 1 : -1)} ${q[0]} ${q[1]}` } return d }
  const outline = smooth(top) + ' ' + smooth([...bot].reverse()).replace('M', 'L') + ' Z'
  let veins = ''
  for (let i = 0; i < 9; i++) { const x = 40 + i * 64 + rnd() * 20; veins += `<path d="M ${x} 84 Q ${x + 10} 62 ${x + 22} 44" stroke="#DDF2A0" stroke-width="2.4" fill="none" opacity=".7"/>` }
  layers['lettuce'] = [W, H, `
    <defs>${noise('nz', 0.6, 0.2)}${shadow}<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9E26A"/><stop offset=".5" stop-color="#78B833"/><stop offset="1" stop-color="#3F7E1A"/></linearGradient></defs>
    <g filter="url(#drop)"><path filter="url(#nz)" d="${outline}" fill="url(#g)" stroke="#9AD14A" stroke-width="3" stroke-linejoin="round"/></g>${veins}`]
}

// 6 — queijo
{
  const H = 100
  layers['cheese'] = [W, H, `
    <defs>${soft('b', 4)}${shadow}<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD23F"/><stop offset="1" stop-color="#F29A12"/></linearGradient></defs>
    <g filter="url(#drop)"><path fill="url(#g)" d="M 24 26 L 576 26 C 584 40 570 52 556 58 C 548 74 530 92 520 70 C 514 58 500 56 470 58 L 150 58 C 130 58 112 60 104 74 C 98 90 80 90 76 70 C 72 60 52 58 40 54 C 20 46 18 34 24 26 Z"/></g>
    <rect x="40" y="31" width="500" height="6" rx="3" fill="#fff" opacity=".55" filter="url(#b)"/>
    <path d="M 24 26 L 576 26" stroke="#FFEFA0" stroke-width="3" opacity=".7"/>`]
}

// 7 — carne
{
  const H = 150
  const edge = wobbly(300, 78, 285, 58, 26, 0.12)
  let spots = ''
  for (let i = 0; i < 70; i++) { const x = 40 + rnd() * 520, y = 40 + rnd() * 70; spots += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(2 + rnd() * 6).toFixed(1)}" ry="${(1.5 + rnd() * 3).toFixed(1)}" fill="${rnd() > 0.5 ? '#1c0a04' : '#8a4a28'}" opacity="${(0.3 + rnd() * 0.4).toFixed(2)}"/>` }
  layers['beef'] = [W, H, `
    <defs>${noise('nz', 0.55, 0.45)}${soft('b', 8)}${shadow}<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A4528"/><stop offset=".5" stop-color="#4A2314"/><stop offset="1" stop-color="#1E0C06"/></linearGradient>
      <clipPath id="c"><path d="${edge}"/></clipPath></defs>
    <g filter="url(#drop)"><path filter="url(#nz)" d="${edge}" fill="url(#g)"/></g>
    <g clip-path="url(#c)">${spots}<ellipse cx="230" cy="52" rx="170" ry="16" fill="#E9A878" opacity=".38" filter="url(#b)"/><rect x="0" y="108" width="600" height="50" fill="#000" opacity=".35" filter="url(#b)"/></g>`]
}

// 8 — molho inferior
{
  const H = 64
  layers['sauce-bottom'] = [W, H, `
    <defs>${soft('b', 3)}${shadow}<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0B15A"/><stop offset="1" stop-color="#C77A24"/></linearGradient></defs>
    <g filter="url(#drop)"><path fill="url(#g)" d="M 70 28 C 120 12 180 24 250 18 C 330 10 400 24 470 16 C 520 12 548 26 540 38 C 530 52 490 50 470 50 C 440 60 420 50 380 52 C 330 58 290 50 240 54 C 190 60 150 50 110 52 C 70 54 56 40 70 28 Z"/></g>
    <ellipse cx="220" cy="24" rx="110" ry="4" fill="#fff" opacity=".5" filter="url(#b)"/>`]
}

// 9 — pão inferior
{
  const H = 170
  layers['bottom-bun'] = [W, H, `
    <defs>${noise('nz', 0.8, 0.28)}${soft('b1', 12)}${shadow}
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2AE5C"/><stop offset=".5" stop-color="#D9822B"/><stop offset="1" stop-color="#9A4C16"/></linearGradient>
      <clipPath id="c"><path d="M 34 22 C 150 8 450 8 566 22 C 584 40 580 96 562 128 C 548 150 520 156 490 156 L 110 156 C 80 156 52 150 38 128 C 20 96 16 40 34 22 Z"/></clipPath></defs>
    <g filter="url(#drop)"><path filter="url(#nz)" fill="url(#g)" d="M 34 22 C 150 8 450 8 566 22 C 584 40 580 96 562 128 C 548 150 520 156 490 156 L 110 156 C 80 156 52 150 38 128 C 20 96 16 40 34 22 Z"/></g>
    <g clip-path="url(#c)"><rect x="0" y="18" width="600" height="30" fill="#3a1604" opacity=".5" filter="url(#b1)"/><ellipse cx="170" cy="70" rx="130" ry="22" fill="#fff" opacity=".3" filter="url(#b1)"/><rect x="0" y="128" width="600" height="40" fill="#2a1004" opacity=".4" filter="url(#b1)"/></g>`]
}

for (const [name, [w, h, body]] of Object.entries(layers)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * 2}" height="${h * 2}" viewBox="0 0 ${w} ${h}">${body}</svg>`
  await sharp(Buffer.from(svg)).webp({ quality: 90, alphaQuality: 100 }).toFile(OUT + name + '.webp')
  console.log('✓', name, `${w}x${h}`)
}
