import { motion, useTransform } from 'motion/react'
import StoryScene, { Frame, Chapter } from './StoryScene'
import Button from './Button'
import { generalOrderLink } from '../utils/whatsapp'
import meta from '../data/burger-layers.json'

export default function Hero() {
  return (
    <StoryScene id="inicio" chapter="01" vh={380} label="Big Burger">
      {(p) => <HeroStage p={p} />}
    </StoryScene>
  )
}

// Caixa que envolve o hambúrguer montado, em coordenadas da foto original (736×1104).
const BOX = { x: 43, y: 233, w: 655, h: 640 }

/**
 * Camadas do hambúrguer (recortadas da foto real). Começam desmontadas:
 * off = deslocamento vertical (em alturas do hambúrguer), dx = horizontal (em larguras),
 * rot = rotação inicial; range = trecho do scroll em que a camada se encaixa.
 */
const layers = [
  { n: 'base',   z: 1, off: 0.3,   dx: -0.04, rot: -6, range: [0.0, 0.46] },
  { n: 'carne',  z: 2, off: 0.12,  dx: 0.07,  rot: 4,  range: [0.06, 0.5] },
  { n: 'tomate', z: 3, off: -0.07, dx: -0.07, rot: -5, range: [0.1, 0.54] },
  { n: 'alface', z: 4, off: -0.24, dx: 0.06,  rot: 6,  range: [0.14, 0.58] },
  { n: 'topo',   z: 5, off: -0.4,  dx: -0.05, rot: -9, range: [0.18, 0.62] },
]
const alt = {
  base: 'Pão de baixo do hambúrguer',
  carne: 'Hambúrguer com queijo cheddar derretido',
  tomate: 'Tomate e cebola roxa',
  alface: 'Alface e molho',
  topo: 'Pão com gergelim',
}

function Layer({ p, def }) {
  const m = meta.layers[def.n]
  const [a, b] = def.range
  // 0 = desmontado, 1 = encaixado (curva suave)
  const t = useTransform(p, [a, b], [0, 1], { clamp: true, ease: (x) => x * x * (3 - 2 * x) })
  const y = useTransform(t, (v) => `calc(var(--bh) * ${(def.off * (1 - v)).toFixed(4)})`)
  const x = useTransform(t, (v) => `calc(var(--bh) * ${(def.dx * (1 - v)).toFixed(4)})`)
  const rotate = useTransform(t, (v) => def.rot * (1 - v))
  return (
    <motion.img
      data-rm-static
      src={`images/burger/layer_${def.n}.webp`}
      alt={alt[def.n]}
      width={m.w}
      height={m.h}
      draggable={false}
      fetchPriority="high"
      style={{
        position: 'absolute',
        left: `${((m.x - BOX.x) / BOX.w) * 100}%`,
        top: `${((m.y - BOX.y) / BOX.h) * 100}%`,
        width: `${(m.w / BOX.w) * 100}%`,
        height: `${(m.h / BOX.h) * 100}%`,
        zIndex: def.z,
        x, y, rotate,
        willChange: 'transform',
        filter: 'drop-shadow(0 18px 24px rgba(0,0,0,.55))',
      }}
    />
  )
}

function HeroStage({ p }) {
  const titleY = useTransform(p, [0, 0.62], ['0%', '-26%'])
  const titleScale = useTransform(p, [0, 0.62], [1, 0.86])
  const titleOpacity = useTransform(p, [0, 0.45, 0.7], [1, 1, 0.12])
  const glow = useTransform(p, [0, 0.6], [0.15, 0.85])
  const copyY = useTransform(p, [0, 0.2], ['0%', '-40%'])
  const copyOpacity = useTransform(p, [0, 0.16], [1, 0])
  const hint = useTransform(p, [0, 0.06], [1, 0])
  const closing = useTransform(p, [0.66, 0.8], [0, 1])
  const closingY = useTransform(p, [0.66, 0.8], [30, 0])
  // depois de montado, a câmera se aproxima
  const zoom = useTransform(p, [0.62, 1], [1, 1.32])
  const lift = useTransform(p, [0.62, 1], ['0%', '-4%'])

  return (
    <div className="relative h-full w-full bg-ink">
      <motion.div
        aria-hidden
        style={{ opacity: glow }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_48%_52%_at_50%_58%,rgba(244,181,28,.32),transparent_70%)]"
      />
      <Frame />

      <motion.h1
        style={{ y: titleY, scale: titleScale, opacity: titleOpacity }}
        data-rm-static
        className="display absolute inset-x-0 top-[14svh] z-0 text-center text-[31vw] leading-[.8] sm:top-[13svh] sm:text-[18vw] sm:leading-[.85]"
      >
        <span className="block sm:inline">Big</span> <span className="block text-red sm:inline">Burger</span>
      </motion.h1>

      <motion.div
        data-rm-static
        style={{ scale: zoom, y: lift, '--bh': 'min(50svh, 80vw)' }}
        className="absolute left-1/2 top-[51%] z-10 aspect-[655/640] h-[var(--bh)] -translate-x-1/2 -translate-y-1/2 sm:top-[57%]"
      >
        {layers.map((def) => <Layer key={def.n} p={p} def={def} />)}
      </motion.div>

      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="absolute inset-x-5 bottom-[6svh] z-20 flex flex-col gap-5 sm:inset-x-12 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="max-w-md">
          <Chapter n="01" className="mb-3">Big Burger</Chapter>
          <p className="cond text-xl font-medium leading-tight tracking-[.03em] text-bone sm:text-2xl">
            Xis, hambúrguer e comida bem servida no centro de Tramandaí.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href="#cardapio">Ver cardápio</Button>
          <Button href={generalOrderLink()} variant="line">Pedir agora</Button>
        </div>
      </motion.div>

      <motion.p
        style={{ opacity: closing, y: closingY }}
        className="display absolute inset-x-5 bottom-[7svh] z-20 text-[15vw] leading-none text-bone sm:inset-x-12 sm:text-[7vw]"
      >
        Muito <span className="text-red">sabor</span>
      </motion.p>

      <motion.p style={{ opacity: hint }} className="mono absolute bottom-[3svh] left-1/2 z-20 hidden -translate-x-1/2 text-ash sm:block">
        Role para baixo
      </motion.p>
    </div>
  )
}
