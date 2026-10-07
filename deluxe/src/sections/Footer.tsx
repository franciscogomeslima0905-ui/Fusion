import { site } from '../config/site'
import { MaskText } from '../components/MaskText'
import { BuyButton, WhatsButton } from '../components/Buttons'

export function Footer() {
  return (
    <footer className="relative z-10 bg-ink px-5 pb-10 pt-28 text-white sm:px-10 sm:pt-40">
      <div className="mx-auto max-w-[1500px] text-center">
        <MaskText text="Seu próximo look está a um clique." className="mx-auto max-w-5xl font-display text-[clamp(2.8rem,7.4vw,7rem)] font-medium leading-[0.97] text-gold-light" />
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <BuyButton />
          <WhatsButton />
        </div>
        <div className="mt-28 flex flex-col items-center justify-between gap-6 border-t border-white/15 pt-8 text-sm text-white/60 sm:flex-row">
          <img src={site.logo} alt="Deluxe" className="h-14 w-14 rounded-full ring-1 ring-gold/50" />
          <p>{site.address}</p>
          <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold-light">@{site.instagram}</a>
        </div>
        <p className="mt-8 text-xs text-white/40">© {new Date().getFullYear()} Deluxe. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
