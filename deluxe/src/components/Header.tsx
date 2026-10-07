import { useEffect, useState } from 'react'
import { site } from '../config/site'
import { BuyButton, WhatsButton } from './Buttons'

/** Fixo durante toda a navegação: os dois botões de conversão ficam sempre à mão. */
export function Header() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid ? 'bg-ink/85 py-2 backdrop-blur-md' : 'py-4'
      }`}
    >
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 sm:px-8">
        <a href="#topo" aria-label="Deluxe, início" className="flex items-center">
          <img src={site.logo} alt="Deluxe" className="h-11 w-11 rounded-full ring-1 ring-gold/50 sm:h-12 sm:w-12" />
        </a>
        <div className="flex items-center gap-2 sm:gap-3">
          <WhatsButton size="sm" />
          <BuyButton size="sm" />
        </div>
      </div>
    </header>
  )
}
