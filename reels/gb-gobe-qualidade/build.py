"""Reels GB GOBÊ — QUALIDADE (sabor, higiene, aparência) — 1080x1920, 30 fps, 35 s. Renderiza quadro a quadro (PIL + numpy) e monta com ffmpeg.

Uso:
  python3 build.py <pasta-de-trabalho> <saida.mp4>               vídeo completo (usa <pasta>/mix.wav se existir)
  python3 build.py <pasta-de-trabalho> <pasta-pngs> --stills 1 5 8.5 ...   só quadros de teste
A pasta de trabalho pode ter timeline.json (tempos reais da voz). Sem ele, usa tempos estimados.
"""
import math, os, subprocess, sys, unicodedata
os.environ.setdefault("OMP_NUM_THREADS", "1")
from functools import lru_cache
from multiprocessing import Pool

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

from plan import *
from gfx import *
from timing import load_timeline

HERE = os.path.dirname(os.path.abspath(__file__))
WORK, OUT = sys.argv[1], sys.argv[2]
STILLS = [float(x) for x in sys.argv[sys.argv.index("--stills") + 1:]] if "--stills" in sys.argv else None
TL = load_timeline(WORK)
WORDS = TL["words"]

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
TRAD = Brownie(11, filling=False, height=0.44, gloss=1.0)
RECH = Brownie(23, filling=True, height=0.50, gloss=1.35, crust=0.17, crackle=1.3)


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


def corner_logo(fr, t):
    """selo no canto superior esquerdo, o tempo todo (some só na cena final, onde a logo é gigante)"""
    seq = [(0.0, "creme"), (4.0, "creme"), (12.0, "cereja"), (23.0, "creme")]
    a_vis = 1.0 - ease_io((t - 29.2) / 0.5)
    if a_vis <= 0:
        return
    name = "creme"
    for b, n in seq:
        if t >= b:
            name = n
    size = 150
    prev = "creme"
    for b, n in seq:
        if t >= b:
            break
        prev = n
    # transição de variante com cross-fade curto na fronteira
    x, y = 46, 214
    for b, n in seq[1:]:
        if abs(t - b) < 0.12:
            k = (t - (b - 0.12)) / 0.24
            old = seq[[s[0] for s in seq].index(b) - 1][1]
            paste_logo(fr, old, x, y, size, a_vis * (1 - k))
            paste_logo(fr, n, x, y, size, a_vis * k)
            return
    paste_logo(fr, name, x, y, size, a_vis)


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

# ================================================================== CENA 1 — GANCHO (0–4)
SP1 = [(310, 760, 0.3), (760, 700, 1.7), (470, 930, 2.9), (820, 1040, 4.1), (270, 1100, 5.3), (600, 640, 6.2)]


def scene1(fr, t):
    fr.alpha_composite(BG["choc"]())
    fr.alpha_composite(bokeh(W, H, t, [CEREJA, ROSA, (255, 190, 120)], 14, 3, alpha=55))
    th = math.radians(kf(t, [(0, -34), (4.2, 10)]))
    S = kf(t, [(0, 720), (4.2, 1060)])
    el = kf(t, [(0, 27), (4.2, 38)])
    cy = kf(t, [(0, 1060), (4.2, 1010)])
    c = cam(S, 540, cy, el)
    ey = math.radians(el)
    base_y = cy + S * (TRAD.h / 2 + 0.02) * math.cos(ey)
    draw_plate(fr, 540, base_y, S * 0.84, CREME, ey)
    contact_shadow(fr, 540, base_y, S * 0.62, ey, 170)
    info = place(fr, [TRAD.whole(rot=rotY(th))], c)
    # ---- chocolate escorrendo sobre o brownie
    top = next((i for i in info if i["name"] == "top"), None)
    if top is not None:
        q = top["quad"]
        ctr = q.mean(0)
        a0 = 0.40 * (q[:, 0].max() - q[:, 0].min())
        b0 = 0.40 * (q[:, 1].max() - q[:, 1].min())
        t_in = EV["pour"]
        stream_y = kf(t, [(t_in, -30), (t_in + 0.55, ctr[1])])
        grow = ease_out((t - t_in - 0.45) / 2.2)
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
                bars.append((ctr[0] + u * a, yb, rng.uniform(22, 36), rng.uniform(70, 190) * (S / 800), 1.5 + rng.uniform(0, 1.3), 1.7))
            drips_mask(m, bars, t)
        over(fr, choc_rgba(m, t=t))
    sparkles(fr, t, SP1, 2.2, 28)
    # ---- texto
    rows = [(("Um doce de ", CREME), ("verdade", ROSA)), (("começa antes da", CREME),), (("primeira ", CREME), ("mordida.", ROSA))]
    for i, sp in enumerate(rows):
        ai = ease_out((t - 0.12 - i * 0.26) / 0.5)
        spr = rich(sp, F_SERIF_BI, 84, shadow=0.55)
        blit(fr, spr, 540, 430 + i * 108 + (1 - ai) * 36, 0.94 + 0.06 * ai, ai)


