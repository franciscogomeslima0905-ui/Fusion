import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import Button from './Button'
import { img } from '../data/images'
import { restaurant } from '../data/restaurant'
import { generalOrderLink } from '../utils/whatsapp'

export default function FinalCTA() {
  const ref = useRef(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const scale = useTransform(p, [0, 1], [0.7, 1])
  const bgY = useTransform(p, [0, 1], ['8%', '-4%'])
  return (
    <section ref={ref} aria-labelledby="cta-title" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-ink px-5 py-24 text-center">
      <motion.img
        data-rm-static
        aria-hidden
        src={img.bigFrango.src}
        alt=""
        loading="lazy"
        style={{ y: bgY, scale }}
        className="photo-grade absolute left-1/2 top-1/2 -z-0 h-[70svh] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,#080808_75%)]" />
      <div className="relative z-10 max-w-4xl">
        <img src={img.logo} alt="Big Burger — Muito sabor" width="96" height="96" className="mx-auto mb-8 h-20 w-20" />
        <h2 id="cta-title" className="display text-[17vw] sm:text-[9.5vw]">
          Aberto até a <span className="text-red">meia-noite</span>
        </h2>
        <p className="cond mx-auto mt-6 max-w-xl text-2xl text-bone/90">
          Xis, hambúrguer e comida bem servida. {restaurant.hours.label.replace('Todos os dias, d', 'D')}.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="#cardapio">Ver cardápio</Button>
          <Button href={generalOrderLink()} variant="line">Pedir pelo WhatsApp</Button>
        </div>
      </div>
    </section>
  )
}
