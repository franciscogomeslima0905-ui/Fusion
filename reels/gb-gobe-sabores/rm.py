"""Renderizador 3D de brownie (ray marching em numpy): corpo de caixa arredondada e irregular, casquinha com relevo,
mordida opcional e coberturas por mapa de alturas (chantilly em espirais, Nutella em riscos, doce de leite, ganache)
mais pedaços de Kinder Bueno. Luz e relevo são calculados por pixel (nada de textura 'assada')."""
import math
import numpy as np
from PIL import Image, ImageFilter
from gfx import fn, smooth, rotX, rotY, rotZ, mix

A, B, C, RAD = 0.5, 0.21, 0.43, 0.05        # semi-larguras do corpo e raio das quinas
TOPMAX = 0.20                                # altura máxima da cobertura
LIGHT1 = np.array([-0.5, 0.75, 0.62]); LIGHT1 /= np.linalg.norm(LIGHT1)
LIGHT2 = np.array([0.75, 0.15, 0.45]); LIGHT2 /= np.linalg.norm(LIGHT2)


def bil(tex, u, v):
    h, w = tex.shape[:2]
    x = np.clip(u, 0, 1) * (w - 1); y = np.clip(v, 0, 1) * (h - 1)
    x0 = x.astype(np.int32); y0 = y.astype(np.int32)
    x1 = np.minimum(x0 + 1, w - 1); y1 = np.minimum(y0 + 1, h - 1)
    fx, fy = x - x0, y - y0
    if tex.ndim == 3:
        fx, fy = fx[:, None], fy[:, None]
    return (tex[y0, x0] * (1 - fx) * (1 - fy) + tex[y0, x1] * fx * (1 - fy) + tex[y1, x0] * (1 - fx) * fy + tex[y1, x1] * fx * fy)


def _blur(a, r):
    im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r)), np.float32) / 255


# ------------------------------------------------------------------ materiais do brownie
class BrownieMats:
    def __init__(self, seed=11):
        S = 1024
        h = fn(S, S, seed, 7, 4) * 0.55 + fn(S, S, seed + 4, 24, 3) * 0.30 + fn(S, S, seed + 40, 70, 2) * 0.15
        ridge = 1 - np.abs(2 * fn(S, S, seed + 1, 6, 5) - 1)
        crack = smooth(ridge, 0.945, 0.985)
        rim = np.clip(_blur(crack, 3.0) * 2.2, 0, 1) * (1 - crack)
        base = mix((32, 15, 9), (74, 38, 24), fn(S, S, seed + 8, 3, 4))
        base = base * (1 - 0.45 * rim[..., None]) + np.array((150, 98, 62), np.float32) * 0.45 * rim[..., None]
        base = base * (1 - 0.92 * crack[..., None]) + np.array((14, 6, 4), np.float32) * 0.92 * crack[..., None]
        flakes = smooth(fn(S, S, seed + 6, 40, 2), 0.80, 0.93) * 0.5
        base += flakes[..., None] * np.array((60, 40, 26), np.float32)
        self.crust_alb = base.astype(np.float32)
        hh = _blur(h, 1.1) - 0.45 * crack             # rachaduras viram vales no relevo
        self.crust_h = hh.astype(np.float32)
        gy, gx = np.gradient(hh)
        self.crust_gx = (gx * S / (2 * A) * 0.020).astype(np.float32)   # inclinação por unidade de mundo
        self.crust_gz = (gy * S / (2 * C) * 0.020).astype(np.float32)
        self.crust_shine = (0.55 + 0.45 * smooth(fn(S, S, seed + 2, 3, 3), 0.35, 0.8)).astype(np.float32)
        # laterais: miolo denso e escuro, com poros
        SW, SH = 1024, 512
        low = fn(SH, SW, seed + 20, 4, 5)
        pores = smooth(fn(SH, SW, seed + 21, 22, 3), 0.0, 0.22)
        a = mix((30, 13, 8), (68, 34, 21), low) * (0.70 + 0.30 * pores[..., None])
        self.side_alb = a.astype(np.float32)
        sh = fn(SH, SW, seed + 23, 12, 3)
        gy, gx = np.gradient(_blur(sh, 1.2))
        self.side_gu = (gx * SW * 0.005).astype(np.float32); self.side_gv = (gy * SH * 0.005).astype(np.float32)
        # miolo exposto (mordida): úmido, brilhante, com pedaços de chocolate
        low = fn(SH, SW, seed + 30, 5, 5)
        a = mix((38, 16, 9), (96, 50, 30), low)
        pk = smooth(fn(SH, SW, seed + 31, 28, 3), 0.28, 0.0)
        a = a * (1 - 0.45 * pk[..., None])
        ch = smooth(fn(SH, SW, seed + 33, 14, 2), 0.78, 0.9)
        a = a * (1 - 0.6 * ch[..., None]) + 0
        self.in_alb = a.astype(np.float32)
        hi = _blur(fn(SH, SW, seed + 34, 16, 3), 1.0)
        gy, gx = np.gradient(hi)
        self.in_gu = (gx * SW * 0.011).astype(np.float32); self.in_gv = (gy * SH * 0.011).astype(np.float32)
        self.in_shine = (0.4 + 0.6 * smooth(fn(SH, SW, seed + 35, 6, 3), 0.5, 0.85)).astype(np.float32)


