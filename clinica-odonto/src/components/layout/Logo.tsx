import { site, imageSlots } from '../../config/site'
import { Icon } from '../ui/Icons'
import { Img, hasImage } from '../ui/Img'

/** Usa a logo enviada (src/assets/images/logo.*); sem ela, mostra um logotipo provisório. */
export function Logo({ light = false, className = 'h-10' }: { light?: boolean; className?: string }) {
  if (hasImage(imageSlots.logo)) {
    const logo = <Img name={imageSlots.logo} alt={site.name} fit="contain" loading="eager" className={`w-auto ${className}`} />
    // sobre fundo escuro, a logo enviada (geralmente colorida) ganha um suporte claro para manter a leitura
    return light ? <span className="inline-block rounded-xl bg-white px-3 py-2">{logo}</span> : logo
  }
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${light ? 'bg-white text-teal-800' : 'bg-teal-800 text-white'}`}>
        <Icon name="tooth" className="h-5 w-5" />
      </span>
      <span className={`text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-teal-900'}`}>{site.name}</span>
    </span>
  )
}
