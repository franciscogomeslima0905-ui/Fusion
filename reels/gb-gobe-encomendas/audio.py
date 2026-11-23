"""(Reels SABORES — colagem) Trilha original + efeitos sonoros (síntese em numpy) e mixagem com a narração.

Uso: python3 audio.py <pasta-de-trabalho>
  escreve  <pasta>/music_sfx.wav  (trilha + efeitos, sem voz)
  escreve  <pasta>/mix.wav        (voz + trilha com 'ducking' + efeitos), usa <pasta>/voice.wav se existir
Tudo é gerado por código — nenhuma música de terceiros.
"""
import math, os, sys, wave
import numpy as np
from plan import *

SR = 44100
N = int(DUR * SR)
rng = np.random.default_rng(7)


def t_(n):
    return np.arange(n) / SR


def env_ad(n, a, tau):
    t = t_(n)
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / tau)


def bandnoise(n, lo, hi, seed=0):
    r = np.random.default_rng(seed).normal(0, 1, n)
    F = np.fft.rfft(r)
    f = np.fft.rfftfreq(n, 1 / SR)
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


# ---------------------------------------------------------------- instrumentos
def piano(f, dur=1.6, vel=1.0):
    n = int(dur * SR); t = t_(n)
    tau = 0.9 * (260 / max(f, 120)) ** 0.5 + 0.25
    y = np.zeros(n)
    for k, a in enumerate([1, .55, .32, .2, .12, .07], 1):
        y += a * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t) * np.exp(-t / (tau / (1 + 0.55 * (k - 1))))
    y *= np.minimum(1, t / 0.004)
    y += 0.05 * bandnoise(n, 800, 4000, int(f)) * np.exp(-t / 0.012)
    return y * vel


def celesta(f, dur=0.9, vel=1.0):
    n = int(dur * SR); t = t_(n)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.35) + 0.45 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.12) + 0.2 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 0.25)
    return y * np.minimum(1, t / 0.003) * vel


def bass(f, dur=1.0, vel=1.0):
    n = int(dur * SR); t = t_(n)
    y = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t / 0.5) * np.minimum(1, t / 0.01)
    return y * vel


def shaker(vel=1.0):
    n = int(0.09 * SR)
    return bandnoise(n, 5000, 14000, int(rng.integers(1 << 20))) * env_ad(n, 0.004, 0.03) * vel


def kick(vel=1.0):
    n = int(0.28 * SR); t = t_(n)
    ph = 2 * np.pi * (48 * t + 70 * (1 - np.exp(-t * 30)) / 30)
    return np.sin(ph) * np.exp(-t / 0.09) * vel


def rim(vel=1.0):
    n = int(0.12 * SR); t = t_(n)
    return (np.sin(2 * np.pi * 1700 * t) * 0.5 + bandnoise(n, 1500, 6000, 3) * 0.6) * np.exp(-t / 0.018) * vel


def pluck(f, dur=1.0, vel=1.0):
    """corda dedilhada (violão/ukulele): harmônicos brilhantes que morrem rápido"""
    n = int(dur * SR); t = t_(n)
    y = np.zeros(n)
    for k, a in enumerate([1, .62, .45, .3, .2, .13, .08], 1):
        y += a * np.sin(2 * np.pi * f * k * (1 + 0.0006 * k * k) * t) * np.exp(-t / (0.55 / (k ** 0.75)))
    y *= np.minimum(1, t / 0.002)
    y += 0.10 * bandnoise(n, 1500, 6000, int(f)) * np.exp(-t / 0.008)
    return y * vel


def kalimba(f, dur=0.7, vel=1.0):
    n = int(dur * SR); t = t_(n)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.32) + 0.3 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / 0.05)
    return y * np.minimum(1, t / 0.002) * vel


def clap(vel=1.0):
    n = int(0.16 * SR)
    y = np.zeros(n)
    for i, dly in enumerate((0, 0.009, 0.019)):
        k0 = int(dly * SR)
        m = n - k0
        y[k0:] += bandnoise(m, 900, 3800, 40 + i) * env_ad(m, 0.0008, 0.018 if i < 2 else 0.05) * (0.7 if i < 2 else 1.0)
    return y * vel


