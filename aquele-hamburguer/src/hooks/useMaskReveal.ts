import { useLayoutEffect, type RefObject } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

/**
 * Títulos entram por máscara (linha sobe de dentro de um recorte), ligados à posição de scroll.
 * Marque as linhas com  <span data-mask-wrap><span data-mask>…</span></span>.
 */
export function useMaskReveal(root: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>('[data-mask-group]').forEach(group => {
        const lines = group.querySelectorAll('[data-mask]')
        gsap.set(lines, { yPercent: 120, y: 0 })
        ScrollTrigger.create({
          trigger: group,
          start: 'top 88%',
          end: 'top 40%',
          scrub: 0.5,
          animation: gsap.to(lines, { yPercent: 0, y: 0, stagger: 0.25, ease: 'power3.out', duration: 1 }),
        })
      })
    }, el)
    return () => ctx.revert()
  }, [root])
}
