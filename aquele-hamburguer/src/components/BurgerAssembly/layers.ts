// Camadas REAIS do hambúrguer, de CIMA para BAIXO, lidas de src/assets/burger/manifest.json.
//
// As camadas foram recortadas de uma fotografia de hambúrguer (scripts/slice-burger/): cada ingrediente é
// um WebP com transparência. Para trocar por outro hambúrguer, regenere as camadas (veja o README) ou
// substitua os arquivos mantendo os nomes e atualizando o manifest.json.
//   x, y, w, h  → posição/tamanho no hambúrguer montado, em unidades onde a largura total = 600
//   z           → ordem de empilhamento (maior = mais à frente)
//   cy          → centro vertical da camada montada

import manifest from '../../assets/burger/manifest.json'

const images = import.meta.glob('/src/assets/burger/*.{webp,png,avif}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

export interface BurgerLayer {
  id: string
  label: string
  index: number
  x: number
  y: number
  w: number
  h: number
  z: number
  cy: number
  src: string
}

const LABELS: Record<string, string> = {
  'top-bun': 'Pão superior',
  'sauce-top': 'Molho',
  lettuce: 'Alface',
  onion: 'Cebola',
  tomato: 'Tomate',
  cheese: 'Queijo',
  beef: 'Carne',
  'bottom-bun': 'Pão inferior',
}

function resolve(id: string): string {
  for (const ext of ['webp', 'png', 'avif']) {
    const hit = images[`/src/assets/burger/${id}.${ext}`]
    if (hit) return hit
  }
  throw new Error(`Camada do hambúrguer ausente: src/assets/burger/${id}.webp`)
}

export const layers: BurgerLayer[] = manifest.layers.map((l, index) => ({
  ...l,
  index,
  label: LABELS[l.id] ?? l.id,
  src: resolve(l.id),
}))

/** Altura do hambúrguer montado (largura = 600) */
export const ASSEMBLED_H = manifest.assembledH

/** Deslocamento vertical da vista explodida (unidades de 600). `gap` = respiro extra entre camadas. */
export const explodedOffset = (l: BurgerLayer, gap: number) => (l.index - (layers.length - 1) / 2) * gap
