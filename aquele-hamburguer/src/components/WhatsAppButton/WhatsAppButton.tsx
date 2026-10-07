import { AnimatePresence, motion } from 'motion/react'
import { whatsappUrl } from '../../lib/links'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { WhatsAppIcon } from '../Icons'

/** Botão flutuante integrado ao design: bloco amarelo com ícone; expande o texto no hover/foco. */
export default function WhatsAppButton() {
  const { scrolled } = useScrollProgress(120)
  return (
    <AnimatePresence>
      {scrolled && (
        <motion.a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Pedir agora pelo WhatsApp"
          data-cursor="PEDIR"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.7, 0, 0.2, 1] }}
          className="group fixed bottom-4 right-4 z-40 flex h-14 items-center overflow-hidden bg-gold text-ink shadow-[0_10px_30px_-10px_rgba(0,0,0,.8)] md:bottom-6 md:right-6"
        >
          <span className="grid h-14 w-14 shrink-0 place-items-center"><WhatsAppIcon size={26} /></span>
          <span className="max-w-0 overflow-hidden whitespace-nowrap font-head text-sm font-extrabold uppercase tracking-[.12em] transition-[max-width,padding] duration-500 group-hover:max-w-[10rem] group-hover:pr-5 group-focus-visible:max-w-[10rem] group-focus-visible:pr-5">
            Pedir agora
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
