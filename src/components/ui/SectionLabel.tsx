import { Reveal } from './Reveal'

/** Rótulo de seção no estilo "[01] SOBRE —————", com numeração mono e linha fina. */
export function SectionLabel({ index, children, className = '' }: { index: string; children: string; className?: string }) {
  return (
    <Reveal className={`flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-steel ${className}`}>
      <span className="text-fusion">[{index}]</span>
      <span>{children}</span>
      <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
    </Reveal>
  )
}
