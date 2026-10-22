/* ==========================================================================
   Mila Doces e Salgados — interações e animações
   ========================================================================== */
;(() => {
  'use strict'

  /* ----- Configuração: edite aqui ------------------------------------- */
  const CONFIG = {
    // WhatsApp com DDI + DDD + número, apenas dígitos. (51) 98258-9601 → '5551982589601'
    whatsapp: '5551982589601',
    // URL do Instagram (ex.: 'https://instagram.com/seuperfil'). Vazio = link oculto.
    instagram: '',
    // Mensagem usada quando o botão não define uma própria
    defaultMessage: 'Olá! Vim pelo site e gostaria de fazer uma encomenda.',
  }
  /* -------------------------------------------------------------------- */

  const $ = (sel, root = document) => root.querySelector(sel)
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ----- Links de WhatsApp / Instagram -------------------------------- */
  $$('[data-wa]').forEach((a) => {
    const text = a.dataset.wa || CONFIG.defaultMessage
    a.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
  })
  if (CONFIG.instagram) {
    $$('[data-ig]').forEach((a) => {
      a.href = CONFIG.instagram
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.hidden = false
    })
  }
  const year = $('#year')
  if (year) year.textContent = new Date().getFullYear()

  /* ----- Títulos divididos em palavras -------------------------------- */
  $$('[data-split]').forEach((el) => {
    const text = el.textContent.trim().replace(/\s+/g, ' ')
    el.setAttribute('aria-label', text)
    el.textContent = ''
    text.split(' ').forEach((word, i, all) => {
      const outer = document.createElement('span')
      outer.className = 'w'
      outer.setAttribute('aria-hidden', 'true')
      const inner = document.createElement('span')
      inner.className = 'wi'
      inner.style.setProperty('--i', i)
      inner.textContent = word
      outer.append(inner)
      el.append(outer)
      if (i < all.length - 1) el.append(' ')
    })
  })

  /* ----- Escalonamento de filhos -------------------------------------- */
  $$('[data-stagger]').forEach((parent) => {
    Array.from(parent.children).forEach((child, i) => {
      child.setAttribute('data-reveal', '')
      child.style.setProperty('--d', `${i * 90}ms`)
    })
  })

  /* ----- Revelação ao rolar ------------------------------------------- */
  // Imagens começam recortadas (clip-path) e o recorte zera a área visível medida
  // pelo observer; por isso observamos o elemento pai e revelamos o filho.
  const revealTarget = new Map()
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        revealTarget.get(entry.target).classList.add('is-in')
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  )
  const startReveals = () =>
    $$('[data-reveal], [data-split]').forEach((el) => {
      const watched = el.dataset.reveal === 'media' ? el.parentElement : el
      revealTarget.set(watched, el)
      observer.observe(watched)
    })

  // Espera as fontes para o título não "pular" no meio da animação
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1200))]).then(startReveals)

  /* ----- Rolagem: progresso, cabeçalho, parallax, botão flutuante ----- */
  const header = $('#header')
  const progress = $('#progress')
  const fab = $('#fab')
  const cta = $('#contato')
  const parallax = $$('[data-parallax]')
  let lastY = window.scrollY
  let ticking = false

  const onScroll = () => {
    const y = window.scrollY
    const vh = window.innerHeight
    const max = document.documentElement.scrollHeight - vh

    if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`

    const menuOpen = document.body.classList.contains('menu-open')
    if (header && !menuOpen) {
      if (y > 220 && y > lastY + 4) header.classList.add('is-hidden')
      else if (y < lastY - 4 || y <= 220) header.classList.remove('is-hidden')
    }
    lastY = y

    if (fab) {
      // Some quando a chamada final já está na tela (o botão ficaria redundante)
      const ctaTop = cta ? cta.getBoundingClientRect().top : Infinity
      fab.classList.toggle('is-visible', y > vh * 0.7 && ctaTop > vh * 0.6)
    }

    if (!reduceMotion) {
      parallax.forEach((layer) => {
        const host = layer.parentElement
        const r = host.getBoundingClientRect()
        if (r.bottom < -50 || r.top > vh + 50) return
        const p = (vh - r.top) / (vh + r.height)
        const shift = (p - 0.5) * 2 * r.height * 0.07
        layer.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`
      })
    }
    ticking = false
  }
  const requestTick = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(onScroll)
  }
  window.addEventListener('scroll', requestTick, { passive: true })
  window.addEventListener('resize', requestTick)
  onScroll()

  /* ----- Menu mobile -------------------------------------------------- */
  const menuBtn = $('#menuBtn')
  const menu = $('#menu')
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open)
    menuBtn.setAttribute('aria-expanded', String(open))
    menuBtn.querySelector('.menu-btn__label').textContent = open ? 'Fechar' : 'Menu'
    menu.setAttribute('aria-hidden', String(!open))
    if (open) header.classList.remove('is-hidden')
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')))
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)))
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        setMenu(false)
        menuBtn.focus()
      }
    })
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
      if (e.matches) setMenu(false)
    })
  }

  /* ----- Filtro do cardápio ------------------------------------------- */
  const cards = $$('.card')
  const count = $('[data-count]')
  const setFilter = (cat) => {
    $$('[data-filter]').forEach((el) => {
      const active = el.dataset.filter === cat
      el.classList.toggle('is-active', active)
      if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', String(active))
      else if (active) el.setAttribute('aria-current', 'true')
      else el.removeAttribute('aria-current')
    })
    let shown = 0
    cards.forEach((card) => {
      const match = cat === 'todos' || card.dataset.cat === cat
      card.hidden = !match
      if (!match) return
      card.classList.add('is-in')
      card.classList.remove('pop')
      void card.offsetWidth // reinicia a animação
      card.style.setProperty('--d', `${shown * 80}ms`)
      card.classList.add('pop')
      shown++
    })
    if (count) count.textContent = String(shown)
  }
  $$('[data-filter]').forEach((el) => {
    el.addEventListener('click', () => setFilter(el.dataset.filter))
  })

  /* ----- Dúvidas (acordeão) ------------------------------------------- */
  $$('.faq__q').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq__item')
      const open = !item.classList.contains('is-open')
      $$('.faq__item.is-open').forEach((other) => {
        if (other === item) return
        other.classList.remove('is-open')
        $('.faq__q', other).setAttribute('aria-expanded', 'false')
      })
      item.classList.toggle('is-open', open)
      btn.setAttribute('aria-expanded', String(open))
    })
  })
})()
