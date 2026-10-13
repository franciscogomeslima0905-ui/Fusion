import { useEffect, useRef, useState } from 'react'
import { fullAddress, mapsQuery, restaurant } from '../data/restaurant'

const KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
let loader

function loadMaps() {
  if (window.google?.maps) return Promise.resolve(window.google.maps)
  loader ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&v=weekly&loading=async`
    s.async = true
    s.onload = () => resolve(window.google.maps)
    s.onerror = reject
    document.head.append(s)
  })
  return loader
}

const darkStyle = [
  { elementType: 'geometry', stylers: [{ color: '#121212' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#121212' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#262626' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
]

/** Mapa interativo com a chave do .env; sem chave (ou se falhar) usa o mapa incorporado do Google. */
export default function GoogleMap() {
  const el = useRef(null)
  const [fallback, setFallback] = useState(!KEY)

  useEffect(() => {
    if (!KEY) return
    let cancelled = false
    loadMaps()
      .then(async (maps) => {
        const { Geocoder } = await maps.importLibrary('geocoding')
        const { Map } = await maps.importLibrary('maps')
        const { Marker } = await maps.importLibrary('marker')
        const { results } = await new Geocoder().geocode({ address: fullAddress })
        if (cancelled || !results?.[0]) throw new Error('geocode')
        const position = results[0].geometry.location
        const map = new Map(el.current, { center: position, zoom: 16, styles: darkStyle, disableDefaultUI: true, zoomControl: true })
        new Marker({ map, position, title: restaurant.name })
      })
      .catch(() => !cancelled && setFallback(true))
    return () => { cancelled = true }
  }, [])

  if (fallback) {
    return (
      <iframe
        title={`Mapa: ${restaurant.name}, ${fullAddress}`}
        src={`https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&z=16&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full border-0 grayscale invert-[.92] contrast-[.9]"
        allowFullScreen
      />
    )
  }
  return <div ref={el} role="application" aria-label={`Mapa: ${restaurant.name}`} className="h-full w-full" />
}
