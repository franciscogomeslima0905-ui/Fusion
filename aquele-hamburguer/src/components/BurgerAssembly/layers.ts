// Camadas do hambúrguer, de CIMA para BAIXO.
//
// Cada camada é uma imagem com transparência cuja largura ocupa 100% do palco (canvas de 600 unidades
// de largura). Para usar as FOTOS REAIS: coloque os arquivos recortados em  src/assets/burger/
// com estes nomes (webp/png): top-bun, sauce-top, onion, tomato, lettuce, cheese, beef, sauce-bottom,
// bottom-bun. Eles passam a ser usados automaticamente no lugar dos placeholders
// (src/assets/burger/placeholder/, gerados por scripts/generate-placeholder-layers.mjs).
// Se a foto real tiver proporção diferente, ajuste `y` e `h` abaixo (unidades de 600px de largura).

const real = import.meta.glob('/src/assets/burger/*.{webp,png,avif}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const placeholders = import.meta.glob('/src/assets/burger/placeholder/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

export interface BurgerLayer {
  id: string
  label: string
  /** topo da imagem no burger montado (unidades de 600px de largura) */
  y: number
  /** altura da imagem (unidades de 600px) */
  h: number
  /** deslocamento vertical da vista explodida (negativo = acima) */
  off: number
  src: string
  placeholder: boolean
}

const defs = [
  { id: 'top-bun', label: 'Pão superior', y: 0, h: 240, off: -330 },
  { id: 'sauce-top', label: 'Molho', y: 190, h: 70, off: -265 },
  { id: 'onion', label: 'Cebola', y: 222, h: 84, off: -200 },
  { id: 'tomato', label: 'Tomate', y: 246, h: 84, off: -140 },
  { id: 'lettuce', label: 'Alface', y: 270, h: 120, off: -75 },
  { id: 'cheese', label: 'Queijo', y: 322, h: 100, off: -5 },
  { id: 'beef', label: 'Carne', y: 350, h: 150, off: 65 },
  { id: 'sauce-bottom', label: 'Molho', y: 440, h: 64, off: 150 },
  { id: 'bottom-bun', label: 'Pão inferior', y: 462, h: 170, off: 235 },
] as const

function resolve(id: string) {
  for (const ext of ['webp', 'png', 'avif']) {
    const hit = real[`/src/assets/burger/${id}.${ext}`]
    if (hit) return { src: hit, placeholder: false }
  }
  return { src: placeholders[`/src/assets/burger/placeholder/${id}.webp`], placeholder: true }
}

export const layers: BurgerLayer[] = defs.map(d => ({ ...d, ...resolve(d.id) }))

/** Altura total do burger montado em unidades de 600px */
export const ASSEMBLED_H = Math.max(...layers.map(l => l.y + l.h))

export const usingPlaceholders = layers.some(l => l.placeholder)
