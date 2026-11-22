"""Motor gráfico do Reels GB GOBÊ: texturas procedurais de brownie, caixas 3D com perspectiva,
chocolate derretido com brilho, partículas. Só PIL + numpy."""
import math
from functools import lru_cache

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageChops

# ------------------------------------------------------------------ utilidades
def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def smooth(a, lo, hi):
    t = np.clip((a - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


def ease_io(x):
    x = clamp(x)
    return x * x * (3 - 2 * x)


def ease_out(x):
    return 1 - (1 - clamp(x)) ** 3


def ease_back(x, k=1.8):
    x = clamp(x)
    return 1 + (k + 1) * (x - 1) ** 3 + k * (x - 1) ** 2


def lerp(a, b, t):
    return a + (b - a) * t


def fn(h, w, seed, base=4, octs=5, gain=0.5):
    """ruído fractal 0..1 (h x w)"""
    rng = np.random.default_rng(seed)
    out = np.zeros((h, w), np.float32)
    amp, tot = 1.0, 0.0
    for o in range(octs):
        gh = base * 2 ** o
        gw = max(2, int(round(gh * w / h)))
        g = rng.random((gh + 1, gw + 1)).astype(np.float32)
        out += np.asarray(Image.fromarray(g, "F").resize((w, h), Image.BICUBIC)) * amp
        tot += amp
        amp *= gain
    out /= tot
    return (out - out.min()) / (out.max() - out.min() + 1e-6)


def mix(c1, c2, t):
    c1, c2 = np.array(c1, np.float32), np.array(c2, np.float32)
    return c1 + (c2 - c1) * t[..., None]


def to_img(arr, alpha=None):
    a = np.clip(arr, 0, 255).astype(np.uint8)
    im = Image.fromarray(a, "RGB").convert("RGBA")
    if alpha is not None:
        im.putalpha(Image.fromarray(np.clip(alpha * 255, 0, 255).astype(np.uint8), "L"))
    return im


# ------------------------------------------------------------------ texturas de brownie
FILL_HI, FILL_LO = (247, 226, 188), (222, 180, 130)   # recheio cremoso neutro (cor única, fácil de trocar)


def _emboss(h, k=1.0, light=(-0.6, -0.8)):
    gy, gx = np.gradient(h)
    return (gx * light[0] + gy * light[1]) * k


def tex_top(S, seed, gloss=1.0, crackle=1.0):
    """casquinha: fina, brilhante e quebradiça — relevo enrugado, rachaduras finas com borda clara"""
    hmap = fn(S, S, seed, 9, 4) * 0.62 + fn(S, S, seed + 4, 26, 3) * 0.38
    hs = np.asarray(Image.fromarray((hmap * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.2)), np.float32) / 255
    emb = _emboss(hs, 62.0)
    base = mix((42, 20, 12), (90, 50, 32), fn(S, S, seed + 8, 3, 4))
    col = base * (1 + np.clip(emb, -0.45, 0.5))[..., None]
    ridge = 1 - np.abs(2 * fn(S, S, seed + 1, 6, 5) - 1)
    crack = smooth(ridge, 0.962 - 0.006 * crackle, 0.992)
    cm = Image.fromarray((crack * 255).astype(np.uint8))
    rim = np.asarray(cm.filter(ImageFilter.GaussianBlur(3.0)), np.float32) / 255
    rim = np.clip(rim * 2.2, 0, 1) * (1 - crack)
    col = col * (1 - 0.30 * rim[..., None]) + np.array((178, 122, 78), np.float32) * 0.30 * rim[..., None]
    col = col * (1 - 0.92 * crack[..., None]) + np.array((22, 9, 5), np.float32) * 0.92 * crack[..., None]
    # flocos claros (casquinha que lasca)
    rng = np.random.default_rng(seed + 5)
    fl = fn(S, S, seed + 6, 40, 2)
    flakes = smooth(fl, 0.80, 0.93) * 0.5
    col += flakes[..., None] * np.array((70, 48, 30), np.float32)
    # brilho de casquinha lustrosa
    sh = smooth(hs, 0.58, 0.78) * smooth(fn(S, S, seed + 2, 3, 3), 0.35, 0.8)
    col += sh[..., None] * np.array((74, 52, 40), np.float32) * gloss
    spk = rng.random((S, S)) > 0.9993
    spk = np.asarray(Image.fromarray((spk * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)), np.float32) / 255
    col += spk[..., None] * np.array((170, 140, 110), np.float32)
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32) / S
    d = np.minimum(np.minimum(xx, 1 - xx), np.minimum(yy, 1 - yy))
    col *= (0.80 + 0.20 * smooth(d, 0, 0.05))[..., None]
    return to_img(col)


def tex_edge(Sw, Sh, seed):
    """faixa do chanfro (quina arredondada da casquinha)"""
    low = fn(Sh, Sw, seed, 3, 4)
    col = mix((52, 27, 17), (96, 56, 36), low)
    yy = np.linspace(0, 1, Sh, dtype=np.float32)[:, None]
    col = col * (0.85 + 0.25 * (1 - yy))[..., None]
    fl = smooth(fn(Sh, Sw, seed + 1, 30, 2), 0.75, 0.92) * 0.5
    col += fl[..., None] * np.array((60, 40, 26), np.float32)
    return to_img(col)


def tex_side(Sw, Sh, seed, crust=0.12):
    """lateral: miolo escuro e úmido, com faixa de casquinha no alto"""
    low = fn(Sh, Sw, seed, 3, 5)
    base = mix((34, 15, 9), (74, 38, 23), low)
    pores = smooth(fn(Sh, Sw, seed + 1, 20, 3), 0.0, 0.2)
    base = base * (0.78 + 0.22 * pores[..., None])
    hmap = fn(Sh, Sw, seed + 3, 12, 3)
    base = base * (1 + np.clip(_emboss(hmap, 18.0), -0.3, 0.4))[..., None]
    yy = np.linspace(0, 1, Sh, dtype=np.float32)[:, None]
    band = 1 - smooth(yy, crust * 0.6, crust)
    crust_col = mix((92, 52, 33), (138, 84, 52), fn(Sh, Sw, seed + 2, 12, 3))
    col = base * (1 - band[..., None]) + crust_col * band[..., None]
    col *= (0.82 + 0.18 * (1 - yy))[..., None]
    return to_img(col)


def _chunks(img, rng, n, Sw, Sh, y0, y1):
    lay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    for _ in range(n):
        cx, cy = rng.uniform(0.04, 0.96) * Sw, rng.uniform(y0, y1) * Sh
        r = rng.uniform(0.014, 0.034) * Sw
        sq = rng.uniform(0.7, 1.0)
        d.ellipse([cx - r, cy - r * sq, cx + r, cy + r * sq], fill=(22, 9, 5, 255))
        d.ellipse([cx - r * 0.55, cy - r * sq * 0.75, cx + r * 0.1, cy - r * sq * 0.05], fill=(112, 66, 42, 150))
    lay = lay.filter(ImageFilter.GaussianBlur(1.2))
    img.alpha_composite(lay)


def tex_cut(Sw, Sh, seed, filling=False, jag=True, fill=None):
    """face do corte: miolo denso e úmido (com recheio opcional); borda superior irregular"""
    rng = np.random.default_rng(seed)
    low = fn(Sh, Sw, seed, 4, 5)
    base = mix((40, 17, 10), (106, 56, 34), low)
    p = fn(Sh, Sw, seed + 1, 22, 3)
    holes = smooth(p, 0.22, 0.0)
    base = base * (1 - 0.40 * holes[..., None])
    hmap = fn(Sh, Sw, seed + 3, 10, 4)
    base = base * (1 + np.clip(_emboss(hmap, 30.0), -0.35, 0.45))[..., None]
    sh = smooth(fn(Sh, Sw, seed + 2, 6, 3), 0.55, 0.88)
    base += sh[..., None] * np.array((92, 60, 42), np.float32)           # brilho de miolo úmido
    yy = np.linspace(0, 1, Sh, dtype=np.float32)[:, None] * np.ones((1, Sw), np.float32)
    ct = 0.10
    band = 1 - smooth(yy, ct * 0.65, ct)
    ccol = mix((126, 76, 48), (178, 118, 74), fn(Sh, Sw, seed + 4, 24, 3))
    base = base * (1 - band[..., None]) + ccol * band[..., None]
    img = to_img(base)
    _chunks(img, rng, 14, Sw, Sh, 0.18, 0.95)
    arr = np.asarray(img).astype(np.float32)
    if filling:
        y_up = 0.34 + 0.022 * np.sin(np.linspace(0, 6.5, Sw) + seed) + 0.010 * np.sin(np.linspace(0, 19, Sw))
        y_dn = 0.70 + 0.022 * np.sin(np.linspace(0, 5.0, Sw) + 2 + seed) + 0.010 * np.sin(np.linspace(0, 17, Sw))
        Y = np.linspace(0, 1, Sh)[:, None]
        inside = smooth((Y - y_up[None, :]) / 0.012, 0, 1) * (1 - smooth((Y - y_dn[None, :]) / 0.012, 0, 1))
        tt = np.clip((Y - y_up[None, :]) / (y_dn[None, :] - y_up[None, :] + 1e-6), 0, 1)
        fhi, flo = fill or (FILL_HI, FILL_LO)
        fcol = mix(fhi, flo, (tt * 0.9 + 0.1 * fn(Sh, Sw, seed + 9, 6, 3)))
        glint = smooth(fn(Sh, Sw, seed + 11, 3, 3), 0.62, 0.9) * (1 - tt)
        gcol = (24, 20, 16) if sum(fhi) > 450 else (78, 58, 44)       # recheio escuro precisa de mais brilho
        fcol = fcol + glint[..., None] * np.array(gcol, np.float32)
        edge = smooth(np.abs(tt - 0.5) * 2, 0.88, 1.0)
        fcol = fcol * (1 - 0.34 * edge[..., None])
        arr[..., :3] = arr[..., :3] * (1 - inside[..., None]) + fcol * inside[..., None]
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
    if jag:
        x = np.arange(Sw)
        prof = (0.030 + 0.020 * np.sin(x / 9.0 + seed) + 0.016 * np.sin(x / 3.1 + 2 * seed)
                + 0.014 * (rng.random(Sw) - 0.5)) * Sh
        A = (np.arange(Sh)[:, None] >= prof[None, :]).astype(np.float32)
        a = Image.fromarray((A * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(0.8))
        im.putalpha(a)
    return im


class Brownie:
    """conjunto de texturas de um brownie (inteiro e metades). Construído uma vez por processo."""
    CH = 0.032  # largura do chanfro (quina arredondada)

    def __init__(self, seed, filling=False, height=0.44, depth=0.86, gloss=1.0, crust=0.12, crackle=1.0, fill=None):
        self.seed, self.filling, self.h, self.d = seed, filling, height, depth
        TS = 768
        self.top = tex_top(TS, seed, gloss, crackle)
        self.side_long = tex_side(TS, int(TS * height), seed + 20, crust)
        self.side_end = tex_side(int(TS * depth), int(TS * height), seed + 30, crust)
        self.edge = tex_edge(TS, 56, seed + 70)
        self.cut_l = tex_cut(int(TS * depth), int(TS * (height + 0.03)), seed + 40, filling, fill=fill)
        self.cut_r = tex_cut(int(TS * depth), int(TS * (height + 0.03)), seed + 50, filling, fill=fill)

    def _tex(self, top, sl, cut_key=None, cut_tex=None, edges=("front", "back", "left", "right")):
        tex = dict(top=top, front=sl, back=sl, left=self.side_end, right=self.side_end)
        for e in edges:
            tex["ch_" + e] = self.edge
        if cut_key:
            tex[cut_key] = cut_tex
        return tex

    def whole(self, pos=(0, 0, 0), rot=None):
        return dict(size=(1.0, self.h, self.d), pos=np.array(pos, float), rot=np.eye(3) if rot is None else rot,
                    cham=self.CH, tex=self._tex(self.top, self.side_long))

    def half(self, which, pos, rot):
        """which: 'L' (corte para +x) ou 'R' (corte para -x)"""
        TS = self.top.width
        if which == "L":
            top = self.top.crop((0, 0, TS // 2, TS))
            sl = self.side_long.crop((0, 0, TS // 2, self.side_long.height))
            cut_key, cut_tex, edges = "right", self.cut_l, ("front", "back", "left")
        else:
            top = self.top.crop((TS // 2, 0, TS, TS))
            sl = self.side_long.crop((TS // 2, 0, TS, self.side_long.height))
            cut_key, cut_tex, edges = "left", self.cut_r, ("front", "back", "right")
        return dict(size=(0.5, self.h, self.d), pos=np.array(pos, float), rot=rot, cut=cut_key, cham=self.CH,
                    tex=self._tex(top, sl, cut_key, cut_tex, edges))


# ------------------------------------------------------------------ 3D simples
def rotY(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def rotX(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


def rotZ(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


def _faces(w, h, d, cut=None, cham=0.0, edges=("front", "back", "left", "right")):
    """cantos (p00,p10,p11,p01) de cada face. Quinas superiores chanfradas; o corte sobe um pouco acima da casquinha."""
    x, y, z = w / 2, h / 2, d / 2
    c = cham
    e = {k: (k in edges) for k in ("front", "back", "left", "right")}
    x0 = -x + (c if e["left"] else 0); x1 = x - (c if e["right"] else 0)
    z0 = -z + (c if e["back"] else 0); z1 = z - (c if e["front"] else 0)
    yl = lambda k: y - (c if e[k] else 0)     # altura em que a lateral termina
    f = {
        "top": [(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)],
        "front": [(-x, yl("front"), z), (x, yl("front"), z), (x, -y, z), (-x, -y, z)],
        "back": [(x, yl("back"), -z), (-x, yl("back"), -z), (-x, -y, -z), (x, -y, -z)],
        "right": [(x, yl("right"), z), (x, yl("right"), -z), (x, -y, -z), (x, -y, z)],
        "left": [(-x, yl("left"), -z), (-x, yl("left"), z), (-x, -y, z), (-x, -y, -z)],
    }
    if c > 0:
        if e["front"]:
            f["ch_front"] = [(-x, y - c, z), (x, y - c, z), (x1, y, z1), (x0, y, z1)]
        if e["back"]:
            f["ch_back"] = [(x, y - c, -z), (-x, y - c, -z), (x0, y, z0), (x1, y, z0)]
        if e["right"]:
            f["ch_right"] = [(x, y - c, z), (x, y - c, -z), (x1, y, z0), (x1, y, z1)]
        if e["left"]:
            f["ch_left"] = [(-x, y - c, -z), (-x, y - c, z), (x0, y, z1), (x0, y, z0)]
    if cut in ("left", "right"):
        up = 0.035
        sx = 1 if cut == "right" else -1
        zz = [z, -z] if cut == "right" else [-z, z]
        f[cut] = [(sx * x, y + up, zz[0]), (sx * x, y + up, zz[1]), (sx * x, -y, zz[1]), (sx * x, -y, zz[0])]
    return f


def _homography(dst, src):
    A, b = [], []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -x * u, -y * u]); b.append(u)
        A.append([0, 0, 0, x, y, 1, -x * v, -y * v]); b.append(v)
    return np.linalg.solve(np.array(A, float), np.array(b, float))


LIGHT = np.array([-0.45, 0.80, 0.55]); LIGHT /= np.linalg.norm(LIGHT)


def render_solids(solids, cam, ss=2):
    """cam: S (px por unidade), cx, cy (px), elev (rad), D (distância da câmera).
    Devolve (RGBA no tamanho do bbox, (x0,y0), info) — info traz polígonos de faces visíveis."""
    Rv = rotX(cam["elev"])
    D = cam.get("D", 5.0)
    S, cx, cy = cam["S"], cam["cx"], cam["cy"]
    faces = []

    def proj(P):
        k = S * D / (D - P[:, 2])
        return np.stack([cx + k * P[:, 0], cy - k * P[:, 1]], 1)

    for s in solids:
        w, h, d = s["size"]
        R = s["rot"]
        ctr = (s["pos"]) @ Rv.T
        cut = s.get("cut")
        edges = tuple(k[3:] for k in s["tex"] if k.startswith("ch_"))
        fdict = _faces(w, h, d, cut, s.get("cham", 0.0), edges)
        items = [(n, fdict[n], t) for n, t in s["tex"].items() if n in fdict]
        for name, corners, tex in items:
            P = (np.array(corners, float) @ R.T + s["pos"]) @ Rv.T
            fc = P.mean(0)
            n = np.cross(P[1] - P[0], P[3] - P[0])
            if np.dot(n, fc - ctr) < 0:
                n = -n
            nn = np.linalg.norm(n)
            if nn < 1e-9:
                continue
            n /= nn
            cam_pos = np.array([0, 0, D])
            if np.dot(n, cam_pos - fc) <= 0:
                continue
            faces.append(dict(name=name, P=P, n=n, z=fc[2], tex=tex, owner=s))
    if not faces:
        return None
    faces.sort(key=lambda f: f["z"])
    allpts = np.concatenate([proj(f["P"]) for f in faces])
    x0, y0 = np.floor(allpts.min(0)).astype(int) - 6
    x1, y1 = np.ceil(allpts.max(0)).astype(int) + 6
    x0, y0 = max(x0, -400), max(y0, -400)
    x1, y1 = min(x1, 1480), min(y1, 2320)
    bw, bh = (x1 - x0) * ss, (y1 - y0) * ss
    layer = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
    info = []
    for f in faces:
        q = (proj(f["P"]) - np.array([x0, y0])) * ss
        c = q.mean(0)
        qe = c + (q - c) * (1 + 1.2 / max(40.0, np.linalg.norm(q - c, axis=1).mean()))  # +~1px contra frestas
        bx0, by0 = np.floor(qe.min(0)).astype(int) - 1
        bx1, by1 = np.ceil(qe.max(0)).astype(int) + 1
        bx0c, by0c, bx1c, by1c = max(bx0, 0), max(by0, 0), min(bx1, bw), min(by1, bh)
        if bx1c <= bx0c or by1c <= by0c:
            continue
        tex = f["tex"]
        src = [(0, 0), (tex.width, 0), (tex.width, tex.height), (0, tex.height)]
        dst = [(p[0] - bx0c, p[1] - by0c) for p in qe]
        try:
            co = _homography(dst, src)
        except np.linalg.LinAlgError:
            continue
        warped = tex.transform((bx1c - bx0c, by1c - by0c), Image.PERSPECTIVE, tuple(co), Image.BICUBIC)
        diff = max(0.0, float(np.dot(f["n"], LIGHT)))
        spec = 0.0
        if f["name"] == "top":
            hv = LIGHT + np.array([0, 0, 1.0]); hv /= np.linalg.norm(hv)
            spec = max(0.0, float(np.dot(f["n"], hv))) ** 14
        br = 0.52 + 0.78 * diff
        rgb = ImageEnhance.Brightness(warped.convert("RGB")).enhance(br)
        if spec > 0.02:
            rgb = ImageChops.add(rgb, Image.new("RGB", rgb.size, (int(70 * spec), int(48 * spec), int(34 * spec))))
        out = rgb.convert("RGBA")
        out.putalpha(warped.getchannel("A"))
        layer.alpha_composite(out, (bx0c, by0c))
        info.append(dict(name=f["name"], owner=f["owner"], quad=q / ss + np.array([x0, y0])))
    layer = layer.resize((x1 - x0, y1 - y0), Image.LANCZOS)
    return layer, (x0, y0), info


# ------------------------------------------------------------------ chocolate derretido
CHOC = (66, 32, 20)


def choc_rgba(mask, base=CHOC, bevel=7.0, goo=9, K=26.0, gloss=1.0, t=0.0):
    """mask: imagem 'L' em meia resolução. Devolve RGBA com brilho de chocolate líquido (meia res)."""
    m = mask.filter(ImageFilter.GaussianBlur(goo)) if goo else mask
    a = np.asarray(m, np.float32) / 255
    cov = smooth(a, 0.42, 0.58)
    hg = np.asarray(Image.fromarray((cov * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(bevel)), np.float32) / 255
    gy, gx = np.gradient(hg)
    nx, ny = -gx * K, -gy * K
    nz = np.ones_like(nx)
    ln = np.sqrt(nx * nx + ny * ny + nz * nz)
    nx, ny, nz = nx / ln, ny / ln, nz / ln
    L = np.array([-0.45, -0.55, 0.70]); L /= np.linalg.norm(L)
    diff = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
    Hh = L + np.array([0, 0, 1.0]); Hh /= np.linalg.norm(Hh)
    spec = np.clip(nx * Hh[0] + ny * Hh[1] + nz * Hh[2], 0, 1) ** 60
    base = np.array(base, np.float32)
    col = base[None, None, :] * (0.40 + 0.85 * diff[..., None])
    col += spec[..., None] * np.array((255, 226, 196), np.float32) * 0.95 * gloss
    # reflexo suave de janela (faixa diagonal) — dá a sensação de líquido
    hh, ww = a.shape
    yy, xx = np.mgrid[0:hh, 0:ww].astype(np.float32)
    warp = np.sin(yy / 61.0 + t * 0.7) * 22 + np.sin(xx / 47.0 - t * 0.5) * 14
    band = smooth(np.sin((xx * 0.9 + yy * 0.55 + warp) / 70.0 + t * 0.4), 0.80, 1.0) * 0.07 * gloss
    col += (band * cov)[..., None] * np.array((255, 210, 170), np.float32) * (hg[..., None] * 0.6 + 0.4)
    edge = smooth(hg, 0.0, 0.55)
    col *= (0.62 + 0.38 * edge)[..., None]
    img = to_img(col, cov)
    return img


def over(frame, rgba_half, pos=(0, 0)):
    big = rgba_half.resize((rgba_half.width * 2, rgba_half.height * 2), Image.BICUBIC)
    frame.alpha_composite(big, pos)


# ------------------------------------------------------------------ onda de chocolate (transição)
class Wave:
    """faixa de chocolate que atravessa a tela; fingers deixam bordas orgânicas e gotas"""

    def __init__(self, direction, seed, W2=540, H2=960):
        self.dir, self.W2, self.H2 = direction, W2, H2
        rng = np.random.default_rng(seed)
        self.along = H2 if direction in ("down", "up") else W2    # eixo do movimento
        self.across = W2 if direction in ("down", "up") else H2   # eixo ortogonal
        q = np.arange(self.across, dtype=np.float32)
        self.lead_f = self._fingers(q, rng, 11, 18, 52, 40, 200)
        self.trail_f = self._fingers(q, rng, 14, 8, 26, 50, 360)
        self.fm = float(self.lead_f.max())
        self.tm = float(self.trail_f.max())
        self.B = self.along * 1.5
        self.total = self.along + self.B + self.fm + self.tm + 40
        # janela de cobertura total
        ss = np.linspace(0, 1, 2001)
        full = []
        for s in ss:
            pl = -self.fm + s * self.total
            pt = pl - self.B
            if (pl + self.lead_f.min() >= self.along) and (pt - self.trail_f.max() <= 0):
                full.append(s)
        self.s_lo, self.s_hi = (full[0], full[-1]) if full else (0.5, 0.5)
        self.s_mid = 0.5 * (self.s_lo + self.s_hi)

    @staticmethod
    def _fingers(q, rng, n, wmin, wmax, lmin, lmax):
        g = np.zeros_like(q)
        for _ in range(n):
            c = rng.uniform(0, q.max())
            w = rng.uniform(wmin, wmax)
            ln = rng.uniform(lmin, lmax)
            u = np.clip((q - c) / w, -1, 1)
            g = np.maximum(g, ln * np.sqrt(1 - u * u))
        return g

    def mask(self, s):
        pl = -self.fm + s * self.total
        pt = pl - self.B
        lead = pl + self.lead_f        # borda da frente (com dedos)
        trail = pt - self.trail_f      # borda de trás (rastros pingando)
        p = np.arange(self.along, dtype=np.float32)[:, None]
        cov = (p < lead[None, :]) & (p > trail[None, :])
        m = (cov.astype(np.uint8) * 255)
        img = Image.fromarray(m, "L")
        # eixo do movimento está nas linhas: 'down' -> y; para 'right'/'left' transpõe
        if self.dir == "down":
            pass
        elif self.dir == "up":
            img = img.transpose(Image.FLIP_TOP_BOTTOM)
        elif self.dir == "right":
            img = img.transpose(Image.TRANSPOSE)
        elif self.dir == "left":
            img = img.transpose(Image.TRANSPOSE).transpose(Image.FLIP_LEFT_RIGHT)
        return img


# ------------------------------------------------------------------ partículas
def draw_crumbs(layer, crumbs, t, blur=0):
    """crumbs: lista de dict(t0,x0,y0,vx,vy,r,rot,vr,seed). Gravidade em px/s²."""
    d = ImageDraw.Draw(layer)
    g = 2600.0
    for c in crumbs:
        tau = t - c["t0"]
        if tau < 0:
            continue
        x = c["x0"] + c["vx"] * tau
        y = c["y0"] + c["vy"] * tau + 0.5 * g * tau * tau
        if y > 2100 or x < -80 or x > 1160:
            continue
        a = c["rot"] + c["vr"] * tau
        rng = np.random.default_rng(c["seed"])
        k = 6
        pts = []
        for i in range(k):
            ang = a + 2 * math.pi * i / k
            rr = c["r"] * rng.uniform(0.65, 1.2)
            pts.append((x + rr * math.cos(ang), y + rr * math.sin(ang) * 0.85))
        shade = c.get("shade", 0)
        base = (58 + shade, 29 + shade // 2, 19 + shade // 3, 255)
        d.polygon(pts, fill=base)
        d.line(pts[:3], fill=(150, 96, 62, 220), width=max(1, int(c["r"] * 0.18)))
    if blur:
        return layer.filter(ImageFilter.GaussianBlur(blur))
    return layer


def make_crumbs(n, t0, cx, cy, spread, seed, vmax=380, rmin=4, rmax=11, up=-250):
    rng = np.random.default_rng(seed)
    out = []
    for i in range(n):
        out.append(dict(t0=t0 + rng.uniform(0, 0.5), x0=cx + rng.uniform(-spread, spread), y0=cy + rng.uniform(-30, 30),
                        vx=rng.uniform(-vmax, vmax), vy=rng.uniform(up - 220, up + 120), r=rng.uniform(rmin, rmax),
                        rot=rng.uniform(0, 6.28), vr=rng.uniform(-6, 6), seed=int(rng.integers(1 << 30)),
                        shade=int(rng.integers(0, 40))))
    return out


def bokeh(w, h, t, colors, n, seed, rmin=22, rmax=70, speed=14, alpha=70):
    """discos suaves flutuando (profundidade de campo); desenhado em meia resolução"""
    rng = np.random.default_rng(seed)
    layer = Image.new("RGBA", (w // 2, h // 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for i in range(n):
        x = rng.uniform(0, w); y0 = rng.uniform(0, h); r = rng.uniform(rmin, rmax)
        sp = rng.uniform(0.4, 1.0) * speed
        y = (y0 - sp * t * 3) % (h + 2 * r) - r
        x = x + 18 * math.sin(t * 0.4 + i)
        c = colors[i % len(colors)]
        a = int(alpha * rng.uniform(0.5, 1.0))
        d.ellipse([(x - r) / 2, (y - r) / 2, (x + r) / 2, (y + r) / 2], fill=c + (a,))
    return layer.filter(ImageFilter.GaussianBlur(5)).resize((w, h), Image.BILINEAR)


def sparkle(draw_layer, x, y, size, a=1.0, col=(255, 244, 220)):
    d = ImageDraw.Draw(draw_layer)
    al = int(255 * clamp(a))
    for sx, sy in ((size, size * 0.10), (size * 0.10, size)):
        d.polygon([(x - sx, y), (x, y - sy), (x + sx, y), (x, y + sy)], fill=col + (al,))
    d.ellipse([x - size * 0.16, y - size * 0.16, x + size * 0.16, y + size * 0.16], fill=col + (al,))
