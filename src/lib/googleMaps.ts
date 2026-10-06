/// <reference types="google.maps" />

/**
 * Carrega a Google Maps JavaScript API uma única vez.
 * A chave vem SEMPRE da variável de ambiente VITE_GOOGLE_MAPS_API_KEY (arquivo .env),
 * nunca do código-fonte.
 */
export const mapsApiKey: string | undefined = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || undefined

let loader: Promise<typeof google.maps> | null = null

/** O Google chama window.gm_authFailure quando a chave é inválida ou não autorizada para o domínio. */
const authListeners = new Set<() => void>()
export function onMapsAuthFailure(cb: () => void): () => void {
  authListeners.add(cb)
  ;(window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => authListeners.forEach((fn) => fn())
  return () => authListeners.delete(cb)
}

export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (!mapsApiKey) return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY não configurada'))
  if (loader) return loader

  loader = new Promise((resolve, reject) => {
    if (window.google?.maps?.Map) return resolve(window.google.maps)
    const cb = '__fusionMapsReady'
    ;(window as unknown as Record<string, () => void>)[cb] = () => resolve(window.google.maps)
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(mapsApiKey)}&v=weekly&language=pt-BR&region=BR&callback=${cb}&loading=async`
    script.async = true
    script.onerror = () => {
      loader = null
      reject(new Error('Falha ao carregar o Google Maps'))
    }
    document.head.appendChild(script)
  })
  return loader
}

/** Estilo escuro com acentos vermelhos, alinhado à identidade da Fusion Gym. */
export const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#121214' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a90' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0b' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2a2a2e' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#232326' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0e0e10' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#2c2c30' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a1517' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#c9a6a8' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#08090c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d42' }] },
]
