# Reels GB GOBÊ — Controle de Qualidade (laboratório de inspeção)

Conceito novo, sem relação visual com os outros vídeos: um **laboratório de inspeção**. Fundo de grade técnica, tipografia mono, mira/escopo, linhas de varredura entre as cenas, as **fotos reais do cardápio** escaneadas (meio-tom rosa que vira foto colorida), anotações e **carimbos "APROVADO"** com tremida de tela. Trilha eletrônica lo-fi própria (piano elétrico, baixo, batida, estalos). 1080×1920, 30 fps, 39 s, sem narração.
Arquivo: `reel-gb-gobe-controle-de-qualidade.mp4`.

## Roteiro
| Tempo | Cena | Conteúdo |
|---|---|---|
| 0–3,8 | Abertura | Varredura da tela, **logo grande no escopo**, "CONTROLE DE QUALIDADE", "GB GOBÊ · CONFEITARIA ARTESANAL" |
| 3,8–10,4 | Amostra 01 | **CASQUINHA CROCANTE** (carimbo CROCANTE) e **INTERIOR MACIO E ÚMIDO** (carimbo) — foto do clássico |
| 10,4–15,4 | Amostra 02 | **RECHEIO GENEROSO** — "camada generosa" — foto do Recheadíssimo |
| 15,4–20,4 | Amostra 03 | **NUTELLA DE VERDADE** (ou doce de leite) — foto da Nutella |
| 20,4–25,4 | Resultado | As 4 fotos com ✔, carimbo **APROVADO**, "Feito artesanalmente" |
| 25,4–33,4 | **Cardápio** | O cardápio enviado (`assets/cardapio.jpg`) é escaneado e destacado item por item, cada um carimbado APROVADO |
| 33,4–39 | **Link da bio** | Logo + "AS ENCOMENDAS SÃO FEITAS NO LINK DA BIO" + seta |

A **logo original** (selo creme) fica no canto superior esquerdo em todas as cenas, e aparece grande na abertura e no fechamento.

## Atenção
- **Só afirmo o que o cardápio já diz** (casquinha crocante, interior macio e úmido, camada generosa de recheio, Nutella de verdade, especial da casa, confeitaria artesanal). "Inspeção" e "APROVADO" são recurso criativo, **não** citam certificação nem norma.
- O cardápio aparece **como foi enviado, com preços** (clássico R$ 10,00). O primeiro Reels (`../gb-gobe`) mostra R$ 10,90: confirme qual vale.
- Fotos com ~230 px (do cardápio): o efeito de varredura em meio-tom ajuda, mas com as fotos originais fica mais nítido.
- O cardápio também mostra WhatsApp, @ e horário; o vídeo manda pedir pelo link da bio.

## Rodar
```bash
cd reels/gb-gobe-laboratorio
python3 audio.py PASTA
python3 build.py PASTA saida.mp4
```
