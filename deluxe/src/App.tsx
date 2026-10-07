import { useEffect } from 'react'
import { ScrollTrigger } from './lib/gsap'
import { Header } from './components/Header'
import { Hero } from './sections/Hero'
import { Looks } from './sections/Looks'
import { Story } from './sections/Story'
import { FullScreen } from './sections/FullScreen'
import { Store } from './sections/Store'
import { Footer } from './sections/Footer'

export default function App() {
  // recalcula as posições quando imagens e fontes terminam de carregar
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Looks />
        <Story />
        <FullScreen />
        <Store />
      </main>
      <Footer />
    </>
  )
}
