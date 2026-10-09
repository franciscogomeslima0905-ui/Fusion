/** Posições (viewBox 600×800) das peças azuis da prancheta: formação inicial → jogada. */
export type Piece = {
  id: number
  from: [number, number]
  to: [number, number]
  /** janela da movimentação dentro da fase 3 (0–1) */
  at: [number, number]
}

export const pieces: Piece[] = [
  { id: 1, from: [300, 722], to: [300, 722], at: [0, 0] },
  { id: 2, from: [150, 600], to: [128, 566], at: [0.56, 0.7] },
  { id: 3, from: [300, 620], to: [300, 604], at: [0.7, 0.8] },
  { id: 4, from: [450, 600], to: [478, 470], at: [0.5, 0.68] },
  { id: 5, from: [215, 470], to: [250, 392], at: [0.58, 0.76] },
  { id: 6, from: [385, 470], to: [410, 330], at: [0.08, 0.34] },
  { id: 7, from: [300, 340], to: [336, 186], at: [0.32, 0.56] },
]
