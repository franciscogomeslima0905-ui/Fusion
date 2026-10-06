import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { testimonials } from '../config/site'
import { ChevronIcon, StarIcon } from '../components/ui/Icons'
import { Reveal, SplitLines } from '../components/ui/Reveal'
import { SectionLabel } from '../components/ui/SectionLabel'

export function Testimonials() {
  const [[index, dir], setState] = useState<[number, 1 | -1]>([0, 1])
  const [paused, setPaused] = useState(false)
  const reduce = useReducedMotion()
  const t = testimonials[index]
  const go = (d: 1 | -1) => setState(([i]) => [(i + d + testimonials.length) % testimonials.length, d])

  useEffect(() => {
    if (paused || reduce) return
    const id = window.setTimeout(() => go(1), 7000)
    return () => window.clearTimeout(id)
  }, [index, paused, reduce])

  return (
    <section aria-labelledby="depoimentos-titulo" className="relative mx-auto max-w-[1440px] px-4 py-24 sm:px-8 sm:py-32">
      <SectionLabel index="06">Depoimentos</SectionLabel>

      <div className="mt-10 grid gap-12 sm:mt-14 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div>
          <SplitLines
            lines={['Quem treina,', <span key="l2" className="text-steel">recomenda.</span>]}
            className="text-[clamp(2.2rem,6vw,5rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.035em] font-semiwide"
          />
          <span id="depoimentos-titulo" className="sr-only">
            Depoimentos de alunos
          </span>
          <Reveal delay={0.1} className="mt-8 flex items-center gap-3">
            {([-1, 1] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => go(d)}
                aria-label={d === 1 ? 'Próximo depoimento' : 'Depoimento anterior'}
                className="grid h-12 w-12 place-items-center rounded-full border border-white/15 transition-colors hover:border-fusion hover:bg-fusion"
              >
                <ChevronIcon className={d === -1 ? 'rotate-180' : ''} />
              </button>
            ))}
            <span className="ml-3 font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
              <span className="text-bone">{String(index + 1).padStart(2, '0')}</span> / {String(testimonials.length).padStart(2, '0')}
            </span>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-carbon to-coal p-7 sm:p-12"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            aria-roledescription="carrossel"
          >
            <span aria-hidden className="pointer-events-none absolute -right-2 -top-10 select-none font-wide text-[14rem] font-black leading-none text-white/[0.03]">
              ”
            </span>
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.figure
                key={index}
                custom={dir}
                initial={{ opacity: 0, x: dir * 40, filter: 'blur(6px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: dir * -40, filter: 'blur(6px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.3}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50) go(1)
                  else if (info.offset.x > 50) go(-1)
                }}
                className="relative min-h-[260px] touch-pan-y sm:min-h-[240px]"
                aria-live="polite"
              >
                <div className="flex items-center gap-1 text-fusion" aria-label={`${t.rating} de 5 estrelas`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} className={`h-5 w-5 ${i < t.rating ? '' : 'text-white/15'}`} />
                  ))}
                  {t.placeholder && (
                    <span className="ml-3 rounded-full border border-white/15 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-steel">Exemplo</span>
                  )}
                </div>
                <blockquote className="mt-6 text-xl font-medium leading-snug text-bone sm:text-2xl lg:text-[1.75rem]">“{t.quote}”</blockquote>
                <figcaption className="mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-fusion/15 font-bold text-fusion ring-1 ring-fusion/40">{t.name.charAt(0)}</span>
                  <span>
                    <span className="block font-semibold text-bone">{t.name}</span>
                    <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-steel">{t.detail}</span>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>

            {/* indicadores */}
            <div className="mt-8 flex gap-2" role="tablist" aria-label="Escolher depoimento">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Depoimento ${i + 1}`}
                  onClick={() => setState([i, i > index ? 1 : -1])}
                  className="group relative h-6 flex-1"
                >
                  <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 overflow-hidden rounded-full bg-white/10">
                    {i === index && (
                      <motion.span
                        key={`${index}-${paused}`}
                        className="absolute inset-y-0 left-0 bg-fusion"
                        initial={{ width: paused || reduce ? '100%' : '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: paused || reduce ? 0 : 7, ease: 'linear' }}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
