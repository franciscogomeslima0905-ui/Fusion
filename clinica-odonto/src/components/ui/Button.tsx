import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { Icon } from './Icons'

type Variant = 'primary' | 'outline' | 'light'

const styles: Record<Variant, string> = {
  primary: 'bg-accent text-white shadow-[0_8px_20px_-8px_rgb(242_107_42/0.8)] hover:bg-accent-deep',
  outline: 'border border-teal-800/40 text-teal-800 hover:border-teal-800 hover:bg-teal-800 hover:text-white',
  light: 'bg-white text-teal-900 hover:bg-teal-50',
}

export function Button({
  variant = 'primary',
  arrow = false,
  className = '',
  children,
  external,
  ...rest
}: {
  variant?: Variant
  arrow?: boolean
  external?: boolean
  children: ReactNode
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`group inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-colors duration-200 ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
      {arrow && <Icon name="arrow" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />}
    </a>
  )
}
