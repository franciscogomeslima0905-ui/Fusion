import { useLayoutEffect, useRef, type ElementType } from 'react'
import { gsap, MOTION_OK } from '../lib/gsap'

type Props = {
  text: string
  as?: ElementType
  className?: string
  /** quando true, o pai controla a animação das palavras (timelines com pin) */
  manual?: boolean
}

/** Título dividido em palavras; cada palavra sobe de dentro de uma máscara. */
export function MaskText({ text, as: Tag = 'h2', className, manual }: Props) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (manual) return
    const el = ref.current!
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.from(el.querySelectorAll('.mask-word > span'), {
          yPercent: 115,
          duration: 1.2,
          ease: 'power4.out',
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })
    }, el)
    return () => ctx.revert()
  }, [manual])

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="mask-word" aria-hidden="true">
          <span>{w}&nbsp;</span>
        </span>
      ))}
    </Tag>
  )
}
