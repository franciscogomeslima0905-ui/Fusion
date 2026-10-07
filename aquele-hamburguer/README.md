# Aquele Hambúrguer — landing page

Landing page do **Aquele Hambúrguer** (hamburgueria artesanal em Tramandaí/RS).
React + Vite + TypeScript + Tailwind CSS v4 + GSAP/ScrollTrigger (animação principal) + Motion (microinterações) + Lucide.

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + build de produção em dist/
npm run preview  # serve o build
```

## A assinatura: hambúrguer que monta com o scroll

`src/components/BurgerAssembly/` — uma única timeline GSAP de 10 "unidades" ligada ao scroll com
`ScrollTrigger` (`pin` + `scrub`). **A posição do scroll é a posição da animação**: rolar para baixo monta,
rolar para cima desmonta (nada é disparado por `onEnter`, nem há autoplay/loop/vídeo/GIF).

| Timeline | O que acontece |
|---|---|
| 0 – 1 | ambiente reage (spot de luz, fumaça, sombra do chão) |
| 0.8 – 7.2 | camadas convergem de baixo p/ cima, cada uma com x, rotação, escala, rotateX, translateZ e foco próprios |
| 7.4 – 8.4 | hambúrguer fecha; luz de estúdio no máximo; palavras (Carne. Queijo. Molho. Pão.) passam atrás |
| 7.7 – 9 | câmera desloca o produto; entra "Aquele Hambúrguer" + botões |
| 9 – 10 | câmera avança até a carne e escurece → marquee e próxima cena |

Ajustes finos: `secondary` (timing e movimentos secundários por camada) e `WORDS` em `BurgerAssembly.tsx`;
distâncias da vista explodida em `layers.ts` (`off`) e `spread` (desktop/mobile) no componente.
Mouse (desktop): leve inclinação 3D via `useMouseParallax`. `prefers-reduced-motion`: hambúrguer montado, sem pin.
Aparelhos fracos (`isLowPower` em `src/lib/gsap.ts`): sem blur/3D secundário, a montagem é preservada.

### ⚠️ Camadas reais do hambúrguer (pendente)

As 9 camadas atuais são **PLACEHOLDERS** em ilustração vetorial (`src/assets/burger/placeholder/`, geradas por
`node scripts/generate-placeholder-layers.mjs`). Não foi possível recortar ingredientes das fotos de baixa resolução
com qualidade, e o cardápio/Instagram não puderam ser acessados no ambiente de desenvolvimento.

Para usar **fotos reais**, coloque WebP/PNG **recortados com fundo transparente** em `src/assets/burger/` com estes nomes
(eles passam a ter prioridade automática):

`top-bun`, `sauce-top`, `onion`, `tomato`, `lettuce`, `cheese`, `beef`, `sauce-bottom`, `bottom-bun`

Cada arquivo deve ter a largura total do hambúrguer (≈1200 px). Se a proporção diferir dos placeholders, ajuste `y`/`h`
em `layers.ts` (unidades de uma tela de 600 px de largura). Ideal: fotografar e recortar o hambúrguer desmontado, camada por camada.

## Onde editar

| O quê | Onde |
|---|---|
| Endereço, telefone, links (WhatsApp, cardápio, Instagram), mensagem do WhatsApp | `src/lib/links.ts` |
| Produtos/fotos e categorias | `src/data/products.ts` (fotos em `src/assets/photos/`) |
| Avaliações | `src/data/reviews.ts` |
| Logo | `src/assets/logo/logo.png` (150 px — troque por versão maior/SVG se tiver) |
| SEO, Open Graph, JSON-LD | `index.html` (adicione `canonical` e URLs absolutas do domínio ao publicar) |

Produtos (nome, descrição, preço e fotos de Mr. White, Provoleta Argentina, Gorgonzola Especial e Caudillho da Praia) vêm do
cardápio oficial e das fotos enviadas — **confira os preços antes de publicar**, pois estão fixos em `src/data/products.ts`.
Os recortes do Instagram (seção Instagram e categorias) são de baixa resolução: troque por originais em alta.
Horário de funcionamento não foi incluído por não estar confirmado.

## Google Maps

A chave **nunca** fica no código. Copie `.env.example` para `.env` (já no `.gitignore`):

```env
VITE_GOOGLE_MAPS_API_KEY=sua_chave
```

Ative **Maps JavaScript API** no Google Cloud, restrinja a chave por referenciador HTTP e reinicie o `npm run dev`.
O endereço é geocodificado em tempo de execução; mapa escuro com marcador amarelo. Sem chave (ou chave inválida) o site usa
o mapa incorporado padrão do Google. "Traçar rota" abre o Google Maps com o destino preenchido.

## Estrutura

```
src/components/{Header,BurgerAssembly,Marquee,BurgerShowcase,HorizontalProducts,MenuCTA,Reviews,
                InstagramSection,Location,FinalCTA,Footer,WhatsAppButton,Cursor}
src/hooks/{useScrollProgress,useMouseParallax,useMaskReveal,useReducedMotion}
src/lib/{gsap,maps,links}.ts     src/data/{products,reviews}.ts
```

Não há backend: Node só é usado pelo Vite. Crie um servidor quando houver necessidade real (formulários, integrações).
