import { useLayoutEffect, type RefObject } from 'react'
import { gsap, MOTION_OK } from '../lib/gsap'

/**
 * Animações de entrada reutilizáveis, ativadas por atributos de dados dentro de uma seção:
 *  data-mask            → linhas (.mask-line) sobem de dentro de um recorte
 *  data-reveal          → fade + subida discreta (valor = atraso em segundos, opcional)
 *  data-img             → foto aparece por máscara (clip-path) com leve zoom
 *  data-parallax="8"    → deslocamento vertical em % (parallax sutil, vinculado à rolagem)
 * Com "reduzir movimento" ativo nada é animado e o conteúdo aparece direto.
 */
export function useSectionFx(root: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>('[data-mask]').forEach((el) => {
          gsap.from(el.querySelectorAll('.mask-line > span'), {
            yPercent: 112,
            duration: 1.15,
            ease: 'power4.out',
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        })
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 34,
            duration: 1,
            delay: Number(el.dataset.reveal) || 0,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          })
        })
        gsap.utils.toArray<HTMLElement>('[data-img]').forEach((el) => {
          const inner = el.querySelector('img')
          gsap.from(el, {
            clipPath: 'inset(0% 0% 100% 0%)',
            duration: 1.3,
            ease: 'power4.inOut',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
          if (inner) {
            gsap.from(inner, {
              scale: 1.25,
              duration: 1.8,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            })
          }
        })
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          const v = Number(el.dataset.parallax) || 8
          gsap.fromTo(
            el,
            { yPercent: -v },
            {
              yPercent: v,
              ease: 'none',
              scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          )
        })
      })
    }, root)
    return () => ctx.revert()
  }, [root])
}
