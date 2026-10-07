import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Build em arquivo único: npm run build:single  → dist-single/index.html
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: {
    outDir: 'dist-single',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    // script clássico (IIFE): funciona em qualquer navegador e direto do disco
    rollupOptions: { output: { format: 'iife', inlineDynamicImports: true } },
  },
})
