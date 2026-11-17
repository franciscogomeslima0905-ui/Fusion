"""Trilha sonora sintetizada (numpy) para o comercial GOBÊ — 120 BPM, Dó maior, ~27 s.
Música + efeitos sincronizados com as cenas. Saída: wav estéreo 44,1 kHz."""
import numpy as np, wave, sys

SR = 44100
DUR = 27.0
N = int(SR * (DUR + 1.5))
BEAT = 0.5
rng = np.random.default_rng(7)

def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def tarr(d): return np.arange(int(d * SR)) / SR

class Bus:
    def __init__(self): self.L = np.zeros(N); self.R = np.zeros(N)
mus, drm, fxb = Bus(), Bus(), Bus()
send = np.zeros(N)           # envio para reverb (mono)

def place(bus, sig, t, g=1.0, pan=0.0, snd=0.0):
    i = int(t * SR)
    if i < 0 or i >= N: return
    sig = sig[:N - i]
    a = (pan + 1) * np.pi / 4
    bus.L[i:i + len(sig)] += sig * g * np.cos(a)
    bus.R[i:i + len(sig)] += sig * g * np.sin(a)
    if snd: send[i:i + len(sig)] += sig * g * snd

def fade(sig, a=0.004, r=0.02):
    n = len(sig); na = max(1, int(a * SR)); nr = max(1, min(n, int(r * SR)))
    sig[:na] *= np.linspace(0, 1, na); sig[-nr:] *= np.linspace(1, 0, nr); return sig

# ---------- instrumentos ----------
def ep(f, d):
    t = tarr(d + .25)
    s = (np.sin(2 * np.pi * f * t) * np.exp(-t * 2.6)
         + .42 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 4.5)
         + .20 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 7)
         + .12 * np.sin(2 * np.pi * 7.01 * f * t) * np.exp(-t * 22))
    s *= 1 + .06 * np.sin(2 * np.pi * 5 * t)
    env = np.ones_like(t); k = int(d * SR); env[k:] = np.exp(-(t[k:] - d) * 14)
    return fade(s * env, .003, .05)

def kalimba(f, d=.6):
    t = tarr(d)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 6) + .28 * np.sin(2 * np.pi * 4.02 * f * t) * np.exp(-t * 18) + .1 * np.sin(2 * np.pi * 9.1 * f * t) * np.exp(-t * 40)
    return fade(s, .002, .05)

def bass(f, d):
    t = tarr(d + .1)
    s = np.sin(2 * np.pi * f * t) + .32 * np.sin(4 * np.pi * f * t) + .1 * np.sin(6 * np.pi * f * t)
    env = np.exp(-t * 1.3); k = int(d * SR); env[k:] *= np.exp(-(t[k:] - d) * 30)
    return fade(s * env, .006, .04)

def pad(freqs, d):
    t = tarr(d); out = np.zeros_like(t)
    for f in freqs:
        for det in (-.0025, .0025):
            ff = f * (1 + det)
            for h, a in ((1, 1), (2, .35), (3, .15), (4, .06)):
                out += a * np.sin(2 * np.pi * ff * h * t + rng.uniform(0, 6.28))
    env = np.minimum(1, t / .9) * np.minimum(1, (d - t) / .9)
    return out * env / (len(freqs) * 2.2)

def kick():
    t = tarr(.42); f = 42 + 120 * np.exp(-t * 26)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return fade(np.sin(ph) * np.exp(-t * 8.5) + .25 * np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 400), .001, .02)

def hp(x, k=.97):
    y = np.zeros_like(x); p = 0.0; q = 0.0
    for i in range(len(x)):
        y[i] = k * (y[i - 1] + x[i] - p) if i else x[i]; p = x[i]
    return y

def clap():
    t = tarr(.32); n = rng.standard_normal(len(t))
    e = np.zeros_like(t)
    for off in (0, .011, .023): e += np.where(t >= off, np.exp(-(t - off) * 110), 0)
    e += np.where(t >= .03, np.exp(-(t - .03) * 24) * .5, 0)
    s = hp(n, .86) * e
    return fade(s, .001, .03) * .55

def hat(d=.05, g=1.0):
    t = tarr(d); n = hp(rng.standard_normal(len(t)), .93)
    return fade(n * np.exp(-t * (700 / d / 20 + 40)), .0005, .01) * g

def lp_sweep(d, f0, f1, shape=2.0):
    n = rng.standard_normal(int(d * SR)); y = np.zeros_like(n); p = 0.0
    fs = np.linspace(0, 1, len(n)) ** 1
    for i in range(len(n)):
        fc = f0 * (f1 / f0) ** fs[i]
        a = 1 - np.exp(-2 * np.pi * fc / SR)
        p += a * (n[i] - p); y[i] = p
    return y

def whoosh(d=1.15):
    s = lp_sweep(d, 250, 7000); t = np.linspace(0, 1, len(s))
    env = np.sin(np.pi * t) ** 1.6
    return s * env * 2.6

def pop(f0=520, f1=900, d=.13):
    t = tarr(d); f = f0 + (f1 - f0) * (1 - np.exp(-t * 30))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28)
    return fade(s, .001, .02)

