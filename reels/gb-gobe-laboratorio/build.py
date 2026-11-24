"""Reels GB GOBÊ — CONTROLE DE QUALIDADE: os brownies (fotos reais do cardápio) são escaneados e carimbados APROVADO;
depois o cardápio é escaneado item por item; no fim, encomendas pelo link da bio.
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
F_MONO = "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf"


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


# ------------------------------------------------------------------ fundo de laboratório
def _make_lab():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt(((xx - W / 2) / (W * 0.8)) ** 2 + ((yy - H * 0.47) / (H * 0.62)) ** 2)
    g = np.clip(1 - d, 0, 1) ** 1.3
    arr = np.array((24, 12, 9), np.float32)[None, None, :] * (1 - g[..., None]) + np.array((58, 30, 21), np.float32)[None, None, :] * g[..., None]
    img = Image.fromarray(arr.astype(np.uint8), "RGB").convert("RGBA")
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for x in range(0, W + 1, 54):
        d.line([(x, 0), (x, H)], fill=CREME + ((34 if x % 270 == 0 else 13),), width=1)
    for y in range(0, H + 1, 54):
        d.line([(0, y), (W, y)], fill=CREME + ((34 if y % 270 == 0 else 13),), width=1)
    for (cx, cy) in ((54, 54), (W - 54, 54), (54, H - 54), (W - 54, H - 54)):
        d.line([(cx - 22, cy), (cx + 22, cy)], fill=CREME + (120,), width=2)
        d.line([(cx, cy - 22), (cx, cy + 22)], fill=CREME + (120,), width=2)
        d.ellipse([cx - 11, cy - 11, cx + 11, cy + 11], outline=CREME + (120,), width=2)
    for y in range(108, H - 108, 54):
        for x0, s in ((18, 1), (W - 18, -1)):
            d.line([(x0, y), (x0 + s * (14 if y % 270 == 0 else 7), y)], fill=CREME + (70,), width=1)
    img.alpha_composite(ov)
    return img


LAB = _make_lab()


@lru_cache(None)
def logo(name, size):
    return Image.open(os.path.join(HERE, "assets", f"selo-{name}.png")).convert("RGBA").resize((size, size), Image.LANCZOS)


# ------------------------------------------------------------------ fotos reais do cardápio
_MENU = Image.open(os.path.join(HERE, "assets", "cardapio.jpg")).convert("RGB")
_SPEC = {"classico": ((60, 205, 310, 450), (128, 112, 100, 84)), "recheadissimo": ((650, 445, 905, 690), (125, 112, 104, 90)),
         "nutella": ((60, 690, 310, 935), (121, 106, 106, 88)), "kinder": ((650, 930, 905, 1170), (118, 124, 100, 80))}


@lru_cache(None)
def photo_oval(name, width):
    box, (cx, cy, rx, ry) = _SPEC[name]
    c = _MENU.crop(box)
    s = 4
    m = Image.new("L", (c.width * s, c.height * s), 0)
    ImageDraw.Draw(m).ellipse([(cx - rx) * s, (cy - ry) * s, (cx + rx) * s, (cy + ry) * s], fill=255)
    m = m.resize(c.size, Image.LANCZOS)
    c = c.convert("RGBA"); c.putalpha(m)
    c = c.crop((cx - rx - 2, cy - ry - 2, cx + rx + 2, cy + ry + 2))
    k = width / c.width
    return c.resize((width, int(c.height * k)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 80, 2))


@lru_cache(None)
def halftone(name, width, step=9):
    """versão "análise": pontos de meio-tom em rosa (esconde a baixa resolução e fica com cara de scanner)"""
    p = photo_oval(name, width)
    g = np.asarray(p.convert("L"), np.float32) / 255
    a = np.asarray(p.getchannel("A"), np.float32) / 255
    h, w = g.shape
    out = Image.new("RGBA", p.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(out)
    for y in range(0, h - step, step):
        for x in range(0, w - step, step):
            if a[y:y + step, x:x + step].mean() < 0.6:
                continue
            lum = float(g[y:y + step, x:x + step].mean())
            r = step * 0.5 * math.sqrt(clamp(lum * 1.15))
            if r > 0.6:
                d.ellipse([x + step / 2 - r, y + step / 2 - r, x + step / 2 + r, y + step / 2 + r], fill=ROSA + (255,))
    return out


def scope(fr, cx, cy, rx, ry, t, alpha=1.0):
    """anel de mira em volta da foto (marcas de graduação e arcos girando)"""
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    A = int(200 * alpha)
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=CREME + (A,), width=3)
    for i in range(0, 360, 6):
        a = math.radians(i)
        L = 26 if i % 30 == 0 else 12
        x0, y0 = cx + rx * math.cos(a), cy + ry * math.sin(a)
        x1, y1 = cx + (rx + L) * math.cos(a), cy + (ry + L * ry / rx) * math.sin(a)
        d.line([(x0, y0), (x1, y1)], fill=CREME + (int(A * 0.7),), width=2)
    ang = (t * 55) % 360
    for k in range(3):
        d.arc([cx - rx - 40, cy - ry - 40, cx + rx + 40, cy + ry + 40], ang + k * 120, ang + k * 120 + 34, fill=ROSA + (A,), width=6)
    fr.alpha_composite(lay)


def reveal_photo(fr, name, cx, cy, width, t, t0, dur=1.0):
    ht = halftone(name, width)
    col = photo_oval(name, width)
    pw, ph = col.size
    x0, y0 = cx - pw / 2, cy - ph / 2
    a_in = ease_out((t - (t0 - 0.5)) / 0.5)
    if a_in <= 0:
        return
    p = clamp((t - t0) / dur)
    img = ht.copy()
    if p > 0:
        sx = int(pw * ease_io(p))
        img.paste(col.crop((0, 0, sx, ph)), (0, 0), col.crop((0, 0, sx, ph)))
    blit(fr, img, cx, cy, 1.0, 0, a_in)
    if 0 < p < 1:
        sx = x0 + pw * ease_io(p)
        lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(lay)
        for i, al in ((16, 40), (9, 90), (4, 170)):
            d.line([(sx, y0 - 50), (sx, y0 + ph + 50)], fill=ROSA + (al,), width=i)
        d.line([(sx, y0 - 50), (sx, y0 + ph + 50)], fill=CREME + (255,), width=2)
        fr.alpha_composite(lay.filter(ImageFilter.GaussianBlur(1.2)))


# ------------------------------------------------------------------ elementos de interface
def typed(fr, s, x, y, size, color, t, t0, cps=30, anchor="l", cursor=True, path=F_MONO):
    n = int(max(0, (t - t0)) * cps)
    if n <= 0:
        return
    shown = s[:n]
    spr = txt(shown, path, size, color)
    full_w = txt(s, path, size, color).width
    if anchor == "l":
        cx = x + spr.width / 2
    elif anchor == "r":
        cx = x - full_w + spr.width / 2
    else:
        cx = x - full_w / 2 + spr.width / 2
    fr.alpha_composite(spr, (int(cx - spr.width / 2), int(y - spr.height / 2)))
    if cursor and (n < len(s) or int(t * 3) % 2 == 0):
        d = ImageDraw.Draw(fr)
        ex = int(cx + spr.width / 2 - 6)
        d.rectangle([ex, y - size * 0.6, ex + size * 0.5, y + size * 0.5], fill=color + (255,))


def title_pair(fr, t, lines, t0s, cols, ys, sizes):
    for (s, t0, col, y, sz, dirn) in zip(lines, t0s, cols, ys, sizes, (-1, 1)):
        k = ease_out((t - t0) / 0.55)
        if k <= 0:
            continue
        spr = txt(s, F_DISP, sz, col, -2)
        blit(fr, spr, 540 + dirn * (1 - k) * 380, y, 1.0, 0, clamp(k * 1.4))


def tag(fr, t, t0, idx):
    typed(fr, f"AMOSTRA 0{idx}/04", 1020, 262, 30, ROSA, t, t0, 32, "r")
    k = ease_out((t - t0) / 0.6)
    d = ImageDraw.Draw(fr)
    d.line([(1020 - 300 * k, 292), (1020, 292)], fill=CREME + (150,), width=2)
    for i in range(4):
        on = i < idx
        x = 1020 - 300 + i * 78
        d.rectangle([x, 303, x + 66, 311], fill=(ROSA if on else CREME) + (255 if on else 60,))


def callout(fr, dot, lab, lines, t, t0):
    k = ease_out((t - t0) / 0.5)
    if k <= 0:
        return
    pulse = 1 + 0.18 * math.sin(t * 7)
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    r = 13 * pulse
    d.ellipse([dot[0] - r, dot[1] - r, dot[0] + r, dot[1] + r], outline=ROSA + (255,), width=4)
    d.ellipse([dot[0] - 5, dot[1] - 5, dot[0] + 5, dot[1] + 5], fill=ROSA + (255,))
    ex, ey = dot[0] + (lab[0] - dot[0]) * k, dot[1] + (lab[1] - dot[1]) * k
    d.line([dot, (ex, ey)], fill=ROSA + (255,), width=3)
    fr.alpha_composite(lay)
    if k >= 0.99:
        for i, ln in enumerate(lines):
            spr = txt(ln, F_MONO, 30, CREME)
            tw = spr.width
            bx = lab[0] - (tw if lab[0] > dot[0] else 0)
            n = int((t - t0 - 0.5) * 34)
            if n > 0:
                part = txt(ln[:n], F_MONO, 30, CREME)
                fr.alpha_composite(part, (int(lab[0] - (tw if lab[0] > dot[0] else 0)), int(lab[1] - 36 + i * 38)))
        d2 = ImageDraw.Draw(fr)
        d2.line([(lab[0] - (tw if lab[0] > dot[0] else 0), lab[1] + 2 + (len(lines) - 1) * 38 + 36), (lab[0] + (0 if lab[0] > dot[0] else tw), lab[1] + 2 + (len(lines) - 1) * 38 + 36)], fill=ROSA + (255,), width=2)


@lru_cache(None)
def stamp_sprite(text, size):
    f = fnt(F_DISP, size)
    tw = f.getlength(text)
    s = size / 78.0
    pad = max(14, int(38 * s))
    w, h = int(tw) + 2 * pad + int(20 * s), size + int(66 * s)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, w - 1, h - 1], max(6, int(16 * s)), fill=CEREJA + (255,))
    d.rounded_rectangle([max(2, int(5 * s)), max(2, int(5 * s)), w - 1 - max(2, int(5 * s)), h - 1 - max(2, int(5 * s))], max(5, int(12 * s)), outline=CREME + (255,), width=max(2, int(5 * s)))
    d.rounded_rectangle([int(17 * s) + 1, int(17 * s) + 1, w - 2 - int(17 * s), h - 2 - int(17 * s)], max(3, int(8 * s)), outline=CREME + (150,), width=max(1, int(2 * s)))
    d.text((w / 2, h / 2 + 2 * s), text, font=f, fill=CREME + (255,), anchor="mm")
    rng = np.random.default_rng(zlib.crc32(text.encode()) % 999)
    a = np.asarray(img.getchannel("A")).astype(np.float32)
    ys, xs = np.mgrid[0:h, 0:w]
    for _ in range(int(46 * max(0.4, s))):
        cx, cy, r = rng.uniform(0, w), rng.uniform(0, h), rng.uniform(2, 7) * max(0.5, s)
        a[((xs - cx) ** 2 + (ys - cy) ** 2) < r * r] *= 0.15
    img.putalpha(Image.fromarray(a.astype(np.uint8)))
    return img


def stamp(fr, text, cx, cy, rot, size, t, t0):
    x = t - t0
    if x < 0:
        return
    if x < 0.14:
        k = 2.7 - 1.7 * ease_out(x / 0.14)
    else:
        k = 1 + 0.05 * math.exp(-(x - 0.14) / 0.12) * math.cos((x - 0.14) * 28)
    blit(fr, stamp_sprite(text, size), cx, cy, k, rot, clamp(x / 0.07))
    if 0.14 <= x < 0.7:                                # respingos de tinta
        rng = np.random.default_rng(zlib.crc32(text.encode()) % 777)
        d = ImageDraw.Draw(fr, "RGBA")
        e = (x - 0.14) / 0.56
        for _ in range(16):
            a = rng.uniform(0, 6.28); v = rng.uniform(140, 330); r = rng.uniform(3, 8) * (1 - e)
            px, py = cx + math.cos(a) * v * e * 1.0, cy + math.sin(a) * v * e * 0.7
            d.ellipse([px - r, py - r, px + r, py + r], fill=CEREJA + (int(255 * (1 - e)),))


def shake(t):
    s = 0.0
    for ts in STAMPS:
        x = t - ts
        if 0.12 <= x < 0.5:
            s += 11 * math.exp(-(x - 0.12) / 0.09) * math.sin(70 * (x - 0.12))
    return s


def checklist(fr, t):
    d = ImageDraw.Draw(fr, "RGBA")
    for i, (s, tt) in enumerate(CHECKS):
        k = ease_out((t - tt - 0.1) / 0.3)
        if k <= 0:
            continue
        y = 1425 + i * 54
        x = 96 + (1 - k) * -40
        d.rounded_rectangle([x, y - 19, x + 38, y + 19], 6, fill=CEREJA + (int(255 * k),))
        d.line([(x + 9, y + 1), (x + 17, y + 10), (x + 30, y - 10)], fill=CREME + (int(255 * k),), width=5, joint="curve")
        fr.alpha_composite(txt(s, F_MONO, 32, CREME), (int(x + 54), int(y - 25))) if k > 0.5 else None


def corner_logo(fr, t, idx):
    if idx in (0, 6):
        return
    sz = 142
    lay = Image.new("RGBA", (sz + 40, sz + 40), (0, 0, 0, 0))
    lay.alpha_composite(logo("creme", sz), (20, 20))
    blit(fr, lay, 40 + sz / 2 + 0, 205 + sz / 2 + 0, 1, 0, clamp((t - BOUNDS[idx] - 0.3) / 0.4))


# ------------------------------------------------------------------ cenas
def new_frame():
    return LAB.copy()


def scene0(t):
    fr = new_frame()
    typed(fr, "INSPEÇÃO Nº 001", 1020, 262, 30, ROSA, t, EV["hook_tag"], 26, "r")
    cx, cy = 540, 790
    k = ease_back((t - EV["hook_logo"]) / 0.7)
    scope(fr, cx, cy, 330, 330, t, clamp(k))
    lay = Image.new("RGBA", (600, 600), (0, 0, 0, 0))
    lay.alpha_composite(logo("creme", 520), (40, 40))
    blit(fr, lay, cx, cy, clamp(k), 0, clamp(k * 1.5))
    # varredura de abertura
    sy = ease_io((t - 0.05) / 1.1) * (H + 60) - 30
    if 0 < sy < H + 30:
        ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(ov)
        for i, al in ((30, 28), (14, 80), (5, 190)):
            d.line([(0, sy), (W, sy)], fill=ROSA + (al,), width=i)
        d.line([(0, sy), (W, sy)], fill=CREME + (255,), width=2)
        fr.alpha_composite(ov.filter(ImageFilter.GaussianBlur(1.0)))
    title_pair(fr, t, ["CONTROLE", "DE QUALIDADE"], EV["hook_t"], [CREME, ROSA], [1190, 1330], [150, 112])
    typed(fr, "GB GOBÊ · CONFEITARIA ARTESANAL", 540, 1460, 30, CREME, t, EV["hook_sub"], 30, "c")
    return fr


def item_scene(t, idx, name, lines, cols, tag_t, title_t, scan_t, extra):
    fr = new_frame()
    tag(fr, t, tag_t, idx)
    title_pair(fr, t, lines, title_t, cols, [500, 655], [150, 150 if len(lines[1]) < 9 else 118])
    cx, cy, pw = 540, 1040, 620
    ph = photo_oval(name, pw).height
    reveal_photo(fr, name, cx, cy, pw, t, scan_t, 1.0)
    scope(fr, cx, cy, pw / 2 + 38, ph / 2 + 38, t, clamp((t - scan_t + 0.5) / 0.5))
    extra(fr, t)
    checklist(fr, t)
    return fr


def scene1(t):
    def extra(fr, t):
        callout(fr, (400, 905), (190, 762), ["CASQUINHA", "CROCANTE"], t, EV["s1_callA"])
        callout(fr, (655, 1170), (905, 1338), ["INTERIOR MACIO", "E ÚMIDO"], t, EV["s1_callB"])
        stamp(fr, "CROCANTE", 770, 905, -8, 72, t, EV["s1_stamp1"])
        stamp(fr, "MACIO E ÚMIDO", 345, 1235, 6, 58, t, EV["s1_stamp2"])
    return item_scene(t, 1, "classico", ["CASQUINHA", "CROCANTE"], [CREME, ROSA], EV["s1_tag"], EV["s1_title"], EV["s1_scan"], extra)


def scene2(t):
    def extra(fr, t):
        callout(fr, (520, 890), (190, 762), ["CAMADA", "GENEROSA"], t, EV["s2_call"])
        stamp(fr, "GENEROSO", 770, 905, -8, 72, t, EV["s2_stamp"])
    return item_scene(t, 2, "recheadissimo", ["RECHEIO", "GENEROSO"], [CREME, ROSA], EV["s2_tag"], EV["s2_title"], EV["s2_scan"], extra)


def scene3(t):
    def extra(fr, t):
        callout(fr, (470, 930), (190, 762), ["OU COM", "DOCE DE LEITE"], t, EV["s3_call"])
        stamp(fr, "DE VERDADE", 765, 905, -8, 64, t, EV["s3_stamp"])
    return item_scene(t, 3, "nutella", ["NUTELLA", "DE VERDADE"], [CREME, ROSA], EV["s3_tag"], EV["s3_title"], EV["s3_scan"], extra)


def scene4(t):
    fr = new_frame()
    tag(fr, t, EV["r_title"] - 0.2, 4)
    title_pair(fr, t, ["RESULTADO", ""], (EV["r_title"], 99), [CREME, ROSA], [490, 490], [150, 10])
    typed(fr, "4/4 ITENS INSPECIONADOS", 540, 600, 32, ROSA, t, EV["r_title"] + 0.5, 30, "c")
    names = (("classico", "CLÁSSICO", 300, 800), ("recheadissimo", "RECHEADÍSSIMO", 780, 800), ("nutella", "NUTELLA", 300, 1130), ("kinder", "KINDER BUENO", 780, 1130))
    for (nm, lab, x, y), t0 in zip(names, EV["r_photos"]):
        k = ease_back((t - t0) / 0.5)
        if k <= 0:
            continue
        pw = 360
        ph = photo_oval(nm, pw).height
        blit(fr, photo_oval(nm, pw), x, y, clamp(k), 0, clamp(k * 1.6))
        scope(fr, x, y, pw / 2 + 22, ph / 2 + 22, t + x * 0.01, clamp(k) * 0.8)
        d = ImageDraw.Draw(fr, "RGBA")
        bx, by = x + pw / 2 - 40, y - ph / 2 + 10
        r = 30 * clamp(k)
        d.ellipse([bx - r, by - r, bx + r, by + r], fill=CEREJA + (255,), outline=CREME + (255,), width=4)
        d.line([(bx - 12 * clamp(k), by + 1), (bx - 3 * clamp(k), by + 11 * clamp(k)), (bx + 14 * clamp(k), by - 11 * clamp(k))], fill=CREME + (255,), width=6, joint="curve")
    stamp(fr, "APROVADO", 540, 1450, -6, 112, t, EV["r_stamp"])
    typed(fr, "FEITO ARTESANALMENTE", 540, 1585, 34, CREME, t, EV["r_sub"], 30, "c")
    return fr


_MW = 840
_MENU_IMG = _MENU.resize((_MW, int(_MENU.height * _MW / _MENU.width)), Image.LANCZOS).convert("RGBA")
_MENU_DIM = Image.blend(_MENU_IMG, Image.new("RGBA", _MENU_IMG.size, (10, 4, 3, 255)), 0.66)
_MY = 335
_SC = _MW / _MENU.width
ROWS = [(55, 195, 905, 445), (55, 458, 905, 690), (55, 698, 905, 930), (55, 940, 905, 1170)]


def _rect(i):
    x0, y0, x1, y1 = ROWS[i]
    return [x0 * _SC, y0 * _SC, x1 * _SC, y1 * _SC]


def scene5(t):
    fr = new_frame()
    typed(fr, "CARDÁPIO ▸ ITENS INSPECIONADOS", 1020, 262, 28, ROSA, t, EV["m_head"], 34, "r")
    mx = (W - _MW) // 2
    s0, s1 = EV["m_scan"]
    p = clamp((t - s0) / (s1 - s0))
    if p <= 0:
        return fr
    shown = _MENU_IMG
    rows_t = EV["m_rows"]
    dim_a = 0.0
    rect = None
    if t >= rows_t[0] - 0.2:
        dim_a = ease_io((t - (rows_t[0] - 0.2)) / 0.25) * (1 - ease_io((t - EV["m_end"]) / 0.6))
        idx = max([i for i, tt in enumerate(rows_t) if t >= tt - 0.001] or [0])
        if idx > 0 and t < rows_t[idx] + 0.4:
            k = ease_io((t - rows_t[idx]) / 0.4)
            a, b = _rect(idx - 1), _rect(idx)
            rect = [lerp(a[i], b[i], k) for i in range(4)]
        else:
            rect = _rect(idx)
    if rect is not None and dim_a > 0.01:
        dimmed = Image.blend(_MENU_IMG, _MENU_DIM, dim_a)
        box = tuple(int(v) for v in rect)
        dimmed.paste(_MENU_IMG.crop(box), box[:2])
        dd = ImageDraw.Draw(dimmed)
        dd.rounded_rectangle([box[0] - 3, box[1] - 3, box[2] + 3, box[3] + 3], 14, outline=ROSA + (int(255 * dim_a),), width=5)
        shown = dimmed
    sh = Image.new("RGBA", (_MW + 80, shown.height + 80), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle([40 + 8, 40 + 12, 40 + _MW + 8, 40 + shown.height + 12], fill=(0, 0, 0, 150))
    fr.alpha_composite(sh.filter(ImageFilter.GaussianBlur(12)), (mx - 40, _MY - 40))
    vis_h = int(shown.height * ease_io(p))
    if vis_h > 0:
        fr.alpha_composite(shown.crop((0, 0, _MW, vis_h)), (mx, _MY))
    if 0 < p < 1:
        sy = _MY + vis_h
        ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(ov)
        for i, al in ((26, 34), (12, 90), (5, 190)):
            d.line([(mx - 30, sy), (mx + _MW + 30, sy)], fill=ROSA + (al,), width=i)
        d.line([(mx - 30, sy), (mx + _MW + 30, sy)], fill=CREME + (255,), width=2)
        fr.alpha_composite(ov.filter(ImageFilter.GaussianBlur(1.0)))
    # cantos de enquadramento
    d = ImageDraw.Draw(fr)
    for (x, y, sx, sy2) in ((mx - 14, _MY - 14, 1, 1), (mx + _MW + 14, _MY - 14, -1, 1), (mx - 14, _MY + _MENU_IMG.height + 14, 1, -1), (mx + _MW + 14, _MY + _MENU_IMG.height + 14, -1, -1)):
        d.line([(x, y), (x + sx * 44, y)], fill=ROSA + (255,), width=4)
        d.line([(x, y), (x, y + sy2 * 44)], fill=ROSA + (255,), width=4)
    # carimbos APROVADO na margem esquerda (na vertical), um por item
    if rect is not None:
        for i, tt in enumerate(rows_t):
            if t >= tt + 0.45:
                r = _rect(i)
                stamp(fr, "APROVADO", mx - 58, _MY + (r[1] + r[3]) / 2, 90, 30, t, tt + 0.45)
    return fr


def scene6(t):
    fr = new_frame()
    cx, cy = 540, 500
    k = ease_back((t - EV["c_logo"]) / 0.7)
    scope(fr, cx, cy, 285, 285, t, clamp(k))
    lay = Image.new("RGBA", (500, 500), (0, 0, 0, 0))
    lay.alpha_composite(logo("creme", 430), (35, 35))
    blit(fr, lay, cx, cy, clamp(k), 0, clamp(k * 1.5))
    for s, t0, y, sz, col in (("AS ENCOMENDAS", EV["c_lines"][0], 880, 100, CREME), ("SÃO FEITAS NO", EV["c_lines"][1], 995, 100, CREME), ("LINK DA BIO", EV["c_lines"][2], 1150, 150, ROSA)):
        kk = ease_out((t - t0) / 0.5)
        if kk <= 0:
            continue
        blit(fr, txt(s, F_DISP, sz, col, -2), 540 + (1 - kk) * 120, y, 1, 0, clamp(kk * 1.4))
    # seta pulsando
    ka = ease_out((t - EV["c_arrow"]) / 0.5)
    if ka > 0:
        bob = 14 * math.sin((t - EV["c_arrow"]) * 6)
        d = ImageDraw.Draw(fr)
        ax, ay = 540, 1330 - bob
        d.polygon([(ax, ay - 70 * ka), (ax + 62 * ka, ay), (ax + 22 * ka, ay), (ax + 22 * ka, ay + 70 * ka), (ax - 22 * ka, ay + 70 * ka), (ax - 22 * ka, ay), (ax - 62 * ka, ay)], fill=ROSA + (255,))
    typed(fr, "SEU MOMENTO DOCE COMEÇA AQUI", 540, 1520, 30, CREME, t, EV["c_sub"], 30, "c")
    return fr


SCENES = [scene0, scene1, scene2, scene3, scene4, scene5, scene6]


def scene_index(t):
    return max(i for i, b in enumerate(BOUNDS[:-1]) if t >= b)


def scan_wipe(prev, new, k):
    Y = ease_io(k) * (H + 120) - 60
    a, b = np.asarray(prev).astype(np.float32), np.asarray(new).astype(np.float32)
    ys = np.arange(H, dtype=np.float32)[:, None, None]
    out = np.where(ys < Y, b, a)
    d = np.abs(ys - Y)
    glow = np.clip(1 - d / 70.0, 0, 1) ** 2 * 0.75
    out[..., :3] = out[..., :3] * (1 - glow) + np.array(ROSA, np.float32) * glow
    line = np.clip(1 - d / 2.5, 0, 1)
    out[..., :3] = out[..., :3] * (1 - line) + np.array(CREME, np.float32) * line
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGBA")


_GR = None
_VIG = None
_SCAN = None


def post(fr, t):
    global _GR, _VIG, _SCAN
    if _GR is None:
        rng = np.random.default_rng(1)
        _GR = [rng.normal(0, 2.2, (H // 2, W // 2, 1)).astype(np.float32) for _ in range(5)]
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        d = np.sqrt(((xx - W / 2) / (W * 0.85)) ** 2 + ((yy - H / 2) / (H * 0.75)) ** 2)
        _VIG = (1 - 0.22 * np.clip(d - 0.35, 0, 1) ** 1.4)[..., None]
        _SCAN = (1 - 0.035 * (np.arange(H) % 3 == 0).astype(np.float32))[:, None, None]
    arr = np.asarray(fr.convert("RGB"), np.float32) * _VIG * _SCAN
    arr += np.repeat(np.repeat(_GR[int(t * 12) % 5], 2, 0), 2, 1)
    return np.clip(arr, 0, 255).astype(np.uint8)


def frame(t):
    i = scene_index(t)
    fr = SCENES[i](t)
    if i > 0 and t - BOUNDS[i] < TRANS:
        prev = SCENES[i - 1](BOUNDS[i] - 0.001)
        fr = scan_wipe(prev, fr, (t - BOUNDS[i]) / TRANS)
    corner_logo(fr, t, i)
    sx = shake(t)
    if abs(sx) > 0.3:
        moved = Image.new("RGBA", fr.size, (24, 12, 9, 255))
        moved.paste(fr, (int(sx), int(sx * 0.6)))
        fr = moved
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
