import { useRef } from 'react'
import { photos, site } from '../config/site'
import { useSectionFx } from '../hooks/useSectionFx'
import { Kicker, MaskTitle } from '../components/MaskTitle'

const values = [
  ['Aprendizado', 'Cada treino é uma aula: fundamentos do futebol explicados e praticados em campo.'],
  ['Desenvolvimento', 'Evolução técnica, física e emocional, respeitando o ritmo de cada criança e adolescente.'],
  ['Convivência', 'Equipe, amizade e respeito: aprender a ganhar, a perder e a jogar junto.'],
  ['Formação de valores', 'Disciplina, responsabilidade e cidadania dentro e fora das quatro linhas.'],
]

const facts = [
  [`+${site.years}`, 'anos formando atletas e cidadãos'],
  [`${site.ages.from}–${site.ages.to}`, 'anos: crianças e adolescentes'],
  ['2', 'unidades: Tramandaí e Capão da Canoa'],
]

export function About() {
  const root = useRef<HTMLElement>(null)
  useSectionFx(root)

  return (
    <section id="escola" ref={root} className="relative z-10 bg-ink py-24 sm:py-32 lg:py-44">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <Kicker>A escola</Kicker>

        <MaskTitle
          lines={['O futebol ensina.', 'A gente transforma.']}
          accent={1}
          className="mt-6 text-[clamp(3rem,10.6vw,12rem)] lg:mt-8"
        />

        <div className="mt-14 grid gap-14 lg:mt-24 lg:grid-cols-12 lg:gap-10">
          {/* colagem de fotos reais */}
          <div className="relative lg:col-span-6">
            <div data-img className="grain relative aspect-[4/5] w-[78%] overflow-hidden bg-coal">
              <img data-parallax="6" src={photos.equipe.src} alt={photos.equipe.alt} loading="lazy" decoding="async" className="photo absolute inset-0 h-[112%] w-full -translate-y-[4%] object-cover" />
            </div>
            <div data-img className="grain absolute right-0 bottom-[-9%] aspect-[4/5] w-[46%] overflow-hidden border-[6px] border-ink bg-coal sm:bottom-[-7%] lg:bottom-[-12%]">
              <img data-parallax="9" src={photos.treinadorGrupo.src} alt={photos.treinadorGrupo.alt} loading="lazy" decoding="async" className="photo absolute inset-0 h-[116%] w-full -translate-y-[5%] object-cover" />
            </div>
            <p className="t-head mt-5 text-[0.68rem] text-steel/70">Acervo da escola · Instagram</p>
          </div>

          <div className="lg:col-span-6 lg:pl-8">
            <p data-reveal className="max-w-xl text-xl leading-snug text-white sm:text-2xl">
              Mais que uma escola de futebol: um ambiente de aprendizado, desenvolvimento, convivência e formação de valores.
            </p>
            <p data-reveal="0.1" className="mt-6 max-w-xl text-base leading-relaxed text-steel">
              A Escola Grêmio Tramandaí e Capão da Canoa recebe crianças e adolescentes dos {site.ages.from} aos {site.ages.to} anos, com a
              tradição tricolor como inspiração. Há mais de {site.years} anos, o futebol é o caminho para formar atletas e, antes de tudo,
              cidadãos.
            </p>

            <dl className="mt-12 grid grid-cols-3 border-y border-line">
              {facts.map(([n, label], i) => (
                <div key={label} data-reveal={i * 0.1} className={`py-6 ${i > 0 ? 'border-l border-line pl-4 sm:pl-6' : ''}`}>
                  <dt className="t-display text-[clamp(2.2rem,5vw,4.4rem)] text-blue">{n}</dt>
                  <dd className="mt-2 text-[0.72rem] leading-snug text-steel sm:text-sm">{label}</dd>
                </div>
              ))}
            </dl>

            <ol className="mt-10">
              {values.map(([name, text], i) => (
                <li key={name} data-reveal className="group grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-line py-5 transition-colors hover:border-blue sm:grid-cols-[3rem_14rem_1fr]">
                  <span className="t-head pt-1 text-xs text-blue">0{i + 1}</span>
                  <h3 className="t-head text-lg text-white sm:text-xl">{name}</h3>
                  <p className="col-start-2 mt-1 text-sm leading-relaxed text-steel sm:col-start-3 sm:mt-0">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
