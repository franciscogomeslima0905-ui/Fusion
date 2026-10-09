import { hours, nav, site } from '../../config/site'
import { Icon } from '../ui/Icons'
import { Logo } from './Logo'

const year = new Date().getFullYear()

export function Footer() {
  const { contact, address } = site
  return (
    <footer className="bg-teal-950 text-teal-100/80">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">{site.tagline} Cuidamos do seu sorriso com carinho, ética e tecnologia.</p>
          <a
            href={contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="mt-5 inline-grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-accent"
          >
            <Icon name="instagram" className="h-5 w-5" />
          </a>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">Navegação</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="transition-colors hover:text-white">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">Contato</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3"><Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{contact.phoneDisplay}</li>
            <li className="flex gap-3"><Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{contact.email}</li>
            <li className="flex gap-3">
              <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{address.street}<br />{address.city} — {address.state}, {address.zip}</span>
            </li>
            <li className="flex gap-3"><Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><span>{hours.lines.join(' · ')}</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto w-full max-w-6xl px-5 py-5 text-xs text-teal-100/60">
          © {year} {site.name}. Todos os direitos reservados. Responsável técnico: {site.responsible}.
        </p>
      </div>
    </footer>
  )
}
