import { stats } from '../config/site'
import { Counter } from '../components/ui/Counter'
import { Icon } from '../components/ui/Icons'
import { Reveal } from '../components/ui/Reveal'

export function Stats() {
  return (
    <section aria-label="Números da clínica" className="px-5">
      <Reveal className="mx-auto w-full max-w-6xl rounded-2xl bg-teal-800 px-6 py-8 text-white shadow-lift sm:px-10">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-7 lg:grid-cols-4">
          {stats.map((s) => (
            <li key={s.label} className="flex items-center gap-3 lg:justify-center">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-teal-100">
                <Icon name={s.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-extrabold leading-none sm:text-3xl">
                  <Counter value={s.value} suffix={s.suffix} format={'format' in s} />
                </p>
                <p className="mt-1 text-xs text-teal-100/80">{s.label}</p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
