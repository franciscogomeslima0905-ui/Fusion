import { lazy, Suspense } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import OXis from './components/OXis'
import NaChapa from './components/NaChapa'
import Numbers from './components/Numbers'
import ProductLineup from './components/ProductLineup'
import Porcoes from './components/Porcoes'
import AlaMinuta from './components/AlaMinuta'
import Menu from './components/Menu'
import Gallery from './components/Gallery'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import ScrollChrome from './components/ScrollChrome'

// Mapa e CTA ficam no fim da página: carregados sob demanda.
const Location = lazy(() => import('./components/Location'))
const FinalCTA = lazy(() => import('./components/FinalCTA'))

export default function App() {
  return (
    <div className="grain">
      <a href="#cardapio" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-red focus:px-4 focus:py-2">
        Ir para o cardápio
      </a>
      <Header />
      <ScrollChrome />
      <main>
        <Hero />
        <OXis />
        <NaChapa />
        <Numbers />
        <ProductLineup />
        <Porcoes />
        <AlaMinuta />
        <Menu />
        <Gallery />
        <Suspense fallback={<div className="min-h-screen" />}>
          <Location />
          <FinalCTA />
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
