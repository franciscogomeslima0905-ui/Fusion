import { BoltIcon } from '../components/ui/Icons'

const words = ['Força', 'Disciplina', 'Performance', 'Evolução', 'Constância', 'Resultado']

function Row({ dark = false }: { dark?: boolean }) {
  const items = [...words, ...words]
  return (
    <div className="flex w-max">
      {[0, 1].map((k) => (
        <ul key={k} aria-hidden={k === 1} className="flex shrink-0 items-center">
          {items.map((w, i) => (
            <li key={i} className="flex items-center gap-6 px-6 sm:gap-8 sm:px-8">
              <span className={`font-wide text-sm font-extrabold uppercase italic tracking-[0.12em] sm:text-base ${dark ? 'text-steel' : 'text-white'}`}>{w}</span>
              <BoltIcon className={`h-3.5 w-3.5 ${dark ? 'text-fusion' : 'text-ink/70'}`} />
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}

/** Faixas inclinadas em movimento contínuo — vermelha por cima, grafite por baixo. */
export function Marquee() {
  return (
    <div aria-label="Força, disciplina, performance, evolução, constância, resultado" role="img" className="relative z-10 overflow-hidden py-8">
      <div className="-mx-4 -rotate-[2.2deg] border-y border-white/5 bg-graphite py-3.5">
        <div className="animate-marquee-rev">
          <Row dark />
        </div>
      </div>
      <div className="-mx-4 -mt-[3.3rem] rotate-[1.6deg] bg-fusion py-3.5 shadow-[0_0_60px_-10px_rgb(227_19_27/0.8)] sm:-mt-[3.6rem]">
        <div className="animate-marquee">
          <Row />
        </div>
      </div>
    </div>
  )
}
