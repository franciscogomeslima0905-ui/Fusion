import { hours, navLinks, site, whatsappMessages } from '../../config/site'
import { whatsappLink } from '../../lib/whatsapp'
import { InstagramIcon, WhatsAppIcon } from '../ui/Icons'
import { Reveal } from '../ui/Reveal'
import { Logo, Wordmark } from './Logo'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative overflow-hidden bg-ink">
      <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-20 sm:px-8 sm:pt-28">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <Reveal>
            <p className="text-[clamp(2.6rem,7vw,5.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.04em] font-semiwide">
              Vamos
              <br />
              <span className="text-steel">conversar.</span>
            </p>
            <a
              href={whatsappLink(whatsappMessages.nav)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 font-mono text-lg text-bone transition-colors hover:text-fusion"
            >
              <WhatsAppIcon className="h-5 w-5 text-fusion" />
              {site.contact.phoneDisplay}
            </a>
          </Reveal>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 sm:gap-8">
            <Reveal delay={0.05}>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-fusion">Navegar</h3>
              <ul className="mt-5 space-y-3 text-sm text-mist">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="transition-colors hover:text-bone">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-fusion">Contato</h3>
              <ul className="mt-5 space-y-3 text-sm text-mist">
                <li>
                  <a href={whatsappLink(whatsappMessages.nav)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-bone">
                    <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                  </a>
                </li>
                <li>
                  <a href={site.contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-bone">
                    <InstagramIcon className="h-4 w-4" /> @{site.contact.instagram}
                  </a>
                </li>
              </ul>
            </Reveal>
            <Reveal delay={0.15}>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-fusion">Endereço</h3>
              <address className="mt-5 text-sm not-italic leading-relaxed text-mist">
                {site.address.street}
                <br />
                {site.address.city} — {site.address.state}
                <br />
                CEP {site.address.zip}
              </address>
            </Reveal>
            <Reveal delay={0.2}>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-fusion">Horários</h3>
              <ul className="mt-5 space-y-3 text-sm text-mist">
                {hours.map((g) => (
                  <li key={g.id}>
                    <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-steel">{g.short}</span>
                    {g.ranges.map((r) => `${r.open} — ${r.close}`).join(' · ')}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>

        {/* assinatura gigante */}
        <div aria-hidden className="pointer-events-none mt-20 select-none overflow-hidden sm:mt-28">
          <p className="bg-gradient-to-b from-white/[0.14] to-white/0 bg-clip-text text-center font-wide text-[21vw] font-black italic leading-[0.8] tracking-[-0.04em] text-transparent">
            FUSION
          </p>
        </div>
        <div aria-hidden className="led-line -mt-2 opacity-70" />

        <div className="mt-8 flex flex-col items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-steel sm:flex-row">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8" />
            <Wordmark />
          </div>
          <p>© {year} Fusion Gym · Todos os direitos reservados.</p>
          <a href="#inicio" className="transition-colors hover:text-bone">
            Voltar ao topo ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
