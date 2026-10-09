import { features } from '../config/site'
import { Icon } from '../components/ui/Icons'
import { Reveal } from '../components/ui/Reveal'

export function Features() {
  return (
    <section id="diferenciais" className="relative z-10 -mt-6 px-5">
      <Reveal className="mx-auto w-full max-w-6xl rounded-3xl bg-mist p-6 shadow-card sm:p-8">
        <ul className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <li key={f.title} className="flex flex-col gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-teal-700 shadow-card">
                <Icon name={f.icon} className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold text-teal-950">{f.title}</h3>
              <p className="text-[13px] leading-relaxed text-slate-ink">{f.text}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
