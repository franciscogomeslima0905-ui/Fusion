import { site, whatsappLink } from '../config/site'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-colors duration-300 whitespace-nowrap'

export function BuyButton({ size = 'lg', className = '' }: { size?: 'sm' | 'lg'; className?: string }) {
  const pad = size === 'sm' ? 'px-4 py-2 text-xs sm:text-sm sm:px-5' : 'px-8 py-4 text-sm sm:text-base'
  return (
    <a
      href={site.storeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${pad} bg-gold text-ink hover:bg-gold-light ${className}`}
    >
      Comprar online
    </a>
  )
}

export function WhatsButton({ size = 'lg', tone = 'dark', className = '' }: { size?: 'sm' | 'lg'; tone?: 'dark' | 'light'; className?: string }) {
  const pad = size === 'sm' ? 'px-4 py-2 text-xs sm:text-sm sm:px-5' : 'px-8 py-4 text-sm sm:text-base'
  const color =
    tone === 'dark'
      ? 'border border-white/50 text-white hover:bg-white hover:text-ink'
      : 'border border-ink/40 text-ink hover:bg-ink hover:text-white'
  return (
    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={`${base} ${pad} ${color} ${className}`}>
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-1.9 1.3-.5.1-1.1.1-1.8-.1a16 16 0 0 1-5.7-5c-.4-.6-1.4-1.9-1.4-3.6 0-1.7.9-2.5 1.2-2.8.3-.3.7-.4.9-.4h.6c.2 0 .4 0 .6.5l.9 2.2c.1.2.1.4 0 .5l-.4.6-.3.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.4 2.5 1.5.3.2.5.1.6-.1l.8-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.4 0 .2 0 .7-.2 1.3Z" />
      </svg>
      Falar no WhatsApp
    </a>
  )
}
