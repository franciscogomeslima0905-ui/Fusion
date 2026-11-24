"""Reels GB GOBÊ — CONTROLE DE QUALIDADE (laboratório de inspeção). 1080x1920, 30 fps, 39 s. Sem narração.
Só afirma o que o cardápio da confeitaria já diz: casquinha crocante, interior macio e úmido, camada generosa de recheio,
Nutella de verdade (ou doce de leite), especial da casa, confeitaria artesanal."""
W, H, FPS = 1080, 1920, 30
DUR = 39.0

CEREJA = (179, 18, 46)      # #B3122E
CHOCOLATE = (74, 36, 24)    # #4A2418
CREME = (251, 244, 234)     # #FBF4EA
ROSA = (244, 166, 188)      # #F4A6BC

#            hook   classico  recheio  nutella  resultado  cardápio  link da bio
BOUNDS = [0.0, 3.8, 10.4, 15.4, 20.4, 25.4, 33.4, 39.0]
TRANS = 0.55

EV = dict(
    hook_logo=0.35, hook_t=(1.25, 1.75), hook_sub=2.5, hook_tag=0.3,
    s1_tag=4.15, s1_title=(4.2, 4.38), s1_scan=4.9, s1_callA=6.0, s1_stamp1=7.0, s1_callB=7.7, s1_stamp2=8.8,
    s2_tag=10.75, s2_title=(10.8, 10.98), s2_scan=11.5, s2_call=12.5, s2_stamp=13.4,
    s3_tag=15.75, s3_title=(15.8, 15.98), s3_scan=16.5, s3_call=17.5, s3_stamp=18.4,
    r_title=20.8, r_photos=(21.4, 21.75, 22.1, 22.45), r_stamp=23.4, r_sub=24.1,
    m_head=25.8, m_scan=(26.0, 27.2), m_rows=(27.5, 28.8, 30.1, 31.4), m_end=32.5,
    c_logo=33.9, c_lines=(34.6, 35.1, 35.65), c_arrow=36.4, c_sub=37.3,
)
CHECKS = [("CASQUINHA CROCANTE", EV["s1_stamp1"]), ("INTERIOR MACIO E ÚMIDO", EV["s1_stamp2"]),
          ("RECHEIO GENEROSO", EV["s2_stamp"]), ("NUTELLA DE VERDADE", EV["s3_stamp"])]
STAMPS = [EV["s1_stamp1"], EV["s1_stamp2"], EV["s2_stamp"], EV["s3_stamp"], EV["r_stamp"]] + [t + 0.45 for t in EV["m_rows"]]
