import { motion } from 'motion/react'
import { useState } from 'react'
import { plans, whatsappMessages, type Plan } from '../config/site'
import { whatsappLink } from '../lib/whatsapp'
import { Button } from '../components/ui/Button'
import { CheckIcon, WhatsAppIcon } from '../components/ui/Icons'
import { Reveal, SplitLines } from '../components/ui/Reveal'
import { SectionLabel } from '../components/ui/SectionLabel'

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const hl = plan.highlight
  return (
    <Reveal delay={index * 0.1} className={`relative h-full ${hl ? 'lg:-my-4' : ''}`}>
      <article
        className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border p-7 transition-[transform,border-color,box-shadow] duration-500 ease-[var(--ease-premium)] hover:-translate-y-1.5 sm:p-8 ${
          hl
            ? 'border-fusion/70 bg-gradient-to-b from-[#1d0b0c] to-carbon shadow-[0_0_0_1px_rgb(227_19_27/0.25),0_30px_80px_-30px_rgb(227_19_27/0.6)] lg:py-12'
            : 'border-white/10 bg-carbon hover:border-white/25'
        }`}
      >
        {hl && <div aria-hidden className="led-line absolute inset-x-6 top-0" />}
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">0{index + 1}</span>
          {plan.badge && (
            <span className="rounded-full bg-fusion px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white">{plan.badge}</span>
          )}
        </div>

        <h3 className="mt-6 text-2xl font-extrabold uppercase tracking-tight text-bone font-semiwide">{plan.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-mist/85">{plan.description}</p>

        <p className="mt-8 flex items-baseline gap-1.5 border-t border-white/10 pt-6">
          <span className={`font-mono text-4xl font-medium tracking-tight ${hl ? 'text-fusion' : 'text-bone'}`}>{plan.price}</span>
          <span className="font-mono text-xs text-steel">{plan.period}</span>
        </p>

        <ul className="mt-6 flex-1 space-y-3">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-mist">
              <CheckIcon className={`mt-0.5 h-4 w-4 shrink-0 ${hl ? 'text-fusion' : 'text-steel'}`} />
              {f}
            </li>
          ))}
        </ul>

        <Button href={whatsappLink(whatsappMessages.plan(plan.name))} external variant={hl ? 'primary' : 'ghost'} className="mt-8 w-full">
          Quero saber mais
        </Button>
      </article>
    </Reveal>
  )
}

const questions = [
  { id: 'freq', label: 'Quantas vezes por semana?', options: ['1 a 2 vezes', '3 a 4 vezes', '5 vezes ou mais'] },
  { id: 'goal', label: 'Qual é o seu objetivo?', options: ['Saúde e bem-estar', 'Ganhar massa', 'Emagrecer', 'Performance'] },
  { id: 'exp', label: 'Você já treina?', options: ['Estou começando', 'Já treino', 'Treino há anos'] },
] as const

/** "Não sabe qual escolher?" — monta uma mensagem personalizada para a equipe indicar o plano ideal. */
function PlanFinder() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const done = questions.every((q) => answers[q.id])
  const message = done
    ? `Olá! Vim pelo site da Fusion Gym. Quero treinar ${answers.freq.toLowerCase()} por semana, meu objetivo é ${answers.goal.toLowerCase()} e ${answers.exp.toLowerCase()}. Qual plano vocês me indicam?`
    : whatsappMessages.plans

  return (
    <Reveal className="mt-16 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-carbon to-coal">
      <div className="grid lg:grid-cols-[1fr_1.6fr]">
        <div className="border-b border-white/10 p-7 sm:p-10 lg:border-b-0 lg:border-r">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-fusion">Não sabe qual escolher?</p>
          <h3 className="mt-4 text-2xl font-extrabold uppercase leading-tight tracking-tight sm:text-3xl font-semiwide">
            Responda 3 perguntas e receba a indicação da nossa equipe.
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-mist/85">Suas respostas vão prontas na mensagem do WhatsApp — é só enviar.</p>
        </div>
        <div className="p-7 sm:p-10">
          <div className="grid gap-7">
            {questions.map((q, qi) => (
              <fieldset key={q.id}>
                <legend className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
                  <span className="text-fusion">0{qi + 1}</span> · {q.label}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt) => {
                    const active = answers[q.id] === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                        className={`relative rounded-full border px-4 py-2.5 text-[13px] font-medium transition-colors duration-300 ${
                          active ? 'border-fusion text-white' : 'border-white/15 text-mist hover:border-white/40 hover:text-bone'
                        }`}
                      >
                        {active && (
                          <motion.span layoutId={`pill-${q.id}`} className="absolute inset-0 -z-0 rounded-full bg-fusion" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                        )}
                        <span className="relative">{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-steel" aria-live="polite">
              {done ? 'Pronto! Sua mensagem está montada.' : `${Object.keys(answers).length}/3 respondidas`}
            </p>
            <Button href={whatsappLink(message)} external icon={<WhatsAppIcon />} variant={done ? 'primary' : 'ghost'}>
              {done ? 'Receber indicação' : 'Falar com a equipe'}
            </Button>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

export function Plans() {
  return (
    <section id="planos" aria-labelledby="planos-titulo" className="relative mx-auto max-w-[1440px] px-4 py-24 sm:px-8 sm:py-32">
      <SectionLabel index="04">Planos</SectionLabel>
      <div className="mt-10 flex flex-col gap-6 sm:mt-14 lg:flex-row lg:items-end lg:justify-between">
        <SplitLines
          lines={['Escolha o seu', <span key="l2" className="text-fusion">compromisso.</span>]}
          className="text-[clamp(2.2rem,6vw,5rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.035em] font-semiwide"
        />
        <Reveal delay={0.1} className="max-w-sm">
          <p id="planos-titulo" className="text-[15px] leading-relaxed text-mist">
            Planos para cada rotina e objetivo. Fale com a nossa equipe e encontre a opção ideal para você.
          </p>
        </Reveal>
      </div>

      <div className="mt-14 grid items-stretch gap-4 md:grid-cols-3 lg:gap-6">
        {plans.map((p, i) => (
          <PlanCard key={p.id} plan={p} index={i} />
        ))}
      </div>

      <PlanFinder />
    </section>
  )
}
