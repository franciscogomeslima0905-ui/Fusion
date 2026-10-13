import GoogleMap from './GoogleMap'
import Button from './Button'
import { Chapter } from './StoryScene'
import { restaurant as r, mapsDirectionsUrl } from '../data/restaurant'

export default function Location() {
  return (
    <section id="localizacao" data-chapter="09" aria-labelledby="loc-title" className="bg-ink px-5 py-24 sm:px-12 sm:py-32">
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <Chapter n="09" className="mb-4">Onde estamos</Chapter>
          <h2 id="loc-title" className="display text-[20vw] sm:text-[9vw]">Onde<br />estamos</h2>
          <address className="cond mt-8 text-2xl not-italic leading-snug">
            {r.address.street}<br />
            {r.address.district} · {r.address.city}/{r.address.state}<br />
            {r.address.zip}
          </address>
          <p className="mt-3 text-ash">{r.address.reference}.</p>
          <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-bone/15 pt-6">
            <div>
              <dt className="mono text-ash">Horário</dt>
              <dd className="cond mt-1 text-xl">{r.hours.label}</dd>
            </div>
            <div>
              <dt className="mono text-ash">WhatsApp</dt>
              <dd className="cond mt-1 text-xl">{r.phoneDisplay}</dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={mapsDirectionsUrl}>Como chegar</Button>
            <Button href={r.instagramUrl} variant="line">Instagram</Button>
          </div>
        </div>
        <div className="relative min-h-[360px] overflow-hidden bg-char lg:min-h-[560px]">
          <GoogleMap />
        </div>
      </div>
    </section>
  )
}
