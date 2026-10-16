"""Reels "5 motivos para ter um site" — 1080x1920, 30 fps, azul e preto.

Fluxo:  narration.py  ->  voice.wav + timeline.json   (voz pt-BR e tempo de cada palavra)
        build.py      ->  trilha + efeitos, quadros animados, legendas palavra por palavra, mp4

Uso:  python3 build.py <pasta-com-voice.wav-e-timeline.json> <saida.mp4>
      python3 build.py <pasta> <pasta-pngs> --stills 1.5 7 14 ...   (só quadros de teste)
"""
import json, math, subprocess, sys
from functools import lru_cache
from multiprocessing import Pool

import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1080, 1920, 30
SRC, OUT = sys.argv[1], sys.argv[2]
STILLS = [float(x) for x in sys.argv[sys.argv.index("--stills") + 1:]] if "--stills" in sys.argv else None
TL = json.load(open(f"{SRC}/timeline.json"))
DUR = TL["duration"]

BLACK, BLUE, SKY, CYAN = (3, 5, 11), (30, 107, 255), (63, 162, 255), (120, 214, 255)
WHITE, MUTED = (245, 248, 255), (138, 160, 200)

# --------------------------------------------------------------------------- linha do tempo
PH = TL["phrases"]
ALL_WORDS = TL["words"]
for p in PH:
    p["words"] = [w for w in ALL_WORDS if p["s"] - 1e-3 <= w["s"] < p["e"]]

LEAD = 0.1  # a imagem entra um instante antes da fala
_groups = [("hook1", [0]), ("hook2", [1]), ("r1", [2, 3]), ("r2", [4, 5]), ("r3", [6, 7]),
           ("r4", [8, 9]), ("r5", [10, 11]), ("prazo", [12]), ("pagto", [13, 14]), ("cta", [15])]
SCENES = []
for i, (name, idx) in enumerate(_groups):
    s = 0.0 if i == 0 else PH[idx[0]]["s"] - LEAD
    SCENES.append({"name": name, "s": s, "phrases": idx})
for i, sc in enumerate(SCENES):
    sc["e"] = SCENES[i + 1]["s"] if i + 1 < len(SCENES) else DUR


def ws(pi, wi):
    """início (s) da palavra wi da frase pi"""
    return PH[pi]["words"][wi]["s"]


# --------------------------------------------------------------------------- utilidades
def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def ease_out(x):
    return 1 - (1 - clamp(x)) ** 3


def ease_back(x, k=1.9):
    x = clamp(x)
    return 1 + (k + 1) * (x - 1) ** 3 + k * (x - 1) ** 2


def ease_io(x):
    x = clamp(x)
    return x * x * (3 - 2 * x)


@lru_cache(None)
def font(weight, size):
    return ImageFont.truetype(f"/usr/share/fonts/opentype/inter/Inter-{weight}.otf", size)


def paste(dst, spr, x, y):
    """alpha_composite com recorte (aceita posições fora do quadro)"""
    x, y = int(x), int(y)
    sx0, sy0 = max(0, -x), max(0, -y)
    sx1, sy1 = min(spr.width, dst.width - x), min(spr.height, dst.height - y)
    if sx1 <= sx0 or sy1 <= sy0:
        return
    dst.alpha_composite(spr.crop((sx0, sy0, sx1, sy1)), (x + sx0, y + sy0))


def blit(dst, spr, cx, cy, scale=1.0, alpha=1.0):
    if alpha <= 0.003 or scale <= 0.01:
        return
    if abs(scale - 1) > 0.002:
        spr = spr.resize((max(1, int(spr.width * scale)), max(1, int(spr.height * scale))), Image.BILINEAR)
    if alpha < 0.997:
        spr = spr.copy()
        spr.putalpha(spr.getchannel("A").point(lambda v: int(v * alpha)))
    paste(dst, spr, cx - spr.width / 2, cy - spr.height / 2)


def grad_img(w, h, c1, c2, vertical=True):
    t = np.linspace(0, 1, h if vertical else w, dtype=np.float32)
    c1, c2 = np.array(c1, np.float32), np.array(c2, np.float32)
    line = c1 + (c2 - c1) * t[:, None]
    arr = np.repeat(line[:, None, :], w, axis=1) if vertical else np.repeat(line[None, :, :], h, axis=0)
    return Image.fromarray(arr.astype(np.uint8), "RGB")


