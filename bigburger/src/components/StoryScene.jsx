import { useRef } from 'react'
import { motion, useTransform } from 'motion/react'
import { useScrollScene } from '../hooks/useScrollScene'

/**
 * Cena sticky: a seção tem `vh` de altura, o palco fica preso na tela
 * e `children(progress)` recebe o progresso 0→1 que controla tudo.
 */
export default function StoryScene({ id, chapter, vh = 300, className = '', children, label }) {
  const ref = useRef(null)
  const progress = useScrollScene(ref)
  return (
    <section
      ref={ref}
      id={id}
      data-chapter={chapter}
      aria-label={label}
      className={`scene ${className}`}
      style={{ height: `${vh}vh` }}
    >
      <div className="stick">{children(progress)}</div>
    </section>
  )
}

/** Bloco que entra e sai conforme a janela [a,b] do progresso. */
export function Beat({ p, range: [a, b], className = '', style, children, rise = 48, hold = false }) {
  const f = Math.min(0.035, (b - a) / 3)
  const opacity = useTransform(p, hold ? [a, a + f] : [a, a + f, b - f, b], hold ? [0, 1] : [0, 1, 1, 0])
  const y = useTransform(p, hold ? [a, a + f] : [a, a + f, b - f, b], hold ? [rise, 0] : [rise, 0, 0, -rise])
  return (
    <motion.div className={`beat ${className}`} style={{ opacity, y, ...style }}>
      {children}
    </motion.div>
  )
}

/** Marcadores de canto, como o enquadramento HUD do vídeo de referência. */
export function Frame({ className = '' }) {
  const c = 'absolute h-5 w-5 border-bone/50'
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-3 sm:inset-6 ${className}`}>
      <span className={`${c} left-0 top-0 border-l border-t`} />
      <span className={`${c} right-0 top-0 border-r border-t`} />
      <span className={`${c} bottom-0 left-0 border-b border-l`} />
      <span className={`${c} bottom-0 right-0 border-b border-r`} />
    </div>
  )
}

/** Numeração de capítulo minimalista, sem badge. */
export function Chapter({ n, children, className = '' }) {
  return (
    <p className={`mono text-ash ${className}`}>
      <span className="text-red">{'//'}</span> {n} <span className="text-bone">{children}</span>
    </p>
  )
}
