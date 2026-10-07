import { motion, useTransform } from 'motion/react'
import StoryScene, { Frame, Chapter } from './StoryScene'
import Button from './Button'
import { img } from '../data/images'
import { generalOrderLink } from '../utils/whatsapp'

export default function Hero() {
  return (
    <StoryScene id="inicio" chapter="01" vh={380} label="Big Burger">
      {(p) => <HeroStage p={p} />}
    </StoryScene>
  )
}

/**
 * Como no vídeo: o hambúrguer fica no centro, o título atrás dele; ao rolar,
 * a câmera "mergulha" nas camadas (pão → molho → carne → queijo) enquanto o título some.
 */
function HeroStage({ p }) {
  const titleY = useTransform(p, [0, 0.5], ['0%', '-30%'])
  const titleScale = useTransform(p, [0, 0.5], [1, 0.84])
  const titleOpacity = useTransform(p, [0, 0.3, 0.55], [1, 1, 0])
  const scale = useTransform(p, [0, 0.35, 1], [0.92, 1.18, 2.15])
  const y = useTransform(p, [0, 0.35, 1], ['3%', '0%', '-4%'])
  // enquadramento percorre o hambúrguer de cima para baixo
  const posY = useTransform(p, [0.35, 1], ['50%', '66%'])
  const objectPosition = useTransform(posY, (v) => `50% ${v}`)
  const glow = useTransform(p, [0, 1], [0.3, 0.8])
  const copyY = useTransform(p, [0, 0.3], ['0%', '-40%'])
  const copyOpacity = useTransform(p, [0, 0.22], [1, 0])
  const hint = useTransform(p, [0, 0.08], [1, 0])
  const closing = useTransform(p, [0.78, 0.92], [0, 1])

  return (
    <div className="relative h-full w-full bg-ink">
      <motion.div
        aria-hidden
        style={{ opacity: glow }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_50%_55%_at_50%_55%,rgba(244,181,28,.3),transparent_70%)]"
      />
      <Frame />

      <motion.h1
        style={{ y: titleY, scale: titleScale, opacity: titleOpacity }}
        data-rm-static
        className="display absolute inset-x-0 top-[16svh] z-0 text-center text-[31vw] leading-[.8] sm:top-[14svh] sm:text-[18vw] sm:leading-[.85]"
      >
        <span className="block sm:inline">Big</span> <span className="block text-red sm:inline">Burger</span>
      </motion.h1>

      <motion.div
        data-rm-static
        style={{ y, scale }}
        className="absolute left-1/2 top-[54%] z-10 aspect-[736/1104] h-[72svh] -translate-x-1/2 -translate-y-1/2 sm:top-[56%] sm:h-[80svh]"
      >
        <motion.img
          src={img.hero.src}
          width={img.hero.w}
          height={img.hero.h}
          alt={img.hero.alt}
          fetchPriority="high"
          style={{ objectPosition }}
          className="photo-grade h-full w-full object-cover [mask-image:radial-gradient(ellipse_56%_54%_at_50%_50%,#000_62%,transparent_100%)]"
        />
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

      <motion.p
        style={{ opacity: closing }}
        className="display absolute inset-x-5 bottom-[8svh] z-20 text-[15vw] leading-none text-bone sm:inset-x-12 sm:text-[7vw]"
      >
        Muito <span className="text-red">sabor</span>
      </motion.p>

      <motion.p style={{ opacity: hint }} className="mono absolute bottom-[3svh] left-1/2 z-20 hidden -translate-x-1/2 text-ash sm:block">
        Role para baixo
      </motion.p>
    </div>
  )
}
