# Reels GB GOBÊ — Qualidade: sabor, higiene e aparência

Segundo Reels da série, no **mesmo estilo** do primeiro (`../gb-gobe`): 1080×1920, 30 fps, 35 s, selo original no canto, ondas de chocolate como transição, legendas palavra por palavra, trilha original e efeitos. Mesmo motor (`gfx.py`), mesma paleta (cereja `#B3122E`, chocolate `#4A2418`, creme `#FBF4EA`, rosa `#F4A6BC`).

## Estado
| Item | Estado |
|---|---|
| Vídeo (5 cenas), trilha, efeitos, legendas | Pronto |
| Narração feminina pt-BR | Pronta: Kokoro, voz `pf_dora` (`narracao/voice.wav`) |
| Tempos das legendas, checklist e etiquetas | Reais, a partir da voz (`narracao/timeline.json`); checklist e etiquetas são amarrados às palavras "intenso", "crocante", "macio", "mãos", "cozinha", "protegido", "sabor", "higiene", "aparência", "peça") |

> **Confirme as afirmações de higiene antes de publicar.** Escrevi só o que é genérico e plausível para uma confeitaria, mas você é quem sabe o que de fato faz: *"Mãos e utensílios higienizados"*, *"Cozinha sempre limpa"*, *"Brownies bem protegidos"* (e a fala "mãos, utensílios e cozinha sempre limpos… cada brownie bem protegido até chegar à sua mão"). Não citei certificações, normas ou selos. Se tiver algo concreto (touca e luvas, alvará/vigilância sanitária, embalagem lacrada, etc.), troque os textos em `build.py` (`scene3 → items`) e `plan.py` (`LINES`).

## Roteiro e storyboard

| # | Tempo | Cena | Imagem | Texto na tela | Narração |
|---|---|---|---|---|---|
| 1 | 0–4 | **Gancho** | Brownie no prato creme, fio de chocolate forma poça e escorre; câmera gira e se aproxima | "Um doce de **verdade** começa antes da primeira **mordida.**" | Um doce de verdade começa muito antes da primeira mordida... |
| 2 | 4–12 | **SABOR** (fundo cereja) | Brownie abre em câmera lenta revelando o miolo úmido; migalhas; chocolate cai sobre os cortes; etiquetas *Intenso · Crocante · Macio e úmido* pulam junto com a fala | SABOR · "Chocolate intenso" · "Casquinha crocante, miolo macio e úmido." | Aqui, o foco é o sabor: chocolate intenso, casquinha crocante e um interior macio e úmido que derrete na boca. |
| 3 | 12–23 | **HIGIENE** (fundo creme, bolhas de sabão) | Brownie no prato cereja; checklist com ✔ animado; uma **cúpula de vidro** desce e protege o brownie, seguida de brilhos | HIGIENE · "Cuidado em cada etapa" · ✔ Mãos e utensílios higienizados · ✔ Cozinha sempre limpa · ✔ Brownies bem protegidos | E porque a gente se importa com você, a higiene vem em primeiro lugar: mãos, utensílios e cozinha sempre limpos, e cada brownie bem protegido até chegar à sua mão. |
| 4 | 23–29 | **APARÊNCIA** (fundo chocolate) | Os dois brownies lado a lado; faixa de luz passa pela casquinha (brilho); gotas de chocolate no topo, brilhos | APARÊNCIA · "Feito para encantar" · "Acabamento e brilho em cada detalhe." | E cada detalhe é cuidado para encantar também os olhos. |
| 5 | 29–35 | **Encerramento** | Chocolate escorre no topo; logo cereja entra com "pop"; etiquetas SABOR · HIGIENE · APARÊNCIA; os dois brownies; botão | "Sabor, higiene e aparência em cada brownie." · "Peça o seu e se encante!" | GB GOBÊ. Sabor, higiene e aparência em cada brownie. Peça o seu e se encante! *(TTS: "Gê Bê Gobê")* |

Direção de voz: igual ao Reels anterior (feminina, jovem-adulta, doce e acolhedora; ritmo ~2,5–3 palavras/s). Dar peso em "verdade", "sabor", "higiene", "protegido", "encantar". Sem tom de comercial.
Sem preços neste vídeo (o foco é confiança); o CTA é "Peça o seu e se encante!".

## Limites (iguais ao primeiro Reels)
Os brownies são renderizados por código (3D procedural), não fotografia: leem como ilustração 3D estilizada. Para fotorrealismo, gere os planos em IA de vídeo/filme real e reaproveite aqui trilha, legendas, selo e textos. Prompts sugeridos (colar o bloco de estilo do `../gb-gobe/README.md` antes de cada um):
1. *Glossy melted chocolate slowly pours onto a handmade brownie on a cream plate, push-in on the crackled crust.*
2. *A brownie is slowly pulled apart revealing a moist, fudgy interior, crumbs falling, macro.*
3. *A clean bright bakery counter; a glass cloche is lowered over a brownie on a cherry-red plate; hands washing with soap and clean utensils laid out* (filme/gere conforme o que sua cozinha realmente faz).
4. *Two beautifully finished brownies on cream plates, a soft band of light sweeps across the glossy crust.*
5. *Cream background, chocolate drips from the top edge, clean space for a logo.*

## Rodar
```bash
cd reels/gb-gobe-qualidade
python3 audio.py PASTA          # trilha + efeitos (+ voz se PASTA/voice.wav existir)
python3 build.py PASTA saida.mp4
# com voz: python3 narration.py MODELO_KOKORO PASTA  antes dos dois comandos acima
```
