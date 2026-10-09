import { pieces } from './tactics'

/**
 * Prancheta tática vetorial: campo, linhas brancas e peças azuis.
 * As peças e rastros são animados pela timeline da abertura (data-piece / data-trail / data-zone).
 */
export function TacticalBoard({ className = '' }: { className?: string }) {
  const line = { stroke: '#fff', strokeWidth: 3, fill: 'none', strokeLinecap: 'square' as const }
  return (
    <svg viewBox="0 0 600 800" className={className} role="img" aria-label="Prancheta tática com peças azuis posicionadas no campo">
      <defs>
        <pattern id="grass" width="600" height="124" patternUnits="userSpaceOnUse">
          <rect width="600" height="62" fill="#1d6a3d" />
          <rect y="62" width="600" height="62" fill="#1a6038" />
        </pattern>
      </defs>
      {/* moldura da prancheta */}
      <rect width="600" height="800" fill="#0c1015" />
      <rect x="2" y="2" width="596" height="796" fill="none" stroke="#2a323c" strokeWidth="4" />
      <rect x="26" y="26" width="548" height="748" fill="url(#grass)" />
      {/* linhas do campo */}
      <g {...line}>
        <rect x="46" y="46" width="508" height="708" />
        <path d="M46 400H554" />
        <circle cx="300" cy="400" r="68" />
        <rect x="156" y="46" width="288" height="128" />
        <rect x="226" y="46" width="148" height="52" />
        <path d="M244 174a62 62 0 0 0 112 0" />
        <rect x="156" y="626" width="288" height="128" />
        <rect x="226" y="702" width="148" height="52" />
        <path d="M244 626a62 62 0 0 1 112 0" />
      </g>
      <circle cx="300" cy="400" r="5" fill="#fff" />

      {/* zona destacada pela explicação */}
      <ellipse data-zone cx="372" cy="228" rx="120" ry="84" fill="#009FE3" fillOpacity="0.22" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" strokeDasharray="8 8" opacity="0" />

      {/* rastros das jogadas */}
      {pieces
        .filter((p) => p.from[0] !== p.to[0] || p.from[1] !== p.to[1])
        .map((p) => {
          const len = Math.hypot(p.to[0] - p.from[0], p.to[1] - p.from[1])
          return (
            <line
              key={p.id}
              data-trail={p.id}
              data-len={len}
              x1={p.from[0]}
              y1={p.from[1]}
              x2={p.to[0]}
              y2={p.to[1]}
              stroke="#fff"
              strokeOpacity="0.85"
              strokeWidth="3"
              strokeDasharray="10 9"
              strokeLinecap="round"
            />
          )
        })}

      {/* peças magnéticas azuis */}
      {pieces.map((p) => (
        <g key={p.id} data-piece={p.id} transform={`translate(${p.from[0]} ${p.from[1]})`}>
          <ellipse cx="3" cy="7" rx="25" ry="22" fill="#000" fillOpacity="0.35" />
          <circle r="25" fill="#009FE3" stroke="#fff" strokeWidth="4" />
          <text textAnchor="middle" dy="0.36em" fontFamily="Anton, Impact, sans-serif" fontSize="24" fill="#fff">
            {p.id}
          </text>
        </g>
      ))}
    </svg>
  )
}
