import type { ReactNode } from 'react'

/** Linha de título com recorte para a animação de máscara (acentos preservados pelo padding). */
export function Mask({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className="-mt-[.18em] block overflow-hidden pt-[.18em] pb-[.04em]">
      <span data-mask className={`block ${className}`}>{children}</span>
    </span>
  )
}
