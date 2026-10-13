import { Board } from './Board'
import { C } from './art'

/** Treinador (~30 anos): casaco preto com detalhes azuis, calça preta e prancheta. Pés em (0,0). */
function Arm({ id }: { id: 'w' | 'h' }) {
  return (
    <g data-arm={id}>
      <polygon data-a="up" fill={C.jacket} />
      <polygon data-a="up-stripe" fill={C.blue} />
      <circle data-a="elbow" r="20" fill={C.jacket} />
      <polygon data-a="fore" fill={C.jacket} />
      <polygon data-a="fore-stripe" fill={C.blue} />
      <polygon data-a="cuff" fill={C.blue} />
      {id === 'w' && (
        <g data-hand>
          {/* palma e dedos — a pose (aberta / pinça / apontar) é interpolada pela coreografia */}
          <g strokeLinecap="round" fill="none">
            {['thumb', 'index', 'middle', 'ring', 'pinky'].map((f) => (
              <line key={f} data-finger-o={f} stroke={C.skinCoachShade} strokeWidth="9.5" />
            ))}
            <ellipse cx="15" cy="0" rx="17" ry="13.5" fill={C.skinCoachShade} stroke="none" />
            {['thumb', 'index', 'middle', 'ring', 'pinky'].map((f) => (
              <line key={f} data-finger={f} stroke={C.skinCoach} strokeWidth="7" />
            ))}
            <ellipse cx="15" cy="0" rx="15" ry="11.8" fill={C.skinCoach} stroke="none" />
          </g>
        </g>
      )}
    </g>
  )
}

export function Coach() {
  return (
    <g data-coach>
      <ellipse cx="0" cy="6" rx="130" ry="15" fill="#000" opacity="0.38" />

      {/* pernas e tênis */}
      <g>
        <path d="M-64,-242 L-6,-242 L-14,-30 L-66,-30 Z" fill={C.pants} />
        <path d="M6,-242 L64,-242 L68,-30 L16,-30 Z" fill={C.pants} />
        <path d="M-6,-242 L6,-242 L2,-30 L-14,-30 Z" fill="#06090c" />
        <path d="M-64,-242 L-66,-30 M64,-242 L68,-30" stroke="#232d39" strokeWidth="3" fill="none" />
        {[
          { x: -42, f: -1 },
          { x: 42, f: 1 },
        ].map(({ x, f }) => (
          <g key={x} transform={`translate(${x} 0) scale(${f} 1)`}>
            <path d="M-26,-32 L26,-32 L28,-12 Q58,-10 62,-2 L-30,-2 Z" fill="#10151b" transform="scale(1 1)" />
            <path d="M-30,-6 L64,-6 L64,0 L-30,0 Z" fill="#eef2f5" />
            <path d="M-26,-22 L14,-22" stroke={C.blue} strokeWidth="5" strokeLinecap="round" />
          </g>
        ))}
      </g>

      {/* tronco: casaco preto com recortes azuis */}
      <g data-torso>
        <path d="M-90,-396 C-60,-410 60,-410 90,-396 L100,-236 C60,-224 -60,-224 -100,-236 Z" fill={C.jacket} />
        <path d="M-90,-396 C-60,-410 60,-410 90,-396 L92,-370 C60,-384 -60,-384 -92,-370 Z" fill={C.jacketHi} />
        <path d="M-74,-384 L-86,-244 M74,-384 L86,-244" stroke={C.blue} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M-100,-236 C-60,-224 60,-224 100,-236" stroke={C.blue} strokeWidth="6" fill="none" strokeLinecap="round" />
        <line x1="0" y1="-402" x2="0" y2="-228" stroke="#2c3744" strokeWidth="3" />
        {/* pescoço, gola, cordão */}
        <path d="M-17,-440 L17,-440 L20,-408 L-20,-408 Z" fill={C.skinCoach} />
        <path d="M-17,-428 Q0,-418 17,-428 L18,-410 L-18,-410 Z" fill={C.skinCoachShade} opacity="0.55" />
        <path d="M-40,-408 L-26,-432 L-12,-426 Q0,-420 12,-426 L26,-432 L40,-408 L20,-396 L-20,-396 Z" fill={C.jacketHi} />
        <path d="M-26,-432 L-12,-426 Q0,-420 12,-426 L26,-432" stroke={C.blue} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M-17,-424 L0,-330 L17,-424" stroke={C.steel} strokeWidth="2.6" fill="none" />
        <circle cx="-54" cy="-362" r="11" fill="#fff" />
        <circle cx="-54" cy="-362" r="8" fill={C.navy} />
        <circle cx="-54" cy="-362" r="3.4" fill={C.blue} />
      </g>

      {/* braço que segura a prancheta */}
      <Arm id="h" />

      <Board />

      {/* braço que movimenta as peças (à frente da prancheta) */}
      <Arm id="w" />

      {/* cabeça: olhando a prancheta */}
      <g data-head>
        <ellipse cx="-37" cy="-446" rx="7" ry="10" fill={C.skinCoachShade} />
        <ellipse cx="37" cy="-446" rx="7" ry="10" fill={C.skinCoachShade} />
        <ellipse cx="0" cy="-448" rx="37" ry="44" fill={C.skinCoach} />
        <path d="M-37,-440 Q-30,-412 0,-404 Q30,-412 37,-440 Q30,-418 0,-414 Q-30,-418 -37,-440 Z" fill={C.skinCoachShade} opacity="0.5" />
        {/* barba curta */}
        <path d="M-35,-440 Q-34,-410 0,-402 Q34,-410 35,-440 Q28,-424 0,-420 Q-28,-424 -35,-440 Z" fill="#5a3b25" opacity="0.5" />
        {/* cabelo */}
        <path d="M-41,-452 C-48,-500 -8,-516 28,-506 C54,-498 48,-470 42,-450 C38,-466 24,-478 6,-478 C-12,-478 -32,-470 -41,-452 Z" fill={C.hairCoach} />
        <path d="M-41,-452 C-44,-462 -42,-470 -36,-476 L-38,-452 Z" fill={C.hairCoach} />
        <path d="M10,-478 C26,-476 38,-468 42,-450" stroke="#523620" strokeWidth="4" fill="none" />
        {/* sobrancelhas, olhos (olhando para baixo), nariz, boca */}
        <path d="M-26,-462 Q-16,-467 -6,-462 M6,-462 Q16,-467 26,-462" stroke={C.hairCoach} strokeWidth="4.4" fill="none" strokeLinecap="round" />
        <g data-eyes>
          <ellipse cx="-16" cy="-451" rx="7" ry="4.6" fill="#fff" />
          <ellipse cx="16" cy="-451" rx="7" ry="4.6" fill="#fff" />
          <circle cx="-16" cy="-449" r="3.1" fill="#2a1a10" />
          <circle cx="16" cy="-449" r="3.1" fill="#2a1a10" />
          <path d="M-24,-453 Q-16,-458 -8,-453 M8,-453 Q16,-458 24,-453" stroke="#7d5237" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
        <path d="M0,-448 L-5,-433 Q0,-429 6,-433" stroke="#b9805c" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M-11,-419 Q0,-413 11,-419" stroke="#7a3f30" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    </g>
  )
}