# --------------------------------------------------------------------------- sprites
@lru_cache(None)
def text_spr(text, weight, size, fill=WHITE, stroke=0, stroke_fill=(0, 0, 0), track=0, glow=0, gcol=BLUE):
    f = font(weight, size)
    asc, desc = f.getmetrics()
    pad = 10 + stroke + glow * 2
    if track:
        wid = sum(f.getlength(c) + track for c in text) - track
    else:
        wid = f.getlength(text)
    img = Image.new("RGBA", (int(wid) + 2 * pad, asc + desc + 2 * pad), (0, 0, 0, 0))
    mask = Image.new("L", img.size, 0)
    md = ImageDraw.Draw(mask)
    if track:
        x = pad
        for c in text:
            md.text((x, pad), c, font=f, fill=255, anchor="la")
            x += f.getlength(c) + track
    else:
        md.text((pad, pad), text, font=f, fill=255, anchor="la")
    if glow:
        g = mask.filter(ImageFilter.GaussianBlur(glow)).point(lambda v: int(v * 0.9))
        gl = Image.new("RGBA", img.size, gcol + (0,))
        gl.putalpha(g)
        img.alpha_composite(gl)
    if stroke:
        sm = Image.new("L", img.size, 0)
        sd = ImageDraw.Draw(sm)
        if track:
            x = pad
            for c in text:
                sd.text((x, pad), c, font=f, fill=255, anchor="la", stroke_width=stroke)
                x += f.getlength(c) + track
        else:
            sd.text((pad, pad), text, font=f, fill=255, anchor="la", stroke_width=stroke)
        sl = Image.new("RGBA", img.size, stroke_fill + (0,))
        sl.putalpha(sm)
        img.alpha_composite(sl)
    if isinstance(fill[0], tuple):  # gradiente vertical (topo, base)
        gimg = grad_img(img.width, asc + desc + 2 * pad, fill[0], fill[1]).convert("RGBA")
        gimg.putalpha(mask)
        img.alpha_composite(gimg)
    else:
        col = Image.new("RGBA", img.size, tuple(fill[:3]) + (0,))
        col.putalpha(mask.point(lambda v: v if len(fill) < 4 else int(v * fill[3] / 255)))
        img.alpha_composite(col)
    return img


GRAD = ((190, 232, 255), (30, 107, 255))  # texto em degradê azul


@lru_cache(None)
def card(w, h, r, top=(12, 26, 66), bot=(5, 11, 30), outline=(70, 150, 255), ow=3, glow=0, gcol=BLUE, galpha=150):
    S, pad = 2, glow * 2 + 6
    img = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    if glow:
        g = Image.new("L", img.size, 0)
        ImageDraw.Draw(g).rounded_rectangle((pad, pad, pad + w, pad + h), r, fill=galpha)
        g = g.filter(ImageFilter.GaussianBlur(glow))
        gl = Image.new("RGBA", img.size, gcol + (0,))
        gl.putalpha(g)
        img.alpha_composite(gl)
    m = Image.new("L", (w * S, h * S), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w * S - 1, h * S - 1), r * S, fill=255)
    body = grad_img(w * S, h * S, top, bot).convert("RGBA")
    body.putalpha(m)
    if ow:
        inner = Image.new("L", (w * S, h * S), 0)
        ImageDraw.Draw(inner).rounded_rectangle((ow * S, ow * S, w * S - 1 - ow * S, h * S - 1 - ow * S),
                                                max(1, (r - ow) * S), fill=255)
        ring = Image.new("L", m.size, 0)
        ring.paste(m, (0, 0))
        ring = Image.composite(Image.new("L", m.size, 0), ring, inner)
        rl = Image.new("RGBA", m.size, outline + (0,))
        rl.putalpha(ring)
        body.alpha_composite(rl)
    body = body.resize((w, h), Image.LANCZOS)
    img.alpha_composite(body, (pad, pad))
    return img


@lru_cache(None)
def pill(w, h, fill, alpha=255):
    S = 3
    m = Image.new("L", (w * S, h * S), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w * S - 1, h * S - 1), h * S // 2, fill=alpha)
    m = m.resize((w, h), Image.LANCZOS)
    img = Image.new("RGBA", (w, h), fill + (0,))
    img.putalpha(m)
    return img


@lru_cache(None)
def glow_blob(size, color, peak):
    r = np.linspace(-1, 1, size, dtype=np.float32)
    d = np.sqrt(r[None, :] ** 2 + r[:, None] ** 2)
    a = (np.clip(1 - d, 0, 1) ** 2.2 * peak).astype(np.uint8)
    img = Image.new("RGBA", (size, size), color + (0,))
    img.putalpha(Image.fromarray(a, "L"))
    return img


# ---- ícones (desenhados em 4x e reduzidos) -----------------------------------------------
IC = 360


