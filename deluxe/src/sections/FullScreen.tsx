import { useLayoutEffect, useRef } from 'react'
import { gsap, MOTION_OK } from '../lib/gsap'
import { photos } from '../config/site'
import { MaskText } from '../components/MaskText'

/** Foto de moda em tela cheia: o recorte se abre, a imagem acompanha o scroll e o título sobe. */
export function FullScreen() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const st = { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.7 }
        // container expandindo: de um recorte arredondado até a tela inteira
        gsap.fromTo('[data-fs-frame]', { clipPath: 'inset(14% 16% 14% 16% round 28px)' }, {
          clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top 90%', end: 'top 10%', scrub: 0.7 },
        })
        // zoom controlado pelo scroll (1.18 → 1)
        gsap.fromTo('[data-fs-img]', { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: st })
        // título sobe mais rápido que a página
        gsap.fromTo('[data-fs-text]', { yPercent: 50 }, { yPercent: -60, ease: 'none', scrollTrigger: st })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="relative z-10 h-[120svh] overflow-hidden bg-ink">
      <div data-fs-frame className="absolute inset-0 overflow-hidden">
        <img data-fs-img src={photos.coleteLaranja} alt="Colete de tricô caramelo com camisa branca e bolsa de corrente" className="h-full w-full object-cover object-[50%_35%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-ink/40" />
      </div>
      <div data-fs-text className="absolute inset-x-0 top-1/2 px-6 text-center text-white">
        <MaskText text="Seu estilo. Seu momento." className="mx-auto max-w-5xl font-display text-[clamp(3rem,9vw,8.5rem)] font-medium leading-[0.95]" />
      </div>
    </section>
  )
}
