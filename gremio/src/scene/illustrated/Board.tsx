import { C } from './art'
import { BOARD, boardPieces } from './tactics'

/** Prancheta tática: moldura, campo, linhas brancas e peças azuis (animadas pela coreografia). */
export function Board() {
  const { w, h } = BOARD
  const hw = w / 2
  const hh = h / 2
  return (
    <g data-board transform={`translate(${BOARD.x} ${BOARD.y}) rotate(${BOARD.rot})`}>
      <rect x={-hw + 6} y={-hh + 10} width={w} height={h} rx="8" fill="#000" opacity="0.35" />
      <rect x={-hw} y={-hh} width={w} height={h} rx="8" fill="#0c1117" stroke="#34404d" strokeWidth="2.5" />
      <rect x={-hw + 10} y={-hh + 10} width={w - 20} height={h - 20} fill={C.turf} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={-hw + 10 + i * ((w - 20) / 8)} y={-hh + 10} width={(w - 20) / 16} height={h - 20} fill={C.turfDark} />
      ))}
      <g fill="none" stroke={C.line} strokeWidth="1.7">
        <rect x="-109" y="-70" width="218" height="140" />
        <line x1="0" y1="-70" x2="0" y2="70" />
        <circle r="20" />
        <rect x="-109" y="-32" width="40" height="64" />
        <rect x="-109" y="-14" width="16" height="28" />
        <rect x="69" y="-32" width="40" height="64" />
        <rect x="93" y="-14" width="16" height="28" />
      </g>
      <circle r="2.4" fill={C.line} />
      {/* grampo da prancheta */}
      <rect x="-30" y={-hh - 6} width="60" height="15" rx="3" fill="#11161c" stroke="#58626e" strokeWidth="2" />
      <rect x="-14" y={-hh - 2} width="28" height="5" rx="2" fill="#aeb7c1" />

      {/* região destacada */}
      <ellipse data-zone cx="78" cy="-20" rx="34" ry="28" fill={C.blue} fillOpacity="0.28" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.5" strokeDasharray="5 4" opacity="0" />

      {/* rastros */}
      {boardPieces
        .filter((p) => p.from[0] !== p.to[0] || p.from[1] !== p.to[1])
        .map((p) => (
          <line key={p.id} data-trail={p.id} x1={p.from[0]} y1={p.from[1]} x2={p.from[0]} y2={p.from[1]} stroke="#fff" strokeOpacity="0.8" strokeWidth="1.8" strokeDasharray="5 4" strokeLinecap="round" />
        ))}

      {/* peças azuis magnéticas */}
      {boardPieces.map((p) => (
        <g key={p.id} data-piece={p.id} transform={`translate(${p.from[0]} ${p.from[1]})`}>
          <ellipse data-piece-shadow cx="1.5" cy="3.5" rx="10" ry="8.5" fill="#000" opacity="0.4" />
          <g data-piece-body>
            <circle r="10" fill={C.blue} stroke="#fff" strokeWidth="2" />
            <text textAnchor="middle" dy="0.35em" fontFamily="Anton, Impact, sans-serif" fontSize="11" fill="#fff">
              {p.id}
            </text>
          </g>
        </g>
      ))}

      {/* mão que segura a prancheta: dedos por cima da borda direita */}
      <g data-hold-fingers stroke={C.skinCoachShade} strokeWidth="11.5" strokeLinecap="round">
        {[26, 40, 54].map((y) => (
          <line key={y} x1={hw + 8} y1={y} x2={hw - 12} y2={y - 3} />
        ))}
        <g stroke={C.skinCoach} strokeWidth="9">
          {[26, 40, 54].map((y) => (
            <line key={y} x1={hw + 8} y1={y} x2={hw - 12} y2={y - 3} />
          ))}
        </g>
      </g>
    </g>
  )
}
