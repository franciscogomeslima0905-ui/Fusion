import { img } from '../data/images'
import { restaurant as r, mapsPlaceUrl } from '../data/restaurant'
import { generalOrderLink } from '../utils/whatsapp'

export default function Footer() {
  const link = 'cond text-lg text-ash hover:text-bone'
  return (
    <footer className="border-t border-bone/10 bg-ink px-5 py-14 sm:px-12">
      <div className="mx-auto grid max-w-[1400px] gap-10 sm:grid-cols-[auto_1fr_auto] sm:items-start">
        <img src={img.logo} alt="Big Burger" width="80" height="80" loading="lazy" className="h-20 w-20" />
        <address className="cond text-lg not-italic leading-snug text-ash">
          <span className="text-bone">Big Burger</span><br />
          {r.address.street}<br />
          {r.address.district} - {r.address.city}/{r.address.state}<br />
          {r.phoneDisplay}<br />
          {r.instagramHandle}
        </address>
        <nav aria-label="Rodapé" className="flex flex-col gap-1">
          <a className={link} href="#cardapio">Cardápio</a>
          <a className={link} href={r.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a className={link} href={generalOrderLink()} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a className={link} href={mapsPlaceUrl} target="_blank" rel="noopener noreferrer">Google Maps</a>
        </nav>
      </div>
      <p className="mono mx-auto mt-12 max-w-[1400px] text-ash/60">© {new Date().getFullYear()} Big Burger · Tramandaí/RS</p>
    </footer>
  )
}
