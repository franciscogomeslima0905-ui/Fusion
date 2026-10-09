import { useEffect, useState } from 'react'

/** Progresso da página (0–1) e flag de "já rolou". Usa listener passivo + rAF. */
export function useScrollProgress(threshold = 40) {
  const [state, setState] = useState({ progress: 0, scrolled: false })

  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const y = window.scrollY
      setState(prev => {
        const scrolled = y > threshold
        const progress = max > 0 ? y / max : 0
        return prev.scrolled === scrolled && Math.abs(prev.progress - progress) < 0.002 ? prev : { progress, scrolled }
      })
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read) }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [threshold])

  return state
}
