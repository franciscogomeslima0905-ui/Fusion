import logo from '../assets/logo.png'

/**
 * Logomarca oficial, sem alterações. O arquivo é um quadrado branco com o emblema circular;
 * em fundo escuro ela vai dentro de um disco branco (recorte circular) para preservar as proporções.
 */
export function Logo({ size = 56, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-block shrink-0 overflow-hidden rounded-full bg-white ${className}`}
      style={{ width: size, height: size }}
    >
      <img src={logo} width={150} height={150} alt="Escola Grêmio Futebol — Tramandaí e Capão da Canoa" className="block h-full w-full" />
    </span>
  )
}
