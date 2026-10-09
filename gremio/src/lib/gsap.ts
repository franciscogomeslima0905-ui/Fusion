import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
// evita saltos quando a barra de endereço do celular aparece/some
ScrollTrigger.config({ ignoreMobileResize: true })

export { gsap, ScrollTrigger }
export const MOTION_OK = '(prefers-reduced-motion: no-preference)'
export const MOTION_REDUCED = '(prefers-reduced-motion: reduce)'
export const DESKTOP = '(min-width: 1024px)'
