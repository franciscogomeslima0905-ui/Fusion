import type { ImgHTMLAttributes } from 'react'
import { Icon } from './Icons'

/**
 * Procura em src/assets/images/ um arquivo com o nome informado
 * (ex.: name="hero" → hero.jpg | hero.png | hero.webp ...).
 * Se ainda não existir, exibe um espaço reservado — a página nunca quebra.
 */
const files = import.meta.glob<string>('../../assets/images/*.{jpg,jpeg,png,webp,avif,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const byName = new Map<string, string>()
for (const [path, url] of Object.entries(files)) {
  const base = path.split('/').pop()!.replace(/\.[^.]+$/, '')
  byName.set(base.toLowerCase(), url)
}

/** Indica se já existe um arquivo para o nome (ex.: a logo enviada). */
export const hasImage = (name: string) => byName.has(name.toLowerCase())

type Props = {
  name: string
  alt: string
  /** Aspecto/tamanho do espaço reservado (classes do Tailwind). */
  className?: string
  fit?: 'cover' | 'contain'
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'className'>

export function Img({ name, alt, className = '', fit = 'cover', ...rest }: Props) {
  const url = byName.get(name.toLowerCase())
  if (url) {
    return <img src={url} alt={alt} loading="lazy" decoding="async" className={`${fit === 'cover' ? 'object-cover' : 'object-contain'} ${className}`} {...rest} />
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-teal-100 via-teal-50 to-white text-teal-600/70 ${className}`}
    >
      <Icon name="tooth" className="h-1/4 max-h-14 w-1/4 max-w-14 opacity-70" />
      {import.meta.env.DEV && <span className="px-2 text-center text-[10px] font-medium tracking-wide">{name}.jpg</span>}
    </div>
  )
}
