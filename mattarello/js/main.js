(() => {
  'use strict'

  const cfg = window.MATTARELLO || {}
  const $ = (sel, root = document) => root.querySelector(sel)
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ------------------------------------------------------------------
     Dados de contato (config.js)
     ------------------------------------------------------------------ */
  const external = (a, url) => {
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
  }

  if (cfg.ifoodUrl) $$('[data-ifood]').forEach((a) => external(a, cfg.ifoodUrl))

  const digits = (cfg.whatsapp || '').replace(/\D/g, '')
  if (digits) {
    const msg = encodeURIComponent(cfg.whatsappMessage || '')
    $$('[data-whatsapp]').forEach((a) => {
      external(a, `https://wa.me/${digits}${msg ? `?text=${msg}` : ''}`)
      a.hidden = false
    })
  }

  if (cfg.mapsUrl) {
    $$('[data-maps]').forEach((a) => {
      external(a, cfg.mapsUrl)
      a.hidden = false
    })
  }

  const instaHandle = (cfg.instagram || '').trim()
  const instaUrl = instaHandle
    ? /^https?:\/\//i.test(instaHandle)
      ? instaHandle
      : `https://instagram.com/${instaHandle.replace(/^@/, '')}`
    : ''
  if (instaUrl) {
    $$('[data-instagram]').forEach((a) => {
      external(a, instaUrl)
      a.hidden = false
    })
  }

  // Bloco de informações (endereço, horários, telefone, Instagram) e só mostra o que foi preenchido
  const info = $('#info')
  if (info) {
    const SVG = 'http://www.w3.org/2000/svg'
    const row = (icon, title, nodes) => {
      const li = document.createElement('li')
      const svg = document.createElementNS(SVG, 'svg')
      svg.setAttribute('aria-hidden', 'true')
      const use = document.createElementNS(SVG, 'use')
      use.setAttribute('href', `#${icon}`)
      svg.appendChild(use)
      const box = document.createElement('div')
      const b = document.createElement('b')
      b.textContent = title
      box.appendChild(b)
      nodes.forEach((n) => box.appendChild(n))
      li.append(svg, box)
      info.appendChild(li)
    }
    const text = (t) => {
      const s = document.createElement('span')
      s.textContent = t
      s.style.display = 'block'
      return s
    }
    const link = (t, url) => {
      const a = document.createElement('a')
      a.textContent = t
      external(a, url)
      return a
    }

    if (cfg.address) row('i-pin', 'Endereço', [cfg.mapsUrl ? link(cfg.address, cfg.mapsUrl) : text(cfg.address)])
    if (Array.isArray(cfg.hours) && cfg.hours.length) {
      row(
        'i-clock',
        'Horários',
        cfg.hours.map((h) => {
          const d = document.createElement('span')
          d.className = 'hr'
          const l = document.createElement('span')
          l.textContent = h.label
          const v = document.createElement('span')
          v.textContent = h.value
          d.append(l, v)
          return d
        }),
      )
    }
    if (cfg.phone) {
      const tel = cfg.phone.replace(/[^\d+]/g, '')
      const a = document.createElement('a')
      a.textContent = cfg.phone
      a.href = `tel:${tel}`
      row('i-phone', 'Telefone', [a])
    }
    if (instaUrl) row('i-insta', 'Instagram', [link(instaHandle.startsWith('http') ? 'Siga no Instagram' : instaHandle.replace(/^(?!@)/, '@'), instaUrl)])
    info.hidden = info.children.length === 0
  }

  const year = $('#year')
  if (year) year.textContent = new Date().getFullYear()

  /* ------------------------------------------------------------------
     Navegação: estado ao rolar, progresso, scrollspy, voltar ao topo
     ------------------------------------------------------------------ */
  const nav = $('#nav')
  const toTop = $('.to-top')
  let ticking = false

  const onScroll = () => {
    ticking = false
    const y = window.scrollY
    const max = document.documentElement.scrollHeight - window.innerHeight
    nav.classList.toggle('is-scrolled', y > 10)
    nav.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0)
    toTop.classList.toggle('is-visible', y > 700)
    if (!reduceMotion) parallax()
  }
  const requestTick = () => {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(onScroll)
    }
  }

  const parallaxEls = $$('[data-parallax]')
  function parallax() {
    const vh = window.innerHeight
    parallaxEls.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect()
      if (r.bottom < -100 || r.top > vh + 100) return
      const speed = parseFloat(el.dataset.parallax) || 0.06
      const limit = r.height * 0.045
      const offset = r.top + r.height / 2 - vh / 2
      const y = Math.max(-limit, Math.min(limit, -offset * speed))
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(1.1)`
    })
  }

  window.addEventListener('scroll', requestTick, { passive: true })
  window.addEventListener('resize', requestTick)
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }))

  const spyLinks = $$('[data-spy]')
  const spyTargets = spyLinks.map((a) => document.getElementById(a.dataset.spy)).filter(Boolean)
  if ('IntersectionObserver' in window && spyTargets.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          spyLinks.forEach((a) => a.classList.toggle('is-active', a.dataset.spy === e.target.id))
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    spyTargets.forEach((t) => spy.observe(t))
  }

  /* Menu móvel */
  const burger = $('.nav__burger')
  const menu = $('#menu')
  const menuLinks = $$('.menu__nav a')
  menuLinks.forEach((a, k) => a.style.setProperty('--i', k))
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open))
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu')
    menu.classList.toggle('is-open', open)
    menu.setAttribute('aria-hidden', String(!open))
    document.body.style.overflow = open ? 'hidden' : ''
  }
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'))
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)))
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false)
  })
  window.matchMedia('(min-width: 961px)').addEventListener('change', (m) => m.matches && setMenu(false))

  /* ------------------------------------------------------------------
     Animações de revelação ao rolar
     ------------------------------------------------------------------ */
  const reveals = $$('[data-reveal]')
  reveals.forEach((el) => el.style.setProperty('--d', el.dataset.delay || 0))
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    reveals.forEach((el) => io.observe(el))
  } else {
    reveals.forEach((el) => el.classList.add('is-in'))
  }

  /* ------------------------------------------------------------------
     Carrossel do hero
     Troca sozinho a cada SLIDE_MS. Para adicionar mídia: duplique um
     <article class="hero__text"> e um <figure class="hero__slide"> no HTML.
     ------------------------------------------------------------------ */
  const SLIDE_MS = 5500

  const hero = $('#inicio')
  const texts = $$('.hero__text', hero)
  const slides = $$('.hero__slide', hero)
  const indexEl = $('.hero__index b', hero)
  const total = slides.length
  const pad = (n) => String(n).padStart(2, '0')
  let current = 0
  let elapsed = 0
  let offscreen = false

  function go(n) {
    n = (n + total) % total
    slides[current].classList.remove('is-active')
    texts[current].classList.remove('is-active')
    current = n
    elapsed = 0
    slides[current].classList.add('is-active')
    texts[current].classList.add('is-active')
    slides.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== current)))
    if (indexEl) indexEl.textContent = pad(current + 1)
  }

  // Temporizador do carrossel (independe de animações CSS, então funciona
  // mesmo com "reduzir movimento" ativado no aparelho).
  let last = performance.now()
  function tick(now) {
    const dt = Math.min(now - last, 100)
    last = now
    if (!offscreen && !document.hidden) {
      elapsed += dt
      if (elapsed >= SLIDE_MS) go(current + 1)
    }
    requestAnimationFrame(tick)
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => (offscreen = !e.isIntersecting), { threshold: 0.2 }).observe(hero)
  }

  // Gestos de arrastar (toque) e teclado
  const media = $('.hero__media', hero)
  let startX = null
  media.addEventListener('pointerdown', (e) => {
    startX = e.clientX
  })
  media.addEventListener('pointerup', (e) => {
    if (startX === null) return
    const dx = e.clientX - startX
    startX = null
    if (Math.abs(dx) > 48) go(current + (dx < 0 ? 1 : -1))
  })
  media.addEventListener('pointercancel', () => (startX = null))
  hero.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(current + 1)
    if (e.key === 'ArrowLeft') go(current - 1)
  })

  requestAnimationFrame(tick)
  slides.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== 0)))
  onScroll()
})()
