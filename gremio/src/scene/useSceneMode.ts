import { useEffect, useState } from 'react'
import { isLowPower, isPortrait, prefersReducedMotion } from '../lib/device'
import { MEDIA_BASE, type SceneManifest, type SceneMode } from './types'

type State = { mode: SceneMode; manifest: SceneManifest | null; portrait: boolean }

/**
 * Decide como a abertura é renderizada:
 *  static  → "reduzir movimento": composição final estática, sem fixar a rolagem
 *  frames  → sequência de imagens em <canvas>   (manifest.enabled + frames)
 *  video   → vídeo controlado pela rolagem      (manifest.enabled + video)
 *  drawn   → cena ilustrada em vetor (padrão enquanto não há filmagem)
 * Aparelhos fracos / "economizar dados" nunca baixam frames ou vídeo pesados.
 */
export function useSceneMode(): State {
  const [state, setState] = useState<State>({ mode: 'loading', manifest: null, portrait: false })

  useEffect(() => {
    const portrait = isPortrait()
    if (prefersReducedMotion()) {
      setState({ mode: 'static', manifest: null, portrait })
      return
    }
    if (isLowPower()) {
      setState({ mode: 'drawn', manifest: null, portrait })
      return
    }
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 2500)
    fetch(`${MEDIA_BASE}manifest.json`, { signal: ctrl.signal, cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null) // 404, HTML de fallback do servidor ou rede: cai na cena provisória
      .then((m: SceneManifest | null) => {
        clearTimeout(timer)
        const set = m?.enabled ? (portrait ? m.frames?.mobile ?? m.frames?.desktop : m.frames?.desktop ?? m.frames?.mobile) : undefined
        const vid = m?.enabled ? (portrait ? m.video?.mobile ?? m.video?.desktop : m.video?.desktop ?? m.video?.mobile) : undefined
        const mode: SceneMode = set ? 'frames' : vid ? 'video' : 'drawn'
        setState({ mode, manifest: m, portrait })
      })
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [])

  return state
}
