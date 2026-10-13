import BurgerAssembly from './components/BurgerAssembly/BurgerAssembly'
import BurgerShowcase from './components/BurgerShowcase/BurgerShowcase'
import Cursor from './components/Cursor/Cursor'
import FinalCTA from './components/FinalCTA/FinalCTA'
import Footer from './components/Footer/Footer'
import Header from './components/Header/Header'
import HorizontalProducts from './components/HorizontalProducts/HorizontalProducts'
import InstagramSection from './components/InstagramSection/InstagramSection'
import Location from './components/Location/Location'
import Marquee from './components/Marquee/Marquee'
import MenuCTA from './components/MenuCTA/MenuCTA'
import Reviews from './components/Reviews/Reviews'
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton'

export default function App() {
  return (
    <>
      <a href="#hamburgueres" className="sr-only z-[70] bg-gold p-3 font-bold text-ink focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Pular para o conteúdo</a>
      <Header />
      <main>
        <BurgerAssembly />
        <Marquee />
        <BurgerShowcase />
        <HorizontalProducts />
        <MenuCTA />
        <Reviews />
        <InstagramSection />
        <Location />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppButton />
      <Cursor />
    </>
  )
}
