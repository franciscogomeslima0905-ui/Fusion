/** Paleta e utilidades da ilustração (Grêmio: azul, preto e branco). */
export const C = {
  ink: '#080a0d',
  navy: '#003b70',
  blue: '#009fe3',
  white: '#ffffff',
  steel: '#b8bec6',
  jacket: '#131920',
  jacketHi: '#222c37',
  pants: '#0d1116',
  turf: '#1b6a3c',
  turfDark: '#175f35',
  line: '#e9f2ec',
  wall: '#0b1522',
  skinCoach: '#e2ab84',
  skinCoachShade: '#c98e68',
  hairCoach: '#3b2615',
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const rad = (d: number) => (d * Math.PI) / 180

/** Cinemática inversa de dois ossos: devolve o cotovelo para ombro S e punho W. `side` escolhe a dobra. */
export function ik2(
  sx: number, sy: number, wx: number, wy: number, l1: number, l2: number, pick: (a: [number, number], b: [number, number]) => [number, number],
): { ex: number; ey: number; wx: number; wy: number } {
  let dx = wx - sx
  let dy = wy - sy
  let d = Math.hypot(dx, dy)
  const max = l1 + l2 - 0.5
  const min = Math.abs(l1 - l2) + 0.5
  if (d > max) { wx = sx + (dx / d) * max; wy = sy + (dy / d) * max; dx = wx - sx; dy = wy - sy; d = max }
  if (d < min) d = min
  const a = Math.atan2(dy, dx)
  const cosA = Math.min(1, Math.max(-1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)))
  const al = Math.acos(cosA)
  const e1: [number, number] = [sx + l1 * Math.cos(a + al), sy + l1 * Math.sin(a + al)]
  const e2: [number, number] = [sx + l1 * Math.cos(a - al), sy + l1 * Math.sin(a - al)]
  const [ex, ey] = pick(e1, e2)
  return { ex, ey, wx, wy }
}

/** Quadrilátero (pontos "x,y …") ao longo de A→B com larguras wa/wb, deslocado `off` na normal. */
export function quad(ax: number, ay: number, bx: number, by: number, wa: number, wb: number, off = 0): string {
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const p = (x: number, y: number, w: number, s: number) => `${(x + nx * (off + s * w / 2)).toFixed(2)},${(y + ny * (off + s * w / 2)).toFixed(2)}`
  return `${p(ax, ay, wa, -1)} ${p(bx, by, wb, -1)} ${p(bx, by, wb, 1)} ${p(ax, ay, wa, 1)}`
}
