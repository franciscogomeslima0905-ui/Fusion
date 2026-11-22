"""Reels GB GOBÊ — SABORES em colagem de papel / stop-motion. 1080x1920, 30 fps, 33 s. Sem narração."""
W, H, FPS = 1080, 1920, 30
DUR = 33.0

CEREJA = (179, 18, 46)      # #B3122E
CHOCOLATE = (74, 36, 24)    # #4A2418
CREME = (251, 244, 234)     # #FBF4EA
ROSA = (244, 166, 188)      # #F4A6BC

#            gancho  clássico  recheadíssimo  nutella  kinder  pedir
BOUNDS = [0.0, 3.4, 8.6, 14.6, 20.2, 26.0, 33.0]
TRANS = 0.36                      # tempo da "virada de página" entre cenas
CORNER = ["cereja", "creme", "chocolate", "creme", "cereja", None]   # selo do canto por cena (None = escondido)

EV = dict(                         # instantes dos efeitos (usados também no áudio)
    a_lines=(0.10, 0.50, 0.90), a_photos=(1.25, 1.55, 1.85, 2.15), a_scribble=2.35,
    b_num=3.85, b_title=3.95, b_photo=4.35, b_strips=(5.0, 5.7), b_arrow=6.4,
    c_num=9.05, c_title=9.15, c_photo=9.55, c_sw=(10.8, 11.8, 12.8),
    d_num=15.05, d_title=15.15, d_photo=15.55, d_sw=(16.9, 18.2),
    e_star=20.6, e_title=20.9, e_photo=21.3, e_strips=(22.4, 23.1),
    f_logo=26.45, f_t1=27.0, f_t2=27.45, f_arrow=28.2, f_tag=29.4, f_thumbs=(30.2, 30.5, 30.8, 31.1),
)
