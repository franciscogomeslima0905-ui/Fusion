import { useLayoutEffect, useRef } from 'react'
import { gsap, MOTION_OK } from '../lib/gsap'
import { photos } from '../config/site'
import { MaskText } from '../components/MaskText'
import { BuyButton, WhatsButton } from '../components/Buttons'

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // entrada
        gsap.from('[data-hero-frame]', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.6, ease: 'power4.inOut' })
        gsap.from('[data-hero-img]', { scale: 1.4, duration: 2.2, ease: 'power3.out' })
        gsap.from('[data-hero-title] .mask-word > span', { yPercent: 115, duration: 1.3, ease: 'power4.out', stagger: 0.08, delay: 0.5 })
        gsap.from('[data-hero-fade]', { opacity: 0, y: 24, duration: 1, ease: 'power3.out', delay: 1.1, stagger: 0.12 })

        // scroll: o hero fica fixo, a imagem cresce, o texto se dissolve e a próxima seção desliza por cima
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: root.current, start: 'top top', end: '+=100%', pin: true, pinSpacing: false, scrub: 0.6 },
          })
          .to('[data-hero-frame]', { scale: 1.28, yPercent: -4 }, 0)
          .to('[data-hero-img]', { scale: 1.22 }, 0)
          .to('[data-hero-text]', { yPercent: -18, opacity: 0, duration: 0.6 }, 0)
          .to('[data-hero-mini]', { yPercent: -70, xPercent: 12, opacity: 0, duration: 0.7 }, 0)
          .to('[data-hero-shade]', { opacity: 0.55 }, 0.3)
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="topo" ref={root} className="relative z-0 h-[100svh] overflow-hidden bg-ink text-white">
      {/* moldura da foto principal */}
      <div
        data-hero-frame
        className="absolute inset-y-0 right-0 w-full overflow-hidden will-change-transform lg:left-auto lg:w-[46%]"
      >
        <img
          data-hero-img
          src={photos.conjuntoRosa}
          alt="Conjunto rosa de alfaiataria em manequins da loja Deluxe"
          className="h-full w-full object-cover object-[50%_30%]"
        />
        <div data-hero-shade className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/50 opacity-100 lg:from-ink/30 lg:via-transparent lg:to-transparent" />
      </div>

      <div data-hero-mini className="absolute bottom-[14%] right-[40%] hidden w-[15vw] max-w-[230px] lg:block">
        <div className="aspect-[3/4] overflow-hidden ring-1 ring-gold/60">
          <img src={photos.tricot} alt="Tricô trançado off-white" className="h-full w-full object-cover" />
        </div>
      </div>

      <div data-hero-text className="relative z-10 mx-auto flex h-full max-w-[1500px] items-end px-6 pb-[12svh] sm:px-10 lg:items-center lg:pb-0">
        <div className="max-w-[640px]">
          <div data-hero-title>
            <MaskText
              as="h1"
              manual
              text="Moda jovem para mulheres reais."
              className="font-display text-[clamp(3rem,8.4vw,7.6rem)] font-medium leading-[0.92]"
            />
          </div>
          <p data-hero-fade className="mt-6 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
            Do P ao GG, as melhores tendências da moda feminina de Tramandaí, na loja e no seu celular.
          </p>
          <div data-hero-fade className="mt-9 flex flex-wrap gap-3">
            <BuyButton />
            <WhatsButton />
          </div>
        </div>
      </div>
    </section>
  )
}
