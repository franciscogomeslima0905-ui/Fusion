import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { menu } from '../data/menu'
import { restaurant } from '../data/restaurant'
import MenuItem from './MenuItem'
import Button from './Button'
import { Chapter } from './StoryScene'

export default function Menu() {
  const [active, setActive] = useState(menu[0].id)
  const cat = menu.find((c) => c.id === active)
  return (
    <section id="cardapio" data-chapter="07" aria-labelledby="menu-title" className="relative bg-ink px-5 py-24 sm:px-12 sm:py-32">
      <div className="mx-auto max-w-[1400px]">
        <Chapter n="07" className="mb-4">Cardápio</Chapter>
        <h2 id="menu-title" className="display text-[22vw] sm:text-[12vw]">Cardápio</h2>

        <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-16">
          <div role="tablist" aria-label="Categorias do cardápio" className="hide-scroll -mx-5 flex gap-1 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
            {menu.map((c, i) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={active === c.id}
                onClick={() => setActive(c.id)}
                className={`group flex shrink-0 items-baseline gap-3 border-b border-bone/15 px-3 py-3 text-left transition-colors lg:px-0 lg:py-4 ${active === c.id ? 'text-bone' : 'text-ash/60 hover:text-bone'}`}
              >
                <span className={`mono ${active === c.id ? 'text-red' : ''}`}>0{i + 1}</span>
                <span className="display text-3xl sm:text-4xl">{c.name}</span>
              </button>
            ))}
          </div>

          <div role="tabpanel" aria-live="polite" className="min-h-[28rem]">
            <AnimatePresence mode="wait">
              <motion.ul
                key={cat.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-3"
              >
                {cat.items.map((it) => <MenuItem key={it.name} item={it} />)}
              </motion.ul>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-bone/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="cond max-w-xl text-xl text-ash">
            Cardápio completo, com adicionais, combos, bebidas e sobremesas, no cardápio digital oficial.
          </p>
          <Button href={restaurant.menuUrl}>Abrir cardápio completo</Button>
        </div>
      </div>
    </section>
  )
}
