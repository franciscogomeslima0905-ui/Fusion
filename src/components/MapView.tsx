import { useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { darkMapStyle, loadGoogleMaps, mapsApiKey, onMapsAuthFailure } from '../lib/googleMaps'

type MapViewProps = {
  /** Endereço completo — usado no Geocoding e no fallback sem chave. */
  address: string
  /** Coordenadas de reserva, caso o Geocoding não esteja disponível. */
  fallback: { lat: number; lng: number }
  title: string
  zoom?: number
  className?: string
}

const pinSvg = (color: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="70" viewBox="0 0 56 70"><defs><filter id="g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs><ellipse cx="28" cy="64" rx="10" ry="3" fill="#000" opacity=".5"/><path d="M28 4C16 4 7 13 7 25c0 15 21 37 21 37s21-22 21-37C49 13 40 4 28 4Z" fill="${color}" filter="url(#g)" opacity=".6"/><path d="M28 4C16 4 7 13 7 25c0 15 21 37 21 37s21-22 21-37C49 13 40 4 28 4Z" fill="${color}" stroke="#fff" stroke-width="2"/><path d="M31 14 21 27h7l-3 11 11-14h-7l2-10Z" fill="#fff"/></svg>`,
  )}`

/**
 * Mapa reutilizável.
 * • Com VITE_GOOGLE_MAPS_API_KEY: Google Maps JavaScript API, interativo, com estilo escuro e marcador próprio.
 * • Sem a chave: incorpora o Google Maps padrão (iframe), para o site nunca ficar sem mapa.
 * O carregamento só começa quando o mapa se aproxima da tela (lazy).
 */
export function MapView({ address, fallback, title, zoom = 16, className = '' }: MapViewProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const inView = useInView(wrapRef, { once: true, margin: '400px 0px' })
  const [mode, setMode] = useState<'loading' | 'api' | 'embed'>(mapsApiKey ? 'loading' : 'embed')

  useEffect(() => {
    if (!inView || !mapsApiKey) return
    let cancelled = false
    // chave inválida/restrita → volta para o mapa incorporado em vez de exibir o erro do Google
    const offAuth = onMapsAuthFailure(() => !cancelled && setMode('embed'))
    loadGoogleMaps()
      .then(async (maps) => {
        if (cancelled || !mapRef.current) return
        const map = new maps.Map(mapRef.current, {
          center: fallback,
          zoom,
          styles: darkMapStyle,
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: true,
          gestureHandling: 'cooperative',
          backgroundColor: '#121214',
          clickableIcons: false,
        })
        const marker = new maps.Marker({
          map,
          position: fallback,
          title,
          icon: { url: pinSvg('#e3131b'), scaledSize: new maps.Size(56, 70), anchor: new maps.Point(28, 66) },
          animation: maps.Animation.DROP,
        })
        const info = new maps.InfoWindow({
          content: `<div style="font-family:system-ui;padding:2px 4px;color:#111"><strong>${title}</strong><br/><span style="font-size:12px">${address}</span></div>`,
        })
        marker.addListener('click', () => info.open({ map, anchor: marker }))
        setMode('api')

        // Posição exata a partir do endereço (requer a Geocoding API habilitada na chave).
        try {
          const { results } = await new maps.Geocoder().geocode({ address })
          const loc = results[0]?.geometry.location
          if (loc && !cancelled) {
            map.setCenter(loc)
            marker.setPosition(loc)
          }
        } catch {
          /* mantém as coordenadas de reserva */
        }
      })
      .catch(() => !cancelled && setMode('embed'))
    return () => {
      cancelled = true
      offAuth()
    }
  }, [inView, address, fallback, title, zoom])

  return (
    <div ref={wrapRef} className={`relative overflow-hidden bg-carbon ${className}`}>
      {mode === 'embed' ? (
        inView && (
          <iframe
            title={`Mapa: ${title}`}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=${zoom}&hl=pt-BR&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0 [filter:grayscale(1)_invert(0.92)_contrast(0.9)_brightness(0.95)]"
            allowFullScreen
          />
        )
      ) : (
        <div ref={mapRef} className="absolute inset-0" role="region" aria-label={`Mapa interativo: ${title}`} />
      )}
      {mode === 'loading' && (
        <div className="absolute inset-0 grid place-items-center font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
          <span className="animate-pulse">Carregando mapa…</span>
        </div>
      )}
    </div>
  )
}
