import { motion, useTransform } from 'motion/react'
import StoryScene, { Beat, Frame, Chapter } from './StoryScene'
import { img } from '../data/images'

export default function Porcoes() {
  return (
    <StoryScene id="porcoes" chapter="05" vh={320} label="Porções">
      {(p) => <Stage p={p} />}
    </StoryScene>
  )
}

function Stage({ p }) {
  const bigY = useTransform(p, [0, 1], ['14%', '-12%'])
  const smallY = useTransform(p, [0, 1], ['38%', '-34%'])
  const wordX = useTransform(p, [0, 1], ['6%', '-14%'])
  const bigScale = useTransform(p, [0, 1], [0.92, 1.08])
  return (
    <div className="relative h-full w-full bg-[#0b0a09]">
      <Frame />
      <motion.h2
        style={{ x: wordX }}
        className="display absolute left-0 top-[28svh] z-0 whitespace-nowrap text-[30vw] text-transparent [-webkit-text-stroke:1px_rgba(245,245,245,.28)] sm:text-[26vw]"
      >
        Porções
      </motion.h2>

      <motion.div data-rm-static style={{ y: bigY, scale: bigScale }} className="absolute left-[6vw] top-[14svh] z-10 aspect-[780/1044] h-[62svh] sm:left-[12vw] sm:h-[78svh]">
        <img src={img.porcao.src} alt={img.porcao.alt} loading="lazy" className="photo-grade h-full w-full object-cover" />
      </motion.div>
      <motion.div data-rm-static style={{ y: smallY }} className="absolute right-[6vw] top-[26svh] z-20 aspect-[783/1041] h-[34svh] sm:right-[14vw] sm:h-[48svh]">
        <img src={img.prato.src} alt={img.prato.alt} loading="lazy" className="photo-grade h-full w-full object-cover" />
      </motion.div>

      <Beat p={p} range={[0.05, 0.6]} className="absolute bottom-[7svh] right-5 z-30 max-w-[15rem] sm:right-12 sm:max-w-xs">
        <Chapter n="05" className="mb-3">Porções</Chapter>
        <p className="cond text-2xl font-bold leading-tight">Frango crocante, batata frita e molho.</p>
      </Beat>
      <Beat p={p} range={[0.6, 1.2]} hold className="absolute bottom-[7svh] right-5 z-30 max-w-[15rem] sm:right-12 sm:max-w-xs">
        <p className="cond text-2xl font-bold leading-tight">No salão e no delivery.</p>
      </Beat>
    </div>
  )
}
