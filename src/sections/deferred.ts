import { lazy } from 'react'

// Seções mais abaixo da página são carregadas sob demanda (code splitting).
// No pré-render (scripts/prerender.mjs) este módulo é trocado por ./eager.ts.
export const Structure = lazy(() => import('./Structure').then((m) => ({ default: m.Structure })))
export const WhyFusion = lazy(() => import('./WhyFusion').then((m) => ({ default: m.WhyFusion })))
export const Plans = lazy(() => import('./Plans').then((m) => ({ default: m.Plans })))
export const Gallery = lazy(() => import('./Gallery').then((m) => ({ default: m.Gallery })))
export const Testimonials = lazy(() => import('./Testimonials').then((m) => ({ default: m.Testimonials })))
export const Location = lazy(() => import('./Location').then((m) => ({ default: m.Location })))
export const Hours = lazy(() => import('./Hours').then((m) => ({ default: m.Hours })))
export const Instagram = lazy(() => import('./Instagram').then((m) => ({ default: m.Instagram })))
export const FinalCta = lazy(() => import('./FinalCta').then((m) => ({ default: m.FinalCta })))

/** Limite de carregamento das seções acima (no pré-render vira um fragmento simples). */
export { Suspense as Deferred } from 'react'
