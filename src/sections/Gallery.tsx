import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { gallery } from '../config/site'
import { ChevronIcon, CloseIcon } from '../components/ui/Icons'
import { Reveal, SplitLines } from '../components/ui/Reveal'
import { SectionLabel } from '../components/ui/SectionLabel'

function Lightbox({ index, onClose, onNav }: { index: number; onClose: () => void; onNav: (dir: 1 | -1) => void }) {
  const photo = gallery[index]
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    document.documentElement.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNav(1)
      if (e.key === 'ArrowLeft') onNav(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      prev?.focus()
    }
  }, [onClose, onNav])

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${index + 1} de ${gallery.length}: ${photo.title}`}
      className="fixed inset-0 z-[70] flex flex-col bg-ink/95 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-mist sm:px-8" onClick={(e) => e.stopPropagation()}>
        <span>
          <span className="text-fusion">{String(index + 1).padStart(2, '0')}</span> / {String(gallery.length).padStart(2, '0')} · {photo.title}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar galeria"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/15 transition-colors hover:border-white/50"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 sm:px-20">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            onClick={(e) => e.stopPropagation()}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) onNav(1)
              else if (info.offset.x > 60) onNav(-1)
            }}
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-full max-w-full cursor-grab touch-pan-y rounded-xl object-contain shadow-2xl active:cursor-grabbing"
          />
        </AnimatePresence>

        {([-1, 1] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onNav(dir)
            }}
            aria-label={dir === 1 ? 'Próxima foto' : 'Foto anterior'}
            className={`absolute top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink/60 backdrop-blur transition-colors hover:border-fusion hover:text-fusion sm:grid ${
              dir === 1 ? 'right-4 sm:right-6' : 'left-4 sm:left-6'
            }`}
          >
            <ChevronIcon className={dir === -1 ? 'rotate-180' : ''} />
          </button>
        ))}
      </div>
      <p className="pb-5 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-steel sm:hidden">Deslize para navegar</p>
    </motion.div>
  )
}

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const nav = useCallback((dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + gallery.length) % gallery.length)), [])

  return (
    <section id="galeria" aria-labelledby="galeria-titulo" className="relative border-t border-white/[0.06] bg-coal">
      <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8 sm:py-32">
        <SectionLabel index="05">Galeria</SectionLabel>
        <div className="mt-10 flex flex-col gap-6 sm:mt-14 lg:flex-row lg:items-end lg:justify-between">
          <SplitLines
            lines={['Veja por dentro', <>da <span className="italic text-fusion">Fusion.</span></>]}
            className="text-[clamp(2.2rem,6vw,5rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.035em] font-semiwide"
          />
          <Reveal delay={0.1}>
            <p id="galeria-titulo" className="max-w-sm text-[15px] leading-relaxed text-mist">
              Fotos reais do nosso espaço. Toque em uma imagem para ampliar.
            </p>
          </Reveal>
        </div>

        <ul className="mt-12 columns-2 gap-3 sm:gap-4 lg:columns-3">
          {gallery.map((p, i) => (
            <Reveal as="li" key={p.src} delay={(i % 3) * 0.08} className="mb-3 break-inside-avoid sm:mb-4">
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`Ampliar foto: ${p.title}`}
                className="group relative block w-full overflow-hidden rounded-2xl border border-white/10"
              >
                <img
                  src={p.srcSm}
                  alt={p.alt}
                  width={p.width}
                  height={p.height}
                  loading="lazy"
                  decoding="async"
                  className={`w-full object-cover transition duration-700 ease-[var(--ease-premium)] group-hover:scale-105 ${i % 3 === 1 ? 'aspect-[4/5]' : 'aspect-[3/5]'} ${i === 0 ? 'lg:aspect-[4/5]' : ''}`}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-bone sm:bottom-4 sm:left-4 sm:right-4">
                  {p.title}
                  <span className="grid h-8 w-8 scale-75 place-items-center rounded-full bg-fusion opacity-0 transition duration-500 group-hover:scale-100 group-hover:opacity-100" aria-hidden>
                    +
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </ul>
      </div>

      <AnimatePresence>{open !== null && <Lightbox index={open} onClose={close} onNav={nav} />}</AnimatePresence>
    </section>
  )
}
