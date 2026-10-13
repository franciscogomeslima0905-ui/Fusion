import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { SITE } from '../../lib/links'
import { categories } from '../../data/products'

export default function HorizontalProducts() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = root.current, tr = track.current
    if (!el || !tr) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const dist = () => Math.max(0, tr.scrollWidth - window.innerWidth)
        gsap.to(tr, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 },
        })
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="categorias" ref={root} aria-labelledby="t-cat" className="relative overflow-hidden bg-coal">
      <div ref={track} className="flex h-[100svh] w-max items-center gap-[5vw] px-5 pt-[70px] max-md:gap-6 md:px-[5vw] motion-reduce:overflow-x-auto motion-reduce:w-full">
        <div className="w-[82vw] shrink-0 md:w-[34vw]">
          <h2 id="t-cat" className="display text-[clamp(3.6rem,11vw,9.5rem)]">
            Monte a <span className="text-gold">sua mesa.</span>
          </h2>
          <p className="mt-5 max-w-sm text-ash md:text-lg">Hambúrguer, batata, bebida gelada. Continue rolando.</p>
        </div>

        {categories.map((c, i) => (
          <article key={c.id} className={`relative h-[68svh] w-[78vw] shrink-0 overflow-hidden md:h-[72svh] md:w-[40vw] ${c.image ? 'bg-char' : i % 2 ? 'bg-gold text-ink' : 'bg-char'}`}>
            {c.image ? (
              <>
                <img data-hp-img src={c.image} alt={c.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full scale-[1.15] object-cover [filter:brightness(.78)]" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div aria-hidden className="grain absolute inset-0" />
              </>
            ) : (
              <div aria-hidden className={`display absolute -right-4 top-4 text-[38vw] leading-none md:text-[17vw] ${i % 2 ? 'text-ink/10' : 'text-gold/10'}`}>0{i + 1}</div>
            )}
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-9">
              <span aria-hidden className={`display text-xl ${c.image ? 'text-gold' : i % 2 ? 'text-ink' : 'text-gold'}`}>0{i + 1}</span>
              <h3 className="display mt-1 text-[clamp(2.2rem,3.7vw,3.6rem)] break-words">{c.title}</h3>
              <p className={`mt-3 max-w-sm leading-relaxed ${c.image ? 'text-white/80' : i % 2 ? 'text-ink/80' : 'text-ash'}`}>{c.text}</p>
            </div>
          </article>
        ))}

        <a
          href={SITE.menuUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="VER"
          className="display group flex h-[68svh] w-[70vw] shrink-0 flex-col justify-end border-2 border-gold p-6 text-[clamp(2.4rem,6vw,5.4rem)] transition-colors hover:bg-gold hover:text-ink md:h-[72svh] md:w-[30vw] md:p-9"
        >
          Ver tudo no cardápio
          <span aria-hidden className="mt-3 block text-5xl text-gold transition-transform duration-500 group-hover:translate-x-3 group-hover:text-ink">→</span>
        </a>
      </div>
    </section>
  )
}
