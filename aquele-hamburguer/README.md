# Aquele Hambúrguer — landing page

Landing page do **Aquele Hambúrguer** (hamburgueria artesanal em Tramandaí/RS).
React + Vite + TypeScript + Tailwind CSS v4 + GSAP/ScrollTrigger (animação principal) + Motion (microinterações) + Lucide.

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + build de produção em dist/
npm run preview  # serve o build
npm run build:single  # HTML único autocontido em dist-single/ (abre direto do disco; cópia pronta: aquele-hamburguer-landing-page.html)
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

Ajustes finos: `secondary` e arrays `SEC_*` (timing e movimentos secundários por camada) e `WORDS` em `BurgerAssembly.tsx`;
espaçamento da vista explodida em `gap` (desktop/mobile) no componente.
Mouse (desktop): leve inclinação 3D via `useMouseParallax`. `prefers-reduced-motion`: hambúrguer montado, sem pin.
Aparelhos fracos (`isLowPower` em `src/lib/gsap.ts`): sem blur/3D secundário, a montagem é preservada.

### Camadas do hambúrguer (fotografia real fatiada)

As 8 camadas em `src/assets/burger/*.webp` (pão superior, molho, alface, cebola, tomate, queijo, carne, pão inferior) foram
**recortadas de uma fotografia de hambúrguer real** (`scripts/slice-burger/source-burger.webp`): remoção de fundo (rembg),
separação por cor/posição, e preenchimento das partes ocultas de cada camada para que ela possa se afastar das outras.
`manifest.json` guarda posição/tamanho/ordem de cada camada e é lido por `layers.ts`.

Limitações: a foto de origem tem 736 px de largura (as camadas são ampliadas 1,8×) e as partes escondidas de cada
ingrediente são reconstruídas por preenchimento, então a vista explodida é convincente mas não é uma sessão de fotos
camada por camada. **O ideal** é fotografar o hambúrguer desmontado e recortar cada ingrediente: substitua os WebP
(mesmos nomes, fundo transparente) e ajuste `x/y/w/h/z` no `manifest.json`. Para regenerar a partir de outra foto:
`scripts/slice-burger/` (1_mask → 2_segment → 3_extract; requer Python com rembg, opencv-python-headless, scipy e
ajuste das faixas de cor/altura em `2_segment.py`).

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
