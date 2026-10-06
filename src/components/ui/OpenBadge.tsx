import { useEffect, useState } from 'react'
import { openStatus } from '../../lib/hours'

/** Status ao vivo "Aberto agora / Fechado agora", calculado no fuso de Tramandaí. */
export function useOpenStatus() {
  const [status, setStatus] = useState(() => openStatus())
  useEffect(() => {
    const id = window.setInterval(() => setStatus(openStatus()), 30_000)
    return () => window.clearInterval(id)
  }, [])
  return status
}

export function OpenBadge({ className = '' }: { className?: string }) {
  const s = useOpenStatus()
  return (
    <span className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] ${className}`}>
      <span className="relative flex h-2 w-2">
        {s.open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${s.open ? 'bg-emerald-400' : 'bg-fusion'}`} />
      </span>
      <span className="text-bone">{s.label}</span>
      {s.detail && <span className="text-steel">· {s.detail}</span>}
    </span>
  )
}
