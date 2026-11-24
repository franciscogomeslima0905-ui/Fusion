"""Reels GB GOBÊ — "Linha GB GOBÊ": de onde somos (Tramandaí - RS) e até onde entregamos (na cidade e em Imbé).
Gráfico chapado estilo mapa de metrô, transições em íris circular, pin de localização.
Uso: python3 build.py <pasta-de-trabalho> <saida.mp4>   |   python3 build.py <pasta> <pasta-pngs> --stills 1 5 8.5 ...
"""
import math, os, subprocess, sys, zlib
os.environ.setdefault("OMP_NUM_THREADS", "1")
from functools import lru_cache
from multiprocessing import Pool

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

from plan import *

HERE = os.path.dirname(os.path.abspath(__file__))
WORK, OUT = sys.argv[1], sys.argv[2]
STILLS = [float(x) for x in sys.argv[sys.argv.index("--stills") + 1:]] if "--stills" in sys.argv else None

F_DISP = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
F_XB = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
F_SERIF_BI = "/usr/share/fonts/truetype/crosextra/Caladea-BoldItalic.ttf"
DEEP = (150, 10, 38)          # cereja mais escuro (ondas)
LAND = (241, 229, 213)        # quarteirões do mapa


@lru_cache(None)
def fnt(path, size):
    return ImageFont.truetype(path, size)


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def lerp(a, b, t):
    return a + (b - a) * t


def ease_out(x):
    return 1 - (1 - clamp(x)) ** 3


def ease_io(x):
    x = clamp(x)
    return x * x * (3 - 2 * x)


def ease_back(x, k=1.7):
    x = clamp(x)
    return 1 + (k + 1) * (x - 1) ** 3 + k * (x - 1) ** 2


def bounce_out(x):
    x = clamp(x)
    if x < 1 / 2.75:
        return 7.5625 * x * x
    if x < 2 / 2.75:
        x -= 1.5 / 2.75
        return 7.5625 * x * x + 0.75
    if x < 2.5 / 2.75:
        x -= 2.25 / 2.75
        return 7.5625 * x * x + 0.9375
    x -= 2.625 / 2.75
    return 7.5625 * x * x + 0.984375


def paste(dst, spr, x, y):
    x, y = int(round(x)), int(round(y))
    sx0, sy0 = max(0, -x), max(0, -y)
    sx1, sy1 = min(spr.width, dst.width - x), min(spr.height, dst.height - y)
    if sx1 <= sx0 or sy1 <= sy0:
        return
    dst.alpha_composite(spr.crop((sx0, sy0, sx1, sy1)), (x + sx0, y + sy0))


def blit(dst, spr, cx, cy, scale=1.0, rot=0.0, alpha=1.0, sy=None):
    if alpha <= 0.004 or scale <= 0.01:
        return
    if abs(rot) > 0.05:
        spr = spr.rotate(rot, Image.BICUBIC, expand=True)
    sy = scale if sy is None else sy
    if abs(scale - 1) > 0.002 or abs(sy - 1) > 0.002:
        spr = spr.resize((max(1, int(spr.width * scale)), max(1, int(spr.height * sy))), Image.BILINEAR)
    if alpha < 0.996:
        spr = spr.copy()
        spr.putalpha(spr.getchannel("A").point(lambda v: int(v * alpha)))
    paste(dst, spr, cx - spr.width / 2, cy - spr.height / 2)


