import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { SITE, whatsappUrl } from '../../lib/links'
import { photoClassico } from '../../data/products'
import { useMaskReveal } from '../../hooks/useMaskReveal'
import { Mask } from '../Mask'
import { WhatsAppIcon } from '../Icons'

export default function FinalCTA() {
  const root = useRef<HTMLElement>(null)
  useMaskReveal(root)

  useLayoutEffect(() => {
    const el = root.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-photo]', { yPercent: 14, rotate: 4 }, { yPercent: -10, rotate: -2, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.fromTo('[data-bigtxt]', { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} aria-labelledby="t-final" className="relative min-h-[100svh] overflow-hidden bg-gold text-ink">
      <div data-bigtxt aria-hidden className="display pointer-events-none absolute -bottom-[4vw] left-0 whitespace-nowrap text-[34vw] leading-none text-ink/[.07]">AQUELE</div>

      <div data-photo aria-hidden className="absolute -bottom-[8vh] -right-[8vw] h-[58svh] w-[86vw] overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,.5)] md:-bottom-[10vh] md:right-[-4vw] md:h-[80svh] md:w-[52vw]" style={{ clipPath: 'polygon(14% 0, 100% 0, 100% 100%, 0 100%)' }}>
        <img src={photoClassico} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
      </div>

      <div className="relative z-10 flex min-h-[100svh] flex-col justify-center px-5 pb-[48svh] pt-[16vh] md:px-[5vw] md:pb-[8vh]">
        <h2 id="t-final" data-mask-group className="display text-[clamp(4.4rem,15vw,15rem)]">
          <Mask>Hoje pede</Mask>
          <Mask>Aquele.</Mask>
        </h2>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={SITE.menuUrl} target="_blank" rel="noopener noreferrer" data-cursor="PEDIR" className="btn btn-dark">Ver cardápio</a>
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" data-cursor="PEDIR" className="btn btn-ghost-dark"><WhatsAppIcon size={18} /> Pedir no WhatsApp</a>
        </div>
      </div>
    </section>
  )
}
