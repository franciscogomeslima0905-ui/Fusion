import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { SITE, whatsappUrl } from '../../lib/links'
import { photoOnionRings } from '../../data/products'
import { useMaskReveal } from '../../hooks/useMaskReveal'
import { Mask } from '../Mask'
import { WhatsAppIcon } from '../Icons'

export default function MenuCTA() {
  const root = useRef<HTMLElement>(null)
  useMaskReveal(root)

  useLayoutEffect(() => {
    const el = root.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-bg]', { yPercent: -6, scale: 1.1 }, { yPercent: 6, scale: 1.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="cardapio" ref={root} aria-labelledby="t-menu" className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink">
      <div className="absolute inset-y-0 right-0 w-full overflow-hidden md:w-[64%]">
        <img data-bg src={photoOnionRings} alt="Hambúrguer artesanal com onion rings e cheddar" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover [filter:brightness(.62)_saturate(1.1)] md:[filter:brightness(.85)_saturate(1.1)]" style={{ objectPosition: '62% 55%' }} />
      </div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10 md:bg-gradient-to-t md:from-ink/70 md:via-transparent" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent md:from-ink md:via-ink md:to-transparent md:[background-size:60%_100%] md:bg-no-repeat" />
      <div aria-hidden className="grain absolute inset-0" />

      <div className="relative z-10 w-full px-5 pb-[12vh] pt-[30vh] md:px-[5vw]">
        <h2 id="t-menu" data-mask-group className="display text-[clamp(3.4rem,12vw,12rem)]">
          <Mask>O cardápio</Mask>
          <Mask className="text-gold">completo.</Mask>
        </h2>
        <p className="mt-6 max-w-md text-base text-white/80 md:text-xl">Hambúrgueres, acompanhamentos, bebidas e combos. Escolha e peça pelo cardápio oficial.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={SITE.menuUrl} target="_blank" rel="noopener noreferrer" data-cursor="PEDIR" className="btn btn-solid">Ver cardápio completo</a>
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" data-cursor="PEDIR" className="btn btn-line"><WhatsAppIcon size={18} /> Pedir no WhatsApp</a>
        </div>
      </div>
    </section>
  )
}
