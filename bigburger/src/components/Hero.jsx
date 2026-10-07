import { motion, useTransform } from 'motion/react'
import StoryScene, { Frame, Chapter } from './StoryScene'
import Button from './Button'
import { img } from '../data/images'
import { generalOrderLink } from '../utils/whatsapp'

export default function Hero() {
  return (
    <StoryScene id="inicio" chapter="01" vh={260} label="Big Burger">
      {(p) => <HeroStage p={p} />}
    </StoryScene>
  )
}

function HeroStage({ p }) {
  const titleY = useTransform(p, [0, 1], ['0%', '-34%'])
  const titleScale = useTransform(p, [0, 1], [1, 0.82])
  const titleOpacity = useTransform(p, [0, 0.55, 0.85], [1, 1, 0])
  const photoScale = useTransform(p, [0, 1], [1, 1.22])
  const photoY = useTransform(p, [0, 1], ['4%', '-8%'])
  const clip = useTransform(p, [0, 0.45], ['inset(14% 10% 14% 10%)', 'inset(0% 0% 0% 0%)'])
  const glow = useTransform(p, [0, 1], [0.25, 0.7])
  const copyY = useTransform(p, [0, 0.4], ['0%', '-40%'])
  const copyOpacity = useTransform(p, [0, 0.3], [1, 0])
  const hint = useTransform(p, [0, 0.12], [1, 0])

  return (
    <div className="relative h-full w-full bg-ink">
      <motion.div
        aria-hidden
        style={{ opacity: glow }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_58%,rgba(244,181,28,.28),transparent_70%)]"
      />
      <Frame />

      <motion.h1
        style={{ y: titleY, scale: titleScale, opacity: titleOpacity }}
        data-rm-static
        className="display absolute inset-x-0 top-[17svh] z-0 text-center text-[31vw] leading-[.8] sm:top-[13svh] sm:text-[17.5vw] sm:leading-[.85]"
      >
        <span className="block sm:inline">Big</span> <span className="block text-red sm:inline">Burger</span>
      </motion.h1>

      <motion.div
        data-rm-static
        style={{ y: photoY, scale: photoScale, clipPath: clip }}
        className="absolute left-1/2 top-[58%] z-10 aspect-[618/432] w-[88vw] max-w-[640px] -translate-x-1/2 -translate-y-1/2 sm:top-[60%] sm:w-[46vw]"
      >
        <img
          src={img.xis.src}
          width={img.xis.w}
          height={img.xis.h}
          alt={img.xis.alt}
          fetchPriority="high"
          className="photo-grade h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
      </motion.div>

      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="absolute inset-x-5 bottom-[7svh] z-20 flex flex-col gap-5 sm:inset-x-12 sm:flex-row sm:items-end sm:justify-between"
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

      <motion.p style={{ opacity: hint }} className="mono absolute bottom-[3svh] left-1/2 z-20 hidden -translate-x-1/2 text-ash sm:block">
        Role para baixo
      </motion.p>
    </div>
  )
}
