import { img } from '../data/images'
import { orderLink } from '../utils/whatsapp'

const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function MenuItem({ item }) {
  return (
    <li className="flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-char">
        {item.image ? (
          <img src={item.image.src} alt={item.image.alt} loading="lazy" className="photo-grade h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_40%,#1d1d1d,#0d0d0d)]">
            <img src={img.logo} alt="" aria-hidden className="h-20 w-20 opacity-30 grayscale" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <h3 className="display text-2xl leading-[.95] sm:text-3xl">{item.name}</h3>
        {item.price != null && (
          <p className="display shrink-0 text-right text-2xl text-gold">
            {item.from && <span className="mono block text-[.6rem] text-ash">a partir de</span>}
            {brl(item.price)}
          </p>
        )}
      </div>
      {item.description && <p className="mt-2 text-sm text-ash">{item.description}</p>}
      <a
        href={orderLink(item.order)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Pedir ${item.name} pelo WhatsApp`}
        className="cond mt-3 inline-flex min-h-11 w-fit items-center border-b-2 border-red text-base font-bold tracking-[.12em] hover:text-red"
      >
        Pedir
      </a>
    </li>
  )
}
