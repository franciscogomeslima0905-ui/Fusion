import { useEffect, useState } from 'react'
import { messages, nav } from '../config/site'
import { Logo } from './Logo'
import { WhatsAppButton } from './Buttons'

export function Header() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
        solid || open ? 'border-b border-line bg-ink/85 backdrop-blur-md' : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between gap-6 px-5 sm:px-8 lg:h-[84px] lg:px-12">
        <a href="#inicio" aria-label="Escola Grêmio — início" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Logo size={48} className="lg:!h-14 lg:!w-14" />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-9 lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group relative font-head text-[0.8rem] font-medium tracking-[0.2em] text-white/85 uppercase transition-colors hover:text-white"
            >
              {item.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-blue transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <WhatsAppButton message={messages.header} size="sm" className="hidden sm:inline-flex">
            Aula experimental
          </WhatsAppButton>
          <button
            type="button"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
            className="relative h-11 w-11 lg:hidden"
          >
            <span className={`absolute left-2.5 h-[2px] w-6 bg-white transition-all duration-300 ${open ? 'top-[22px] rotate-45' : 'top-[16px]'}`} />
            <span className={`absolute left-2.5 top-[22px] h-[2px] w-6 bg-white transition-opacity duration-200 ${open ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`absolute left-2.5 h-[2px] w-6 bg-white transition-all duration-300 ${open ? 'top-[22px] -rotate-45' : 'top-[28px]'}`} />
          </button>
        </div>
      </div>

      <div
        id="menu-mobile"
        className={`fixed inset-x-0 top-[68px] bottom-0 bg-ink/97 backdrop-blur-md transition-all duration-500 lg:hidden ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <nav aria-label="Menu móvel" className="flex h-full flex-col justify-between px-6 pt-8 pb-10">
          <ul>
            {nav.map((item, i) => (
              <li key={item.href} className="border-b border-line">
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="t-display flex items-baseline gap-4 py-4 text-[2.6rem] text-white transition-colors active:text-blue"
                  style={{ transitionDelay: open ? `${i * 40}ms` : '0ms' }}
                >
                  <span className="t-head text-xs tracking-[0.2em] text-blue">0{i + 1}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <WhatsAppButton message={messages.header} size="lg" className="w-full" onClick={() => setOpen(false)}>
            Aula experimental
          </WhatsAppButton>
        </nav>
      </div>
    </header>
  )
}
