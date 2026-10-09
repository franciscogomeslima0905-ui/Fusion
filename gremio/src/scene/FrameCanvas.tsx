import { useEffect, useRef, type MutableRefObject } from 'react'
import { MEDIA_BASE, type FrameSet } from './types'

type Props = {
  set: FrameSet
  /** progresso 0–1 da abertura, escrito pela timeline do ScrollTrigger */
  progressRef: MutableRefObject<number>
  onReady?: () => void
}

const url = (set: FrameSet, i: number) =>
  `${MEDIA_BASE}${set.dir}/frame_${String(i + 1).padStart(set.pad ?? 4, '0')}.${set.ext}`

/** Ordem de carregamento: pontas → passo grande → preenche os intervalos (a cena já funciona com poucos frames). */
function loadOrder(count: number) {
  const seen = new Set<number>()
  const order: number[] = []
  const push = (i: number) => {
    if (i >= 0 && i < count && !seen.has(i)) {
      seen.add(i)
      order.push(i)
    }
  }
  push(0)
  push(count - 1)
  for (const step of [24, 12, 6, 3, 1]) for (let i = 0; i < count; i += step) push(i)
  return order
}

/**
 * Sequência de imagens desenhada em <canvas> conforme a rolagem (scroll scrubbing).
 * Mostra o frame carregado mais próximo do progresso atual, então nunca fica em branco.
 */
export function FrameCanvas({ set, progressRef, onReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d', { alpha: false })!
    const frames: (HTMLImageElement | undefined)[] = new Array(set.count)
    let disposed = false
    let readyFired = false
    let lastDrawn = -2
    let raf = 0
    let dpr = 1

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(canvas.clientWidth * dpr)
      const h = Math.round(canvas.clientHeight * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        lastDrawn = -2
      }
    }

    const nearest = (target: number) => {
      for (let d = 0; d < set.count; d++) {
        const a = frames[target - d]
        if (a) return { img: a, idx: target - d }
        const b = frames[target + d]
        if (b) return { img: b, idx: target + d }
      }
      return null
    }

    const draw = () => {
      raf = requestAnimationFrame(draw)
      const target = Math.min(set.count - 1, Math.max(0, Math.round(progressRef.current * (set.count - 1))))
      const f = nearest(target)
      if (!f || f.idx === lastDrawn) return
      lastDrawn = f.idx
      const { img } = f
      // "cover": preenche o canvas preservando a proporção do frame
      const s = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight)
      const w = img.naturalWidth * s
      const h = img.naturalHeight * s
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
    }

    const queue = loadOrder(set.count)
    let cursor = 0
    const loadNext = () => {
      if (disposed || cursor >= queue.length) return
      const i = queue[cursor++]
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        frames[i] = img
        lastDrawn = -2
        if (!readyFired && frames[0] && frames[set.count - 1]) {
          readyFired = true
          onReady?.()
        }
        loadNext()
      }
      img.onerror = () => loadNext()
      img.src = url(set, i)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    for (let k = 0; k < 6; k++) loadNext()
    raf = requestAnimationFrame(draw)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [set, progressRef, onReady])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}
