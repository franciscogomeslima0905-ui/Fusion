"""Narração feminina pt-BR (Kokoro, voz 'pf_dora') encaixada nas janelas de cada cena — versão "mais natural".

Uso:  python3 narration.py <pasta-do-modelo-kokoro> <pasta-de-trabalho>
Saída: <pasta>/voice.wav (35 s, 44,1 kHz mono) e <pasta>/timeline.json (tempo real de cada palavra).

O que torna a voz menos "de IA" (em relação à primeira versão):
 - sintetiza FRASES inteiras (vírgulas não cortam a fala), para a entonação correr de ponta a ponta;
 - ritmo mais calmo (começa em 0,96×) com variação leve por frase e pausas de tamanhos diferentes;
 - respiros bem baixinhos antes das frases;
 - entonação ampliada (prosody.py): mais subidas e descidas de tom, mesmo timbre e ritmo;
 - tratamento de estúdio: corta graves, realça presença, comprime de leve e dá um "ar de sala" curtinho
   (a voz crua do Kokoro é seca e sem espaço, o que denuncia a síntese).
Os tempos das palavras são ancorados nas pausas reais do áudio (onde há vírgula/dois-pontos).
"""
import json, re, subprocess, sys, tempfile, os
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
from plan import LINES, DUR
from align import word_times
from prosody import enliven

MODEL_DIR, WORK = sys.argv[1], sys.argv[2]
VOICE, SR = "pf_dora", 24000
rng = np.random.default_rng(4)
k = Kokoro(f"{MODEL_DIR}/kokoro-v1.0.onnx", f"{MODEL_DIR}/voices-v1.0.bin")
GAP = {"…": 0.52, ".": 0.34, "!": 0.34, "?": 0.34}


def trim(a, thr=0.012, pad=int(0.025 * SR)):
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(0, idx[0] - pad): idx[-1] + pad] if len(idx) else a


def split_sentences(text):
    return [s.strip() for s in re.findall(r"[^.!?]+(?:\.\.\.|[.!?])+|[^.!?]+$", text) if s.strip()]


def synth_sentence(tts_text, speed):
    s, _ = k.create(tts_text, voice=VOICE, speed=speed, lang="pt-br")
    return trim(s.astype(np.float32))


def breath(n_s=0.2):
    n = int(n_s * SR)
    x = rng.normal(0, 1, n)
    F = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR); F[(f < 700) | (f > 5200)] = 0
    x = np.fft.irfft(F, n)
    env = np.sin(np.linspace(0, np.pi, n)) ** 2
    return (x / np.abs(x).max() * env * 0.05).astype(np.float32)


def fit_line(text, window):
    sents = split_sentences(text)
    speed = 0.96
    for _ in range(5):
        parts = [synth_sentence(s, speed * rng.uniform(0.985, 1.015)) for s in sents]
        gaps = [GAP["…" if s.endswith("...") else s[-1]] * rng.uniform(0.9, 1.12) for s in sents[:-1]]
        total = sum(len(p) / SR for p in parts) + sum(gaps)
        if total <= window and total >= window * 0.88:
            break
        if total < window * 0.88 and speed <= 0.9:
            break
        speed = float(np.clip(speed * total / (window * 0.95), 0.88, 1.25))
    return sents, parts, gaps, total, speed


out = np.zeros(int(DUR * SR), np.float32)
words = []
for lid, start, end, shown, tts in LINES:
    window = end - start
    tts_sents, parts, gaps, total, speed = fit_line(tts, window)
    shown_sents = split_sentences(shown)
    t = start + max(0.0, (window - total) / 2)
    for si, (p, ss) in enumerate(zip(parts, shown_sents)):
        if si == 0 or gaps[si - 1] >= 0.3:       # respiro antes da frase
            b = breath()
            i = max(0, int((t - 0.30) * SR))
            out[i:i + len(b)] += b
        i = int(t * SR)
        out[i:i + len(p)] += p[: len(out) - i]
        for w, s, e in word_times(ss.split(), p, SR, t):
            words.append(dict(w=w, s=round(s, 3), e=round(e, 3), line=lid))
        t += len(p) / SR + (gaps[si] if si < len(gaps) else 0)
    print(f"{lid}: janela {window:.2f}s, fala {total:.2f}s, velocidade {speed:.2f}")

out = out / max(1e-6, np.abs(out).max()) * 0.9
out = enliven(out, SR, gain=1.6)          # entonação mais expressiva (sobe/desce mais por frase)
raw = os.path.join(tempfile.gettempdir(), "voz_crua.wav")
sf.write(raw, out, SR)
CHAIN = ("highpass=f=85,lowpass=f=11500,"
         "equalizer=f=190:width_type=q:w=0.9:g=2.2,"          # corpo / calor
         "equalizer=f=3100:width_type=q:w=1.0:g=2.4,"         # presença
         "equalizer=f=6900:width_type=q:w=2.0:g=-3.0,"        # suaviza o chiado do sintetizador
         "acompressor=threshold=0.07:ratio=2.2:attack=12:release=160:makeup=2.4,"
         "aecho=0.85:0.9:38|83:0.16|0.08,"                     # ar de sala curtinho
         "alimiter=limit=0.95")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", CHAIN, "-ar", "44100", "-ac", "1", f"{WORK}/voice.wav"], check=True)
json.dump(dict(words=words, estimated=False), open(f"{WORK}/timeline.json", "w"), ensure_ascii=False, indent=1)
print("ok:", len(words), "palavras")
