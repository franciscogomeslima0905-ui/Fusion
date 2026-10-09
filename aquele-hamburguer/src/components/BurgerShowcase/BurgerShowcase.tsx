import { useLayoutEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { gsap, isLowPower } from '../../lib/gsap'
import { SITE } from '../../lib/links'
import { products } from '../../data/products'
import { useMaskReveal } from '../../hooks/useMaskReveal'
import { Mask } from '../Mask'

const featured = products.filter(p => p.featured)
const others = products.filter(p => !p.featured)

export default function BurgerShowcase() {
  const root = useRef<HTMLElement>(null)
  useMaskReveal(root)

  // parallax das fotos (transform only)
  useLayoutEffect(() => {
    const el = root.current
    if (!el || isLowPower() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>('[data-row]').forEach(row => {
        const img = row.querySelector('[data-img]')
        const big = row.querySelector('[data-num]')
        if (img) gsap.fromTo(img, { yPercent: -7, scale: 1.14 }, { yPercent: 7, scale: 1.14, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true } })
        if (big) gsap.fromTo(big, { yPercent: 18 }, { yPercent: -18, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="hamburgueres" ref={root} aria-labelledby="t-hamb" className="relative bg-ink pb-[10vh] pt-[16vh]">
      <div className="px-5 md:px-[5vw]">
        <h2 id="t-hamb" data-mask-group className="display text-[clamp(3.4rem,13vw,13rem)]">
          <Mask>Escolha</Mask>
          <Mask>o seu <span className="text-gold">Aquele.</span></Mask>
        </h2>
      </div>

      <div className="mt-[10vh] flex flex-col gap-[14vh] md:gap-[18vh]">
        {featured.map((p, i) => {
          const flip = i % 2 === 1
          return (
            <article key={p.id} data-row className={`relative flex flex-col gap-6 md:items-center md:gap-0 ${flip ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
              <a
                href={SITE.menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="VER"
                aria-label={`${p.title} — ver no cardápio`}
                className={`group relative block aspect-[4/3] w-full overflow-hidden md:aspect-[5/4] md:w-[62vw] ${flip ? 'md:mr-0' : 'md:ml-0'}`}
              >
                <img
                  data-img
                  src={p.image}
                  alt={p.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-[filter] duration-700 [filter:brightness(.86)_saturate(1.05)] group-hover:[filter:brightness(1.08)_saturate(1.15)]"
                  style={{ objectPosition: p.focus }}
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                <div aria-hidden className="grain absolute inset-0" />
              </a>

              <div className={`relative z-10 px-5 md:w-[38vw] md:px-[4vw] ${flip ? 'md:text-right' : ''}`}>
                <span
                  data-num
                  aria-hidden
                  className="display pointer-events-none absolute -top-[26vw] text-[34vw] leading-none md:-top-[9vw] md:text-[14vw]"
                  style={{ color: 'transparent', WebkitTextStroke: '2px rgba(255,184,0,.28)', [flip ? 'right' : 'left']: '1rem' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="display relative text-[clamp(2.4rem,4.6vw,4.6rem)]">{p.title}</h3>
                <p className="display relative mt-3 text-[clamp(1.8rem,3vw,2.8rem)] text-gold">{p.price}</p>
                <p className={`relative mt-4 max-w-md text-base leading-relaxed text-ash md:text-lg ${flip ? 'md:ml-auto' : ''}`}>{p.description}</p>
                <a href={SITE.menuUrl} target="_blank" rel="noopener noreferrer" data-cursor="PEDIR" className="link-u relative mt-6 inline-flex items-center gap-2 font-head text-sm font-extrabold uppercase tracking-[.14em] text-gold">
                  Ver no cardápio <ArrowUpRight size={18} aria-hidden />
                </a>
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-[16vh] px-5 md:px-[5vw]">
        <h3 data-mask-group className="display text-[clamp(2.6rem,7vw,6.5rem)]">
          <Mask>Todos os <span className="text-gold">Aqueles.</span></Mask>
        </h3>
        <ul className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          {others.map(p => (
            <li key={p.id}>
              <a href={SITE.menuUrl} target="_blank" rel="noopener noreferrer" data-cursor="VER" aria-label={`${p.title}, ${p.price} — ver no cardápio`} className="group relative block aspect-[4/5] overflow-hidden bg-coal">
                <img src={p.image} alt={p.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 [filter:brightness(.88)] group-hover:scale-[1.06] group-hover:[filter:brightness(1.05)]" style={{ objectPosition: p.focus }} />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                <div aria-hidden className="grain absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                  <p className="display text-[clamp(1.2rem,1.9vw,1.9rem)] !leading-[1]">{p.title.replace('Aquele ', '')}</p>
                  <p className="display mt-1 text-lg text-gold md:text-xl">{p.price}</p>
                  <p className="mt-2 hidden max-h-0 overflow-hidden text-xs leading-snug text-white/80 opacity-0 transition-[max-height,opacity] duration-500 group-hover:max-h-28 group-hover:opacity-100 md:block">{p.description}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
