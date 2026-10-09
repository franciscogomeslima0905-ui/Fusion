import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { messages, photos, site } from '../config/site'
import { WhatsAppButton } from '../components/Buttons'
import { FrameCanvas } from '../scene/FrameCanvas'
import { VideoScrub } from '../scene/VideoScrub'
import { TacticalBoard } from '../scene/TacticalBoard'
import { pieces } from '../scene/tactics'
import { useSceneMode } from '../scene/useSceneMode'

const CHAPTERS = ['O treinador', 'A prancheta', 'A jogada', 'A turma']

/**
 * Abertura cinematográfica fixada (pin) e controlada pela rolagem (scrub):
 *   0–25%   o treinador, sozinho, explicando
 *   25–50%  a câmera se aproxima da prancheta
 *   50–75%  as peças azuis são movimentadas sobre o campo
 *   75–100% a câmera se afasta e revela os alunos; surge o título e o convite
 *
 * Fontes da cena (veja README):
 *   frames → public/media/hero/frames-*  | video → public/media/hero/*.mp4  (arquivos reais de filmagem/render)
 *   stills → cena provisória com fotos reais da escola + prancheta vetorial (usada enquanto não há mídia)
 */
export function Hero() {
  const root = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const { mode, manifest, portrait } = useSceneMode()
  const [mediaReady, setMediaReady] = useState(false)
  const onReady = useCallback(() => setMediaReady(true), [])
  const isMedia = mode === 'frames' || mode === 'video'

  useLayoutEffect(() => {
    if (mode === 'loading' || !root.current) return
    const el = root.current
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el)
      const mm = gsap.matchMedia()

      mm.add({ desk: '(min-width: 1024px)', mob: '(max-width: 1023.98px)' }, (c) => {
        const desk = !!c.conditions?.desk
        const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })

        /* ---------- cena provisória (fotos reais + prancheta vetorial) ---------- */
        if (mode === 'stills' || mode === 'static') {
          const frame = q('[data-frame]')
          // câmera: leve respiração contínua, como câmera na mão (só quando há movimento)
          // fase 1 — o treinador
          tl.fromTo(q('[data-shot="1"] img'), { scale: 1.02, xPercent: 0 }, { scale: 1.18, xPercent: -3, duration: 0.26, ease: 'power1.inOut' }, 0)
          // fase 2 — aproximação da prancheta
          tl.to(q('[data-shot="1"]'), { autoAlpha: 0, duration: 0.07 }, 0.22)
          tl.fromTo(q('[data-shot="2"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.07 }, 0.22)
          tl.fromTo(
            q('[data-shot="2"] img'),
            { scale: 1.04, transformOrigin: '52% 68%' },
            { scale: 2.6, transformOrigin: '52% 68%', duration: 0.24, ease: 'power2.inOut' },
            0.26,
          )
          tl.fromTo(
            q('[data-board]'),
            { autoAlpha: 0, scale: 0.88, rotation: -5 },
            { autoAlpha: 1, scale: 1, rotation: -1.6, duration: 0.09, ease: 'power2.out' },
            0.41,
          )
          tl.to(q('[data-shot="2"]'), { autoAlpha: 0, duration: 0.06 }, 0.46)
          // fase 3 — as peças azuis se movem
          const P3 = { start: 0.5, len: 0.25 }
          tl.to(q('[data-board]'), { rotation: 0, scale: 1.04, duration: P3.len, ease: 'power1.inOut' }, P3.start)
          pieces.forEach((p) => {
            const piece = q(`[data-piece="${p.id}"]`)
            gsap.set(piece, { x: p.from[0], y: p.from[1], transformOrigin: '0 0' })
            if (p.from[0] === p.to[0] && p.from[1] === p.to[1]) return
            const t0 = P3.start + p.at[0] * P3.len
            const d = (p.at[1] - p.at[0]) * P3.len
            tl.to(piece, { scale: 1.16, duration: d * 0.18, ease: 'power2.out' }, t0) // pega a peça
            tl.to(piece, { x: p.to[0], y: p.to[1], duration: d * 0.78, ease: 'power2.inOut' }, t0 + d * 0.12) // desliza
            tl.to(piece, { scale: 1, duration: d * 0.2, ease: 'power2.in' }, t0 + d * 0.8) // solta
            const trail = q(`[data-trail="${p.id}"]`)
            gsap.set(trail, { attr: { x2: p.from[0], y2: p.from[1] } })
            tl.to(trail, { attr: { x2: p.to[0], y2: p.to[1] }, duration: d * 0.78, ease: 'power2.inOut' }, t0 + d * 0.12)
          })
          tl.fromTo(
            q('[data-zone]'),
            { opacity: 0, scale: 0.6, svgOrigin: '372 228' },
            { opacity: 1, scale: 1, svgOrigin: '372 228', duration: 0.04, ease: 'power2.out' },
            P3.start + P3.len * 0.8,
          )
          // fase 4 — a câmera se afasta e revela a turma
          tl.to(q('[data-board]'), { scale: 0.86, autoAlpha: 0, duration: 0.09, ease: 'power2.in' }, 0.76)
          tl.fromTo(q('[data-shot="4"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.09 }, 0.76)
          tl.fromTo(
            q('[data-shot="4"] img'),
            { scale: 1.9, transformOrigin: '34% 52%' },
            { scale: 1, transformOrigin: '34% 52%', duration: 0.24, ease: 'power2.out' },
            0.75,
          )
          tl.to(q('[data-ambient="a"]'), { opacity: 0, duration: 0.14 }, 0.78)
          tl.fromTo(q('[data-ambient="b"]'), { opacity: 0 }, { opacity: 1, duration: 0.14 }, 0.78)
          tl.to(
            frame,
            desk ? { xPercent: 0, x: () => window.innerWidth * 0.215, scale: 1.04, duration: 0.2, ease: 'power2.inOut' } : { y: () => -window.innerHeight * 0.2, scale: 0.7, duration: 0.2, ease: 'power2.inOut' },
            0.8,
          )
        }

        /* ---------- camadas comuns: título, convite, indicadores ---------- */
        tl.to(q('[data-hint]'), { autoAlpha: 0, duration: 0.04 }, 0)
        if (isMedia) tl.fromTo(q('[data-scrim]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0.78)
        tl.fromTo(q('[data-h="kicker"]'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.05, ease: 'power3.out' }, 0.86)
        tl.fromTo(q('[data-h="title"] .mask-line > span'), { yPercent: 112 }, { yPercent: 0, duration: 0.07, stagger: 0.035, ease: 'power4.out' }, 0.87)
        tl.set(q('[data-h="title"]'), { autoAlpha: 1 }, 0.87)
        tl.fromTo(q('[data-h="lead"]'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.05, ease: 'power3.out' }, 0.93)
        tl.fromTo(q('[data-h="cta"]'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.05, ease: 'power3.out' }, 0.96)
        tl.to(q('[data-bar]'), { scaleX: 1, duration: 1, ease: 'none', transformOrigin: '0 50%' }, 0)

        const chapters = q('[data-chapter]')
        const sync = () => {
          const p = tl.progress()
          progress.current = p
          const idx = Math.min(3, Math.floor(p * 4))
          chapters.forEach((n, i) => ((n as HTMLElement).style.opacity = i === idx ? '1' : i < idx ? '0.55' : '0.28'))
        }
        tl.eventCallback('onUpdate', sync)

        if (mode === 'static') {
          // "reduzir movimento": mostra a composição final, sem fixar a rolagem
          tl.progress(1)
          sync()
          return () => tl.kill()
        }

        gsap.set(q('[data-h]'), { autoAlpha: 0 })
        tl.progress(0)
        sync()

        // entrada (não depende da rolagem)
        gsap.from(q('[data-frame]'), { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.4, ease: 'power4.inOut', delay: 0.15 })
        gsap.from(q('[data-hint]'), { autoAlpha: 0, y: 14, duration: 1, delay: 1.2 })

        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * (desk ? 4.6 : 4))}`,
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 10,
          animation: tl,
        })
        // o pin do hero criou um espaçador: reposiciona os gatilhos das seções seguintes
        const raf = requestAnimationFrame(() => ScrollTrigger.refresh())
        return () => {
          cancelAnimationFrame(raf)
          st.kill()
          tl.kill()
        }
      })
    }, el)
    return () => ctx.revert()
  }, [mode, isMedia])

  const poster = manifest?.video?.poster
  const photoCls = 'photo absolute inset-0 h-full w-full object-cover'

  return (
    <section
      id="inicio"
      ref={root}
      aria-label="Abertura"
      className="relative h-[100svh] min-h-[560px] overflow-hidden bg-ink text-white"
    >
      {mode === 'loading' && null}

      {/* ===== cena provisória: fotos reais da escola + prancheta vetorial ===== */}
      {(mode === 'stills' || mode === 'static') && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <img data-ambient="a" src={photos.prancheta.src} alt="" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-100 blur-[48px] saturate-150" />
            <img data-ambient="b" src={photos.treinadorGrupo.src} alt="" className="absolute inset-0 h-full w-full scale-125 object-cover blur-[48px] saturate-150" style={{ opacity: 0 }} />
            <div className="absolute inset-0 bg-ink/70" />
          </div>

          <div
            data-frame
            className="grain absolute inset-0 m-auto aspect-[3/4] w-[min(86vw,calc(62svh*0.75))] overflow-hidden bg-coal shadow-[0_30px_120px_rgb(0_0_0/0.6)] lg:w-[min(40vw,calc(78svh*0.75))]"
          >
            <div className="absolute inset-0 animate-[sway_9s_ease-in-out_infinite_alternate]">
              <div data-shot="1" className="absolute inset-0 overflow-hidden">
                <img src={photos.treinadorCampo.src} alt={photos.treinadorCampo.alt} className={photoCls} />
              </div>
              <div data-shot="2" className="absolute inset-0 overflow-hidden" style={{ visibility: 'hidden' }}>
                <img src={photos.prancheta.src} alt={photos.prancheta.alt} className={photoCls} />
              </div>
              <div data-board className="absolute inset-[6%] shadow-[0_20px_60px_rgb(0_0_0/0.55)]" style={{ visibility: 'hidden' }}>
                <TacticalBoard className="h-full w-full" />
              </div>
              <div data-shot="4" className="absolute inset-0 overflow-hidden" style={{ visibility: 'hidden' }}>
                <img src={photos.treinadorGrupo.src} alt={photos.treinadorGrupo.alt} className={photoCls} />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_90px_rgb(8_10_13/0.7)]" />
            {/* marcas de enquadramento */}
            {['left-3 top-3 border-l-2 border-t-2', 'right-3 top-3 border-r-2 border-t-2', 'bottom-3 left-3 border-b-2 border-l-2', 'bottom-3 right-3 border-b-2 border-r-2'].map((c) => (
              <span key={c} className={`pointer-events-none absolute h-5 w-5 border-blue ${c}`} />
            ))}
          </div>
        </div>
      )}

      {/* ===== mídia real: sequência de frames ou vídeo ===== */}
      {mode === 'frames' && manifest?.frames && (
        <div className="absolute inset-0 bg-ink">
          <FrameCanvas set={(portrait ? manifest.frames.mobile ?? manifest.frames.desktop : manifest.frames.desktop ?? manifest.frames.mobile)!} progressRef={progress} onReady={onReady} />
          <div data-scrim className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/10 lg:bg-gradient-to-r lg:from-ink/85 lg:via-ink/35 lg:to-transparent" style={{ visibility: 'hidden' }} />
        </div>
      )}
      {mode === 'video' && manifest?.video && (
        <div className="absolute inset-0 bg-ink">
          <VideoScrub
            src={(portrait ? manifest.video.mobile ?? manifest.video.desktop : manifest.video.desktop ?? manifest.video.mobile)!}
            poster={poster}
            progressRef={progress}
            onReady={onReady}
          />
          <div data-scrim className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/10 lg:bg-gradient-to-r lg:from-ink/85 lg:via-ink/35 lg:to-transparent" style={{ visibility: 'hidden' }} />
        </div>
      )}
      {isMedia && !mediaReady && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink">
          <span className="t-head text-xs text-steel">Carregando abertura…</span>
        </div>
      )}

      {/* ===== título e convite (fase 4) ===== */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="mx-auto flex h-full max-w-[1600px] items-end px-5 pb-[7svh] sm:px-8 lg:items-center lg:px-12 lg:pb-0">
          <div className="max-w-[44rem] lg:max-w-none">
            <p data-h="kicker" className="t-head mb-4 flex items-center gap-3 text-[0.72rem] text-blue lg:mb-6 lg:text-[0.8rem]">
              <span className="h-px w-8 bg-blue" />
              Tramandaí · Capão da Canoa
            </p>
            <h1
              data-h="title"
              className="t-display text-[clamp(2.1rem,10.4vw,3.6rem)] sm:text-[clamp(3.4rem,9vw,6rem)] lg:text-[clamp(3.2rem,6vw,7.6rem)] lg:whitespace-nowrap"
            >
              <span className="mask-line"><span>Mais que futebol.</span></span>
              <span className="mask-line"><span className="text-blue">Formamos o futuro.</span></span>
            </h1>
            <p data-h="lead" className="mt-5 max-w-md text-[0.98rem] leading-relaxed text-steel lg:mt-7 lg:text-lg">
              Há mais de {site.years} anos formando atletas e cidadãos dentro e fora de campo.
            </p>
            <div data-h="cta" className="pointer-events-auto mt-6 lg:mt-9">
              <WhatsAppButton message={messages.hero} size="lg" className="w-full sm:w-auto">
                Agende uma aula experimental
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </div>

      {/* ===== indicadores: dica de rolagem, capítulos, barra de progresso ===== */}
      <div data-hint className="pointer-events-none absolute inset-x-0 bottom-[5svh] z-20 flex flex-col items-center gap-3">
        <span className="t-head text-[0.7rem] text-white/80">Role para assistir</span>
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-blue to-transparent" />
      </div>
      <ol className="absolute bottom-7 left-12 z-20 hidden gap-8 lg:flex" aria-hidden="true">
        {CHAPTERS.map((c, i) => (
          <li key={c} data-chapter className="t-head flex items-center gap-2 text-[0.68rem] text-white transition-opacity duration-300" style={{ opacity: 0.28 }}>
            <span className="text-blue">0{i + 1}</span>
            {c}
          </li>
        ))}
      </ol>
      <a
        href="#escola"
        className="t-head absolute right-5 bottom-7 z-30 hidden text-[0.68rem] text-white/60 transition-colors hover:text-white sm:right-8 lg:right-12 lg:block"
      >
        Pular abertura ↓
      </a>
      <div className="absolute inset-x-0 bottom-0 z-30 h-[3px] bg-white/10">
        <div data-bar className="h-full origin-left scale-x-0 bg-blue" />
      </div>
    </section>
  )
}
