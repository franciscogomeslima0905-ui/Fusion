import { useEffect, useRef, useState } from 'react'
import { motion, useTransform } from 'motion/react'
import StoryScene, { Frame, Chapter } from './StoryScene'
import { img } from '../data/images'
import { orderLink } from '../utils/whatsapp'

const items = [
  { n: '01', name: 'Xis Big Frango', line: 'A partir de R$ 33,00', image: img.bigFrango, order: 'o Xis Big Frango' },
  { n: '02', name: 'Giants Bacon', line: 'A partir de R$ 29,90', image: img.burgerBacon, order: 'o Giants Bacon' },
  { n: '03', name: 'Porção de frango', line: 'Frango crocante, batata frita e molho.', image: img.porcao, order: 'a Porção de frango' },
  { n: '04', name: 'À la Minuta Parmegiana', line: 'R$ 45,00', image: img.alaParmegiana, order: 'a À la Minuta Carne Parmegiana' },
]

export default function ProductLineup() {
  return (
    <StoryScene id="classicos" chapter="04" vh={430} label="Os clássicos">
      {(p) => <Track p={p} />}
    </StoryScene>
  )
}

function Track({ p }) {
  const track = useRef(null)
  const [dist, setDist] = useState(0)
  useEffect(() => {
    const measure = () => track.current && setDist(Math.max(0, track.current.scrollWidth - window.innerWidth))
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  const x = useTransform(p, [0.08, 0.92], [0, -dist], { clamp: true })
  const titleX = useTransform(p, [0, 1], ['0%', '-18%'])

  return (
    <div className="relative flex h-full w-full flex-col justify-center bg-ink">
      <Frame />
      <motion.h2
        style={{ x: titleX }}
        className="display absolute left-5 top-[9svh] z-0 whitespace-nowrap text-[22vw] text-char sm:left-12 sm:text-[15vw]"
      >
        Os clássicos
      </motion.h2>
      <Chapter n="04" className="absolute left-5 top-[11svh] z-20 sm:left-12">Os clássicos</Chapter>

      <motion.ul ref={track} style={{ x }} className="relative z-10 mt-[10svh] flex w-max gap-5 px-5 sm:gap-8 sm:px-12">
        {items.map((it) => (
          <li key={it.n} className="w-[72vw] shrink-0 sm:w-[28vw] sm:max-w-[430px]">
            <div className="relative aspect-[4/5] overflow-hidden bg-char">
              <img src={it.image.src} alt={it.image.alt} loading="lazy" className="photo-grade h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
              <span className="mono absolute left-3 top-3 text-bone">{it.n}</span>
            </div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="display text-3xl sm:text-4xl">{it.name}</h3>
                <p className="mt-1 text-sm text-ash">{it.line}</p>
              </div>
              <a
                href={orderLink(it.order)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Pedir ${it.name} pelo WhatsApp`}
                className="cond mt-1 shrink-0 border-b-2 border-red pb-0.5 text-base font-bold tracking-[.12em] hover:text-red"
              >
                Pedir
              </a>
            </div>
          </li>
        ))}
      </motion.ul>
    </div>
  )
}
