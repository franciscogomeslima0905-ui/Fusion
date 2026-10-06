import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'
import { whatsappMessages } from '../../config/site'
import { whatsappLink } from '../../lib/whatsapp'
import { WhatsAppIcon } from '../ui/Icons'

/** Botão flutuante do WhatsApp — aparece depois que o visitante sai do hero. */
export function FloatingWhatsApp() {
  const { scrollY } = useScroll()
  const [show, setShow] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setShow(y > window.innerHeight * 0.8))

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href={whatsappLink(whatsappMessages.floating)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conversar com a Fusion Gym no WhatsApp"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex h-14 items-center gap-0 overflow-hidden rounded-full bg-[#25D366] pl-4 pr-4 text-ink shadow-[0_10px_40px_-8px_rgb(37_211_102/0.7)] sm:right-6"
        >
          <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/40 [animation-duration:2.6s]" />
          <WhatsAppIcon className="relative h-6 w-6" />
          <span className="relative max-w-0 overflow-hidden whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.12em] transition-[max-width,margin] duration-500 ease-[var(--ease-premium)] group-hover:ml-2.5 group-hover:max-w-[160px]">
            Fale conosco
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
