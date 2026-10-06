import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import type { ReactNode, MouseEvent } from 'react'
import { ArrowIcon } from './Icons'

type Variant = 'primary' | 'ghost' | 'light'

type ButtonProps = {
  href: string
  children: ReactNode
  variant?: Variant
  icon?: ReactNode
  external?: boolean
  className?: string
  size?: 'md' | 'lg'
  ariaLabel?: string
  onClick?: () => void
}

const styles: Record<Variant, string> = {
  primary:
    'bg-fusion text-white shadow-[0_0_0_1px_rgb(255_42_51/0.4),0_10px_40px_-10px_rgb(227_19_27/0.8)] hover:bg-fusion-glow hover:shadow-[0_0_0_1px_rgb(255_42_51/0.7),0_14px_50px_-8px_rgb(255_42_51/0.95)]',
  ghost: 'border border-white/20 bg-white/[0.03] text-bone backdrop-blur-sm hover:border-white/50 hover:bg-white/[0.08]',
  light: 'bg-bone text-ink hover:bg-white',
}

/**
 * Botão-link com microinteração "magnética" (segue levemente o cursor no desktop)
 * e seta que desliza no hover. Links externos abrem em nova aba.
 */
export function Button({ href, children, variant = 'primary', icon, external, className = '', size = 'md', ariaLabel, onClick }: ButtonProps) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 })

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.18)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.28)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  const pad = size === 'lg' ? 'h-14 px-7 text-[13px] sm:h-[60px] sm:px-8' : 'h-12 px-6 text-[12px]'

  return (
    <motion.a
      href={href}
      onClick={onClick}
      aria-label={ariaLabel}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.97 }}
      className={`group relative inline-flex shrink-0 select-none items-center justify-center gap-3 overflow-hidden rounded-full font-semibold uppercase tracking-[0.14em] transition-[background-color,border-color,box-shadow,color] duration-300 ${pad} ${styles[variant]} ${className}`}
    >
      {/* brilho que atravessa o botão no hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-[left,opacity] duration-700 ease-[var(--ease-premium)] group-hover:left-[120%] group-hover:opacity-100"
      />
      {icon && <span className="relative shrink-0 [&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span>}
      <span className="relative whitespace-nowrap">{children}</span>
      {!icon && (
        <span className="relative -mr-1 grid h-6 w-6 place-items-center overflow-hidden">
          <ArrowIcon className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-x-6" />
          <ArrowIcon className="absolute h-4 w-4 -translate-x-6 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-x-0" />
        </span>
      )}
    </motion.a>
  )
}
