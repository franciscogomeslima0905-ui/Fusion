import { useEffect, useRef, type MutableRefObject } from 'react'
import { MEDIA_BASE } from './types'

type Props = {
  src: string
  poster?: string
  progressRef: MutableRefObject<number>
  onReady?: () => void
}

/**
 * Vídeo cujo tempo acompanha a rolagem. Para rolar sem engasgos, o arquivo precisa ser exportado
 * só com keyframes (ffmpeg -g 1) — veja o README, seção "Cena de abertura".
 */
export function VideoScrub({ src, poster, progressRef, onReady }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current!
    let raf = 0
    let ready = false
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!v.duration || v.seeking) return
      const target = progressRef.current * (v.duration - 0.05)
      if (Math.abs(v.currentTime - target) > 1 / 90) v.currentTime = target
    }
    const onMeta = () => {
      if (!ready) {
        ready = true
        onReady?.()
      }
    }
    v.addEventListener('loadedmetadata', onMeta)
    v.load()
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      v.removeEventListener('loadedmetadata', onMeta)
    }
  }, [src, progressRef, onReady])

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover"
      src={`${MEDIA_BASE}${src}`}
      poster={poster ? `${MEDIA_BASE}${poster}` : undefined}
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-hidden="true"
    />
  )
}
