# Reels GB GOBÊ — Como encomendar + cardápio + link da bio

Mesmo estilo "colagem de papel / stop-motion" do `../gb-gobe-colagem` (fotos reais do cardápio, letras recortadas, rabiscos de caneta, trilha de violão/palmas). 1080×1920, 30 fps, 34 s, sem narração.
Arquivo: `reel-gb-gobe-encomendas.mp4`.

## Roteiro
| Tempo | Cena | Conteúdo |
|---|---|---|
| 0–3,6 | Gancho | QUANDO PEDIR E QUANDO RECEBER? |
| 3,6–10,4 | NA SEMANA | PEDIDO **terça** → ENTREGA **quarta** · PEDIDO **quinta** → ENTREGA **sexta** · "Entrega no dia seguinte" |
| 10,4–16 | FIM DE SEMANA | PEDIDO **sábado** / **domingo** · "Entrega no mesmo dia" · "Pode ser entregue no dia" |
| 16–21,5 | SEGUNDA? | PEDIDO **domingo** → ENTREGA **segunda** · "O pedido deve ser feito no domingo" |
| 21,5–28,5 | RELEMBRE O CARDÁPIO | Brownie R$ 10,00 · Recheadíssimo R$ 13,90 (meio amargo, ao leite ou branco) · Nutella R$ 15,90 (ou doce de leite) · Branco & Kinder Bueno R$ 15,90 (especial da casa) |
| 28,5–34 | PEÇA JÁ NO LINK DA BIO | logo, seta desenhada, "Seu momento doce começa aqui", as 4 fotos |

As regras de encomenda e os preços ficam em `plan.py` (`RULES`, `WEEKEND`, `MONDAY`, `MENU`) — é só editar e renderizar de novo.

## Confirme antes de publicar
- **Quarta e sexta:** as regras informadas não dizem como funcionam pedidos feitos na quarta ou na sexta (nem se há entrega na terça ou na quinta). O vídeo **não afirma nada** sobre isso.
- **Fim de semana vs. "1 dia de antecedência":** este vídeo diz que sábado e domingo podem ser entregues no dia; o vídeo `../gb-gobe-colagem` termina com "Peça com 1 dia de antecedência" e o cardápio diz "Sem pronta entrega". Convém alinhar a mensagem.
- **Preço do clássico:** R$ 10,00 vem do cardápio; o primeiro Reels (`../gb-gobe`) mostra R$ 10,90.
- Fotos com ~230 px (do `assets/cardapio.jpg`): ficam levemente macias; com as fotos originais a qualidade sobe.

## Rodar
```bash
cd reels/gb-gobe-encomendas
python3 audio.py PASTA
python3 build.py PASTA saida.mp4
```
