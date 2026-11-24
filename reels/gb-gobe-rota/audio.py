"""Trilha praiana (marimba, baixo, shaker, conga, palmas) + efeitos de mapa/viagem, sincronizados com plan.py.
Uso: python3 audio.py <pasta-de-trabalho>  -> <pasta>/mix.wav (sem voz)."""
import math, os, sys, wave
import numpy as np
from plan import *

SR = 44100
N = int(DUR * SR)
rng = np.random.default_rng(9)


def t_(n):
    return np.arange(n) / SR


def env_ad(n, a, tau):
    t = t_(n)
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / tau)


def bandnoise(n, lo, hi, seed=0):
    r = np.random.default_rng(seed).normal(0, 1, n)
    F = np.fft.rfft(r); f = np.fft.rfftfreq(n, 1 / SR)
    F[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(F, n)
    return y / (np.abs(y).max() + 1e-9)


def add(buf, x, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i + len(x) <= 0:
        return
    s0 = max(0, -i); i0 = max(0, i)
    x = x[s0:s0 + N - i0]
    l, r = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
    buf[0, i0:i0 + len(x)] += x * gain * l * 1.414
    buf[1, i0:i0 + len(x)] += x * gain * r * 1.414


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def marimba(f, dur=0.6, vel=1.0):
    n = int(dur * SR); t = t_(n)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.22) + 0.35 * np.sin(2 * np.pi * f * 4.0 * t) * np.exp(-t / 0.05) + 0.12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / 0.02)
    return y * np.minimum(1, t / 0.002) * vel


def bass(f, dur=0.5, vel=1.0):
    n = int(dur * SR); t = t_(n)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t / 0.3) * np.minimum(1, t / 0.01) * vel


def shaker(vel=1.0, seed=0):
    n = int(0.07 * SR)
    return bandnoise(n, 5500, 13000, seed) * env_ad(n, 0.004, 0.022) * vel


def conga(f=210, vel=1.0):
    n = int(0.22 * SR); t = t_(n)
    return (np.sin(2 * np.pi * np.cumsum(f * (1 + 0.5 * np.exp(-t * 60))) / SR) * np.exp(-t / 0.07) + 0.2 * bandnoise(n, 800, 4000, 3) * np.exp(-t / 0.01)) * vel


def clap(vel=1.0):
    n = int(0.15 * SR)
    y = np.zeros(n)
    for i, dly in enumerate((0, 0.008, 0.017)):
        k0 = int(dly * SR)
        y[k0:] += bandnoise(n - k0, 900, 3800, 40 + i) * env_ad(n - k0, 0.0008, 0.02 if i < 2 else 0.05)
    return y * vel


def music():
    buf = np.zeros((2, N))
    bpm = 112.0
    beat = 60 / bpm
    bars = int(DUR / (beat * 4)) + 1
    prog = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (41, [60, 65, 69])]     # C  G  Am  F
    penta = [72, 74, 76, 79, 81, 84]
    r = np.random.default_rng(21)
    for b in range(bars):
        t0 = b * beat * 4
        root, chord = prog[b % 4]
        # arpejo de marimba em colcheias
        pat = [0, 1, 2, 1, 2, 1, 0, 1] if b % 2 == 0 else [0, 2, 1, 2, 1, 2, 1, 0]
        for i, p in enumerate(pat):
            if b == 0 and i < 4:
                continue
            add(buf, marimba(midi(chord[p % 3] + 12), 0.5, 0.9 if i % 4 == 0 else 0.65), t0 + i * beat / 2, 0.14, -0.3 + 0.3 * (p % 3) / 2)
        add(buf, bass(midi(root), 0.55, 1.0), t0, 0.32); add(buf, bass(midi(root), 0.35, 0.7), t0 + 1.5 * beat, 0.22); add(buf, bass(midi(root + 7), 0.45, 0.8), t0 + 2 * beat, 0.26)
        add(buf, bass(midi(root + 12), 0.3, 0.6), t0 + 3.5 * beat, 0.18)
        for i in range(8):
            add(buf, shaker(0.6 if i % 2 else 0.95, i), t0 + i * beat / 2, 0.08, 0.3 if i % 2 else -0.3)
        if b >= 1:
            add(buf, conga(220, 1.0), t0 + beat, 0.2, 0.2); add(buf, conga(180, 0.8), t0 + 1.5 * beat, 0.16, 0.2)
            add(buf, conga(220, 0.9), t0 + 3 * beat, 0.2, 0.2); add(buf, clap(), t0 + 2 * beat, 0.18); add(buf, clap(0.8), t0 + 4 * beat - beat / 2, 0.1)
        if b >= 2 and b % 2 == 0:                              # melodia
            for k, ix in enumerate(r.integers(0, len(penta), 4)):
                add(buf, marimba(midi(penta[ix]), 0.55, 0.9), t0 + (k * 1.0 + 0.5) * beat + beat, 0.14, 0.4)
    tf = DUR - 2.4
    for i, m in enumerate([60, 64, 67, 72, 76]):
        add(buf, marimba(midi(m), 2.0, 1.0), tf + i * 0.03, 0.15, -0.3 + 0.15 * i)
    add(buf, bass(midi(36), 2.0, 1.0), tf, 0.32)
    fade_n = int(0.9 * SR)
    buf[:, -fade_n:] *= np.linspace(1, 0, fade_n)
    return buf


