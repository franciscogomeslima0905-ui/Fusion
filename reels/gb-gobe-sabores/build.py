"""Reels GB GOBÊ — SABORES (cardápio) — 1080x1920, 30 fps, 35 s. Renderiza quadro a quadro (PIL + numpy) e monta com ffmpeg.

Uso:
  python3 build.py <pasta-de-trabalho> <saida.mp4>               vídeo completo (usa <pasta>/mix.wav se existir)
  python3 build.py <pasta-de-trabalho> <pasta-pngs> --stills 1 5 8.5 ...   só quadros de teste
Sem narração nem legendas: o texto está nas cenas.
"""
import math, os, subprocess, sys, unicodedata
os.environ.setdefault("OMP_NUM_THREADS", "1")
from functools import lru_cache
from multiprocessing import Pool

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

from plan import *
from gfx import *

HERE = os.path.dirname(os.path.abspath(__file__))
WORK, OUT = sys.argv[1], sys.argv[2]
STILLS = [float(x) for x in sys.argv[sys.argv.index("--stills") + 1:]] if "--stills" in sys.argv else None

F_SERIF_B = "/usr/share/fonts/truetype/crosextra/Caladea-Bold.ttf"
F_SERIF_BI = "/usr/share/fonts/truetype/crosextra/Caladea-BoldItalic.ttf"
F_SANS_XB = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
F_SANS_B = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
F_SANS_M = "/usr/share/fonts/opentype/inter/Inter-Medium.otf"


@lru_cache(None)
def fnt(path, size):
    return ImageFont.truetype(path, size)


def kf(t, keys):
    """interpolação por pontos-chave com suavização"""
    if t <= keys[0][0]:
        return keys[0][1]
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if t <= t1:
            return lerp(v0, v1, ease_io((t - t0) / (t1 - t0)))
    return keys[-1][1]


def paste(dst, spr, x, y):
    x, y = int(round(x)), int(round(y))
    sx0, sy0 = max(0, -x), max(0, -y)
    sx1, sy1 = min(spr.width, dst.width - x), min(spr.height, dst.height - y)
    if sx1 <= sx0 or sy1 <= sy0:
        return
    dst.alpha_composite(spr.crop((sx0, sy0, sx1, sy1)), (x + sx0, y + sy0))


def blit(dst, spr, cx, cy, scale=1.0, alpha=1.0, rot=0.0):
    if alpha <= 0.004 or scale <= 0.01:
        return
    if abs(rot) > 0.05:
        spr = spr.rotate(rot, Image.BICUBIC, expand=True)
    if abs(scale - 1) > 0.002:
        spr = spr.resize((max(1, int(spr.width * scale)), max(1, int(spr.height * scale))), Image.LANCZOS)
    if alpha < 0.996:
        spr = spr.copy()
        spr.putalpha(spr.getchannel("A").point(lambda v: int(v * alpha)))
    paste(dst, spr, cx - spr.width / 2, cy - spr.height / 2)


# ------------------------------------------------------------------ sprites de texto
def _tw(f, txt, track):
    return sum(f.getlength(c) + track for c in txt) - track if track else f.getlength(txt)


@lru_cache(None)
def rich(spans, path, size, track=0, shadow=0, sh_col=(30, 12, 8), stroke=0, stroke_col=(0, 0, 0)):
    """spans: tuple de (texto, cor). Uma linha. shadow: opacidade da sombra suave."""
    f = fnt(path, size)
    asc, desc = f.getmetrics()
    pad = 24 + stroke
    wid = int(sum(_tw(f, t, track) for t, _ in spans)) + 2 * pad
    hei = asc + desc + 2 * pad
    img = Image.new("RGBA", (wid, hei), (0, 0, 0, 0))
    if shadow:
        sh = Image.new("RGBA", (wid, hei), (0, 0, 0, 0))
        sd = ImageDraw.Draw(sh)
        x = pad
        for t, c in spans:
            if track:
                for ch in t:
                    sd.text((x, pad + 5), ch, font=f, fill=sh_col + (int(255 * shadow),)); x += f.getlength(ch) + track
            else:
                sd.text((x, pad + 5), t, font=f, fill=sh_col + (int(255 * shadow),)); x += f.getlength(t)
        img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(7)))
    d = ImageDraw.Draw(img)
    x = pad
    for t, c in spans:
        if track:
            for ch in t:
                d.text((x, pad), ch, font=f, fill=c + (255,), stroke_width=stroke, stroke_fill=stroke_col + (255,)); x += f.getlength(ch) + track
        else:
            d.text((x, pad), t, font=f, fill=c + (255,), stroke_width=stroke, stroke_fill=stroke_col + (255,)); x += f.getlength(t)
    return img


