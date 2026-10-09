---
name: design-system-superhuman
description: Design system visual OBRIGATÓRIO (estilo "Superhuman — golden hour editorial dashboard"). Use SEMPRE que for criar, editar, revisar ou estilizar qualquer interface — página, landing page, site, dashboard, componente, botão, card, formulário, layout, CSS, Tailwind, React/Vue/Svelte/HTML, e-mail, slides ou protótipo — em qualquer projeto. Define paleta, tipografia, espaçamento, raios, sombras, componentes e imagens. Invoque antes de escrever qualquer código visual, mesmo que o usuário não mencione "design system", "estilo" ou "skill".
---

# Design System Superhuman — contrato obrigatório

Esta skill é a **única fonte de verdade visual** enquanto estiver ativa. Ela vale para **qualquer projeto**, framework ou linguagem. As regras não são sugestões: são requisitos de entrega.

## 0. Contrato (leia primeiro)

1. **Siga todas as regras R1–R19 abaixo.** Não improvise cores, fontes, raios, sombras ou componentes. Se um valor não está nos tokens, ele não existe.
2. **Nunca "melhore" o sistema por conta própria** (sombra "só um pouquinho", azul de destaque, botão verde, título em negrito). Cada violação conhecida é um erro.
3. **Conflito com o pedido do usuário:** se ele pedir algo que viola uma regra (ex.: "botão azul", "tema escuro", "sombra nos cards"), **não ignore em silêncio nem obedeça em silêncio**. Diga qual regra conflita (cite R#), proponha a alternativa conforme o sistema e pergunte se ele quer abrir uma exceção. Só com autorização explícita, aplique a exceção marcando a linha com o comentário `ds-allow: <motivo>`.
4. **Conflito com o design já existente do projeto** (outra paleta/fonte): avise antes de alterar. Em páginas/componentes novos, aplique este sistema; em código antigo, só migre o que o usuário pediu.
5. **Dúvida sobre um valor ou componente:** consulte `references/design-system.md` (arquivo original completo) em vez de adivinhar.
6. **Não declare a tarefa pronta** sem rodar o verificador (passo 4 do fluxo) e passar o checklist final (seção 9).

## 1. Fluxo obrigatório

1. **Carregar tokens no projeto** (seção 8): copie `assets/` para o projeto e importe. Se já estiverem lá, reutilize — não duplique.
2. **Montar a interface** usando os tokens, as classes de `assets/components.css` e as receitas da seção 6. Nada de valores soltos (`#fff`, `16px` mágico, `shadow-md`).
3. **Auto-revisão** contra R1–R19.
4. **Rodar o verificador** e corrigir até zerar os erros:
   ```bash
   node <caminho-da-skill>/scripts/check-design.mjs <pasta-do-projeto>/src --strict
   ```
   Código de saída `1` = reprovado. Avisos (`warn`) também precisam ser resolvidos ou justificados ao usuário.
5. **Verificar visualmente** quando possível (screenshot desktop + mobile) e relatar qualquer exceção.

## 2. Cores (somente estas 9)

| Token | Valor | Papel |
|---|---|---|
| `--color-warm-parchment` | `#f2f0eb` | **Canvas da página** (nunca branco puro) |
| `--color-paper-white` | `#ffffff` | Cards elevados, overlays flutuantes, texto sobre fundo escuro |
| `--color-ink-charcoal` | `#292827` | Texto principal, títulos, traços de ícone |
| `--color-stone-gray` | `#666666` | Texto secundário/auxiliar (único cinza médio, uso moderado) |
| `--color-soft-mist` | `#e3e3e2` | Bordas hairline, divisores |
| `--color-midnight-wine` | `#421d24` | **Ação primária**, banner de anúncio, rodapé |
| `--color-royal-violet` | `#714cb6` | **Somente texto** de link / frase de destaque |
| `--color-lilac-mist` | `#d4c7ff` | Botão secundário, badges, aba/estado selecionado |
| `--color-deep-lagoon` | `#0c4243` | **Somente faixas full-bleed** de destaque |

Superfícies: 0 Parchment (canvas) · 1 Paper White (cards) · 2 Lilac (selecionado/secundário) · 3 Deep Lagoon (faixa) · 4 Midnight Wine (rodapé/banner).
Brilhos `--glow-*` existem **só** para `.band-gradient`.

## 3. Tipografia

- **Família única:** `Super Sans VF` (token `--font-super-sans-vf`). Substituta aberta: **Inter variável** (`@fontsource-variable/inter`), que aceita o peso 460. Nunca adicionar segunda família (serif, mono decorativa etc.; `font-mono` só dentro de blocos de código).
- **Pesos:** 460 (voz do sistema: todos os títulos ≥ 28px **e** texto corrido), 500, 540 (ênfase), 600, 700 (apenas rótulos pequenos e títulos de card de 19px).
- **Escala — somente estes 8 papéis:**

| Papel | Tamanho | Altura de linha | Tracking | Classe CSS / Tailwind |
|---|---|---|---|---|
| caption | 12px | 1.5 | — | `.t-caption` / `text-caption` |
| body-sm | 14px | 1.5 | — | `.t-body-sm` / `text-body-sm` |
| body | 16px | 1.2 (1.5 em parágrafos multilinha) | 0 | `.t-body` / `text-body` |
| label-bold | 19px · peso 700 | 1.5 | — | `.t-label-bold` / `text-label-bold font-bold` |
| subheading | 26px | 1.3 | — | `.t-subheading` / `text-subheading` |
| heading-sm | 28px | 1.14 | -0.022em (-0.62px) | `.t-heading-sm` / `text-heading-sm` |
| heading-lg | 49px | 1.2 | -0.027em (-1.32px) | `.t-heading-lg` / `text-heading-lg` |
| display | 64px | 0.96 | -0.028em (-1.8px) | `.t-display` / `text-display` |

- Títulos: sempre `font-weight: 460`, sem `uppercase`, sem itálico, alinhados à esquerda (o hero pode centralizar o título).
- Mobile: só `display` (→ 40px) e `heading-lg` (→ 34px) podem diminuir abaixo de 768px, mantendo o tracking em `em`.
- Números em dados/tabelas/cards: `tabular-nums`.

## 4. Espaçamento, layout, raios, sombras

- **Base 4px.** Escala permitida: 4 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 36 · 40 · 48 · 64 · 80 · 96. No Tailwind: `p-1`=4, `p-2`=8, `p-3`=12, `p-4`=16, `p-5`=20, `p-6`=24, `p-7`=28, `p-8`=32, `p-9`=36, `p-10`=40, `p-12`=48, `p-16`=64, `p-20`=80, `p-24`=96.
- **Largura máxima do conteúdo 1200px** centralizado (`.container` / `max-w-page`); hero e faixas escuras vão de borda a borda.
- **Espaço entre seções 64–96px** (`.section`). Padding de card **16px**. Gap entre elementos **8px**. Densidade confortável.
- **Raios (somente):** cards, botões primários, cards flutuantes **16px** · abas e botões pequenos **8px** · pills/badges **999px** · células de logo e botão ghost **0**. Nada de 4px, 6px, 10px, 12px, 24px em componentes.
- **Sombras: nenhuma.** Única permitida: `--shadow-subtle` (anel interno de 1px) para estado selecionado/foco de campos. Profundidade vem de camadas (fotografia, card branco sobre parchment, blur do header).
- **Gradientes: nenhum** em superfícies de UI. Única exceção: `.band-gradient` (4 `radial-gradient` atmosféricos).

## 5. Regras inegociáveis (R1–R19)

| # | Regra | Verificador |
|---|---|---|
| R1 | O canvas é Warm Parchment `#f2f0eb`. Nunca fundo de página em branco puro. Branco só em cards que precisam "levantar". | ✓ |
| R2 | Só as cores da seção 2. **Proibido** introduzir azul, verde, vermelho, laranja ou qualquer outro acento (exceto os brilhos da faixa atmosférica). | ✓ |
| R3 | Texto em Ink Charcoal `#292827` (secundário Stone Gray). **Nunca `#000`**. Branco só sobre vinho/lagoon/foto. | ✓ |
| R4 | **Midnight Wine é o único preenchimento cromático de botão** (CTA principal). Não criar segunda cor de botão. | — |
| R5 | Royal Violet **exclusivo para texto de link** / frase de destaque. Nunca fundo, borda, badge ou ícone. | ✓ |
| R6 | Lilac Mist para botão secundário, badge e estado selecionado — nunca como CTA principal. | — |
| R7 | Deep Lagoon **somente** em faixa full-bleed. Nunca em card/componente. | ✓ |
| R8 | Uma única família tipográfica (Super Sans VF / Inter). | ✓ |
| R9 | Títulos ≥ 28px em peso **460**. Nunca ≥ 700 em headline. Sem `uppercase`/itálico em títulos. | ✓ |
| R10 | Só os 8 tamanhos da escala; tracking apertado em display (-0.028em/64, -0.027em/49), zero em ≤ 16px. | parcial |
| R11 | Espaçamento só da escala de 4px; seções 64–96px; container 1200px. | — |
| R12 | Raios só 0 · 8 · 16 · 999 conforme o componente. | ✓ |
| R13 | **Sem sombras** (única: `--shadow-subtle`). Sem `drop-shadow`, `text-shadow`. | ✓ |
| R14 | **Sem gradientes** em UI (exceção: `.band-gradient`, radial). | ✓ |
| R15 | Nunca superfície branca sobre branco. Card = branco + borda 1px `#e3e3e2` + raio 16 sobre parchment. | parcial |
| R16 | Header sticky: fundo transparente, `backdrop-filter: blur(12px)`, borda inferior 1px `#e3e3e2` que aparece ao rolar. | — |
| R17 | Texto de mais de 2 linhas **alinhado à esquerda**. Títulos e descrições à esquerda. | ✓ |
| R18 | Imagens e ícones conforme a seção 7. | — |
| R19 | **Somente tema claro.** Nada de `dark:` / `prefers-color-scheme: dark`. A única superfície escura são as faixas. | ✓ |

Ritmo da página: hero fotográfico → conteúdo claro (parchment) → faixa escura Lagoon → faixa de gradiente atmosférico → rodapé vinho, alternando claro/escuro.

## 6. Componentes (receitas)

Cada componente existe pronto em `assets/components.css`. Em Tailwind, use as classes de componente **ou** reproduza com utilitários equivalentes.

| Componente | Classe | Especificação |
|---|---|---|
| Botão primário | `.btn .btn-primary` | Fundo `#421d24`, texto branco 16px/460, raio 16, altura 48, padding-x 12; ícone de seta opcional a 8px |
| Botão secundário | `.btn .btn-secondary` | Fundo `#d4c7ff`, texto `#292827`, borda 1px `#292827`, raio 8, padding 6×16 |
| Botão ghost | `.btn .btn-ghost` | Transparente, sem borda/raio, padding 0, sublinhado no hover (nav e links discretos) |
| Contorno claro | `.btn .btn-outline-light` | Borda/texto brancos, raio 8, padding 8×20 — sobre faixa escura |
| Botão branco | `.btn .btn-white` | CTA sobre o banner de gradiente |
| Link | `.link` | `#714cb6`, 460, sem sublinhado; sublinhado aparece no hover (0.2s ease) |
| Card | `.card` | Branco, borda 1px `#e3e3e2`, raio 16, padding 16, **sem sombra** |
| Card flutuante | `.card-floating` | Branco 85%, raio 16, padding 16, borda `rgba(255,255,255,.2)`, sem sombra — sobre fotografia |
| Card de logo | `.card-logo` | Branco, borda 1px, raio 0, padding vertical 24; 6 células em uma linha, logo monocromática |
| Badge | `.badge` | Lilac, texto `#292827`, pill |
| Abas | `.tabs` `.tab[aria-selected]` | Container branco raio 8; aba ativa em Lilac |
| Header | `.header` | Sticky 64px, blur 12px; atributo `data-scrolled="true"` liga a borda |
| Banner de anúncio | `.banner` | Fundo vinho, texto branco, padding 12×16, rente ao topo, acima do header |
| Faixa escura | `.band-lagoon` | `#0c4243` full-bleed; título 64/460 branco; botão `.btn-outline-light` |
| Faixa de gradiente | `.band-gradient` | 4 radiais atmosféricos sobre parchment; título 48/460 `#292827`; botão `.btn-white` à direita |
| Rodapé | `.footer` | Vinho, padding 64; títulos 14px/700 branco; links 14px/460 branco 70%; sem divisores |

Snippet do header (borda ao rolar):
```js
const h = document.querySelector('.header')
const f = () => (h.dataset.scrolled = String(scrollY > 8))
f(); addEventListener('scroll', f, { passive: true })
```

Receita de página: `assets/example.html` mostra todos os componentes montados.

## 7. Imagens e ícones (R18)

- **Fotografia cinematográfica** é o ativo visual principal: tom quente, "golden hour", levemente dessaturada, ângulo de perfil, editorial — nunca corporativa/genérica.
- Produto/UI aparece como **cards de vidro flutuando sobre a foto**, não como screenshot isolado.
- **Proibido:** ilustração stock, renders 3D, formas decorativas abstratas (fora da faixa de gradiente).
- **Ícones:** linha monocromática, traço único, 16–20px, `stroke: currentColor`, espessura coerente com o texto (≈1.5). Em `.card` e `.tab`, ícone colorido só quando o componente pedir.
- Sem foto disponível: use placeholder em Parchment/Soft Mist com borda hairline — nunca um gradiente colorido nem ilustração.

## 8. Instalando os tokens em um projeto

Copie a pasta `assets/` para o projeto (ex.: `src/design-system/`) e importe:

**Tailwind CSS v4** (`src/index.css`):
```css
@import 'tailwindcss';
@import './design-system/tailwind-theme.css';  /* apaga paleta/sombras/raios/tamanhos padrão e define os tokens */
@import './design-system/components.css';
```
Depois da importação, `bg-blue-500`, `shadow-lg`, `rounded-md`, `text-xl` **deixam de existir** — o próprio framework impede a violação. Use `bg-warm-parchment`, `text-ink-charcoal`, `text-display`, `font-w460`, `rounded-card`, `rounded-button`, `max-w-page`.

**Tailwind v3 ou sem Tailwind / CSS puro / SCSS / CSS-in-JS:** importe `tokens.css` e `components.css` (nessa ordem) e use `var(--…)`. Em Tailwind v3, mapeie os mesmos valores em `theme.colors`, `theme.borderRadius`, `theme.fontSize`, `theme.boxShadow` **substituindo** (não estendendo) os padrões.

**Fonte:** `npm i @fontsource-variable/inter` e `@import '@fontsource-variable/inter/wght.css';` (ou declare o `@font-face` da Super Sans VF, se licenciada).

**Plataformas não-web** (React Native, Flutter, apps, slides, e-mail): reutilize os mesmos valores de cor, escala tipográfica, espaçamento de 4px e raios; as regras R1–R19 continuam valendo.

## 9. Checklist final (responda mentalmente antes de entregar)

- [ ] Fundo da página é `#f2f0eb`; nenhum branco puro de página inteira.
- [ ] Todas as cores vêm dos 9 tokens; nenhum `#000`, azul, verde ou vermelho.
- [ ] Existe **um** estilo de botão cromático (vinho); violeta só em links.
- [ ] Títulos em 460, sem negrito/uppercase/itálico; só tamanhos da escala; tracking apertado no display.
- [ ] Raios 0/8/16/999; nenhuma sombra; nenhum gradiente fora de `.band-gradient`.
- [ ] Cards: branco + borda `#e3e3e2` sobre parchment. Deep Lagoon só em faixa full-bleed.
- [ ] Header sticky com blur e borda ao rolar. Texto longo alinhado à esquerda. Sem tema escuro.
- [ ] Imagens quentes/editoriais; ícones de linha 16–20px; nada de ilustração stock/3D.
- [ ] `check-design.mjs --strict` retornou **✓ APROVADO**.
- [ ] Conflitos entre pedido e sistema foram sinalizados ao usuário (R#).

## 10. Inconsistências do arquivo original e como foram resolvidas

O `references/design-system.md` tem trechos que se contradizem. Decisão adotada (não reabra sem pedido do usuário):

| Contradição | Decisão |
|---|---|
| "Quick Color Reference"/prompt de exemplo chamam `#d4c7ff` de *primary action* com pill 9999px, mas Do's, tokens e componentes dizem que o CTA principal é `#421d24` com raio 16 | **Vinho `#421d24`/raio 16 = primário.** Lilac = secundário. |
| *Section Heading* diz tracking 0 e line-height 0.96 em 48px; os tokens dizem -0.027em e 1.2 em 49px | **Valem os tokens da escala** (`heading-lg`), com tracking apertado (Do's). |
| `body` com line-height 1.2 | 1.2 para texto de UI de uma linha; **1.5 em parágrafos multilinha** (interpretação para legibilidade). |
| Banner "pill 999px clipado nas bordas" | Faixa de largura total rente ao topo (`.banner`). |
| Cores dos brilhos azul/rosa/ciano da faixa atmosférica não têm hex na fonte | Valores escolhidos em `--glow-*`, **restritos** a `.band-gradient`. |
| `--shadow-subtle` é violeta (R5 proíbe violeta em borda) | Usada só como anel de seleção/foco de campos; é a única sombra do sistema. |
| `--spacing-N` na fonte conflita com a escala do Tailwind v4 (`p-16` seria 16px) | Não redefinimos `--spacing`; use a tabela de equivalência da seção 4. |

## Arquivos da skill

- `references/design-system.md` — arquivo de design original completo (fonte da verdade; consulte em caso de dúvida)
- `assets/tokens.css` — tokens em CSS puro
- `assets/tailwind-theme.css` — tokens para Tailwind v4 (com reset dos padrões)
- `assets/components.css` — base + componentes
- `assets/example.html` — página de referência montada com todos os componentes
- `scripts/check-design.mjs` — verificador automático (R1–R19)
