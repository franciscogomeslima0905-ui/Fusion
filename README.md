# Fusion Gym — site oficial

Landing page premium da **Fusion Gym**, academia em Tramandaí - RS.
Feita com **React + Vite + TypeScript + Tailwind CSS**, animações com **Motion (Framer Motion)**
e um servidor **Node.js** sem dependências para produção.

---

## Como rodar

Requisito: **Node.js 20 ou superior**.

```bash
npm install          # instala as dependências
npm run dev          # ambiente de desenvolvimento → http://localhost:5173
npm run build        # gera a versão de produção em dist/
npm start            # serve dist/ com o servidor Node (porta 3000, ou PORT=xxxx)
```

Outros comandos: `npm run lint` (oxlint) e `npm run typecheck` (TypeScript).

---

## Google Maps — configurando a `VITE_GOOGLE_MAPS_API_KEY`

O mapa da seção **Localização** usa a Google Maps JavaScript API. A chave **nunca** fica no código:
ela é lida da variável de ambiente `VITE_GOOGLE_MAPS_API_KEY`.

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/) e crie (ou selecione) um projeto.
2. Em **APIs e serviços → Biblioteca**, ative:
   - **Maps JavaScript API** (mapa interativo);
   - **Geocoding API** (posiciona o marcador exatamente no endereço; opcional, mas recomendado).
3. Em **APIs e serviços → Credenciais**, clique em **Criar credenciais → Chave de API**.
4. **Restrinja a chave** (importante, pois chaves do Maps ficam visíveis no navegador):
   - *Restrições de aplicativo* → **Referenciadores HTTP**, por exemplo `https://fusiongym.com.br/*`,
     `https://www.fusiongym.com.br/*` e `http://localhost:5173/*` (para desenvolvimento);
   - *Restrições de API* → apenas **Maps JavaScript API** e **Geocoding API**.
5. Na raiz do projeto, copie o arquivo de exemplo e cole a chave:

   ```bash
   cp .env.example .env
   ```

   ```env
   VITE_GOOGLE_MAPS_API_KEY=sua_chave_aqui
   ```

6. Reinicie o `npm run dev` (ou rode `npm run build` de novo). Em serviços de hospedagem
   (Vercel, Netlify etc.), cadastre a mesma variável no painel do projeto antes do build.

**Sem chave, ou com chave inválida**, o site continua funcionando: ele exibe automaticamente o mapa
incorporado padrão do Google. O botão **"Como chegar"** sempre abre a rota no Google Maps.

> O arquivo `.env` está no `.gitignore` — não faça commit dele.

---

## Onde editar o conteúdo

Quase tudo fica em **um único arquivo: [`src/config/site.ts`](src/config/site.ts)**.

| O quê | Onde em `site.ts` |
|---|---|
| Telefone/WhatsApp, Instagram, endereço | `site.contact`, `site.address` |
| Mensagens pré-preenchidas do WhatsApp (uma por botão) | `whatsappMessages` |
| Horários (o selo "Aberto agora" usa o fuso de Tramandaí) | `hours` |
| Números da seção "Por que treinar na Fusion?" | `stats` |
| Benefícios | `benefits` |
| **Planos** (nome, preço, benefícios, destaque) | `plans` |
| **Depoimentos** | `testimonials` |
| Fotos da galeria e da estrutura | `photos`, `gallery`, `structure` |

### ⚠️ Antes de publicar, preencha

- [ ] **Planos:** os planos Mensal, Semestral e Anual estão com **preços e benefícios fictícios**
      (provisórios, para apresentação). Substitua pelos valores reais e ajuste os selos (`badge`).
- [ ] **Depoimentos:** as avaliações atuais são **fictícias** (provisórias). Antes de publicar, troque por
      avaliações reais de alunos, com autorização — divulgar avaliações inventadas como reais é propaganda
      enganosa. Itens fictícios estão marcados com `placeholder: true`; ligue `showPlaceholderBadge`
      para exibir o selo "Exemplo" nos cards.
- [ ] **Domínio:** troque `https://fusiongym.com.br` em `site.url` e nas meta tags de `index.html`
      (canonical, Open Graph e dados estruturados).
