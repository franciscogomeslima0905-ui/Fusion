import { useEffect, useRef, useState } from 'react'

/** Contador animado: sobe de 0 até `value` quando aparece na tela. */
export function Counter({ value, suffix = '', format = false }: { value: number; suffix?: string; format?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [n, setN] = useState(reduce ? value : 0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduce || !('IntersectionObserver' in window)) return
    let raf = 0
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min((now - start) / 1400, 1)
        setN(Math.round(value * (1 - Math.pow(1 - t, 3))))
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, reduce])

  return (
    <span ref={ref}>
      {format ? n.toLocaleString('pt-BR') : n}
      {suffix}
    </span>
  )
}
