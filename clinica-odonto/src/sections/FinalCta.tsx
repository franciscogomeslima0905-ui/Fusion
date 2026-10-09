import { site, whatsappMessages } from '../config/site'
import { whatsappLink } from '../lib/whatsapp'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icons'
import { Reveal } from '../components/ui/Reveal'

export function FinalCta() {
  return (
    <section id="contato" className="px-5 pb-20">
      <Reveal className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 rounded-3xl bg-teal-800 p-8 text-white shadow-lift md:flex-row md:items-center md:p-12">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Pronto para um sorriso melhor?</h2>
          <p className="mt-2 max-w-md text-sm text-teal-100/90">
            Fale com a {site.name} agora mesmo e agende sua avaliação. Respondemos rapidinho.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href={whatsappLink(whatsappMessages.booking)} external arrow>
            Agendar consulta
          </Button>
          <Button href={`tel:+${site.contact.whatsappNumber}`} variant="light">
            <Icon name="phone" className="h-4 w-4" />
            {site.contact.phoneDisplay}
          </Button>
        </div>
      </Reveal>
    </section>
  )
}
