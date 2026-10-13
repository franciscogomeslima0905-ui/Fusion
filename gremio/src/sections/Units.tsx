import { useRef } from 'react'
import { messages, photos, site } from '../config/site'
import { Kicker, MaskTitle } from '../components/MaskTitle'
import { WhatsAppButton } from '../components/Buttons'
import { useSectionFx } from '../hooks/useSectionFx'

const units = [
  { n: '01', name: 'Tramandaí', message: messages.tramandai, photo: photos.turmaGrande, tone: 'bg-navy' },
  { n: '02', name: 'Capão da Canoa', message: messages.capao, photo: photos.duelo, tone: 'bg-[#05070a]' },
]

/** Duas localidades. Sem endereço ou mapa: nada foi confirmado — o contato é pelo WhatsApp. */
export function Units() {
  const root = useRef<HTMLElement>(null)
  useSectionFx(root)

  return (
    <section id="unidades" ref={root} className="relative z-10 bg-ink pt-24 sm:pt-32 lg:pt-40">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <Kicker>Unidades</Kicker>
        <MaskTitle lines={['Do litoral', 'para o futuro.']} accent={1} className="mt-6 text-[clamp(3rem,10.6vw,12rem)] lg:mt-8" />
      </div>

      <div className="mt-14 flex flex-col lg:mt-24 lg:h-[88svh] lg:min-h-[640px] lg:flex-row">
        {units.map((u) => (
          <article
            key={u.name}
            className={`group relative flex min-h-[78svh] flex-1 flex-col justify-between overflow-hidden px-5 py-8 transition-[flex-grow] duration-700 ease-[cubic-bezier(.7,0,.2,1)] sm:px-8 sm:py-10 lg:min-h-0 lg:px-12 lg:py-12 lg:hover:flex-[1.35] ${u.tone}`}
          >
            <img
              src={u.photo.src}
              alt=""
              loading="lazy"
              decoding="async"
              className="photo absolute inset-0 h-full w-full scale-110 object-cover opacity-25 mix-blend-luminosity transition-all duration-1000 group-hover:scale-100 group-hover:opacity-45"
            />
            <div className="grain absolute inset-0" />
            <div className="relative flex items-start justify-between">
              <span className="t-head text-sm text-blue">{u.n}</span>
              <span className="t-head text-[0.7rem] text-white/60">Rio Grande do Sul</span>
            </div>

            <div className="relative">
              <p className="t-head text-[0.78rem] text-white/70">Escola Grêmio</p>
              <h3 className="t-display mt-2 text-[clamp(3.6rem,9vw,9.5rem)] break-words text-white">{u.name}</h3>
              <p className="mt-5 max-w-md text-[0.98rem] leading-relaxed text-white/80">
                Venha conhecer as atividades da unidade de {u.name}. Fale com a escola para saber das turmas, dos horários e agendar uma aula experimental.
              </p>
              <WhatsAppButton message={u.message} variant="white" size="md" className="mt-8">
                Conhecer pelo WhatsApp
              </WhatsAppButton>
            </div>
          </article>
        ))}
      </div>
      <p className="mx-auto max-w-[1600px] px-5 py-5 text-[0.72rem] text-steel/60 sm:px-8 lg:px-12">
        Atendemos crianças e adolescentes dos {site.ages.from} aos {site.ages.to} anos nas duas localidades.
      </p>
    </section>
  )
}
