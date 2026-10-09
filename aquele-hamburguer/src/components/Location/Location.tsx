import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Phone } from 'lucide-react'
import { FULL_ADDRESS, SITE, directionsUrl } from '../../lib/links'
import { darkMapStyle, embedFallbackUrl, hasMapsKey, loadGoogleMaps, markerIcon } from '../../lib/maps'
import { useMaskReveal } from '../../hooks/useMaskReveal'
import { Mask } from '../Mask'

export default function Location() {
  const root = useRef<HTMLElement>(null)
  const mapEl = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'loading' | 'api' | 'embed'>(hasMapsKey ? 'loading' : 'embed')
  useMaskReveal(root)

  useEffect(() => {
    const el = mapEl.current
    if (!hasMapsKey || !el) return
    let cancelled = false
    // só carrega o mapa quando a seção se aproxima da tela
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      io.disconnect()
      loadGoogleMaps()
        .then(maps => {
          if (cancelled) return
          new maps.Geocoder().geocode({ address: FULL_ADDRESS, region: 'BR' }, (res, status) => {
            if (cancelled) return
            if (status !== 'OK' || !res?.[0]) return setMode('embed')
            const pos = res[0].geometry.location
            const map = new maps.Map(el, {
              center: pos, zoom: 16, styles: darkMapStyle, disableDefaultUI: true, zoomControl: true,
              gestureHandling: 'cooperative', backgroundColor: '#0d0d0d',
            })
            new maps.Marker({ position: pos, map, title: SITE.name, icon: markerIcon(maps) })
            setMode('api')
          })
        })
        .catch(() => !cancelled && setMode('embed'))
    }, { rootMargin: '400px' })
    io.observe(el)
    return () => { cancelled = true; io.disconnect() }
  }, [])

  return (
    <section id="localizacao" ref={root} aria-labelledby="t-loc" className="relative bg-ink px-5 py-[14vh] md:px-[5vw]">
      <h2 id="t-loc" data-mask-group className="display text-[clamp(2.8rem,8.4vw,8.4rem)]">
        <Mask>Onde encontrar</Mask>
        <Mask className="text-gold">Aquele Hambúrguer</Mask>
      </h2>

      <div className="mt-12 grid gap-8 md:grid-cols-12 md:gap-10">
        <div className="relative min-h-[52svh] overflow-hidden bg-coal md:col-span-8 md:min-h-[64svh]">
          {mode === 'embed' ? (
            <iframe
              title={`Mapa: ${SITE.name}, ${FULL_ADDRESS}`}
              src={embedFallbackUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0 [filter:invert(.92)_hue-rotate(180deg)_saturate(.6)_brightness(.9)_contrast(1.05)]"
            />
          ) : (
            <div ref={mapEl} role="region" aria-label={`Mapa interativo: ${SITE.name}`} className="absolute inset-0" />
          )}
        </div>

        <div className="flex flex-col justify-between gap-8 md:col-span-4">
          <address className="not-italic">
            <p className="flex items-start gap-3 font-head text-2xl font-extrabold leading-snug md:text-3xl">
              <MapPin className="mt-1 shrink-0 text-gold" aria-hidden />
              <span>{SITE.street}<br />{SITE.district} — Tramandaí/RS<br /><span className="text-ash">CEP {SITE.cep}</span></span>
            </p>
            <a href={`tel:${SITE.phoneTel}`} className="link-u mt-6 inline-flex items-center gap-3 font-head text-xl font-bold">
              <Phone size={20} className="text-gold" aria-hidden /> {SITE.phoneDisplay}
            </a>
            <p className="mt-4 text-ash">{SITE.priceRange}</p>
          </address>
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" data-cursor="IR" className="btn btn-solid self-start">
            <Navigation size={18} aria-hidden /> Traçar rota
          </a>
        </div>
      </div>
    </section>
  )
}
