import { FULL_ADDRESS } from './links'

const KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()
export const hasMapsKey = Boolean(KEY && KEY !== 'YOUR_GOOGLE_MAPS_API_KEY')

let loader: Promise<typeof google.maps> | null = null

/** Carrega a Google Maps JavaScript API uma única vez. A chave vem do .env (nunca do código). */
export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (!hasMapsKey) return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY ausente'))
  if (loader) return loader
  loader = new Promise((resolve, reject) => {
    if (window.google?.maps) return resolve(window.google.maps)
    ;(window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => reject(new Error('Chave do Google Maps inválida'))
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(KEY!)}&v=weekly&language=pt-BR&region=BR`
    s.async = true
    s.onload = () => (window.google?.maps ? resolve(window.google.maps) : reject(new Error('Maps não carregou')))
    s.onerror = () => reject(new Error('Falha ao carregar o Google Maps'))
    document.head.appendChild(s)
  })
  return loader
}

/** Mapa embutido sem chave (fallback oficial do Google). */
export const embedFallbackUrl = `https://maps.google.com/maps?q=${encodeURIComponent(FULL_ADDRESS)}&z=16&output=embed&hl=pt-BR`

/** Estilo escuro, poucos elementos, ruas em tons de preto/cinza e água escura. */
export const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0d0d0d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a3a3a3' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#050505' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1c1c1c' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#111111' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#262626' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3a3a' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#050505' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
]

export const markerIcon = (maps: typeof google.maps): google.maps.Symbol => ({
  path: 'M12 0C5.4 0 0 5.4 0 12c0 9 12 22 12 22s12-13 12-22C24 5.4 18.6 0 12 0Zm0 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z',
  fillColor: '#FFB800',
  fillOpacity: 1,
  strokeColor: '#050505',
  strokeWeight: 1.5,
  scale: 1.5,
  anchor: new maps.Point(12, 34),
})
