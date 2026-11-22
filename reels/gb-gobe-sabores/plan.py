"""Plano de tempo do Reels GB GOBÊ — SABORES (cardápio) — 1080x1920, 30 fps, 35 s. Sem narração."""
W, H, FPS = 1080, 1920, 30
DUR = 35.0

CEREJA = (179, 18, 46)      # #B3122E
CHOCOLATE = (74, 36, 24)    # #4A2418
CREME = (251, 244, 234)     # #FBF4EA
ROSA = (244, 166, 188)      # #F4A6BC

#            gancho  clássico recheadíssimo nutella/doce  kinder   pedir
BOUNDS = [0.0, 3.5, 8.5, 16.5, 22.5, 28.5, 35.0]
SCENE_NAMES = ["gancho", "classico", "recheadissimo", "nutella", "kinder", "pedir"]
WAVE_DUR = 1.4
WAVES = [(3.5, "down"), (8.5, "right"), (16.5, "left"), (22.5, "right"), (28.5, "down")]
# selo do canto por cena (variante que contrasta com o fundo); some na cena final
CORNER = [(0.0, "creme"), (3.5, "cereja"), (8.5, "creme"), (16.5, "creme"), (22.5, "chocolate"), (28.5, "creme")]
CORNER_HIDE = 28.9

EV = dict(
    pour=0.15,
    s2_open=4.4,
    s3_open=9.2, s3_switch=(9.2, 11.7, 14.1),       # meio amargo -> ao leite -> branco
    s4_open=17.0, s4_switch=(17.0, 19.9),           # nutella -> doce de leite
    s4_pour=(17.9, 20.4),
    s5_open=23.1, s5_pour=24.2, s5_kinder=25.0,
    s6_logo=29.3, s6_text=30.3, s6_cta=32.0,
)
