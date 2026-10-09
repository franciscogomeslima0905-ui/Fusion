/** Heurística de aparelho com poucos recursos: usa a versão leve da cena de abertura. */
export function isLowPower(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: { saveData?: boolean; effectiveType?: string }
  }
  if (nav.connection?.saveData) return true
  if (nav.connection?.effectiveType && /(^|-)2g$/.test(nav.connection.effectiveType)) return true
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) return true
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 2) return true
  return false
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Retrato (celular) ou paisagem — escolhe a variante vertical da cena. */
export const isPortrait = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-aspect-ratio: 4/5), (max-width: 767px)').matches
