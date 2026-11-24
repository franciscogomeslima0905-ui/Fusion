# Reels GB GOBÊ — De onde somos e até onde entregamos

Conceito novo ("Linha GB GOBÊ", estilo mapa de metrô): gráfico **chapado e geométrico** nas cores da marca (cereja, chocolate, creme, rosa), pin de localização, sol e ondas, mapa ilustrativo com o brownie viajando por uma linha, transições em **íris circular** e trilha praiana (marimba, conga, shaker, palmas). Logo original no canto superior esquerdo (variante que contrasta com cada fundo) e grande no fechamento. 1080×1920, 30 fps, 31 s, sem narração.
Arquivo: `reel-gb-gobe-onde-entregamos.mp4`.

## Roteiro
| Tempo | Cena | Conteúdo |
|---|---|---|
| 0–3,6 | Gancho | DE ONDE SOMOS E ATÉ ONDE ENTREGAMOS? + pin caindo |
| 3,6–9 | De onde somos | SOMOS DE **TRAMANDAÍ** · RS (sol nascendo e ondas) |
| 9–19 | Nossa rota de entrega | Mapa ilustrativo: GB GOBÊ (Tramandaí · RS) → ENTREGAMOS NA CIDADE DE TRAMANDAÍ → atravessa o rio → ENTREGAMOS EM IMBÉ |
| 19–25 | Nossa área de entrega | Placas: ENTREGAMOS EM TRAMANDAÍ ✔ · E TAMBÉM EM IMBÉ ✔ · "É até aqui que a gente entrega" |
| 25–31 | Fechamento | Logo grande + frase escrita: **GARANTA JÁ NO LINK DA BIO** · TRAMANDAÍ · IMBÉ |

## Atenção
- **Mapa ilustrativo e fora de escala** (está escrito no vídeo). Posição usada: Imbé ao norte do Rio Tramandaí, Tramandaí ao sul, oceano a leste. Confira se está de acordo com o que vocês querem mostrar.
- O vídeo afirma só o que foi informado: sede em Tramandaí - RS; entrega na cidade e em Imbé. A frase "É até aqui que a gente entrega" indica que não há entrega além dessas duas cidades; ajuste em `scene_areas` (`build.py`) se não for o caso.
- Não há horários, preços nem prazos neste vídeo.

## Rodar
```bash
cd reels/gb-gobe-rota
python3 audio.py PASTA
python3 build.py PASTA saida.mp4
```
