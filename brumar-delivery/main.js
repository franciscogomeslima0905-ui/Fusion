/* Brumar Delivery — configuração e animações (JS puro, sem dependências) */

// ─── EDITE AQUI ──────────────────────────────────────────────────────────────
const CONFIG = {
  // Número do WhatsApp com DDI + DDD, só dígitos. Ex.: '5551999999999'
  whatsapp: '5500000000000',
  message: 'Olá, Brumar Delivery! Quero fazer um pedido.',
  // Instagram (perfil visto nas capturas). Vazio = link oculto no rodapé.
  instagram: 'https://www.instagram.com/brumar_delivery/',
}
// ─────────────────────────────────────────────────────────────────────────────

const root = document.documentElement
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)]

/* Links de WhatsApp / Instagram */
$$('[data-wa]').forEach((a) => {
  const item = a.dataset.item
  const text = item ? `Olá, Brumar Delivery! Quero pedir: ${item}.` : CONFIG.message
  a.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`
  a.target = '_blank'
  a.rel = 'noopener noreferrer'
})
$$('[data-ig]').forEach((a) => {
  if (!CONFIG.instagram) return
  a.href = CONFIG.instagram
  a.target = '_blank'
  a.rel = 'noopener noreferrer'
  a.hidden = false
})
const year = document.getElementById('year')
if (year) year.textContent = new Date().getFullYear()

/* Palavras em máscara (títulos com data-split) */
$$('[data-split]').forEach((el) => {
  const text = el.textContent.trim()
  el.setAttribute('aria-label', text)
  el.textContent = ''
  text.split(/\s+/).forEach((word, i, all) => {
    const w = document.createElement('span')
    w.className = 'w'
    w.setAttribute('aria-hidden', 'true')
    const inner = document.createElement('span')
    inner.style.setProperty('--i', i)
    inner.textContent = word
    w.append(inner)
    el.append(w)
    if (i < all.length - 1) el.append(' ')
  })
})

/* Entrada ao rolar */
$$('[data-stagger]').forEach((group) => {
  $$('[data-reveal]', group).forEach((el, i) => el.style.setProperty('--d', `${i * 110}ms`))
})
const revealTargets = $$('[data-reveal], [data-split], .step')
if (reduce || !('IntersectionObserver' in window)) {
  revealTargets.forEach((el) => el.classList.add('is-in'))
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        e.target.classList.add('is-in')
        io.unobserve(e.target)
      })
    },
    { threshold: 0.18, rootMargin: '0px 0px -6% 0px' },
  )
  revealTargets.forEach((el) => io.observe(el))
}

/* Vídeo do hero: carga, pausa fora da tela e respeito a prefers-reduced-motion */
const heroVideos = $$('.hero video')
const fg = document.querySelector('.hero__fg')
const start = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-loaded')))
const videoReady = new Promise((resolve) => {
  if (!fg || fg.readyState >= 2) return resolve()
  fg.addEventListener('loadeddata', resolve, { once: true })
})
Promise.race([videoReady, new Promise((r) => setTimeout(r, 1800))]).then(start)

if (reduce) {
  heroVideos.forEach((v) => {
    v.removeAttribute('autoplay')
    v.pause()
  })
} else if ('IntersectionObserver' in window && heroVideos.length) {
  new IntersectionObserver(
    ([e]) =>
      heroVideos.forEach((v) => {
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      }),
    { threshold: 0.05 },
  ).observe(document.querySelector('.hero'))
}

/* Filtro do cardápio */
const tabs = $$('.tab')
const cards = $$('.card')
let busy = false
tabs.forEach((tab) =>
  tab.addEventListener('click', () => {
    if (busy || tab.classList.contains('is-active')) return
    tabs.forEach((t) => {
      const on = t === tab
      t.classList.toggle('is-active', on)
      t.setAttribute('aria-selected', String(on))
    })
    const f = tab.dataset.filter
    busy = true
    cards.forEach((c) => c.classList.add('is-leaving'))
    setTimeout(
      () => {
        let n = 0
        cards.forEach((c) => {
          const show = f === 'all' || c.dataset.cat === f
          c.hidden = !show
          c.classList.remove('is-leaving', 'is-entering')
          c.classList.add('is-in')
          c.style.setProperty('--d', '0ms')
          if (show) {
            void c.offsetWidth
            c.style.setProperty('--i', n++)
            c.classList.add('is-entering')
          }
        })
        busy = false
      },
      reduce ? 0 : 260,
    )
  }),
)

/* Scroll: progresso, nav, parallax e logo girando */
const nav = document.querySelector('.nav')
const bar = document.querySelector('.progress span')
const parallax = $$('[data-parallax]')
let ticking = false

function update() {
  ticking = false
  const y = window.scrollY
  const vh = window.innerHeight
  const max = document.documentElement.scrollHeight - vh
  bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0)
  nav.classList.toggle('is-scrolled', y > 8)
  if (reduce) return

  parallax.forEach((el) => {
    const r = el.parentElement.getBoundingClientRect()
    if (r.bottom < -100 || r.top > vh + 100) return
    const f = parseFloat(el.dataset.parallax) || 0.1
    const s = parseFloat(getComputedStyle(el).getPropertyValue('--s')) || 1.18
    const slack = (r.height * (s - 1)) / 2
    const offset = r.top + r.height / 2 - vh / 2
    const py = Math.max(-slack, Math.min(slack, -offset * f))
    el.style.setProperty('--py', `${py.toFixed(1)}px`)
  })
}
const onScroll = () => {
  if (!ticking) {
    ticking = true
    requestAnimationFrame(update)
  }
}
window.addEventListener('scroll', onScroll, { passive: true })
window.addEventListener('resize', onScroll)
update()

/* Botões magnéticos */
if (finePointer && !reduce) {
  $$('[data-magnetic]').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect()
      const x = (e.clientX - (r.left + r.width / 2)) * 0.18
      const y = (e.clientY - (r.top + r.height / 2)) * 0.3
      btn.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
    })
    btn.addEventListener('pointerleave', () => (btn.style.transform = ''))
  })
}