# ------------------------------------------------------------------ coberturas (mapas de altura)
FOOT = 512


def _grid():
    u = (np.arange(FOOT, dtype=np.float32) + 0.5) / FOOT
    X = (u[None, :] - 0.5) * 2 * A * np.ones((FOOT, 1), np.float32)
    Z = (u[:, None] - 0.5) * 2 * C * np.ones((1, FOOT), np.float32)
    return X, Z


def _footprint(inset=0.045):
    X, Z = _grid()
    d = np.minimum(A - inset - np.abs(X), C - inset - np.abs(Z))
    return smooth(d, 0.0, 0.085)


def rosettes(centers, rad, h0, delays, seed):
    X, Z = _grid()
    T = np.zeros_like(X); D = np.zeros_like(X)
    for (cx, cz), dl in zip(centers, delays):
        dx, dz = X - cx, Z - cz
        r = np.sqrt(dx * dx + dz * dz) / rad
        th = np.arctan2(dz, dx)
        sh = np.clip(1 - r * r, 0, 1) ** 0.85 * (0.80 + 0.20 * np.cos(5 * th - 12 * r + dl * 3))
        tip = 0.18 * np.exp(-(r / 0.22) ** 2)
        hk = h0 * (sh + tip * (r < 1))
        mask = hk > T
        T = np.where(mask, hk, T); D = np.where(mask, dl, D)
    return T, D


def topping_swirl(color, gloss=0.9, seed=3, grid=((-0.30, -0.19), (0.0, -0.19), (0.30, -0.19), (-0.30, 0.17), (0.0, 0.17), (0.30, 0.17)), rad=0.20, only_left=False):
    cs = list(grid)
    if only_left:
        cs = [(x * 0.62 - 0.17, z) for (x, z) in cs if x <= 0.0 or True][:6]
    rng = np.random.default_rng(seed)
    cs = [(x + rng.uniform(-0.02, 0.02), z + rng.uniform(-0.02, 0.02)) for x, z in cs]
    delays = [0.10 * i for i in range(len(cs))]
    T, D = rosettes(cs, rad, 0.12, delays, seed)
    base = 0.016 * _footprint(0.06)
    T = np.maximum(T, base)
    return dict(T=T.astype(np.float32), D=D.astype(np.float32), col=np.array(color, np.float32), gloss=gloss, kind="swirl")


