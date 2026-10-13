/** Prancheta (coordenadas locais, origem no centro; campo útil ≈ ±100 × ±60). */
export type BoardPiece = { id: number; from: [number, number]; to: [number, number] }

export const BOARD = { x: -5, y: -262, rot: -4, w: 250, h: 172 }

export const boardPieces: BoardPiece[] = [
  { id: 1, from: [-100, 0], to: [-100, 0] },
  { id: 2, from: [-68, -44], to: [-68, -44] },
  { id: 3, from: [-68, 44], to: [-60, 30] },
  { id: 4, from: [-36, -6], to: [-8, -28] },
  { id: 5, from: [-20, 34], to: [-20, 34] },
  { id: 6, from: [-4, -30], to: [58, -44] },
  { id: 7, from: [20, 8], to: [84, -4] },
]

/** Região que o treinador aponta no fim da explicação. */
export const ZONE: [number, number] = [78, -20]

const R = (BOARD.rot * Math.PI) / 180
/** Converte ponto da prancheta (inclinada) para as coordenadas do treinador. */
export function boardToCoach(x: number, y: number): [number, number] {
  return [BOARD.x + x * Math.cos(R) - y * Math.sin(R), BOARD.y + x * Math.sin(R) + y * Math.cos(R)]
}