@lru_cache(None)
def txt(s, path, size, color, track=0):
    f = fnt(path, size)
    asc, desc = f.getmetrics()
    w = int(sum(f.getlength(c) + track for c in s) - track) + 24
    img = Image.new("RGBA", (w, asc + desc + 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x = 12
    for c in s:
        d.text((x, 12), c, font=f, fill=color + (255,))
        x += f.getlength(c) + track
    return img


@lru_cache(None)
def logo(name, size):
    return Image.open(os.path.join(HERE, "assets", f"selo-{name}.png")).convert("RGBA").resize((size, size), Image.LANCZOS)


def flat(color):
    return Image.new("RGBA", (W, H), color + (255,))


# ------------------------------------------------------------------ pin de localização
@lru_cache(None)
def pin_sprite(size, fill, hole, ss=3):
    S = size * ss
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = S * 0.34
    cx, cy = S / 2, S * 0.38
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill + (255,))
    d.polygon([(cx - r * 0.93, cy + r * 0.38), (cx + r * 0.93, cy + r * 0.38), (cx, S * 0.97)], fill=fill + (255,))
    d.ellipse([cx - r * 0.42, cy - r * 0.42, cx + r * 0.42, cy + r * 0.42], fill=hole + (255,))
    return img.resize((size, size), Image.LANCZOS)


def pin_drop(fr, t, t0, x, y_land, size, fill, hole, rings=True, ring_col=CREME):
    """pin cai do alto, quica e deixa ondas de choque"""
    x_ = (t - t0) / 0.75
    if x_ < 0:
        return
    k = bounce_out(x_)
    y_tip = lerp(-300, y_land, k)
    # sombra no chão
    sh = Image.new("RGBA", (int(size * 1.2), int(size * 0.34)), (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse([0, 0, sh.width - 1, sh.height - 1], fill=(30, 10, 8, 90))
    blit(fr, sh, x, y_land + 6, 0.5 + 0.5 * clamp(k), 0, clamp(x_ * 2))
    squash = 1.0
    if 0.62 < x_ < 0.8:
        squash = 1 - 0.12 * math.sin((x_ - 0.62) / 0.18 * math.pi)
    spr = pin_sprite(size, fill, hole)
    blit(fr, spr, x, y_tip - size * 0.47 * squash, 1.0 / max(squash, 0.01) ** 0.2, 0, 1.0, squash)
    if rings and x_ > 0.62:
        lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(lay)
        for i in range(3):
            e = clamp((t - (t0 + 0.55 + i * 0.28)) / 1.1)
            if 0 < e < 1:
                r = 40 + e * 300
                d.ellipse([x - r, y_land - r * 0.34, x + r, y_land + r * 0.34], outline=ring_col + (int(210 * (1 - e)),), width=6)
        fr.alpha_composite(lay)


# ------------------------------------------------------------------ mapa estilizado (fora de escala)
def _make_map():
    """terra com quarteirões, rio, oceano a leste e a ponte (desenhado 2x para suavizar)"""
    S = 2
    img = Image.new("RGBA", (W * S, H * S), CREME + (255,))
    d = ImageDraw.Draw(img)
    rng = np.random.default_rng(4)
    for gx in range(-30, 1000, 96):
        for gy in range(380, 1600, 96):
            if abs(gy - 930) < 80 or gx > 800:
                continue
            w, h = rng.uniform(58, 80), rng.uniform(58, 80)
            ox, oy = rng.uniform(0, 10), rng.uniform(0, 10)
            d.rounded_rectangle([(gx + ox) * S, (gy + oy) * S, (gx + ox + w) * S, (gy + oy + h) * S], 10 * S, fill=LAND + (255,))
    # oceano (borda ondulada) à direita
    pts = [(960 + 18 * math.sin(y * 0.018) + 10 * math.sin(y * 0.047), y) for y in range(300, 1700, 12)]
    d.polygon([(x * S, y * S) for x, y in pts] + [(W * S, 1700 * S), (W * S, 300 * S)], fill=(252, 206, 220, 255))
    # rio Tramandaí: faixa que corre até o mar
    top = [(x, 925 + 26 * math.sin(x * 0.0085 + 0.4) - 40) for x in range(-20, 980, 14)]
    bot = [(x, 925 + 26 * math.sin(x * 0.0085 + 0.4) + 40) for x in range(980, -21, -14)]
    d.polygon([(x * S, y * S) for x, y in top + bot], fill=ROSA + (255,))
    return img.resize((W, H), Image.LANCZOS)


MAP_BASE = _make_map()


@lru_cache(None)
def map_with_labels():
    img = MAP_BASE.copy()
    d = ImageDraw.Draw(img)
    # nomes das cidades, grandes e discretos
    for s, y in (("IMBÉ", 585), ("TRAMANDAÍ", 1290)):
        t = txt(s, F_DISP, 190 if s == "IMBÉ" else 130, (234, 218, 200), -4)
        img.alpha_composite(t, (int(540 - t.width / 2 + 120), int(y - t.height / 2)))
    # rótulos do rio e do mar
    rl = txt("RIO TRAMANDAÍ", F_XB, 26, (255, 242, 246), 9)
    img.alpha_composite(rl, (560, 910))
    ol = txt("OCEANO ATLÂNTICO", F_XB, 24, (214, 120, 150), 8).rotate(90, expand=True)
    img.alpha_composite(ol, (1010, 1270))
    # rosa-dos-ventos (norte para cima)
    cx, cy = 905, 500
    d.ellipse([cx - 44, cy - 44, cx + 44, cy + 44], fill=CREME + (255,), outline=CHOCOLATE + (255,), width=5)
    d.polygon([(cx, cy - 36), (cx + 14, cy + 6), (cx, cy - 4), (cx - 14, cy + 6)], fill=CEREJA + (255,))
    nt = txt("N", F_DISP, 30, CHOCOLATE)
    img.alpha_composite(nt, (cx - nt.width // 2, cy + 8))
    fn = txt("MAPA ILUSTRATIVO · FORA DE ESCALA", F_XB, 22, (170, 140, 128), 3)
    img.alpha_composite(fn, (int(540 - fn.width / 2), 1585))
    return img


def route_len():
    return sum(math.dist(a, b) for a, b in zip(ROUTE, ROUTE[1:]))


def route_point(dist):
    acc = 0.0
    for a, b in zip(ROUTE, ROUTE[1:]):
        sl = math.dist(a, b)
        if acc + sl >= dist:
            f = (dist - acc) / sl
            return (a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f)
        acc += sl
    return ROUTE[-1]


def route_pts_upto(dist):
    out = [ROUTE[0]]
    acc = 0.0
    for a, b in zip(ROUTE, ROUTE[1:]):
        sl = math.dist(a, b)
        if acc + sl <= dist:
            out.append(b); acc += sl
        else:
            f = (dist - acc) / sl
            out.append((a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f))
            break
    return out


def draw_route(fr, d_prog, alpha=1.0):
    """trilho (cinza-rosado) + trecho já percorrido em cereja; suavizado com supersampling"""
    S = 2
    x0, y0, x1, y1 = 120, 520, 640, 1520
    lay = Image.new("RGBA", ((x1 - x0) * S, (y1 - y0) * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)

    def poly(pts, col, w):
        P = [((x - x0) * S, (y - y0) * S) for x, y in pts]
        d.line(P, fill=col + (255,), width=int(w * S), joint="curve")
        for (px, py) in P:
            r = w * S / 2
            d.ellipse([px - r, py - r, px + r, py + r], fill=col + (255,))

    poly(ROUTE, (226, 206, 190), 38)
    if d_prog > 0:
        poly(route_pts_upto(d_prog), CEREJA, 30)
    # ponte sobre o rio (guarda-corpos)
    for off in (-27, 27):
        a = (400 + off, 905); b = (400 + off, 985)
        d.line([((a[0] - x0) * S, (a[1] - y0) * S), ((b[0] - x0) * S, (b[1] - y0) * S)], fill=(255, 250, 244, 255), width=5 * S)
    lay = lay.resize((x1 - x0, y1 - y0), Image.LANCZOS)
    if alpha < 0.99:
        lay.putalpha(lay.getchannel("A").point(lambda v: int(v * alpha)))
    fr.alpha_composite(lay, (x0, y0))


@lru_cache(None)
def station(r, ring, fill=CREME):
    S = 3
    size = (r * 2 + 12) * S
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c = size / 2
    d.ellipse([c - r * S, c - r * S, c + r * S, c + r * S], fill=ring + (255,))
    d.ellipse([c - r * S * 0.64, c - r * S * 0.64, c + r * S * 0.64, c + r * S * 0.64], fill=fill + (255,))
    return img.resize((r * 2 + 12, r * 2 + 12), Image.LANCZOS)


@lru_cache(None)
def label_pill(title, sub, accent=CEREJA, w=470):
    pad = 20
    h = 112
    img = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([pad, pad + 6, pad + w, pad + h + 6], 28, fill=(60, 20, 14, 90))
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(7)))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([pad, pad, pad + w, pad + h], 28, fill=(255, 252, 247, 255))
    d.rounded_rectangle([pad, pad, pad + 22, pad + h], 28, fill=accent + (255,))
    d.rectangle([pad + 12, pad, pad + 22, pad + h], fill=accent + (255,))
    img.alpha_composite(txt(title, F_DISP, 40, CHOCOLATE, -1), (pad + 30, pad + 8))
    img.alpha_composite(txt(sub, F_XB, 27, (140, 90, 76)), (pad + 30, pad + 62))
    return img


@lru_cache(None)
def token(size=150):
    S = 3
    n = size * S
    img = Image.new("RGBA", (n + 12 * S, n + 12 * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c = img.width / 2
    r = n / 2
    d.ellipse([c - r, c - r, c + r, c + r], fill=CREME + (255,))
    d.ellipse([c - r, c - r, c + r, c + r], outline=CEREJA + (255,), width=10 * S)
    # foto real do brownie (cardápio) dentro do selo
    menu = Image.open(os.path.join(HERE, "assets", "cardapio.jpg")).convert("RGB").crop((60, 205, 310, 450))
    ph = menu.crop((22, 22, 232, 202)).resize((int(r * 1.5), int(r * 1.5 * 180 / 210)), Image.LANCZOS)
    m = Image.new("L", ph.size, 0)
    ImageDraw.Draw(m).ellipse([0, 0, ph.width - 1, ph.height - 1], fill=255)
    img.paste(ph, (int(c - ph.width / 2), int(c - ph.height / 2)), m)
    return img.resize((img.width // S, img.height // S), Image.LANCZOS)


# ------------------------------------------------------------------ ondas
def waves(fr, t, y0, layers):
    S = 2
    h = H - y0 + 120
    lay = Image.new("RGBA", (W * S, h * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    for (col, dy, amp, lam, sp, ph) in layers:
        pts = [(x * S, (dy + amp * math.sin(2 * math.pi * x / lam + ph + t * sp)) * S + 60 * S) for x in range(0, W + 8, 8)]
        d.polygon(pts + [(W * S, h * S), (0, h * S)], fill=col + (255,))
    fr.alpha_composite(lay.resize((W, h), Image.LANCZOS), (0, y0 - 60))


# ------------------------------------------------------------------ cenas
def scene_hook(t):
    fr = flat(CEREJA)
    lines = (("DE ONDE", CREME, 165, 470), ("SOMOS", ROSA, 190, 640), ("E ATÉ ONDE", CREME, 130, 800), ("ENTREGAMOS?", ROSA, 130, 935))
    for (s, col, sz, y), t0 in zip(lines, EV["h_lines"]):
        k = ease_back((t - t0) / 0.55)
        if k <= 0:
            continue
        blit(fr, txt(s, F_DISP, sz, col, -3), 540 - (1 - clamp(k)) * 700, y, 1, 0, clamp(k * 2))
    pin_drop(fr, t, EV["h_pin"], 540, 1480, 280, CREME, CEREJA)
    return fr


def scene_somos(t):
    fr = flat(CREME)
    ks = ease_out((t - EV["s_sun"]) / 0.9)
    sun = Image.new("RGBA", (520, 520), (0, 0, 0, 0))
    ImageDraw.Draw(sun).ellipse([10, 10, 510, 510], fill=ROSA + (255,))
    blit(fr, sun, 540, 1560 - 330 * ks, 1, 0, 1)
    waves(fr, t, 1320, [(CEREJA, 120, 26, 420, 1.6, 0.0), (CHOCOLATE, 215, 24, 360, -1.9, 1.4), (DEEP, 310, 22, 320, 2.2, 2.6)])
    k = ease_out((t - EV["s_pre"]) / 0.5)
    if k > 0:
        blit(fr, txt("SOMOS DE", F_DISP, 82, CHOCOLATE, 4), 540, 500 + (1 - k) * 40, 1, 0, k)
    # TRAMANDAÍ: letras que sobem uma a uma
    word, size = "TRAMANDAÍ", 152
    f = fnt(F_DISP, size)
    widths = [f.getlength(c) - 3 for c in word]
    total = sum(widths)
    x = 540 - total / 2
    for i, (c, wd) in enumerate(zip(word, widths)):
        kk = ease_back((t - EV["s_word"] - 0.06 * i) / 0.5)
        if kk > 0:
            blit(fr, txt(c, F_DISP, size, CEREJA, 0), x + wd / 2 + 12, 760 + (1 - clamp(kk)) * 220, 1, 0, clamp(kk * 2))
        x += wd
    k = ease_back((t - EV["s_rs"]) / 0.5)
    if k > 0:
        pill = Image.new("RGBA", (260, 130), (0, 0, 0, 0))
        d = ImageDraw.Draw(pill)
        d.rounded_rectangle([0, 0, 259, 129], 65, fill=CHOCOLATE + (255,))
        d.text((130, 68), "RS", font=fnt(F_DISP, 84), fill=CREME + (255,), anchor="mm")
        blit(fr, pill, 540, 925, clamp(k), 0, clamp(k * 2))
    # pin flutuando sobre a palavra
    kp = ease_back((t - EV["s_pin"]) / 0.6)
    if kp > 0:
        bob = 12 * math.sin((t - EV["s_pin"]) * 3.2)
        blit(fr, pin_sprite(150, CEREJA, CREME), 540, 625 + bob - 40 * (1 - clamp(kp)), clamp(kp), 0, clamp(kp * 2))
    return fr


def scene_rota(t):
    fr = flat(CREME)
    ka = ease_out((t - EV["m_map"]) / 0.7)
    if ka > 0:
        m = map_with_labels().copy()
        if ka < 0.99:
            m.putalpha(m.getchannel("A").point(lambda v: int(v * ka)))
        fr.alpha_composite(m)
    kt = ease_out((t - EV["m_title"]) / 0.55)
    if kt > 0:
        blit(fr, txt("NOSSA ROTA", F_DISP, 100, CEREJA, 0), 580, 290 + (1 - kt) * 40, 1, 0, kt)
        blit(fr, txt("DE ENTREGA", F_DISP, 100, CHOCOLATE, 0), 580, 395 + (1 - kt) * 40, 1, 0, kt)
    L = route_len()
    dB = 210.0
    # progresso do token: A -> B -> (pausa) -> C
    if t < EV["m_token"]:
        prog = 0.0
    elif t < EV["m_B"]:
        prog = dB * ease_io((t - EV["m_token"]) / (EV["m_B"] - EV["m_token"]))
    elif t < EV["m_cross"]:
        prog = dB
    elif t < EV["m_C"]:
        prog = lerp(dB, L, ease_io((t - EV["m_cross"]) / (EV["m_C"] - EV["m_cross"])))
    else:
        prog = L
    draw_route(fr, prog if t >= EV["m_token"] else 0.0, clamp(ka * 1.5))
    # estações
    A, B, C = ROUTE[0], route_point(dB), ROUTE[-1]
    kA = ease_back((t - EV["m_A"]) / 0.5)
    if kA > 0:
        blit(fr, station(40, CEREJA), A[0], A[1], clamp(kA), 0, clamp(kA * 2))
        blit(fr, logo("cereja", 64), A[0], A[1], clamp(kA), 0, clamp(kA * 2))
        blit(fr, label_pill("GB GOBÊ", "TRAMANDAÍ · RS  (AQUI SOMOS)", CEREJA, 500), A[0] + 345, A[1] + (1 - clamp(kA)) * 30, 1, 0, clamp(kA * 2))
        blit(fr, pin_sprite(86, CEREJA, CREME), A[0] - 78, A[1] - 52 + 6 * math.sin(t * 3), clamp(kA), 0, clamp(kA * 2))
    kB = ease_back((t - EV["m_B"]) / 0.5)
    if kB > 0:
        blit(fr, station(30, CHOCOLATE), B[0], B[1], clamp(kB), 0, clamp(kB * 2))
        blit(fr, label_pill("ENTREGAMOS", "NA CIDADE DE TRAMANDAÍ", CHOCOLATE, 500), B[0] + 340, B[1] + (1 - clamp(kB)) * 30, 1, 0, clamp(kB * 2))
    kC = ease_back((t - EV["m_C"]) / 0.5)
    if kC > 0:
        blit(fr, station(40, CHOCOLATE), C[0], C[1], clamp(kC), 0, clamp(kC * 2))
        blit(fr, label_pill("ENTREGAMOS", "EM IMBÉ", CHOCOLATE, 360), C[0] + 275, C[1] + (1 - clamp(kC)) * 30, 1, 0, clamp(kC * 2))
        blit(fr, pin_sprite(86, CHOCOLATE, CREME), C[0] - 78, C[1] - 52 + 6 * math.sin(t * 3), clamp(kC), 0, clamp(kC * 2))
    # o brownie viajando
    if EV["m_token"] - 0.3 < t:
        kk = ease_back((t - (EV["m_token"] - 0.3)) / 0.4)
        p = route_point(prog)
        bump = 1 + 0.06 * math.sin(t * 9) * (1 if EV["m_token"] <= t < EV["m_C"] and (t < EV["m_B"] or t > EV["m_cross"]) else 0)
        blit(fr, token(104), p[0], p[1], clamp(kk) * bump, 0, clamp(kk * 2))
    # chegada em Imbé: confete de bolinhas
    if t > EV["m_C"]:
        e = clamp((t - EV["m_C"]) / 1.0)
        rng = np.random.default_rng(3)
        d = ImageDraw.Draw(fr, "RGBA")
        for i in range(26):
            a = rng.uniform(0, 6.28); v = rng.uniform(90, 330)
            px, py = C[0] + math.cos(a) * v * e, C[1] + math.sin(a) * v * e + 160 * e * e
            r = rng.uniform(5, 11) * (1 - e * 0.5)
            col = (CEREJA, ROSA, CHOCOLATE)[i % 3]
            d.ellipse([px - r, py - r, px + r, py + r], fill=col + (int(255 * (1 - e)),))
    return fr


@lru_cache(None)
def board(small, big, fill):
    pad = 24
    w, h = 880, 330
    img = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([pad, pad + 10, pad + w, pad + h + 10], 44, fill=(60, 20, 14, 100))
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(9)))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([pad, pad, pad + w, pad + h], 44, fill=CREME + (255,))
    d.rounded_rectangle([pad + 12, pad + 12, pad + w - 12, pad + h - 12], 34, fill=fill + (255,))
    d.rounded_rectangle([pad + 30, pad + 30, pad + w - 30, pad + h - 30], 22, outline=CREME + (255,), width=4)
    sm = txt(small, F_XB, 50, CREME, 6)
    img.alpha_composite(sm, (int(pad + w / 2 - sm.width / 2), pad + 62))
    bg = txt(big, F_DISP, 122 if len(big) > 6 else 170, CREME, -2)
    img.alpha_composite(bg, (int(pad + w / 2 - bg.width / 2), pad + 138 if len(big) > 6 else pad + 120))
    return img


def check_badge(fr, t, t0, x, y):
    k = ease_back((t - t0) / 0.45, 2.2)
    if k <= 0:
        return
    S = 3
    n = 120 * S
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([6, 6, n - 6, n - 6], fill=ROSA + (255,), outline=CREME + (255,), width=10 * S // 3)
    d.line([(n * 0.28, n * 0.52), (n * 0.44, n * 0.68), (n * 0.74, n * 0.34)], fill=CHOCOLATE + (255,), width=14 * S // 3 + 4, joint="curve")
    blit(fr, img.resize((120, 120), Image.LANCZOS), x, y, clamp(k), -10 * (1 - clamp(k)), clamp(k * 2))


def scene_areas(t):
    fr = flat(ROSA)
    k = ease_out((t - EV["b_head"]) / 0.55)
    if k > 0:
        blit(fr, txt("NOSSA ÁREA", F_DISP, 100, CHOCOLATE, 0), 580, 430 + (1 - k) * 40, 1, 0, k)
        blit(fr, txt("DE ENTREGA", F_DISP, 100, CEREJA, 0), 580, 535 + (1 - k) * 40, 1, 0, k)
    for (small, big, fill, t0, tc, y, side) in (("ENTREGAMOS EM", "TRAMANDAÍ", CHOCOLATE, EV["b_board1"], EV["b_check1"], 880, -1), ("E TAMBÉM EM", "IMBÉ", CEREJA, EV["b_board2"], EV["b_check2"], 1260, 1)):
        kb = ease_back((t - t0) / 0.7)
        if kb > 0:
            bx = 540 + side * (1 - clamp(kb)) * 1000
            blit(fr, board(small, big, fill), bx, y, 1, side * -1.2, clamp(kb * 2))
            check_badge(fr, t, tc, 940, y - 140)
    kf = ease_back((t - EV["b_foot"]) / 0.6)
    if kf > 0:
        pill = Image.new("RGBA", (880, 120), (0, 0, 0, 0))
        d = ImageDraw.Draw(pill)
        d.rounded_rectangle([0, 0, 879, 119], 60, fill=CREME + (255,))
        t1 = txt("É ATÉ AQUI QUE A GENTE ENTREGA", F_XB, 38, CHOCOLATE, 1)
        pill.alpha_composite(t1, (int(440 - t1.width / 2), 28))
        blit(fr, pill, 540, 1560, clamp(kf), 0, clamp(kf * 2))
    return fr


def scene_link(t):
    fr = flat(CHOCOLATE)
    kl = ease_back((t - EV["c_logo"]) / 0.7)
    if kl > 0:
        ring = Image.new("RGBA", (560, 560), (0, 0, 0, 0))
        d = ImageDraw.Draw(ring)
        d.ellipse([10, 10, 549, 549], outline=ROSA + (255,), width=6)
        blit(fr, ring, 540, 480, clamp(kl) * (1 + 0.03 * math.sin(t * 3)), 0, clamp(kl * 2))
        blit(fr, logo("creme", 470), 540, 480, clamp(kl), 0, clamp(kl * 1.6))
    # frase escrita à mão: "GARANTA JÁ" + "NO LINK DA BIO" com marca-texto
    for (s, size, col, y, t0, dur) in (("GARANTA JÁ", 150, CREME, 880, EV["c_l1"], 0.9), ("NO LINK DA BIO", 118, CHOCOLATE, 1075, EV["c_l2"], 1.0)):
        p = clamp((t - t0) / dur)
        if p <= 0:
            continue
        spr = txt(s, F_DISP, size, col, -2)
        if col == CHOCOLATE:
            hl = Image.new("RGBA", (spr.width + 40, 150), (0, 0, 0, 0))
            hw = int(hl.width * ease_io(clamp((t - EV["c_hl"]) / 0.7)))
            ImageDraw.Draw(hl).rounded_rectangle([0, 14, max(hw, 1), 136], 24, fill=ROSA + (255,))
            blit(fr, hl, 540, y + 4, 1, -1.2)
        vis = int(spr.width * ease_io(p))
        if vis > 0:
            crop = spr.crop((0, 0, vis, spr.height))
            blit(fr, crop, 540 - spr.width / 2 + vis / 2 + 0, y, 1, 0, 1)
            if p < 1:
                d = ImageDraw.Draw(fr)
                nx = 540 - spr.width / 2 + vis
                d.rounded_rectangle([nx - 4, y - size * 0.45, nx + 4, y + size * 0.45], 4, fill=ROSA + (255,))
    ka = ease_out((t - EV["c_arrow"]) / 0.5)
    if ka > 0:
        bob = 14 * math.sin((t - EV["c_arrow"]) * 6)
        d = ImageDraw.Draw(fr)
        ax, ay = 540, 1330 - bob
        d.polygon([(ax, ay - 70 * ka), (ax + 62 * ka, ay), (ax + 22 * ka, ay), (ax + 22 * ka, ay + 70 * ka), (ax - 22 * ka, ay + 70 * ka), (ax - 22 * ka, ay), (ax - 62 * ka, ay)], fill=ROSA + (255,))
    kf = ease_out((t - EV["c_foot"]) / 0.6)
    if kf > 0:
        blit(fr, txt("TRAMANDAÍ · IMBÉ", F_XB, 44, CREME, 12), 540, 1530, 1, 0, kf)
    return fr


SCENES = [scene_hook, scene_somos, scene_rota, scene_areas, scene_link]


def scene_index(t):
    return max(i for i, b in enumerate(BOUNDS[:-1]) if t >= b)


def iris(prev, new, k, center, ring=CREME):
    """a cena nova abre em círculo a partir de `center`"""
    cx, cy = center
    maxr = math.hypot(max(cx, W - cx), max(cy, H - cy)) + 40
    R = ease_io(k) * maxr
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    a = np.clip((R - dist) + 0.5, 0, 1)[..., None]
    A, B = np.asarray(prev).astype(np.float32), np.asarray(new).astype(np.float32)
    out = A * (1 - a) + B * a
    rr = np.clip(1 - np.abs(dist - R) / 7.0, 0, 1)[..., None] * (1 if 0 < k < 1 else 0)
    out[..., :3] = out[..., :3] * (1 - rr) + np.array(ring, np.float32) * rr
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGBA")


def corner_logo(fr, t, idx):
    name = CORNER[idx]
    if name is None:
        return
    # troca de variante quando a íris passa
    if idx > 0 and t - BOUNDS[idx] < TRANS * 0.45:
        name = CORNER[idx - 1] or name
    sz = 142
    lay = Image.new("RGBA", (sz + 40, sz + 40), (0, 0, 0, 0))
    sh = Image.new("RGBA", lay.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse([22, 28, 22 + sz, 28 + sz], fill=(40, 12, 8, 70))
    lay.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6)))
    lay.alpha_composite(logo(name, sz), (20, 20))
    blit(fr, lay, 40 + sz / 2 + 0, 205 + sz / 2 + 0, 1, 0, clamp((t - 0.3) / 0.4))


_GR = None
_VIG = None


def post(fr, t):
    global _GR, _VIG
    if _GR is None:
        rng = np.random.default_rng(1)
        _GR = [rng.normal(0, 1.6, (H // 2, W // 2, 1)).astype(np.float32) for _ in range(5)]
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        d = np.sqrt(((xx - W / 2) / (W * 0.9)) ** 2 + ((yy - H / 2) / (H * 0.8)) ** 2)
        _VIG = (1 - 0.10 * np.clip(d - 0.4, 0, 1) ** 1.4)[..., None]
    arr = np.asarray(fr.convert("RGB"), np.float32) * _VIG
    arr += np.repeat(np.repeat(_GR[int(t * 10) % 5], 2, 0), 2, 1)
    return np.clip(arr, 0, 255).astype(np.uint8)


def frame(t):
    i = scene_index(t)
    fr = SCENES[i](t)
    if i > 0 and t - BOUNDS[i] < TRANS:
        prev = SCENES[i - 1](BOUNDS[i] - 0.001)
        ring = CREME if i in (1, 3) else CHOCOLATE
        fr = iris(prev, fr, (t - BOUNDS[i]) / TRANS, IRIS[i - 1], ring)
    corner_logo(fr, t, i)
    return post(fr, t)


def render_idx(i):
    return frame(i / FPS).tobytes()


if __name__ == "__main__":
    if STILLS:
        os.makedirs(OUT, exist_ok=True)
        for t in STILLS:
            Image.fromarray(frame(t)).save(os.path.join(OUT, f"t{t:06.2f}.png"))
            print("ok", t, flush=True)
        sys.exit(0)
    n = int(DUR * FPS)
    mix = os.path.join(WORK, "mix.wav")
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-"]
    if os.path.exists(mix):
        cmd += ["-i", mix, "-c:a", "aac", "-b:a", "192k", "-ar", "44100"]
    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", "-t", str(DUR), OUT]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    with Pool(4) as pool:
        for k, buf in enumerate(pool.imap(render_idx, range(n), chunksize=3)):
            ff.stdin.write(buf)
            if k % 60 == 0:
                print(f"{k}/{n}", flush=True)
    ff.stdin.close(); ff.wait()
    print("pronto", OUT)
