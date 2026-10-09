import { imageSlots, whatsappMessages } from '../config/site'
import { whatsappLink } from '../lib/whatsapp'
import { Button } from '../components/ui/Button'
import { Img } from '../components/ui/Img'
import { Reveal } from '../components/ui/Reveal'

export function DoctorCta() {
  return (
    <section id="consulta" className="px-5 py-14 lg:py-20">
      <Reveal className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 to-teal-700 text-white shadow-lift">
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-2/3 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1.2px, transparent 1.6px)', backgroundSize: '14px 14px', maskImage: 'linear-gradient(to left, #000, transparent)' }}
        />
        <div className="relative grid items-end gap-6 px-6 pt-10 sm:px-12 md:grid-cols-2 md:pt-0">
          <div className="pb-10 md:py-16">
            <p className="eyebrow">Consulta gratuita</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Agende sua avaliação gratuita hoje!
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-teal-100/90">
              Dê o primeiro passo para um sorriso mais saudável e bonito. Nossa equipe está pronta para cuidar de você.
            </p>
            <Button href={whatsappLink(whatsappMessages.free)} external arrow className="mt-7">
              Agendar consulta
            </Button>
          </div>
          <div className="mx-auto w-full max-w-xs self-end md:max-w-sm">
            <Img name={imageSlots.doctor} alt="Dentista da clínica de braços cruzados" className="aspect-[4/5] w-full rounded-t-3xl" />
          </div>
        </div>
      </Reveal>
    </section>
  )
}
