import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'

/** Cursor customizado (apenas mouse): ponto discreto; sobre [data-cursor] vira rótulo (VER, PEDIR…). */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = dot.current
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    document.body.classList.add('has-cursor')
    const x = gsap.quickTo(el, 'x', { duration: 0.25, ease: 'power3.out' })
    const y = gsap.quickTo(el, 'y', { duration: 0.25, ease: 'power3.out' })
    gsap.set(el, { opacity: 0 })

    const onMove = (e: PointerEvent) => {
      x(e.clientX); y(e.clientY)
      gsap.to(el, { opacity: 1, duration: 0.2, overwrite: 'auto' })
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]')
      const text = target?.dataset.cursor
      if (label.current) label.current.textContent = text ?? ''
      gsap.to(el, { width: text ? 76 : 12, height: text ? 76 : 12, backgroundColor: text ? '#FFB800' : '#FFFFFF', duration: 0.3, ease: 'power3.out', overwrite: 'auto' })
    }
    const onLeave = () => gsap.to(el, { opacity: 0, duration: 0.2 })
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      document.body.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] grid h-3 w-3 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white mix-blend-normal"
      style={{ marginLeft: 0, marginTop: 0 }}
    >
      <span ref={label} className="font-head text-[.7rem] font-extrabold tracking-[.14em] text-ink" />
    </div>
  )
}
