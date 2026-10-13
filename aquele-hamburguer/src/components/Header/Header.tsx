import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { MessageCircle } from 'lucide-react'
import { SITE, whatsappUrl } from '../../lib/links'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import logo from '../../assets/logo/logo.png'

const links = [
  { id: 'inicio', label: 'Início' },
  { id: 'cardapio', label: 'Cardápio' },
  { id: 'hamburgueres', label: 'Hambúrgueres' },
  { id: 'avaliacoes', label: 'Avaliações' },
  { id: 'localizacao', label: 'Localização' },
]

export default function Header() {
  const { scrolled } = useScrollProgress(40)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('inicio')

  // indicador da seção atual
  useEffect(() => {
    const els = links.map(l => document.getElementById(l.id)).filter(Boolean) as HTMLElement[]
    if (!els.length) return
    const io = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,height,backdrop-filter] duration-500 ${
        scrolled || open ? 'bg-black/70 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className={`mx-auto flex items-center justify-between px-5 transition-[height] duration-500 md:px-[4vw] ${scrolled ? 'h-[60px]' : 'h-[84px]'}`}>
        <a href="#inicio" onClick={go('inicio')} aria-label={`${SITE.name} — início`} className="relative z-10 flex items-center">
          <img src={logo} alt={SITE.name} width={150} height={150} className={`w-auto transition-[height] duration-500 ${scrolled ? 'h-10' : 'h-14'}`} fetchPriority="high" />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-9 lg:flex">
          {links.map(l => (
            <a key={l.id} href={`#${l.id}`} onClick={go(l.id)} aria-current={active === l.id} className="link-u font-head text-[.8rem] font-bold uppercase tracking-[.14em] text-white/90 hover:text-white">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="relative z-10 flex items-center gap-3">
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-solid hidden !py-3 !text-[.76rem] sm:inline-flex">
            <MessageCircle size={16} aria-hidden /> Pedir agora
          </a>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center lg:hidden"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen(v => !v)}
          >
            <span className="relative block h-4 w-7">
              <motion.span className="absolute left-0 h-[2.5px] w-full bg-white" animate={open ? { top: 7, rotate: 45 } : { top: 0, rotate: 0 }} />
              <motion.span className="absolute left-0 top-[7px] h-[2.5px] w-full bg-gold" animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }} />
              <motion.span className="absolute left-0 h-[2.5px] w-full bg-white" animate={open ? { top: 7, rotate: -45 } : { top: 14, rotate: 0 }} />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.5, ease: [0.7, 0, 0.2, 1] }}
            className="fixed inset-0 -z-10 flex flex-col justify-center bg-ink px-8 pt-20 lg:hidden"
          >
            <nav aria-label="Menu móvel" className="flex flex-col gap-2">
              {links.map((l, i) => (
                <motion.a
                  key={l.id}
                  href={`#${l.id}`}
                  onClick={go(l.id)}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.15 + i * 0.06 } }}
                  className={`display text-[clamp(2.6rem,12vw,4.5rem)] ${active === l.id ? 'text-gold' : 'text-white'}`}
                >
                  {l.label}
                </motion.a>
              ))}
            </nav>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-solid mt-10 self-start">
              <MessageCircle size={18} aria-hidden /> Pedir agora
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
