import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Pré-carrega logo e camadas do hambúrguer (primeira dobra) com os nomes finais com hash do build.
function preloadHero(): Plugin {
  return {
    name: 'preload-hero-assets',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        if (!ctx.bundle) return
        return Object.keys(ctx.bundle)
          .filter(f => /(top-bun|sauce-top|onion|tomato|lettuce|cheese|beef|sauce-bottom|bottom-bun|logo)-[\w-]+\.(webp|png|avif)$/.test(f))
          .map(f => ({ tag: 'link', attrs: { rel: 'preload', as: 'image', href: '/' + f }, injectTo: 'head' as const }))
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadHero()],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/gsap')) return 'gsap'
          if (id.includes('node_modules/motion')) return 'motion'
          if (id.includes('node_modules/react')) return 'react'
        },
      },
    },
  },
})
