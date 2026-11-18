"""Plano de tempo único do Reels GB GOBÊ — usado pelo vídeo (build.py), pelo áudio (audio.py)
e pela narração (narration.py). Mudou um tempo aqui, mudou nos três.

Tempos em segundos. 1080x1920 (9:16), 30 fps, 35 s.
"""
W, H, FPS = 1080, 1920, 30
DUR = 35.0

# Paleta extraída dos selos (PDF) — valores exatos
CEREJA = (179, 18, 46)      # #B3122E
CHOCOLATE = (74, 36, 24)    # #4A2418
CREME = (251, 244, 234)     # #FBF4EA
ROSA = (244, 166, 188)      # #F4A6BC

# Cenas (fronteiras do roteiro: 0-4, 4-12, 12-23, 23-29, 29-35)
BOUNDS = [0.0, 4.0, 12.0, 23.0, 29.0, 35.0]
SCENE_NAMES = ["desejo", "tradicional", "recheadissimo", "felicidade", "encerramento"]
WAVE_DUR = 1.7            # duração da onda de chocolate que cobre a tela em cada fronteira
WAVES = [  # (fronteira, direção)
    (4.0, "down"), (12.0, "right"), (23.0, "left"), (29.0, "down"),
]

# Momentos-chave (usados também para sincronizar os efeitos sonoros)
EV = dict(
    pour=0.15,               # chocolate começa a escorrer sobre o brownie (cena 1)
    s2_orbit=(4.4, 7.0),     # câmera gira ao redor do tradicional
    s2_crack=7.0,            # a casquinha trinca
    s2_open=(7.2, 9.6),      # brownie é partido em câmera lenta
    s3_orbit=(12.5, 15.8),   # recheadíssimo inteiro, supercasquinha
    s3_open=(15.9, 19.0),    # abre e revela o recheio
    s3_choc=(18.8, 22.3),    # chocolate derretido escorre
    s3_muito=(19.35, 20.2),  # "MUITO" em destaque (acompanha a fala)
    s4_in=23.4,
    s5_logo=29.6,
    s5_cta=32.2,
)

# Narração. (id, início, fim, texto na legenda, texto enviado ao TTS)
# O TTS recebe grafia fonética onde precisa ("GB" -> "Gê Bê").
LINES = [
    ("l1", 0.25, 4.30, "Tem dias em que tudo o que a gente precisa é de um pouquinho de felicidade...",
     "Tem dias em que tudo o que a gente precisa é de um pouquinho de felicidade..."),
    ("l2", 4.60, 11.90, "Nosso brownie tradicional tem aquela casquinha crocante e um interior tão macio e úmido que conquista na primeira mordida!",
     "Nosso brownie tradicional tem aquela casquinha crocante e um interior tão macio e úmido que conquista na primeira mordida!"),
    ("l3a", 12.70, 16.40, "E se você ama um doce de verdade... prepare-se para o nosso Recheadíssimo!",
     "E se você ama um doce de verdade... prepare-se para o nosso Recheadíssimo!"),
    ("l3b", 16.70, 22.60, "Uma supercasquinha crocante, interior macio e muito, mas MUITO recheio para adoçar a vida!",
     "Uma supercasquinha crocante, interior macio e muito, mas MUITO recheio para adoçar a vida!"),
    ("l4", 23.60, 27.80, "Porque na GB GOBÊ, a felicidade tem sabor de chocolate!",
     "Porque na Gê Bê Gobê, a felicidade tem sabor de chocolate!"),
    ("l5", 29.60, 34.60, "GB GOBÊ. Seu momento doce começa aqui. Peça o seu e se apaixone!",
     "Gê Bê Gobê. Seu momento doce começa aqui. Peça o seu e se apaixone!"),
]

# Palavras que ganham cor/destaque nas legendas (comparação sem acento, minúsculas)
HIGHLIGHT = {"felicidade", "crocante", "macio", "umido", "recheadissimo", "muito", "chocolate",
             "supercasquinha", "recheio", "apaixone", "doce"}
BIG = {"muito"}  # destaque extra (maior + salto)

PRICE_TRAD = "R$ 10,90"
PRICE_RECH = "R$ 13,90"
