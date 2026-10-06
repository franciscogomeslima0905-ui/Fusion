import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

const fmt = new Intl.NumberFormat('pt-BR')

/** Número que conta de 0 até `to` quando aparece na tela. */
export function Counter({ to, prefix = '', suffix = '', duration = 2 }: { to: number; prefix?: string; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const reduce = useReducedMotion()
  const [value, setValue] = useState(reduce ? to : 0)

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(0, to, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setValue(Math.round(v)) })
    return () => controls.stop()
  }, [inView, reduce, to, duration])

  return (
    <span ref={ref} aria-label={`${prefix}${fmt.format(to)}${suffix}`}>
      <span aria-hidden>
        {prefix}
        {fmt.format(value)}
        {suffix}
      </span>
    </span>
  )
}
