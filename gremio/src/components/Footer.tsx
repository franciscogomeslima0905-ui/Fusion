import { nav, site } from '../config/site'
import { Logo } from './Logo'
import { InstagramIcon, WhatsAppIcon } from './Icons'

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line bg-[#05070a]">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-20">
        <div className="lg:col-span-5">
          <Logo size={96} />
          <p className="t-display mt-6 text-[2rem] text-white">{site.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-steel">
            Há mais de {site.years} anos formando atletas e cidadãos, dos {site.ages.from} aos {site.ages.to} anos, em Tramandaí e Capão da Canoa — Rio Grande do Sul.
          </p>
        </div>

        <nav aria-label="Rodapé" className="lg:col-span-3">
          <p className="t-head mb-5 text-xs text-blue">Navegação</p>
          <ul className="space-y-3">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="t-head text-sm text-white/80 transition-colors hover:text-blue">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-4">
          <p className="t-head mb-5 text-xs text-blue">Contato</p>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <WhatsAppIcon className="h-5 w-5 text-white" />
              <a href={`https://wa.me/${site.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-white transition-colors hover:text-blue">
                {site.whatsappDisplay}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <InstagramIcon className="h-5 w-5 text-white" />
              <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-white transition-colors hover:text-blue">
                {site.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[1600px] px-5 py-6 text-[0.72rem] text-steel/70 sm:px-8 lg:px-12">
          © {new Date().getFullYear()} {site.name}. Fotos do acervo da escola.
        </p>
      </div>
    </footer>
  )
}
