import { services, whatsappMessages } from '../config/site'
import { whatsappLink } from '../lib/whatsapp'
import { Icon } from '../components/ui/Icons'
import { Img } from '../components/ui/Img'
import { Reveal } from '../components/ui/Reveal'

export function Services() {
  return (
    <section id="servicos" className="px-5 py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Nossos serviços</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-teal-950 sm:text-4xl">Soluções odontológicas completas</h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-slate-ink">
            Da prevenção ao sorriso dos sonhos: cuidamos de toda a sua família em um só lugar.
          </p>
        </Reveal>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <li key={s.title}>
              <Reveal delay={i * 0.08} className="h-full">
                <a
                  href={whatsappLink(whatsappMessages.service(s.title))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="overflow-hidden">
                    <Img name={s.image} alt={s.title} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-[15px] font-bold text-teal-950">{s.title}</h3>
                    <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-slate-ink">{s.text}</p>
                    <span className="mt-4 grid h-8 w-8 place-items-center self-end rounded-full bg-teal-50 text-teal-700 transition-colors group-hover:bg-accent group-hover:text-white">
                      <Icon name="arrow" className="h-4 w-4" />
                    </span>
                  </div>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
