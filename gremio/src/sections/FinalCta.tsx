import { useRef } from 'react'
import { messages, photos, site } from '../config/site'
import { Kicker, MaskTitle } from '../components/MaskTitle'
import { WhatsAppButton } from '../components/Buttons'
import { InstagramIcon, WhatsAppIcon } from '../components/Icons'
import { useSectionFx } from '../hooks/useSectionFx'

export function FinalCta() {
  const root = useRef<HTMLElement>(null)
  useSectionFx(root)

  return (
    <section id="contato" ref={root} className="grain relative z-10 overflow-hidden bg-ink py-28 sm:py-36 lg:py-52">
      <div className="absolute inset-0" aria-hidden="true">
        <img data-parallax="10" src={photos.treinoGrama.src} alt="" loading="lazy" decoding="async" className="photo absolute inset-0 h-[120%] w-full -translate-y-[8%] object-cover opacity-30 blur-[3px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/55 to-ink" />
        <div className="absolute inset-y-0 left-0 w-2 bg-blue" />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <Kicker>Matrículas e aula experimental</Kicker>
        <MaskTitle lines={['O próximo passo', 'começa aqui.']} accent={1} className="mt-6 text-[clamp(3.2rem,11.5vw,13.5rem)] lg:mt-8" />
        <p data-reveal className="mt-8 max-w-xl text-xl leading-snug text-white sm:text-2xl">
          Venha conhecer nossa escola e agende uma aula experimental.
        </p>

        <div data-reveal="0.1" className="mt-10 flex flex-col gap-8 lg:mt-14 lg:flex-row lg:items-center lg:gap-14">
          <WhatsAppButton message={messages.final} size="lg" className="w-full px-10 py-6 text-base sm:w-auto sm:text-lg lg:px-14 lg:py-7">
            Quero agendar uma aula
          </WhatsAppButton>
          <ul className="space-y-3 text-sm text-steel">
            <li className="flex items-center gap-3">
              <WhatsAppIcon className="h-5 w-5 text-white" />
              <a href={`https://wa.me/${site.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-white transition-colors hover:text-blue">
                {site.whatsappDisplay}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <InstagramIcon className="h-5 w-5 text-white" />
              <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-white transition-colors hover:text-blue">
                {site.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
