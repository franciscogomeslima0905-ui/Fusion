"""Trilha eletrônica lo-fi + efeitos de laboratório (síntese em numpy), sincronizados com plan.py.
Uso: python3 audio.py <pasta-de-trabalho>   -> escreve <pasta>/mix.wav (sem voz)."""
import math, os, sys, wave
import numpy as np
from plan import *

SR = 44100
N = int(DUR * SR)
rng = np.random.default_rng(5)


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


# ---- instrumentos
def epiano(f, dur=1.6, vel=1.0):
    n = int(dur * SR); t = t_(n)
    mod = np.sin(2 * np.pi * f * t) * 1.6 * np.exp(-t / 0.28)
    y = np.sin(2 * np.pi * f * t + mod) * np.exp(-t / 0.9) + 0.25 * np.sin(2 * np.pi * f * 2 * t + mod * 0.5) * np.exp(-t / 0.4)
    y *= (0.85 + 0.15 * np.sin(2 * np.pi * 4.8 * t)) * np.minimum(1, t / 0.004)
    return y * vel


def subbass(f, dur=0.6, vel=1.0):
    n = int(dur * SR); t = t_(n)
    return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t / 0.35) * np.minimum(1, t / 0.012) * vel


def kick(vel=1.0):
    n = int(0.3 * SR); t = t_(n)
    return np.sin(2 * np.pi * np.cumsum(45 + 90 * np.exp(-t * 30)) / SR) * np.exp(-t / 0.11) * vel


def snap(vel=1.0):
    n = int(0.12 * SR)
    return (bandnoise(n, 1400, 5500, 3) * env_ad(n, 0.0008, 0.03) + 0.4 * bandnoise(n, 200, 900, 4) * env_ad(n, 0.0008, 0.05)) * vel


def hat(vel=1.0, seed=0):
    n = int(0.05 * SR)
    return bandnoise(n, 6500, 15000, seed) * env_ad(n, 0.0005, 0.012) * vel


def blip(f=1200, dur=0.09, vel=1.0):
    n = int(dur * SR); t = t_(n)
    return np.sign(np.sin(2 * np.pi * f * t)) * 0.35 * np.exp(-t / 0.04) * np.minimum(1, t / 0.002) * vel + np.sin(2 * np.pi * f * 2 * t) * 0.15 * np.exp(-t / 0.03) * vel


def tick(vel=1.0):
    n = int(0.012 * SR)
    return bandnoise(n, 2500, 9000, int(rng.integers(1 << 20))) * env_ad(n, 0.0003, 0.003) * vel


def sweep(dur=0.6, f0=300, f1=2400, seed=0):
    n = int(dur * SR); t = t_(n)
    ph = 2 * np.pi * np.cumsum(f0 * (f1 / f0) ** (t / dur)) / SR
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.2
    return (np.sin(ph) * 0.35 + bandnoise(n, 400, 5000, seed) * 0.5) * env


def thud(vel=1.0):
    n = int(0.35 * SR); t = t_(n)
    body = np.sin(2 * np.pi * np.cumsum(60 + 70 * np.exp(-t * 40)) / SR) * np.exp(-t / 0.12)
    clack = bandnoise(n, 1800, 9000, 8) * env_ad(n, 0.0004, 0.02) * 0.7
    slam = bandnoise(n, 300, 2500, 9) * env_ad(n, 0.0006, 0.05) * 0.6
    return (body + clack + slam) * vel


def chime(f=1760, dur=1.0, vel=1.0):
    n = int(dur * SR); t = t_(n)
    return (np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.2)) * np.exp(-t / 0.35) * np.minimum(1, t / 0.002) * vel


def music():
    buf = np.zeros((2, N))
    bpm = 86.0
    beat = 60 / bpm
    bars = int(DUR / (beat * 4)) + 1
    prog = [([53, 57, 60, 64], 41), ([52, 55, 59, 62], 40), ([50, 53, 57, 60], 38), ([48, 52, 55, 59], 36)]   # Fmaj7 Em7 Dm7 Cmaj7
    for b in range(bars):
        t0 = b * beat * 4
        chord, root = prog[b % 4]
        sw = 0.06 * beat                                     # suingue leve
        stabs = [(0.0, 1.0), (1.5, 0.7), (2.5, 0.8)] if b >= 1 else [(0.0, 0.8)]
        for pos, v in stabs:
            for i, m in enumerate(chord):
                add(buf, epiano(midi(m + 12), 1.5, v * (0.8 if i else 1.0)), t0 + pos * beat + sw * (pos % 1 > 0) + i * 0.011, 0.085, -0.4 + 0.25 * i)
        add(buf, subbass(midi(root), 0.9, 1.0), t0, 0.34); add(buf, subbass(midi(root), 0.5, 0.8), t0 + 1.5 * beat, 0.26); add(buf, subbass(midi(root + 7), 0.6, 0.8), t0 + 3 * beat, 0.26)
        if b >= 1:
            add(buf, kick(), t0, 0.30); add(buf, kick(0.7), t0 + 1.5 * beat, 0.22); add(buf, kick(), t0 + 2 * beat, 0.28)
            add(buf, snap(), t0 + beat, 0.22, 0.1); add(buf, snap(0.9), t0 + 3 * beat, 0.22, -0.1)
            for i in range(8):
                add(buf, hat(0.6 if i % 2 else 0.9, i), t0 + i * beat / 2 + (sw if i % 2 else 0), 0.07, 0.3 if i % 2 else -0.3)
    tf = DUR - 2.8
    for i, m in enumerate([53, 57, 60, 64, 69]):
        add(buf, epiano(midi(m + 12), 2.8, 1.0), tf + i * 0.02, 0.09, -0.3 + 0.15 * i)
    add(buf, subbass(midi(41), 2.5, 1.0), tf, 0.34)
    fade_n = int(1.0 * SR)
    buf[:, -fade_n:] *= np.linspace(1, 0, fade_n)
    return buf


