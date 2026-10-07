import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { img } from '../data/images'
import { Chapter } from './StoryScene'

function Tile({ src, className, speed = 0, pos = '50% 50%' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * -1}%`, `${speed}%`])
  return (
    <div ref={ref} className={`relative overflow-hidden bg-char ${className}`}>
      <motion.img
        data-rm-static
        src={src.src}
        alt={src.alt}
        loading="lazy"
        style={{ y, objectPosition: pos, scale: 1.18 }}
        className="photo-grade absolute inset-0 h-full w-full object-cover"
      />
    </div>
  )
}

/** Composição editorial: tamanhos e proporções diferentes, nada de grade 3×3. */
export default function Gallery() {
  return (
    <section id="galeria" data-chapter="08" aria-label="Galeria" className="bg-coal px-5 py-24 sm:px-12 sm:py-32">
      <div className="mx-auto max-w-[1400px]">
        <Chapter n="08" className="mb-4">Da casa</Chapter>
        <h2 className="display mb-12 text-[20vw] sm:text-[10vw]">Da casa</h2>
        <div className="grid grid-cols-12 gap-3 sm:gap-5">
          <Tile src={img.porcao} speed={6} className="col-span-7 aspect-[3/4] sm:col-span-5" />
          <Tile src={img.xis} speed={8} pos="40% 50%" className="col-span-5 mt-16 aspect-[3/4] sm:col-span-4 sm:mt-28 sm:aspect-[4/5]" />
          <Tile src={img.chapa} speed={5} className="col-span-12 aspect-[16/9] sm:col-span-3 sm:mt-10 sm:aspect-[3/5]" />
          <Tile src={img.almoco} speed={7} className="col-span-5 aspect-square sm:col-span-4 sm:-mt-10" />
          <Tile src={img.combo} speed={6} className="col-span-7 aspect-[4/5] sm:col-span-4" />
          <Tile src={img.prato} speed={8} pos="50% 30%" className="col-span-12 aspect-[16/9] sm:col-span-4 sm:mt-14 sm:aspect-[4/5]" />
        </div>
      </div>
    </section>
  )
}
