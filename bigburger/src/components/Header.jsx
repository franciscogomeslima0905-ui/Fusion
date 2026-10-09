import { useEffect, useState } from 'react'
import { img } from '../data/images'
import { generalOrderLink } from '../utils/whatsapp'
import { restaurant } from '../data/restaurant'

export default function Header() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const link = 'cond hidden text-[.95rem] font-medium tracking-[.14em] text-bone/80 transition-colors hover:text-bone sm:inline'
  return (
    <header
      className={`fixed inset-x-0 top-0 z-[80] flex items-center justify-between px-5 transition-all duration-300 sm:px-12 ${
        solid ? 'h-14 bg-ink/85 backdrop-blur-md' : 'h-20 bg-transparent'
      }`}
    >
      <a href="#inicio" aria-label="Big Burger — início" className="flex items-center gap-3">
        <img src={img.logo} alt="" width="44" height="44" className={`transition-all duration-300 ${solid ? 'h-9 w-9' : 'h-11 w-11'}`} />
        <span className="display text-xl">Big Burger</span>
      </a>
      <nav aria-label="Principal" className="flex items-center gap-7">
        <a className={link} href="#cardapio">Cardápio</a>
        <a className={link} href="#localizacao">Localização</a>
        <a className={link} href={restaurant.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>
        <a
          href={generalOrderLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="cond inline-flex min-h-10 items-center bg-red px-5 text-[.95rem] font-bold tracking-[.14em] text-white transition-colors hover:bg-bone hover:text-ink"
        >
          Pedir
        </a>
      </nav>
    </header>
  )
}
