"""Narração feminina em pt-BR (Kokoro, voz 'pf_dora') encaixada nas janelas de cada cena.

Uso:  python3 narration.py <pasta-do-modelo-kokoro> <pasta-de-trabalho>
Pré-requisitos (ainda NÃO instalados neste ambiente):
    pip install kokoro-onnx soundfile
    kokoro-v1.0.onnx e voices-v1.0.bin (https://github.com/thewh1teagle/kokoro-onnx/releases, tag model-files-v1.0)

Saída em <pasta-de-trabalho>: voice.wav (35 s, mono) e timeline.json (tempo real de cada palavra, usado pelas legendas).
Cada fala é sintetizada por trechos (vírgulas/pontos) e a velocidade é ajustada para caber na janela de plan.LINES.
Depois:  python3 audio.py <pasta>  e  python3 build.py <pasta> saida.mp4
"""
import json, re, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
from plan import LINES, DUR
from timing import syl

MODEL_DIR, WORK = sys.argv[1], sys.argv[2]
VOICE, SR = "pf_dora", 24000
GAP = {",": 0.16, ".": 0.30, "!": 0.30, "?": 0.30, "…": 0.38}
k = Kokoro(f"{MODEL_DIR}/kokoro-v1.0.onnx", f"{MODEL_DIR}/voices-v1.0.bin")


def trim(a, thr=0.012, pad=int(0.02 * SR)):
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(0, idx[0] - pad): idx[-1] + pad] if len(idx) else a


def clauses(text):
    return [c.strip() for c in re.findall(r"[^,.!?]+(?:\.\.\.|[,.!?])?", text) if c.strip()]


def synth_line(tts_text, speed):
    segs = []
    for cl in clauses(tts_text):
        punct = "…" if cl.endswith("...") else (cl[-1] if cl[-1] in ",.!?" else "")
        s, _ = k.create(cl, voice=VOICE, speed=speed, lang="pt-br")
        segs.append((cl, punct, trim(s.astype(np.float32))))
    total = sum(len(s) / SR + GAP.get(p, 0.1) for _, p, s in segs[:-1]) + len(segs[-1][2]) / SR
    return segs, total


out = np.zeros(int(DUR * SR), np.float32)
words = []
for lid, start, end, shown, tts in LINES:
    window = end - start
    speed = 1.0
    segs, total = synth_line(tts, speed)
    for _ in range(4):   # ajusta a velocidade até a fala caber na janela (sem passar de 1,3x)
        if total <= window and (total >= window * 0.85 or speed <= 0.88):
            break
        speed = float(np.clip(speed * total / (window * 0.96), 0.85, 1.3))
        segs, total = synth_line(tts, speed)
    # centraliza dentro da janela se sobrar espaço
    t = start + max(0.0, (window - total) / 2)
    shown_words = shown.split()
    wi = 0
    for ci, (cl, punct, s) in enumerate(segs):
        i = int(t * SR)
        out[i:i + len(s)] += s[: len(out) - i]
        n_tts = len(cl.rstrip(".,!?…").split())
        ws = shown_words[wi: wi + n_tts]
        wi += n_tts
        wt = [syl(w) for w in ws]
        c = t
        for w, x in zip(ws, wt):
            d = (len(s) / SR) * x / sum(wt)
            words.append(dict(w=w, s=round(c, 3), e=round(c + d, 3), line=lid))
            c += d
        t += len(s) / SR + GAP.get(punct, 0.1)
    # palavras restantes (grafia da legenda ≠ grafia do TTS) herdam o fim da fala
    for w in shown_words[wi:]:
        words.append(dict(w=w, s=round(t - 0.2, 3), e=round(t, 3), line=lid))
    print(f"{lid}: janela {window:.2f}s, fala {total:.2f}s, velocidade {speed:.2f}")

out = out / max(1e-6, np.abs(out).max()) * 0.92
sf.write(f"{WORK}/voice.wav", out, SR)
json.dump(dict(words=words, estimated=False), open(f"{WORK}/timeline.json", "w"), ensure_ascii=False, indent=1)
print("ok:", len(words), "palavras")