def stomp(vel=1.0):
    n = int(0.22 * SR); t = t_(n)
    return (np.sin(2 * np.pi * (70 + 40 * np.exp(-t * 40)) * t) * np.exp(-t / 0.07) + 0.25 * bandnoise(n, 150, 900, 8) * np.exp(-t / 0.02)) * vel


def music():
    buf = np.zeros((2, N))
    bpm = 108.0
    beat = 60 / bpm
    bars = int(DUR / (beat * 4)) + 1
    prog = [([55, 59, 62, 67], 43), ([52, 59, 64, 67], 40), ([52, 60, 64, 67], 48), ([54, 57, 62, 66], 50)]   # G  Em  C  D
    penta = [74, 76, 79, 81, 83, 86]
    r = np.random.default_rng(12)
    strums = [(0.0, 1.0), (1.5, 0.7), (2.0, 0.9), (3.0, 0.8), (3.5, 0.65)]
    for b in range(bars):
        t0 = b * beat * 4
        chord, root = prog[b % 4]
        for j, (pos, v) in enumerate(strums):
            down = (j % 2 == 0)
            order = chord if down else chord[::-1]
            for i, m in enumerate(order):
                add(buf, pluck(midi(m), 0.9, v * (0.8 if i in (0, 3) else 1.0)), t0 + pos * beat + i * 0.013, 0.13, -0.3 + 0.2 * i)
        # baixo
        add(buf, bass(midi(root), 0.9, 1.0), t0, 0.30, 0)
        add(buf, bass(midi(root + 7), 0.7, 0.8), t0 + 2 * beat, 0.24, 0)
        add(buf, bass(midi(root + 12), 0.5, 0.6), t0 + 3.5 * beat, 0.16, 0)
        # percussão "feita à mão": pé e palmas
        add(buf, stomp(), t0, 0.30); add(buf, stomp(0.7), t0 + 2 * beat, 0.22)
        if b >= 1:
            add(buf, clap(), t0 + beat, 0.28, 0.1); add(buf, clap(0.9), t0 + 3 * beat, 0.26, -0.1)
        for i in range(8):
            add(buf, shaker(0.55 if i % 2 else 0.8), t0 + i * beat / 2, 0.07, 0.3 if i % 2 else -0.3)
        # motivo de kalimba, a cada 2 compassos
        if b >= 2 and b % 2 == 0:
            for k, ix in enumerate(r.integers(0, len(penta), 5)):
                add(buf, kalimba(midi(penta[ix]), 0.6, 0.8), t0 + (k * 0.75 + 0.5) * beat, 0.13, 0.4)
    tf = DUR - 2.6
    for i, m in enumerate([55, 59, 62, 67, 71]):
        add(buf, pluck(midi(m), 2.6, 1.0), tf + i * 0.02, 0.15, -0.3 + 0.15 * i)
    add(buf, stomp(), tf, 0.3); add(buf, clap(), tf, 0.25)
    fade_n = int(0.9 * SR)
    buf[:, -fade_n:] *= np.linspace(1, 0, fade_n)
    return buf


# ---------------------------------------------------------------- efeitos
def swoosh(dur=1.7, seed=0):
    n = int(dur * SR); t = t_(n)
    y = np.zeros(n)
    for k, (lo, hi) in enumerate([(120, 500), (400, 1600), (1200, 4200)]):
        y += bandnoise(n, lo, hi, seed + k) * (0.55 / (k + 1)) * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** (1.5 + k)
    return y


def glop(f0=300, dur=0.16):
    n = int(dur * SR); t = t_(n)
    f = f0 * (1 + 2.2 * t / dur)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.045) * np.minimum(1, t / 0.004)


