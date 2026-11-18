# Reels GB GOBÊ — dossiê de produção

Vertical 9:16 · 1080×1920 · 30 fps · 35 s · Instagram Reels.
Tudo aqui é gerado por código (`plan.py` → `build.py` + `audio.py` + `narration.py`) e usa os selos originais em `assets/` **sem modificá-los**.

## O que está pronto e o que falta

| Item | Estado |
|---|---|
| Roteiro, storyboard, identidade, tempos | Pronto (este arquivo + `plan.py`) |
| Vídeo animado (5 cenas, ondas de chocolate, legendas, selo no canto) | Pronto (`build.py`) |
| Trilha original + efeitos sonoros sincronizados | Pronto (`audio.py`, sintetizados em código) |
| **Narração feminina pt-BR** | **Script pronto (`narration.py`), ainda não executado** — depende de instalar o Kokoro (ver abaixo) |
| Legendas | Prontas, mas com **tempos estimados**; ficam exatas quando a voz for gerada |
| Versão fotorrealista com IA de vídeo | Prompts abaixo (seção 6) |

### Limite honesto do que foi renderizado
Os brownies deste vídeo são **renderizados proceduralmente (3D de caixas com texturas geradas por código)**, não filmados nem gerados por IA de vídeo. Têm movimento, perspectiva, brilho de chocolate e recheio, mas leem como ilustração 3D estilizada, não como fotografia de comida. Para o fotorrealismo de uma "campanha de grande marca" use os prompts da seção 6 numa ferramenta de vídeo com IA (ou filme os produtos reais) e reaproveite aqui a trilha, os efeitos, as legendas, o selo e os textos. O recheio do Recheadíssimo está em um creme neutro (`FILL_HI/FILL_LO` em `gfx.py`) porque o sabor não foi informado — troque pela cor real.

### Para fechar o vídeo com a voz
```bash
pip install kokoro-onnx soundfile
# baixar kokoro-v1.0.onnx e voices-v1.0.bin (release model-files-v1.0 do projeto kokoro-onnx) para uma pasta MODELO
cd reels/gb-gobe
python3 narration.py MODELO ../../trabalho    # voice.wav + timeline.json (tempos reais)
python3 audio.py ../../trabalho               # mixa voz + trilha (com ducking) + efeitos
python3 build.py ../../trabalho reel-gb-gobe.mp4
```
Alternativa: gravar/gerar a narração em outra ferramenta de voz (ElevenLabs, etc.) com os textos da seção 3 e salvar como `voice.wav`; os tempos das palavras então precisam ser marcados em `timeline.json` (formato: `{"words":[{"w","s","e","line"}]}`).

## 1. Identidade visual (extraída dos PDFs)

| Cor | Hex | Uso |
|---|---|---|
| Cereja | `#B3122E` | Cena 3, preços, CTA, selo em fundos claros |
| Chocolate | `#4A2418` | Cenas 1 e 4, textos em fundo claro, caixa das legendas |
| Creme | `#FBF4EA` | Cenas 2 e 5, textos em fundo escuro, pratos |
| Rosa | `#F4A6BC` | Palavras de destaque, brilhos |

Tipografia do selo: Fraunces SemiBold (serifa) + Inter Bold. O Fraunces não está instalado aqui; os títulos usam **Caladea Bold** (serifa de aparência próxima) e o texto usa **Inter** (a mesma do selo). Se tiver o Fraunces, troque `F_SERIF_*` em `build.py`.
Selo no canto superior esquerdo durante todo o vídeo (variante creme em fundos escuros, cereja em fundos claros); some só na cena 5, onde a logo ocupa o centro.

## 2. Storyboard e tempos