def topping_streak(color, gloss=0.8, seed=5):
    X, Z = _grid()
    fp = _footprint(0.035)
    wob = fn(FOOT, FOOT, seed, 4, 3)
    rid = 0.5 + 0.5 * np.sin(2 * np.pi * (Z * 17.0 + 0.55 * (wob - 0.5)) + 0.9 * np.sin(X * 5))
    lump = smooth(fn(FOOT, FOOT, seed + 1, 2, 3), 0.45, 0.85)
    T = fp * (0.040 + 0.030 * rid + 0.035 * lump)
    D = np.clip((X + A) / (2 * A), 0, 1) * 0.9            # espalha da esquerda para a direita
    return dict(T=T.astype(np.float32), D=D.astype(np.float32), col=np.array(color, np.float32), gloss=gloss, kind="streak")


def topping_smooth(color, gloss=1.0, seed=7):
    X, Z = _grid()
    fp = _footprint(0.05)
    rip = fn(FOOT, FOOT, seed, 3, 3)
    T = fp * (0.062 + 0.040 * (rip - 0.5))
    r = np.sqrt((X / A) ** 2 + (Z / C) ** 2)
    D = np.clip(r, 0, 1) * 0.9                             # espalha do centro para fora
    return dict(T=T.astype(np.float32), D=D.astype(np.float32), col=np.array(color, np.float32), gloss=gloss, kind="smooth")


def topping_half(white, choc, seed=9):
    """metade chantilly branco (esquerda) e metade ganache de chocolate (direita) — como no cardápio"""
    X, Z = _grid()
    sw = topping_swirl(white, 0.9, seed, grid=((-0.32, -0.17), (-0.32, 0.17), (-0.10, -0.17), (-0.10, 0.17)), rad=0.19)
    fp = _footprint(0.045)
    gan = fp * (0.050 + 0.020 * (fn(FOOT, FOOT, seed, 3, 3) - 0.5))
    left = (X < 0.0)
    T = np.where(left, sw["T"], gan)
    D = np.where(left, sw["D"], 0.35 + 0.3 * (X / A))
    return dict(T=T.astype(np.float32), D=D.astype(np.float32), col=None, gloss=0.95, kind="half",
                colmap=np.where(left[..., None], np.array(white, np.float32), np.array(choc, np.float32)).astype(np.float32))


def prep_topping(T, colmap, gloss):
    gy, gx = np.gradient(T)
    return dict(T=T, gx=(gx * FOOT / (2 * A)).astype(np.float32), gz=(gy * FOOT / (2 * C)).astype(np.float32), col=colmap, gloss=gloss)


def compose_topping(variants, switch_times, t, dur=0.9):
    """mistura de coberturas: cada variante 'cresce' a partir de t_switch, de acordo com o mapa de atraso D."""
    prevT = np.zeros((FOOT, FOOT), np.float32)
    prevC = None
    gl = variants[0]["gloss"]
    for v, ts in zip(variants, switch_times):
        x = np.clip((t - ts - v["D"]) / dur, 0, 1)
        p = x * x * (3 - 2 * x)
        cm = v["colmap"] if v.get("colmap") is not None else np.broadcast_to(v["col"], (FOOT, FOOT, 3))
        T = prevT * (1 - p) + v["T"] * p
        Cc = cm if prevC is None else prevC * (1 - p[..., None]) + cm * p[..., None]
        if t >= ts:
            prevT, prevC, gl = T, Cc, v["gloss"]
        else:
            break
    if prevC is None:
        return None
    return prep_topping(prevT, prevC.astype(np.float32), gl)


# ------------------------------------------------------------------ SDFs
def _rbox(p, hx, hy, hz, r):
    q = np.abs(p) - np.array([hx - r, hy - r, hz - r], np.float32)
    return np.sqrt((np.maximum(q, 0) ** 2).sum(1)) + np.minimum(np.maximum(q[:, 0], np.maximum(q[:, 1], q[:, 2])), 0) - r


