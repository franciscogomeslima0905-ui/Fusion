const items = ['Aquele Hambúrguer', 'Tramandaí', 'Hambúrguer artesanal', 'Batata crocante', 'Delivery', 'Cerveja gelada']

export default function Marquee() {
  const row = items.flatMap(t => [
    <span key={t} className="display px-6 text-[clamp(1.6rem,3.4vw,2.8rem)] md:px-9">{t}</span>,
    <span key={t + '-dot'} aria-hidden className="text-[clamp(1.2rem,2.4vw,2rem)]">•</span>,
  ])
  return (
    <div className="relative z-10 overflow-hidden bg-gold py-4 text-ink md:py-5" role="marquee" aria-label={items.join(', ')}>
      <div aria-hidden className="marquee-track flex w-max items-center whitespace-nowrap">
        <div className="flex items-center">{row}</div>
        <div className="flex items-center">{row}</div>
      </div>
    </div>
  )
}
