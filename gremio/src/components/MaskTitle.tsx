import type { ElementType } from 'react'

/** Título em linhas que sobem de dentro de uma máscara (animado por useSectionFx via data-mask). */
export function MaskTitle({
  lines,
  as: Tag = 'h2',
  className = '',
  accent,
}: {
  lines: string[]
  as?: ElementType
  className?: string
  /** índice da linha destacada em azul */
  accent?: number
}) {
  return (
    <Tag data-mask className={`t-display ${className}`}>
      {lines.map((line, i) => (
        <span key={line} className="mask-line">
          <span className={accent === i ? 'text-blue' : ''}>{line}</span>
        </span>
      ))}
    </Tag>
  )
}

export function Kicker({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`t-head flex items-center gap-4 text-[0.78rem] text-blue ${className}`}>
      <span className="h-px w-10 bg-blue" />
      {children}
    </p>
  )
}
