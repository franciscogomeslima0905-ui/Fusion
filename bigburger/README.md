# Big Burger — Tramandaí/RS

Landing page em *scroll storytelling* (React + Vite + Tailwind CSS 4 + Motion/Framer Motion + servidor Node),
baseada na experiência do vídeo de referência: cenas sticky em tela cheia, capítulos numerados (`// 03 NA CHAPA`),
relógio/contadores controlados pelo scroll, line-up horizontal, cardápio por categorias e barra de progresso no rodapé.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera dist/
npm start          # serve dist/ (PORT=3000)
```

## Google Maps
Copie `.env.example` para `.env` e preencha `VITE_GOOGLE_MAPS_API_KEY` (Maps JavaScript API + Geocoding API; restrinja por referenciador HTTP).
Sem chave, o site usa o mapa incorporado do Google. O botão **Como chegar** sempre abre a rota no Google Maps.

## ⚠️ Fotos e cardápio — leia antes de publicar
O ambiente em que o projeto foi criado **não tinha acesso** a `instagram.com`, `bigrango.saipos.com` e Google Maps.
Por isso **não foi possível baixar as fotos em alta nem o cardápio completo**. O que está no site é só o que é real e verificável:

- Logo e 6 fotos reais da Big Burger, recortadas dos prints do Instagram enviados (≈260 px de largura, ampliadas 3×).
  Por isso as cenas usam as fotos em tamanho moderado e com granulado; **com fotos originais o resultado melhora muito**.
- `src/data/menu.js`: apenas itens/preços vistos em publicações oficiais (Xis na promoção de sexta R$ 27,00 no salão,
  Burger Básico R$ 20,00, Combo X Mini + Refri + Batata P R$ 26,90). Confira com o cardápio digital antes de publicar.
- O botão **Abrir cardápio completo** aponta para `bigrango.saipos.com`.

### Como completar (numa máquina com acesso)
1. Coloque os originais em `originals/{products,menu,gallery,restaurant,branding}/` e rode `npm run images` (gera WebP + AVIF em `public/images/`).
2. Aponte os arquivos em `src/data/images.js` e adicione itens/preços em `src/data/menu.js`.
3. Atualize o `canonical`/`og:url` em `index.html` com o domínio definitivo (hoje é um placeholder).

## Estrutura
`src/components` (Hero, OXis, NaChapa, Numbers, ProductLineup, Porcoes, AlaMinuta, Menu, Gallery, Location, GoogleMap, FinalCTA…),
`src/data` (restaurant, menu, images), `src/utils/whatsapp.js`, `server/server.js`.
Respeita `prefers-reduced-motion` (cenas deixam de ser sticky e o conteúdo aparece empilhado).
