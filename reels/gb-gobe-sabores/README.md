# Reels GB GOBÊ — Sabores (do cardápio)

Terceiro Reels da série, no mesmo estilo (`../gb-gobe`, `../gb-gobe-qualidade`): 1080×1920, 30 fps, 35 s, selo original no canto, ondas de chocolate como transição, trilha original e efeitos. **Sem narração e sem legendas faladas**: o texto está nas próprias cenas.
Arquivo: `reel-gb-gobe-sabores.mp4`.

## Roteiro (baseado no cardápio) — recheio sempre **por cima**
| Tempo | Cena | Imagem | Texto na tela |
|---|---|---|---|
| 0–3,5 | Gancho | Brownie no prato, chocolate escorrendo, câmera se aproxima da casquinha | Qual é o seu **sabor** favorito de brownie? |
| 3,5–8,5 | **O clássico** | Brownie liso, casquinha brilhante e rachada; leva uma **mordida** que mostra o miolo | BROWNIE · O clássico que conquista · Casquinha crocante, interior macio e úmido. |
| 8,5–16,5 | **Recheadíssimo** | Espirais de recheio por cima, trocando **meio amargo → ao leite → branco** | Escolha o recheio · Recheio cremoso por cima, bem generoso. · etiquetas dos 3 recheios |
| 16,5–22,5 | **Nutella / doce de leite** | Nutella espalhada em riscos; depois doce de leite brilhante | Nutella de verdade · Ou com doce de leite — mesmo preço. |
| 22,5–28,5 | **Especial da casa** | Metade chantilly branco, metade ganache; dois pedaços de Kinder Bueno caem por cima | Branco & Kinder Bueno · Chocolate branco com Kinder Bueno por cima. |
| 28,5–35 | **Como pedir** | Logo, chamada, recapitulação dos sabores | Para pedir é só ir no **link da bio** ↑ · Peça com 1 dia de antecedência |

## Como o brownie é feito (`rm.py`)
Renderizador 3D próprio (ray marching em numpy): corpo de caixa arredondada e levemente irregular, casquinha com relevo e rachaduras, luz e brilho calculados por pixel, mordida, e coberturas por mapa de alturas (chantilly em espirais, Nutella em riscos, doce de leite liso, ganache) mais pedaços de Kinder Bueno. Ainda é imagem gerada por código, não fotografia.

## Atenção
- **Sem preços** neste vídeo. No cardápio o Clássico custa **R$ 10,00**, mas o primeiro Reels (`../gb-gobe`) mostra **R$ 10,90**. Confirme qual é o valor atual e corrija o que estiver desatualizado (`PRICE_TRAD` em `../gb-gobe/plan.py`, e renderizar de novo).
- "Nutella" e "Kinder Bueno" aparecem só como texto, como no cardápio; não há logotipos nem embalagens. O Kinder Bueno é um pedaço genérico desenhado por código (chocolate + camadas de wafer).
- As cores dos recheios (meio amargo, ao leite, branco, Nutella, doce de leite) são aproximações em `TOPS` (`build.py`); ajuste para as reais se quiser.
- Mesmo mais realista, o brownie continua sendo renderizado por código (não fotografia); as fotos do cardápio são mais apetitosas. Para fotorrealismo, use fotos/vídeos reais e reaproveite aqui trilha, selo e textos.
- Os Reels `../gb-gobe` e `../gb-gobe-qualidade` ainda mostram o Recheadíssimo com recheio **dentro** do brownie (versão antiga das caixas); não foram refeitos.

## Rodar
```bash
cd reels/gb-gobe-sabores
python3 audio.py PASTA            # trilha + efeitos (mix.wav)
python3 build.py PASTA saida.mp4
```
