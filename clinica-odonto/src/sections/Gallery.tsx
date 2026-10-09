import { gallery } from '../config/site'
import { Img } from '../components/ui/Img'
import { Reveal } from '../components/ui/Reveal'

export function Gallery() {
  return (
    <section id="galeria" className="px-5 pb-16 pt-6 lg:pb-20">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <p className="eyebrow">Galeria de sorrisos</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-teal-950 sm:text-4xl">Sorrisos reais, histórias reais</h2>
        </Reveal>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
          {gallery.map((g, i) => (
            <li key={g.image} className={i === 0 ? 'col-span-2 md:col-span-1' : ''}>
              <Reveal delay={i * 0.06}>
                <div className="overflow-hidden rounded-xl">
                  <Img name={g.image} alt={g.alt} className="aspect-[4/5] w-full transition-transform duration-500 hover:scale-105" />
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
