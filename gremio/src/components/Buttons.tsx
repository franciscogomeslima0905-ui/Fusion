import type { ReactNode } from 'react'
import { messages, whatsappLink } from '../config/site'
import { ArrowUpRight } from './Icons'

type Props = {
  message?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'outline' | 'white'
  className?: string
  onClick?: () => void
}

const sizes = {
  sm: 'px-4 py-2.5 text-[0.72rem] tracking-[0.16em]',
  md: 'px-6 py-3.5 text-[0.8rem] tracking-[0.16em]',
  lg: 'px-8 py-5 text-sm sm:text-base tracking-[0.16em]',
}
const variants = {
  solid: 'bg-blue text-ink border-blue before:bg-white',
  white: 'bg-white text-ink border-white before:bg-blue',
  outline: 'bg-transparent text-white border-white/60 before:bg-white hover:text-ink hover:border-white',
}

/**
 * Botão que abre o WhatsApp oficial da escola com mensagem pré-preenchida.
 * Microinteração: faixa que varre o botão e seta ↗ que se desloca.
 */
export function WhatsAppButton({ message = messages.hero, children, size = 'md', variant = 'solid', className = '', onClick }: Props) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center gap-3 overflow-hidden border font-head font-medium uppercase whitespace-nowrap transition-colors duration-300 before:absolute before:inset-0 before:origin-left before:scale-x-0 before:transition-transform before:duration-500 before:ease-[cubic-bezier(.7,0,.2,1)] hover:before:scale-x-100 active:scale-[0.98] ${sizes[size]} ${variants[variant]} ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <span className="relative z-10 inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        <ArrowUpRight />
      </span>
    </a>
  )
}