def trickle(buf, t0, t1, gain=0.12, seed=1):
    """chocolate escorrendo: filete de ruído + bolhinhas"""
    n = int((t1 - t0) * SR)
    t = t_(n)
    body = bandnoise(n, 250, 1600, seed) * 0.5 * np.minimum(1, t / 0.4) * np.minimum(1, (t1 - t0 - t) / 0.5)
    add(buf, body, t0, gain)
    r = np.random.default_rng(seed)
    for _ in range(int((t1 - t0) * 7)):
        add(buf, glop(r.uniform(220, 520), r.uniform(0.08, 0.16)), t0 + r.uniform(0.2, t1 - t0 - 0.2), gain * r.uniform(0.7, 1.4), r.uniform(-.5, .5))


def crack_small(vel=1.0):
    n = int(0.05 * SR)
    return bandnoise(n, 1800, 9000, int(rng.integers(1 << 20))) * env_ad(n, 0.0008, 0.010) * vel


def crunch(dur=0.9, vel=1.0):
    n = int(dur * SR); t = t_(n)
    y = np.zeros(n)
    r = np.random.default_rng(11)
    for _ in range(55):
        p = int(abs(r.exponential(0.12)) * SR)
        if p < n - 800:
            y[p:p + int(0.03 * SR)] += bandnoise(int(0.03 * SR), 1200, 8000, int(r.integers(1 << 20))) * np.exp(-t_(int(0.03 * SR)) / 0.006) * r.uniform(0.3, 1)
    y += 0.7 * bandnoise(n, 60, 260, 5) * np.exp(-t / 0.10)  # estalo grave
    return y * vel


def pop(f=760):
    n = int(0.22 * SR); t = t_(n)
    y = np.sin(2 * np.pi * np.cumsum(f * (1 + 0.7 * np.exp(-t / 0.03))) / SR) * np.exp(-t / 0.07)
    y2 = np.sin(2 * np.pi * f * 2.5 * t) * np.exp(-t / 0.15) * 0.3
    return y + y2


def chime(f=1760, dur=1.2):
    n = int(dur * SR); t = t_(n)
    return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.2)) * np.exp(-t / 0.4) * np.minimum(1, t / 0.002)


def tick_whoosh(dur=0.5, seed=0):
    n = int(dur * SR); t = t_(n)
    return bandnoise(n, 1500, 7000, seed) * np.sin(np.pi * t / dur) ** 2 * 0.6


def slap(vel=1.0):
    """papel/adesivo batendo na mesa"""
    n = int(0.16 * SR); t = t_(n)
    return (bandnoise(n, 500, 5200, 21) * np.exp(-t / 0.03) * 0.8 + np.sin(2 * np.pi * 120 * t) * np.exp(-t / 0.05) * 0.7) * vel


def page_flip(dur=0.4, seed=0):
    n = int(dur * SR); t = t_(n)
    return bandnoise(n, 700, 7000, seed) * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.4 * 0.7


def marker(dur=0.8, seed=0):
    n = int(dur * SR); t = t_(n)
    am = 0.55 + 0.45 * np.sin(2 * np.pi * 8.5 * t)
    return bandnoise(n, 1800, 7500, seed) * am * np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.08) * 0.8


