"""Trilha original + efeitos sonoros (síntese em numpy) e mixagem com a narração.

Uso: python3 audio.py <pasta-de-trabalho>
  escreve  <pasta>/music_sfx.wav  (trilha + efeitos, sem voz)
  escreve  <pasta>/mix.wav        (voz + trilha com 'ducking' + efeitos), usa <pasta>/voice.wav se existir
Tudo é gerado por código — nenhuma música de terceiros.
"""
import math, os, sys, wave
import numpy as np
from plan import *
from timing import load_timeline

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


def music():
    buf = np.zeros((2, N))
    bpm = 100.0
    beat = 60 / bpm
    bars = int(DUR / (beat * 4)) + 1
    prog = [(48, [60, 64, 67, 72]), (45, [57, 60, 64, 69]), (41, [53, 57, 60, 65]), (43, [55, 59, 62, 67])]  # C Am F G
    penta = [72, 74, 76, 79, 81, 84]
    r = np.random.default_rng(3)
    for b in range(bars):
        t0 = b * beat * 4
        root, ch = prog[b % 4]
        fade = 1.0
        # arpejo do piano (colcheias), mais leve no início
        pat = [0, 1, 2, 3, 2, 1, 2, 1] if b % 2 == 0 else [0, 2, 1, 3, 2, 3, 1, 2]
        for i, p in enumerate(pat):
            vel = (0.62 if i % 4 else 0.8) * (0.8 if b == 0 else 1.0)
            add(buf, piano(midi(ch[p]), 1.4, vel), t0 + i * beat / 2 + (0.012 if i % 2 else 0), 0.30, pan=-0.15 + 0.05 * p)
        # baixo
        if b >= 1:
            add(buf, bass(midi(root), 1.1, 1.0), t0, 0.34, 0)
            add(buf, bass(midi(root + (7 if b % 2 else 0)), 0.9, 0.8), t0 + 2 * beat, 0.28, 0)
        # percussão leve
        if b >= 1:
            for i in range(8):
                add(buf, shaker(0.7 if i % 2 else 1.0), t0 + i * beat / 2, 0.10, 0.25 if i % 2 else -0.2)
            add(buf, kick(), t0, 0.22); add(buf, kick(0.8), t0 + 2 * beat, 0.18)
        if b >= 2:
            add(buf, rim(), t0 + beat, 0.12, 0.3); add(buf, rim(0.8), t0 + 3 * beat, 0.12, 0.3)
        # melodia (celesta) — frase curta a cada 2 compassos
        if b >= 2 and b % 2 == 0:
            idx = r.integers(0, len(penta), 4)
            for k, ix in enumerate(idx):
                add(buf, celesta(midi(penta[ix] - 12 * (b % 4 == 0)), 0.8, 0.8), t0 + (k * 1.0 + (0.5 if k % 2 else 0)) * beat + 0.5 * beat, 0.16, 0.35)
    # acorde final aberto
    tf = DUR - 3.2
    for m in (48, 60, 64, 67, 72, 76):
        add(buf, piano(midi(m), 3.4, 0.9), tf + 0.01 * (m % 5), 0.22, 0)
    add(buf, celesta(midi(88), 1.6, 1.0), tf + 0.1, 0.14, 0.2)
    # corta o excesso depois do fim e faz fade final
    fade_n = int(1.2 * SR)
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


