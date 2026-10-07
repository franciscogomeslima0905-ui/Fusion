import { motion, useTransform } from 'motion/react'
import StoryScene, { Beat, Frame, Chapter } from './StoryScene'
import { img } from '../data/images'
import { orderLink } from '../utils/whatsapp'

export default function AlaMinuta() {
  return (
    <StoryScene id="ala-minuta" chapter="06" vh={300} label="Ala minuta">
      {(p) => <Stage p={p} />}
    </StoryScene>
  )
}

function Stage({ p }) {
  const clip = useTransform(p, [0.05, 0.6], ['inset(38% 38% 38% 38%)', 'inset(0% 0% 0% 0%)'])
  const scale = useTransform(p, [0, 1], [1.35, 1])
  const left = useTransform(p, [0.1, 0.7], ['0%', '-45%'])
  const right = useTransform(p, [0.1, 0.7], ['0%', '45%'])
  const wordOp = useTransform(p, [0.6, 0.85], [1, 0.4])
  return (
    <div className="relative h-full w-full bg-coal">
      <Frame />
      <motion.div style={{ opacity: wordOp }} className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center">
        <motion.span style={{ x: left }} className="display text-[30vw] text-bone sm:text-[19vw]">Ala</motion.span>
        <motion.span style={{ x: right }} className="display -mt-[4vw] text-[30vw] text-red sm:text-[19vw]">Minuta</motion.span>
      </motion.div>
      <motion.div
        data-rm-static
        style={{ clipPath: clip }}
        className="absolute left-1/2 top-1/2 z-10 aspect-square h-[78svh] max-h-[92vw] -translate-x-1/2 -translate-y-1/2 sm:max-h-none"
      >
        <motion.img src={img.alaCarne.src} alt={img.alaCarne.alt} loading="lazy" style={{ scale }} className="photo-grade h-full w-full object-cover" />
      </motion.div>
      <Beat p={p} range={[0.7, 1.2]} hold className="absolute bottom-[6svh] inset-x-5 z-30 flex flex-col items-start justify-between gap-3 sm:inset-x-12 sm:flex-row sm:items-end">
        <div>
          <Chapter n="06" className="mb-2">Ala minuta</Chapter>
          <p className="cond text-2xl font-bold leading-tight">Comida caseira: arroz, feijão, batata frita e salada.</p>
        </div>
        <a href={orderLink('a Ala minuta')} target="_blank" rel="noopener noreferrer" className="cond border-b-2 border-red pb-0.5 text-lg font-bold tracking-[.12em] hover:text-red">
          Pedir ala minuta
        </a>
      </Beat>
    </div>
  )
}