- [ ] **Coordenadas do mapa:** confira `site.address.fallbackCoords` (usadas só se a Geocoding API não responder).

Os números exibidos usam apenas dados informados pela academia (seguidores no Instagram, horário de
funcionamento). Para incluir outros, adicione itens em `stats`.

### Adicionando fotos

1. Coloque a foto em `src/assets/gallery/` (de preferência em `.webp`, com até ~1600 px no lado maior)
   e uma versão menor `-sm` (~640 px) para celulares.
2. Importe as duas no topo de `site.ts` e adicione um item em `photos` / `gallery` / `structure`.

---

## A arte do hero (mãos + halter)

A primeira dobra reproduz o conceito do vídeo de referência: **uma mão colocando o peso perto da outra mão**,
em cinza esculpido sobre fundo preto, com luzes vermelhas.

- A arte fica em `src/assets/hero/` em **duas camadas transparentes**: `hand-top.webp` (braço + halter) e
  `hand-bottom.webp` (mão que recebe). Cada uma tem uma versão `-sm` para celular.
- As camadas são animadas separadamente: elas entram na tela, o braço "flutua" e, **conforme a rolagem**,
  aproxima o halter da outra mão. No desktop há parallax leve com o mouse.
- A arte foi gerada de forma procedural por [`scripts/generate-hero-art.mjs`](scripts/generate-hero-art.mjs).
- **Quer uma versão fotorrealista?** Gere ou encomende uma imagem (render 3D, IA ou foto) nas mesmas proporções
  (**1600×1000**, fundo transparente, braço vindo do canto superior esquerdo e mão aberta no inferior direito)
  e substitua os quatro arquivos `.webp` mantendo os nomes. Nenhum código precisa mudar.

---

## Estrutura do projeto

```
├── index.html               # SEO, Open Graph, dados estruturados (schema.org ExerciseGym)
├── public/                  # favicon, ícones, og-image, manifest, robots.txt
├── server/index.mjs         # servidor Node de produção (gzip/brotli, cache, fallback SPA)
├── scripts/                 # gerador da arte do hero
└── src/
    ├── config/site.ts       # ← TODO o conteúdo editável
    ├── lib/                 # whatsapp, horários (aberto agora), carregador do Google Maps
    ├── components/
    │   ├── layout/          # Navbar, menu mobile, Footer, WhatsApp flutuante, cursor
    │   ├── ui/              # Button, Reveal/SplitLines, Counter, ícones, selos
    │   └── MapView.tsx      # mapa reutilizável (API + fallback incorporado)
    ├── sections/            # Hero, Marquee, About, Structure, WhyFusion, Plans, Gallery,
    │                        # Testimonials, Location, Hours, Instagram, FinalCta
    └── index.css            # tema Tailwind (cores, fontes, utilitários)
```

## Referência de design

O vídeo de referência foi usado só para **estrutura, ritmo e experiência**. Nenhum texto, logo ou
elemento proprietário dele foi copiado. Os princípios adaptados foram:

- hero cinematográfico com arte escultural, título gigante e uma faixa inferior com informações rápidas;
- rótulos de seção numerados (`[01] SOBRE ———`) em fonte mono, com linhas finas;
- títulos grandes e condensados que sobem linha a linha; texto de "manifesto" que acende palavra por palavra durante a rolagem;
- números grandes em fonte mono com contagem animada;
- grade assimétrica de fotos em preto e branco que ganham cor no hover;
- abas de horários com gráfico de barras das 24h;
- planos com cartão central em destaque e um mini-questionário de indicação;
- CTA final de impacto e rodapé "Vamos conversar".

## Desempenho e acessibilidade

- Seções abaixo da dobra são carregadas sob demanda (code splitting); imagens com `loading="lazy"` e versões menores para celular.
- O mapa só é carregado quando se aproxima da tela.
- Fontes auto-hospedadas (sem requisições externas) com `font-display: swap`.
- Respeita `prefers-reduced-motion`; há link "Pular para o conteúdo", foco visível, textos alternativos e rótulos ARIA.
