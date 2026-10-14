/* ==========================================================================
   MASTER CAR — comportamento e animações
   GSAP + ScrollTrigger + SplitText (arquivos locais em /vendor)
   ========================================================================== */
(() => {
  'use strict';

  /* ----------------------------------------------------------------------
     CONFIGURAÇÃO — edite aqui
     WhatsApp com DDI + DDD + número, só dígitos. Ex.: Brasil, RS, 51 99999-9999 → 5551999999999
     ---------------------------------------------------------------------- */
  const CONFIG = {
    whatsapp: '5500000000000'
  };

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  const waLink = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

  /* ----------------------------------------------------------------------
     INTERFACE (funciona mesmo sem animações)
     ---------------------------------------------------------------------- */
  $$('[data-wa]').forEach((a) => { a.href = waLink(a.dataset.wa); });
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Menu em tela cheia */
  const nav = $('#nav');
  const menu = $('#menu');
  const menuBtn = $('#menuBtn');
  const menuLabel = $('.nav__menu-label');

  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    menuLabel.textContent = open ? menuLabel.dataset.close : menuLabel.dataset.open;
    if (open) nav.classList.remove('nav--hidden');
  }
  menuBtn.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('menu-open') && !root.classList.contains('lb-open')) { setMenu(false); menuBtn.focus(); }
  });

  /* Âncoras: rolagem suave com o menu fechando junto */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const wasOpen = root.classList.contains('menu-open');
      if (wasOpen) setMenu(false);
      const go = () => {
        const top = id === '#inicio' ? 0 : target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
      };
      wasOpen ? setTimeout(go, 60) : go();
    });
  });

  /* Barra de navegação: esconde ao descer, volta ao subir + progresso de leitura */
  const progress = $('#progress');
  let lastY = window.scrollY;
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    if (!root.classList.contains('menu-open')) {
      if (y > lastY && y > 240) nav.classList.add('nav--hidden');
      else if (y < lastY) nav.classList.remove('nav--hidden');
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* Hero: carrossel de carros (troca automática, pausa ao passar o mouse) */
  const hero = $('#inicio');
  const slides = $$('.hero__slide');
  const pips = $$('.pip');
  const heroCap = $('#heroCap');
  const heroNum = $('#heroNum');
  const heroNames = ['Volkswagen Jetta', 'Volkswagen Passat', 'Volkswagen Jetta · em atendimento'];
  const SLIDE_MS = 6000;
  let slideIdx = 0;
  let slideTimer = null;
  let slideStart = 0;
  let slideLeft = SLIDE_MS;

  hero.style.setProperty('--slide-dur', `${SLIDE_MS}ms`);

  function showSlide(i) {
    slideIdx = (i + slides.length) % slides.length;
    slides.forEach((sl, k) => sl.classList.toggle('is-on', k === slideIdx));
    pips.forEach((pp, k) => {
      pp.classList.remove('is-on', 'is-done');
      pp.setAttribute('aria-selected', String(k === slideIdx));
      if (k < slideIdx) pp.classList.add('is-done');
    });
    // reinicia a animação do indicador ativo
    void hero.offsetWidth;
    pips[slideIdx].classList.add('is-on');
    heroCap.textContent = heroNames[slideIdx] || '';
    heroNum.textContent = `0${slideIdx + 1} / 0${slides.length}`;
  }
  function armSlide(ms) {
    clearTimeout(slideTimer);
    if (reduced) return;
    slideLeft = ms;
    slideStart = Date.now();
    slideTimer = setTimeout(() => { showSlide(slideIdx + 1); armSlide(SLIDE_MS); }, ms);
  }
  pips.forEach((pp, k) => pp.addEventListener('click', () => { showSlide(k); armSlide(SLIDE_MS); }));
  const stage = $('#heroStage');
  stage.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse' || reduced) return;
    clearTimeout(slideTimer);
    slideLeft = Math.max(400, slideLeft - (Date.now() - slideStart));
    hero.classList.add('is-paused');
  });
  stage.addEventListener('pointerleave', () => {
    if (!hero.classList.contains('is-paused')) return;
    hero.classList.remove('is-paused');
    armSlide(slideLeft);
  });
  showSlide(0);
  armSlide(SLIDE_MS);

  /* Vídeo do estúdio: só toca quando está na tela */
  const studioVideo = $('#studioVideo');
  if (studioVideo && !reduced && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) studioVideo.play().catch(() => {});
      else studioVideo.pause();
    }, { threshold: 0.15 }).observe(studioVideo);
  }

  /* Galeria: visualizador de fotos */
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCap');
  const workBtns = $$('.work__btn');
  let lbIdx = 0;
  let lbOpener = null;
  function lbShow(i) {
    lbIdx = (i + workBtns.length) % workBtns.length;
    const im = $('img', workBtns[lbIdx]);
    lbImg.src = im.currentSrc || im.src;
    lbImg.alt = im.alt;
    lbCap.textContent = $('figcaption', workBtns[lbIdx]).innerText.replace(/\s*\n\s*/g, ' · ');
  }
  function lbOpen(i) {
    lbOpener = document.activeElement;
    lbShow(i);
    root.classList.add('lb-open');
    lb.setAttribute('aria-hidden', 'false');
    $('.lightbox__close').focus();
  }
  function lbClose() {
    root.classList.remove('lb-open');
    lb.setAttribute('aria-hidden', 'true');
    if (lbOpener) lbOpener.focus();
  }
  workBtns.forEach((b, i) => b.addEventListener('click', () => lbOpen(i)));
  $('.lightbox__close').addEventListener('click', lbClose);
  $('.lightbox__nav--prev').addEventListener('click', () => lbShow(lbIdx - 1));
  $('.lightbox__nav--next').addEventListener('click', () => lbShow(lbIdx + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) lbClose(); });
  document.addEventListener('keydown', (e) => {
    if (!root.classList.contains('lb-open')) return;
    if (e.key === 'Escape') lbClose();
    else if (e.key === 'ArrowLeft') lbShow(lbIdx - 1);
    else if (e.key === 'ArrowRight') lbShow(lbIdx + 1);
  });

  /* Serviços: item ativo + troca de imagem com "wipe" */
  const svcItems = $$('.svc__item');
  const imgA = $('#svcImgA');
  const imgB = $('#svcImgB');
  const svcCap = $('#svcCap');
  let svcFront = imgA;
  let svcCurrent = 0;
  let svcTimer;

  function showSvcImage(item) {
    const back = svcFront === imgA ? imgB : imgA;
    const old = svcFront;
    back.src = item.dataset.img;
    back.style.objectPosition = item.dataset.pos || '50% 50%';
    back.style.transition = 'none';
    back.classList.remove('is-on');
    back.style.zIndex = 2;
    void back.offsetWidth; // reflow
    back.style.transition = '';
    back.classList.add('is-on');
    old.style.zIndex = 1;
    svcFront = back;
    clearTimeout(svcTimer);
    svcTimer = setTimeout(() => { old.classList.remove('is-on'); }, 1000);
  }
  function setService(i) {
    if (i === svcCurrent) return;
    svcCurrent = i;
    svcItems.forEach((it, idx) => {
      const on = idx === i;
      it.classList.toggle('is-active', on);
      $('.svc__btn', it).setAttribute('aria-expanded', String(on));
    });
    svcCap.textContent = `0${i + 1} / 0${svcItems.length}`;
    showSvcImage(svcItems[i]);
  }
  svcItems.forEach((it, i) => {
    $('.svc__btn', it).addEventListener('click', () => setService(i));
    it.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setService(i); });
  });
  window.addEventListener('load', () => {
    svcItems.forEach((it) => { const im = new Image(); im.src = it.dataset.img; });
  });

  /* Dúvidas: acordeão */
  $$('.faq__item').forEach((item) => {
    const btn = $('.faq__q', item);
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      $$('.faq__item.is-open').forEach((o) => {
        o.classList.remove('is-open');
        $('.faq__q', o).setAttribute('aria-expanded', 'false');
      });
      if (open) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* Formulário → mensagem pronta no WhatsApp */
  const form = $('#leadForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = form.nome.value.trim();
    const carro = form.carro.value.trim();
    const servico = form.servico.value;
    let firstInvalid = null;
    [['nome', nome], ['carro', carro]].forEach(([name, val]) => {
      const field = form[name].closest('.field');
      const bad = !val;
      field.classList.toggle('is-invalid', bad);
      if (bad && !firstInvalid) firstInvalid = form[name];
    });
    if (firstInvalid) { firstInvalid.focus(); return; }
    const text = `Olá! Meu nome é ${nome}. Meu carro é ${carro}. Tenho interesse em: ${servico}. Vim pelo site da Master Car.`;
    window.open(waLink(text), '_blank', 'noopener');
  });
  $$('.field input').forEach((inp) => inp.addEventListener('input', () => inp.closest('.field').classList.remove('is-invalid')));

  /* ----------------------------------------------------------------------
     ANIMAÇÕES
     ---------------------------------------------------------------------- */
  if (!hasGsap) { root.classList.remove('is-loading'); $('.preloader')?.remove(); return; }

  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: 'power3.out' });
  ScrollTrigger.config({ ignoreMobileResize: true });

  const preloader = $('.preloader');

  /* Estados iniciais do hero (escondido atrás do pré-carregamento) */
  function heroPrime() {
    gsap.set('.hero__title .line > span', { yPercent: 118 });
    gsap.set('.hero__sub > span', { yPercent: 118 });
    gsap.set('.hero__eyebrow', { opacity: 0, x: -24 });
    gsap.set('.hero__actions', { opacity: 0, y: 24 });
    gsap.set('#heroStageIn', { opacity: 0, xPercent: 10, scale: 1.08 });
    gsap.set('#heroControls', { opacity: 0 });
    gsap.set('#nav', { opacity: 0 });
  }

  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('#heroStageIn', { opacity: 1, xPercent: 0, scale: 1, duration: 2 }, 0)
      .to('#nav', { opacity: 1, duration: 1 }, 0.2)
      .to('.hero__eyebrow', { opacity: 1, x: 0, duration: 1.1 }, 0.25)
      .to('.hero__title .line > span', { yPercent: 0, duration: 1.4, stagger: 0.12 }, 0.3)
      .to('.hero__sub > span', { yPercent: 0, duration: 1.2 }, 0.95)
      .to('.hero__actions', { opacity: 1, y: 0, duration: 1.1 }, 1.1)
      .to('#heroControls', { opacity: 1, duration: 1.2 }, 1.4);
    return tl;
  }

  /* Pré-carregamento: contador + cortina */
  function runPreloader() {
    const count = $('.preloader__count b');
    const bar = $('.preloader__bar i');
    const state = { n: 0 };
    const render = () => {
      const n = Math.round(state.n);
      count.textContent = n;
      bar.style.transform = `scaleX(${state.n / 100})`;
    };
    const loaded = new Promise((resolve) => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve, { once: true });
      setTimeout(resolve, 5000);
    });
    const fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();

    const first = new Promise((resolve) => {
      gsap.to(state, { n: 88, duration: 1.3, ease: 'power2.out', onUpdate: render, onComplete: resolve });
    });

    return Promise.all([first, loaded, fontsReady]).then(() => new Promise((resolve) => {
      gsap.to(state, { n: 100, duration: 0.35, ease: 'power1.out', onUpdate: render, onComplete: resolve });
    }));
  }

  function exitPreloader() {
    return new Promise((resolve) => {
      gsap.timeline({ onComplete: () => { preloader.remove(); resolve(); } })
        .to('.preloader__inner, .preloader__count', { opacity: 0, y: -16, duration: 0.5, ease: 'power2.in' })
        .to('.preloader__bar', { opacity: 0, duration: 0.3 }, '<')
        .call(() => root.classList.remove('is-loading'))
        .to('.preloader__panel', { yPercent: -100, duration: 1.05, ease: 'expo.inOut' }, '>-0.1')
        .add(() => heroIntro(), '-=0.6');
    });
  }

  /* Blocos de animação por rolagem ------------------------------------- */
  function initHeroScroll() {
    gsap.to('.hero__slide img', {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('#heroContent', {
      yPercent: -10, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '70% top', scrub: true }
    });
  }

  function initMarquee() {
    const track = $('#marqueeTrack');
    const loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 38, repeat: -1 });
    ScrollTrigger.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onUpdate(self) {
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 200, 5);
        gsap.timeline({ overwrite: true })
          .to(loop, { timeScale: self.direction * boost, duration: 0.25 })
          .to(loop, { timeScale: self.direction, duration: 1.2 });
      }
    });
  }

  function initSplitHeadings() {
    $$('[data-split="lines"]').forEach((el) => {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 112, duration: 1.3, ease: 'expo.out', stagger: 0.1,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true }
          });
        }
      });
    });

    SplitText.create('#statement', {
      type: 'words', wordsClass: 'w', autoSplit: true,
      onSplit(self) {
        return gsap.fromTo(self.words, { opacity: 0.2 }, {
          opacity: 1, ease: 'none', stagger: 0.12,
          scrollTrigger: { trigger: '#statement', start: 'top 82%', end: 'bottom 55%', scrub: true }
        });
      }
    });
  }

  function initReveals() {
    const items = $$('[data-reveal]').filter((el) => !el.closest('.process__track'));
    gsap.set(items, { opacity: 0, y: 32 });
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out', overwrite: true })
    });

    $$('[data-line]').forEach((el) => {
      gsap.from(el, { scaleX: 0, duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });

    gsap.from('.work', {
      opacity: 0, y: 48, duration: 1.1, stagger: 0.12, ease: 'expo.out', clearProps: 'opacity,transform',
      scrollTrigger: { trigger: '.works__grid', start: 'top 85%', once: true }
    });

    gsap.from('.svc__item', {
      opacity: 0, y: 40, duration: 1, stagger: 0.1, ease: 'expo.out', clearProps: 'opacity,transform',
      scrollTrigger: { trigger: '.svc', start: 'top 85%', once: true }
    });
    gsap.from('.svc__frame', {
      clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'expo.inOut',
      scrollTrigger: { trigger: '.svc__stage', start: 'top 85%', once: true }
    });
    gsap.from('.faq__item', {
      opacity: 0, y: 28, duration: 0.9, stagger: 0.08, ease: 'expo.out', clearProps: 'opacity,transform',
      scrollTrigger: { trigger: '.faq__list', start: 'top 85%', once: true }
    });
  }

  function initImageReveals() {
    $$('[data-img-reveal]').forEach((wrap) => {
      const img = $('img', wrap);
      gsap.timeline({ scrollTrigger: { trigger: wrap, start: 'top 85%', once: true } })
        .fromTo(wrap, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut' })
        .fromTo(img, { scale: 1.4 }, { scale: 1.15, duration: 2, ease: 'expo.out' }, 0);
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  function initParallaxExtras() {
    gsap.fromTo('.cta__bg img', { yPercent: -8 }, {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true }
    });
    gsap.from('.footer__word span', {
      yPercent: 55, opacity: 0, duration: 1.8, ease: 'expo.out',
      scrollTrigger: { trigger: '.footer__word', start: 'top 98%', once: true }
    });
  }

  /* Processo: rolagem horizontal fixada (desktop) / pilha vertical (mobile) */
  function initProcess() {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const track = $('#processTrack');
      const pin = $('#processPin');
      const bar = $('#processBar');
      const now = $('#stepNow');
      const steps = $$('.pstep[data-step]', track);
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      let current = 0;

      const slide = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: pin, start: 'top top', end: () => `+=${dist()}`,
          pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate(self) {
            bar.style.transform = `scaleX(${self.progress})`;
            let best = 0, bestD = Infinity;
            steps.forEach((s, i) => {
              const r = s.getBoundingClientRect();
              const d = Math.abs(r.left + r.width / 2 - window.innerWidth / 2);
              if (d < bestD) { bestD = d; best = i; }
            });
            if (best !== current) { current = best; now.textContent = `0${best + 1}`; }
          }
        }
      });

      steps.forEach((step) => {
        const fig = $('.pstep__img', step);
        const img = $('img', fig);
        gsap.fromTo(img, { xPercent: -5 }, {
          xPercent: 5, ease: 'none',
          scrollTrigger: { trigger: fig, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true }
        });
        gsap.from($$('.pstep__text > *', step), {
          opacity: 0, x: 60, duration: 1, stagger: 0.1, ease: 'expo.out',
          scrollTrigger: { trigger: step, containerAnimation: slide, start: 'left 78%', toggleActions: 'play none none reverse' }
        });
        gsap.from(fig, {
          clipPath: 'inset(0 100% 0 0)', duration: 1.3, ease: 'expo.inOut',
          scrollTrigger: { trigger: step, containerAnimation: slide, start: 'left 85%', toggleActions: 'play none none reverse' }
        });
      });
    });

    mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
      $$('.pstep[data-step]').forEach((step) => {
        const fig = $('.pstep__img', step);
        const img = $('img', fig);
        gsap.from($$('.pstep__text > *', step), {
          opacity: 0, y: 36, duration: 1, stagger: 0.1, ease: 'expo.out',
          scrollTrigger: { trigger: step, start: 'top 80%', once: true }
        });
        gsap.from(fig, {
          clipPath: 'inset(100% 0 0 0)', duration: 1.3, ease: 'expo.inOut',
          scrollTrigger: { trigger: fig, start: 'top 88%', once: true }
        });
        gsap.fromTo(img, { yPercent: -6 }, {
          yPercent: 6, ease: 'none',
          scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });
    });
  }

  /* Sequência de entrada -------------------------------------------------- */
  function initScrollEffects() {
    initHeroScroll();
    initMarquee();
    initSplitHeadings();
    initReveals();
    initImageReveals();
    initParallaxExtras();
    initProcess();
  }

  if (reduced) {
    // Sem movimento: remove o pré-carregamento e deixa tudo visível.
    root.classList.remove('is-loading');
    preloader.remove();
    return;
  }

  heroPrime();
  initScrollEffects();
  runPreloader().then(exitPreloader).then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