| # | Tempo | Cena | Imagem | Texto na tela | Som |
|---|---|---|---|---|---|
| 1 | 0–4 s | **O desejo** | Brownie num prato creme sobre fundo chocolate; fio de chocolate cai do topo, forma poça brilhante na casquinha e escorre pelas laterais. Câmera gira e se aproxima da casquinha. | "Existe *felicidade* em forma de *brownie…*" | Chocolate escorrendo; trilha entra |
| ↔ | ~3,2–4,8 | **Onda de chocolate** (de cima) cobre a tela | | | Swoosh + "glop" |
| 2 | 4–12 s | **Brownie Tradicional** | Prato cereja sobre fundo creme. Órbita de câmera; rachadura corre pela casquinha; brownie parte ao meio em câmera lenta (estalo rápido, depois abertura lenta), migalhas caem; macro do miolo úmido. | BROWNIE / TRADICIONAL · "Casquinha crocante. Interior macio e úmido." · **R$ 10,90** | Crack da casquinha, brownie partindo, pop do preço |
| ↔ | ~11,2–12,8 | **Onda de chocolate** da esquerda p/ direita | | | Swoosh |
| 3 | 12–23 s | **Recheadíssimo** | Fundo cereja, prato creme. Supercasquinha (mais espessa e brilhante) com brilhos, push-in; abre revelando camada generosa de recheio cremoso que vaza do corte e escorre; chocolate derretido cai sobre os dois lados. "MUITO" pulsa junto com a fala. | BROWNIE / RECHEADÍSSIMO · "Supercasquinha crocante + *MUITO* recheio!" · **R$ 13,90** | Estalo, recheio, chocolate escorrendo, pop do "MUITO" |
| ↔ | ~22,2–23,8 | **Onda de chocolate** da direita p/ esquerda | | | Swoosh |
| 4 | 23–29 s | **O significado de felicidade** | Os dois juntos: Tradicional inteiro + Recheadíssimo aberto, gotas de chocolate no topo do quadro, migalhas, bokeh, aproximação lenta. | "O verdadeiro significado de *felicidade* tem sabor de *chocolate.*" | Chimes suaves |
| 5 | 29–35 s | **Encerramento** | Chocolate escorre no topo do quadro sobre fundo creme; logo cereja entra com "pop" no centro; os dois brownies abaixo com nome e preço; botão CTA pulsando. | "Seu momento doce começa aqui." · Brownie Tradicional **R$ 10,90** · Brownie Recheadíssimo **R$ 13,90** · "Qual vai adoçar o seu dia? Faça seu pedido!" | Pop da logo, chimes, pops dos preços |

Primeiros 2 s: brownie de fundo escuro com textura macro, texto entrando em 0,12 s e fio de chocolate caindo em 0,15 s.
Área segura: legendas em y≈1478 px (acima da barra inferior do Reels), selo e títulos abaixo de y≈210 px, nada importante na coluna direita (x>980) abaixo de y≈900.

## 3. Narração (texto exato) e direção de voz

| Fala | Janela | Texto |
|---|---|---|
| l1 | 0,25–4,30 | Tem dias em que tudo o que a gente precisa é de um pouquinho de felicidade... |
| l2 | 4,60–11,90 | Nosso brownie tradicional tem aquela casquinha crocante e um interior tão macio e úmido que conquista na primeira mordida! |
| l3a | 12,70–16,40 | E se você ama um doce de verdade... prepare-se para o nosso Recheadíssimo! |
| l3b | 16,70–22,60 | Uma supercasquinha crocante, interior macio e muito, mas **MUITO** recheio para adoçar a vida! |
| l4 | 23,60–27,80 | Porque na GB GOBÊ, a felicidade tem sabor de chocolate! *(TTS: "Gê Bê Gobê")* |
| l5 | 29,60–34,60 | GB GOBÊ. Seu momento doce começa aqui. Peça o seu e se apaixone! |

