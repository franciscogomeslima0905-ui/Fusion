import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { structure, whatsappMessages } from '../config/site'
import { whatsappLink } from '../lib/whatsapp'
import { Button } from '../components/ui/Button'
import { Reveal, SplitLines } from '../components/ui/Reveal'
import { SectionLabel } from '../components/ui/SectionLabel'

type Item = (typeof structure)[number]

function Card({ item, className = '', tall = false }: { item: Item; className?: string; tall?: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-7%', '7%'])

  return (
    <motion.article
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 40, clipPath: 'inset(12% 0 0 0 round 20px)' }}
      whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0 round 20px)' }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative isolate overflow-hidden rounded-[20px] border border-white/10 bg-carbon ${className}`}
    >
      <motion.img
        src={tall ? item.photo.src : item.photo.srcSm}
        alt={item.photo.alt}
        width={item.photo.width}
        height={item.photo.height}
        loading="lazy"
        decoding="async"
        style={reduce ? undefined : { y }}
        className="absolute inset-0 -z-10 h-[116%] w-full -translate-y-[8%] object-cover [@media(hover:hover)]:grayscale transition-[filter,scale] duration-[900ms] ease-[var(--ease-premium)] group-hover:scale-[1.04] group-hover:grayscale-0"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/30 to-ink/10 transition-opacity duration-700 group-hover:opacity-80" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-fusion shadow-[0_0_14px_rgb(255_42_51)] transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-x-100" />

      <div className="flex h-full flex-col justify-between p-5 sm:p-6">
        <span className="self-start rounded-full border border-white/15 bg-ink/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-mist backdrop-blur">
          {item.index} — {item.photo.title}
        </span>
        <div>
          <h3 className="text-xl font-bold uppercase tracking-tight text-bone sm:text-2xl font-semiwide">{item.title}</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-mist/90 transition-all duration-500 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
            {item.text}
          </p>
        </div>
      </div>
    </motion.article>
  )
}

export function Structure() {
  const [a, b, c, d, e] = structure
  return (
    <section id="estrutura" aria-labelledby="estrutura-titulo" className="relative mx-auto max-w-[1440px] px-4 py-24 sm:px-8 sm:py-32">
      <SectionLabel index="02">Estrutura &amp; experiência</SectionLabel>

      <div className="mt-10 flex flex-col gap-8 sm:mt-14 lg:flex-row lg:items-end lg:justify-between">
        <SplitLines
          lines={['Do aquecimento', <>ao último set, <span className="text-steel">sem atrito.</span></>]}
          className="text-[clamp(2.2rem,6vw,5rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.035em] font-semiwide"
        />
        <Reveal delay={0.1} className="max-w-sm">
          <p id="estrutura-titulo" className="text-[15px] leading-relaxed text-mist">
            Um ambiente moderno, com equipamentos para cada objetivo e espaço para treinar sem improvisos. Passe o dedo ou o mouse para explorar.
          </p>
        </Reveal>
      </div>

      {/* Desktop/tablet: grade assimétrica */}
      <div className="mt-12 hidden gap-4 md:grid md:grid-cols-6 md:grid-rows-[300px_300px_260px] lg:grid-cols-12 lg:grid-rows-[340px_340px]">
        <Card item={a} tall className="md:col-span-4 md:row-span-2 lg:col-span-6 lg:row-span-2" />
        <Card item={b} className="md:col-span-2 lg:col-span-3" />
        <Card item={c} className="md:col-span-2 lg:col-span-3" />
        <Card item={d} className="md:col-span-3 lg:col-span-3" />
        <Card item={e} className="md:col-span-3 lg:col-span-3" />
      </div>

      {/* Mobile: carrossel com snap, cards grandes e legíveis */}
      <div className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:hidden" role="list" aria-label="Estrutura da academia">
        {structure.map((item) => (
          <div key={item.index} role="listitem" className="w-[78vw] shrink-0 snap-center">
            <Card item={item} className="h-[62svh] max-h-[520px] min-h-[380px] [&_p]:opacity-100" />
          </div>
        ))}
      </div>

      <Reveal className="mt-10 flex justify-center sm:mt-14">
        <Button href={whatsappLink(whatsappMessages.structure)} external variant="ghost">
          Agendar uma visita
        </Button>
      </Reveal>
    </section>
  )
}