def line(txt, path, size, col, **kw):
    return rich(((txt, col),), path, size, **kw)


@lru_cache(None)
def price_pill(txt, kind):
    """kind 'cereja' (fundo claro) ou 'creme' (fundo cereja/escuro)"""
    f = fnt(F_SANS_XB, 64)
    tw = int(f.getlength(txt))
    w, h = tw + 110, 112
    pad = 20
    img = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([pad, pad + 8, pad + w, pad + h + 8], h // 2, fill=(30, 10, 6, 110))
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(9)))
    fill, ink = (CEREJA, CREME) if kind == "cereja" else (CREME, CEREJA)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([pad, pad, pad + w, pad + h], h // 2, fill=fill + (255,))
    d.rounded_rectangle([pad + 8, pad + 8, pad + w - 8, pad + h - 8], (h - 16) // 2, outline=ink + (255,), width=3)
    d.text((pad + w / 2, pad + h / 2 + 2), txt, font=f, fill=ink + (255,), anchor="mm")
    return img


@lru_cache(None)
def cta_pill(txt):
    f = fnt(F_SANS_B, 40)
    w, h = int(f.getlength(txt)) + 90, 96
    pad = 22
    img = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([pad, pad + 8, pad + w, pad + h + 8], h // 2, fill=(40, 10, 8, 120))
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([pad, pad, pad + w, pad + h], h // 2, fill=CEREJA + (255,))
    d.text((pad + w / 2, pad + h / 2 + 1), txt, font=f, fill=CREME + (255,), anchor="mm")
    return img


# ------------------------------------------------------------------ logo (arquivos originais, sem modificar)
@lru_cache(None)
def logo(name, size):
    im = Image.open(os.path.join(HERE, "assets", f"selo-{name}.png")).convert("RGBA")
    return im.resize((size, size), Image.LANCZOS)


@lru_cache(None)
def logo_shadow(size):
    s = Image.new("RGBA", (size + 80, size + 80), (0, 0, 0, 0))
    ImageDraw.Draw(s).ellipse([40, 48, 40 + size, 48 + size], fill=(20, 6, 4, 120))
    return s.filter(ImageFilter.GaussianBlur(14))


# ------------------------------------------------------------------ fundos
@lru_cache(None)
def bg_img(top, bot, glow=None):
    t = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    arr = np.array(top, np.float32) * (1 - t) + np.array(bot, np.float32) * t
    arr = np.repeat(arr, W, axis=1)
    if glow:
        gx, gy, gr, gc, ga = glow
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        d = np.sqrt(((xx - gx) / gr) ** 2 + ((yy - gy) / gr) ** 2)
        g = np.clip(1 - d, 0, 1) ** 1.6 * ga
        arr = arr * (1 - g[..., None]) + np.array(gc, np.float32) * g[..., None]
    return Image.fromarray(arr.astype(np.uint8), "RGB").convert("RGBA")


BG = {
    "choc": lambda: bg_img((24, 10, 7), (66, 31, 20), (540, 980, 820, (150, 76, 44), 0.55)),
    "cream": lambda: bg_img((252, 246, 237), (236, 220, 200), (540, 1000, 900, (255, 252, 246), 0.8)),
    "cereja": lambda: bg_img((196, 24, 54), (112, 8, 28), (540, 980, 850, (232, 70, 92), 0.55)),
}


def ellipse_layer(size, box, fill, blur=0):
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(im).ellipse(box, fill=fill)
    return im.filter(ImageFilter.GaussianBlur(blur)) if blur else im


def draw_plate(fr, cx, cy, rad, color, elev, shade=0.0):
    """prato visto de cima inclinada. cy = centro da base do brownie."""
    b = rad * math.sin(elev) * 0.98
    th = max(8, rad * 0.04)
    x0, y0 = int(cx - rad - 80), int(cy - b - 80)
    w, h = int(2 * rad + 160), int(2 * b + 160 + th + 60)
    L = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ox, oy = cx - x0, cy - y0
    L.alpha_composite(ellipse_layer((w, h), [ox - rad * 1.02, oy - b * 1.02 + th + 26, ox + rad * 1.02, oy + b * 1.02 + th + 26], (10, 3, 2, 135), 22))
    edge = tuple(int(c * 0.78) for c in color)
    d = ImageDraw.Draw(L)
    d.ellipse([ox - rad, oy - b + th, ox + rad, oy + b + th], fill=edge + (255,))
    d.ellipse([ox - rad, oy - b, ox + rad, oy + b], fill=color + (255,))
    well = tuple(int(c * (0.94 - shade)) for c in color)
    d.ellipse([ox - rad * 0.66, oy - b * 0.66, ox + rad * 0.66, oy + b * 0.66], fill=well + (255,))
    # brilho do aro
    hi = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(hi).arc([ox - rad * 0.97, oy - b * 0.97, ox + rad * 0.97, oy + b * 0.97], 200, 290, fill=(255, 255, 255, 120), width=max(3, int(rad * 0.025)))
    L.alpha_composite(hi.filter(ImageFilter.GaussianBlur(2)))
    paste(fr, L, x0, y0)


def contact_shadow(fr, cx, cy, ax, elev, strength=150):
    b = ax * math.sin(elev)
    L = ellipse_layer((int(2 * ax + 120), int(2 * b + 120)), [60, 60, 60 + 2 * ax, 60 + 2 * b], (8, 2, 1, strength), 20)
    paste(fr, L, cx - ax - 60, cy - b - 60)


# ------------------------------------------------------------------ construção dos brownies (uma vez por processo)


def pair(B, phi, sx, lift, theta, extra_y=0.0):
    Rg = rotY(theta)
    pl = Rg @ np.array([-0.25 - sx, lift + extra_y, 0.0])
    pr = Rg @ np.array([0.25 + sx, lift + extra_y, 0.0])
    return [B.half("L", pl, Rg @ rotY(-phi)), B.half("R", pr, Rg @ rotY(phi))]


def cam(S, cx, cy, elev_deg):
    return dict(S=S, cx=cx, cy=cy, elev=math.radians(elev_deg), D=5.2)


def place(fr, solids, c):
    out = render_solids(solids, c)
    if out is None:
        return []
    lay, (x, y), info = out
    paste(fr, lay, x, y)
    return info


def qpoint(q, u, v):
    top = q[0] * (1 - u) + q[1] * u
    bot = q[3] * (1 - u) + q[2] * u
    return top * (1 - v) + bot * v


def paste_logo(fr, name, x, y, size, a):
    if a <= 0.01:
        return
    blit(fr, logo_shadow(size), x + size / 2, y + size / 2, 1.0, a * 0.8)
    blit(fr, logo(name, size), x + size / 2, y + size / 2, 1.0, a)


def drips_mask(m, bars, t, scale=1.0):
    """bars: (x, y0, w, Lmax, t0, dur) em px de tela cheia. Desenha em máscara de meia resolução."""
    d = ImageDraw.Draw(m)
    for x, y0, w, Lm, t0, dur in bars:
        L = Lm * ease_out((t - t0) / dur) * scale
        if L <= 1:
            continue
        hw = w / 2
        d.rectangle([(x - hw) / 2, y0 / 2, (x + hw) / 2, (y0 + L) / 2], fill=255)
        d.ellipse([(x - hw * 1.08) / 2, (y0 + L - hw) / 2, (x + hw * 1.08) / 2, (y0 + L + hw) / 2], fill=255)


def half_mask():
    return Image.new("L", (W // 2, H // 2), 0)


def sparkles(fr, t, pts, speed=2.0, size=26):
    lay = Image.new("RGBA", fr.size, (0, 0, 0, 0))
    for i, (x, y, ph) in enumerate(pts):
        a = max(0.0, math.sin(t * speed + ph)) ** 6
        if a > 0.05:
            sparkle(lay, x, y, size * (0.5 + 0.7 * a), a)
    lay = lay.filter(ImageFilter.GaussianBlur(0.6))
    fr.alpha_composite(lay)

# ------------------------------------------------------------------ elementos de apoio
@lru_cache(None)
def chip(txt, kind="creme", size=36):
    f = fnt(F_SANS_XB, size)
    pad = 20
    w, h = int(f.getlength(txt)) + 64, size + 40
    img = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([pad, pad + 6, pad + w, pad + h + 6], h // 2, fill=(30, 8, 6, 110))
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(7)))
    fill, ink = {"creme": (CREME, CEREJA), "cereja": (CEREJA, CREME), "choc": (CHOCOLATE, CREME)}[kind]
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([pad, pad, pad + w, pad + h], h // 2, fill=fill + (255,))
    d.text((pad + w / 2, pad + h / 2 + 1), txt, font=f, fill=ink + (255,), anchor="mm")
    return img


def chip_row(fr, items, active, y, kind="creme", size=34, gap=6, t=0.0, t_in=0.0):
    sprs = [chip(txt, kind, size) for txt in items]
    total = sum(s.width for s in sprs) + gap * (len(sprs) - 1)
    x = 540 - total / 2
    for i, spr in enumerate(sprs):
        a = ease_back((t - t_in - 0.12 * i) / 0.5)
        on = i == active
        blit(fr, spr, x + spr.width / 2, y, a * (1.08 if on else 0.94), clamp(a * 2) * (1.0 if on else 0.5))
        x += spr.width + gap


def bounce(t, t0, dur=0.55):
    x = (t - t0) / dur
    return 1.0 if x < 0 or x > 1 else 1 + 0.08 * math.sin(math.pi * x) * (1 - x)


def title_block(fr, t, t0, label, title, sub, lab_col, title_col, sub_col, title_size=100, shadow=0.0):
    a = ease_out((t - t0) / 0.6)
    blit(fr, line(label, F_SANS_XB, 44, lab_col, track=14), 540, 452 + (1 - a) * 30, 1, a)
    a = ease_out((t - t0 - 0.15) / 0.7)
    blit(fr, line(title, F_SERIF_B, title_size, title_col, shadow=shadow), 540, 548 + (1 - a) * 40, 0.95 + 0.05 * a, a)
    if sub:
        a = ease_out((t - t0 - 0.6) / 0.7)
        blit(fr, line(sub, F_SERIF_BI, 42, sub_col, shadow=shadow * 0.8), 540, 648 + (1 - a) * 24, 1, a)


def crumbs_burst(fr, t, t0, cy, S, seed, n=24):
    cr = make_crumbs(n, t0, 540, cy - S * 0.1, S * 0.4, seed, vmax=260, rmin=3, rmax=8, up=-300)
    fr.alpha_composite(draw_crumbs(Image.new("RGBA", (W, H), (0, 0, 0, 0)), cr, t))


def corner_logo(fr, t):
    """selo original no canto superior esquerdo o vídeo todo (some na cena final, onde a logo é gigante)"""
    a_vis = 1.0 - ease_io((t - CORNER_HIDE) / 0.4)
    if a_vis <= 0:
        return
    names = [n for _, n in CORNER]
    idx = max(i for i, (b, _) in enumerate(CORNER) if t >= b)
    x, y, size = 46, 214, 150
    if idx > 0 and t - CORNER[idx][0] < 0.12:
        k = (t - CORNER[idx][0]) / 0.12
        paste_logo(fr, names[idx - 1], x, y, size, a_vis * (1 - k))
        paste_logo(fr, names[idx], x, y, size, a_vis * k)
    else:
        paste_logo(fr, names[idx], x, y, size, a_vis)


# ================================================================== BROWNIE 3D (rm.py)
import rm
from rm import BrownieMats, topping_swirl, topping_streak, topping_smooth, topping_half, compose_topping

MATS = BrownieMats(11)
TOPS = dict(
    amargo=topping_swirl((60, 28, 18), 1.0, seed=3),
    leite=topping_swirl((158, 98, 60), 0.95, seed=4),
    branco=topping_swirl((250, 242, 224), 0.9, seed=5),
    nutella=topping_streak((104, 56, 32), 0.85, seed=6),
    doce=topping_smooth((196, 122, 50), 1.0, seed=7),
    kinder=topping_half((250, 242, 224), (64, 30, 19), seed=9),
)
BH = rm.B       # semi-altura do corpo


def cam3(S, cx, cy, el):
    return dict(S=S, cx=cx, cy=cy, elev=math.radians(el), D=5.2)


def place_rm(fr, c, yaw, top=None, kin=(), bite=None):
    out = rm.render(MATS, c, rotY(yaw), np.zeros(3), top=top, kin=kin, bite=bite)
    if out is None:
        return
    lay, (x, y) = out
    paste(fr, lay, x, y)


def plate_under(fr, c, plate_col, rad_mul=0.95, shade=0.06):
    ey = c["elev"]
    base_y = c["cy"] + c["S"] * (BH + 0.02) * math.cos(ey)
    draw_plate(fr, c["cx"], base_y, c["S"] * rad_mul, plate_col, ey, shade)
    contact_shadow(fr, c["cx"], base_y, c["S"] * 0.60, ey, 135)
    return base_y


def plate_crumbs(fr, c, base_y, seed=5, n=16):
    rng = np.random.default_rng(seed)
    d = ImageDraw.Draw(fr, "RGBA")
    for _ in range(n):
        x = c["cx"] + rng.uniform(-0.95, 0.95) * c["S"] * 0.9
        y = base_y + rng.uniform(-0.2, 0.55) * c["S"] * math.sin(c["elev"]) * 0.9
        r = rng.uniform(2.5, 6.5)
        pts = [(x + r * math.cos(a) * rng.uniform(0.7, 1.2), y + r * math.sin(a) * 0.8 * rng.uniform(0.7, 1.2)) for a in np.linspace(0, 6.28, 6, endpoint=False)]
        d.polygon(pts, fill=(54 + int(rng.integers(0, 30)), 26, 16, 255))


def top_quad(c, yaw, y=BH):
    R = rotY(yaw)
    return np.array([rm.project(c, R, np.zeros(3), (sx * rm.A, y, sz * rm.C))[0] for sx, sz in ((-1, -1), (1, -1), (1, 1), (-1, 1))])


# ================================================================== CENA 1 — GANCHO (0–3,5)
SP1 = [(310, 760, 0.3), (760, 700, 1.7), (470, 930, 2.9), (820, 1040, 4.1), (270, 1100, 5.3), (600, 640, 6.2)]


def scene1(fr, t):
    fr.alpha_composite(BG["choc"]())
    fr.alpha_composite(bokeh(W, H, t, [CEREJA, ROSA, (255, 190, 120)], 14, 3, alpha=55))
    yaw = math.radians(kf(t, [(0, -34), (3.9, 8)]))
    S = kf(t, [(0, 620), (3.9, 860)])
    el = kf(t, [(0, 30), (3.9, 40)])
    cy = kf(t, [(0, 1060), (3.9, 1010)])
    c = cam3(S, 540, cy, el)
    base_y = plate_under(fr, c, CREME, 0.92, 0.0)
    place_rm(fr, c, yaw)
    # ---- chocolate escorrendo sobre o brownie (sobreposição de tela)
    q = top_quad(c, yaw, BH + 0.02)
    ctr = q.mean(0)
    a0 = 0.40 * (q[:, 0].max() - q[:, 0].min()); b0 = 0.40 * (q[:, 1].max() - q[:, 1].min())
    t_in = EV["pour"]
    stream_y = kf(t, [(t_in, -30), (t_in + 0.55, ctr[1])])
    grow = ease_out((t - t_in - 0.45) / 2.0)
    m = half_mask()
    d = ImageDraw.Draw(m)
    sw = 44 * (1 - 0.25 * ease_out((t - t_in) / 2))
    if t > t_in and stream_y > 2:
        d.rectangle([(ctr[0] - sw / 2) / 2, 0, (ctr[0] + sw / 2) / 2, stream_y / 2], fill=255)
        d.ellipse([(ctr[0] - sw * 0.62) / 2, (stream_y - sw * 0.5) / 2, (ctr[0] + sw * 0.62) / 2, (stream_y + sw * 0.5) / 2], fill=255)
    if grow > 0:
        a, b = a0 * grow, b0 * grow
        d.ellipse([(ctr[0] - a) / 2, (ctr[1] - b) / 2, (ctr[0] + a) / 2, (ctr[1] + b) / 2], fill=255)
        bars = []
        rng = np.random.default_rng(5)
        for k in range(9):
            u = rng.uniform(-0.86, 0.86)
            yb = ctr[1] + b * math.sqrt(max(0, 1 - u * u)) - 8
            bars.append((ctr[0] + u * a, yb, rng.uniform(22, 36), rng.uniform(70, 190) * (S / 800), 1.3 + rng.uniform(0, 1.1), 1.6))
        drips_mask(m, bars, t)
    over(fr, choc_rgba(m, t=t))
    sparkles(fr, t, SP1, 2.2, 28)
    rows = [(("Qual é o seu", CREME),), (("sabor ", ROSA), ("favorito", CREME)), (("de brownie?", CREME),)]
    for i, sp in enumerate(rows):
        ai = ease_out((t - 0.12 - i * 0.26) / 0.5)
        blit(fr, rich(sp, F_SERIF_BI, 90, shadow=0.55), 540, 430 + i * 112 + (1 - ai) * 36, 0.94 + 0.06 * ai, ai)


# ================================================================== CENA 2 — O CLÁSSICO (3,5–8,5)
def scene2(fr, t):
    fr.alpha_composite(BG["cream"]())
    ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse([-160, 560, 1240, 1960], outline=CEREJA + (26,), width=5)
    fr.alpha_composite(ring)
    fr.alpha_composite(bokeh(W, H, t, [ROSA, (255, 220, 190), CEREJA], 12, 8, alpha=34, speed=9))
    yaw = math.radians(kf(t, [(3.5, -40), (6.0, -22), (8.5, -14)]))
    S = kf(t, [(3.5, 640), (5.3, 600), (8.5, 700)])
    el = kf(t, [(3.5, 33), (8.5, 30)])
    cy = kf(t, [(3.5, 1090), (8.5, 1110)])
    c = cam3(S, 540, cy, el)
    base_y = plate_under(fr, c, CEREJA, 0.95, 0.1)
    plate_crumbs(fr, c, base_y, 5)
    tb = EV["s2_bite"]
    k = ease_back((t - tb) / 0.45, 1.5) if t >= tb else 0.0
    bite = ((0.50, 0.19, 0.33), 0.27 * clamp(k, 0, 1.15)) if k > 0.02 else None
    place_rm(fr, c, yaw, bite=bite)
    if t >= tb:
        cr = make_crumbs(26, tb, 540 + S * 0.40, cy + S * 0.05, S * 0.12, 61, vmax=240, rmin=3, rmax=8, up=-330)
        fr.alpha_composite(draw_crumbs(Image.new("RGBA", (W, H), (0, 0, 0, 0)), cr, t))
    title_block(fr, t, 4.0, "BROWNIE", "O clássico que conquista", "Casquinha crocante, interior macio e úmido.", CEREJA, CHOCOLATE, (110, 56, 40), 74)


# ================================================================== CENA 3 — RECHEADÍSSIMO (8,5–16,5)
def topped_scene(fr, t, names, switches, c0, yaw_keys, S_keys, el_keys, cy_keys, plate_col, bump_t=True, bg_fn=None):
    sw = switches
    idx = max([i for i, s0 in enumerate(sw) if t >= s0 - 0.001] or [0])
    bump = bounce(t, sw[idx], 0.55) if idx > 0 else 1.0
    yaw = math.radians(kf(t, yaw_keys)); S = kf(t, S_keys); el = kf(t, el_keys); cy = kf(t, cy_keys)
    c = cam3(S * bump, 540, cy, el)
    base_y = plate_under(fr, c, plate_col, 0.95, 0.0)
    plate_crumbs(fr, c, base_y, 7)
    top = compose_topping([TOPS[n] for n in names], list(sw), t)
    return c, yaw, top, idx


def scene3(fr, t):
    fr.alpha_composite(BG["cereja"]())
    fr.alpha_composite(bokeh(W, H, t, [ROSA, (255, 170, 150), CREME], 12, 4, alpha=48, speed=10))
    names = ["amargo", "leite", "branco"]
    sw = EV["s3_switch"]
    c, yaw, top, idx = topped_scene(fr, t, names, sw, 0, [(8.5, -38), (12.5, -10), (16.5, 10)], [(8.5, 600), (16.5, 650)], [(8.5, 36), (16.5, 33)], [(8.5, 1140), (16.5, 1150)], CREME)
    place_rm(fr, c, yaw, top=top)
    if idx > 0 and 0 <= t - sw[idx] < 1.0:
        sparkles(fr, t - sw[idx], [(300, 1000, 0.0), (770, 960, 0.8), (540, 900, 1.6), (880, 1090, 2.2), (220, 1100, 2.9)], 4.0, 36)
    title_block(fr, t, 9.0, "RECHEADÍSSIMO", "Escolha o recheio", "Recheio cremoso por cima, bem generoso.", ROSA, CREME, CREME, 100, 0.45)
    chip_row(fr, ["Meio amargo", "Ao leite", "Branco"], idx if t >= sw[0] else -1, 758, "creme", 34, 6, t, 9.6)


# ================================================================== CENA 4 — NUTELLA / DOCE DE LEITE (16,5–22,5)
def scene4(fr, t):
    fr.alpha_composite(BG["choc"]())
    fr.alpha_composite(bokeh(W, H, t, [ROSA, CEREJA, (255, 196, 130)], 16, 12, alpha=60, speed=12))
    names = ["nutella", "doce"]
    sw = EV["s4_switch"]
    c, yaw, top, idx = topped_scene(fr, t, names, sw, 0, [(16.5, -34), (22.5, 4)], [(16.5, 610), (22.5, 660)], [(16.5, 35), (22.5, 33)], [(16.5, 1140), (22.5, 1150)], CREME)
    place_rm(fr, c, yaw, top=top)
    if idx > 0 and 0 <= t - sw[idx] < 1.0:
        sparkles(fr, t - sw[idx], [(300, 1000, 0.0), (770, 960, 0.8), (540, 900, 1.6), (880, 1090, 2.2)], 4.0, 36)
    title_block(fr, t, 17.0, "NUTELLA", "Nutella de verdade", "Ou com doce de leite — mesmo preço.", ROSA, CREME, CREME, 100, 0.55)
    chip_row(fr, ["Nutella", "Doce de leite"], idx if t >= sw[0] else -1, 758, "creme", 34, 8, t, 17.5)


# ================================================================== CENA 5 — BRANCO & KINDER BUENO (22,5–28,5)
def scene5(fr, t):
    fr.alpha_composite(bg_img((250, 182, 202), (222, 120, 150), (540, 1000, 850, (255, 222, 232), 0.6)))
    fr.alpha_composite(bokeh(W, H, t, [CREME, CEREJA, (255, 214, 224)], 12, 14, alpha=50, speed=10))
    sw = (EV["s5_top"],)
    c, yaw, top, idx = topped_scene(fr, t, ["kinder"], sw, 0, [(22.5, -34), (28.5, 6)], [(22.5, 620), (28.5, 670)], [(22.5, 36), (28.5, 33)], [(22.5, 1120), (28.5, 1130)], CREME)
    kin = []
    for i, (tx, tz, hx, yaw_k, t_drop) in enumerate(((0.05, -0.03, 0.21, 0.6, EV["s5_kinder"]), (0.22, 0.15, 0.19, -0.25, EV["s5_kinder"] + 0.35))):
        if t >= t_drop - 0.01:
            kk = ease_back((t - t_drop) / 0.7, 1.2)
            kin.append(((tx, rm.B + 0.135 + (1 - clamp(kk, 0, 1.2)) * 1.4, tz), hx, 0.065, 0.08, yaw_k + (1 - clamp(kk, 0, 1)) * 0.8))
    place_rm(fr, c, yaw, top=top, kin=kin)
    if t > EV["s5_kinder"] + 0.6:
        sparkles(fr, t - EV["s5_kinder"], [(330, 930, 0.0), (760, 900, 1.3), (560, 840, 2.6), (880, 1060, 0.7), (230, 1040, 2.0)], 3.0, 36)
    title_block(fr, t, 23.0, "ESPECIAL DA CASA", "Branco & Kinder Bueno", "Chocolate branco com Kinder Bueno por cima.", CHOCOLATE, CHOCOLATE, (110, 56, 40), 84)


# ================================================================== CENA 6 — PEÇA PELO LINK DA BIO (28,5–35)
def up_arrow(size=70, col=CEREJA):
    img = Image.new("RGBA", (size + 40, size + 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c = (size + 40) / 2
    d.polygon([(c, 20), (c + size * 0.5, 20 + size * 0.5), (c + size * 0.18, 20 + size * 0.5), (c + size * 0.18, 20 + size), (c - size * 0.18, 20 + size), (c - size * 0.18, 20 + size * 0.5), (c - size * 0.5, 20 + size * 0.5)], fill=col + (255,))
    return img


def scene6(fr, t):
    fr.alpha_composite(BG["cream"]())
    fr.alpha_composite(bokeh(W, H, t, [ROSA, (255, 214, 180), CEREJA], 10, 15, alpha=36, speed=8))
    m = half_mask()
    rng = np.random.default_rng(17)
    bars = [(x, -8, rng.uniform(44, 76), rng.uniform(70, 230), 29.0 + 0.03 * i, 2.0) for i, x in enumerate(np.linspace(30, 1050, 12))]
    ImageDraw.Draw(m).rectangle([0, 0, W // 2, int(24 * ease_out((t - 28.9) / 0.8))], fill=255)
    drips_mask(m, bars, t)
    over(fr, choc_rgba(m, t=t))
    la = ease_back((t - EV["s6_logo"]) / 0.8)
    rot = (1 - clamp((t - EV["s6_logo"]) / 0.9)) * -14
    ls = 400
    blit(fr, logo_shadow(ls), 540, 555, la, clamp(la * 2) * 0.9, rot)
    blit(fr, logo("cereja", ls), 540, 540, la, clamp(la * 2), rot)
    sparkles(fr, t, [(300, 390, 0.4), (790, 370, 2.0), (830, 580, 3.5), (260, 620, 5.0)], 2.2, 30)
    # chamada principal
    a1 = ease_out((t - EV["s6_text"]) / 0.6)
    blit(fr, line("Para pedir é só ir no", F_SERIF_BI, 58, CHOCOLATE), 540, 850 + (1 - a1) * 26, 1, a1)
    a2 = ease_back((t - EV["s6_text"] - 0.3) / 0.7)
    pulse = 1 + 0.025 * math.sin((t - EV["s6_text"]) * 4.5) * clamp(a2)
    spr = line("link da bio", F_SERIF_B, 118, CEREJA)
    blit(fr, spr, 540 - 30, 965, a2 * pulse, clamp(a2 * 2))
    ar = up_arrow(70)
    blit(fr, ar, 540 + spr.width / 2 + 24, 965 - 6 * math.sin((t - EV["s6_text"]) * 6) - 4, clamp(a2), clamp(a2 * 2))
    # recapitulando os sabores
    rows = [["Clássico", "Recheadíssimo", "Nutella"], ["Doce de leite", "Branco & Kinder Bueno"]]
    for ri, row in enumerate(rows):
        sprs = [chip(txt, "cereja", 28) for txt in row]
        tot = sum(s.width for s in sprs) + 4 * (len(sprs) - 1)
        x = 540 - tot / 2
        for ci, s in enumerate(sprs):
            a = ease_back((t - 31.0 - 0.12 * (ci + 3 * ri)) / 0.5)
            blit(fr, s, x + s.width / 2, 1105 + ri * 92, a, clamp(a * 2))
            x += s.width + 4
    ca = ease_back((t - EV["s6_cta"]) / 0.6)
    pulse = 1 + 0.025 * math.sin((t - EV["s6_cta"]) * 5.5) * clamp(ca)
    blit(fr, cta_pill("Peça com 1 dia de antecedência"), 540, 1355, ca * pulse, clamp(ca * 2))


SCENES = [scene1, scene2, scene3, scene4, scene5, scene6]
_WAVE_CACHE = {}


def get_wave(i):
    if i not in _WAVE_CACHE:
        b, direction = WAVES[i]
        _WAVE_CACHE[i] = Wave(direction, 100 + i * 7)
    return _WAVE_CACHE[i]


# ------------------------------------------------------------------ pós-processamento
_vig = None
_grain = None


def post(fr, t):
    global _vig, _grain
    if _vig is None:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        d = np.sqrt(((xx - W / 2) / (W * 0.78)) ** 2 + ((yy - H * 0.5) / (H * 0.70)) ** 2)
        _vig = (1 - 0.30 * np.clip(d - 0.30, 0, 1) ** 1.5)[..., None]
        rng = np.random.default_rng(1)
        _grain = [rng.normal(0, 2.4, (H // 2, W // 2, 1)).astype(np.float32) for _ in range(6)]
    arr = np.asarray(fr.convert("RGB"), np.float32)
    arr *= _vig
    g = _grain[int(t * FPS) % 6]
    arr += np.repeat(np.repeat(g, 2, 0), 2, 1)
    arr *= np.array([1.025, 1.0, 0.965], np.float32)   # calor
    return np.clip(arr, 0, 255).astype(np.uint8)


def frame(t):
    idx = max(0, min(len(SCENES) - 1, next(i for i in range(len(BOUNDS) - 1, -1, -1) if t >= BOUNDS[i])))
    fr = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    SCENES[idx](fr, t)
    # onda de chocolate que cobre a tela em cada fronteira
    for i, (b, _) in enumerate(WAVES):
        w = get_wave(i)
        s = w.s_mid + (t - b) / WAVE_DUR
        if 0.0 <= s <= 1.0:
            over(fr, choc_rgba(w.mask(s), t=t, K=22.0, bevel=8.0, goo=8))
    corner_logo(fr, t)
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
        for k, buf in enumerate(pool.imap(render_idx, range(n), chunksize=2)):
            ff.stdin.write(buf)
            if k % 60 == 0:
                print(f"{k}/{n}", flush=True)
    ff.stdin.close(); ff.wait()
    print("pronto", OUT)
