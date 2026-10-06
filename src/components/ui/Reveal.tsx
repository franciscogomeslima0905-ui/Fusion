import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ElementType, ReactNode } from 'react'

const EASE = [0.22, 1, 0.36, 1] as const

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  as?: 'div' | 'li' | 'p' | 'span' | 'article' | 'figure'
}

/** Elemento que surge com fade + blur + deslocamento quando entra na tela (como na referência). */
export function Reveal({ children, className, delay = 0, y = 28, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion()
  const Comp = motion[as] as ElementType
  return (
    <Comp
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </Comp>
  )
}

const lineVariants: Variants = {
  hidden: { y: '105%', opacity: 0 },
  show: (i: number) => ({ y: '0%', opacity: 1, transition: { duration: 1, delay: i * 0.09, ease: EASE } }),
}

/** Título que entra linha a linha, com máscara — efeito de "subir" o texto. */
export function SplitLines({
  lines,
  className,
  lineClassName,
  as: Tag = 'h2',
  delay = 0,
  immediate = false,
}: {
  lines: ReactNode[]
  className?: string
  lineClassName?: string
  as?: 'h1' | 'h2' | 'h3' | 'p'
  delay?: number
  immediate?: boolean
}) {
  const reduce = useReducedMotion()
  const H = motion[Tag] as ElementType
  // O gatilho fica no título inteiro: as linhas começam fora da máscara e não seriam "vistas" sozinhas.
  const trigger = reduce
    ? {}
    : immediate
      ? { initial: 'hidden', animate: 'show' }
      : { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '0px 0px -10% 0px' } }
  return (
    <H className={className} {...trigger}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span className={`block ${lineClassName ?? ''}`} variants={reduce ? undefined : lineVariants} custom={i + delay / 0.09}>
            {line}
          </motion.span>
        </span>
      ))}
    </H>
  )
}
