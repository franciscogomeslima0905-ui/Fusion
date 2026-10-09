import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger, MOTION_OK } from '../lib/gsap'
import { messages, photos } from '../config/site'
import { Kicker, MaskTitle } from '../components/MaskTitle'
import { WhatsAppButton } from '../components/Buttons'
import { useSectionFx } from '../hooks/useSectionFx'

const moments = [
  { n: '01', label: 'Treinadores orientando alunos', photo: photos.treinadorGrupo },
  { n: '02', label: 'Crianças praticando futebol', photo: photos.duelo },
  { n: '03', label: 'Exercícios técnicos', photo: photos.cones },
  { n: '04', label: 'Atividades coletivas', photo: photos.comemoracao },
  { n: '05', label: 'Momentos de aprendizado', photo: photos.prancheta },
  { n: '06', label: 'Treinamentos em campo', photo: photos.treinadorCampo },
]

/** Composição editorial: lista fixa à esquerda acompanha as fotos grandes que rolam à direita. */
export function Training() {
  const root = useRef<HTMLElement>(null)
  useSectionFx(root)

  useLayoutEffect(() => {
    const el = root.current!
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const items = gsap.utils.toArray<HTMLElement>('[data-moment]', el)
        const photosEls = gsap.utils.toArray<HTMLElement>('[data-moment-photo]', el)
        const setActive = (idx: number) =>
          items.forEach((it, i) => {
            it.dataset.active = String(i === idx)
          })
        photosEls.forEach((ph, i) => {
          ScrollTrigger.create({
            trigger: ph,
            start: 'top 60%',
            end: 'bottom 60%',
            onToggle: (self) => self.isActive && setActive(i),
          })
        })
        setActive(0)
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="treinamentos" ref={root} className="relative z-10 bg-ink py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <Kicker>Experiência de treinamento</Kicker>
        <MaskTitle lines={['É no campo', 'que tudo começa.']} accent={1} className="mt-6 text-[clamp(3rem,10.6vw,12rem)] lg:mt-8" />

        <div className="mt-16 grid gap-10 lg:mt-28 lg:grid-cols-12 lg:gap-16">
          {/* índice fixo */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-[22svh]">
              <p data-reveal className="max-w-sm text-lg leading-snug text-white">
                Cada treino é uma experiência: orientação de perto, bola nos pés e muito aprendizado.
              </p>
              <ol className="mt-10 hidden lg:block">
                {moments.map((m) => (
                  <li
                    key={m.n}
                    data-moment
                    className="group flex items-baseline gap-5 border-b border-line py-4 text-white/35 transition-colors duration-500 data-[active=true]:text-white"
                  >
                    <span className="t-head text-xs text-white/35 transition-colors duration-500 group-data-[active=true]:text-blue">{m.n}</span>
                    <span className="t-display text-[1.7rem] transition-transform duration-500 group-data-[active=true]:translate-x-3">{m.label}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-10 hidden lg:block">
                <WhatsAppButton message={messages.training} variant="outline">
                  Quero conhecer os treinos
                </WhatsAppButton>
              </div>
            </div>
          </div>

          {/* fotos grandes, em ritmo alternado */}
          <div className="space-y-16 sm:space-y-24 lg:col-span-8 lg:space-y-40">
            {moments.map((m, i) => (
              <figure key={m.n} data-moment-photo className={`relative ${i % 2 ? 'sm:ml-[18%] lg:ml-[26%]' : 'sm:mr-[18%] lg:mr-[14%]'}`}>
                <div data-img className="grain relative aspect-[4/5] overflow-hidden bg-coal">
                  <img data-parallax="7" src={m.photo.src} alt={m.photo.alt} loading="lazy" decoding="async" className="photo absolute inset-0 h-[116%] w-full -translate-y-[6%] object-cover" />
                </div>
                <span aria-hidden="true" className="t-display pointer-events-none absolute -top-[0.38em] text-[clamp(5rem,13vw,11rem)] text-transparent [-webkit-text-stroke:1.5px_var(--color-blue)] " style={i % 2 ? { left: '-0.08em' } : { right: '-0.08em' }}>
                  {m.n}
                </span>
                <figcaption className="t-head mt-4 flex items-center gap-3 text-[0.78rem] text-white lg:hidden">
                  <span className="text-blue">{m.n}</span>
                  {m.label}
                </figcaption>
              </figure>
            ))}
            <div className="lg:hidden">
              <WhatsAppButton message={messages.training} size="lg" className="w-full">
                Quero conhecer os treinos
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
