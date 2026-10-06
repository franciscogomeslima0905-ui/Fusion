import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { hours, whatsappMessages } from '../config/site'
import { groupForDay, nowInGym, toMinutes } from '../lib/hours'
import { whatsappLink } from '../lib/whatsapp'
import { Button } from '../components/ui/Button'
import { ClockIcon, WhatsAppIcon } from '../components/ui/Icons'
import { OpenBadge } from '../components/ui/OpenBadge'
import { Reveal, SplitLines } from '../components/ui/Reveal'
import { SectionLabel } from '../components/ui/SectionLabel'

const HOURS_24 = Array.from({ length: 24 }, (_, h) => h)

export function Hours() {
  const now = useMemo(() => (typeof window === 'undefined' ? null : nowInGym()), [])
  const todayGroup = now ? groupForDay(now.day) : hours[0]
  const [active, setActive] = useState(todayGroup.id)
  const group = hours.find((g) => g.id === active) ?? hours[0]
  const isToday = !!now && group.id === todayGroup.id

  const isOpenAt = (h: number) => group.ranges.some((r) => h * 60 >= toMinutes(r.open) && h * 60 < toMinutes(r.close))
  const totalHours = group.ranges.reduce((acc, r) => acc + (toMinutes(r.close) - toMinutes(r.open)) / 60, 0)

  return (
    <section id="horarios" aria-labelledby="horarios-titulo" className="relative overflow-hidden border-y border-white/[0.06] bg-coal">
      <div aria-hidden className="absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgb(227_19_27/0.14),transparent_65%)]" />
      <div className="relative mx-auto max-w-[1440px] px-4 py-24 sm:px-8 sm:py-32">
        <SectionLabel index="08">Horários</SectionLabel>

        <div className="mt-10 flex flex-col gap-6 sm:mt-14 lg:flex-row lg:items-end lg:justify-between">
          <SplitLines
            as="h2"
            lines={['Treine no seu', <span key="l2" className="text-steel">horário.</span>]}
            className="text-[clamp(2.2rem,6vw,5rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.035em] font-semiwide"
          />
          <span id="horarios-titulo" className="sr-only">
            Horários de funcionamento
          </span>
          <Reveal delay={0.1}>
            <OpenBadge className="rounded-full border border-white/10 bg-ink/50 px-4 py-2.5" />
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-12">
          {/* abas */}
          <div role="tablist" aria-label="Dias da semana" className="inline-flex w-full gap-1 rounded-full border border-white/10 bg-ink/50 p-1 sm:w-auto">
            {hours.map((g) => (
              <button
                key={g.id}
                role="tab"
                type="button"
                aria-selected={g.id === active}
                aria-controls="painel-horarios"
                onClick={() => setActive(g.id)}
                className={`relative flex-1 rounded-full px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors sm:flex-none sm:px-6 ${
                  g.id === active ? 'text-white' : 'text-steel hover:text-bone'
                }`}
              >
                {g.id === active && <motion.span layoutId="hours-tab" className="absolute inset-0 rounded-full bg-fusion" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
                <span className="relative">{g.short}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <div id="painel-horarios" role="tabpanel" className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          {/* horário em destaque */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-carbon p-7 sm:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
                  <ClockIcon className="h-4 w-4 text-fusion" />
                  {group.label}
                  {isToday && <span className="rounded-full bg-fusion/15 px-2 py-0.5 text-fusion">Hoje</span>}
                </p>
                <div className="mt-6 space-y-2">
                  {group.ranges.map((r) => (
                    <p key={r.open} className="font-mono text-[clamp(2.4rem,6vw,4.2rem)] font-medium leading-none tracking-[-0.04em] text-bone">
                      {r.open}
                      <span className="mx-3 text-fusion">—</span>
                      {r.close}
                    </p>
                  ))}
                </div>
                <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
                  {totalHours}h de treino disponíveis{group.ranges.length > 1 ? ' · dois turnos' : ''}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* linha do tempo de 24h */}
          <div className="rounded-3xl border border-white/10 bg-carbon p-7 sm:p-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">Funcionamento ao longo do dia</p>
            <div className="mt-8 flex h-40 items-end gap-[3px] sm:h-48 sm:gap-1" aria-hidden>
              {HOURS_24.map((h) => {
                const open = isOpenAt(h)
                const current = isToday && !!now && h === Math.floor(now.minutes / 60)
                return (
                  <div key={h} className="relative flex h-full flex-1 flex-col justify-end">
                    {current && (
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.14em] text-fusion">agora</span>
                    )}
                    <motion.div
                      className={`w-full rounded-[3px] ${
                        current ? 'bg-bone shadow-[0_0_18px_rgb(255_255_255/0.6)]' : open ? 'bg-gradient-to-t from-fusion-deep to-fusion' : 'bg-white/[0.06]'
                      }`}
                      initial={false}
                      animate={{ height: open ? '100%' : '14%' }}
                      transition={{ duration: 0.7, delay: h * 0.015, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex justify-between font-mono text-[10px] text-steel" aria-hidden>
              {['00h', '06h', '12h', '18h', '23h'].map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>

            <ul className="mt-8 divide-y divide-white/10 border-t border-white/10">
              {hours.map((g) => (
                <li key={g.id} className={`flex items-center justify-between gap-4 py-3.5 text-sm ${g.id === active ? 'text-bone' : 'text-mist/70'}`}>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em]">{g.short}</span>
                  <span className="text-right font-mono">{g.ranges.map((r) => `${r.open} — ${r.close}`).join('  ·  ')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Reveal className="mt-10 flex justify-center">
          <Button href={whatsappLink(whatsappMessages.hours)} external variant="ghost" icon={<WhatsAppIcon />}>
            Tirar dúvida sobre horários
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
