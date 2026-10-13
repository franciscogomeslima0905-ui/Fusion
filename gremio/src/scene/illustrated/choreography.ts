import { gsap } from '../../lib/gsap'
import { ik2, lerp, quad } from './art'
import { ZONE, boardPieces, boardToCoach } from './tactics'

export type SceneOpts = { desk: boolean; idle: boolean }

type Cam = { cx: number; cy: number; lw: number; ax: number; ay: number }
const cam = (cx: number, cy: number, w: number, ax = 0.5, ay = 0.5): Cam => ({ cx, cy, lw: Math.log(w), ax, ay })

/** Enquadramentos da câmera em cada fase (w = largura do mundo visível). */
const SHOTS = {
  desk: [
    cam(0, -300, 820, 0.5, 0.52), // 0%   treinador, plano médio
    cam(-5, -318, 690, 0.5, 0.5), //  25%  empurra devagar
    cam(-5, -262, 450, 0.5, 0.5), //  50%  prancheta
    cam(-5, -262, 420, 0.5, 0.5), //  75%  prancheta (peças)
    cam(0, 0, 1750, 0.52, 0.88), //  100% plano aberto: treinador + alunos
  ],
  mob: [
    cam(0, -290, 440, 0.5, 0.5),
    cam(-5, -305, 410, 0.5, 0.5),
    cam(-5, -262, 330, 0.5, 0.42),
    cam(-5, -262, 310, 0.5, 0.42),
    cam(0, 0, 980, 0.5, 0.4),
  ],
}

// ombros e comprimentos do braço (mundo do treinador)
const SW: [number, number] = [-86, -376]
const SH: [number, number] = [86, -376]
const L1 = 112
const L2 = 106