def _icon(draw_fn):
    S = 4
    img = Image.new("RGBA", (IC * S, IC * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    u = lambda v: v * IC * S / 100  # noqa: E731
    draw_fn(d, u, S)
    return img.resize((IC, IC), Image.LANCZOS)


def _line(d, u, pts, w, col=WHITE):
    d.line([(u(x), u(y)) for x, y in pts], fill=col, width=int(u(w)), joint="curve")
    for x, y in (pts[0], pts[-1]):
        r = u(w) / 2
        d.ellipse((u(x) - r, u(y) - r, u(x) + r, u(y) + r), fill=col)


@lru_cache(None)
def icon(name):
    if name == "shield":
        def f(d, u, S):
            pts = [(50, 6), (86, 20), (85, 52), (50, 94), (15, 52), (14, 20)]
            d.polygon([(u(x), u(y)) for x, y in pts], fill=BLUE, outline=WHITE, width=int(u(3)))
            _line(d, u, [(32, 50), (45, 63), (70, 36)], 9)
    elif name == "search":
        def f(d, u, S):
            d.ellipse((u(10), u(8), u(70), u(68)), fill=(12, 40, 110), outline=WHITE, width=int(u(6)))
            _line(d, u, [(60, 60), (90, 90)], 10)
            ft = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Black.otf", int(u(26)))
            d.text((u(40), u(38)), "#1", font=ft, fill=SKY, anchor="mm")
    elif name == "chart":
        def f(d, u, S):
            for i, (x, top) in enumerate([(12, 60), (40, 42), (68, 20)]):
                d.rounded_rectangle((u(x), u(top), u(x + 20), u(90)), int(u(4)), fill=BLUE if i < 2 else SKY)
            _line(d, u, [(10, 46), (36, 30), (54, 36), (88, 8)], 5)
            _line(d, u, [(70, 8), (88, 8), (88, 26)], 5)
    elif name == "star":
        def f(d, u, S):
            pts = []
            for i in range(10):
                a = -math.pi / 2 + i * math.pi / 5
                r = 42 if i % 2 == 0 else 18
                pts.append((u(50 + r * math.cos(a)), u(54 + r * math.sin(a))))
            d.polygon(pts, fill=BLUE, outline=WHITE, width=int(u(3)))
            for cx, cy, r in [(84, 18, 9), (14, 24, 6)]:
                d.polygon([(u(cx), u(cy - r)), (u(cx + r * .3), u(cy - r * .3)), (u(cx + r), u(cy)),
                           (u(cx + r * .3), u(cy + r * .3)), (u(cx), u(cy + r)), (u(cx - r * .3), u(cy + r * .3)),
                           (u(cx - r), u(cy)), (u(cx - r * .3), u(cy - r * .3))], fill=CYAN)
    elif name == "house":
        def f(d, u, S):
            d.rounded_rectangle((u(20), u(46), u(80), u(90)), int(u(4)), fill=BLUE)
            d.polygon([(u(8), u(50)), (u(50), u(10)), (u(92), u(50))], fill=(12, 40, 110), outline=WHITE, width=int(u(4)))
            d.rounded_rectangle((u(41), u(62), u(59), u(90)), int(u(4)), fill=WHITE)
            _line(d, u, [(34, 52), (34, 52)], 0.1)
    elif name == "plane":
        def f(d, u, S):
            d.polygon([(u(8), u(46)), (u(94), u(8)), (u(62), u(92)), (u(48), u(60))], fill=BLUE, outline=WHITE, width=int(u(3)))
            _line(d, u, [(94, 8), (48, 60)], 4)
            d.polygon([(u(48), u(60)), (u(52), u(80)), (u(62), u(92))], fill=(10, 60, 170))
    elif name == "check":
        def f(d, u, S):
            d.ellipse((u(4), u(4), u(96), u(96)), fill=SKY)
            _line(d, u, [(27, 52), (43, 68), (74, 34)], 11)
    else:
        raise KeyError(name)
    return _icon(f)


# --------------------------------------------------------------------------- fundo
def _make_bg():
    y = np.linspace(0, 1, H, dtype=np.float32)[:, None]
    x = np.linspace(-1, 1, W, dtype=np.float32)[None, :]
    top, bot = np.array([2, 4, 10], np.float32), np.array([5, 17, 48], np.float32)
    base = (top + (bot - top) * y[..., None]) + np.zeros((H, W, 3), np.float32)
    r = np.sqrt(x ** 2 + ((y * 2 - 1.25) * .75) ** 2)
    base += (np.clip(1 - r / 1.15, 0, 1) ** 2.4)[..., None] * np.array([12, 55, 150], np.float32)
    vig = 1 - 0.55 * np.clip((np.abs(x) ** 2.2 + np.abs(y * 2 - 1) ** 2.2) / 2 - 0.25, 0, 1)
    return Image.fromarray(np.clip(base * vig[..., None], 0, 255).astype(np.uint8), "RGB").convert("RGBA")


def _make_grid():
    G = 108
    g = Image.new("RGBA", (W, H + G), (0, 0, 0, 0))
    d = ImageDraw.Draw(g)
    for x in range(0, W + 1, G):
        d.line((x, 0, x, H + G), fill=(60, 130, 255, 26), width=2)
    for y in range(0, H + G, G):
        d.line((0, y, W, y), fill=(60, 130, 255, 26), width=2)
    # esmaece nas bordas de cima e de baixo
    fade = np.minimum(np.linspace(0, 1, H + G), np.linspace(1, 0, H + G))
    fade = np.clip(fade * 4.5, 0, 1).astype(np.float32)
    a = np.array(g.getchannel("A"), np.float32) * fade[:, None]
    g.putalpha(Image.fromarray(a.astype(np.uint8), "L"))
    return g, G


BG = _make_bg()
GRID, GRID_STEP = _make_grid()
_rng = np.random.default_rng(7)
PARTS = [(_rng.uniform(0, W), _rng.uniform(0, H), _rng.uniform(18, 70), _rng.uniform(1.6, 4.6),
          _rng.uniform(0, 6.28)) for _ in range(46)]
STREAK = Image.new("RGBA", (W, 300), (0, 0, 0, 0))
_sa = (np.sin(np.linspace(0, math.pi, 300)) ** 2 * 120).astype(np.uint8)
STREAK.putalpha(Image.fromarray(np.repeat(_sa[:, None], W, axis=1), "L"))
_sc = Image.new("RGBA", (W, 300), SKY + (0,))
_sc.putalpha(STREAK.getchannel("A"))
STREAK = _sc


def background(t):
    img = BG.copy()
    for (cx, cy, ax, ay, ph, col, sz, pk) in [
        (300, 520, 190, 140, 0.0, BLUE, 1000, 78), (820, 1380, 170, 150, 2.0, (20, 90, 255), 1100, 70),
        (760, 300, 120, 100, 4.0, (10, 60, 200), 800, 50)]:
        g = glow_blob(sz, col, pk)
        blit(img, g, cx + ax * math.sin(.45 * t + ph), cy + ay * math.cos(.33 * t + ph))
    off = int(t * 34) % GRID_STEP
    paste(img, GRID.crop((0, off, W, off + H)), 0, 0)
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    for x0, y0, sp, r, ph in PARTS:
        y = (y0 - sp * t) % H
        x = x0 + 14 * math.sin(t * .8 + ph)
        a = int(70 + 90 * (0.5 + 0.5 * math.sin(t * 1.7 + ph)))
        d.ellipse((x - r, y - r, x + r, y + r), fill=CYAN + (a,))
    img.alpha_composite(lay)
    return img


# --------------------------------------------------------------------------- partes comuns das cenas
def pop(t, delay, dur=0.4):
    """escala com leve 'estouro' (0 -> 1) a partir de `delay`"""
    return ease_back((t - delay) / dur)


def fade_in(t, delay, dur=0.25):
    return clamp((t - delay) / dur)


def hud_progress(fg, t, n):
    """5 barrinhas de progresso dos motivos"""
    a = fade_in(t, 0.0)
    widths = [58 if i != n else 130 for i in range(5)]
    total = sum(widths) + 14 * 4
    x = W / 2 - total / 2
    for i, wd in enumerate(widths):
        col = SKY if i == n else (BLUE if i < n else (40, 60, 110))
        spr = pill(wd, 14, col, 255 if i <= n else 130)
        blit(fg, spr, x + wd / 2, 275, 1, a)
        x += wd + 14


def ring_pulse(fg, cx, cy, size, t0, t, color_alpha=0.55):
    """anel que se expande a partir do cartão"""
    dt = (t - t0) / 0.8
    if 0 <= dt <= 1:
        blit(fg, ring_sprite(size), cx, cy, 1 + 0.55 * ease_out(dt), color_alpha * (1 - dt))


@lru_cache(None)
def ring_sprite(size):
    S = 2
    m = Image.new("L", (size * S, size * S), 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle((0, 0, size * S - 1, size * S - 1), size * S // 4, outline=255, width=7 * S)
    m = m.resize((size, size), Image.LANCZOS)
    img = Image.new("RGBA", (size, size), SKY + (0,))
    img.putalpha(m)
    return img


def title_block(fg, t, lines, y_mid, size, delay=0.12, gap=125):
    n = len(lines)
    for i, ln in enumerate(lines):
        fill = GRAD if i == n - 1 else WHITE
        s = size
        while font("Black", s).getlength(ln) > 960 and s > 40:
            s -= 4
        spr = text_spr(ln, "Black", s, fill=fill, glow=10 if fill == GRAD else 0)
        d0 = delay + 0.1 * i
        p = pop(t, d0, 0.45)
        y = y_mid + (i - (n - 1) / 2) * gap + (1 - ease_out((t - d0) / .45)) * 50
        blit(fg, spr, W / 2, y, 0.85 + 0.15 * p, fade_in(t, d0, 0.18))


# --------------------------------------------------------------------------- cenas
def scene_hook1(fg, t, sc):
    p0 = sc["phrases"][0]
    lines = [("SUA EMPRESA", ws(p0, 0), 128, WHITE), ("AINDA NÃO TEM", ws(p0, 2), 128, WHITE),
             ("UM SITE?", ws(p0, 5), 200, GRAD)]
    ys = [520, 665, 855]
    for (txt, st, sz, fill), y in zip(lines, ys):
        st -= sc["s"]
        while font("Black", sz).getlength(txt) > 930:
            sz -= 4
        spr = text_spr(txt, "Black", sz, fill=fill, glow=14 if fill == GRAD else 0)
        p = pop(t, st - 0.05, 0.4)
        blit(fg, spr, W / 2, y + (1 - ease_out((t - st) / .4)) * 60, 0.8 + 0.2 * p, fade_in(t, st - 0.05, 0.15))
    # janela de navegador vazia
    a = fade_in(t, 0.5, 0.5)
    bw, bh, cy = 780, 330, 1130
    blit(fg, card(bw, bh, 36, glow=40, galpha=70), W / 2, cy + (1 - ease_out((t - .5) / .6)) * 80, 1, a)
    for i, c in enumerate([(255, 255, 255), (120, 160, 230), (60, 110, 220)]):
        blit(fg, pill(22, 22, c), W / 2 - bw / 2 + 52 + i * 38, cy - bh / 2 + 50, 1, a)
    blit(fg, pill(480, 38, (24, 44, 96)), W / 2 + 60, cy - bh / 2 + 50, 1, a)
    blit(fg, text_spr("www.suaempresa.com.br", "Bold", 24, fill=MUTED), W / 2 + 60, cy - bh / 2 + 50, 1, a)
    q = text_spr("?", "Black", 190, fill=GRAD, glow=26)
    blit(fg, q, W / 2, cy + 45 + 8 * math.sin(t * 3), 1 + 0.05 * math.sin(t * 4), a)


def scene_hook2(fg, t, sc):
    p1 = sc["phrases"][0]
    t5, tm, tp = ws(p1, 2) - sc["s"], ws(p1, 3) - sc["s"], ws(p1, 4) - sc["s"]
    five = text_spr("5", "Black", 820, fill=GRAD, glow=40)
    blit(fg, five, W / 2, 690, 0.55 + 0.45 * pop(t, t5 - 0.15, 0.55), fade_in(t, t5 - 0.15, 0.2))
    blit(fg, text_spr("MOTIVOS", "Black", 170, fill=WHITE), W / 2, 1090 + (1 - ease_out((t - tm) / .4)) * 50,
         0.85 + 0.15 * pop(t, tm - 0.1, 0.4), fade_in(t, tm - 0.1, 0.15))
    blit(fg, text_spr("PRA TER UM SITE PROFISSIONAL", "Bold", 44, fill=SKY, track=5), W / 2, 1215, 1, fade_in(t, tp, 0.3))
    # "TOP" sutil de 5 pontos
    for i in range(5):
        on = fade_in(t, t5 + 0.15 * i, 0.2)
        blit(fg, pill(26, 26, SKY), W / 2 + (i - 2) * 52, 1290, 0.6 + 0.4 * on, on)


REASONS = [
    # (chip, ícone, linhas do título)
    ("01", "shield", ["CREDIBILIDADE"]),
    ("02", "search", ["O GOOGLE", "TE ENCONTRA"]),
    ("03", "chart", ["VENDA MAIS,", "TRABALHE MENOS"]),
    ("04", "star", ["SE DESTAQUE DA", "CONCORRÊNCIA"]),
    ("05", "house", ["O SITE", "É SEU"]),
]


def scene_reason(fg, t, sc):
    n = int(sc["name"][1]) - 1
    num, ic, lines = REASONS[n]
    hud_progress(fg, t, n)
    blit(fg, text_spr(f"MOTIVO {num}", "Bold", 40, fill=SKY, track=8), W / 2, 350, 1, fade_in(t, 0.1))
    # número fantasma
    gh = text_spr(num, "Black", 700, fill=(30, 107, 255, 40))
    blit(fg, gh, W / 2, 700, 1.12 - 0.12 * ease_out(t / 0.7), fade_in(t, 0.0, 0.4))
    # cartão do ícone
    p2 = sc["phrases"][1]
    t2 = PH[p2]["s"] - sc["s"]
    bump = 1 + 0.10 * math.sin(clamp((t - t2) / 0.5) * math.pi)
    cs = 420
    cy = 700 + 6 * math.sin(t * 2.2)
    pp = pop(t, 0.05, 0.55)
    blit(fg, card(cs, cs, 96, glow=46, galpha=110), W / 2, cy, (0.6 + 0.4 * pp) * bump, fade_in(t, 0.05, 0.2))
    blit(fg, icon(ic), W / 2, cy, (0.5 + 0.5 * pop(t, 0.2, 0.55)) * bump, fade_in(t, 0.2, 0.2))
    ring_pulse(fg, W / 2, cy, cs, 0.15, t)
    ring_pulse(fg, W / 2, cy, cs, t2, t)
    title_block(fg, t, lines, 1075 if len(lines) == 2 else 1110, 112, delay=0.18)


def scene_prazo(fg, t, sc):
    p = sc["phrases"][0]
    blit(fg, text_spr("NOSSA EMPRESA RESOLVE EM ATÉ", "Bold", 46, fill=SKY, track=4), W / 2, 400, 1, fade_in(t, 0.1))
    cy = 800
    # anel de progresso 0 -> 100%
    frac = ease_io((t - 0.3) / (sc["e"] - sc["s"] - 0.9))
    S, R, sz = 2, 300, 800
    rim = Image.new("L", (sz * S, sz * S), 0)
    d = ImageDraw.Draw(rim)
    d.ellipse((sz * S / 2 - R * S, sz * S / 2 - R * S, sz * S / 2 + R * S, sz * S / 2 + R * S), outline=70, width=16 * S)
    if frac > 0.003:
        d.arc((sz * S / 2 - R * S, sz * S / 2 - R * S, sz * S / 2 + R * S, sz * S / 2 + R * S), -90, -90 + 360 * frac,
              fill=255, width=16 * S)
    rim = rim.resize((sz, sz), Image.LANCZOS)
    ringimg = Image.new("RGBA", (sz, sz), SKY + (0,))
    ringimg.putalpha(rim)
    blit(fg, ringimg, W / 2, cy, 1, fade_in(t, 0.1, 0.3))
    four = text_spr("4", "Black", 560, fill=GRAD, glow=36)
    blit(fg, four, W / 2, cy + 10, 0.5 + 0.5 * pop(t, 0.15, 0.6), fade_in(t, 0.15, 0.2))
    blit(fg, text_spr("DIAS", "Black", 170, fill=WHITE), W / 2, 1190, 0.8 + 0.2 * pop(t, 0.55, .45), fade_in(t, 0.55, .2))
    # dias 1..4 acendendo
    for i in range(4):
        st = 0.5 + i * (sc["e"] - sc["s"] - 1.0) / 4
        on = ease_out((t - st) / 0.25)
        x = W / 2 + (i - 1.5) * 210; PY = 1292
        col = tuple(int(a + (b - a) * on) for a, b in zip((22, 40, 90), BLUE))
        blit(fg, pill(190, 64, col), x, PY, 1, fade_in(t, .6))
        blit(fg, text_spr(f"DIA {i + 1}", "ExtraBold", 30, fill=WHITE if on > .5 else MUTED), x, PY, 1, fade_in(t, .6))


def scene_pagto(fg, t, sc):
    p1, p2 = sc["phrases"]
    t2 = PH[p2]["s"] - sc["s"]
    move = ease_io((t - t2) / 0.55)
    # nosso cartão
    oy = 760 + 230 * move
    blit(fg, text_spr("NOSSO DIFERENCIAL", "ExtraBold", 40, fill=CYAN, track=7), W / 2, oy - 215, 1, fade_in(t, 0.1))
    pp = pop(t, 0.12, 0.5)
    ours = card(900, 300, 56, top=(18, 60, 170), bot=(8, 30, 100), outline=CYAN, ow=3, glow=50, galpha=190)
    blit(fg, ours, W / 2, oy, 0.7 + 0.3 * pp, fade_in(t, 0.12, 0.2))
    blit(fg, icon("check").resize((120, 120), Image.LANCZOS), W / 2 - 330, oy, 0.6 + 0.4 * pop(t, 0.35, .5), fade_in(t, .35))
    blit(fg, text_spr("PAGAMENTO", "Black", 96, fill=WHITE), W / 2 + 70, oy - 52, 1, fade_in(t, 0.3))
    blit(fg, text_spr("ÚNICO", "Black", 110, fill=((255, 255, 255), (150, 214, 255))), W / 2 + 70, oy + 58, 1, fade_in(t, 0.38))
    # cartão das outras empresas
    if t >= t2 - 0.05:
        a = fade_in(t, t2, 0.25)
        x = W / 2 - (1 - ease_out((t - t2) / .5)) * 700
        dim = card(900, 300, 56, top=(20, 28, 48), bot=(10, 14, 28), outline=(70, 90, 130), ow=3)
        blit(fg, dim, x, 640, 1, a)
        blit(fg, text_spr("OUTRAS EMPRESAS", "ExtraBold", 36, fill=MUTED, track=6), x, 560, 1, a)
        blit(fg, text_spr("MENSALIDADE", "Black", 110, fill=(150, 165, 195)), x, 650, 1, a)
        blit(fg, text_spr("TODO MÊS · TAXAS", "Bold", 40, fill=(110, 125, 155), track=3), x, 735, 1, a)
        ts = t2 + 1.0  # risco passando por cima
        k = ease_out((t - ts) / 0.4)
        if k > 0:
            x0, x1 = W / 2 - 400, W / 2 - 400 + 800 * k
            ln = Image.new("RGBA", (W, 60), (0, 0, 0, 0))
            ImageDraw.Draw(ln).line((x0, 30, x1, 30), fill=(255, 255, 255, 235), width=12)
            ImageDraw.Draw(ln).ellipse((x0 - 6, 24, x0 + 6, 36), fill=(255, 255, 255, 235))
            paste(fg, ln, 0, 650 - 30)
    # seta "VS"
    if t > t2 + 0.2:
        blit(fg, pill(110, 54, BLUE), W / 2, 815, 1, fade_in(t, t2 + .2))
        blit(fg, text_spr("VS", "Black", 34, fill=WHITE), W / 2, 815, 1, fade_in(t, t2 + .2))


def scene_cta(fg, t, sc):
    cy = 560 + 12 * math.sin(t * 2.6)
    blit(fg, card(360, 360, 88, glow=46, galpha=120), W / 2, cy, 0.6 + 0.4 * pop(t, 0.05, .55), fade_in(t, .05, .2))
    blit(fg, icon("plane"), W / 2 + 8 * math.sin(t * 3), cy - 6 * math.sin(t * 3), 0.5 + 0.5 * pop(t, 0.2, .55), fade_in(t, .2))
    ring_pulse(fg, W / 2, cy, 360, 0.1, t)
    ring_pulse(fg, W / 2, cy, 360, 1.1, t)
    p = sc["phrases"][0]
    blit(fg, text_spr("CHAMA NO", "Black", 140, fill=WHITE), W / 2, 880, 0.85 + 0.15 * pop(t, 0.25, .45), fade_in(t, .25, .2))
    blit(fg, text_spr("DIRECT", "Black", 240, fill=GRAD, glow=20), W / 2, 1060 + (1 - ease_out((t - .45) / .5)) * 40,
         0.8 + 0.2 * pop(t, 0.45, .5) + 0.02 * math.sin(t * 5), fade_in(t, .45, .2))
    a = fade_in(t, 0.9, .4)
    blit(fg, pill(860, 78, (14, 36, 96)), W / 2, 1235, 1, a)
    blit(fg, text_spr("SITE EM ATÉ 4 DIAS  ·  PAGAMENTO ÚNICO", "ExtraBold", 33, fill=CYAN, track=1), W / 2, 1235, 1, a)


SCENE_FN = {"hook1": scene_hook1, "hook2": scene_hook2, "r1": scene_reason, "r2": scene_reason, "r3": scene_reason,
            "r4": scene_reason, "r5": scene_reason, "prazo": scene_prazo, "pagto": scene_pagto, "cta": scene_cta}

# --------------------------------------------------------------------------- legendas palavra por palavra
MERGE = {"número um": "NÚMERO 1", "número dois": "NÚMERO 2", "número três": "NÚMERO 3", "número quatro": "NÚMERO 4",
         "número cinco": "NÚMERO 5", "vinte e quatro horas": "24 HORAS", "cinco motivos": "5 MOTIVOS",
         "quatro dias": "4 DIAS"}


def _norm(w):
    return w.lower().strip(",.?!")


def build_captions():
    toks, i = [], 0
    while i < len(ALL_WORDS):
        for n in (4, 3, 2, 1):
            if i + n > len(ALL_WORDS):
                continue
            chunk = ALL_WORDS[i:i + n]
            key = " ".join(_norm(c["w"]) for c in chunk)
            if n > 1 and key in MERGE:
                text = MERGE[key]
            elif n == 1:
                text = chunk[0]["w"].upper().strip(",.")
            else:
                continue
            toks.append({"t": text, "s": chunk[0]["s"], "e": chunk[-1]["e"], "p": chunk[-1]["w"][-1] in ",.?"})
            i += n
            break
    groups, cur = [], []
    for tk in toks:
        if cur and (len(cur) >= 3 or sum(len(x["t"]) for x in cur) + len(tk["t"]) > 20 or cur[-1]["p"]
                    or tk["s"] - cur[-1]["e"] > 0.3):
            groups.append(cur)
            cur = []
        cur.append(tk)
    if cur:
        groups.append(cur)
    return groups


CAPS = build_captions()
CAP_Y = 1405


def draw_caption(t):
    g = next((g for gi, g in enumerate(CAPS)
              if g[0]["s"] - 0.02 <= t < (CAPS[gi + 1][0]["s"] - 0.02 if gi + 1 < len(CAPS) else g[-1]["e"] + 0.5)
              and t < g[-1]["e"] + 0.25), None)
    if g is None:
        return None
    size = 100
    while True:
        f = font("Black", size)
        widths = [f.getlength(x["t"]) for x in g]
        total = sum(widths) + 34 * (len(g) - 1) + 0
        if total <= 940 or size <= 52:
            break
        size -= 4
    lay = Image.new("RGBA", (W, 260), (0, 0, 0, 0))
    gap = 34
    x = W / 2 - total / 2
    cy = 130
    since = t - g[0]["s"]
    gscale = 0.9 + 0.1 * ease_back(since / 0.14)
    for tk, wd in zip(g, widths):
        active = tk["s"] - 0.02 <= t < tk["e"] + 0.02 or (tk is g[-1] and t >= tk["s"])
        if active:
            box = pill(int(wd + 56), int(size * 1.28), BLUE)
            glowspr = card(int(wd + 56), int(size * 1.28), int(size * .64), (30, 107, 255), (30, 107, 255), (30, 107, 255), 0,
                           glow=24, galpha=170)
            paste(lay, glowspr, x + wd / 2 - glowspr.width / 2, cy - glowspr.height / 2)
            paste(lay, box, x + wd / 2 - box.width / 2, cy - box.height / 2)
        spr = text_spr(tk["t"], "Black", size, fill=WHITE, stroke=0 if active else 9, stroke_fill=(0, 0, 0))
        paste(lay, spr, x + wd / 2 - spr.width / 2, cy - spr.height / 2 + size * 0.04)
        x += wd + gap
    if abs(gscale - 1) > 0.003:
        lay = lay.resize((int(W * gscale), int(260 * gscale)), Image.BILINEAR)
    return lay


# --------------------------------------------------------------------------- quadro
def render_frame(i):
    t = i / FPS
    img = background(t)
    sc = next(s for s in SCENES if s["s"] <= t < s["e"]) if t < DUR else SCENES[-1]
    tl = t - sc["s"]
    fg = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    SCENE_FN[sc["name"]](fg, tl, sc)
    # saída suave no fim da cena (exceto a última)
    left = sc["e"] - t
    if sc is not SCENES[-1] and left < 0.12:
        k = clamp(left / 0.12)
        fg.putalpha(fg.getchannel("A").point(lambda v, k=k: int(v * k)))
    elif sc is SCENES[-1] and t > DUR - 0.5:
        k = clamp((DUR - t) / 0.5)
        fg.putalpha(fg.getchannel("A").point(lambda v, k=k: int(v * k)))
    img.alpha_composite(fg)
    # feixe de luz na troca de cena
    if sc is not SCENES[0] and tl < 0.4:
        k = tl / 0.4
        paste(img, STREAK, 0, -300 + (H + 300) * ease_out(k))
    cap = draw_caption(t)
    if cap is not None:
        paste(img, cap, W / 2 - cap.width / 2, CAP_Y - cap.height / 2)
    return img.convert("RGB")


def render_bytes(i):
    return render_frame(i).tobytes()


# --------------------------------------------------------------------------- áudio
SR = 44100


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def synth_music(dur, bpm=98):
    n = int((dur + 2) * SR)
    out = np.zeros(n, np.float32)
    beat = 60 / bpm
    chords = [(57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)]  # Am F C G
    tt = np.arange(n) / SR

    def add(start, sig):
        i0 = int(start * SR)
        if i0 >= n:
            return
        sig = sig[: n - i0]
        out[i0:i0 + len(sig)] += sig

    bar = beat * 4
    nbars = int(dur / bar) + 2
    for b in range(nbars):
        ch = chords[b % 4]
        L = int(bar * SR)
        x = np.arange(L) / SR
        env = np.minimum(1, x / 0.35) * np.minimum(1, (bar - x) / 0.3)
        pad = np.zeros(L, np.float32)
        for nt in ch:
            f = midi(nt)
            for h, a in ((1, 1.0), (2, 0.35), (3, 0.15)):
                pad += a * np.sin(2 * np.pi * f * h * x + 0.4 * np.sin(2 * np.pi * 0.25 * x)) / h ** .3
                pad += a * np.sin(2 * np.pi * f * 1.004 * h * x) / h ** .3
        add(b * bar, 0.035 * pad * env)
        # baixo
        for q in range(4):
            lq = int(beat * SR)
            xq = np.arange(lq) / SR
            f = midi(ch[0] - 24)
            add(b * bar + q * beat, 0.30 * np.sin(2 * np.pi * f * xq) * np.exp(-xq * 3.2) * np.minimum(1, xq / 0.01))
        # arpejo em colcheias
        seq = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12, ch[0] + 24, ch[2] + 12]
        for k, nt in enumerate(seq):
            la = int(beat * SR)
            xa = np.arange(la) / SR
            f = midi(nt)
            s = (np.sin(2 * np.pi * f * xa) + 0.4 * np.sin(2 * np.pi * 2 * f * xa)) * np.exp(-xa * 7)
            add(b * bar + k * beat / 2, 0.075 * s)
        # bumbo e chimbal
        for q in range(4):
            lk = int(0.3 * SR)
            xk = np.arange(lk) / SR
            ph = 2 * np.pi * (48 * xk + (110 - 48) * (1 - np.exp(-xk * 28)) / 28)
            add(b * bar + q * beat, 0.55 * np.sin(ph) * np.exp(-xk * 12))
        rng = np.random.default_rng(b)
        for q in range(8):
            lh = int(0.07 * SR)
            xh = np.arange(lh) / SR
            nz = np.diff(rng.standard_normal(lh + 1)).astype(np.float32)
            add(b * bar + q * beat / 2 + (beat / 2 if q % 2 == 0 else 0) * 0, 0.05 * nz * np.exp(-xh * 55) * (1 if q % 2 else .45))
    return out[: int(dur * SR)]


def whoosh(length=0.45):
    n = int(length * SR)
    rng = np.random.default_rng(3)
    nz = rng.standard_normal(n).astype(np.float32)
    out = np.zeros(n, np.float32)
    y = 0.0
    for i in range(n):
        x = i / n
        a = 0.02 + 0.5 * x ** 1.6  # passa-baixa abrindo
        y += a * (nz[i] - y)
        out[i] = y
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return out * env * 0.9


def blip(f=620, length=0.12):
    x = np.arange(int(length * SR)) / SR
    return (np.sin(2 * np.pi * f * x) + .3 * np.sin(2 * np.pi * 2 * f * x)) * np.exp(-x * 30) * np.minimum(1, x / 0.003)


def build_audio(path):
    v, vsr = sf.read(f"{SRC}/voice.wav")
    if v.ndim > 1:
        v = v.mean(1)
    tn = np.arange(int(DUR * SR)) / SR
    voice = np.interp(tn, np.arange(len(v)) / vsr, v).astype(np.float32)
    music = synth_music(DUR)
    # abaixa a música quando há voz
    env = np.convolve(np.abs(voice), np.ones(int(0.12 * SR)) / int(0.12 * SR), "same")
    duck = 1 - 0.62 * np.clip(env / 0.10, 0, 1)
    duck = np.convolve(duck, np.ones(int(0.15 * SR)) / int(0.15 * SR), "same")
    music = music * duck * 0.9
    music *= np.minimum(1, tn / 1.0) * np.clip((DUR - tn) / 1.4, 0, 1)
    fx = np.zeros_like(voice)
    wh, bl = whoosh(), blip()
    for sc in SCENES[1:]:
        i0 = int(max(0, sc["s"] - 0.12) * SR)
        seg = wh[: len(fx) - i0]
        fx[i0:i0 + len(seg)] += 0.33 * seg
        j0 = int((sc["s"] + 0.1) * SR)
        seg = bl[: len(fx) - j0]
        fx[j0:j0 + len(seg)] += 0.12 * seg
    mix = voice * 1.0 + music * 0.5 + fx
    mix = mix / max(1.0, np.abs(mix).max() / 0.95)
    sf.write(path, np.stack([mix, mix], 1), SR)


# --------------------------------------------------------------------------- principal
if __name__ == "__main__":
    nframes = int(math.ceil(DUR * FPS))
    if STILLS is not None:
        for tt in STILLS:
            render_frame(int(tt * FPS)).save(f"{OUT}/still_{tt:05.1f}.png")
        sys.exit()
    audio_path = f"{SRC}/mix.wav"
    build_audio(audio_path)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
           "-i", "-", "-i", audio_path, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "medium", "-crf", "17",
           "-pix_fmt", "yuv420p", "-profile:v", "high", "-c:a", "aac", "-b:a", "192k", "-af",
           "loudnorm=I=-14:TP=-1.5:LRA=11", "-shortest", "-movflags", "+faststart", OUT]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    with Pool(4) as pool:
        for k, b in enumerate(pool.imap(render_bytes, range(nframes), chunksize=6)):
            ff.stdin.write(b)
            if k % 150 == 0:
                print(f"{k}/{nframes}", flush=True)
    ff.stdin.close()
    ff.wait()
    print("ok", OUT)
