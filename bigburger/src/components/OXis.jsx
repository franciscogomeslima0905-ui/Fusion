import { motion, useTransform } from 'motion/react'
import StoryScene, { Beat, Frame, Chapter } from './StoryScene'
import { img } from '../data/images'
import { orderLink } from '../utils/whatsapp'

const tipos = ['Salada', 'Calabresa', 'Frango', 'Coração']

export default function OXis() {
  return (
    <StoryScene id="xis" chapter="02" vh={420} label="O Xis">
      {(p) => <Stage p={p} />}
    </StoryScene>
  )
}

function Stage({ p }) {
  // a foto "mergulha" no recheio: zoom + deslocamento de enquadramento
  const scale = useTransform(p, [0, 1], [1.02, 1.35])
  const posX = useTransform(p, [0, 1], ['50%', '62%'])
  const posY = useTransform(p, [0, 1], ['50%', '38%'])
  const objectPosition = useTransform([posX, posY], ([x, y]) => `${x} ${y}`)
  const photoY = useTransform(p, [0, 1], ['4%', '-4%'])
  const bigY = useTransform(p, [0, 1], ['0%', '-30%'])
  const bg = useTransform(p, [0, 0.5, 1], ['#080808', '#14100a', '#190b0b'])

  return (
    <motion.div style={{ backgroundColor: bg }} className="relative h-full w-full">
      <Frame />
      <motion.h2
        aria-label="O Xis"
        style={{ y: bigY }}
        className="display pointer-events-none absolute left-[4vw] top-[11svh] z-0 text-[34vw] text-char sm:text-[22vw]"
      >
        O Xis
      </motion.h2>

      <motion.div
        data-rm-static
        style={{ y: photoY }}
        className="absolute right-[6vw] top-[24svh] z-10 h-[34svh] w-[78vw] overflow-hidden sm:right-[8vw] sm:top-[18svh] sm:h-[64svh] sm:w-[46vw]"
      >
        <motion.img
          src={img.bigFrango.src}
          alt={img.bigFrango.alt}
          loading="lazy"
          style={{ scale, objectPosition }}
          className="photo-grade h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />
      </motion.div>

      <Beat p={p} range={[0, 0.2]} className="absolute bottom-[9svh] left-5 z-20 max-w-sm sm:left-12">
        <Chapter n="02" className="mb-3">O Xis</Chapter>
        <p className="cond text-2xl font-bold leading-tight">O Xis do Big Burger é sempre a melhor escolha.</p>
      </Beat>

      {tipos.map((t, i) => {
        const a = 0.2 + i * 0.17
        return (
          <Beat key={t} p={p} range={[a, a + 0.17]} className="absolute bottom-[8svh] left-5 z-20 sm:left-12">
            <p className="mono mb-2 text-gold">Xis 0{i + 1}/04</p>
            <p className="display text-[19vw] text-bone sm:text-[9vw]">{t}</p>
          </Beat>
        )
      })}

      <Beat p={p} range={[0.9, 1.2]} hold className="absolute bottom-[13svh] right-5 z-20 text-right sm:bottom-[8svh] sm:right-12">
        <p className="mono text-ash">Promoção de sexta · só no salão</p>
        <p className="display text-6xl text-gold sm:text-7xl">R$ 27,00</p>
        <a href={orderLink('um Xis')} className="cond mt-2 inline-block text-lg font-bold tracking-[.12em] text-bone underline decoration-red decoration-2 underline-offset-8 hover:text-red">
          Pedir pelo WhatsApp
        </a>
      </Beat>
    </motion.div>
  )
}
