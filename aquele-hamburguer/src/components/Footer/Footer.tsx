import { SITE, mapsSearchUrl, whatsappUrl } from '../../lib/links'
import logo from '../../assets/logo/logo.png'

const links = [
  { label: 'Cardápio', href: SITE.menuUrl },
  { label: 'WhatsApp', href: whatsappUrl() },
  { label: 'Instagram', href: SITE.instagramUrl },
  { label: 'Google Maps', href: mapsSearchUrl },
]

export default function Footer() {
  return (
    <footer className="bg-ink px-5 pb-10 pt-[12vh] md:px-[5vw]">
      <div className="grid gap-12 border-t border-white/15 pt-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <img src={logo} alt={SITE.name} width={150} height={150} loading="lazy" className="h-24 w-24" />
          <p className="display mt-5 text-3xl">{SITE.name}</p>
        </div>
        <address className="not-italic text-ash md:col-span-4">
          <p className="text-white">{SITE.street}</p>
          <p>{SITE.district} — Tramandaí/RS</p>
          <p className="mt-3">Telefone: <a className="link-u text-white" href={`tel:${SITE.phoneTel}`}>{SITE.phoneDisplay}</a></p>
        </address>
        <nav aria-label="Rodapé" className="md:col-span-3">
          <ul className="flex flex-col gap-3 font-head text-lg font-bold">
            {links.map(l => (
              <li key={l.label}><a className="link-u" href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a></li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="mt-16 text-sm text-ash">© {new Date().getFullYear()} {SITE.name} — Tramandaí/RS. Todos os direitos reservados.</p>
    </footer>
  )
}
