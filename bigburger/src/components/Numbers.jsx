import { motion, useTransform } from 'motion/react'
import StoryScene, { Frame, Chapter } from './StoryScene'
import { restaurant } from '../data/restaurant'

const fmt = (v, d = 0) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d })

function Stat({ p, from, to, decimals = 0, suffix = '', prefix = '', label, start }) {
  const v = useTransform(p, [start, start + 0.3], [from, to], { clamp: true })
  const text = useTransform(v, (n) => `${prefix}${fmt(n, decimals)}${suffix}`)
  const op = useTransform(p, [start - 0.04, start + 0.06], [0, 1])
  const y = useTransform(p, [start - 0.04, start + 0.06], [40, 0])
  return (
    <motion.div data-rm-static style={{ opacity: op, y }} className="border-t border-bone/20 pt-4">
      <motion.p className="display text-[19vw] leading-none tabular-nums sm:text-[8.5vw]">{text}</motion.p>
      <p className="mono mt-3 text-ash">{label}</p>
    </motion.div>
  )
}

export default function Numbers() {
  const { priceRange } = restaurant
  return (
    <StoryScene id="numeros" chapter="03" vh={260} label="Big Burger em números">
      {(p) => (
        <div className="relative flex h-full w-full flex-col justify-center bg-coal px-5 sm:px-12">
          <Frame />
          <Chapter n="03" className="mb-6">Em números</Chapter>
          <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-8">
            <Stat p={p} start={0.04} from={0} to={restaurant.rating} decimals={1} label="Nota no Google" />
            <Stat p={p} start={0.2} from={0} to={restaurant.reviews} suffix="+" label="Avaliações no Google" />
            <Stat p={p} start={0.36} from={0} to={priceRange.from} prefix="R$" suffix={`–${priceRange.to}`} label="Por pessoa" />
            <motion.div style={{ opacity: useTransform(p, [0.52, 0.62], [0, 1]) }} data-rm-static className="border-t border-bone/20 pt-4">
              <p className="display text-[19vw] leading-none sm:text-[6.5vw]">11:00<span className="text-red">—</span>00:00</p>
              <p className="mono mt-3 text-ash">Todos os dias</p>
            </motion.div>
          </div>
        </div>
      )}
    </StoryScene>
  )
}
