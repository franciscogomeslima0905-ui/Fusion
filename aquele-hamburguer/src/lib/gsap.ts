import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Evita saltos na barra de endereço do mobile ao rolar
ScrollTrigger.config({ ignoreMobileResize: true })

export { gsap, ScrollTrigger }

/** Aparelhos mais fracos: reduz blur, 3D e parallax secundário (a montagem é preservada). */
export function isLowPower(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 8
  const mem = nav.deviceMemory ?? 8
  const coarse = window.matchMedia('(pointer: coarse)').matches
  return cores <= 4 || mem <= 4 || (coarse && window.innerWidth < 500 && cores <= 6)
}
