import { useLayoutEffect, useRef } from 'react'
import { gsap, MOTION_OK } from '../lib/gsap'
import { photos } from '../config/site'
import { MaskText } from '../components/MaskText'

const steps = [
  { text: 'Do P ao GG.', sub: 'Moda pensada para vestir cada corpo com conforto e atitude.', img: photos.saiaZebra, alt: 'Blusa zebra com saia midi marrom' },
  { text: 'Peças escolhidas a dedo.', sub: 'Tendências da estação com acabamento que você sente ao vestir.', img: photos.vestidoFloral, alt: 'Vestido floral de manga longa' },
  { text: 'Seu look pronto para brilhar.', sub: 'Do casual ao especial, monte a sua composição com a nossa ajuda.', img: photos.vestidoRosa, alt: 'Vestido rosa com bolsos e cinto' },
]

/** Cena fixada: a foto permanece enquanto textos e recortes mudam, depois a página é liberada. */
export function Story() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(root)
        const words = (i: number) => q(`[data-step="${i}"] .mask-word > span`)
        const subs = (i: number) => q(`[data-sub="${i}"]`)
        const imgs = q('[data-simg]')

        gsap.set([words(1), words(2)], { yPercent: 115 })
        gsap.set([subs(1), subs(2)], { opacity: 0, y: 20 })
        gsap.set([imgs[1], imgs[2]], { clipPath: 'inset(100% 0% 0% 0%)' })

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: { trigger: root.current, start: 'top top', end: '+=320%', pin: true, scrub: 0.8, anticipatePin: 1 },
        })
        tl.to(imgs[0], { scale: 1.1, ease: 'none', duration: 3 }, 0)
        tl.to('[data-bar]', { scaleX: 1, ease: 'none', duration: 3 }, 0)
        ;[1, 2].forEach((n) => {
          const t = n * 1.4 - 0.4
          tl.to(words(n - 1), { yPercent: -115, stagger: 0.05, duration: 0.5 }, t)
          tl.to(subs(n - 1), { opacity: 0, y: -20, duration: 0.4 }, t)
          tl.fromTo(imgs[n], { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.25 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1.05, duration: 0.9 }, t)
          tl.to(words(n), { yPercent: 0, stagger: 0.06, duration: 0.6 }, t + 0.5)
          tl.to(subs(n), { opacity: 1, y: 0, duration: 0.5 }, t + 0.7)
        })
        tl.to({}, { duration: 0.4 })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="relative z-10 h-[100svh] overflow-hidden bg-ink text-white">
      <div className="mx-auto grid h-full max-w-[1500px] grid-rows-[1.1fr_1fr] gap-6 px-5 pb-8 pt-24 sm:px-10 md:grid-cols-2 md:grid-rows-1 md:items-center md:gap-16 md:pb-12">
        <div className="relative order-2 md:order-1">
          <div className="relative h-36 sm:h-44 md:h-64">
            {steps.map((s, i) => (
              <div key={i} data-step={i} className="absolute inset-0">
                <MaskText as="h2" manual text={s.text} className="font-display text-[clamp(2.4rem,5.6vw,5.4rem)] font-medium leading-[0.98]" />
              </div>
            ))}
          </div>
          <div className="relative h-20 md:h-24">
            {steps.map((s, i) => (
              <p key={i} data-sub={i} className="absolute inset-0 max-w-md text-base leading-relaxed text-white/70 md:text-lg">
                {s.sub}
              </p>
            ))}
          </div>
          <div className="mt-4 h-px w-full max-w-md bg-white/20">
            <div data-bar className="h-full origin-left scale-x-0 bg-gold" />
          </div>
        </div>

        <div className="relative order-1 mx-auto h-full w-full max-w-[560px] overflow-hidden ring-1 ring-gold/40 md:order-2 md:max-h-[82svh]">
          {steps.map((s, i) => (
            <img key={i} data-simg src={s.img} alt={s.alt} className="absolute inset-0 h-full w-full object-cover" />
          ))}
        </div>
      </div>
    </section>
  )
}