def typing(buf, t0, n, cps, gain=0.12):
    for i in range(n):
        add(buf, tick(0.8 + 0.2 * (i % 3)), t0 + i / cps, gain, rng.uniform(-0.2, 0.2))


def approve(buf, ts, gain=1.0):
    add(buf, thud(), ts + 0.14, 0.55 * gain)
    add(buf, chime(1568, 0.9), ts + 0.30, 0.10 * gain); add(buf, chime(1976, 0.9), ts + 0.40, 0.09 * gain); add(buf, chime(2349, 1.0), ts + 0.50, 0.08 * gain)
    add(buf, blip(1500, 0.08), ts + 0.62, 0.18 * gain)                       # "tique" do item na lista


def sfx():
    buf = np.zeros((2, N))
    add(buf, sweep(1.1, 200, 3200, 1), 0.05, 0.38)                              # abertura: varredura da tela
    add(buf, chime(1760, 1.6), EV["hook_logo"] + 0.25, 0.14); add(buf, chime(2349, 1.6), EV["hook_logo"] + 0.4, 0.10)
    typing(buf, EV["hook_tag"], 15, 26); typing(buf, EV["hook_sub"], 31, 30)
    for tt in EV["hook_t"]: add(buf, sweep(0.35, 500, 1500, 2), tt - 0.05, 0.22); add(buf, thud(0.5), tt + 0.4, 0.25)
    for i, b in enumerate(BOUNDS[1:-1]):                                        # linha de varredura entre cenas
        add(buf, sweep(TRANS + 0.1, 250, 2800, 10 + i), b - 0.05, 0.38)
    for tg in (EV["s1_tag"], EV["s2_tag"], EV["s3_tag"], EV["r_title"] - 0.2): typing(buf, tg, 16, 32, 0.10)
    for tt in (EV["s1_title"] + EV["s2_title"] + EV["s3_title"] + (EV["r_title"],)):
        add(buf, sweep(0.35, 500, 1500, int(tt * 7)), tt - 0.05, 0.20)
    for ts in (EV["s1_scan"], EV["s2_scan"], EV["s3_scan"]):                    # foto sendo escaneada
        add(buf, sweep(1.0, 350, 1800, int(ts * 3)), ts, 0.28); add(buf, blip(1900, 0.06), ts + 1.0, 0.2)
    for tc, n in ((EV["s1_callA"], 16), (EV["s1_callB"], 18), (EV["s2_call"], 14), (EV["s3_call"], 18)):
        add(buf, blip(1300, 0.08), tc, 0.22); typing(buf, tc + 0.5, n, 34, 0.09)
    for ts in (EV["s1_stamp1"], EV["s1_stamp2"], EV["s2_stamp"], EV["s3_stamp"]): approve(buf, ts)
    for tt in EV["r_photos"]: add(buf, blip(1000 + 150 * (tt > 22), 0.09), tt, 0.25); add(buf, chime(2093, 0.7), tt + 0.1, 0.07)
    approve(buf, EV["r_stamp"], 1.2); typing(buf, EV["r_sub"], 20, 30, 0.10)
    add(buf, sweep(1.2, 250, 2600, 5), EV["m_scan"][0], 0.30)
    typing(buf, EV["m_head"], 30, 34, 0.08)
    for tr in EV["m_rows"]: add(buf, sweep(0.35, 400, 1200, int(tr * 5)), tr - 0.05, 0.2); approve(buf, tr + 0.45, 0.75)
    add(buf, chime(1568, 1.8), EV["c_logo"] + 0.25, 0.16); add(buf, chime(2093, 1.8), EV["c_logo"] + 0.4, 0.12)
    for tt in EV["c_lines"]: add(buf, sweep(0.35, 500, 1500, int(tt * 9)), tt - 0.05, 0.22); add(buf, thud(0.6), tt + 0.35, 0.28)
    for k in range(4): add(buf, blip(900 + 200 * k, 0.09), EV["c_arrow"] + 0.1 * k, 0.22)
    typing(buf, EV["c_sub"], 28, 30, 0.10)
    return buf


def write_wav(path, buf):
    pk = np.abs(buf).max()
    x = (np.clip(buf / max(pk, 1e-9) * 0.89, -1, 1) * 32767).astype("<i2").T.copy()
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(x.tobytes())


def main(work):
    out = music() * 0.55 + sfx()
    out = np.tanh(out * 1.8) / np.tanh(1.8) * 0.9
    write_wav(os.path.join(work, "mix.wav"), out)
    print("mix.wav: trilha + efeitos (sem voz)")


if __name__ == "__main__":
    main(sys.argv[1])