def _body_d(p):
    x, y, z = p[:, 0], p[:, 1], p[:, 2]
    dome = 0.022 * np.clip(1 - (x / A) ** 2, 0, 1) * np.clip(1 - (z / C) ** 2, 0, 1)
    q = np.stack([x, y - dome, z], 1)
    d = _rbox(q, A, B, C, RAD)
    wob = 0.0028 * np.sin(11 * x + 1.7) * np.sin(9 * z + 0.4) + 0.0022 * np.sin(23 * x + 5 * z + 1.0) + 0.0018 * np.sin(31 * z - 4 * x)
    return d + wob * (np.abs(y) < B + 0.05)


def _bite_d(p, bite):
    if bite is None:
        return None
    c, r = bite
    dx = p - np.array(c, np.float32)
    ang = np.sin(13 * dx[:, 0] + 3) * np.sin(11 * dx[:, 2] + 1) * 0.02 + np.sin(27 * dx[:, 1] + 9 * dx[:, 0]) * 0.008
    return np.sqrt((dx ** 2).sum(1)) - r - ang


def _top_d(p, top):
    if top is None:
        return np.full(len(p), 9.0, np.float32)
    x, y, z = p[:, 0], p[:, 1], p[:, 2]
    inside = (np.abs(x) < A) & (np.abs(z) < C) & (y < B + TOPMAX + 0.05) & (y > B - 0.05)
    d = np.full(len(p), 9.0, np.float32)
    if inside.any():
        u = x[inside] / (2 * A) + 0.5; v = z[inside] / (2 * C) + 0.5
        T = bil(top["T"], u, v)
        dome = 0.022 * np.clip(1 - (x[inside] / A) ** 2, 0, 1) * np.clip(1 - (z[inside] / C) ** 2, 0, 1)
        d[inside] = (y[inside] - (B + dome - 0.004 + T)) * 0.55
    return d


def _kin_d(p, kin):
    if not kin:
        return None, None
    best = np.full(len(p), 9.0, np.float32); which = np.full(len(p), -1, np.int32)
    for i, k in enumerate(kin):
        c, hx, hy, hz, yaw = k
        q = (p - np.array(c, np.float32)) @ rotY(yaw)         # = Ry(-yaw) p'
        d = _rbox(q, hx, hy, hz, 0.018)
        m = d < best
        best = np.where(m, d, best); which = np.where(m, i, which)
    return best, which


# ------------------------------------------------------------------ render
def project(cam, R_obj, pos, pt):
    Rv = rotX(cam["elev"])
    v = Rv @ (R_obj @ np.array(pt, float) + pos)
    k = cam["S"] * cam["D"] / (cam["D"] - v[2])
    return np.array([cam["cx"] + k * v[0], cam["cy"] - k * v[1]]), v[2]