# ---- efeitos
def pop(f=760, vel=1.0):
    n = int(0.22 * SR); t = t_(n)
    return (np.sin(2 * np.pi * np.cumsum(f * (1 + 0.7 * np.exp(-t / 0.03))) / SR) * np.exp(-t / 0.07) + 0.3 * np.sin(2 * np.pi * f * 2.5 * t) * np.exp(-t / 0.15)) * vel


def chime(f=1760, dur=1.0, vel=1.0):
    n = int(dur * SR); t = t_(n)
    return (np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.2)) * np.exp(-t / 0.35) * np.minimum(1, t / 0.002) * vel


def ding_dong(vel=1.0):
    """aviso de estação de metrô: duas notas"""
    a = chime(1318, 0.9, 1.0); b = chime(988, 1.1, 1.0)
    out = np.zeros(int(1.6 * SR)); out[:len(a)] += a; out[int(0.28 * SR):int(0.28 * SR) + len(b)] += b
    return out * vel


def whoosh(dur=0.7, f0=250, f1=2600, seed=0):
    n = int(dur * SR); t = t_(n)
    ph = 2 * np.pi * np.cumsum(f0 * (f1 / f0) ** (t / dur)) / SR
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.1
    return (np.sin(ph) * 0.3 + bandnoise(n, 300, 5500, seed) * 0.5) * env


def thump(vel=1.0):
    n = int(0.3 * SR); t = t_(n)
    return np.sin(2 * np.pi * np.cumsum(55 + 80 * np.exp(-t * 35)) / SR) * np.exp(-t / 0.1) * vel


def boing(vel=1.0):
    n = int(0.35 * SR); t = t_(n)
    return np.sin(2 * np.pi * np.cumsum(260 + 220 * np.sin(t * 40) * np.exp(-t * 9)) / SR) * np.exp(-t / 0.14) * vel


def wave_swell(dur=2.0, seed=0):
    n = int(dur * SR); t = t_(n)
    return bandnoise(n, 200, 2600, seed) * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2


def tick(vel=1.0):
    n = int(0.015 * SR)
    return bandnoise(n, 2500, 9000, int(rng.integers(1 << 20))) * env_ad(n, 0.0003, 0.004) * vel


def scribble(dur=0.8, seed=0):
    n = int(dur * SR); t = t_(n)
    am = 0.55 + 0.45 * np.sin(2 * np.pi * 9 * t)
    return bandnoise(n, 1800, 7500, seed) * am * np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.08) * 0.7


