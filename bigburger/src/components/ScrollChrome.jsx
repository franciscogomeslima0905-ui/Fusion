import { useEffect, useState } from 'react'
import { motion, useScroll } from 'motion/react'

const chapters = [
  ['01', 'inicio', 'Big Burger'], ['02', 'xis', 'O Xis'], ['03', 'chapa', 'Na chapa'], ['04', 'classicos', 'Os clássicos'],
  ['05', 'porcoes', 'Porções'], ['06', 'ala-minuta', 'Ala minuta'], ['07', 'cardapio', 'Cardápio'], ['08', 'galeria', 'Da casa'], ['09', 'localizacao', 'Onde estamos'],
]

/** Barra de progresso (rodapé, como no vídeo) + trilho de capítulos à direita. */
export default function ScrollChrome() {
  const { scrollYProgress } = useScroll()
  const [active, setActive] = useState('01')
  useEffect(() => {
    const els = chapters.map(([, id]) => document.getElementById(id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.dataset.chapter)),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return (
    <>
      <motion.div aria-hidden style={{ scaleX: scrollYProgress }} className="fixed inset-x-0 bottom-0 z-[85] h-[3px] origin-left bg-gold" />
      <nav aria-label="Capítulos" className="fixed right-4 top-1/2 z-[60] hidden -translate-y-1/2 flex-col items-end gap-2 xl:flex">
        {chapters.map(([n, id, name]) => (
          <a key={n} href={`#${id}`} aria-label={`Capítulo ${n}: ${name}`} className={`mono flex items-center gap-2 transition-colors ${active === n ? 'text-bone' : 'text-ash/40 hover:text-ash'}`}>
            {active === n && <span>{name}</span>}
            <span className={active === n ? 'text-red' : ''}>{n}</span>
          </a>
        ))}
      </nav>
    </>
  )
}
