"""Dá mais "vida" à entonação da voz sintética: amplia as subidas e descidas de tom em torno da média local
(WORLD: extrai F0 + envelope espectral, edita só o F0 e ressintetiza; o timbre e o ritmo ficam iguais)."""
import numpy as np
import pyworld as pw


def enliven(x, sr, gain=1.4, max_st=6.0, win_s=0.7):
    x = x.astype(np.float64)
    fp = 5.0
    f0, t = pw.harvest(x, sr, f0_floor=75, f0_ceil=420, frame_period=fp)
    f0 = pw.stonemask(x, f0, t, sr)
    sp = pw.cheaptrick(x, f0, t, sr)
    ap = pw.d4c(x, f0, t, sr)
    v = f0 > 0
    lf = np.zeros_like(f0); lf[v] = np.log(f0[v])
    # linha de base: média móvel só sobre os quadros com voz (interpola nos silêncios)
    k = int(win_s * 1000 / fp)
    ker = np.ones(k) / k
    num = np.convolve(lf * v, ker, "same"); den = np.convolve(v.astype(float), ker, "same")
    base = np.where(den > 1e-3, num / np.maximum(den, 1e-3), 0)
    dev = (lf - base) * v
    lim = max_st / 12 * np.log(2)
    new = np.where(v, base + np.clip(dev * gain, -lim, lim), 0)
    f0n = np.where(v, np.exp(new), 0.0)
    y = pw.synthesize(f0n, sp, ap, sr, fp)
    n = len(x)
    y = y[:n] if len(y) >= n else np.pad(y, (0, n - len(y)))
    return (y * (np.abs(x).max() / (np.abs(y).max() + 1e-9))).astype(np.float32)
