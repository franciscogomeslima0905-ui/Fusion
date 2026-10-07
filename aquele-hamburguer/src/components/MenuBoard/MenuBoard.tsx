import { useRef } from 'react'
import { SITE } from '../../lib/links'
import { menuGroups } from '../../data/menu'
import { useMaskReveal } from '../../hooks/useMaskReveal'
import { Mask } from '../Mask'

/** Lista tipográfica dos demais itens do cardápio (nome + preço, com linha pontilhada). */
export default function MenuBoard() {
  const root = useRef<HTMLElement>(null)
  useMaskReveal(root)
  return (
    <section id="mais-cardapio" ref={root} aria-labelledby="t-board" className="relative bg-ink px-5 py-[14vh] md:px-[5vw]">
      <h2 id="t-board" data-mask-group className="display text-[clamp(3.2rem,10vw,10rem)]">
        <Mask>Mais do</Mask>
        <Mask className="text-gold">cardápio.</Mask>
      </h2>

      <div className="mt-14 grid gap-14 md:grid-cols-12 md:gap-10">
        {menuGroups.map((g, gi) => (
          <div key={g.title} className={gi === 0 ? 'md:col-span-7' : 'md:col-span-5'}>
            <h3 className="display border-b-2 border-gold pb-3 text-[clamp(1.8rem,3vw,2.8rem)]">{g.title}</h3>
            <ul className={`mt-2 ${gi === 0 ? 'md:columns-2 md:gap-x-10' : ''}`}>
              {g.items.map(it => (
                <li key={it.name} className="flex items-baseline gap-3 break-inside-avoid border-b border-white/10 py-3">
                  <span className="font-head text-base font-bold leading-snug md:text-lg">{it.name}</span>
                  <span aria-hidden className="mb-1 min-w-4 flex-1 self-end border-b border-dotted border-white/30" />
                  <span className="shrink-0 whitespace-nowrap font-head text-base font-extrabold text-gold md:text-lg">{it.price}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <a href={SITE.menuUrl} target="_blank" rel="noopener noreferrer" data-cursor="VER" className="btn btn-solid mt-14">
        Ver cardápio completo
      </a>
    </section>
  )
}