def sfx():
    buf = np.zeros((2, N))
    # cena 1 — chocolate escorrendo
    trickle(buf, EV["pour"], 3.2, 0.13, 1)
    # ondas de chocolate nas fronteiras
    for i, (b, d) in enumerate(WAVES):
        add(buf, swoosh(WAVE_DUR, 10 + i), b - WAVE_DUR / 2, 0.42, {"down": 0, "right": 0.5, "left": -0.5}[d])
        add(buf, glop(260, 0.22), b - 0.15, 0.35); add(buf, glop(340, 0.2), b + 0.2, 0.3)
    # textos entrando
    for tt in (0.15, 4.95, 13.0, 23.95, 30.7):
        add(buf, tick_whoosh(0.45, int(tt * 10)), tt, 0.20, 0.0)
    # cena 2: casquinha trincando e brownie partindo
    r = np.random.default_rng(2)
    for tt in np.sort(r.uniform(6.3, 6.95, 9)):
        add(buf, crack_small(r.uniform(0.5, 1)), tt, 0.5, r.uniform(-.3, .3))
    add(buf, crunch(1.0), EV["s2_crack"] - 0.03, 0.85)
    add(buf, crunch(0.7, 0.6), EV["s2_open"][0] + 0.45, 0.45, 0.2)
    # preço
    add(buf, pop(760), 6.1, 0.55); add(buf, chime(1760, 0.9), 6.12, 0.16)
    add(buf, pop(820), 14.4, 0.55); add(buf, chime(1976, 0.9), 14.42, 0.16)
    # cena 3: sparkle na supercasquinha, abre, recheio, chocolate
    for tt in (13.6, 14.6): add(buf, chime(2349, 0.7), tt, 0.10, 0.3)
    add(buf, crunch(1.0, 0.9), EV["s3_open"][0] - 0.05, 0.8)
    add(buf, crunch(0.6, 0.5), EV["s3_open"][0] + 0.5, 0.4, -0.2)
    for k in range(5): add(buf, glop(200 + 40 * k, 0.2), EV["s3_open"][0] + 0.9 + 0.4 * k, 0.28, r.uniform(-.4, .4))
    trickle(buf, EV["s3_choc"][0], EV["s3_choc"][1] + 0.4, 0.15, 4)
    add(buf, pop(900), EV["s3_muito"][0] + 0.15, 0.5); add(buf, chime(2093, 1.0), EV["s3_muito"][0] + 0.15, 0.14)
    # cena 4: brilhos
    for k, tt in enumerate((24.2, 25.9, 27.4)): add(buf, chime(1568 * (1 + 0.25 * (k % 2)), 1.0), tt, 0.10, -0.3 + 0.3 * k)
    # cena 5: logo, produtos, CTA
    add(buf, pop(560), EV["s5_logo"] + 0.25, 0.6); add(buf, chime(1568, 1.6), EV["s5_logo"] + 0.3, 0.22); add(buf, chime(2093, 1.6), EV["s5_logo"] + 0.45, 0.16)
    for tt in (31.25, 31.55): add(buf, pop(700), tt + 0.1, 0.4)
    for tt in (31.8, 32.1): add(buf, pop(900), tt, 0.4); add(buf, chime(2349, 0.8), tt, 0.1)
    add(buf, pop(1000), EV["s5_cta"] + 0.1, 0.5); add(buf, chime(2637, 1.4), EV["s5_cta"] + 0.1, 0.15)
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
    mus = music() * 0.55
    fx = sfx()
    voice = None
    vp = os.path.join(work, "voice.wav")
    if os.path.exists(vp):
        voice = read_wav(vp)
    # ducking: música cai quando há fala (curva suave)
    tl = load_timeline(work)
    act = np.zeros(N)
    for w in tl["words"]:
        act[int(max(0, w["s"] - 0.08) * SR): int(min(DUR, w["e"] + 0.12) * SR)] = 1
    k = int(0.18 * SR)
    sm = np.convolve(act, np.ones(k) / k, "same")
    duck = 1 - 0.52 * sm
    mus *= duck
    write_wav(os.path.join(work, "music_sfx.wav"), mus + fx)
    out = mus + fx * (0.85 if voice is not None else 1.0)
    if voice is not None:
        v = np.zeros(N); m = min(N, len(voice)); v[:m] = voice[:m]
        # leve compressão/saturação para presença da voz
        pass
        out = out + np.stack([v, v]) * 1.7
        print("voz incluída")
    else:
        print("SEM voz: mix.wav contém só trilha + efeitos")
    write_wav(os.path.join(work, "mix.wav"), out)


if __name__ == "__main__":
    main(sys.argv[1])
