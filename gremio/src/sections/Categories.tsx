import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { messages, photos, site } from '../config/site'
import { Kicker, MaskTitle } from '../components/MaskTitle'
import { WhatsAppButton } from '../components/Buttons'
import { useSectionFx } from '../hooks/useSectionFx'

/**
 * Fases GERAIS da trajetória no futebol (iniciação → fundamentos → evolução).
 * Não são programas, turmas ou faixas etárias oficiais da escola.
 */
const stages = [
  {
    tag: 'Iniciação esportiva',
    title: 'O primeiro contato com a bola',
    text: 'Brincar, se movimentar e aprender a conviver em grupo. É aqui que nasce o gosto pelo jogo.',
    photo: photos.duelo,
  },
  {
    tag: 'Desenvolvimento técnico',
    title: 'Fundamentos e confiança',
    text: 'Domínio de bola, passe, condução e leitura de jogo, em atividades que unem técnica e diversão.',
    photo: photos.drible,
  },
  {
    tag: 'Evolução no futebol',
    title: 'Jogo coletivo e responsabilidade',
    text: 'Mais visão de jogo, trabalho em equipe e maturidade: o atleta cresce dentro e fora de campo.',
    photo: photos.salto,
  },
]

const AGES = Array.from({ length: site.ages.to - site.ages.from + 1 }, (_, i) => site.ages.from + i)

export function Categories() {
  const root = useRef<HTMLElement>(null)
  useSectionFx(root)

  useLayoutEffect(() => {
    const el = root.current!
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(el)
        const age = { v: site.ages.from }
        const counter = q('[data-age]')[0] as HTMLElement
        const ticks = q('[data-tick]') as HTMLElement[]
        const paint = () => {
          const n = Math.round(age.v)
          counter.textContent = String(n).padStart(2, '0')
          ticks.forEach((t, i) => t.classList.toggle('is-on', site.ages.from + i <= n))
        }
        const tl = gsap.timeline({ defaults: { ease: 'none' } })
        tl.to(age, { v: site.ages.to, duration: 1, onUpdate: paint }, 0)
        tl.to(q('[data-fill]'), { scaleX: 1, duration: 1 }, 0)
        // troca de fase: foto por máscara + texto
        ;[0.33, 0.66].forEach((t, i) => {
          const n = i + 2
          tl.fromTo(q(`[data-stage-photo="${n}"]`), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.12, ease: 'power3.inOut' }, t - 0.04)
          tl.fromTo(q(`[data-stage-photo="${n}"] img`), { scale: 1.3 }, { scale: 1, duration: 0.2, ease: 'power2.out' }, t - 0.04)
          tl.to(q(`[data-stage-text="${n - 1}"]`), { autoAlpha: 0, y: -30, duration: 0.07 }, t - 0.05)
          tl.fromTo(q(`[data-stage-text="${n}"]`), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.09, ease: 'power2.out' }, t)
        })
        gsap.set(q('[data-stage-text]:not([data-stage-text="1"])'), { autoAlpha: 0 })
        paint()
        const st = ScrollTrigger.create({
          trigger: q('[data-pin]')[0],
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * 2.6)}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          animation: tl,
        })
        return () => st.kill()
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="categorias" ref={root} className="relative z-10 bg-coal">
      {/* ===== desktop: seção fixada, idade e fases acompanham a rolagem ===== */}
      <div data-pin className="relative hidden h-[100svh] min-h-[640px] overflow-hidden lg:block">
        <div className="mx-auto grid h-full max-w-[1600px] grid-cols-12 gap-10 px-12 pt-[13svh] pb-[8svh]">
          <div className="col-span-7 flex flex-col justify-between">
            <div>
              <Kicker>Categorias</Kicker>
              <MaskTitle lines={['Cada idade.', 'Uma nova conquista.']} accent={1} className="mt-6 text-[clamp(3rem,6.2vw,7.6rem)]" />
            </div>

            <div>
              <div className="flex items-end gap-6">
                <span data-age className="t-display text-[clamp(7rem,17vw,17rem)] leading-[0.8] text-white tabular-nums">
                  03
                </span>
                <span className="t-head mb-4 text-lg text-blue">anos</span>
              </div>
              {/* régua das idades: 3 → 15 */}
              <div className="relative mt-8 max-w-[44rem]">
                <div className="absolute top-0 right-0 left-0 h-px bg-line" />
                <div data-fill className="absolute top-0 right-0 left-0 h-px origin-left scale-x-0 bg-blue" />
                <ol className="flex justify-between pt-3">
                  {AGES.map((a) => (
                    <li key={a} data-tick className="t-head text-[0.7rem] text-white/30 transition-colors duration-300 [&.is-on]:text-white">
                      {a}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <div className="relative col-span-5 flex flex-col justify-between">
            <div className="grain relative aspect-[4/5] w-full max-w-[26rem] self-end overflow-hidden bg-ink">
              {stages.map((s, i) => (
                <div key={s.tag} data-stage-photo={i + 1} className="absolute inset-0">
                  <img src={s.photo.src} alt={s.photo.alt} loading="lazy" decoding="async" className="photo h-full w-full object-cover" />
                </div>
              ))}
              <span className="pointer-events-none absolute inset-0 border border-white/10" />
            </div>

            <div className="relative mt-8 min-h-[13rem] w-full max-w-[26rem] self-end">
              {stages.map((s, i) => (
                <div key={s.tag} data-stage-text={i + 1} className="absolute inset-x-0 top-0">
                  <p className="t-head text-[0.74rem] text-blue">
                    0{i + 1} · {s.tag}
                  </p>
                  <h3 className="t-display mt-3 text-[2.1rem] text-white">{s.title}</h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-steel">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== celular / tablet: sem fixar a rolagem, fases empilhadas ===== */}
      <div className="px-5 py-20 sm:px-8 sm:py-28 lg:hidden">
        <Kicker>Categorias</Kicker>
        <MaskTitle lines={['Cada idade.', 'Uma nova conquista.']} accent={1} className="mt-5 text-[clamp(3rem,13.5vw,6rem)]" />
        <p data-reveal className="t-display mt-10 text-[clamp(4.5rem,24vw,9rem)] leading-[0.85] text-white">
          {String(site.ages.from).padStart(2, '0')}<span className="text-blue">→</span>{site.ages.to}
          <span className="t-head ml-3 text-base text-blue">anos</span>
        </p>
        <div className="mt-12 space-y-14 sm:grid sm:grid-cols-3 sm:gap-6 sm:space-y-0">
          {stages.map((s, i) => (
            <article key={s.tag} data-reveal>
              <div data-img className="grain relative aspect-[4/5] overflow-hidden bg-ink">
                <img src={s.photo.src} alt={s.photo.alt} loading="lazy" decoding="async" className="photo h-full w-full object-cover" />
              </div>
              <p className="t-head mt-5 text-[0.72rem] text-blue">
                0{i + 1} · {s.tag}
              </p>
              <h3 className="t-display mt-2 text-[2rem] text-white">{s.title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-steel">{s.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <p className="max-w-2xl text-[0.8rem] leading-relaxed text-steel/80">
            As fases acima ilustram, de forma geral, a evolução de quem aprende futebol dos {site.ages.from} aos {site.ages.to} anos. Turmas por
            idade, horários e valores são informados diretamente pela escola.
          </p>
          <WhatsAppButton message={messages.categories} variant="outline" size="md">
            Tirar dúvidas no WhatsApp
          </WhatsAppButton>
        </div>
      </div>
    </section>
  )
}
