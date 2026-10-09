import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { messages, site } from '../config/site'
import { WhatsAppButton } from '../components/Buttons'
import { FrameCanvas } from '../scene/FrameCanvas'
import { VideoScrub } from '../scene/VideoScrub'
import { IllustratedScene } from '../scene/illustrated/IllustratedScene'
import { buildIllustrated } from '../scene/illustrated/choreography'
import { useSceneMode } from '../scene/useSceneMode'

const CHAPTERS = ['O treinador', 'A prancheta', 'A jogada', 'A turma']

/**
 * Abertura cinematográfica fixada (pin) e controlada pela rolagem (scrub):
 *   0–25%   o treinador, sozinho, explicando
 *   25–50%  a câmera se aproxima da prancheta
 *   50–75%  o treinador movimenta as peças azuis sobre o campo
 *   75–100% a câmera se afasta e revela os alunos; surge o título e o convite
 *
 * Fontes da cena (veja README):
 *   drawn  → ilustração vetorial animada (src/scene/illustrated) — padrão
 *   frames → public/media/hero/frames-*   |   video → public/media/hero/*.mp4   (filmagem real, quando existir)
 * Depuração: acrescente ?cena=0.5 à URL para congelar a cena num ponto (0–1) sem fixar a rolagem.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const { mode, manifest, portrait } = useSceneMode()
  const [mediaReady, setMediaReady] = useState(false)
  const onReady = useCallback(() => setMediaReady(true), [])
  const isMedia = mode === 'frames' || mode === 'video'
  const isDrawn = mode === 'drawn' || mode === 'static'

  useLayoutEffect(() => {
    if (mode === 'loading' || !root.current) return
    const el = root.current
    const debug = new URLSearchParams(window.location.search).get('cena')
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el)
      const mm = gsap.matchMedia()

      mm.add({ desk: '(min-width: 1024px)', mob: '(max-width: 1023.98px)' }, (c) => {
        const desk = !!c.conditions?.desk
        const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })

        // cena ilustrada: câmera, braços, dedos, peças e alunos
        const scene = isDrawn
          ? buildIllustrated(el.querySelector('svg[data-scene]') as SVGSVGElement, tl, { desk, idle: mode === 'drawn' })
          : null

        /* ---------- camadas comuns: título, convite, indicadores ---------- */
        tl.to(q('[data-hint]'), { autoAlpha: 0, duration: 0.04 }, 0)
        if (isMedia) tl.fromTo(q('[data-scrim]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0.78)
        if (isDrawn) tl.fromTo(q('[data-scrim-drawn]'), { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.8)
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
        tl.eventCallback('onUpdate', () => {
          scene?.render()
          sync()
        })

        const finish = () => {
          scene?.dispose()
          tl.kill()
        }

        if (mode === 'static' || debug !== null) {
          // "reduzir movimento" (ou depuração): composição congelada, sem fixar a rolagem
          tl.progress(mode === 'static' ? 1 : Math.min(1, Math.max(0, parseFloat(debug ?? '1') || 0)))
          scene?.render()
          sync()
          return finish
        }

        gsap.set(q('[data-h]'), { autoAlpha: 0 })
        tl.progress(0)
        scene?.render()
        sync()
        gsap.from(q('[data-stage]'), { opacity: 0, duration: 1.2, ease: 'power2.out', delay: 0.1 })
        gsap.from(q('[data-hint] > *'), { autoAlpha: 0, y: 14, duration: 1, delay: 1.1 })

        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * (desk ? 5 : 4.2))}`,
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
          finish()
        }
      })
    }, el)
    return () => ctx.revert()
  }, [mode, isMedia, isDrawn])

  const poster = manifest?.video?.poster
  const scrim = 'absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/10 lg:bg-gradient-to-r lg:from-ink/85 lg:via-ink/35 lg:to-transparent'

  return (
    <section id="inicio" ref={root} aria-label="Abertura" className="relative h-[100svh] min-h-[560px] overflow-hidden bg-ink text-white">
      {/* ===== ilustração animada ===== */}
      {isDrawn && (
        <div data-stage className="absolute inset-0">
          <IllustratedScene compact={portrait} />
          {/* leitura do título sobre a cena aberta */}
          <div data-scrim-drawn className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/45 to-transparent opacity-0 lg:bg-gradient-to-r lg:from-ink/80 lg:via-ink/30 lg:to-transparent" />
        </div>
      )}

      {/* ===== mídia real: sequência de frames ou vídeo ===== */}
      {mode === 'frames' && manifest?.frames && (
        <div data-stage className="absolute inset-0 bg-ink">
          <FrameCanvas set={(portrait ? manifest.frames.mobile ?? manifest.frames.desktop : manifest.frames.desktop ?? manifest.frames.mobile)!} progressRef={progress} onReady={onReady} />
          <div data-scrim className={scrim} style={{ visibility: 'hidden' }} />
        </div>
      )}
      {mode === 'video' && manifest?.video && (
        <div data-stage className="absolute inset-0 bg-ink">
          <VideoScrub
            src={(portrait ? manifest.video.mobile ?? manifest.video.desktop : manifest.video.desktop ?? manifest.video.mobile)!}
            poster={poster}
            progressRef={progress}
            onReady={onReady}
          />
          <div data-scrim className={scrim} style={{ visibility: 'hidden' }} />
        </div>
      )}
      {isMedia && !mediaReady && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink">
          <span className="t-head text-xs text-steel">Carregando abertura…</span>
        </div>
      )}

      {/* ===== título e convite (fase 4) ===== */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="mx-auto flex h-full max-w-[1600px] items-end px-5 pb-[6svh] sm:px-8 lg:items-start lg:px-12 lg:pt-[12svh] lg:pb-0">
          <div className="max-w-[44rem] lg:max-w-none">
            <p data-h="kicker" className="t-head mb-3 flex items-center gap-3 text-[0.72rem] text-blue lg:mb-5 lg:text-[0.8rem]">
              <span className="h-px w-8 bg-blue" />
              Tramandaí · Capão da Canoa
            </p>
            <h1
              data-h="title"
              className="t-display text-[clamp(2.1rem,10.4vw,3.6rem)] sm:text-[clamp(3.4rem,9vw,6rem)] lg:text-[clamp(2.6rem,min(5.4vw,9.5svh),7rem)] lg:whitespace-nowrap"
            >
              <span className="mask-line"><span>Mais que futebol.</span></span>
              <span className="mask-line"><span className="text-blue">Formamos o futuro.</span></span>
            </h1>
            <p data-h="lead" className="mt-4 max-w-sm text-[0.98rem] leading-relaxed text-steel lg:mt-5 lg:max-w-none lg:text-[1.05rem] lg:whitespace-nowrap">
              Há mais de {site.years} anos formando atletas e cidadãos dentro e fora de campo.
            </p>
            <div data-h="cta" className="pointer-events-auto mt-5 lg:mt-6">
              <WhatsAppButton message={messages.hero} size="lg" className="w-full sm:w-auto lg:!py-4">
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
      <a href="#escola" className="t-head absolute right-5 bottom-7 z-30 hidden text-[0.68rem] text-white/60 transition-colors hover:text-white sm:right-8 lg:right-12 lg:block">
        Pular abertura ↓
      </a>
      <div className="absolute inset-x-0 bottom-0 z-30 h-[3px] bg-white/10">
        <div data-bar className="h-full origin-left scale-x-0 bg-blue" />
      </div>
    </section>
  )
}
