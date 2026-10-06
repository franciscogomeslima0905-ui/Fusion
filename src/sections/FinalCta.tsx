import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { photos, whatsappMessages } from '../config/site'
import { whatsappLink } from '../lib/whatsapp'
import { Button } from '../components/ui/Button'
import { WhatsAppIcon } from '../components/ui/Icons'
import { Reveal, SplitLines } from '../components/ui/Reveal'

export function FinalCta() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%'])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.15, 1])

  return (
    <section ref={ref} aria-labelledby="cta-titulo" className="grain relative isolate overflow-hidden">
      <motion.img
        src={photos.salao.src}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        style={reduce ? undefined : { y, scale }}
        className="absolute inset-0 -z-20 h-[124%] w-full -translate-y-[10%] object-cover opacity-45 grayscale"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_70%_at_50%_60%,rgb(5_5_6/0.55),#050506_85%)]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_40%_at_50%_100%,rgb(227_19_27/0.45),transparent_70%)]" />
      <div aria-hidden className="led-line absolute inset-x-0 bottom-0" />

      <div className="mx-auto flex min-h-[88svh] max-w-[1440px] flex-col items-center justify-center px-4 py-28 text-center sm:px-8">
        <Reveal className="mb-6 font-mono text-[11px] uppercase tracking-[0.26em] text-mist">
          <span className="text-fusion">[10]</span> Sua vez
        </Reveal>
        <SplitLines
          as="h2"
          lines={['Pronto para', <span key="l2" className="italic text-fusion text-glow-red">evoluir?</span>]}
          className="display text-[clamp(3rem,12.5vw,10rem)]"
        />
        <span id="cta-titulo" className="sr-only">
          Pronto para evoluir?
        </span>
        <Reveal delay={0.2}>
          <p className="mt-8 text-lg text-mist sm:text-xl">Seu próximo nível começa aqui.</p>
        </Reveal>
        <Reveal delay={0.3} className="mt-10">
          <Button href={whatsappLink(whatsappMessages.final)} external size="lg" icon={<WhatsAppIcon />} className="sm:!h-16 sm:!px-10 sm:!text-sm">
            Fale com a Fusion Gym
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
