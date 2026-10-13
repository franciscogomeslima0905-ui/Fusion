import { useEffect, type RefObject } from 'react'
import { gsap } from '../lib/gsap'

/** Reação discreta ao cursor (desktop com mouse). Suavizada com gsap.quickTo. */
export function useMouseParallax(target: RefObject<HTMLElement | null>, enabled = true, maxDeg = 1.5) {
  useEffect(() => {
    const el = target.current
    if (!el || !enabled) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!fine) return

    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.9, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.9, ease: 'power3.out' })
    const ty = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' })

    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      ry(nx * maxDeg)
      rx(-ny * maxDeg * 0.7)
      ty(ny * -3)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [target, enabled, maxDeg])
}