def thud(f=70, d=.28):
    t = tarr(d); fr = f * (1 + 1.4 * np.exp(-t * 30))
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 14)
    n = hp(rng.standard_normal(len(t)), .9) * np.exp(-t * 90) * .35
    return fade(s + n, .001, .03)

def crack(d=.5):
    t = tarr(d); out = np.zeros_like(t)
    for off, a in ((0, 1), (.03, .7), (.065, .5), (.11, .35), (.17, .25), (.26, .15)):
        k = int(off * SR); m = hp(rng.standard_normal(int(.02 * SR)), .8) * np.exp(-np.arange(int(.02 * SR)) / SR * 220)
        out[k:k + len(m)] += m[:len(out) - k] * a
    return out * 1.1

def swish(d=.4):
    s = lp_sweep(d, 900, 5500); t = np.linspace(0, 1, len(s)); return s * np.sin(np.pi * t) ** 2 * 1.6

def bell(f, d=2.5):
    t = tarr(d)
    s = (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 2) + .3 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t * 4)) * np.exp(-t * 1.5)
    return fade(s, .002, .3)

def glaze(d=1.4):
    s = lp_sweep(d, 160, 1100); t = np.linspace(0, 1, len(s)); return s * np.sin(np.pi * t) ** 1.2 * 2.4

# ---------- composição ----------
CH = [  # (acorde, baixo)  Cmaj7 | Am7 | Fmaj7 | G6
    ([60, 64, 67, 71], 48), ([57, 60, 64, 67], 45), ([57, 60, 64, 65], 41), ([59, 62, 64, 67], 43)]
