import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * O build injeta em #static uma versão pré-renderizada da página, visível mesmo
 * onde o JavaScript não roda (pré-visualizações de arquivo, leitores, buscadores).
 * Quando o app monta, ele assume a página e o HTML estático é removido.
 */
const onReady = () => {
  document.documentElement.classList.add('js-ready')
  document.getElementById('static')?.remove()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App onReady={onReady} />
  </StrictMode>,
)