Direção: voz feminina jovem-adulta, doce e acolhedora, sorrindo ao falar, como quem indica o doce favorito; ritmo ~2,5–3 palavras/s; pausa curta antes de "crocante", "macio", "úmido"; **"MUITO" com mais energia e leve alongamento**; "felicidade" e "chocolate" mais baixas e quentes. Sem tom de locutor de rádio. O `narration.py` ajusta a velocidade (0,85–1,3×) para cada fala caber na janela da cena.
Mixagem: voz ~ −3 dBFS pico, música com "ducking" de ~50% quando há fala, efeitos abaixo da voz.

## 4. Legendas
Palavra por palavra, blocos de até 3 palavras numa pílula chocolate com borda rosa, texto creme Inter ExtraBold 58 px; palavras-chave (*felicidade, crocante, macio, úmido, Recheadíssimo, MUITO, chocolate, supercasquinha, recheio, apaixone, doce*) em rosa; "MUITO" maior e com salto. Cada palavra entra no instante em que é falada (tempos de `timeline.json`).

## 5. Trilha e efeitos (`audio.py`)
Música **original**, 100 BPM, Dó–Lá menor–Fá–Sol: arpejo de piano suave, celesta brincalhona, baixo macio, shaker e rim leves, acorde aberto final. Nada de música de terceiros. Efeitos: fio de chocolate com bolhinhas, swoosh de onda nas 4 transições, rachadura + estalo da casquinha, brownie partindo, pops dos preços, chimes de brilho.

## 6. Versão fotorrealista — prompts para ferramenta de vídeo com IA
Gere cada cena em vertical 9:16, 5–8 s, 24–30 fps, e monte na ordem abaixo. Mantenha o **mesmo estilo em todos os planos** colando o bloco de estilo no começo de cada prompt.

**Bloco de estilo (colar em todos):** *Premium artisan bakery commercial, shot on a cinema camera, 100mm macro lens, shallow depth of field, warm soft key light with a gentle rim light, rich chocolate-brown, cream (#FBF4EA) and cherry-red (#B3122E) palette, handmade brownies with a thin glossy crackled crust, ultra detailed food photography, slow motion 120 fps look, no text, no logos, no hands showing faces.*

1. **Desejo (0–4 s):** *Glossy melted dark chocolate slowly pours from above onto a handmade square brownie on a cream ceramic plate, chocolate pooling on the crackled crust and dripping down the sides, slow push-in toward the crust, dark chocolate background with warm bokeh.*
2. **Tradicional (4–12 s):** *Camera slowly orbits a handmade brownie with a thin crackled shiny crust on a cherry-red plate over a cream surface; then two hands gently snap the brownie in half in slow motion, the crust cracking, moist fudgy interior revealed, a few crumbs falling; macro on the moist interior.*
3. **Recheadíssimo (12–23 s):** *A tall handmade brownie with a thick crunchy crackled "super crust" on a cream plate against a cherry-red background; it is slowly pulled open to reveal a generous thick glossy creamy filling stretching between the halves; macro movement along the filling; warm melted chocolate drips slowly over the cut halves.* (Defina o recheio real do produto no prompt.)
4. **Felicidade (23–29 s):** *Two brownies side by side on a dark chocolate background — one whole, one cut open with creamy filling — crumbs floating, tiny chocolate drips at the top of the frame, slow cinematic push-in, warm glow.*
5. **Fechamento (29–35 s):** *Cream background, glossy chocolate drips running down from the top edge, then clean empty space in the center for a logo overlay, two brownies on cherry-red plates in the lower half.*

Montagem: usar as ondas de chocolate de `build.py` como transição (ou *chocolate drip wipe* no editor), sobrepor `assets/selo-*.png` no canto, textos/preços/legendas conforme as seções 2–4, trilha de `music_sfx.wav`, voz de `voice.wav`.

## 7. Arquivos
`plan.py` tempos/paleta/falas · `gfx.py` motor gráfico · `build.py` vídeo · `audio.py` trilha+efeitos+mix · `narration.py` voz · `timing.py` tempos das palavras · `assets/` selos originais (PDF) e PNGs transparentes.