# ------------------------------------------------------------------ novos elementos
def wtime(key, occ=0, default=0.0):
    """instante em que a palavra `key` é falada (usa a linha do tempo real quando existir)"""
    n = 0
    for w in WORDS:
        if norm(w["w"]) == key:
            if n == occ:
                return w["s"]
            n += 1
    return default


@lru_cache(None)
def check_row(txt):
    f = fnt(F_SANS_B, 40)
    pad = 20
    w = int(f.getlength(txt)) + 84 + 2 * pad
    img = Image.new("RGBA", (w, 76 + 2 * pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = pad + 30, pad + 38
    d.ellipse([cx - 30, cy - 28, cx + 30, cy + 32], fill=(60, 10, 8, 70))
    d.ellipse([cx - 30, cy - 30, cx + 30, cy + 30], fill=CEREJA + (255,))
    d.line([(cx - 13, cy + 1), (cx - 4, cy + 11), (cx + 14, cy - 10)], fill=CREME + (255,), width=8, joint="curve")
    d.text((pad + 76, cy + 1), txt, font=f, fill=CHOCOLATE + (255,), anchor="lm")
    return img


@lru_cache(None)
def chip(txt, kind="creme", size=36):
    f = fnt(F_SANS_XB, size)
    pad = 20
    w, h = int(f.getlength(txt)) + 64, size + 40
    img = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([pad, pad + 6, pad + w, pad + h + 6], h // 2, fill=(30, 8, 6, 110))
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(7)))
    fill, ink = (CREME, CEREJA) if kind == "creme" else (CEREJA, CREME)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([pad, pad, pad + w, pad + h], h // 2, fill=fill + (255,))
    d.text((pad + w / 2, pad + h / 2 + 1), txt, font=f, fill=ink + (255,), anchor="mm")
    return img


def bubbles(fr, t, n, seed, col, ymin=300, ymax=1500, alpha=120):
    """bolhas de sabão subindo (sensação de limpeza)"""
    rng = np.random.default_rng(seed)
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    for i in range(n):
        x0 = rng.uniform(40, W - 40); r = rng.uniform(14, 48); sp = rng.uniform(18, 46); ph = rng.uniform(0, 6)
        y = ymax - ((rng.uniform(0, ymax - ymin) + sp * t) % (ymax - ymin))
        x = x0 + 16 * math.sin(t * 0.9 + ph)
        d.ellipse([x - r, y - r, x + r, y + r], fill=col + (int(alpha * 0.22),), outline=col + (alpha,), width=3)
        d.arc([x - r * 0.62, y - r * 0.62, x + r * 0.62, y + r * 0.62], 200, 255, fill=(255, 255, 255, 230), width=max(2, int(r * 0.12)))
    fr.alpha_composite(lay.filter(ImageFilter.GaussianBlur(0.7)))


def dome(fr, cx, base_y, rad, ey, k):
    """cúpula de vidro que desce sobre o brownie. k: 0 (no alto) -> 1 (assentada)"""
    a = rad * 0.80
    b = a * math.sin(ey)
    Hd = rad * 0.92
    off = -(1 - clamp(k)) * 560
    al = clamp(k * 2.2)
    if al <= 0.01:
        return
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    by = base_y + off
    top = by - Hd
    d.pieslice([cx - a, top - 0, cx + a, by + Hd], 180, 360, fill=(255, 255, 255, 46), outline=(255, 255, 255, 190), width=4)
    d.ellipse([cx - a, by - b, cx + a, by + b], fill=(255, 255, 255, 40), outline=(255, 255, 255, 200), width=4)
    d.arc([cx - a * 0.86, top + 26, cx + a * 0.86, by + Hd - 30], 205, 262, fill=(255, 255, 255, 235), width=11)
    d.arc([cx - a * 0.70, top + 70, cx + a * 0.70, by + Hd - 70], 215, 250, fill=(255, 255, 255, 150), width=6)
    d.ellipse([cx - 17, top - 26, cx + 17, top + 8], fill=CREME + (255,), outline=(190, 150, 120, 255), width=3)
    lay = lay.filter(ImageFilter.GaussianBlur(0.8))
    if al < 0.99:
        lay.putalpha(lay.getchannel("A").point(lambda v: int(v * al)))
    fr.alpha_composite(lay)


def place_sweep(fr, solids, c, k):
    """renderiza o brownie e passa uma faixa de luz (brilho) diagonal por cima da casquinha"""
    out = render_solids(solids, c)
    if out is None:
        return
    lay, (x, y), info = out
    arr = np.asarray(lay).astype(np.float32)
    hh, ww = arr.shape[:2]
    yy, xx = np.mgrid[0:hh, 0:ww].astype(np.float32)
    pos = xx * 0.85 + yy * 0.55
    ctr = lerp(-250, pos.max() + 250, k)
    band = np.exp(-((pos - ctr) / 55.0) ** 2) * 0.62
    arr[..., :3] += band[..., None] * np.array((255, 226, 190), np.float32) * (arr[..., 3:4] / 255.0)
    paste(fr, Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA"), x, y)
    return info


def choc_on_cuts(fr, info, t, c0, seed=0):
    cuts = [i for i in info if i["name"] in ("left", "right") and i["owner"].get("cut") == i["name"]]
    if not cuts or t <= c0:
        return
    m = half_mask()
    d = ImageDraw.Draw(m)
    bars = []
    for ci, i in enumerate(cuts):
        q = i["quad"]
        topm = qpoint(q, 0.5, 0.0)
        sy = kf(t, [(c0, -30), (c0 + 0.6, topm[1] - 6)])
        if sy > 2:
            d.rectangle([(topm[0] - 15) / 2, 0, (topm[0] + 15) / 2, sy / 2], fill=255)
        gg = ease_out((t - c0 - 0.5) / 1.4)
        if gg > 0:
            pa, pb = qpoint(q, 0.03, 0.0), qpoint(q, 0.97, 0.0)
            d.line([(pa[0] / 2, pa[1] / 2 - 2), (pb[0] / 2, pb[1] / 2 - 2)], fill=255, width=int(15 * gg))
        hq = np.linalg.norm(q[3] - q[0])
        for k, u in enumerate((0.14, 0.34, 0.55, 0.78, 0.92)):
            p = qpoint(q, u, 0.0)
            bars.append((p[0], p[1] - 3, 15 + 5 * ((k + ci + seed) % 3), hq * (0.45 + 0.30 * ((k * 2 + ci) % 3) / 2), c0 + 0.7 + 0.28 * k + 0.15 * ci, 2.4))
    drips_mask(m, bars, t)
    over(fr, choc_rgba(m, t=t))


def title_block(fr, t, t0, label, title, sub, lab_col, title_col, sub_col, title_size=100, shadow=0.0):
    a = ease_out((t - t0) / 0.6)
    blit(fr, line(label, F_SANS_XB, 44, lab_col, track=16), 540, 452 + (1 - a) * 30, 1, a)
    a = ease_out((t - t0 - 0.15) / 0.7)
    blit(fr, line(title, F_SERIF_B, title_size, title_col, shadow=shadow), 540, 548 + (1 - a) * 40, 0.95 + 0.05 * a, a)
    if sub:
        a = ease_out((t - t0 - 0.65) / 0.7)
        blit(fr, line(sub, F_SERIF_BI, 42, sub_col, shadow=shadow * 0.8), 540, 648 + (1 - a) * 24, 1, a)




# ================================================================== CENA 2 — SABOR (4–12)
def scene2(fr, t):
    fr.alpha_composite(BG["cereja"]())
    fr.alpha_composite(bokeh(W, H, t, [ROSA, (255, 170, 150), CREME], 12, 4, alpha=48, speed=10))
    o0, o1 = EV["s2_open"]
    open_u = clamp((t - o0) / 3.0)
    open_k = 1 - (1 - open_u) ** 3.0
    S = kf(t, [(4.0, 560), (5.0, 440), (8.0, 420), (11.2, 520)])
    el = kf(t, [(4.0, 30), (5.0, 25), (8.0, 21), (11.2, 17)])
    cy = kf(t, [(4.0, 1050), (5.0, 1065), (8.0, 1075), (11.2, 1100)])
    c = cam(S, 540, cy, el)
    ey = math.radians(el)
    base_y = cy + S * (TRAD.h / 2 + 0.02) * math.cos(ey)
    draw_plate(fr, 540, base_y, S * kf(open_k, [(0, 0.86), (1, 1.36)]), CREME, ey, 0.0)
    contact_shadow(fr, 540, base_y, S * (0.62 + 0.30 * open_k), ey, int(150 - 125 * open_k))
    if t < o0 - 0.04:
        th = math.radians(-30 * (1 - ease_io((t - 4.0) / 1.0)))
        info = place(fr, [TRAD.whole(rot=rotY(th))], c)
    else:
        th = math.radians(1.5 * math.sin((t - o0) * 0.7))
        info = place(fr, pair(TRAD, math.radians(44) * open_k, 0.345 * open_k + 0.004, 0.02 * open_k, th), c)
        crumbs = make_crumbs(26, o0 - 0.05, 540, cy - S * 0.1, S * 0.4, 51, vmax=260, rmin=3, rmax=8, up=-300)
        fr.alpha_composite(draw_crumbs(Image.new("RGBA", (W, H), (0, 0, 0, 0)), crumbs, t))
        choc_on_cuts(fr, info, t, EV["s2_choc"])
    title_block(fr, t, 4.95, "SABOR", "Chocolate intenso", "Casquinha crocante, miolo macio e úmido.", ROSA, CREME, CREME, 100, 0.45)
    # etiquetas que entram junto com a fala
    chips = [("Intenso", wtime("intenso", 0, 7.0)), ("Crocante", wtime("crocante", 0, 8.0)), ("Macio e úmido", wtime("macio", 0, 9.0))]
    sprs = [chip(txt, "creme") for txt, _ in chips]
    gap = 6
    total = sum(s.width for s in sprs) + gap * (len(sprs) - 1)
    x = 540 - total / 2
    for (txt, tt), spr in zip(chips, sprs):
        a = ease_back((t - tt) / 0.5)
        blit(fr, spr, x + spr.width / 2, 758, a, clamp(a * 2))
        x += spr.width + gap


# ================================================================== CENA 3 — HIGIENE (12–23)
def scene3(fr, t):
    fr.alpha_composite(BG["cream"]())
    ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse([-160, 560, 1240, 1960], outline=CEREJA + (24,), width=5)
    fr.alpha_composite(ring)
    fr.alpha_composite(bokeh(W, H, t, [ROSA, (255, 232, 210), CREME], 10, 6, alpha=40, speed=8))
    bubbles(fr, t, 16, 5, CEREJA, 330, 1560, 95)
    title_block(fr, t, 13.0, "HIGIENE", "Cuidado em cada etapa", None, CEREJA, CHOCOLATE, CHOCOLATE, 84)
    # produto no prato (cúpula protege no final)
    cyb, S, el = 1165, 360, 28
    ey = math.radians(el)
    pulse = 1 + 0.02 * math.sin(t * 1.3)
    c = cam(S * pulse, 540, cyb, el)
    base_y = cyb + S * (RECH.h / 2 + 0.02) * math.cos(ey)
    draw_plate(fr, 540, base_y, S * 0.9, CEREJA, ey, 0.1)
    contact_shadow(fr, 540, base_y, S * 0.62, ey, 150)
    th = math.radians(-24 + 40 * ease_io((t - 12.0) / 10.0))
    place(fr, [RECH.whole(rot=rotY(th))], c)
    sparkles(fr, t, [(300, 1060, 0.4), (790, 1010, 2.0), (640, 1130, 3.5), (400, 980, 5.1), (860, 1180, 1.0)], 2.2, 28)
    td = wtime("protegido", 0, EV["s3_dome"]) + 0.15
    dome(fr, 540, base_y, S * 0.9, ey, ease_back((t - td) / 0.9, 1.2))
    if t > td + 0.7:
        sparkles(fr, t - td, [(330, 940, 0.0), (760, 920, 1.3), (540, 850, 2.6), (880, 1100, 0.7), (230, 1120, 2.0)], 3.0, 34)
    # checklist
    items = [("Mãos e utensílios higienizados", wtime("maos", 0, 17.0)),
             ("Cozinha sempre limpa", wtime("cozinha", 0, 18.6)),
             ("Brownies bem protegidos", wtime("protegido", 0, 20.4))]
    for i, (txt, tt) in enumerate(items):
        a = ease_back((t - tt) / 0.5, 1.4)
        spr = check_row(txt)
        x0 = 130
        y = 690 + i * 92
        blit(fr, spr, x0 + spr.width / 2 + (1 - clamp(a)) * 60, y, 0.9 + 0.1 * clamp(a), clamp(a * 2))


# ================================================================== CENA 4 — APARÊNCIA (23–29)
SP4 = [(280, 1000, 0.2), (800, 940, 1.4), (540, 880, 2.6), (170, 1180, 3.8), (900, 1230, 5.0)]


def scene4(fr, t):
    fr.alpha_composite(BG["choc"]())
    fr.alpha_composite(bokeh(W, H, t, [ROSA, CEREJA, (255, 196, 130)], 18, 12, alpha=62, speed=12))
    lt = t - 23.0
    zoom = kf(t, [(23.0, 1.0), (29.0, 1.12)])
    ey = math.radians(30)
    cyb = kf(t, [(23.0, 1120), (29.0, 1090)])
    Sb = 345 * zoom
    sway = math.radians(10 * math.sin(lt * 0.55))
    for B, cx, th, k0 in ((TRAD, 540 - 245 * zoom, math.radians(-28) + sway, 24.3), (RECH, 540 + 245 * zoom, math.radians(-12) - sway, 25.3)):
        by = cyb + Sb * (B.h / 2 + 0.02) * math.cos(ey)
        draw_plate(fr, cx, by, Sb * 0.9, CREME, ey)
        contact_shadow(fr, cx, by, Sb * 0.62, ey, 170)
        k = ((t - k0) % 2.8) / 2.8
        place_sweep(fr, [B.whole(rot=rotY(th))], cam(Sb, cx, cyb, 30), k if t > k0 - 2.8 else 1.5)
    crumbs = make_crumbs(22, 23.7, 540, 800, 330, 41, vmax=90, rmin=3, rmax=7, up=-120)
    fr.alpha_composite(draw_crumbs(Image.new("RGBA", (W, H), (0, 0, 0, 0)), crumbs, t))
    sparkles(fr, t, SP4, 2.0, 30)
    m = half_mask()
    rng = np.random.default_rng(9)
    bars = [(x, -8, rng.uniform(40, 70), rng.uniform(60, 170), 23.5 + 0.02 * i, 1.9) for i, x in enumerate(np.linspace(40, 1040, 11))]
    ImageDraw.Draw(m).rectangle([0, 0, W // 2, int(26 * ease_out((t - 23.4) / 0.8))], fill=255)
    drips_mask(m, bars, t)
    over(fr, choc_rgba(m, t=t))
    title_block(fr, t, 23.95, "APARÊNCIA", "Feito para encantar", "Acabamento e brilho em cada detalhe.", ROSA, CREME, CREME, 100, 0.55)


# ================================================================== CENA 5 — ENCERRAMENTO (29–35)
def scene5(fr, t):
    fr.alpha_composite(BG["cream"]())
    fr.alpha_composite(bokeh(W, H, t, [ROSA, (255, 214, 180), CEREJA], 10, 15, alpha=36, speed=8))
    lt = t - 29.0
    m = half_mask()
    rng = np.random.default_rng(17)
    bars = [(x, -8, rng.uniform(44, 76), rng.uniform(70, 230), 29.5 + 0.03 * i, 2.0) for i, x in enumerate(np.linspace(30, 1050, 12))]
    ImageDraw.Draw(m).rectangle([0, 0, W // 2, int(24 * ease_out((t - 29.4) / 0.8))], fill=255)
    drips_mask(m, bars, t)
    over(fr, choc_rgba(m, t=t))
    la = ease_back((t - EV["s5_logo"]) / 0.8)
    rot = (1 - clamp((t - EV["s5_logo"]) / 0.9)) * -14
    ls = 440
    blit(fr, logo_shadow(ls), 540, 535, la, clamp(la * 2) * 0.9, rot)
    blit(fr, logo("cereja", ls), 540, 520, la, clamp(la * 2), rot)
    sparkles(fr, t, [(300, 370, 0.4), (790, 330, 2.0), (840, 560, 3.5), (260, 600, 5.0)], 2.2, 30)
    for i, txt in enumerate(("Sabor, higiene e aparência", "em cada brownie.")):
        a = ease_out((t - 30.6 - i * 0.25) / 0.7)
        blit(fr, line(txt, F_SERIF_BI, 54, CHOCOLATE), 540, 800 + i * 64 + (1 - a) * 26, 1, a)
    chips = [("SABOR", wtime("sabor", 1, 31.0)), ("HIGIENE", wtime("higiene", 1, 31.5)), ("APARÊNCIA", wtime("aparencia", 0, 32.0))]
    sprs = [chip(txt, "cereja", 30) for txt, _ in chips]
    gap = 4
    x = 540 - (sum(s.width for s in sprs) + gap * 2) / 2
    for (txt, tt), spr in zip(chips, sprs):
        a = ease_back((t - tt) / 0.5)
        blit(fr, spr, x + spr.width / 2, 972, a, clamp(a * 2))
        x += spr.width + gap
    for B, cx, t0 in ((TRAD, 340, 31.4), (RECH, 740, 31.7)):
        a = ease_back((t - t0) / 0.7)
        cy = 1125 + (1 - clamp(a)) * 90
        S = 190
        ey = math.radians(30)
        by = cy + S * (B.h / 2 + 0.02) * math.cos(ey)
        if a > 0.02:
            L = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            draw_plate(L, cx, by, S * 0.9, CEREJA, ey, 0.1)
            contact_shadow(L, cx, by, S * 0.62, ey, 150)
            place(L, [B.whole(rot=rotY(math.radians(-30 + 8 * math.sin(lt * 0.9 + cx))))], cam(S, cx, cy, 30))
            blit(fr, L, W / 2, H / 2, 1.0, clamp(a * 1.6))
    tc = wtime("peca", 0, EV["s5_cta"])
    ca = ease_back((t - tc) / 0.6)
    pulse = 1 + 0.025 * math.sin((t - tc) * 5.5) * clamp(ca)
    blit(fr, cta_pill("Peça o seu e se encante!"), 540, 1352, ca * pulse, clamp(ca * 2))


SCENES = [scene1, scene2, scene3, scene4, scene5]
_WAVE_CACHE = {}


def get_wave(i):
    if i not in _WAVE_CACHE:
        b, direction = WAVES[i]
        _WAVE_CACHE[i] = Wave(direction, 100 + i * 7)
    return _WAVE_CACHE[i]


# ------------------------------------------------------------------ legendas
def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(ch for ch in w if unicodedata.category(ch) != "Mn")
    return "".join(ch for ch in w if ch.isalpha())


def build_chunks():
    chunks = []
    cur = []
    for w in WORDS:
        cur.append(w)
        txt = " ".join(x["w"] for x in cur)
        end_p = w["w"][-1] in ".!?…" or w["w"].endswith("...")
        soft = w["w"][-1] in ","
        if end_p or len(cur) >= 3 or len(txt) >= 22 or (soft and len(cur) >= 2):
            chunks.append(cur); cur = []
        elif cur and w is not WORDS[-1] and WORDS[WORDS.index(w) + 1]["line"] != w["line"]:
            chunks.append(cur); cur = []
    if cur:
        chunks.append(cur)
    out = []
    for i, ch in enumerate(chunks):
        s = ch[0]["s"] - 0.04
        nxt = chunks[i + 1][0]["s"] if i + 1 < len(chunks) else 1e9
        same_line = i + 1 < len(chunks) and chunks[i + 1][0]["line"] == ch[0]["line"]
        e = min(nxt - 0.03, ch[-1]["e"] + 0.45) if same_line else ch[-1]["e"] + 0.42
        out.append(dict(words=ch, s=s, e=e))
    return out


CHUNKS = build_chunks()


@lru_cache(None)
def sub_layout(idx):
    ch = CHUNKS[idx]
    sizes = []
    f = fnt(F_SANS_XB, 58)
    fb = fnt(F_SANS_XB, 74)
    for w in ch["words"]:
        big = norm(w["w"]) in BIG
        sizes.append((fb if big else f))
    space = f.getlength(" ")
    widths = [fo.getlength(w["w"]) for fo, w in zip(sizes, ch["words"])]
    total = sum(widths) + space * (len(widths) - 1)
    return sizes, widths, total, space


def subtitles(fr, t):
    for idx, ch in enumerate(CHUNKS):
        if not (ch["s"] <= t <= ch["e"] + 0.2):
            continue
        sizes, widths, total, space = sub_layout(idx)
        ain = ease_out((t - ch["s"]) / 0.14)
        aout = 1 - clamp((t - ch["e"]) / 0.2)
        al = ain * aout
        if al <= 0.01:
            continue
        pw, ph = int(total + 84), 108
        pad = 24
        cx, cy = W // 2 - 18, 1478
        sc = 0.92 + 0.08 * ain
        L = Image.new("RGBA", (pw + 2 * pad, ph + 2 * pad), (0, 0, 0, 0))
        sh = Image.new("RGBA", L.size, (0, 0, 0, 0))
        ImageDraw.Draw(sh).rounded_rectangle([pad, pad + 6, pad + pw, pad + ph + 6], 44, fill=(10, 3, 2, 120))
        L.alpha_composite(sh.filter(ImageFilter.GaussianBlur(8)))
        d = ImageDraw.Draw(L)
        d.rounded_rectangle([pad, pad, pad + pw, pad + ph], 44, fill=CHOCOLATE + (236,), outline=ROSA + (150,), width=2)
        x = pad + 42
        for fo, w, wd in zip(sizes, ch["words"], widths):
            if t < w["s"] - 0.02:
                x += wd + space
                continue
            k = ease_back((t - w["s"]) / 0.22, 1.5)
            hi = norm(w["w"]) in HIGHLIGHT
            col = ROSA if hi else CREME
            big = norm(w["w"]) in BIG
            yoff = (1 - clamp(k)) * 10
            d.text((x, pad + ph / 2 + 2 - yoff), w["w"], font=fo, fill=col + (255,), anchor="lm")
            x += wd + space
        blit(fr, L, cx + 18, cy, sc, al)
        return


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
    subtitles(fr, t)
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