def sfx():
    buf = np.zeros((2, N))
    for tt in EV["h_lines"]: add(buf, whoosh(0.4, 500, 1800, int(tt * 9)), tt - 0.05, 0.22); add(buf, thump(0.5), tt + 0.35, 0.22)
    add(buf, whoosh(0.7, 900, 200, 2), EV["h_pin"] - 0.1, 0.25)                   # pin caindo
    add(buf, thump(1.0), EV["h_pin"] + 0.5, 0.45); add(buf, boing(), EV["h_pin"] + 0.52, 0.22); add(buf, chime(1760, 1.2), EV["h_pin"] + 0.6, 0.12)
    for i, b in enumerate(BOUNDS[1:-1]):                                           # íris
        add(buf, whoosh(TRANS + 0.1, 220, 3000, 10 + i), b - 0.05, 0.4); add(buf, pop(900), b + TRANS - 0.05, 0.3)
    add(buf, wave_swell(3.0, 1), EV["s_sun"] - 0.2, 0.30); add(buf, wave_swell(3.5, 2), EV["s_sun"] + 2.0, 0.26)
    add(buf, whoosh(0.5, 300, 1400, 5), EV["s_pre"] - 0.05, 0.2)
    for i in range(9): add(buf, pop(500 + 60 * i, 0.9), EV["s_word"] + 0.06 * i + 0.15, 0.14)
    add(buf, thump(0.9), EV["s_rs"] + 0.25, 0.4); add(buf, boing(), EV["s_pin"] + 0.3, 0.25); add(buf, chime(1976, 1.0), EV["s_pin"] + 0.35, 0.12)
    add(buf, whoosh(0.5, 300, 1400, 6), EV["m_title"] - 0.05, 0.2); add(buf, whoosh(0.9, 250, 1800, 7), EV["m_map"], 0.2)
    add(buf, ding_dong(), EV["m_A"] + 0.1, 0.22); add(buf, pop(700), EV["m_A"] + 0.1, 0.3)
    for k in range(12): add(buf, tick(0.9), EV["m_token"] + k * 0.22, 0.10)          # roda do brownie
    add(buf, ding_dong(), EV["m_B"] + 0.1, 0.22); add(buf, pop(800), EV["m_B"] + 0.1, 0.3)
    add(buf, thump(0.8), EV["m_cross"] + 0.4, 0.3); add(buf, wave_swell(1.6, 3), EV["m_cross"] + 0.5, 0.18)   # ponte sobre o rio
    for k in range(10): add(buf, tick(0.9), EV["m_cross"] + k * 0.22, 0.10)
    add(buf, ding_dong(), EV["m_C"] + 0.1, 0.26); add(buf, chime(2349, 1.4), EV["m_C"] + 0.5, 0.14); add(buf, pop(1000), EV["m_C"] + 0.1, 0.3)
    add(buf, whoosh(0.5, 300, 1400, 8), EV["b_head"] - 0.05, 0.2)
    for tb, tc in ((EV["b_board1"], EV["b_check1"]), (EV["b_board2"], EV["b_check2"])):
        add(buf, whoosh(0.5, 400, 1800, int(tb * 3)), tb - 0.05, 0.28); add(buf, thump(0.9), tb + 0.55, 0.4)
        add(buf, pop(880), tc + 0.1, 0.35); add(buf, chime(2093, 0.9), tc + 0.15, 0.13)
    add(buf, pop(700), EV["b_foot"] + 0.2, 0.3)
    add(buf, chime(1568, 1.8), EV["c_logo"] + 0.25, 0.16); add(buf, chime(2093, 1.8), EV["c_logo"] + 0.4, 0.12)
    add(buf, scribble(0.9, 1), EV["c_l1"], 0.30); add(buf, scribble(1.0, 2), EV["c_l2"], 0.30)
    add(buf, whoosh(0.7, 300, 1500, 9), EV["c_hl"], 0.2)
    for k in range(4): add(buf, pop(800 + 150 * k), EV["c_arrow"] + 0.1 * k, 0.25)
    add(buf, ding_dong(), EV["c_foot"], 0.2)
    return buf


def write_wav(path, buf):
    pk = np.abs(buf).max()
    x = (np.clip(buf / max(pk, 1e-9) * 0.89, -1, 1) * 32767).astype("<i2").T.copy()
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(x.tobytes())


def main(work):
    out = music() * 0.6 + sfx()
    out = np.tanh(out * 1.8) / np.tanh(1.8) * 0.9
    write_wav(os.path.join(work, "mix.wav"), out)
    print("mix.wav: trilha + efeitos (sem voz)")


if __name__ == "__main__":
    main(sys.argv[1])
