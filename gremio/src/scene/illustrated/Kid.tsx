import { useId } from 'react'
import { C } from './art'

export type KidSpec = {
  x: number
  y: number
  s: number
  skin: string
  hair: string
  style: 'short' | 'curly' | 'ponytail' | 'braid' | 'long' | 'fringe'
  boot: string
  view?: 'front' | 'back'
  /** direção do olhar: -1 esquerda, 0 frente, 1 direita (rumo ao treinador) */
  gaze?: -1 | 0 | 1
  /** pose dos braços */
  pose: 'down' | 'hips' | 'behind' | 'point' | 'chin'
  number?: number
  /** lado do braço que aponta quando pose = point (1 = braço do lado direito da tela) */
  pointSide?: 1 | -1
}

const BANDS = [C.blue, '#0b0e12', '#ffffff', '#0b0e12']

function Hair({ style, hair, back }: { style: KidSpec['style']; hair: string; back: boolean }) {
  const cap = back
    ? 'M-29,-318 C-34,-362 -10,-376 0,-376 C10,-376 34,-362 29,-318 C26,-300 18,-292 0,-292 C-18,-292 -26,-300 -29,-318 Z'
    : 'M-29,-322 C-34,-366 -8,-376 4,-376 C20,-376 36,-364 29,-322 C26,-340 14,-348 0,-348 C-14,-348 -24,-340 -29,-322 Z'
  return (
    <g fill={hair}>
      <path d={cap} />
      {style === 'curly' &&
        [-24, -12, 0, 12, 24].map((x, i) => <circle key={x} cx={x} cy={-352 - (i % 2 ? 2 : 6)} r="11" />)}
      {style === 'ponytail' && (
        <g>
          <circle cx={back ? 0 : 27} cy={back ? -332 : -352} r="5" fill="#fff" />
          <path d={back ? 'M-7,-330 C-16,-300 -8,-262 0,-244 C8,-262 16,-300 7,-330 Z' : 'M28,-352 C46,-346 52,-318 44,-296 C38,-312 32,-330 24,-340 Z'} />
        </g>
      )}
      {style === 'braid' && (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse key={i} cx={back ? 0 : 33 + i * 1.2} cy={back ? -312 + i * 14 : -330 + i * 15} rx="6.5" ry="8.5" />
          ))}
        </g>
      )}
      {style === 'long' && (
        <g>
          <path d="M-29,-330 C-40,-310 -38,-286 -30,-272 L-22,-296 Z" />
          <path d="M29,-330 C40,-310 38,-286 30,-272 L22,-296 Z" />
          {back && <path d="M-29,-318 L29,-318 L26,-262 L-26,-262 Z" />}
        </g>
      )}
      {style === 'fringe' && !back && <path d="M-27,-346 C-14,-340 8,-342 28,-350 L28,-336 C10,-330 -12,-330 -27,-336 Z" />}
    </g>
  )
}

function Face({ gaze, skin }: { gaze: number; skin: string }) {
  const sx = gaze * 3
  return (
    <g>
      <ellipse cx={-10 + sx * 0.4} cy="-322" rx="5.6" ry="4.4" fill="#fff" />
      <ellipse cx={10 + sx * 0.4} cy="-322" rx="5.6" ry="4.4" fill="#fff" />
      <circle cx={-10 + sx} cy="-322" r="2.9" fill="#22150e" />
      <circle cx={10 + sx} cy="-322" r="2.9" fill="#22150e" />
      <path d="M-17,-331 Q-10,-335 -4,-331 M4,-331 Q10,-335 17,-331" stroke="#2c1c12" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d={`M${sx * 0.5},-320 L${sx * 0.5 - 2.5},-309 Q${sx * 0.5},-306 ${sx * 0.5 + 3},-309`} stroke={skin} strokeWidth="2.4" fill="none" style={{ filter: 'brightness(0.78)' }} strokeLinecap="round" />
      <path d="M-8,-300 Q0,-294 8,-300" stroke="#7a3a2c" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <ellipse cx="-17" cy="-306" rx="5" ry="3" fill="#e0675c" opacity="0.28" />
      <ellipse cx="17" cy="-306" rx="5" ry="3" fill="#e0675c" opacity="0.28" />
    </g>
  )
}

