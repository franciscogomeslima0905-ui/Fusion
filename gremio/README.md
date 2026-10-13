# Escola Grêmio Tramandaí e Capão da Canoa — landing page

React 19 + Vite + TypeScript + Tailwind CSS v4 + GSAP/ScrollTrigger + Motion, servida por Node.
Abertura cinematográfica fixada (pin) e controlada pela rolagem (scrub).

## Como rodar

Requisito: Node.js 20+.

```bash
cd gremio
npm install
npm run dev        # desenvolvimento → http://localhost:5173
npm run build      # typecheck + build de produção em dist/
npm start          # serve dist/ com Node (PORT=3000)
npm run build:single   # opcional: UM único .html em dist-single/
```

### Publicar
`dist/` é um site estático: funciona em Vercel, Netlify, Cloudflare Pages, GitHub Pages ou qualquer servidor
(`npm start` serve a pasta com Node). Para subpasta, use `vite build --base=/subpasta/`.

## Cena de abertura

A abertura é uma **ilustração vetorial animada** (SVG), desenhada no próprio projeto e controlada pela rolagem
(GSAP ScrollTrigger com pin + scrub). Não depende de nenhum arquivo de vídeo e não é fotorrealista — é um estilo
gráfico editorial nas cores do Grêmio:

| Rolagem | O que acontece |
|---|---|
| 0–25% | O treinador, sozinho no campo, explica gesticulando (cabeça acompanha a prancheta) |
| 25–50% | A câmera se aproxima da prancheta tática (campo, linhas brancas, peças azuis) |
| 50–75% | A mão do treinador pega as peças azuis e as desliza pelo campo (braço com cinemática inversa, dedos em pinça, rastro tracejado); depois aponta a região da jogada |
| 75–100% | A câmera se afasta e revela os alunos em semicírculo (meninos e meninas, uniforme tricolor, chuteiras e meiões); alguns apontam para o treinador; surge o título e o botão |

Onde mexer: `src/scene/illustrated/` — `Coach.tsx` (treinador), `Kid.tsx` (aluno; cor da pele, cabelo, chuteira, pose),
`IllustratedScene.tsx` (posição dos alunos), `Board.tsx` + `tactics.ts` (prancheta e jogada),
`choreography.ts` (câmera, tempos e gestos). Dica: abra `/?cena=0.55` para congelar a cena em qualquer ponto (0–1).
No celular a composição muda (menos alunos, câmera mais fechada); com "reduzir movimento" aparece o quadro final estático.

### Usar filmagem real no lugar da ilustração (opcional)
1. Grave/produza a sequência (briefing abaixo) em **dois enquadramentos**: horizontal 16:9 e vertical 9:16.
2. Converta (precisa de `ffmpeg`): `npm run scene:frames -- horizontal.mp4 vertical.mp4`
   → cria `public/media/hero/frames-desktop/`, `frames-mobile/` (150 frames `frame_0001.webp`…), `hero-desktop.mp4`,
   `hero-mobile.mp4` (só keyframes, ideal para rolar) e `poster.webp`.
3. Em `public/media/hero/manifest.json` troque `"enabled": false` para `true`.

Prioridade em tempo de execução: **frames (canvas)** → **vídeo** → ilustração. Celular em retrato usa a variante
`mobile`. Aparelhos fracos, "economizar dados" e conexão 2G ficam com a ilustração (leve); "reduzir movimento" mostra a
composição final estática, sem fixar a rolagem.

### Briefing da filmagem (progresso da rolagem → ação)
| Rolagem | Ação | Enquadramento |
|---|---|---|
| 0–25% | Treinador (~30 anos, casaco esportivo preto com detalhes azuis, calça preta) sozinho, campo de grama sintética, prancheta na mão, explicando | Plano médio, câmera suave |
| 25–50% | Câmera se aproxima da prancheta (campo, linhas brancas, peças azuis magnéticas) | Dolly in até close da prancheta |
| 50–75% | Mão direita pega uma peça azul, desliza, solta; segunda peça; aponta uma região | Close fixo na prancheta, dedos e peças visíveis |
| 75–100% | Câmera se afasta e revela ~8 alunos (~11 anos, uniforme tricolor, chuteiras) em semicírculo | Plano aberto, treinador ao centro |

Dicas: o texto "Mais que futebol. Formamos o futuro." entra sobre os últimos ~12%: deixe o lado esquerdo (desktop) ou a
metade inferior (celular) do enquadramento final mais limpo. Duração ideal 8–12 s. Frames: 1280 px (desktop) / 720 px
(celular). Use apenas imagens com autorização dos responsáveis pelos menores.

## Conteúdo (tudo em `src/config/site.ts`)
- WhatsApp oficial `+55 51 9240-5499` (`wa.me/555192405499`) e **uma mensagem pré-preenchida por contexto** (`messages`).
- Instagram: `@gremiotramandai_capao`.
- Fotos: `src/assets/photos/`. São recortes dos prints do Instagram (≈262 px de largura). **Troque pelas originais
  em alta mantendo os nomes**; os componentes usam `object-cover`. Há um `.grain` sobre as fotos para suavizar a ampliação.
- Logomarca: `src/assets/logo.png` (150 px, sem alterações; exibida num disco branco sobre o fundo escuro). Substitua
  por um arquivo maior/vetorial se tiver.
- Não há endereço, horário, mensalidade, título ou parceria no site, porque nada disso foi confirmado.
  As "fases" em Categorias são descrições gerais de evolução no futebol, não turmas oficiais.

## Estrutura
```
src/
  config/site.ts          dados oficiais, mensagens, fotos
  sections/               Hero, About, Categories, Training, Gallery, Units, FinalCta
  scene/                  FrameCanvas, VideoScrub, useSceneMode
  scene/illustrated/      ilustração animada: Coach, Kid, Board, Backdrop, choreography
  components/             Header, Footer, Buttons, FloatingWhatsApp, Logo, Icons, MaskTitle
  hooks/useSectionFx.ts   entradas por atributos (data-mask / data-reveal / data-img / data-parallax)
scripts/make-frames.mjs   vídeo → frames + vídeo só-keyframes
server/index.mjs          servidor Node estático
```

## Decisões e limites
- **Three.js / React Three Fiber não foram usados**: a cena é 2D em SVG (leve e nítida em qualquer tela). Para realismo,
  use a estrutura de mídia (frames/vídeo) acima.
- Acessibilidade: "pular abertura", menu móvel com Esc, galeria/lightbox com teclado, `prefers-reduced-motion`.
- Desempenho: fontes locais (`@fontsource`), imagens `webp` com `loading="lazy"`, chunks separados de GSAP/Motion.
