import { useLayoutEffect, useRef } from 'react'
import { gsap, MOTION_OK, DESKTOP } from '../lib/gsap'
import { photos } from '../config/site'
import { MaskText } from '../components/MaskText'

type Item = { src: string; alt: string; ratio: string; label: string }

const colA: Item[] = [
  { src: photos.vestidoFloral, alt: 'Vestido floral de manga longa com cinto', ratio: 'aspect-[3/4]', label: 'Vestido floral' },
  { src: photos.saiaZebra, alt: 'Blusa zebra com saia midi marrom', ratio: 'aspect-[4/5]', label: 'Zebra e midi' },
]
const colB: Item[] = [
  { src: photos.tricot, alt: 'Tricô trançado off-white', ratio: 'aspect-[4/5]', label: 'Tricô trançado' },
  { src: photos.coleteLaranja, alt: 'Colete de tricô caramelo sobre camisa branca', ratio: 'aspect-[3/4]', label: 'Colete caramelo' },
  { src: photos.infantil, alt: 'Conjunto infantil off-white com laço caramelo', ratio: 'aspect-[3/4]', label: 'Moda infantil' },
]
const colC: Item[] = [
  { src: photos.shortCouro, alt: 'Short de couro ecológico com cinto', ratio: 'aspect-[4/5]', label: 'Short de couro' },
  { src: photos.bodies, alt: 'Bodies de estampas variadas', ratio: 'aspect-[4/3]', label: 'Bodies' },
  { src: photos.legging, alt: 'Calça de couro ecológico caramelo', ratio: 'aspect-[3/4]', label: 'Calça de couro' },
]

function Card({ item }: { item: Item }) {
  return (
    <figure data-card>
      <div data-frame className={`${item.ratio} overflow-hidden bg-ink/5`}>
        <img data-img src={item.src} alt={item.alt} loading="lazy" className="h-full w-full scale-[1.12] object-cover" />
      </div>
      <figcaption className="mt-3 font-display text-lg italic text-ink/70">{item.label}</figcaption>
    </figure>
  )
}

export function Looks() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // revelação das fotos em sequência (leve stagger por coluna)
        gsap.utils.toArray<HTMLElement>('[data-card]').forEach((card, i) => {
          const frame = card.querySelector('[data-frame]')
          const img = card.querySelector('[data-img]')
          const col = Number(card.closest('[data-col]')?.getAttribute('data-col') ?? 0)
          gsap.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, {
            clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power4.inOut', delay: col * 0.12,
            scrollTrigger: { trigger: card, start: 'top 88%' },
          })
          gsap.fromTo(img, { scale: 1.4 }, { scale: 1.12, duration: 2, ease: 'power3.out', delay: col * 0.12, scrollTrigger: { trigger: card, start: 'top 88%' } })
          // parallax interno bem discreto
          gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } })
          void i
        })
      })
      // colunas com velocidades diferentes (somente desktop)
      mm.add(`${MOTION_OK} and ${DESKTOP}`, () => {
        const speeds: Record<string, number> = { '0': -6, '1': 8, '2': -14 }
        gsap.utils.toArray<HTMLElement>('[data-col]').forEach((col) => {
          gsap.to(col, {
            yPercent: speeds[col.dataset.col!], ease: 'none',
            scrollTrigger: { trigger: '[data-grid]', start: 'top bottom', end: 'bottom top', scrub: 0.8 },
          })
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="looks" ref={root} className="relative z-10 -mt-px rounded-t-[2rem] bg-cream pb-32 pt-24 sm:rounded-t-[3rem] sm:pt-36">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-10">
        <MaskText
          text="Looks que combinam com você"
          className="max-w-4xl font-display text-[clamp(2.6rem,6.4vw,6rem)] font-medium leading-[0.98]"
        />
        <div data-grid className="mt-16 grid grid-cols-2 gap-x-3 gap-y-8 sm:mt-24 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0">
          <div data-col="0" className="contents lg:col-span-5 lg:flex lg:flex-col lg:gap-24">
            {colA.map((it) => <div key={it.src} className="col-span-2 sm:col-span-1 lg:col-span-1"><Card item={it} /></div>)}
          </div>
          <div data-col="1" className="contents lg:col-span-4 lg:mt-48 lg:flex lg:flex-col lg:gap-24">
            {colB.map((it) => <div key={it.src}><Card item={it} /></div>)}
          </div>
          <div data-col="2" className="contents lg:col-span-3 lg:mt-16 lg:flex lg:flex-col lg:gap-20">
            {colC.map((it) => <div key={it.src}><Card item={it} /></div>)}
          </div>
        </div>
      </div>
    </section>
  )
}
