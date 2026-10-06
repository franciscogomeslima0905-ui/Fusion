import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { photos } from '../config/site'
import { Reveal } from '../components/ui/Reveal'
import { SectionLabel } from '../components/ui/SectionLabel'

const statement =
  'A Fusion Gym é a academia premium de Tramandaí: um espaço moderno, equipado e pensado para quem leva o treino a sério — e quer evoluir de verdade.'

/** Palavra que acende (cinza → branco) conforme a rolagem — efeito de leitura guiada da referência. */
function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1])
  const highlight = /premium|Tramandaí|evoluir/.test(children)
  return (
    <span className="relative mr-[0.24em] inline-block">
      <motion.span style={{ opacity }} className={highlight ? 'text-fusion' : undefined}>
        {children}
      </motion.span>
    </span>
  )
}

export function About() {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 45%'] })
  const words = statement.split(' ')

  return (
    <section id="sobre" aria-labelledby="sobre-titulo" className="relative mx-auto max-w-[1440px] px-4 py-24 sm:px-8 sm:py-32 lg:py-40">
      <SectionLabel index="01">Sobre a Fusion</SectionLabel>
      <h2 id="sobre-titulo" className="sr-only">
        Sobre a Fusion Gym
      </h2>

      <p ref={ref} className="mt-10 max-w-[22ch] text-[clamp(1.85rem,5.4vw,4.6rem)] font-bold leading-[1.04] tracking-[-0.03em] text-bone sm:mt-14 font-semiwide">
        {reduce
          ? statement
          : words.map((w, i) => (
              <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
                {w}
              </Word>
            ))}
      </p>

      <div className="mt-16 grid gap-10 border-t border-white/10 pt-10 sm:mt-24 lg:grid-cols-12 lg:gap-8">
        <Reveal className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.2em] text-steel lg:col-span-3">
          Tramandaí — RS
          <br />
          Litoral Norte Gaúcho
        </Reveal>

        <div className="grid gap-6 text-[15px] leading-relaxed text-mist sm:grid-cols-2 sm:gap-8 lg:col-span-6">
          <Reveal delay={0.05}>
            <p>
              Aqui, cada detalhe foi pensado para o seu treino render mais: um salão amplo e climatizado, equipamentos de alto nível, iluminação marcante e um ambiente que
              motiva desde o primeiro minuto.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <p>
              Seja para ganhar força, definir o corpo ou cuidar da saúde, você encontra estrutura e orientação para treinar com segurança — e horários amplos que cabem
              na sua rotina.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.18} className="lg:col-span-3">
          <figure className="group relative overflow-hidden rounded-2xl border border-white/10">
            <img
              src={photos.halteres.srcSm}
              alt={photos.halteres.alt}
              width={640}
              height={1115}
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full object-cover grayscale-[60%] transition duration-700 ease-[var(--ease-premium)] group-hover:scale-105 group-hover:grayscale-0"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-4 font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
              Salão Fusion Gym
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
