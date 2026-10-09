import { hours, imageSlots, site, whatsappMessages } from '../config/site'
import { whatsappLink } from '../lib/whatsapp'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icons'
import { Img } from '../components/ui/Img'

const patients = ['AS', 'CL', 'MA', 'JP']

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 to-white pt-16">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pb-20 pt-10 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-16">
        <div className="relative z-10">
          <p className="eyebrow">{site.name} · Clínica odontológica</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight text-teal-950 sm:text-5xl lg:text-[3.4rem]">
            Seu sorriso,
            <br />
            <span className="text-teal-700">nossa paixão.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-ink">
            Odontologia de excelência, com tecnologia avançada, em um ambiente confortável e acolhedor.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={whatsappLink(whatsappMessages.booking)} external arrow>
              Agendar consulta
            </Button>
            <Button href="#servicos" variant="outline">
              Conhecer serviços
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2.5" aria-hidden>
              {patients.map((p, i) => (
                <span
                  key={p}
                  className="grid h-10 w-10 place-items-center rounded-full border-2 border-white text-[11px] font-bold text-white"
                  style={{ background: ['#1a7d7d', '#f26b2a', '#136666', '#0b3d3e'][i] }}
                >
                  {p}
                </span>
              ))}
            </div>
            <p className="text-sm leading-tight">
              <strong className="block text-teal-950">+1.000</strong>
              <span className="text-slate-ink">pacientes felizes</span>
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div aria-hidden className="absolute -right-10 top-1/2 h-[120%] w-[120%] -translate-y-1/2 rounded-full bg-teal-100/60 lg:-right-20" />
          <Img
            name={imageSlots.hero}
            alt="Paciente sorrindo durante atendimento odontológico"
            loading="eager"
            className="relative aspect-[4/4.2] w-full rounded-[2rem] shadow-lift lg:aspect-[4/4.4]"
          />
          <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-lift sm:left-auto sm:right-4">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <Icon name="clock" className="h-6 w-6" />
            </span>
            <div className="text-xs">
              <p className="text-sm font-bold text-teal-950">{hours.label}</p>
              {hours.lines.map((l) => (
                <p key={l} className="text-slate-ink">{l}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
