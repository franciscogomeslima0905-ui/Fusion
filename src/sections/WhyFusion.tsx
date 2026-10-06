import { benefits, stats } from '../config/site'
import { Counter } from '../components/ui/Counter'
import { Reveal, SplitLines } from '../components/ui/Reveal'
import { SectionLabel } from '../components/ui/SectionLabel'

export function WhyFusion() {
  return (
    <section aria-labelledby="porque-titulo" className="relative overflow-hidden border-y border-white/[0.06] bg-coal">
      <div aria-hidden className="led-line absolute inset-x-0 top-0 opacity-60" />
      <div aria-hidden className="absolute -left-40 top-1/3 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgb(227_19_27/0.16),transparent_65%)]" />

      <div className="relative mx-auto max-w-[1440px] px-4 py-24 sm:px-8 sm:py-32">
        <SectionLabel index="03">Por que treinar na Fusion?</SectionLabel>

        <SplitLines
          as="h2"
          lines={['Um retrato do', <>que faz a <span className="text-fusion">diferença.</span></>]}
          className="mt-10 text-[clamp(2.2rem,6vw,5rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.035em] sm:mt-14 font-semiwide"
        />
        <span id="porque-titulo" className="sr-only">
          Por que treinar na Fusion Gym
        </span>

        {/* números */}
        <dl className="mt-14 grid border-t border-white/10 sm:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.1}
              className="group relative border-b border-white/10 py-8 sm:border-b-0 sm:border-r sm:px-8 sm:py-10 sm:first:pl-0 sm:last:border-r-0"
            >
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block font-mono text-[clamp(3rem,7vw,5.6rem)] font-medium leading-none tracking-[-0.04em] text-bone transition-colors duration-500 group-hover:text-fusion">
                  <Counter to={s.value} prefix={s.prefix} suffix={s.suffix} />
                </span>
                <span className="mt-4 block text-sm font-semibold uppercase tracking-[0.12em] text-bone">{s.label}</span>
                <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.18em] text-steel">{s.note}</span>
              </dd>
            </Reveal>
          ))}
        </dl>

        {/* benefícios */}
        <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <Reveal as="li" key={b.title} delay={i * 0.08} className="group relative bg-coal p-6 transition-colors duration-500 hover:bg-carbon sm:p-8">
              <span className="font-mono text-[11px] tracking-[0.2em] text-fusion">0{i + 1}</span>
              <span aria-hidden className="mt-4 block h-px w-10 bg-white/20 transition-all duration-500 group-hover:w-20 group-hover:bg-fusion" />
              <h3 className="mt-6 text-lg font-bold uppercase tracking-tight text-bone font-semiwide">{b.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist/85">{b.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
