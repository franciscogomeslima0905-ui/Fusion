/** Contrato do arquivo public/media/hero/manifest.json (veja README → "Cena de abertura"). */
export type FrameSet = {
  /** pasta dentro de public/media/hero, ex.: "frames-desktop" */
  dir: string
  /** quantidade de frames (frame_0001 … frame_NNNN) */
  count: number
  /** extensão: webp (recomendado) ou jpg */
  ext: 'webp' | 'jpg'
  /** casas do contador: 4 → frame_0001.webp */
  pad?: number
}

export type SceneManifest = {
  /** coloque true quando os arquivos reais estiverem em public/media/hero */
  enabled: boolean
  frames?: { desktop?: FrameSet; mobile?: FrameSet }
  video?: { desktop?: string; mobile?: string; poster?: string }
}

export type SceneMode = 'loading' | 'frames' | 'video' | 'drawn' | 'static'

export const MEDIA_BASE = `${import.meta.env.BASE_URL}media/hero/`
