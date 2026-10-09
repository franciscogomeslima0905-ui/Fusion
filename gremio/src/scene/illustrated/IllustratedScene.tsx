import { Backdrop } from './Backdrop'
import { Coach } from './Coach'
import { Kid, type KidSpec } from './Kid'

/** Alunos em semicírculo ao redor do treinador. `compact` aproxima todos (celular, em retrato). */
function kids(compact: boolean): { back: KidSpec[]; front: KidSpec[] } {
  const k = compact ? 0.64 : 1
  const fy = compact ? 100 : 120
  const x = (v: number) => v * k
  const back: KidSpec[] = [
    { x: x(-470), y: -60, s: 0.92, skin: '#f0c9a4', hair: '#6b3f1d', style: 'braid', boot: '#ff4fa0', gaze: 1, pose: 'down' },
    { x: x(470), y: -60, s: 0.92, skin: '#f0c9a4', hair: '#d6b25e', style: 'fringe', boot: '#7dff4f', gaze: -1, pose: 'chin' },
    { x: x(-600), y: 0, s: 0.97, skin: '#a9744c', hair: '#17110d', style: 'curly', boot: '#ffd400', gaze: 1, pose: 'point', pointSide: 1 },
    { x: x(600), y: 0, s: 0.97, skin: '#8a5a38', hair: '#14100c', style: 'long', boot: '#ff4fa0', gaze: -1, pose: 'point', pointSide: -1 },
  ]
  const front: KidSpec[] = [
    { x: x(-740), y: 48, s: 1.02, skin: '#e2a97f', hair: '#1d130d', style: 'ponytail', boot: '#35d0ff', gaze: 1, pose: 'hips' },
    { x: x(740), y: 48, s: 1.0, skin: '#6f4529', hair: '#0f0c0a', style: 'short', boot: '#ffd400', gaze: -1, pose: 'behind' },
    { x: x(-520), y: fy, s: 1.15, skin: '#f0c9a4', hair: '#c9a24a', style: 'short', boot: '#ff6a1a', view: 'back', pose: 'down', number: 7 },
    { x: x(520), y: fy, s: 1.15, skin: '#e9b88f', hair: '#4a2f1e', style: 'ponytail', boot: '#35d0ff', view: 'back', pose: 'hips', number: 9 },
  ]
  // celular: seis alunos bastam e evitam sobreposição (os dois mais afastados saem)
  return { back, front: compact ? front.slice(2) : front }
}

/**
 * Cena ilustrada em vetor (SVG): treinador, prancheta com peças azuis e alunos.
 * A câmera, os braços (cinemática inversa), as peças e os alunos são animados por choreography.ts,
 * controlada pela rolagem.
 */
export function IllustratedScene({ compact }: { compact: boolean }) {
  const { back, front } = kids(compact)
  return (
    <svg
      data-scene
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="Ilustração: o treinador explica uma jogada na prancheta tática e, ao redor, os alunos prestam atenção"
    >
      <defs>
        <radialGradient id="vignette" cx="50%" cy="48%" r="75%">
          <stop offset="0.55" stopColor="#080a0d" stopOpacity="0" />
          <stop offset="1" stopColor="#080a0d" stopOpacity="0.62" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="#080a0d" />
      <g data-world>
        <Backdrop />
        {back.map((k, i) => (
          <Kid key={`b${i}`} {...k} />
        ))}
        <Coach />
        {front.map((k, i) => (
          <Kid key={`f${i}`} {...k} />
        ))}
      </g>
      <rect width="100%" height="100%" fill="url(#vignette)" pointerEvents="none" />
    </svg>
  )
}
