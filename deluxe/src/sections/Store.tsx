import { useLayoutEffect, useRef } from 'react'
import { gsap, MOTION_OK } from '../lib/gsap'
import { photos, site } from '../config/site'
import { MaskText } from '../components/MaskText'
import { BuyButton, WhatsButton } from '../components/Buttons'

export function Store() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.fromTo('[data-st-frame]', { clipPath: 'inset(0% 100% 0% 0%)' }, {
          clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'power4.inOut',
          scrollTrigger: { trigger: '[data-st-frame]', start: 'top 80%' },
        })
        gsap.fromTo('[data-st-img]', { scale: 1.3, yPercent: -6 }, { scale: 1.08, yPercent: 6, ease: 'none', scrollTrigger: { trigger: '[data-st-frame]', start: 'top bottom', end: 'bottom top', scrub: true } })
        gsap.from('[data-st-fade]', { opacity: 0, y: 30, duration: 1, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: '[data-st-text]', start: 'top 75%' } })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} id="loja" className="relative z-10 bg-cream py-24 sm:py-36">
      <div className="mx-auto grid max-w-[1500px] items-center gap-12 px-5 sm:px-10 lg:grid-cols-2 lg:gap-24">
        <div data-st-frame className="mx-auto aspect-[3/4] w-full max-w-[520px] overflow-hidden">
          <img data-st-img src={photos.equipe} alt="Equipe da Deluxe dentro da loja em Tramandaí" loading="lazy" className="h-full w-full object-cover" />
        </div>
        <div data-st-text>
          <MaskText text="Venha provar de perto." className="font-display text-[clamp(2.6rem,6vw,5.6rem)] font-medium leading-[0.98]" />
          <p data-st-fade className="mt-6 max-w-md text-lg leading-relaxed text-ink/70">
            Atendimento próximo, peças do P ao GG e looks montados com carinho. Passe na loja ou escolha pelo celular.
          </p>
          <a data-st-fade href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-6 block max-w-md font-display text-2xl italic underline decoration-gold decoration-1 underline-offset-8">
            {site.address}
          </a>
          <div data-st-fade className="mt-10 flex flex-wrap gap-3">
            <BuyButton />
            <WhatsButton tone="light" />
          </div>
        </div>
      </div>
    </section>
  )
}
