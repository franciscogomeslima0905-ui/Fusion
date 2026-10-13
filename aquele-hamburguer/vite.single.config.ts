import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Gera um único HTML autocontido (JS, CSS, fontes e imagens embutidos) que abre direto do disco.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: { outDir: 'dist-single', target: 'es2022', assetsInlineLimit: 100_000_000 },
})
