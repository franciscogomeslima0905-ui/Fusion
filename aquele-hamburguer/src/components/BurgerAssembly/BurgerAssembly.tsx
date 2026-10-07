import { useLayoutEffect, useRef } from 'react'
import { ArrowDown, MessageCircle } from 'lucide-react'
import { gsap, isLowPower } from '../../lib/gsap'
import { SITE, whatsappUrl } from '../../lib/links'
import { useMouseParallax } from '../../hooks/useMouseParallax'
import { ASSEMBLED_H, layers, usingPlaceholders } from './layers'

/*
 * BurgerAssembly — a assinatura do site.
 *
 * Uma única timeline GSAP (duração fixa de 10 "unidades") é ligada ao scroll com ScrollTrigger
 * (pin + scrub). O PROGRESSO DO SCROLL é o progresso da animação: rolar para baixo monta,
 * rolar para cima desmonta. Nada é disparado por onEnter/autoplay.
 *
 *   0 – 1      ambiente reage (luz, fumaça)
 *   0.8 – 7.4  camadas convergem de baixo para cima (pão inferior → pão superior), com rotação,
 *              profundidade (translateZ/rotateX), escala e foco
 *   7.4 – 8.4  hambúrguer fecha; luz de estúdio no máximo
 *   8 – 9.3    câmera desloca o produto; título e chamadas entram
 *   9.3 – 10   texto sai; câmera avança para a carne e escurece → próxima cena
 */

const TOTAL = 10
const WORDS = [
  { text: 'Carne.', side: 'l', in: 2.0, out: 3.7 },
  { text: 'Queijo.', side: 'r', in: 3.7, out: 5.2 },
  { text: 'Molho.', side: 'l', in: 5.2, out: 6.7 },
  { text: 'Pão.', side: 'r', in: 6.7, out: 8.1 },
] as const

// Movimentos secundários sutis por camada (início → fim = 0)
const secondary: Record<string, { x: number; r: number; s: number; rx: number; z: number; blur: number; start: number; dur: number }> = {
  'bottom-bun': { x: -14, r: 2.5, s: 1.06, rx: -10, z: -30, blur: 2.4, start: 0.8, dur: 2.6 },
  'sauce-bottom': { x: 38, r: -3, s: 1.04, rx: 6, z: -10, blur: 0, start: 1.2, dur: 2.6 },
  beef: { x: -22, r: 2, s: 1.05, rx: -6, z: 0, blur: 3, start: 1.6, dur: 2.8 },
  cheese: { x: -30, r: -4, s: 1.03, rx: 8, z: 18, blur: 0, start: 2.2, dur: 2.6 },
  lettuce: { x: 34, r: 5, s: 1.04, rx: 14, z: 30, blur: 0, start: 2.7, dur: 2.6 },
  tomato: { x: -46, r: -6, s: 1.03, rx: 10, z: 40, blur: 0, start: 3.0, dur: 2.6 },
  onion: { x: 52, r: 9, s: 1.05, rx: 12, z: 52, blur: 0, start: 3.4, dur: 2.6 },
  'sauce-top': { x: -34, r: 4, s: 1.03, rx: 8, z: 64, blur: 0, start: 3.7, dur: 2.7 },
  'top-bun': { x: 28, r: -8, s: 1.08, rx: 16, z: 90, blur: 2, start: 4.0, dur: 3.2 },
}

