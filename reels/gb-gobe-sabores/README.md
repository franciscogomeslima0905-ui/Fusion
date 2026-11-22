# Reels GB GOBÊ — Sabores (do cardápio)

Terceiro Reels da série, no mesmo estilo (`../gb-gobe`, `../gb-gobe-qualidade`): 1080×1920, 30 fps, 35 s, selo original no canto, ondas de chocolate como transição, trilha original e efeitos. **Sem narração e sem legendas faladas**: o texto está nas próprias cenas.
Arquivo: `reel-gb-gobe-sabores.mp4`.

## Roteiro (baseado no cardápio)
| Tempo | Cena | Texto na tela |
|---|---|---|
| 0–3,5 | Gancho (chocolate escorrendo) | Qual é o seu **sabor** favorito de brownie? |
| 3,5–8,5 | **O clássico** | BROWNIE · O clássico que conquista · Casquinha crocante, interior macio e úmido. |
| 8,5–16,5 | **Recheadíssimo** — o recheio troca de cor | Escolha o recheio · Brownie com camada generosa de recheio · etiquetas **Meio amargo → Ao leite → Branco** |
| 16,5–22,5 | **Nutella / doce de leite** — recheio escorre | Nutella de verdade · Ou com doce de leite — mesmo preço · etiquetas Nutella / Doce de leite |
| 22,5–28,5 | **Especial da casa** — um pedaço de Kinder Bueno cai por cima | Branco & Kinder Bueno · Chocolate branco com Kinder Bueno por cima. |
| 28,5–35 | **Como pedir** | Para pedir é só ir no **link da bio** ↑ · Clássico, Recheadíssimo, Nutella, Doce de leite, Branco & Kinder Bueno · Peça com 1 dia de antecedência |

## Atenção
- **Sem preços** neste vídeo. No cardápio o Clássico custa **R$ 10,00**, mas o primeiro Reels (`../gb-gobe`) mostra **R$ 10,90**. Confirme qual é o valor atual e corrija o que estiver desatualizado (`PRICE_TRAD` em `../gb-gobe/plan.py`, e renderizar de novo).
- "Nutella" e "Kinder Bueno" aparecem só como texto, como no cardápio; não há logotipos nem embalagens. O Kinder Bueno é um pedaço genérico desenhado por código (chocolate + camadas de wafer).
- As cores dos recheios (meio amargo, ao leite, branco, Nutella, doce de leite) são aproximações em `FILLS` (`build.py`); ajuste para as reais se quiser.
- Os brownies são renderizados por código (ilustração 3D), não fotografia; as fotos do cardápio são bem mais apetitosas. Para fotorrealismo, use fotos/vídeos reais e reaproveite aqui trilha, selo e textos.

## Rodar
```bash
cd reels/gb-gobe-sabores
python3 audio.py PASTA            # trilha + efeitos (mix.wav)
python3 build.py PASTA saida.mp4
```
