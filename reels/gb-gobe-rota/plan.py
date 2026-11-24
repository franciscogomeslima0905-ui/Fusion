"""Reels GB GOBÊ — ONDE SOMOS E ATÉ ONDE ENTREGAMOS (linha de metrô GB GOBÊ). 1080x1920, 30 fps, 31 s. Sem narração.
Só afirma o que a confeitaria informou: somos de Tramandaí - RS; entregamos na cidade e em Imbé."""
W, H, FPS = 1080, 1920, 30
DUR = 31.0

CEREJA = (179, 18, 46)      # #B3122E
CHOCOLATE = (74, 36, 24)    # #4A2418
CREME = (251, 244, 234)     # #FBF4EA
ROSA = (244, 166, 188)      # #F4A6BC

#            hook   somos   rota    áreas   link da bio
BOUNDS = [0.0, 3.6, 9.0, 19.0, 25.0, 31.0]
TRANS = 0.75                                    # íris circular entre cenas
IRIS = [(540, 1400), (540, 1500), (400, 620), (540, 1100)]   # centro de cada íris (pin, mar, Imbé, ...)
CORNER = ["creme", "cereja", "chocolate", "chocolate", None]       # selo do canto por cena (None = escondido)

EV = dict(
    h_lines=(0.15, 0.55, 0.95, 1.35), h_pin=2.0, h_land=2.5,
    s_sun=3.9, s_pre=4.15, s_word=4.45, s_rs=5.5, s_pin=5.9,
    m_title=9.4, m_map=9.8, m_A=10.9, m_token=11.6, m_B=14.2, m_cross=14.7, m_C=16.9,
    b_head=19.4, b_board1=19.9, b_check1=20.9, b_board2=21.8, b_check2=22.8, b_foot=23.7,
    c_logo=25.45, c_l1=26.2, c_l2=27.2, c_hl=27.2, c_arrow=29.0, c_foot=29.7,
)
# Rota (coordenadas da tela): A = confeitaria (Tramandaí), B = entrega em Tramandaí, C = Imbé
ROUTE = [(250, 1450), (250, 1130), (400, 980), (400, 700), (400, 630)]
STATION_A, STATION_B, STATION_C = 0.0, 0.33, 1.0