def sfx():
    buf = np.zeros((2, N))
    for i, b in enumerate(BOUNDS[1:-1]):                                      # virada de página
        add(buf, page_flip(TRANS + 0.1, 30 + i), b - 0.03, 0.5, 0.0); add(buf, slap(1.0), b + TRANS * 0.7, 0.35)
    # gancho
    for tt in EV["a_lines"]: add(buf, slap(1.0), tt + 0.12, 0.45); add(buf, pop(620), tt + 0.1, 0.25)
    add(buf, marker(0.7, 1), EV["a_scribble"], 0.30)
    for tt in EV["a_photos"]: add(buf, slap(0.8), tt + 0.18, 0.40); add(buf, pop(900), tt + 0.1, 0.22)
    # semana: cartões, setas desenhadas
    add(buf, slap(1.0), EV["b_title"] + 0.12, 0.45)
    for ta, tr, tb in (EV["b_row1"], EV["b_row2"]):
        add(buf, slap(0.9), ta + 0.18, 0.45); add(buf, pop(760), ta + 0.1, 0.22)
        add(buf, marker(0.6, int(tr * 10)), tr, 0.30)
        add(buf, slap(0.9), tb + 0.18, 0.45); add(buf, pop(900), tb + 0.1, 0.25); add(buf, chime(2093, 0.8), tb + 0.15, 0.10)
    add(buf, slap(0.7), EV["b_strip"] + 0.14, 0.38)
    # fim de semana
    add(buf, slap(1.0), EV["c_title"] + 0.12, 0.45)
    for tt in EV["c_cards"]: add(buf, slap(0.9), tt + 0.18, 0.45); add(buf, pop(780), tt + 0.1, 0.22)
    add(buf, slap(1.0), EV["c_burst"] + 0.16, 0.5); add(buf, chime(2637, 1.2), EV["c_burst"] + 0.2, 0.14); add(buf, pop(560), EV["c_burst"] + 0.12, 0.3)
    add(buf, slap(0.7), EV["c_strip"] + 0.14, 0.38)
    # segunda
    add(buf, slap(1.0), EV["d_title"] + 0.12, 0.5); add(buf, pop(480), EV["d_title"] + 0.1, 0.3)
    for tt in EV["d_cards"]: add(buf, slap(0.9), tt + 0.18, 0.45); add(buf, pop(780), tt + 0.1, 0.22)
    add(buf, marker(0.6, 5), EV["d_arrow"], 0.30)
    for tt in EV["d_strips"]: add(buf, slap(0.7), tt + 0.14, 0.38); add(buf, pop(760), tt + 0.1, 0.22)
    # cardápio
    add(buf, slap(1.0), EV["e_title"] + 0.12, 0.45); add(buf, slap(1.0), EV["e_title"] + 0.37, 0.45)
    for tt in EV["e_rows"]: add(buf, slap(0.8), tt + 0.18, 0.40); add(buf, pop(880), tt + 0.1, 0.22); add(buf, chime(1976, 0.7), tt + 0.2, 0.08)
    # link da bio
    add(buf, pop(520), EV["f_logo"] + 0.25, 0.6); add(buf, chime(1568, 1.6), EV["f_logo"] + 0.3, 0.2); add(buf, chime(2093, 1.6), EV["f_logo"] + 0.45, 0.15)
    for tt in (EV["f_t1"], EV["f_t2"]): add(buf, slap(1.0), tt + 0.12, 0.5); add(buf, pop(640), tt + 0.1, 0.25)
    add(buf, marker(0.9, 3), EV["f_arrow"], 0.30)
    add(buf, slap(0.8), EV["f_strip"] + 0.15, 0.4); add(buf, pop(900), EV["f_strip"] + 0.1, 0.3)
    for tt in EV["f_thumbs"]: add(buf, slap(0.7), tt + 0.15, 0.35); add(buf, pop(1000), tt + 0.1, 0.22)
    return buf


# ---------------------------------------------------------------- mixagem
def read_wav(path):
    with wave.open(path) as w:
        sr, ch, n = w.getframerate(), w.getnchannels(), w.getnframes()
        a = np.frombuffer(w.readframes(n), np.int16).astype(np.float64) / 32768
    a = a.reshape(-1, ch).mean(1)
    if sr != SR:
        a = np.interp(np.arange(int(len(a) * SR / sr)) * sr / SR, np.arange(len(a)), a)
    return a


def write_wav(path, buf):
    pk = np.abs(buf).max()
    x = (np.clip(buf / max(pk, 1e-9) * 0.89, -1, 1) * 32767).astype("<i2").T.copy()
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(x.tobytes())


def main(work):
    out = music() * 0.60 + sfx()
    out = np.tanh(out * 2.2) / np.tanh(2.2) * 0.9      # limitador suave: segura os picos dos estalos
    write_wav(os.path.join(work, "mix.wav"), out)
    print("mix.wav: trilha + efeitos (sem voz)")


if __name__ == "__main__":
    main(sys.argv[1])
