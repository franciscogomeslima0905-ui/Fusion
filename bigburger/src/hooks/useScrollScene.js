import { useScroll, useSpring } from 'motion/react'

/** Progresso (0→1) de uma cena sticky, suavizado por mola para o scroll "escorregar". */
export function useScrollScene(ref) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  return useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.35, restDelta: 0.0005 })
}
