import { motion, useTransform } from 'motion/react'
import StoryScene, { Beat, Frame, Chapter } from './StoryScene'
import { img } from '../data/images'
import { restaurant } from '../data/restaurant'

const pad = (n) => String(n).padStart(2, '0')

export default function NaChapa() {
  return (
    <StoryScene id="chapa" chapter="03" vh={340} label="Na chapa">
      {(p) => <Stage p={p} />}
    </StoryScene>
  )
}

function Stage({ p }) {
  // relógio controlado pelo scroll: 11:00 → 00:00 (horário real de funcionamento)
  const clock = useTransform(p, [0.05, 0.85], [11 * 60, 24 * 60], { clamp: true })
  const time = useTransform(clock, (m) => `${pad(Math.floor(m / 60) % 24)}:${pad(Math.floor(m % 60))}`)
  const clip = useTransform(p, [0, 0.4], ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'])
  const scale = useTransform(p, [0, 1], [1.25, 1])
  const photoY = useTransform(p, [0, 1], ['8%', '-8%'])
  const textY = useTransform(p, [0, 1], ['12%', '-22%'])
  const heat = useTransform(p, [0, 0.9], [0, 0.55])

  return (
    <div className="relative h-full w-full bg-ink">
      <motion.div
        aria-hidden
        style={{ opacity: heat }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_72%_60%,rgba(227,27,35,.45),transparent_70%)]"
      />
      <Frame />

      <motion.div
        data-rm-static
        style={{ clipPath: clip, y: photoY }}
        className="absolute right-[7vw] top-[16svh] z-10 h-[52svh] w-[62vw] max-w-[420px] overflow-hidden sm:right-[12vw] sm:top-[12svh] sm:h-[76svh] sm:w-[30vw]"
      >
        <motion.img src={img.chapa.src} alt={img.chapa.alt} loading="lazy" style={{ scale }} className="photo-grade h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />
      </motion.div>

      <motion.div style={{ y: textY }} className="absolute left-5 top-[14svh] z-20 sm:left-12">
        <Chapter n="03" className="mb-4">Na chapa</Chapter>
        <h2 className="display text-[26vw] sm:text-[13vw]">Na<br />chapa</h2>
      </motion.div>

      <div className="absolute bottom-[7svh] left-5 z-20 sm:left-12">
        <p className="mono mb-1 text-gold">Aberto todos os dias</p>
        <motion.p data-rm-static className="display text-[24vw] leading-none text-bone tabular-nums sm:text-[12vw]">
          {time}
        </motion.p>
      </div>

      <Beat p={p} range={[0.1, 0.5]} className="absolute bottom-[26svh] left-5 right-5 z-20 text-left sm:bottom-[8svh] sm:left-auto sm:right-12 sm:max-w-sm sm:text-right">
        <p className="cond text-2xl font-bold leading-tight">O melhor xis e as melhores refeições.</p>
      </Beat>
      <Beat p={p} range={[0.55, 1.2]} hold className="absolute bottom-[26svh] left-5 right-5 z-20 text-left sm:bottom-[8svh] sm:left-auto sm:right-12 sm:max-w-sm sm:text-right">
        <p className="cond text-2xl font-bold leading-tight">{restaurant.hours.label}.</p>
      </Beat>
    </div>
  )
}
