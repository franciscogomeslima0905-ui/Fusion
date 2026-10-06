import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useState } from 'react'
import { navLinks, site, whatsappMessages } from '../../config/site'
import { whatsappLink } from '../../lib/whatsapp'
import { InstagramIcon, WhatsAppIcon } from '../ui/Icons'
import { Logo, Wordmark } from './Logo'

const EASE = [0.22, 1, 0.36, 1] as const

export function Navbar() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 40)
    setHidden(y > 600 && y > prev && !open)
  })

  // trava o scroll do body com o menu mobile aberto e fecha com ESC
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: hidden ? -100 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE, delay: hidden ? 0 : 0.2 }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={`transition-[background-color,border-color,backdrop-filter] duration-500 ${
            scrolled || open ? 'border-b border-white/[0.07] bg-ink/75 backdrop-blur-xl' : 'border-b border-transparent'
          }`}
        >
          <nav aria-label="Principal" className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:h-[72px] sm:px-8">
            <a href="#inicio" className="flex items-center gap-3" aria-label="Fusion Gym — início" onClick={() => setOpen(false)}>
              <Logo className="h-9 w-9 sm:h-10 sm:w-10" />
              <Wordmark />
            </a>

            <ul className="hidden items-center gap-1 lg:flex">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="group relative px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-mist/80 transition-colors hover:text-white"
                  >
                    {l.label}
                    <span className="absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-fusion transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-x-100" />
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href={whatsappLink(whatsappMessages.nav)}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden h-10 items-center gap-2 rounded-full bg-fusion px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_8px_30px_-8px_rgb(227_19_27/0.9)] transition-colors hover:bg-fusion-glow sm:inline-flex"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Fale conosco
              </a>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="menu-mobile"
                aria-label={open ? 'Fechar menu' : 'Abrir menu'}
                className="relative grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/[0.03] transition-colors hover:border-white/40 lg:hidden"
              >
                <span className={`absolute h-px w-4 bg-bone transition-transform duration-500 ease-[var(--ease-premium)] ${open ? 'rotate-45' : '-translate-y-[4px]'}`} />
                <span className={`absolute h-px w-4 bg-bone transition-transform duration-500 ease-[var(--ease-premium)] ${open ? '-rotate-45' : 'translate-y-[4px]'}`} />
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col bg-ink/[0.97] px-6 pb-8 pt-24 backdrop-blur-xl lg:hidden"
          >
            <div aria-hidden className="led-line absolute inset-x-0 top-16" />
            <ul className="flex flex-1 flex-col justify-center gap-2">
              {[{ href: '#inicio', label: 'Início' }, ...navLinks, { href: '#horarios', label: 'Horários' }].map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: EASE }}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 border-b border-white/[0.06] py-3 text-[clamp(1.9rem,9vw,2.6rem)] font-extrabold uppercase leading-none tracking-tight font-semiwide active:text-fusion"
                  >
                    <span className="font-mono text-[11px] font-normal tracking-[0.2em] text-fusion">0{i + 1}</span>
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="grid grid-cols-2 gap-3">
              <a
                href={whatsappLink(whatsappMessages.nav)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-14 items-center justify-center gap-2 rounded-full bg-fusion text-[12px] font-semibold uppercase tracking-[0.14em]"
              >
                <WhatsAppIcon className="h-5 w-5" /> WhatsApp
              </a>
              <a
                href={site.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-14 items-center justify-center gap-2 rounded-full border border-white/20 text-[12px] font-semibold uppercase tracking-[0.14em]"
              >
                <InstagramIcon className="h-5 w-5" /> Instagram
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
