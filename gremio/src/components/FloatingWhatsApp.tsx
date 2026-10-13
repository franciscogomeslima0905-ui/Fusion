import { useEffect, useState } from 'react'
import { messages, whatsappLink } from '../config/site'
import { WhatsAppIcon } from './Icons'

/** Botão flutuante discreto: aparece depois da abertura e some quando o rodapé está à vista. */
export function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const next = document.getElementById('escola')
      const pastHero = next ? next.getBoundingClientRect().top < window.innerHeight * 0.6 : y > window.innerHeight
      const nearEnd = window.innerHeight + y > document.documentElement.scrollHeight - 220
      setVisible(pastHero && !nearEnd)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <a
      href={whatsappLink(messages.floating)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a escola pelo WhatsApp"
      tabIndex={visible ? 0 : -1}
      className={`fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_6px_24px_rgb(0_0_0/0.45)] transition-all duration-500 hover:scale-110 sm:right-6 sm:bottom-6 sm:h-14 sm:w-14 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <WhatsAppIcon className="h-6 w-6 sm:h-7 sm:w-7" />
    </a>
  )
}