// pontas dos dedos por pose (0 aberta, 1 pinça, 2 apontar) no referencial da mão (punho em 0,0; +x = frente)
const BASE: Record<string, [number, number]> = { thumb: [12, -10], index: [28, -7], middle: [30, -2], ring: [29, 3], pinky: [27, 8] }
const TIPS: Record<string, [number, number, number, number, number, number]> = {
  thumb: [36, -26, 47, -2.5, 31, -15],
  index: [52, -11, 47, -4.5, 62, -6],
  middle: [55, -3, 40, 4, 38, 4],
  ring: [53, 4, 38, 8, 36, 8],
  pinky: [48, 11, 35, 11, 34, 11],
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export function buildIllustrated(svg: SVGSVGElement, tl: gsap.core.Timeline, o: SceneOpts): { render: () => void; dispose: () => void } {
  const $ = <T extends Element>(sel: string, root: ParentNode = svg) => root.querySelector(sel) as T
  const world = $('[data-world]')
  const armW = $('[data-arm="w"]')
  const armH = $('[data-arm="h"]')
  const hand = $('[data-hand]', armW)
  const head = $('[data-head]')
  const torso = $('[data-torso]')
  const zone = $('[data-zone]')
  const fingers = (['thumb', 'index', 'middle', 'ring', 'pinky'] as const).map((f) => ({
    f,
    a: $<SVGLineElement>(`[data-finger="${f}"]`, hand),
    b: $<SVGLineElement>(`[data-finger-o="${f}"]`, hand),
  }))
  const pieceEls = new Map(boardPieces.map((p) => [p.id, { g: $(`[data-piece="${p.id}"]`), body: $(`[data-piece="${p.id}"] [data-piece-body]`), sh: $(`[data-piece="${p.id}"] [data-piece-shadow]`), trail: svg.querySelector(`[data-trail="${p.id}"]`) as SVGLineElement | null }]))
  const kidArms = Array.from(svg.querySelectorAll<SVGGElement>('[data-kid-arm="point"]'))
  const kidEls = Array.from(svg.querySelectorAll<SVGGElement>('[data-kid]')).map((g, i) => ({ g, x: +g.dataset.x!, y: +g.dataset.y!, s: +g.dataset.s!, ph: i * 1.7 }))

  const shots = o.desk ? SHOTS.desk : SHOTS.mob
  const st = { ...shots[0], tx: -112, ty: -208, pose: 0, hold: 0, press: 0, head: 0, zone: 0, kidPoint: 0, idle: 0, idle2: 0 }
  const P: Record<number, { x: number; y: number }> = Object.fromEntries(boardPieces.map((p) => [p.id, { x: p.from[0], y: p.from[1] }]))
  const fromC = (id: number) => boardToCoach(...(boardPieces.find((p) => p.id === id)!.from as [number, number]))
  const toC = (id: number) => boardToCoach(...(boardPieces.find((p) => p.id === id)!.to as [number, number]))

  const setPoly = (el: Element, pts: string) => el.setAttribute('points', pts)
  const arm = (root: Element, S: [number, number], wx: number, wy: number, pick: (a: [number, number], b: [number, number]) => [number, number], side: 1 | -1) => {
    const r = ik2(S[0], S[1], wx, wy, L1, L2, pick)
    const q = (n: string) => $(`[data-a="${n}"]`, root)
    setPoly(q('up'), quad(S[0], S[1], r.ex, r.ey, 40, 34))
    setPoly(q('up-stripe'), quad(S[0], S[1], r.ex, r.ey, 6, 5, side * 12))
    const el = q('elbow')
    el.setAttribute('cx', String(r.ex))
    el.setAttribute('cy', String(r.ey))
    el.setAttribute('r', '17')
    setPoly(q('fore'), quad(r.ex, r.ey, r.wx, r.wy, 34, 29))
    setPoly(q('fore-stripe'), quad(r.ex, r.ey, r.wx, r.wy, 5, 4, side * 10))
    const dx = r.wx - r.ex
    const dy = r.wy - r.ey
    const len = Math.hypot(dx, dy) || 1
    const ux = dx / len
    const uy = dy / len
    setPoly(q('cuff'), quad(r.wx - ux * 16, r.wy - uy * 16, r.wx - ux * 2, r.wy - uy * 2, 30, 30))
    return r
  }
  // o cotovelo dobra para baixo e para fora do corpo (esquerda da tela no braço de trabalho, direita no que segura)
  const bend = (nx: number, ny: number, S: [number, number]) => (a: [number, number], b: [number, number]): [number, number] =>
    (a[0] - S[0]) * nx + (a[1] - S[1]) * ny > (b[0] - S[0]) * nx + (b[1] - S[1]) * ny ? a : b
  const pickLow = bend(-0.55, 0.83, SW)
  const pickOut = bend(0.75, 0.66, SH)

  let idleT = 0

  const render = () => {
    const W = svg.clientWidth || 1
    const H = svg.clientHeight || 1
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    const z = W / Math.exp(st.lw)
    world.setAttribute('transform', `translate(${(st.ax * W - st.cx * z).toFixed(2)} ${(st.ay * H - st.cy * z).toFixed(2)}) scale(${z.toFixed(4)})`)

    // peças e rastros
    for (const p of boardPieces) {
      const e = pieceEls.get(p.id)!
      const grabbed = st.hold === p.id
      e.g.setAttribute('transform', `translate(${P[p.id].x.toFixed(2)} ${P[p.id].y.toFixed(2)})`)
      e.body.setAttribute('transform', grabbed ? `translate(-1 -2.5) scale(1.16)` : '')
      e.sh.setAttribute('transform', grabbed ? 'translate(3 4) scale(1.15)' : '')
      if (e.trail) {
        e.trail.setAttribute('x2', String(P[p.id].x))
        e.trail.setAttribute('y2', String(P[p.id].y))
      }
    }

    // contato (ponta dos dedos): na peça agarrada ou no alvo livre
    let cx: number
    let cy: number
    if (st.hold) [cx, cy] = boardToCoach(P[st.hold].x, P[st.hold].y)
    else [cx, cy] = [st.tx, st.ty]
    const pose = st.pose
    const tipOf = (f: string) => {
      const t = TIPS[f]
      return pose <= 1 ? [lerp(t[0], t[2], pose), lerp(t[1], t[3], pose)] : [lerp(t[2], t[4], pose - 1), lerp(t[3], t[5], pose - 1)]
    }
    const contact = pose <= 1 ? [lerp(TIPS.index[0], TIPS.index[2], pose) + 2, lerp(TIPS.index[1], TIPS.index[3], pose) + 1] : [lerp(TIPS.index[2], TIPS.index[4], pose - 1) + 2, lerp(TIPS.index[3], TIPS.index[5], pose - 1) + 1]
    const th = Math.atan2(cy - SW[1], cx - SW[0])
    const c = Math.cos(th)
    const s = Math.sin(th)
    const flip = c < 0 ? -1 : 1
    // punho = contato − R(θ)·(ponta no referencial da mão)
    const wx = cx - (c * contact[0] - s * contact[1] * flip)
    const wy = cy - (s * contact[0] + c * contact[1] * flip)
    const r = arm(armW, SW, wx, wy, pickLow, 1)
    const hth = Math.atan2(cy - r.wy, cx - r.wx)
    const press = st.press
    hand.setAttribute('transform', `translate(${r.wx.toFixed(2)} ${r.wy.toFixed(2)}) rotate(${(hth * 180 / Math.PI).toFixed(2)}) scale(${(1 - press * 0.06).toFixed(3)} ${((1 - press * 0.06) * flip).toFixed(3)})`)
    for (const { f, a, b } of fingers) {
      const base = BASE[f]
      const [tx2, ty2] = tipOf(f)
      for (const el of [a, b]) {
        el.setAttribute('x1', String(base[0]))
        el.setAttribute('y1', String(base[1]))
        el.setAttribute('x2', tx2.toFixed(2))
        el.setAttribute('y2', ty2.toFixed(2))
      }
    }

    // braço que segura a prancheta
    const [hx, hy] = boardToCoach(138, 84 + Math.sin(idleT) * 1.2)
    arm(armH, SH, hx, hy, pickOut, -1)

    // cabeça, respiração, região destacada
    const breathe = o.idle ? Math.sin(idleT * 1.1) : 0
    head.setAttribute('transform', `rotate(${(st.head + (o.idle ? Math.sin(idleT * 0.8) * 0.9 : 0)).toFixed(2)} 0 -408)`)
    torso.setAttribute('transform', `translate(0 -236) scale(1 ${(1 + breathe * 0.006).toFixed(4)}) translate(0 236)`)
    zone.setAttribute('opacity', String((st.zone * (0.78 + (o.idle ? Math.sin(idleT * 3) * 0.22 : 0))).toFixed(3)))

    // alunos: braços que apontam e balanço leve
    kidArms.forEach((g, i) => {
      const t = clamp01(st.kidPoint * 1.7 - i * 0.4)
      const e = t * t * (3 - 2 * t)
      const a0 = +g.dataset.a0!
      const a1 = +g.dataset.a1!
      const b0 = +g.dataset.b0!
      const b1 = +g.dataset.b1!
      g.setAttribute('transform', `translate(${g.dataset.sx} -284) rotate(${lerp(a0, a1, e).toFixed(2)})`)
      g.querySelector('[data-fore]')!.setAttribute('transform', `translate(0 50) rotate(${lerp(b0, b1, e).toFixed(2)})`)
    })
    if (o.idle) {
      for (const k of kidEls) {
        k.g.setAttribute('transform', `translate(${k.x} ${k.y}) rotate(${(Math.sin(idleT * 0.9 + k.ph) * 0.9).toFixed(2)}) scale(${k.s})`)
      }
    }
  }

  /* ---------------- coreografia (0–1 = progresso da rolagem) ---------------- */
  const [K0, K1, K2, K3, K4] = shots
  const camKeys = (a: Cam, b: Cam, at: number, dur: number, ease: string) => tl.fromTo(st, { cx: a.cx, cy: a.cy, lw: a.lw, ax: a.ax, ay: a.ay }, { cx: b.cx, cy: b.cy, lw: b.lw, ax: b.ax, ay: b.ay, duration: dur, ease, immediateRender: false }, at)
  camKeys(K0, K1, 0, 0.25, 'sine.inOut') // fase 1: o treinador
  camKeys(K1, K2, 0.25, 0.25, 'power2.inOut') // fase 2: aproximação da prancheta
  camKeys(K2, K3, 0.5, 0.25, 'sine.inOut') // fase 3: as peças
  camKeys(K3, K4, 0.75, 0.25, 'power2.inOut') // fase 4: a câmera se afasta e revela os alunos

  const hand$ = (at: number, dur: number, to: [number, number], pose?: number, ease = 'power2.inOut') =>
    tl.to(st, { tx: to[0], ty: to[1], ...(pose === undefined ? {} : { pose }), duration: dur, ease, immediateRender: false }, at)

  // fase 1 — explica gesticulando, olhando a prancheta
  tl.to(st, { head: 3, duration: 0.06, ease: 'sine.inOut', immediateRender: false }, 0.02)
  hand$(0.02, 0.07, [-218, -338], 0)
  hand$(0.09, 0.06, [-178, -436], 0)
  hand$(0.15, 0.06, [-224, -300], 0)
  hand$(0.21, 0.04, [-134, -226], 0)
  // fase 2 — a mão espera perto da prancheta enquanto a câmera chega
  hand$(0.25, 0.1, [-146, -214], 0, 'sine.inOut')
  hand$(0.35, 0.1, [-122, -222], 0, 'sine.inOut')
  const [p6x, p6y] = fromC(6)
  hand$(0.45, 0.05, [p6x - 20, p6y - 14], 0.6)

  // fase 3 — move as peças azuis com os dedos (agarra, desliza, solta)
  const move = (id: number, t0: number, approach: number, drag: number) => {
    const [fx, fy] = fromC(id)
    const [ex, ey] = toC(id)
    const to = boardPieces.find((p) => p.id === id)!.to
    hand$(t0, approach, [fx, fy], 1, 'power2.inOut')
    tl.to(st, { press: 1, duration: 0.008, immediateRender: false }, t0 + approach)
    tl.set(st, { hold: id }, t0 + approach + 0.008)
    tl.to(P[id], { x: to[0], y: to[1], duration: drag, ease: 'power1.inOut', immediateRender: false }, t0 + approach + 0.008)
    tl.set(st, { hold: 0, tx: ex, ty: ey }, t0 + approach + 0.008 + drag)
    tl.to(st, { press: 0, duration: 0.008, immediateRender: false }, t0 + approach + 0.008 + drag)
    return t0 + approach + 0.016 + drag
  }
  let t = 0.5
  t = move(6, t, 0.02, 0.05) // primeira peça
  t = move(7, t + 0.004, 0.03, 0.055) // segunda peça: demonstra a jogada
  t = move(4, t + 0.004, 0.026, 0.035)
  // aponta a região do campo explicada
  const [zx, zy] = boardToCoach(ZONE[0] + 4, ZONE[1] + 10)
  hand$(t + 0.004, 0.03, [zx, zy], 2)
  tl.to(st, { zone: 1, duration: 0.03, immediateRender: false }, t + 0.016)

  // fase 4 — olha o grupo, aponta; os alunos acompanham
  tl.to(st, { head: -2.5, duration: 0.1, ease: 'sine.inOut', immediateRender: false }, 0.78)
  hand$(0.79, 0.07, [-262, -318], 2, 'power2.inOut')
  tl.to(st, { kidPoint: 1, duration: 0.1, ease: 'none', immediateRender: false }, 0.86)

  const ro = new ResizeObserver(render)
  ro.observe(svg)

  // vida própria: respiração, leve balanço — só enquanto a cena está na tela
  let visible = true
  let io: IntersectionObserver | null = null
  const tick = (time: number) => {
    if (!visible) return
    idleT = time
    render()
  }
  if (o.idle) {
    io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(svg)
    gsap.ticker.add(tick)
  }

  tl.progress(0)
  render()
  return {
    render,
    dispose: () => {
      ro.disconnect()
      io?.disconnect()
      gsap.ticker.remove(tick)
    },
  }
}