def chord_at(t): return CH[int(t // 2) % 4]
DROP, END_BEAT = 4.0, 23.0

# pad contínuo (toda a peça)
for b in range(14):
    notes, _ = CH[b % 4]
    place(mus, pad([mtof(n - 12) for n in notes[:3]] + [mtof(notes[3])], 2.4), b * 2 - .2, .26, 0, .35)

# kalimba arpejando: intro suave e depois motivo
pat = [3, 2, 1, 2, 3, 1, 2, 0]; on = [1, 0, 1, 1, 0, 1, 1, 0]
for b in range(14):
    notes, _ = CH[b % 4]
    for k in range(8):
        t = b * 2 + k * BEAT * .5 * 2 / 2
        t = b * 2 + k * .25 * 2  # colcheias (0,5 s por 1/4 → 0,25 s)
        t = b * 2 + k * .25
        if t < 1.0 or t >= 26.0: continue
        if t < DROP and k % 2: continue
        if not on[k] and t >= DROP: continue
        f = mtof(notes[pat[k]] + 12)
        g = (.30 if t < DROP else .55) * (1.15 if k % 4 == 0 else .85)
        place(mus, kalimba(f), t, g, -.35 + .7 * ((k % 3) / 2), .3)

# piano elétrico (a partir do drop até o fim)
for b in range(2, 14):
    notes, _ = CH[b % 4]
    for off, dd in ((0, .9), (.75, .55), (1.5, 1.0), (2.75, .8)):
        t = b * 2 + off
        if t < DROP or t >= 26.5: continue
        for n_ in notes:
            place(mus, ep(mtof(n_), dd), t, .24 if off else .28, (n_ - 62) / 40, .35)
# final: acorde longo de Dó maior com 7ª
for n_ in (60, 64, 67, 71, 76):
    place(mus, ep(mtof(n_), 2.8), 24.0, .12, (n_ - 66) / 30, .5)

# baixo
for b in range(2, 12):
    _, root = CH[b % 4]
    for off, dd in ((0, .9), (.75, .4), (1.5, .45), (2.25, .45), (3.0, .45)):
        t = b * 2 + off
        if DROP <= t < END_BEAT + .5:
            place(mus, bass(mtof(root), dd), t, .27 if off == 0 else .18, 0, 0)
place(mus, bass(mtof(48), 2.0), 24.0, .26, 0, 0)

# bateria
t = DROP
while t < END_BEAT:
    place(drm, kick(), t, .55, 0, 0)
    t += BEAT
t = DROP + BEAT
while t < END_BEAT:
    place(drm, clap(), t, .55, .05, .22); t += BEAT * 2
t = DROP + BEAT * .5
while t < END_BEAT:
    place(drm, hat(.05, .55), t, .30, .25, .05); t += BEAT
t = DROP + BEAT * .25
while t < END_BEAT:
    place(drm, hat(.03, .5), t, .11, -.2, 0); t += BEAT * .5 if t >= 20 else BEAT * 1.0
# intro: chimbal suave e riser
t = 2.0
while t < DROP:
    place(drm, hat(.05, .5), t, .13, .2, .1); t += BEAT
place(fxb, lp_sweep(2.0, 200, 9000) * np.linspace(0, 1, int(2.0 * SR)) ** 2, 2.0, .45, 0, .2)
place(drm, kick(), DROP - .01, .7, 0, 0)

# ---------- efeitos sincronizados com o vídeo ----------
for b in (4, 10, 15, 20, 23):
    place(fxb, whoosh(), b - .58, .62, 0, .25)
place(fxb, pop(800, 400, .16), .75, .35, 0, .5)                  # gota de glacê toca a tela
place(fxb, glaze(1.3), .7, .30, 0, .3)                            # logo "escorrendo"
for tt in (2.1, 2.5, 3.0): place(fxb, bell(mtof(88 + int(tt * 3) % 4 * 2), 1.2), tt, .10, (-1) ** int(tt * 10) * .4, .6)
# cena 2 — brownies
place(fxb, thud(60, .3), 4.6, .55, 0, .15)
place(fxb, swish(.5), 4.5, .22, 0, .1)
place(fxb, thud(85, .22), 5.38, .55, 0, .1); place(fxb, crack(.3), 5.38, .22, 0, .1)   # corte
place(fxb, swish(.5), 6.05, .22, .3, .1)
place(fxb, lp_sweep(1.7, 700, 1800) * np.sin(np.pi * np.linspace(0, 1, int(1.7 * SR))) ** 1.4 * 1.8, 7.4, .32, .2, .2)  # calda
# cena 3 — cookies
place(fxb, pop(300, 700, .18), 10.1, .5, 0, .3); place(fxb, thud(75, .22), 10.45, .35, 0, .1)
place(fxb, swish(.6), 10.7, .2, 0, .1)
place(fxb, crack(.5), 11.8, .55, 0, .25); place(fxb, thud(55, .3), 11.82, .35, 0, .1)
# cena 4 — brigadeiros
place(fxb, swish(.5), 14.7, .22, 0, .1)
for i in range(12):
    place(fxb, pop(500 + (i % 4) * 90, 950 + (i % 4) * 90, .12), 15.62 + .12 * i, .30, -.5 + (i % 3) * .5, .35)
for i in (0, 3, 6, 9):
    place(fxb, bell(mtof(84 + [0, 4, 7, 12][i // 3]), 1.3), 17.3 + .17 * i, .09, (i - 4.5) / 6, .7)
# cena 5 — variedade
for tt in (20.0, 20.25, 20.3): place(fxb, pop(300, 700, .17), tt + .15, .4, 0, .3)
for i in range(7): place(fxb, pop(560 + i * 40, 980 + i * 40, .12), 20.8 + .1 * i, .28, -.5 + i / 6, .35)
# cena 6 — logo, sparkle final
place(fxb, glaze(1.3), 23.1, .28, 0, .3)
for k, n_ in enumerate((84, 88, 91, 96)): place(fxb, bell(mtof(n_), 3.0), 23.75 + k * .13, .16 + .02 * k, -.4 + .27 * k, .8)
place(fxb, thud(50, .5), 24.0, .55, 0, .3)
place(fxb, bell(mtof(100), 2.5), 24.9, .07, .3, .8)

# ---------- reverb (convolução por FFT) ----------
def make_ir(seed):
    r = np.random.default_rng(seed); n = int(2.2 * SR); t = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-t * 2.6)
    k = 1 - np.exp(-2 * np.pi * np.linspace(9000, 1500, n) / SR); y = np.zeros(n); p = 0.0
    for i in range(n): p += k[i] * (ir[i] - p); y[i] = p
    y[:int(.012 * SR)] *= np.linspace(0, 1, int(.012 * SR)); return y / np.sqrt(np.sum(y * y)) * .9
def fftconv(x, ir):
    n = 1 << int(np.ceil(np.log2(len(x) + len(ir)))); return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)[:len(x)]
revL, revR = fftconv(send, make_ir(1)), fftconv(send, make_ir(2))

# ---------- sidechain (bombeia o pad/teclas no bumbo) ----------
tt = np.arange(N) / SR
duck = np.ones(N)
ph = (tt - DROP) % BEAT
act = (tt >= DROP) & (tt < END_BEAT)
duck[act] = 1 - .42 * np.exp(-ph[act] / .11)
mL, mR = mus.L * duck, mus.R * duck

L = mL + drm.L + fxb.L + revL * .55
R = mR + drm.R + fxb.R + revR * .55

# ---------- master ----------
n = int(DUR * SR)
L, R = L[:n], R[:n]
tfull = np.arange(n) / SR
fin = np.minimum(1, tfull / .25); fout = np.minimum(1, np.maximum(0, (DUR - tfull) / 1.1))
L *= fin * fout; R *= fin * fout
mx = max(np.abs(L).max(), np.abs(R).max())
L, R = np.tanh(L / mx * 1.6) / np.tanh(1.6), np.tanh(R / mx * 1.6) / np.tanh(1.6)
L, R = L * .89, R * .89
pcm = (np.stack([L, R], 1) * 32767).astype('<i2')
out = sys.argv[1] if len(sys.argv) > 1 else 'trilha.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
rms = np.sqrt(np.mean(pcm.astype(float) ** 2)) / 32767
print('ok', out, 'dur', n / SR, 's  peak', np.abs(pcm).max() / 32767, ' rms dBFS', 20 * np.log10(rms))