/** Aluno (~11 anos) de uniforme tricolor. Pés em (0,0), ~350 de altura. */
export function Kid({ x, y, s, skin, hair, style, boot, view = 'front', gaze = 0, pose, number = 10, pointSide = 1 }: KidSpec) {
  const id = useId().replace(/:/g, '')
  const back = view === 'back'
  // ângulos (graus) de [braço esquerdo da tela, braço direito da tela]: [ombro, cotovelo]
  const arms: Record<KidSpec['pose'], [[number, number], [number, number]]> = {
    down: [[6, 4], [-6, -4]],
    hips: [[35, -85], [-35, 85]],
    behind: [[2, 2], [-2, -2]],
    chin: [[4, 4], [10, 150]],
    point: [[6, 4], [-6, -4]],
  }
  const [aL, aR] = arms[pose]
  const stripes = Array.from({ length: 8 }, (_, i) => -40 + i * 11)

  // braço que aponta para o treinador: ângulos final (a1: ombro, b1: cotovelo) animados pela coreografia
  const Arm = ({ side, a, point }: { side: -1 | 1; a: [number, number]; point?: boolean }) => {
    const pa = point ? { 'data-kid-arm': 'point', 'data-sx': side * 36, 'data-a0': a[0], 'data-b0': a[1], 'data-a1': side === 1 ? -96 : 96, 'data-b1': side === 1 ? -6 : 6 } : {}
    return (
      <g {...pa} transform={`translate(${side * 36} -284) rotate(${a[0]})`}>
        <rect x="-9" y="-4" width="18" height="56" rx="9" fill={skin} />
        <g data-fore transform={`translate(0 50) rotate(${a[1]})`}>
          <rect x="-8" y="-4" width="16" height="48" rx="8" fill={skin} />
          <circle cx="0" cy="46" r="9" fill={skin} />
        </g>
        <rect x="-13" y="-8" width="26" height="30" rx="8" fill={BANDS[0]} />
        <rect x="-13" y="14" width="26" height="6" fill="#fff" />
      </g>
    )
  }

  return (
    <g data-kid data-x={x} data-y={y} data-s={s} transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="4" rx="46" ry="9" fill="#000" opacity="0.34" />
      {/* tênis / chuteiras e meiões */}
      {[-17, 17].map((px) => (
        <g key={px}>
          <rect x={px - 11} y="-110" width="22" height="32" fill="#0b0e12" />
          <rect x={px - 11} y="-78" width="22" height="9" fill="#fff" />
          <rect x={px - 11} y="-69" width="22" height="58" fill={C.blue} />
          <path d={`M${px - 15},-14 L${px + 15},-14 L${px + 19},-4 Q${px + 30},-2 ${px + 28},3 L${px - 18},3 Z`} fill={boot} />
          <rect x={px - 18} y="1" width="46" height="3" fill="#fff" />
          <rect x={px - 9} y="-130" width="18" height="22" fill={skin} />
        </g>
      ))}
      {/* short */}
      <path d="M-37,-190 L37,-190 L41,-124 L3,-124 L0,-142 L-3,-124 L-41,-124 Z" fill="#0b0e12" />
      {/* braço de trás (lado esquerdo da tela) */}
      <Arm side={-1} a={aL} point={pose === 'point' && pointSide === -1} />
      {/* camisa listrada */}
      <clipPath id={`k${id}`}>
        <path d="M-36,-290 Q0,-300 36,-290 L40,-184 L-40,-184 Z" />
      </clipPath>
      <g clipPath={`url(#k${id})`}>
        <rect x="-44" y="-304" width="88" height="124" fill="#fff" />
        {stripes.map((sx, i) => (
          <rect key={sx} x={sx} y="-304" width="11" height="124" fill={BANDS[i % 4]} />
        ))}
        <rect x="-44" y="-200" width="88" height="16" fill="#0b0e12" opacity="0.18" />
      </g>
      {back && (
        <text x="0" y="-232" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize="42" fill="#fff" stroke="#0b0e12" strokeWidth="2.6" paintOrder="stroke">
          {number}
        </text>
      )}
      {!back && <circle cx="-17" cy="-262" r="6" fill="#fff" stroke={C.navy} strokeWidth="2.6" />}
      {/* pescoço e cabeça */}
      <rect x="-9" y="-304" width="18" height="16" fill={skin} />
      <path d="M-14,-293 L0,-282 L14,-293 L10,-296 L0,-290 L-10,-296 Z" fill="#0b0e12" />
      <ellipse cx="-28" cy="-321" rx="5" ry="8" fill={skin} />
      <ellipse cx="28" cy="-321" rx="5" ry="8" fill={skin} />
      <ellipse cx="0" cy="-322" rx="27.5" ry="31" fill={skin} />
      {!back && <Face gaze={gaze} skin={skin} />}
      <Hair style={style} hair={hair} back={back} />
      {/* braço da frente (lado direito da tela) */}
      <Arm side={1} a={aR} point={pose === 'point' && pointSide === 1} />
    </g>
  )
}
