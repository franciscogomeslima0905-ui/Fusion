import { prerender } from 'react-dom/static'
import App from './App'

/** Renderiza a página completa em HTML. */
export async function render(): Promise<string> {
  const { prelude } = await prerender(<App />)
  return new Response(prelude).text()
}
