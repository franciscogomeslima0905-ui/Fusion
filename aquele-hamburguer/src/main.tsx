import '@fontsource/anton/400.css'
import '@fontsource-variable/archivo'
import '@fontsource-variable/manrope'
import './styles/index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
