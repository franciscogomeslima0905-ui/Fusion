import { fullAddress, site, whatsappMessages } from '../config/site'
import { whatsappLink } from '../lib/whatsapp'
import { MapView } from '../components/MapView'
import { Button } from '../components/ui/Button'
import { ArrowUpRightIcon, PhoneIcon, PinIcon, WhatsAppIcon } from '../components/ui/Icons'
import { Reveal, SplitLines } from '../components/ui/Reveal'
import { SectionLabel } from '../components/ui/SectionLabel'

export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`

export function Location() {
  return (
    <section id="localizacao" aria-labelledby="localizacao-titulo" className="relative mx-auto max-w-[1440px] px-4 py-24 sm:px-8 sm:py-32">
      <SectionLabel index="07">Localização</SectionLabel>

      <div className="mt-10 grid gap-10 sm:mt-14 lg:grid-cols-[1fr_1.35fr] lg:gap-14">
        <div className="flex flex-col">
          <SplitLines
            lines={['No coração', <>de <span className="text-fusion">Tramandaí.</span></>]}
            className="text-[clamp(2.2rem,6vw,5rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.035em] font-semiwide"
          />
          <h2 id="localizacao-titulo" className="sr-only">
            Endereço e mapa da Fusion Gym
          </h2>

          <Reveal delay={0.1} className="mt-10">
            <address className="not-italic">
              <div className="flex gap-4 border-t border-white/10 py-6">
                <PinIcon className="mt-1 h-5 w-5 shrink-0 text-fusion" />
                <p className="text-lg leading-snug text-bone sm:text-xl">
                  {site.address.street}
                  <br />
                  <span className="text-mist">
                    {site.address.city} — {site.address.state} · CEP {site.address.zip}
                  </span>
                </p>
              </div>
              <div className="flex gap-4 border-y border-white/10 py-6">
                <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-fusion" />
                <a href={`tel:+${site.contact.whatsappNumber}`} className="text-lg text-bone transition-colors hover:text-fusion sm:text-xl">
                  {site.contact.phoneDisplay}
                </a>
              </div>
            </address>
          </Reveal>

          <Reveal delay={0.18} className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-auto lg:pt-10">
            <Button href={directionsUrl} external size="lg" ariaLabel="Como chegar — abre o Google Maps com a rota">
              Como chegar
            </Button>
            <Button href={whatsappLink(whatsappMessages.location)} external variant="ghost" size="lg" icon={<WhatsAppIcon />}>
              Pedir ajuda
            </Button>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={40}>
          <div className="group relative">
            {/* moldura com cantos de "mira" e LED */}
            <div aria-hidden className="absolute -inset-px rounded-[28px] bg-gradient-to-br from-fusion/60 via-white/10 to-transparent opacity-60" />
            <div className="relative overflow-hidden rounded-[27px] border border-white/10 bg-carbon">
              <MapView address={fullAddress} fallback={site.address.fallbackCoords} title={site.name} className="aspect-[4/5] sm:aspect-[16/11] lg:aspect-auto lg:h-[560px]" />
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-ink/80 p-4 backdrop-blur-xl transition-colors hover:border-fusion/60 sm:bottom-6 sm:left-6 sm:right-auto sm:min-w-[320px]"
              >
                <span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-fusion">Fusion Gym</span>
                  <span className="mt-1 block text-sm text-bone">{site.address.street}</span>
                </span>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-fusion">
                  <ArrowUpRightIcon className="h-4 w-4" />
                </span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