export default function BurgerAssembly() {
  const root = useRef<HTMLElement>(null)
  const scene = useRef<HTMLDivElement>(null)
  const cam = useRef<HTMLDivElement>(null)
  const tilt = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)

  useMouseParallax(tilt, true, 1.5)

  useLayoutEffect(() => {
    const rootEl = root.current, sceneEl = scene.current, camEl = cam.current, stageEl = stage.current
    if (!rootEl || !sceneEl || !camEl || !stageEl) return
    if (usingPlaceholders && import.meta.env.DEV) {
      console.info('[BurgerAssembly] Usando camadas PLACEHOLDER. Coloque as fotos reais recortadas em src/assets/burger/ (veja README).')
    }

    const q = gsap.utils.selector(rootEl)
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add(
        {
          reduce: '(prefers-reduced-motion: reduce)',
          desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
          mobile: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
        },
        context => {
          const { reduce, desktop } = context.conditions as { reduce: boolean; desktop: boolean }

          // Reduced motion: hambúrguer montado, sem pin, conteúdo visível.
          if (reduce) {
            gsap.set(q('.bl'), { clearProps: 'transform,filter,opacity' })
            gsap.set(q('.reveal-line'), { yPercent: 0, y: 0, opacity: 1 })
            gsap.set(q('.reveal-fade'), { opacity: 1, y: 0 })
            gsap.set(q('.word, .cue-fade, .fade-out'), { opacity: 0 })
            gsap.set(q('.halo, .spot2'), { opacity: 1 })
            gsap.set(q('.ground-shadow'), { opacity: 0.8 })
            // mesmo enquadramento final do desktop/mobile, sem animação
            const wide = window.innerWidth >= 768
            gsap.set(camEl, wide ? { x: () => window.innerWidth * 0.23, scale: 1.04 } : { y: () => -window.innerHeight * 0.2, scale: 0.78 })
            return
          }

          const low = isLowPower()
          const vh = () => window.innerHeight
          const vw = () => window.innerWidth
          const unit = () => stageEl.offsetWidth / 600 // px por unidade de 600
          const spread = desktop ? 0.82 : 0.7 // vista explodida mais compacta no mobile

          // zoom inicial para a vista explodida caber na tela
          const fitScale = () => {
            const u = unit()
            const center = (ASSEMBLED_H / 2) * u
            let min = Infinity, max = -Infinity
            for (const l of layers) {
              const y = (l.y + l.off * spread) * u
              min = Math.min(min, y + l.h * u * 0.05)
              max = Math.max(max, y + l.h * u * 0.92)
            }
            const top = desktop ? 112 : 96 // respiro do header
            const bottom = desktop ? 64 : 70
            return Math.min(1, (vh() / 2 - top) / (center - min), (vh() / 2 - bottom) / (max - center))
          }
          // deslocamento vertical (px) do centro da carne em relação ao centro do palco
          const beefDy = () => {
            const b = layers.find(l => l.id === 'beef')!
            return (b.y + b.h * 0.5 - ASSEMBLED_H / 2) * unit()
          }

          gsap.set(q('.reveal-line'), { yPercent: 140, y: 0, opacity: 0 })
          gsap.set(q('.reveal-fade'), { opacity: 0, y: 24 })
          gsap.set(q('.word'), { opacity: 0 })
          gsap.set(q('.cue-fade'), { opacity: 1 })

          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: rootEl,
              start: 'top top',
              end: () => '+=' + Math.round(vh() * (desktop ? 4.6 : 4)),
              scrub: 0.6, // scrub: o tempo da timeline segue o scroll (com leve suavização)
              pin: sceneEl,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: self => {
                const bar = q('.progress-bar')[0] as HTMLElement | undefined
                if (bar) bar.style.transform = `scaleY(${self.progress.toFixed(4)})`
              },
            },
          })

          // ── câmera: aproxima conforme o hambúrguer fecha
          tl.fromTo(camEl, { scale: () => fitScale(), x: 0, y: () => (desktop ? 14 : 8) }, { scale: 1, ease: 'power2.in', duration: 7.4 }, 0)

          // ── ambiente (spot de luz, brilho do chão, fumaça)
          tl.fromTo(q('.spot'), { opacity: 0.22 }, { opacity: 1, duration: 7.6, ease: 'power1.in' }, 0)
          tl.fromTo(q('.floor-glow'), { opacity: 0.15, scaleX: 0.6 }, { opacity: 0.95, scaleX: 1, duration: 7.6 }, 0)
          tl.fromTo(q('.smoke-wrap'), { opacity: 0.2, y: 60 }, { opacity: 0.85, y: 0, duration: 8 }, 0)
          tl.fromTo(q('.ground-shadow'), { opacity: 0.1, scaleX: 0.55 }, { opacity: 0.8, scaleX: 1, duration: 7.4, ease: 'power2.in' }, 0)
          tl.fromTo(q('.cue-fade'), { opacity: 1 }, { opacity: 0, duration: 0.5 }, 0)

          // ── camadas
          for (const l of layers) {
            const el = q(`[data-layer="${l.id}"]`)[0] as HTMLElement
            const s = secondary[l.id]
            const lowFx = low
            tl.fromTo(
              el,
              {
                y: () => l.off * spread * unit(),
                x: () => s.x * unit() * (desktop ? 1 : 0.6),
                rotation: s.r,
                scale: s.s,
                ...(lowFx ? {} : { rotationX: s.rx, z: s.z, filter: `blur(${s.blur}px)` }),
              },
              {
                y: 0, x: 0, rotation: 0, scale: 1,
                ...(lowFx ? {} : { rotationX: 0, z: 0, filter: 'blur(0px)' }),
                duration: s.dur,
                ease: 'power3.inOut',
              },
              s.start,
            )
          }

          // ── palavras gigantes atrás do produto
          q('.word').forEach((el, i) => {
            const w = WORDS[i]
            const dir = w.side === 'l' ? -1 : 1
            tl.fromTo(el, { opacity: 0, x: 80 * dir, scale: 1.06 }, { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: 'power2.out' }, w.in)
            tl.to(el, { opacity: 0, x: -60 * dir, duration: 0.8, ease: 'power2.in' }, w.out)
          })

          // ── fechamento: brilho do produto
          tl.fromTo(q('.halo'), { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' }, 7.3)
          tl.fromTo(q('.spot2'), { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 7.4)

          // ── câmera desloca o produto, título entra
          if (desktop) {
            tl.to(camEl, { x: () => vw() * 0.23, scale: 1.04, duration: 1.2, ease: 'power3.inOut' }, 7.7)
          } else {
            tl.to(camEl, { y: () => -vh() * 0.2, scale: 0.78, duration: 1.2, ease: 'power3.inOut' }, 7.7)
          }
          tl.to(q('.reveal-line'), { yPercent: 0, y: 0, opacity: 1, duration: 0.8, stagger: 0.14, ease: 'power3.out' }, 7.9)
          tl.to(q('.reveal-fade'), { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' }, 8.3)

          // ── saída: texto some, câmera avança até a carne, escurece
          tl.to(q('.reveal-line, .reveal-fade'), { opacity: 0, y: -30, duration: 0.45, ease: 'power2.in' }, 9.0)
          tl.to(
            camEl,
            {
              scale: desktop ? 2.7 : 2.5,
              x: 0,
              y: () => -beefDy() * (desktop ? 2.7 : 2.5),
              duration: 1,
              ease: 'power2.in',
            },
            9.0,
          )
          tl.to(q('.fade-out'), { opacity: 1, duration: 0.55, ease: 'power2.in' }, 9.45)
          tl.to({}, { duration: 0 }, TOTAL) // fixa a duração em 10 unidades
        },
      )
    }, rootEl)

    return () => ctx.revert()
  }, [])

  return (
    <section id="inicio" ref={root} aria-label="Aquele Hambúrguer" className="relative bg-ink">
      <div ref={scene} className="relative h-[100svh] w-full overflow-hidden bg-ink">
        {/* ── ambiente */}
        <div aria-hidden className="ambient pointer-events-none absolute inset-0">
          <div
            className="spot absolute inset-x-0 top-0 h-[115%]"
            style={{ background: 'radial-gradient(ellipse 46% 78% at 50% -8%, rgba(255,178,70,.30), rgba(255,140,30,.09) 45%, transparent 72%)' }}
          />
          <div
            className="spot2 absolute inset-x-0 top-0 h-[100%] opacity-0"
            style={{ background: 'radial-gradient(ellipse 34% 60% at 50% -6%, rgba(255,214,140,.34), transparent 70%)' }}
          />
          <div
            className="floor-glow absolute bottom-[-12%] left-1/2 h-[46%] w-[120%] -translate-x-1/2"
            style={{ background: 'radial-gradient(ellipse 50% 50% at 50% 60%, rgba(255,150,20,.30), transparent 70%)' }}
          />
          <div className="smoke-wrap absolute inset-0">
            <div className="smoke absolute left-[8%] top-[30%] h-[55%] w-[46%] rounded-full opacity-60 blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,.10), transparent)' }} />
            <div className="smoke absolute right-[6%] top-[18%] h-[60%] w-[44%] rounded-full opacity-60 blur-3xl [animation-delay:-7s]" style={{ background: 'radial-gradient(closest-side, rgba(255,214,150,.12), transparent)' }} />
          </div>
        </div>

        {/* ── palavras gigantes (linguagem da marca, poucas) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
          {WORDS.map(w => (
            <span
              key={w.text}
              className={`word display absolute top-1/2 -translate-y-1/2 text-[30vw] leading-none md:text-[16vw] ${w.side === 'l' ? 'left-[-2vw]' : 'right-[-2vw]'}`}
              style={{ color: 'transparent', WebkitTextStroke: '2px rgba(255,184,0,.34)' }}
            >
              {w.text}
            </span>
          ))}
        </div>

        {/* ── câmera → inclinação do mouse → palco → camadas */}
        <div ref={cam} className="absolute inset-0 will-change-transform" style={{ perspective: '1100px', transformOrigin: '50% 50%' }}>
          <div ref={tilt} className="absolute inset-0 grid place-items-center" style={{ transformStyle: 'preserve-3d' }}>
            <div
              ref={stage}
              className="relative [--bw:min(88vw,50svh)] md:[--bw:min(40vw,60svh,720px)]"
              style={{ width: 'var(--bw)', height: `calc(var(--bw) * ${(ASSEMBLED_H / 600).toFixed(4)})`, transformStyle: 'preserve-3d' }}
            >
              <div
                aria-hidden
                className="halo absolute left-1/2 top-1/2 h-[120%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ background: 'radial-gradient(closest-side, rgba(255,184,0,.28), transparent 70%)' }}
              />
              <div
                aria-hidden
                className="ground-shadow absolute left-1/2 w-[92%] -translate-x-1/2 rounded-[50%] bg-black blur-2xl"
                style={{ bottom: '-7%', height: '9%' }}
              />
              {layers.map((l, i) => (
                <img
                  key={l.id}
                  data-layer={l.id}
                  data-placeholder={l.placeholder || undefined}
                  className="bl absolute left-0 w-full select-none will-change-transform"
                  style={{ top: `${(l.y / ASSEMBLED_H) * 100}%`, zIndex: layers.length - i, height: 'auto' }}
                  src={l.src}
                  alt={i === 0 ? 'Hambúrguer artesanal do Aquele Hambúrguer, montado camada por camada' : ''}
                  role={i === 0 ? undefined : 'presentation'}
                  width={1200}
                  height={l.h * 2}
                  draggable={false}
                  decoding="async"
                  fetchPriority="high"
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── título final */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center px-5 pb-[9svh] md:items-center md:justify-start md:px-[6vw] md:pb-0">
          <div className="pointer-events-auto max-w-[92vw] text-center md:max-w-[46vw] md:text-left">
            <h1 className="display text-[clamp(3.6rem,17vw,5.6rem)] md:text-[clamp(4rem,8vw,9rem)]">
              <span className="-mt-[.16em] block overflow-hidden pt-[.16em]"><span className="reveal-line block">Aquele</span></span>
              <span className="-mt-[.16em] block overflow-hidden pt-[.16em]"><span className="reveal-line block text-gold">Hambúrguer</span></span>
            </h1>
            <p className="reveal-fade mx-auto mt-4 max-w-md text-base font-medium text-white/85 md:mx-0 md:mt-6 md:text-xl">
              Feito para matar a fome de verdade.
            </p>
            <div className="reveal-fade mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <a className="btn btn-solid" href={SITE.menuUrl} target="_blank" rel="noopener noreferrer">Ver cardápio</a>
              <a className="btn btn-line" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={18} aria-hidden /> Pedir agora
              </a>
            </div>
          </div>
        </div>

        {/* ── indicador de scroll */}
        <div aria-hidden className="cue-fade pointer-events-none absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-[.68rem] font-bold tracking-[.3em] text-white/70">
          ROLE
          <span className="relative block h-10 w-px overflow-hidden bg-white/20"><span className="scroll-cue-line absolute inset-0 bg-gold" /></span>
          <ArrowDown size={14} className="text-gold" />
        </div>

        {/* ── progresso da montagem */}
        <div aria-hidden className="absolute right-4 top-1/2 z-20 hidden h-40 w-[3px] -translate-y-1/2 overflow-hidden bg-white/10 md:block">
          <div className="progress-bar h-full w-full origin-top scale-y-0 bg-gold" />
        </div>

        {/* ── transição para a próxima cena */}
        <div aria-hidden className="fade-out pointer-events-none absolute inset-0 z-30 bg-ink opacity-0" />
        <div aria-hidden className="grain pointer-events-none absolute inset-0 z-10" />
      </div>
    </section>
  )
}
