import { articles } from '../config/site'
import { Icon } from '../components/ui/Icons'
import { Img } from '../components/ui/Img'
import { Reveal } from '../components/ui/Reveal'

export function Tips() {
  return (
    <section id="dicas" className="px-5 py-16 lg:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Informação</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-teal-950 sm:text-4xl">Dicas e novidades</h2>
          </div>
          <a href="#" className="hidden items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-accent sm:inline-flex">
            Ver todos os artigos <Icon name="arrow" className="h-4 w-4" />
          </a>
        </Reveal>

        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {articles.map((a, i) => (
            <li key={a.title}>
              <Reveal delay={i * 0.08} className="h-full">
                <article className="group h-full overflow-hidden rounded-2xl bg-white shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <div className="overflow-hidden">
                    <Img name={a.image} alt={a.title} className="aspect-[16/10] w-full transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] text-slate-ink">
                      {a.date} · <span className="font-semibold text-teal-700">{a.category}</span>
                    </p>
                    <h3 className="mt-2 text-base font-bold leading-snug text-teal-950">{a.title}</h3>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
