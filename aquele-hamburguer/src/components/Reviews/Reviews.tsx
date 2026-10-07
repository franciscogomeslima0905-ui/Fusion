import { useRef } from 'react'
import { Star } from 'lucide-react'
import { rating, reviews } from '../../data/reviews'
import { useMaskReveal } from '../../hooks/useMaskReveal'
import { Mask } from '../Mask'

export default function Reviews() {
  const root = useRef<HTMLElement>(null)
  useMaskReveal(root)
  const [first, ...rest] = reviews

  return (
    <section id="avaliacoes" ref={root} aria-labelledby="t-rev" className="relative overflow-hidden bg-ink px-5 py-[16vh] md:px-[5vw]">
      <div className="grid gap-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <h2 id="t-rev" data-mask-group className="display text-[clamp(7rem,30vw,22rem)] leading-[.8] text-gold">
            <Mask>{rating.score}</Mask>
          </h2>
          <div className="mt-6 flex items-center gap-1 text-gold" role="img" aria-label="Nota 4,7 de 5 estrelas">
            {[0, 1, 2, 3, 4].map(i => <Star key={i} size={26} fill="currentColor" strokeWidth={0} aria-hidden />)}
          </div>
          <p className="mt-3 font-head text-lg font-bold uppercase tracking-[.1em]">{rating.count} avaliações no Google</p>
        </div>

        <div className="md:col-span-7">
          <blockquote className="border-l-4 border-gold pl-6 md:pl-10">
            <p className="display text-[clamp(1.9rem,4.2vw,3.8rem)] !leading-[1.04] normal-case">“{first.text}”</p>
          </blockquote>

          <div className="mt-14 grid gap-10 md:grid-cols-2 md:gap-x-12 md:gap-y-14">
            {rest.map((r, i) => (
              <blockquote key={r.id} className={`border-t border-white/20 pt-5 ${i === 1 ? 'md:mt-16' : ''}`}>
                <p className="font-head text-xl font-semibold leading-snug md:text-[1.7rem]">“{r.text}”</p>
              </blockquote>
            ))}
          </div>
          <p className="mt-12 text-sm text-ash">Trechos de avaliações de clientes no Google.</p>
        </div>
      </div>
    </section>
  )
}
