"""Reels GB GOBÊ — Sabores em COLAGEM DE PAPEL (stop-motion), com as fotos reais do cardápio.
Uso: python3 build.py <pasta-de-trabalho> <saida.mp4>        (usa <pasta>/mix.wav se existir)
     python3 build.py <pasta-de-trabalho> <pasta-pngs> --stills 1 5 8.5 ...
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

F_BLACK = "/usr/share/fonts/opentype/inter/Inter-Black.otf"
F_XB = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
F_SERIF_BI = "/usr/share/fonts/truetype/crosextra/Caladea-BoldItalic.ttf"
PAPER_WHITE = (255, 251, 244)


@lru_cache(None)
def fnt(path, size):
    return ImageFont.truetype(path, size)


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def ease_back(x, k=1.9):
    x = clamp(x)
    return 1 + (k + 1) * (x - 1) ** 3 + k * (x - 1) ** 2


def stp(x, n):
    """quantiza 0..1 em n passos (movimento de stop-motion)"""
    return math.floor(clamp(x) * n) / n if x < 1 else 1.0


def popk(t, t0, dur=0.42, n=5):
    x = (t - t0) / dur
    if x <= 0:
        return 0.0
    return ease_back(stp(x, n))


def jit(t, seed, pos=2.2, rot=0.9, fps=10):
    r = np.random.default_rng(seed * 7919 + int(t * fps))
    return r.uniform(-pos, pos), r.uniform(-pos, pos), r.uniform(-rot, rot)


# ------------------------------------------------------------------ papel e sprites
def _make_paper():
    rng = np.random.default_rng(3)
    low = np.asarray(Image.fromarray((rng.random((H // 40, W // 40)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), np.float32) / 255
    fine = rng.normal(0, 1, (H, W)).astype(np.float32)
    img = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(img)
    for _ in range(1100):
        x, y, a, l = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(0, 6.28), rng.uniform(8, 30)
        d.line([x, y, x + l * math.cos(a), y + l * math.sin(a)], fill=int(rng.uniform(15, 55)), width=1)
    fib = np.asarray(img, np.float32) / 255 * 0.10
    return np.clip(0.972 + 0.022 * low + 0.012 * fine + fib, 0.88, 1.05)


PAPER = _make_paper()


@lru_cache(None)
def bg_paper(color):
    arr = np.array(color, np.float32)[None, None, :] * PAPER[..., None]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB").convert("RGBA")


def paste(dst, spr, x, y):
    x, y = int(round(x)), int(round(y))
    sx0, sy0 = max(0, -x), max(0, -y)
    sx1, sy1 = min(spr.width, dst.width - x), min(spr.height, dst.height - y)
    if sx1 <= sx0 or sy1 <= sy0:
        return
    dst.alpha_composite(spr.crop((sx0, sy0, sx1, sy1)), (x + sx0, y + sy0))


def blit(dst, spr, cx, cy, scale=1.0, rot=0.0, alpha=1.0):
    if alpha <= 0.004 or scale <= 0.01:
        return
    if abs(rot) > 0.05:
        spr = spr.rotate(rot, Image.BICUBIC, expand=True)
    if abs(scale - 1) > 0.002:
        spr = spr.resize((max(1, int(spr.width * scale)), max(1, int(spr.height * scale))), Image.BILINEAR)
    if alpha < 0.996:
        spr = spr.copy()
        spr.putalpha(spr.getchannel("A").point(lambda v: int(v * alpha)))
    paste(dst, spr, cx - spr.width / 2, cy - spr.height / 2)


def shadowed(img, off=(7, 11), blur=9, alpha=105, pad=30):
    """acrescenta sombra suave sob um recorte de papel"""
    out = Image.new("RGBA", (img.width + 2 * pad, img.height + 2 * pad), (0, 0, 0, 0))
    sh = Image.new("RGBA", out.size, (40, 14, 8, 0))
    sh.putalpha(Image.new("L", out.size, 0))
    a = Image.new("L", out.size, 0)
    a.paste(img.getchannel("A"), (pad + off[0], pad + off[1]))
    sh.putalpha(a.filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * alpha / 255)))
    out.alpha_composite(sh)
    out.alpha_composite(img, (pad, pad))
    return out


@lru_cache(None)
def cut_text(s, size, fill, squeeze=0.8, border=9, track=3, bcol=PAPER_WHITE, path=F_BLACK):
    """letras recortadas em papel: preenchimento + borda branca + sombra"""
    f = fnt(path, size)
    asc, desc = f.getmetrics()
    pad = border * 2 + 24
    w = int(sum(f.getlength(c) + track for c in s) - track)
    mask = Image.new("L", (w + 2 * pad, asc + desc + 2 * pad), 0)
    d = ImageDraw.Draw(mask)
    x = pad
    for c in s:
        d.text((x, pad), c, font=f, fill=255)
        x += f.getlength(c) + track
    if squeeze != 1:
        mask = mask.resize((int(mask.width * squeeze), mask.height), Image.LANCZOS)
    bm = mask.filter(ImageFilter.GaussianBlur(border / 1.7)).point(lambda v: 255 if v > 22 else 0)
    img = Image.new("RGBA", mask.size, (0, 0, 0, 0))
    img.paste(Image.new("RGBA", mask.size, bcol + (255,)), (0, 0), bm)
    img.paste(Image.new("RGBA", mask.size, fill + (255,)), (0, 0), mask)
    return shadowed(img, (6, 9), 8, 120)


@lru_cache(None)
def plain_text(s, size, fill, path=F_BLACK, squeeze=1.0, track=0):
    f = fnt(path, size)
    asc, desc = f.getmetrics()
    w = int(sum(f.getlength(c) + track for c in s) - track)
    img = Image.new("RGBA", (w + 40, asc + desc + 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x = 20
    for c in s:
        d.text((x, 20), c, font=f, fill=fill + (255,))
        x += f.getlength(c) + track
    if squeeze != 1:
        img = img.resize((int(img.width * squeeze), img.height), Image.LANCZOS)
    return img


@lru_cache(None)
def strip(text, size=40, fill=PAPER_WHITE, ink=CEREJA, seed=1, pad_x=44, pad_y=22):
    """tira de papel com pontas irregulares"""
    f = fnt(F_XB, size)
    w, h = int(f.getlength(text) * 0.92) + 2 * pad_x, size + 2 * pad_y
    rng = np.random.default_rng(seed)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pts = [(0, rng.uniform(0, 6))]
    for x in np.linspace(0, w, 9)[1:-1]:
        pts.append((x, rng.uniform(0, 4)))
    pts += [(w, rng.uniform(0, 8)), (w - rng.uniform(0, 7), h * 0.5)]
    pts += [(w, h - rng.uniform(0, 8))] + [(x, h - rng.uniform(0, 4)) for x in np.linspace(w, 0, 9)[1:-1]] + [(0, h - rng.uniform(0, 6)), (rng.uniform(0, 7), h * 0.5)]
    d.polygon(pts, fill=fill + (255,))
    t = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(t).text((w / 2, h / 2 + 1), text, font=f, fill=ink + (255,), anchor="mm")
    t = t.resize((int(w * 0.92), h), Image.LANCZOS)
    img.alpha_composite(t, ((w - t.width) // 2, 0))
    return shadowed(img, (5, 8), 7, 100)


@lru_cache(None)
def torn_block(w, h, color, seed=1, amp=16):
    rng = np.random.default_rng(seed)
    pts = []
    for x in np.linspace(0, w, 28): pts.append((x, rng.uniform(0, amp)))
    for y in np.linspace(0, h, 18)[1:]: pts.append((w - rng.uniform(0, amp), y))
    for x in np.linspace(w, 0, 28)[1:]: pts.append((x, h - rng.uniform(0, amp)))
    for y in np.linspace(h, 0, 18)[1:-1]: pts.append((rng.uniform(0, amp), y))
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(img).polygon(pts, fill=color + (255,))
    tex = (PAPER[:h, :w] if h <= H and w <= W else PAPER[:H, :W])
    arr = np.asarray(img).astype(np.float32)
    arr[: tex.shape[0], : tex.shape[1], :3] *= tex[..., None]
    return shadowed(Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA"), (7, 12), 11, 90)


@lru_cache(None)
def tape(w=190, h=62, color=(255, 214, 224), seed=1):
    rng = np.random.default_rng(seed)
    pts = [(0, 0)] + [(x, 0 + (4 if i % 2 else 0)) for i, x in enumerate(np.linspace(0, w, 12)[1:-1])] + [(w, 0)]
    pts = [(0, 6)] + [(x, rng.uniform(0, 5)) for x in np.linspace(14, w - 14, 10)] + [(w, 6), (w - 8, h / 2), (w, h - 6)]
    pts += [(x, h - rng.uniform(0, 5)) for x in np.linspace(w - 14, 14, 10)] + [(0, h - 6), (8, h / 2)]
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(img).polygon(pts, fill=color + (205,))
    return shadowed(img, (3, 5), 4, 60, 12)


# ------------------------------------------------------------------ fotos reais do cardápio (adesivos ovais)
_MENU = Image.open(os.path.join(HERE, "assets", "cardapio.jpg")).convert("RGB")
_SPEC = {"classico": ((60, 205, 310, 450), (128, 112, 100, 84)), "recheadissimo": ((650, 445, 905, 690), (125, 112, 104, 90)),
         "nutella": ((60, 690, 310, 935), (121, 106, 106, 88)), "kinder": ((650, 930, 905, 1170), (118, 124, 100, 80))}


@lru_cache(None)
def photo(name, width, crescent=ROSA):
    box, (cx, cy, rx, ry) = _SPEC[name]
    c = _MENU.crop(box)
    s = 4
    m = Image.new("L", (c.width * s, c.height * s), 0)
    ImageDraw.Draw(m).ellipse([(cx - rx) * s, (cy - ry) * s, (cx + rx) * s, (cy + ry) * s], fill=255)
    m = m.resize(c.size, Image.LANCZOS)
    c = c.convert("RGBA"); c.putalpha(m)
    c = c.crop((cx - rx - 2, cy - ry - 2, cx + rx + 2, cy + ry + 2))
    k = width / c.width
    c = c.resize((width, int(c.height * k)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 70, 2))
    b = 13
    pad = b + 40
    bm = c.getchannel("A").filter(ImageFilter.GaussianBlur(b / 1.6)).point(lambda v: 255 if v > 22 else 0)
    out = Image.new("RGBA", (c.width + 2 * pad, c.height + 2 * pad), (0, 0, 0, 0))
    cres = Image.new("L", out.size, 0)
    cres.paste(bm, (pad + 20, pad + 24))
    out.paste(Image.new("RGBA", out.size, crescent + (255,)), (0, 0), cres)          # meia-lua atrás, como no cardápio
    base = Image.new("L", out.size, 0)
    base.paste(bm, (pad, pad))
    out.paste(Image.new("RGBA", out.size, PAPER_WHITE + (255,)), (0, 0), base)
    out.alpha_composite(c, (pad, pad))
    return shadowed(out, (6, 10), 9, 110, 10)


@lru_cache(None)
def dollop(color, r=74, seed=1):
    rng = np.random.default_rng(seed)
    n = 26
    ang = np.linspace(0, 2 * math.pi, n, endpoint=False)
    rad = r * (0.92 + 0.10 * rng.random(n))
    pts = [(r + 20 + rr * math.cos(a), r + 20 + rr * 0.92 * math.sin(a)) for a, rr in zip(ang, rad)]
    img = Image.new("RGBA", (2 * r + 40, 2 * r + 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    big = [(r + 20 + (p[0] - r - 20) * 1.14, r + 20 + (p[1] - r - 20) * 1.14) for p in pts]
    d.polygon(big, fill=PAPER_WHITE + (255,))
    d.polygon(pts, fill=color + (255,))
    hi = tuple(min(255, int(c + 60)) for c in color)
    d.arc([r + 20 - r * 0.62, r + 20 - r * 0.62, r + 20 + r * 0.62, r + 20 + r * 0.62], 200, 262, fill=hi + (255,), width=10)
    return shadowed(img, (5, 8), 7, 100)


@lru_cache(None)
def burst(lines, size=300, color=CEREJA):
    n = 20
    r = size / 2
    pts = []
    for i in range(2 * n):
        a = math.pi * i / n
        rr = r if i % 2 == 0 else r * 0.84
        pts.append((r + 20 + rr * math.cos(a), r + 20 + rr * math.sin(a)))
    img = Image.new("RGBA", (size + 40, size + 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(r + 20 + (x - r - 20) * 1.07, r + 20 + (y - r - 20) * 1.07) for x, y in pts], fill=PAPER_WHITE + (255,))
    d.polygon(pts, fill=color + (255,))
    f = fnt(F_BLACK, 46)
    y0 = r + 20 - (len(lines) - 1) * 28
    for i, ln in enumerate(lines):
        d.text((r + 20, y0 + i * 56), ln, font=f, fill=CREME + (255,), anchor="mm")
    return shadowed(img, (6, 9), 8, 110)


@lru_cache(None)
def logo(name, size):
    return Image.open(os.path.join(HERE, "assets", f"selo-{name}.png")).convert("RGBA").resize((size, size), Image.LANCZOS)


# ------------------------------------------------------------------ rabiscos de caneta (desenhados ao vivo)
def _wob(pts, t, seed, amp=2.2, fps=8):
    r = np.random.default_rng(seed * 131 + int(t * fps))
    return [(x + r.uniform(-amp, amp), y + r.uniform(-amp, amp)) for x, y in pts]


def scribble(fr, pts, prog, color, width, t, seed=1):
    """desenha a linha progressivamente (0..1) com tremidinha de caneta"""
    if prog <= 0.01:
        return
    pts = _wob(pts, t, seed)
    seg = [math.dist(a, b) for a, b in zip(pts, pts[1:])]
    total = sum(seg)
    target = total * clamp(prog)
    out, acc = [pts[0]], 0.0
    for a, b, sl in zip(pts, pts[1:], seg):
        if acc + sl <= target:
            out.append(b); acc += sl
        else:
            f = (target - acc) / sl
            out.append((a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f))
            break
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.line(out, fill=color + (255,), width=width, joint="curve")
    for p in (out[0], out[-1]):
        d.ellipse([p[0] - width / 2, p[1] - width / 2, p[0] + width / 2, p[1] + width / 2], fill=color + (255,))
    fr.alpha_composite(lay)


def wavy_line(x0, x1, y, n=22, amp=7):
    return [(x0 + (x1 - x0) * i / n, y + math.sin(i * 1.3) * amp) for i in range(n + 1)]


def arrow_pts(p0, p1, p2, n=26):
    pts = []
    for i in range(n + 1):
        u = i / n
        pts.append(((1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0], (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1]))
    return pts


def arrow(fr, p0, p1, p2, prog, color, width, t, seed=2):
    pts = arrow_pts(p0, p1, p2)
    scribble(fr, pts, min(prog, 1.0) * 0.92, color, width, t, seed)
    if prog > 0.9:
        ang = math.atan2(p2[1] - pts[-3][1], p2[0] - pts[-3][0])
        k = clamp((prog - 0.9) / 0.1)
        for da in (2.5, -2.5):
            a = ang + math.pi + da * 0.34
            head = [p2, (p2[0] + 58 * k * math.cos(a), p2[1] + 58 * k * math.sin(a))]
            scribble(fr, head, 1.0, color, width, t, seed + 5)


def sparkle_doodle(fr, x, y, size, color, t, seed):
    dx, dy, _ = jit(t, seed, 2.0)
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    s = size * (0.8 + 0.2 * (int(t * 6 + seed) % 2))
    for sx, sy in ((s, 0), (0, s), (s * 0.55, s * 0.55), (s * 0.55, -s * 0.55)):
        d.line([(x + dx - sx, y + dy - sy), (x + dx + sx, y + dy + sy)], fill=color + (255,), width=7)
    fr.alpha_composite(lay)


# ------------------------------------------------------------------ cenas
def put(fr, spr, cx, cy, t, seed, rot=0.0, k=1.0, pos=2.2, jr=0.9):
    dx, dy, dr = jit(t, seed, pos, jr)
    blit(fr, spr, cx + dx, cy + dy, k, rot + dr)


def scene_a(fr, t):
    fr.alpha_composite(bg_paper(CREME))
    kb = popk(t, 0.0, 0.5)
    put(fr, torn_block(1000, 640, ROSA, 3), 540, 690, t, 1, -1.5, kb)
    for i, (txt, sz, col, y, t0) in enumerate((("QUAL É O", 150, CHOCOLATE, 505, EV["a_lines"][0]), ("SEU SABOR", 200, CEREJA, 680, EV["a_lines"][1]), ("FAVORITO?", 170, CHOCOLATE, 850, EV["a_lines"][2]))):
        k = popk(t, t0, 0.38)
        put(fr, cut_text(txt, sz, col), 540, y, t, 10 + i, (-1.5, 1.2, -0.8)[i], k)
    scribble(fr, wavy_line(250, 830, 945), (t - EV["a_scribble"]) / 0.7, CEREJA, 14, t, 4)
    pos = ((290, 1115, -5, "classico"), (790, 1150, 4, "recheadissimo"), (290, 1440, 3.5, "nutella"), (790, 1465, -4, "kinder"))
    for (x, y, r, nm), t0 in zip(pos, EV["a_photos"]):
        k = popk(t, t0, 0.42)
        put(fr, photo(nm, 385), x, y, t, zlib.crc32(nm.encode()) % 50, r, k)


def scene_b(fr, t):
    fr.alpha_composite(bg_paper(CEREJA))
    put(fr, plain_text("01", 520, (158, 12, 38)), 830, 540, t, 20, 4, popk(t, EV["b_num"], 0.4), 1.5)
    put(fr, cut_text("O CLÁSSICO", 150, CHOCOLATE), 540, 490, t, 21, -1.2, popk(t, EV["b_title"], 0.4))
    for i, (txt, y, r) in enumerate((("CASQUINHA CROCANTE", 650, -2.5), ("INTERIOR MACIO E ÚMIDO", 745, 2.0))):
        put(fr, strip(txt, 42, PAPER_WHITE, CEREJA, 3 + i), 540, y, t, 22 + i, r, popk(t, EV["b_strips"][i], 0.38))
    put(fr, tape(190, 62, (255, 214, 224), 2), 500, 935, t, 25, -8, popk(t, EV["b_photo"] + 0.1, 0.3))
    put(fr, photo("classico", 560, CREME), 560, 1225, t, 24, -3, popk(t, EV["b_photo"], 0.45))
    arrow(fr, (900, 830), (1020, 990), (870, 1080), (t - EV["b_arrow"]) / 0.9, CREME, 12, t, 6)
    sparkle_doodle(fr, 150, 1080, 26, CREME, t, 1) if t > EV["b_photo"] + 0.5 else None
    sparkle_doodle(fr, 940, 1450, 22, ROSA, t, 2) if t > EV["b_photo"] + 0.8 else None


def swatch_row(fr, t, items, ts, y, bg_ink):
    xs = {2: (380, 700), 3: (240, 540, 840)}[len(items)]
    for (name, col), t0, x in zip(items, ts, xs):
        k = popk(t, t0, 0.4)
        put(fr, dollop(col, 70, zlib.crc32(name.encode()) % 40), x, y, t, zlib.crc32(name.encode()) % 60, 0, k)
        lab = plain_text(name, 34, bg_ink, F_XB, 0.92, 2)
        blit(fr, lab, x, y + 118, clamp(k), 0, clamp(k * 1.5))


def scene_c(fr, t):
    fr.alpha_composite(bg_paper(ROSA))
    put(fr, plain_text("02", 520, (232, 130, 158)), 830, 540, t, 30, 4, popk(t, EV["c_num"], 0.4), 1.5)
    put(fr, cut_text("RECHEADÍSSIMO", 135, CHOCOLATE), 540, 490, t, 31, 1.2, popk(t, EV["c_title"], 0.4))
    put(fr, strip("RECHEIO CREMOSO POR CIMA", 40, PAPER_WHITE, CEREJA, 6), 540, 640, t, 32, -2, popk(t, EV["c_title"] + 0.6, 0.38))
    put(fr, tape(190, 62, (255, 251, 244), 4), 570, 775, t, 35, 6, popk(t, EV["c_photo"] + 0.1, 0.3))
    put(fr, photo("recheadissimo", 540, CREME), 540, 1060, t, 34, 2.5, popk(t, EV["c_photo"], 0.45))
    swatch_row(fr, t, (("MEIO AMARGO", (62, 30, 19)), ("AO LEITE", (166, 104, 64)), ("BRANCO", (250, 242, 224))), EV["c_sw"], 1440, CHOCOLATE)


def scene_d(fr, t):
    fr.alpha_composite(bg_paper(CHOCOLATE))
    put(fr, plain_text("03", 520, (100, 54, 40)), 830, 540, t, 40, 4, popk(t, EV["d_num"], 0.4), 1.5)
    put(fr, cut_text("NUTELLA", 230, CHOCOLATE), 540, 520, t, 41, -1.2, popk(t, EV["d_title"], 0.4))
    put(fr, strip("DE VERDADE", 44, PAPER_WHITE, CEREJA, 8), 540, 690, t, 42, 2, popk(t, EV["d_title"] + 0.6, 0.38))
    put(fr, tape(190, 62, (244, 166, 188), 6), 520, 810, t, 45, -7, popk(t, EV["d_photo"] + 0.1, 0.3))
    put(fr, photo("nutella", 540, ROSA), 560, 1075, t, 44, -2.5, popk(t, EV["d_photo"], 0.45))
    swatch_row(fr, t, (("NUTELLA", (112, 62, 36)), ("DOCE DE LEITE", (198, 126, 54))), EV["d_sw"], 1450, CREME)
    k = popk(t, EV["d_sw"][1] - 0.1, 0.35)
    put(fr, plain_text("ou", 64, ROSA, F_SERIF_BI), 540, 1440, t, 46, -4, k)


def scene_e(fr, t):
    fr.alpha_composite(bg_paper(CREME))
    put(fr, torn_block(1000, 420, ROSA, 5), 540, 585, t, 50, 1.2, popk(t, EV["e_title"] - 0.2, 0.4))
    kst = popk(t, EV["e_star"], 0.45)
    step = int(t * 6)
    put(fr, burst(("ESPECIAL", "DA CASA"), 290), 870, 360, t, 51, (step * 9) % 360 * 0 + 8 * math.sin(step * 0.9), kst)
    put(fr, cut_text("BRANCO &", 150, CHOCOLATE), 540, 510, t, 52, -1.0, popk(t, EV["e_title"], 0.4))
    put(fr, cut_text("KINDER BUENO", 140, CEREJA), 540, 665, t, 53, 1.2, popk(t, EV["e_title"] + 0.25, 0.4))
    for i, (txt, y, r) in enumerate((("RECHEIO DE CHOCOLATE BRANCO", 830, -2), ("E UM PEDAÇO DE KINDER BUENO POR CIMA", 905, 1.8))):
        put(fr, strip(txt, 31, PAPER_WHITE, CHOCOLATE, 9 + i, 36, 16), 540, y, t, 54 + i, r, popk(t, EV["e_strips"][i], 0.38))
    put(fr, tape(190, 62, (244, 166, 188), 8), 520, 1035, t, 57, -6, popk(t, EV["e_photo"] + 0.1, 0.3))
    put(fr, photo("kinder", 560, ROSA), 560, 1305, t, 56, 3, popk(t, EV["e_photo"], 0.45))


def scene_f(fr, t):
    fr.alpha_composite(bg_paper(CEREJA))
    kl = popk(t, EV["f_logo"], 0.5)
    step = int(t * 8)
    put(fr, logo("creme", 400), 540, 470, t, 60, 5 * math.sin(step * 0.8), kl, 1.5, 1.0)
    put(fr, cut_text("PEÇA PELO", 135, CHOCOLATE), 540, 790, t, 61, -1.5, popk(t, EV["f_t1"], 0.4))
    put(fr, cut_text("LINK DA BIO", 170, CREME, bcol=CHOCOLATE), 540, 960, t, 62, 1.2, popk(t, EV["f_t2"], 0.4))
    arrow(fr, (880, 1090), (1045, 1000), (1005, 745), (t - EV["f_arrow"]) / 0.9, ROSA, 15, t, 7)
    put(fr, strip("PEÇA COM 1 DIA DE ANTECEDÊNCIA", 38, PAPER_WHITE, CEREJA, 12), 540, 1170, t, 63, -2, popk(t, EV["f_tag"], 0.4))
    for nm, x, y, r, t0 in (("classico", 170, 1400, -6, EV["f_thumbs"][0]), ("recheadissimo", 400, 1430, 5, EV["f_thumbs"][1]), ("nutella", 680, 1410, -4, EV["f_thumbs"][2]), ("kinder", 910, 1435, 6, EV["f_thumbs"][3])):
        put(fr, photo(nm, 200, CREME), x, y, t, zlib.crc32(nm.encode()) % 70, r, popk(t, t0, 0.4))


SCENES = [scene_a, scene_b, scene_c, scene_d, scene_e, scene_f]


def corner_logo(fr, t, idx):
    name = CORNER[idx]
    # troca a variante do selo no meio da virada de página
    if idx > 0 and t - BOUNDS[idx] < TRANS * 0.5:
        name = CORNER[idx - 1]
    if name is None:
        return
    sz = 142
    blit(fr, shadowed(logo(name, sz), (3, 5), 5, 90, 12), 40 + sz / 2 + 12, 205 + sz / 2 + 12)


def scene_index(t):
    return max(0, min(len(SCENES) - 1, max(i for i, b in enumerate(BOUNDS[:-1]) if t >= b)))


_EDGE = np.random.default_rng(11).normal(0, 1, H)
_EDGE = np.convolve(_EDGE, np.ones(25) / 25, "same") * 90


def wipe(prev, new, k):
    """virada de página: a cena nova entra pela direita com borda de papel rasgado"""
    edge = W * (1 - k) + _EDGE * (1 - abs(1 - 2 * k) * 0.3)
    xs = np.arange(W)[None, :]
    mask = xs >= edge[:, None]
    a = np.asarray(prev).copy(); b = np.asarray(new)
    shade = np.clip(1 - np.abs(xs - edge[:, None]) / 60.0, 0, 1)[..., None] * 0.28   # sombra da página
    a = (a.astype(np.float32) * (1 - shade * (~mask)[..., None])).astype(np.uint8)
    out = np.where(mask[..., None], b, a)
    return Image.fromarray(out, "RGBA")


_GR = None


def post(fr, t):
    global _GR
    if _GR is None:
        rng = np.random.default_rng(1)
        _GR = [rng.normal(0, 2.0, (H // 2, W // 2, 1)).astype(np.float32) for _ in range(5)]
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        d = np.sqrt(((xx - W / 2) / (W * 0.85)) ** 2 + ((yy - H / 2) / (H * 0.75)) ** 2)
        globals()["_VIG"] = (1 - 0.16 * np.clip(d - 0.35, 0, 1) ** 1.4)[..., None]
    arr = np.asarray(fr.convert("RGB"), np.float32) * _VIG
    g = _GR[int(t * 10) % 5]
    arr += np.repeat(np.repeat(g, 2, 0), 2, 1)
    return np.clip(arr, 0, 255).astype(np.uint8)


def frame(t):
    i = scene_index(t)
    fr = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    SCENES[i](fr, t)
    if i > 0 and t - BOUNDS[i] < TRANS:
        prev = Image.new("RGBA", (W, H), (0, 0, 0, 255))
        SCENES[i - 1](prev, BOUNDS[i] - 0.001)
        fr = wipe(prev, fr, stp((t - BOUNDS[i]) / TRANS, 4) + 0.25 * (1 if (t - BOUNDS[i]) / TRANS >= 0.0 else 0))
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
