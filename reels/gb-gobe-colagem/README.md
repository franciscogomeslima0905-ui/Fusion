# Reels GB GOBÊ — Sabores em colagem de papel (stop-motion)

Versão **diferente** dos outros vídeos: em vez de 3D e ondas de chocolate, usa as **fotos reais do cardápio**, papel com textura, letras recortadas com borda branca, adesivos ovais com a meia-lua rosa do cardápio, fitas, rabiscos de caneta desenhados ao vivo e movimento "de 10 em 10 quadros" (stop-motion). Trilha própria (violão/ukulele, palmas, batida de pé, kalimba) e efeitos de papel/adesivo/caneta. 1080×1920, 30 fps, 33 s, sem narração.
Arquivo: `reel-gb-gobe-sabores-colagem.mp4`. (A versão 3D anterior segue em `../gb-gobe-sabores`.)

## Roteiro
| Tempo | Cena | Texto |
|---|---|---|
| 0–3,4 | Gancho (4 fotos reais em adesivos) | QUAL É O **SEU SABOR** FAVORITO? |
| 3,4–8,6 | 01 · O clássico | CASQUINHA CROCANTE · INTERIOR MACIO E ÚMIDO |
| 8,6–14,6 | 02 · Recheadíssimo | RECHEIO CREMOSO POR CIMA · bolinhas: MEIO AMARGO · AO LEITE · BRANCO |
| 14,6–20,2 | 03 · Nutella | DE VERDADE · bolinhas: NUTELLA ou DOCE DE LEITE |
| 20,2–26 | 04 · Especial da casa | BRANCO & KINDER BUENO · recheio de chocolate branco e um pedaço de Kinder Bueno por cima |
| 26–33 | Como pedir | PEÇA PELO **LINK DA BIO** (seta desenhada) · PEÇA COM 1 DIA DE ANTECEDÊNCIA · as 4 fotos |

## Atenção
- **Qualidade das fotos:** vêm do `assets/cardapio.jpg` (a imagem do cardápio, ~230 px por foto). Em tamanho de adesivo (380–560 px) funcionam, mas ficam levemente macias. **Mande as fotos originais** (ou os arquivos do cardápio) que eu refaço com nitidez total.
- Só 4 produtos têm foto. As cores de **meio amargo, ao leite, branco, Nutella e doce de leite** são bolinhas desenhadas (aproximações, em `scene_c`/`scene_d`), não fotos.
- **Sem preços.** No cardápio o clássico custa R$ 10,00 e o primeiro Reels (`../gb-gobe`) mostra R$ 10,90; confirme qual vale.
- Selo original no canto superior esquerdo (variante que contrasta com o fundo; some na última cena, onde a logo é grande).
- Fonte dos títulos: Inter Black comprimida (o Fraunces/Oswald do cardápio não estão instalados).

## Rodar
```bash
cd reels/gb-gobe-colagem
python3 audio.py PASTA            # trilha + efeitos
python3 build.py PASTA saida.mp4
```
