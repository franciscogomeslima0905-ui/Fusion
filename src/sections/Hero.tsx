import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'
import handBottom from '../assets/hero/hand-bottom.webp'
import handBottomSm from '../assets/hero/hand-bottom-sm.webp'
import handTop from '../assets/hero/hand-top.webp'
import handTopSm from '../assets/hero/hand-top-sm.webp'
import { site, whatsappMessages } from '../config/site'
import { whatsappLink } from '../lib/whatsapp'
import { Button } from '../components/ui/Button'
import { WhatsAppIcon } from '../components/ui/Icons'
import { OpenBadge } from '../components/ui/OpenBadge'
import { SplitLines } from '../components/ui/Reveal'

const EASE = [0.22, 1, 0.36, 1] as const

/** Luminária hexagonal de LED — assinatura visual do teto da academia. */
function HexLight({ className, red = false, delay = 0 }: { className: string; red?: boolean; delay?: number }) {
  return (
    <motion.svg
      viewBox="0 0 200 174"
      aria-hidden
      className={`absolute mix-blend-screen ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.5, 1] }}
      transition={{ duration: 1.6, delay, times: [0, 0.2, 0.3, 1] }}
    >
      {[14, 7, 2.2].map((w, i) => (
        <polygon
          key={w}
          points="50,6 150,6 194,87 150,168 50,168 6,87"
          fill="none"
          stroke={red ? '#ff2a33' : '#f5f1ea'}
          strokeWidth={w}
          strokeLinejoin="round"
          opacity={[0.12, 0.28, 1][i]}
        />
      ))}
    </motion.svg>
  )
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()

  // ——— rolagem: a mão de cima "coloca" o halter mais perto da outra mão ———
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const placeY = useTransform(scrollYProgress, [0, 0.6], ['0%', '5.5%'])
  const placeX = useTransform(scrollYProgress, [0, 0.6], ['0%', '1.2%'])
  const receiveY = useTransform(scrollYProgress, [0, 0.6], ['0%', '-2.5%'])
  const artScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-25%'])
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const glow = useTransform(scrollYProgress, [0, 0.6], [0.55, 1])

  // ——— parallax sutil com o mouse (somente desktop) ———
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const smx = useSpring(mx, { stiffness: 50, damping: 20 })
  const smy = useSpring(my, { stiffness: 50, damping: 20 })
  const topPX = useTransform(smx, (v) => v * 14)
  const topPY = useTransform(smy, (v) => v * 10)
  const botPX = useTransform(smx, (v) => v * -10)
  const botPY = useTransform(smy, (v) => v * -8)

  useEffect(() => {
    if (reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5)
      my.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [mx, my, reduce])

  return (
    <section id="inicio" ref={ref} aria-label="Fusion Gym — academia premium em Tramandaí" className="grain relative isolate min-h-[100svh] overflow-hidden bg-ink">
      {/* ——— fundo: luzes ——— */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_58%_46%,#1b1b1f_0%,#08080a_60%,#050506_100%)]" />
        <motion.div
          style={{ opacity: glow }}
          className="absolute left-[58%] top-[62%] h-[46vmax] w-[46vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(227_19_27/0.38)_0%,rgb(227_19_27/0.10)_40%,transparent_70%)] max-lg:top-[44%]"
        />
        <div className="absolute -right-[10%] bottom-[-20%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,rgb(163_13_19/0.35),transparent_65%)]" />
        <HexLight className="left-[6%] top-[9%] w-[13vw] min-w-[110px] opacity-60 max-lg:hidden" delay={0.4} />
        <HexLight className="right-[5%] top-[14%] w-[8vw] min-w-[70px] max-sm:right-[6%] max-sm:top-[11%]" red delay={0.9} />
      </div>

      {/* ——— arte: mão colocando o halter perto da outra mão ——— */}
      <motion.div
        aria-hidden
        style={{ scale: reduce ? 1 : artScale }}
        className="pointer-events-none absolute left-1/2 top-[-7svh] aspect-[16/10] w-[205vw] -translate-x-[56%] sm:top-[-4svh] sm:w-[150vw] lg:top-[-9vh] lg:w-[max(96vw,150vh)] lg:-translate-x-[44%]"
      >
        {/* mão que recebe */}
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { x: '9%', y: '12%', opacity: 0 }}
          animate={{ x: '0%', y: '0%', opacity: 1 }}
          transition={{ duration: 2.1, ease: EASE, delay: 0.25 }}
        >
          <motion.div className="absolute inset-0" style={reduce ? undefined : { y: receiveY }}>
            <motion.picture className="absolute inset-0 block" style={reduce ? undefined : { x: botPX, y: botPY }}>
              <source media="(max-width: 767px)" srcSet={handBottomSm} />
              <img src={handBottom} alt="" width={2400} height={1500} fetchPriority="high" decoding="async" className="h-full w-full object-contain" />
            </motion.picture>
          </motion.div>
        </motion.div>

        {/* brilho vermelho no espaço entre o halter e a mão */}
        <motion.div
          className="absolute left-[57%] top-[63%] h-[16%] w-[11%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fusion/60 blur-[40px]"
          initial={{ opacity: 0 }}
          animate={reduce ? { opacity: 0.6 } : { opacity: [0, 0.9, 0.45, 0.85] }}
          transition={reduce ? undefined : { duration: 4, delay: 1.8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />

        {/* mão que segura o halter */}
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { x: '-12%', y: '-16%', opacity: 0 }}
          animate={{ x: '0%', y: '0%', opacity: 1 }}
          transition={{ duration: 2.3, ease: EASE, delay: 0.05 }}
        >
          <motion.div className="absolute inset-0" style={reduce ? undefined : { x: placeX, y: placeY }}>
            <motion.div
              className="absolute inset-0"
              animate={reduce ? undefined : { y: ['0%', '1.4%', '0%'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2.4 }}
            >
              <motion.picture className="absolute inset-0 block" style={reduce ? undefined : { x: topPX, y: topPY }}>
                <source media="(max-width: 767px)" srcSet={handTopSm} />
                <img src={handTop} alt="" width={2400} height={1500} fetchPriority="high" decoding="async" className="h-full w-full object-contain" />
              </motion.picture>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ——— véus para leitura ——— */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/60 via-35% to-transparent max-lg:via-ink/80 max-lg:via-45%" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-ink/80 to-transparent max-lg:hidden" />

      {/* ——— conteúdo ——— */}
      <motion.div
        style={reduce ? undefined : { y: textY, opacity: textOpacity }}
        className="relative mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-end px-4 pb-8 pt-28 sm:px-8 sm:pb-10"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: EASE }}
          className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-mist"
        >
          <span className="h-px w-8 bg-fusion" />
          Academia premium · Tramandaí — RS
        </motion.p>

        <SplitLines
          as="h1"
          immediate
          delay={0.35}
          className="display text-[clamp(2.9rem,12.6vw,8.6rem)] text-bone"
          lines={[
            'Eleve o',
            <>
              seu <span className="italic text-fusion text-glow-red">nível.</span>
            </>,
          ]}
        />

        <div className="mt-7 grid gap-8 lg:mt-9 lg:grid-cols-[minmax(0,32rem)_1fr] lg:items-end">
          <motion.p
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 1.05, duration: 0.9, ease: EASE }}
            className="max-w-md text-[15px] leading-relaxed text-mist sm:text-base"
          >
            Treine em uma academia premium, preparada para quem busca <strong className="font-semibold text-bone">evolução, performance e resultados.</strong>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.25, duration: 0.9, ease: EASE }}
            className="flex flex-col gap-3 sm:flex-row lg:justify-end"
          >
            <Button href={whatsappLink(whatsappMessages.visit)} external size="lg" ariaLabel="Quero conhecer a Fusion — abre o WhatsApp">
              Quero conhecer a Fusion
            </Button>
            <Button href={whatsappLink(whatsappMessages.hero)} external variant="ghost" size="lg" icon={<WhatsAppIcon />}>
              Falar no WhatsApp
            </Button>
          </motion.div>
        </div>

        {/* faixa inferior: dados rápidos + indicador de rolagem */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="mt-8 grid gap-6 border-t border-white/10 pt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-steel sm:mt-12 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr]"
        >
          <p className="hidden leading-relaxed sm:block">
            {site.address.street}
            <br />
            {site.address.city} — {site.address.state}
          </p>
          <a href="#sobre" className="group order-last hidden items-center justify-center gap-3 text-mist sm:col-span-2 sm:flex lg:order-none lg:col-span-1" aria-label="Rolar para a próxima seção">
            <span className="relative flex h-9 w-5 justify-center rounded-full border border-white/25">
              <motion.span
                className="mt-1.5 h-1.5 w-[3px] rounded-full bg-fusion"
                animate={reduce ? undefined : { y: [0, 12, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </span>
            <span className="transition-colors group-hover:text-bone">Role para descobrir</span>
          </a>
          <div className="leading-relaxed sm:text-right">
            <OpenBadge className="flex-wrap sm:justify-end" />
            <p className="mt-1">Seg — Sex · 05h às 22h</p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
