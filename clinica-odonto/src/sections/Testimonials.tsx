import { testimonials } from '../config/site'
import { QuoteIcon, StarIcon } from '../components/ui/Icons'
import { Reveal } from '../components/ui/Reveal'

export function Testimonials() {
  return (
    <section id="depoimentos" className="relative overflow-hidden px-5 py-16 lg:py-20">
      <QuoteIcon aria-hidden className="pointer-events-none absolute right-6 top-10 hidden h-28 text-teal-50 md:block" />
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <p className="eyebrow">Depoimentos</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-teal-950 sm:text-4xl">O que nossos pacientes dizem</h2>
        </Reveal>

        <ul className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {testimonials.map((t, i) => (
            <li key={t.name} className="w-[82%] shrink-0 snap-center md:w-auto">
              <Reveal delay={i * 0.1} className="h-full">
                <figure className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-card">
                  <div className="flex gap-0.5 text-accent" role="img" aria-label="5 de 5 estrelas">
                    {Array.from({ length: 5 }, (_, k) => (
                      <StarIcon key={k} className="h-4 w-4" />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-[15px] font-semibold leading-relaxed text-teal-950">“{t.quote}”</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                      {t.name.split(' ').map((p) => p[0]).join('')}
                    </span>
                    <span className="text-xs">
                      <strong className="block text-teal-950">{t.name}</strong>
                      <span className="text-slate-ink">Paciente</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
