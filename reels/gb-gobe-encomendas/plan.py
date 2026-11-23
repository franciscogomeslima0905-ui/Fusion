"""Reels GB GOBÊ — COMO ENCOMENDAR (dias de pedido e entrega) + cardápio + link da bio.
Estilo colagem de papel / stop-motion. 1080x1920, 30 fps, 34 s. Sem narração."""
W, H, FPS = 1080, 1920, 30
DUR = 34.0

CEREJA = (179, 18, 46)      # #B3122E
CHOCOLATE = (74, 36, 24)    # #4A2418
CREME = (251, 244, 234)     # #FBF4EA
ROSA = (244, 166, 188)      # #F4A6BC

#            gancho  semana  fim de sem.  segunda  cardápio  link da bio
BOUNDS = [0.0, 3.6, 10.4, 16.0, 21.5, 28.5, 34.0]
TRANS = 0.36
CORNER = ["cereja", "chocolate", "creme", "creme", "cereja", None]

# Regras de encomenda (as que a confeitaria informou). Pedido feito em -> entrega em:
RULES = [("TERÇA", "QUARTA"), ("QUINTA", "SEXTA")]            # dia seguinte
WEEKEND = ("SÁBADO", "DOMINGO")                                # entrega no mesmo dia
MONDAY = ("DOMINGO", "SEGUNDA")                                # para entregar na segunda, pedir no domingo

# Cardápio (preços conforme a imagem do cardápio enviada)
MENU = [
    ("classico", ("BROWNIE",), "casquinha crocante, interior macio e úmido", "R$ 10,00"),
    ("recheadissimo", ("RECHEADÍSSIMO",), "meio amargo, ao leite ou branco", "R$ 13,90"),
    ("nutella", ("NUTELLA",), "ou doce de leite, mesmo preço", "R$ 15,90"),
    ("kinder", ("BRANCO &", "KINDER BUENO"), "especial da casa", "R$ 15,90"),
]

EV = dict(
    a_lines=(0.10, 0.50, 0.90), a_scribble=2.2, a_photos=(1.3, 1.6, 1.9, 2.2),
    b_title=3.95, b_row1=(4.6, 5.2, 5.9), b_row2=(7.0, 7.6, 8.3), b_strip=9.2,
    c_title=10.8, c_cards=(11.4, 12.1), c_burst=13.2, c_strip=14.4,
    d_title=16.4, d_cards=(17.2, 18.4), d_arrow=17.9, d_strips=(19.3, 19.9),
    e_title=21.9, e_rows=(22.8, 23.9, 25.0, 26.1),
    f_logo=28.95, f_t1=29.5, f_t2=29.95, f_arrow=30.7, f_strip=31.6, f_thumbs=(32.2, 32.45, 32.7, 32.95),
)
