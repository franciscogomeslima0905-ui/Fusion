import { useRef } from 'react'
import { SITE } from '../../lib/links'
import { photoCheddar, photoClassico, photoMolho, photoOnionRings } from '../../data/products'
import { useMaskReveal } from '../../hooks/useMaskReveal'
import { Mask } from '../Mask'
import { InstagramIcon } from '../Icons'

const tiles = [
  { src: photoCheddar, alt: 'Foto do Instagram: hambúrguer com cheddar e bacon', cls: 'col-span-7 row-span-2 aspect-[5/4] md:aspect-auto', pos: '50% 60%' },
  { src: photoOnionRings, alt: 'Foto do Instagram: hambúrguer com onion rings', cls: 'col-span-5 aspect-square', pos: '60% 55%' },
  { src: photoClassico, alt: 'Foto do Instagram: hambúrguer clássico com tomate e picles', cls: 'col-span-5 aspect-[4/3]', pos: '50% 50%' },
  { src: photoMolho, alt: 'Foto do Instagram: hambúrguer com molho cremoso', cls: 'hidden md:block md:col-span-12 md:aspect-[16/6]', pos: '65% 58%' },
]

export default function InstagramSection() {
  const root = useRef<HTMLElement>(null)
  useMaskReveal(root)
  return (
    <section id="instagram" ref={root} aria-labelledby="t-ig" className="relative bg-coal px-5 py-[14vh] md:px-[5vw]">
      <div className="grid items-end gap-10 md:grid-cols-12">
        <h2 id="t-ig" data-mask-group className="display text-[clamp(3.6rem,12vw,11rem)] md:col-span-7">
          <Mask>Segue</Mask>
          <Mask className="text-gold">a gente.</Mask>
        </h2>
        <div className="md:col-span-5 md:pb-4">
          <p className="font-head text-2xl font-extrabold">{SITE.instagramHandle}</p>
          <p className="mt-2 max-w-sm text-ash">Promoções, combos da semana e novidades saem primeiro no Instagram.</p>
          <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" data-cursor="VER" className="btn btn-solid mt-6">
            <InstagramIcon size={18} /> Ver Instagram
          </a>
        </div>
      </div>

      <div className="mt-14 grid grid-cols-12 gap-2 md:gap-3">
        {tiles.map(t => (
          <a key={t.alt} href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" data-cursor="VER" aria-label="Abrir o Instagram do Aquele Hambúrguer" className={`group relative overflow-hidden ${t.cls}`}>
            <img src={t.src} alt={t.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 [filter:brightness(.9)] group-hover:scale-[1.04]" style={{ objectPosition: t.pos }} />
            <div aria-hidden className="grain absolute inset-0" />
          </a>
        ))}
      </div>
    </section>
  )
}
