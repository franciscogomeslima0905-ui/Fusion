import logo from '../../assets/logo.webp'

export function Logo({ className = 'h-10 w-10' }: { className?: string }) {
  return <img src={logo} alt="Fusion Gym" width={320} height={320} className={`rounded-full ring-1 ring-white/10 ${className}`} decoding="async" />
}

/** Marca em texto, ecoando o lettering largo e itálico da logo. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`flex flex-col leading-none ${className}`}>
      <span className="font-wide text-[15px] font-extrabold italic tracking-[0.08em] text-bone">FUSION</span>
      <span className="mt-1 flex items-center gap-1.5 font-mono text-[8px] tracking-[0.45em] text-fusion">
        <span className="h-px w-3 bg-fusion/60" />
        GYM
      </span>
    </span>
  )
}
