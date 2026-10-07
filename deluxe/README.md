# Deluxe — landing page editorial

React + Vite + Tailwind CSS v4 + GSAP/ScrollTrigger, servida por Node.

```
npm install
npm run dev      # desenvolvimento
npm run build    # gera dist/
npm start        # serve dist/ com Node (PORT=3000)
```

## O que editar
Tudo em `src/config/site.ts`:
- `whatsappNumber` — só dígitos, DDI+DDD (já configurado: 55 51 99554-6515).
- `storeUrl`, `instagramUrl`, `address`.
- `photos` — as imagens vêm de `src/assets/photos/`. Hoje são recortes dos prints do Instagram
  (baixa resolução). Substitua os arquivos pelas fotos originais mantendo os nomes.

## Animações (src/sections)
- `Hero` — pin + scrub: foto cresce, texto some, próxima seção desliza por cima.
- `Looks` — grid assimétrico, revelação por máscara com stagger, colunas com parallax em velocidades diferentes.
- `Story` — seção fixada (pin) com 3 passos: textos por máscara e foto trocando por recorte.
- `FullScreen` — recorte que se expande até a tela cheia, zoom 1.18→1 e título em parallax.
- `prefers-reduced-motion` desativa todas as animações.
