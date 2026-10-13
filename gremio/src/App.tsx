import { useEffect } from 'react'
import { ScrollTrigger } from './lib/gsap'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { FloatingWhatsApp } from './components/FloatingWhatsApp'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Categories } from './sections/Categories'
import { Training } from './sections/Training'
import { Gallery } from './sections/Gallery'
import { Units } from './sections/Units'
import { FinalCta } from './sections/FinalCta'

export default function App() {
  // fontes e imagens mudam alturas: recalcula posições dos gatilhos de rolagem
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    if (document.readyState === 'complete') refresh()
    else window.addEventListener('load', refresh, { once: true })
    void document.fonts?.ready.then(refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  return (
    <>
      <a href="#escola" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-blue focus:px-4 focus:py-2 focus:text-ink">
        Ir para o conteúdo
      </a>
      <Header />
      <main>
        <Hero />
        <About />
        <Categories />
        <Training />
        <Gallery />
        <Units />
        <FinalCta />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  )
}