def render(mats, cam, R_obj, pos, top=None, kin=(), bite=None, nit=70):
    Rv = rotX(cam["elev"])
    M = Rv @ R_obj
    tv = Rv @ np.asarray(pos, float)
    S, D = cam["S"], cam["D"]
    # caixa de pixels
    lo = np.array([-A - .03, -B - .03, -C - .03]); hi = np.array([A + .03, B + TOPMAX + .12, C + .03])
    corners = np.array([[x, y, z] for x in (lo[0], hi[0]) for y in (lo[1], hi[1]) for z in (lo[2], hi[2])])
    vc = corners @ M.T + tv
    k = S * D / (D - vc[:, 2])
    sx, sy = cam["cx"] + k * vc[:, 0], cam["cy"] - k * vc[:, 1]
    x0, x1 = max(0, int(sx.min()) - 4), min(1080, int(sx.max()) + 5)
    y0, y1 = max(0, int(sy.min()) - 4), min(1920, int(sy.max()) + 5)
    if x1 <= x0 or y1 <= y0:
        return None
    gx, gy = np.meshgrid(np.arange(x0, x1) + 0.5, np.arange(y0, y1) + 0.5)
    gx, gy = gx.ravel().astype(np.float32), gy.ravel().astype(np.float32)
    n = len(gx)
    dv = np.stack([(gx - cam["cx"]) / (S * D), -(gy - cam["cy"]) / (S * D), -np.ones(n, np.float32)], 1)
    dv /= np.linalg.norm(dv, axis=1, keepdims=True)
    dl = (dv @ M).astype(np.float32)                       # direção no espaço local
    ol = (M.T @ (np.array([0, 0, D]) - tv)).astype(np.float32)
    # interseção com a caixa
    with np.errstate(divide="ignore", invalid="ignore"):
        t_a = (lo - ol) / dl; t_b = (hi - ol) / dl
    tn = np.minimum(t_a, t_b).max(1); tf = np.maximum(t_a, t_b).min(1)
    valid = tf > np.maximum(tn, 0)
    t = np.maximum(tn, 0).astype(np.float32)
    hit = np.zeros(n, bool); dmin = np.full(n, 9.0, np.float32); thit = np.zeros(n, np.float32)
    idx = np.where(valid)[0]
    tt = t[idx].copy()
    pw_k = 0.5 / (S * D)
    for it in range(nit):
        if len(idx) == 0:
            break
        p = ol + tt[:, None] * dl[idx]
        d = _body_d(p)
        bd = _bite_d(p, bite)
        if bd is not None:
            d = np.maximum(d, -bd)
        d = np.minimum(d, _top_d(p, top))
        kd, _ = _kin_d(p, kin)
        if kd is not None:
            d = np.minimum(d, kd)
        dmin[idx] = np.minimum(dmin[idx], d / np.maximum(tt, 1e-3))
        eps = tt * pw_k
        h = d < eps
        hit[idx[h]] = True; thit[idx[h]] = tt[h]
        tt = tt + d * 0.85
        keep = (~h) & (tt < tf[idx])
        idx, tt = idx[keep], tt[keep]
    # ---- sombreamento dos pixels que acertaram
    img = np.zeros((n, 4), np.float32)
    hi_i = np.where(hit)[0]
    if len(hi_i):
        p = ol + thit[hi_i, None] * dl[hi_i]
        col = _shade(mats, p, dl[hi_i], M, top, kin, bite)
        img[hi_i, :3] = col
        img[hi_i, 3] = 1.0
    # cobertura nas bordas (antialias): rays que passaram raspando
    miss = (~hit) & valid
    cov = np.clip(1 - dmin * (S * D) / 1.6, 0, 1) ** 1.5
    img[miss, 3] = cov[miss] * 0.85
    img = img.reshape(y1 - y0, x1 - x0, 4)
    rgb, a = img[..., :3], img[..., 3]
    # cor das bordas = cor vizinha (preenchimento por desfoque ponderado)
    pre = [(_blur_f(rgb[..., c] * (a > 0.99), 2.0)) for c in range(3)]
    ab = _blur_f((a > 0.99).astype(np.float32), 2.0) + 1e-4
    fill = np.stack([pre[c] / ab for c in range(3)], -1)
    rgb = np.where((a > 0.99)[..., None], rgb, fill)
    out = np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8)
    return Image.fromarray(out, "RGBA"), (x0, y0)


def _blur_f(a, r):
    im = Image.fromarray(np.clip(a * 255 if a.max() <= 1.0 + 1e-6 else a, 0, 255).astype(np.uint8))
    sc = 1.0 if a.max() <= 1.0 + 1e-6 else 255.0 / 255.0
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r)), np.float32) / (255.0 if a.max() <= 1.0 + 1e-6 else 1.0)


def _norm_rows(v):
    return v / np.maximum(np.linalg.norm(v, axis=1, keepdims=True), 1e-9)


def _box_normal(p, hx, hy, hz, r):
    q = np.abs(p) - np.array([hx - r, hy - r, hz - r], np.float32)
    qp = np.maximum(q, 0)
    ln = np.linalg.norm(qp, axis=1, keepdims=True)
    n_out = np.sign(p) * qp / np.maximum(ln, 1e-9)
    ax = np.argmax(q, axis=1)
    n_in = np.zeros_like(p); n_in[np.arange(len(p)), ax] = np.sign(p[np.arange(len(p)), ax])
    return np.where(ln > 1e-6, n_out, n_in)


