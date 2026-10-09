import { useEffect, useState } from 'react'
import { nav, whatsappMessages } from '../../config/site'
import { whatsappLink } from '../../lib/whatsapp'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icons'
import { Logo } from './Logo'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ${scrolled || open ? 'bg-white/90 shadow-card backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <a href="#inicio" aria-label="Voltar ao início">
          <Logo />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-medium text-ink/75 transition-colors hover:text-teal-700">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button href={whatsappLink(whatsappMessages.booking)} external arrow className="max-sm:hidden !px-4 !py-2.5">
            Agendar consulta
          </Button>
          <button
            type="button"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg text-teal-900 hover:bg-teal-50 lg:hidden"
          >
            <Icon name={open ? 'close' : 'menu'} className="h-6 w-6" />
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Menu móvel" className="border-t border-teal-100 bg-white px-5 pb-5 pt-2 lg:hidden">
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="block border-b border-teal-50 py-3 text-base font-medium text-ink/85">
              {item.label}
            </a>
          ))}
          <Button href={whatsappLink(whatsappMessages.booking)} external arrow className="mt-4 w-full">
            Agendar consulta
          </Button>
        </nav>
      )}
    </header>
  )
}
