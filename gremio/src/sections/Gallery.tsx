import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, LazyMotion, domMax, m } from 'motion/react'
import { photos, site, type Photo } from '../config/site'
import { Kicker, MaskTitle } from '../components/MaskTitle'
import { InstagramIcon, ArrowUpRight } from '../components/Icons'
import { useSectionFx } from '../hooks/useSectionFx'

const order: Photo[] = [
  photos.duelo,
  photos.salto,
  photos.comemoracao,
  photos.drible,
  photos.turmaBandeira,
  photos.treinadora,
  photos.turmaGrande,
  photos.equipeTrofeus,
  photos.equipeCopa,
  photos.duplaEscudo,
  photos.treinadorGrupo,
  photos.chute,
  photos.quadraFutsal,
  photos.prancheta,
  photos.turmaTrofeu,
  photos.cones,
  photos.placa,
  photos.treinoGrama,
  photos.treinadorBola,
  photos.alunoTreinador,
  photos.treinadorCampo,
  photos.quadraTreino,
  photos.equipe,
]

/**
 * Galeria com fotos reais da escola: arraste (mouse/toque), efeito de profundidade conforme a posição,
 * ampliação com navegação por teclado/arraste e carregamento preguiçoso.
 */
export function Gallery() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<number | null>(null)
  const [current, setCurrent] = useState(0)
  useSectionFx(root)

  // efeito de profundidade: inclinação/escala/opacidade de cada foto pela distância ao centro
  useEffect(() => {
    const el = track.current!
    const slides = Array.from(el.querySelectorAll<HTMLElement>('[data-slide]'))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const update = () => {
      raf = 0
      const mid = el.scrollLeft + el.clientWidth / 2
      let best = 0
      let bestD = Infinity
      slides.forEach((s, i) => {
        const d = (s.offsetLeft + s.offsetWidth / 2 - mid) / el.clientWidth
        const a = Math.min(Math.abs(d), 1)
        if (Math.abs(d) < bestD) {
          bestD = Math.abs(d)
          best = i
        }
        const inner = s.firstElementChild as HTMLElement
        if (reduce) return
        inner.style.transform = `perspective(1100px) rotateY(${(-d * 30).toFixed(2)}deg) scale(${(1 - a * 0.16).toFixed(3)})`
        inner.style.opacity = String(1 - a * 0.45)
      })
      setCurrent(best)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // arrastar com o mouse (toque usa a rolagem nativa)
  const drag = useRef({ down: false, moved: 0, x: 0, left: 0 })
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    drag.current = { down: true, moved: 0, x: e.clientX, left: track.current!.scrollLeft }
    track.current!.style.cursor = 'grabbing'
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d.down) return
    const dx = e.clientX - d.x
    d.moved = Math.max(d.moved, Math.abs(dx))
    track.current!.scrollLeft = d.left - dx
  }
  const endDrag = () => {
    drag.current.down = false
    if (track.current) track.current.style.cursor = ''
  }

  const go = useCallback((dir: 1 | -1) => {
    const el = track.current!
    const slide = el.querySelector<HTMLElement>('[data-slide]')!
    el.scrollBy({ left: dir * (slide.offsetWidth + 24), behavior: 'smooth' })
  }, [])

  // lightbox: teclado
  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % order.length))
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + order.length) % order.length))
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const shown = open !== null ? order[open] : null

  return (
    <section id="galeria" ref={root} className="relative z-10 overflow-hidden bg-coal py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <Kicker>Galeria</Kicker>
            <MaskTitle lines={['Nossa paixão', 'em cada lance.']} accent={1} className="mt-6 text-[clamp(3rem,9.4vw,10.5rem)] lg:mt-8" />
          </div>
          <div className="flex items-center gap-5">
            <p className="t-head text-sm text-steel tabular-nums">
              <span className="text-white">{String(current + 1).padStart(2, '0')}</span> / {String(order.length).padStart(2, '0')}
            </p>
            <div className="flex">
              {([-1, 1] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => go(d)}
                  aria-label={d === 1 ? 'Próxima foto' : 'Foto anterior'}
                  className="flex h-12 w-12 items-center justify-center border border-line text-white transition-colors hover:border-blue hover:bg-blue hover:text-ink first:border-r-0"
                >
                  <span aria-hidden="true" className="text-xl leading-none">{d === 1 ? '→' : '←'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        ref={track}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        role="list"
        aria-label="Fotos da escola"
        className="no-scrollbar mt-14 flex cursor-grab gap-6 overflow-x-auto px-[max(1.25rem,calc((100vw-1600px)/2+3rem))] py-10 select-none"
        style={{ perspective: '1100px' }}
      >
        {order.map((p, i) => (
          <div key={p.src} data-slide role="listitem" className="w-[68vw] shrink-0 sm:w-[44vw] md:w-[30vw] lg:w-[22vw] xl:w-[19vw]">
            <button
              type="button"
              aria-label={`Ampliar foto ${i + 1}: ${p.alt}`}
              onClick={() => {
                if (drag.current.moved < 6) setOpen(i)
                drag.current.moved = 0
              }}
              className="grain group relative block aspect-[4/5] w-full overflow-hidden bg-ink will-change-transform"
              style={{ transition: 'opacity 0.2s' }}
            >
              <img
                src={p.src}
                alt={p.alt}
                width={p.w}
                height={p.h}
                loading={i < 4 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
                className="photo h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="t-head absolute bottom-3 left-3 text-[0.68rem] text-white/0 transition-colors duration-300 group-hover:text-white">Ampliar +</span>
            </button>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-6 flex max-w-[1600px] flex-col gap-5 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <p className="t-head text-[0.7rem] text-steel/70">Arraste para navegar · Fotos do acervo da escola no Instagram</p>
        <a
          href={site.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 border-b border-white/30 pb-1 font-head text-sm tracking-[0.14em] text-white uppercase transition-colors hover:border-blue hover:text-blue"
        >
          <InstagramIcon className="h-5 w-5" />
          Mais no Instagram {site.instagramHandle}
          <ArrowUpRight />
        </a>
      </div>

      {createPortal(
      <LazyMotion features={domMax} strict>
      <AnimatePresence>
        {shown && open !== null && (
          <m.div
            key="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Foto ampliada"
            className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(null)}
          >
            <m.img
              key={shown.src}
              src={shown.src}
              alt={shown.alt}
              className="photo w-auto max-w-[88vw] cursor-grab object-contain shadow-[0_30px_120px_rgb(0_0_0/0.7)]"
              style={{ height: 'min(72svh, 620px)' }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70) setOpen((open + 1) % order.length)
                else if (info.offset.x > 70) setOpen((open - 1 + order.length) % order.length)
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <p className="t-head absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-steel tabular-nums">
              {String(open + 1).padStart(2, '0')} / {String(order.length).padStart(2, '0')}
            </p>
            <button
              type="button"
              autoFocus
              aria-label="Fechar"
              onClick={() => setOpen(null)}
              className="absolute top-5 right-5 flex h-12 w-12 items-center justify-center border border-line text-2xl text-white transition-colors hover:bg-blue hover:text-ink"
            >
              ×
            </button>
            {([-1, 1] as const).map((d) => (
              <button
                key={d}
                type="button"
                aria-label={d === 1 ? 'Próxima foto' : 'Foto anterior'}
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen((open + d + order.length) % order.length)
                }}
                className={`absolute top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-line text-xl text-white transition-colors hover:bg-blue hover:text-ink sm:flex ${d === 1 ? 'right-6' : 'left-6'}`}
              >
                {d === 1 ? '→' : '←'}
              </button>
            ))}
          </m.div>
        )}
      </AnimatePresence>
      </LazyMotion>,
      document.body,
      )}
    </section>
  )
}
