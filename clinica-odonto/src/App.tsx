import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { DoctorCta } from './sections/DoctorCta'
import { Features } from './sections/Features'
import { FinalCta } from './sections/FinalCta'
import { Gallery } from './sections/Gallery'
import { Hero } from './sections/Hero'
import { Services } from './sections/Services'
import { Stats } from './sections/Stats'
import { Testimonials } from './sections/Testimonials'
import { Tips } from './sections/Tips'

export default function App() {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Pular para o conteúdo
      </a>
      <Navbar />
      <main id="conteudo">
        <Hero />
        <Features />
        <Services />
        <Stats />
        <DoctorCta />
        <Testimonials />
        <Tips />
        <Gallery />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
