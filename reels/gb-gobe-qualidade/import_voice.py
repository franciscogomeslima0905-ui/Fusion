"""Usa uma voz de verdade (sua gravação) ou gerada em outra ferramenta (ElevenLabs, Azure, Google, etc.).

Uso:  python3 import_voice.py <pasta-de-trabalho> <pasta-com-os-audios>
Na pasta de áudios, um arquivo por fala, com o nome do id (qualquer formato: mp3, wav, m4a, ogg):
    l1, l2, ...   (os ids e os textos estão em plan.py -> LINES; o texto de cada fala está no README)
Grave/gere cada fala com o texto exato da legenda. O script:
  - corta silêncios, ajusta o tempo (até ±15 %) para caber na janela da cena e posiciona cada fala;
  - descobre o tempo de cada palavra pelas pausas reais e escreve timeline.json (legendas sincronizadas);
  - grava <pasta-de-trabalho>/voice.wav. Depois: python3 audio.py <pasta> && python3 build.py <pasta> saida.mp4
"""
import glob, json, os, subprocess, sys, tempfile
import numpy as np
import soundfile as sf
from plan import LINES, DUR
from align import word_times

WORK, SRC = sys.argv[1], sys.argv[2]
SR = 44100
out = np.zeros(int(DUR * SR), np.float32)
words = []


def load(path, tempo=1.0):
    tmp = os.path.join(tempfile.gettempdir(), "imp.wav")
    af = f"atempo={tempo:.4f}" if abs(tempo - 1) > 0.005 else "anull"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", path, "-af", af, "-ar", str(SR), "-ac", "1", tmp], check=True)
    a, _ = sf.read(tmp)
    idx = np.where(np.abs(a) > 0.012)[0]
    return a[max(0, idx[0] - 1000): idx[-1] + 1000].astype(np.float32)


for lid, start, end, shown, _ in LINES:
    cands = glob.glob(os.path.join(SRC, lid + ".*"))
    if not cands:
        sys.exit(f"faltou o áudio da fala '{lid}' em {SRC}")
    a = load(cands[0])
    window = end - start
    if len(a) / SR > window:
        tempo = min(1.15, len(a) / SR / window * 1.01)
        a = load(cands[0], tempo)
    dur = len(a) / SR
    if dur > window + 0.05:
        print(f"AVISO {lid}: fala de {dur:.2f}s não cabe na janela de {window:.2f}s — amplie a janela em plan.py")
    t = start + max(0.0, (window - dur) / 2)
    i = int(t * SR)
    out[i:i + len(a)] += a[: len(out) - i]
    for w, s, e in word_times(shown.split(), a, SR, t):
        words.append(dict(w=w, s=round(s, 3), e=round(e, 3), line=lid))
    print(f"{lid}: {dur:.2f}s (janela {window:.2f}s)")
out = out / max(1e-6, np.abs(out).max()) * 0.9
sf.write(f"{WORK}/voice.wav", out, SR)
json.dump(dict(words=words, estimated=False), open(f"{WORK}/timeline.json", "w"), ensure_ascii=False, indent=1)
print("ok")
