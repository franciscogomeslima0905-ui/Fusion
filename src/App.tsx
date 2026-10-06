import { MotionConfig } from 'motion/react'
import { lazy, Suspense } from 'react'
import { Cursor } from './components/layout/Cursor'
import { FloatingWhatsApp } from './components/layout/FloatingWhatsApp'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { About } from './sections/About'
import { Hero } from './sections/Hero'
import { Marquee } from './sections/Marquee'

// Seções mais abaixo da página são carregadas sob demanda (code splitting).
const Structure = lazy(() => import('./sections/Structure').then((m) => ({ default: m.Structure })))
const WhyFusion = lazy(() => import('./sections/WhyFusion').then((m) => ({ default: m.WhyFusion })))
const Plans = lazy(() => import('./sections/Plans').then((m) => ({ default: m.Plans })))
const Gallery = lazy(() => import('./sections/Gallery').then((m) => ({ default: m.Gallery })))
const Testimonials = lazy(() => import('./sections/Testimonials').then((m) => ({ default: m.Testimonials })))
const Location = lazy(() => import('./sections/Location').then((m) => ({ default: m.Location })))
const Hours = lazy(() => import('./sections/Hours').then((m) => ({ default: m.Hours })))
const Instagram = lazy(() => import('./sections/Instagram').then((m) => ({ default: m.Instagram })))
const FinalCta = lazy(() => import('./sections/FinalCta').then((m) => ({ default: m.FinalCta })))

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-fusion focus:px-5 focus:py-3 focus:text-sm focus:font-semibold"
      >
        Pular para o conteúdo
      </a>
      <Navbar />
      <main id="conteudo">
        <Hero />
        <Marquee />
        <About />
        <Suspense fallback={<div className="min-h-screen" />}>
          <Structure />
          <WhyFusion />
          <Plans />
          <Gallery />
          <Testimonials />
          <Location />
          <Hours />
          <Instagram />
          <FinalCta />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <FloatingWhatsApp />
      <Cursor />
    </MotionConfig>
  )
}
