import { gallery, site } from '../config/site'
import { Logo } from '../components/layout/Logo'
import { Button } from '../components/ui/Button'
import { InstagramIcon } from '../components/ui/Icons'
import { Reveal, SplitLines } from '../components/ui/Reveal'
import { SectionLabel } from '../components/ui/SectionLabel'

export function Instagram() {
  const tiles = [gallery[1], gallery[0], gallery[3], gallery[2]]
  return (
    <section aria-labelledby="instagram-titulo" className="relative mx-auto max-w-[1440px] px-4 py-24 sm:px-8 sm:py-32">
      <SectionLabel index="09">Instagram</SectionLabel>

      <div className="mt-10 grid items-center gap-12 sm:mt-14 lg:grid-cols-2 lg:gap-16">
        <div>
          <SplitLines
            as="h2"
            lines={['Acompanhe', <>a <span className="text-fusion">Fusion</span> de perto.</>]}
            className="text-[clamp(2.2rem,6vw,5rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.035em] font-semiwide"
          />
          <span id="instagram-titulo" className="sr-only">
            Instagram da Fusion Gym
          </span>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-mist">
              Novidades, sorteios, dicas de treino e o dia a dia da academia. Siga <strong className="text-bone">@{site.contact.instagram}</strong> e faça parte da comunidade.
            </p>
          </Reveal>
          <Reveal delay={0.18} className="mt-8">
            <Button href={site.contact.instagramUrl} external icon={<InstagramIcon />} size="lg">
              Seguir no Instagram
            </Button>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={40}>
          <a
            href={site.contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir o perfil @${site.contact.instagram} no Instagram`}
            className="group block rounded-3xl border border-white/10 bg-carbon p-4 transition-colors duration-500 hover:border-fusion/50 sm:p-5"
          >
            <div className="flex items-center gap-4 px-1 pb-4 pt-1">
              <span className="rounded-full bg-gradient-to-tr from-fusion via-fusion-glow to-amber-400 p-[2px]">
                <Logo className="h-14 w-14 border-2 border-carbon" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-bone">@{site.contact.instagram}</p>
                <p className="truncate text-sm text-steel">Academia Fusion Gym · +9 mil seguidores</p>
              </div>
              <span className="hidden rounded-full bg-fusion px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors group-hover:bg-fusion-glow sm:inline">
                Seguir
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 overflow-hidden rounded-2xl">
              {tiles.map((p, i) => (
                <div key={p.src} className="relative aspect-square overflow-hidden">
                  <img
                    src={p.srcSm}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={p.width}
                    height={p.height}
                    className="h-full w-full object-cover transition duration-700 ease-[var(--ease-premium)] group-hover:scale-105"
                    style={{ transitionDelay: `${i * 60}ms` }}
                  />
                  <span className="absolute inset-0 bg-ink/20 transition-colors duration-500 group-hover:bg-transparent" />
                </div>
              ))}
            </div>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
