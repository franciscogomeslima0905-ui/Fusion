"""Plano de tempo do Reels GB GOBÊ — QUALIDADE (sabor, higiene, aparência).
Mesmo motor, paleta e estilo do Reels dos brownies. 1080x1920, 30 fps, 35 s."""
W, H, FPS = 1080, 1920, 30
DUR = 35.0

CEREJA = (179, 18, 46)      # #B3122E
CHOCOLATE = (74, 36, 24)    # #4A2418
CREME = (251, 244, 234)     # #FBF4EA
ROSA = (244, 166, 188)      # #F4A6BC

BOUNDS = [0.0, 4.0, 12.0, 23.0, 29.0, 35.0]
SCENE_NAMES = ["gancho", "sabor", "higiene", "aparencia", "encerramento"]
WAVE_DUR = 1.7
WAVES = [(4.0, "down"), (12.0, "right"), (23.0, "left"), (29.0, "down")]

# Eventos que NÃO dependem de palavra (os que dependem são buscados na fala: ver wtime() em build.py/audio.py)
EV = dict(
    pour=0.15,
    s2_open=(4.9, 8.0),     # Tradicional abre devagar
    s2_choc=8.4,            # chocolate escorre sobre o corte
    s3_dome=20.4,           # cúpula protege o brownie (fallback; real = palavra "protegido")
    s5_logo=29.6,
    s5_cta=32.4,
)

# (id, início, fim, texto da legenda, texto para o TTS)
LINES = [
    ("l1", 0.25, 3.90, "Um doce de verdade começa muito antes da primeira mordida...",
     "Um doce de verdade começa muito antes da primeira mordida..."),
    ("l2", 4.60, 11.80, "Aqui, o foco é o sabor: chocolate intenso, casquinha crocante e um interior macio e úmido que derrete na boca.",
     "Aqui, o foco é o sabor: chocolate intenso, casquinha crocante e um interior macio e úmido que derrete na boca."),
    ("l3", 12.70, 22.60, "E porque a gente se importa com você, a higiene vem em primeiro lugar: mãos, utensílios e cozinha sempre limpos, e cada brownie bem protegido até chegar à sua mão.",
     "E porque a gente se importa com você, a higiene vem em primeiro lugar: mãos, utensílios e cozinha sempre limpos, e cada brownie bem protegido até chegar à sua mão."),
    ("l4", 23.60, 27.90, "E cada detalhe é cuidado para encantar também os olhos.",
     "E cada detalhe é cuidado para encantar também os olhos."),
    ("l5", 29.60, 34.70, "GB GOBÊ. Sabor, higiene e aparência em cada brownie. Peça o seu e se encante!",
     "Gê Bê Gobê. Sabor, higiene e aparência em cada brownie. Peça o seu e se encante!"),
]

HIGHLIGHT = {"sabor", "intenso", "crocante", "macio", "umido", "chocolate", "higiene", "limpos", "protegido",
             "encantar", "encante", "aparencia", "doce", "verdade", "olhos"}
BIG = set()