def _shade(mats, p, d_local, M, top, kin, bite):
    m = len(p)
    x, y, z = p[:, 0], p[:, 1], p[:, 2]
    dB = _body_d(p)
    bd = _bite_d(p, bite)
    on_bite = np.zeros(m, bool)
    if bd is not None:
        on_bite = (-bd) > dB - 0.004
        dB = np.maximum(dB, -bd)
    dT = _top_d(p, top)
    kd, kwhich = _kin_d(p, kin)
    dK = kd if kd is not None else np.full(m, 9.0, np.float32)
    # material: 0 casquinha/lateral, 1 miolo (mordida), 2 cobertura, 3 kinder
    mat = np.zeros(m, np.int32)
    mat[on_bite] = 1
    if top is not None:
        T_at = bil(top["T"], x / (2 * A) + 0.5, z / (2 * C) + 0.5)
        mat[(dT < dB) & (T_at > 0.004) & (y > B - 0.03)] = 2
    mat[dK < np.minimum(dB, dT) + 0.001] = 3
    n = np.zeros((m, 3), np.float32)
    alb = np.zeros((m, 3), np.float32)
    shine = np.zeros(m, np.float32); kspec = np.zeros(m, np.float32)
    # --- corpo
    sel = np.where((mat == 0))[0]
    if len(sel):
        ps = p[sel]
        nb = _box_normal(ps - np.stack([0 * ps[:, 0], 0.022 * np.clip(1 - (ps[:, 0] / A) ** 2, 0, 1) * np.clip(1 - (ps[:, 2] / C) ** 2, 0, 1), 0 * ps[:, 0]], 1), A, B, C, RAD)
        topz = nb[:, 1] > 0.6
        u = ps[:, 0] / (2 * A) + 0.5; v = ps[:, 2] / (2 * C) + 0.5
        a_top = bil(mats.crust_alb, u, v)
        gxx, gzz = bil(mats.crust_gx, u, v), bil(mats.crust_gz, u, v)
        sh_top = bil(mats.crust_shine, u, v)
        # lateral: projeção planar
        xface = np.abs(nb[:, 0]) > np.abs(nb[:, 2])
        us = np.where(xface, ps[:, 2] + 0.5, ps[:, 0] + 0.5 + 0.31)
        vs = 1 - (ps[:, 1] + 0.25) / 0.5
        a_side = bil(mats.side_alb, us, vs)
        gu, gv = bil(mats.side_gu, us, vs), bil(mats.side_gv, us, vs)
        band = smooth(ps[:, 1], B - 0.085, B - 0.035)
        crust_c = mix((70, 38, 24), (104, 60, 38), bil(mats.crust_shine, us, vs))
        a_side = a_side * (1 - band[:, None]) + crust_c * band[:, None]
        # normal perturbada
        npert = nb.copy()
        npert[:, 0] -= np.where(topz, gxx, 0.0); npert[:, 2] -= np.where(topz, gzz, 0.0)
        tu = np.where(xface[:, None], np.array([0, 0, 1.0]), np.array([1.0, 0, 0]))
        npert -= np.where(topz[:, None], 0.0, 1.0) * (gu[:, None] * tu + gv[:, None] * np.array([0, -1.0, 0]))
        n[sel] = _norm_rows(npert)
        alb[sel] = np.where(topz[:, None], a_top, a_side)
        shine[sel] = np.where(topz, sh_top, 0.25 + 0.4 * band)
        kspec[sel] = np.where(topz, 0.50, 0.06 + 0.14 * band)
    # --- miolo exposto da mordida
    sel = np.where(mat == 1)[0]
    if len(sel):
        ps = p[sel]
        c = np.array(bite[0], np.float32)
        nb = _norm_rows(c - ps)                              # normal aponta para dentro da esfera removida (para fora do brownie)
        nb = -nb * -1
        nb = _norm_rows(c - ps) * -1 * -1
        nb = _norm_rows(ps - c) * -1                          # superfície côncava: aponta para o centro da esfera
        ax = np.argmax(np.abs(nb), axis=1)
        us = np.where(ax == 0, ps[:, 2], ps[:, 0]) + 0.5
        vs = 1 - (ps[:, 1] + 0.25) / 0.5
        gu, gv = bil(mats.in_gu, us, vs), bil(mats.in_gv, us, vs)
        npert = nb - (gu[:, None] * np.array([1.0, 0, 0]) + gv[:, None] * np.array([0, -1.0, 0]))
        n[sel] = _norm_rows(npert)
        alb[sel] = bil(mats.in_alb, us, vs)
        shine[sel] = bil(mats.in_shine, us, vs)
        kspec[sel] = 0.35
    # --- cobertura
    sel = np.where(mat == 2)[0]
    if len(sel):
        ps = p[sel]
        u = ps[:, 0] / (2 * A) + 0.5; v = ps[:, 2] / (2 * C) + 0.5
        gxx, gzz = bil(top["gx"], u, v), bil(top["gz"], u, v)
        n[sel] = _norm_rows(np.stack([-gxx, np.ones(len(sel), np.float32), -gzz], 1))
        alb[sel] = bil(top["col"], u, v)
        Th = bil(top["T"], u, v)
        alb[sel] *= (0.80 + 0.20 * np.clip(Th / 0.10, 0, 1))[:, None]   # reentrâncias um pouco mais escuras
        shine[sel] = top["gloss"]; kspec[sel] = 0.70
    # --- Kinder Bueno
    sel = np.where(mat == 3)[0]
    if len(sel) and kd is not None:
        for ki, k in enumerate(kin):
            s2 = sel[kwhich[sel] == ki]
            if not len(s2):
                continue
            cx, hx, hy, hz, yaw = k
            ql = (p[s2] - np.array(cx, np.float32)) @ rotY(yaw)
            nl = _box_normal(ql, hx, hy, hz, 0.018)
            n[s2] = _norm_rows(nl @ rotY(yaw).T)
            end = np.abs(nl[:, 0]) > 0.7
            yy = (ql[:, 1] / (2 * hy) + 0.5)
            band = (yy * 4) % 1.0
            wafer = np.where((band < 0.16)[:, None], np.array((240, 226, 196), np.float32), np.array((224, 180, 104), np.float32))
            rimm = (np.abs(ql[:, 2]) > hz * 0.78) | (np.abs(ql[:, 1]) > hy * 0.80)
            choc = mix((92, 48, 27), (118, 66, 38), 0.5 + 0.5 * np.sin(ql[:, 0] * 90 + ql[:, 2] * 60))
            alb[s2] = np.where((end & ~rimm)[:, None], wafer, choc)
            shine[s2] = np.where(end & ~rimm, 0.1, 0.8); kspec[s2] = 0.55
    # ---- iluminação (no espaço da câmera)
    nv = _norm_rows(n @ M.T)
    V = _norm_rows(-(d_local @ M.T))
    L1, L2 = LIGHT1, LIGHT2
    diff = np.clip(nv @ L1, 0, 1)
    fill = np.clip(nv @ L2, 0, 1)
    H = _norm_rows(L1[None] + V)
    nh = np.clip((nv * H).sum(1), 0, 1)
    spec = (nh ** (34 + 80 * shine)) * kspec * (0.30 + 0.8 * shine) + (nh ** 7) * 0.05 * shine
    fres = (1 - np.clip((nv * V).sum(1), 0, 1)) ** 3 * 0.18 * shine
    ao = 0.50 + 0.50 * smooth(p[:, 1], -B, -B + 0.17)
    lit = (0.26 + 0.78 * diff + 0.20 * fill)
    col = alb * (lit * ao)[:, None] + (spec + fres)[:, None] * np.array((255, 238, 214), np.float32)
    return col
