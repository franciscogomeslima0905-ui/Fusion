import { C } from './art'

/** Cenário (coordenadas do mundo: chão do treinador em y = 0, y negativo = para cima). */
export function Backdrop() {
  const bands = Array.from({ length: 24 }, (_, i) => i)
  const boards = Array.from({ length: 22 }, (_, i) => i - 11)
  return (
    <g aria-hidden="true">
      {/* parede de fundo */}
      <rect x="-4200" y="-1700" width="8400" height="1580" fill={C.wall} />
      {/* alambrado */}
      <g stroke="#1b2c44" strokeWidth="1.4" opacity="0.7">
        {Array.from({ length: 70 }, (_, i) => (
          <line key={`v${i}`} x1={-3500 + i * 100} y1={-820} x2={-3500 + i * 100} y2={-250} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`h${i}`} x1={-3500} y1={-800 + i * 100} x2={3500} y2={-800 + i * 100} />
        ))}
      </g>
      {/* faixa de placas publicitárias, sem marcas */}
      {boards.map((i) => (
        <g key={i}>
          <rect x={i * 300} y={-250} width={300} height={130} fill={i % 2 ? C.navy : '#06101c'} />
          <rect x={i * 300} y={-250} width={300} height={10} fill={C.blue} opacity={i % 2 ? 0.9 : 0.35} />
          {i % 2 ? <rect x={i * 300 + 40} y={-205} width={220} height={26} fill="#fff" opacity="0.12" /> : null}
        </g>
      ))}
      {/* refletores */}
      {[-1500, -560, 560, 1500].map((x) => (
        <g key={x}>
          <circle cx={x} cy={-1020} r="330" fill="url(#lamp-glow)" />
          <rect x={x - 6} y={-1000} width={12} height={760} fill="#0a1220" />
          <rect x={x - 78} y={-1085} width={156} height={66} fill="#0a1220" stroke="#1c2b42" strokeWidth="3" />
          {[-48, -16, 16, 48].map((dx) => (
            <circle key={dx} cx={x + dx} cy={-1052} r="11" fill="#eaf6ff" />
          ))}
        </g>
      ))}
      {/* grama sintética */}
      <rect x="-4200" y="-120" width="8400" height="2800" fill={C.turf} />
      {bands.map((i) => (
        <rect key={i} x="-4200" y={-120 + i * 96} width="8400" height="48" fill={C.turfDark} />
      ))}
      <g stroke={C.line} strokeWidth="5" opacity="0.85">
        <line x1="-4200" y1="-96" x2="4200" y2="-96" />
        <line x1="-1100" y1="-96" x2="-1100" y2="900" />
        <line x1="1100" y1="-96" x2="1100" y2="900" />
      </g>
      {/* sombra de luz no chão */}
      <ellipse cx="0" cy="40" rx="900" ry="120" fill="url(#floor-glow)" />
      <defs>
        <radialGradient id="lamp-glow">
          <stop offset="0" stopColor="#cfeaff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#cfeaff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="floor-glow">
          <stop offset="0" stopColor="#7fd0ff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#7fd0ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* adereços: bola e cones */}
      <g transform="translate(168 -4)">
        <ellipse cx="0" cy="22" rx="30" ry="6" fill="#000" opacity="0.35" />
        <circle cx="0" cy="-6" r="26" fill="#f6f8fa" stroke="#c9d1d9" strokeWidth="2" />
        <path d="M0-16 L9-9 L6 3 L-6 3 L-9-9 Z" fill="#11161c" />
        <path d="M-22-10 L-11-9 M22-10 L11-9 M-14 14 L-6 3 M14 14 L6 3" stroke="#11161c" strokeWidth="2.6" />
      </g>
      {[-260, 300, -820, 880].map((x, i) => (
        <g key={x} transform={`translate(${x} ${i < 2 ? 14 : -22}) scale(${i < 2 ? 1 : 0.8})`}>
          <ellipse cx="0" cy="8" rx="26" ry="6" fill="#000" opacity="0.3" />
          <path d="M-22 6 L-8 -46 L8 -46 L22 6 Z" fill="#ff7a1a" />
          <rect x="-24" y="2" width="48" height="8" rx="3" fill="#ff9a45" />
          <rect x="-12" y="-28" width="24" height="7" fill="#fff" opacity="0.85" />
        </g>
      ))}
    </g>
  )
}
