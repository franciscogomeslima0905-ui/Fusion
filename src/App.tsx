import { MotionConfig } from 'motion/react'
import { useLayoutEffect } from 'react'
import { Cursor } from './components/layout/Cursor'
import { FloatingWhatsApp } from './components/layout/FloatingWhatsApp'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { About } from './sections/About'
import { Hero } from './sections/Hero'
import { Marquee } from './sections/Marquee'
import { Deferred, FinalCta, Gallery, Hours, Instagram, Location, Plans, Structure, Testimonials, WhyFusion } from './sections/deferred'

export default function App({ onReady }: { onReady?: () => void }) {
  // roda antes da primeira pintura: a versão interativa substitui o HTML estático sem piscar
  useLayoutEffect(() => onReady?.(), [onReady])
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
        <Deferred fallback={<div className="min-h-screen" />}>
          <Structure />
          <WhyFusion />
          <Plans />
          <Gallery />
          <Testimonials />
          <Location />
          <Hours />
          <Instagram />
          <FinalCta />
        </Deferred>
      </main>
      <Footer />
      <FloatingWhatsApp />
      <Cursor />
    </MotionConfig>
  )
}
