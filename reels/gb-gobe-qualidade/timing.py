"""Tempo de cada palavra da narração.

- Se existir <pasta>/timeline.json (gerado por narration.py a partir da voz real), usa esse.
- Senão, ESTIMA os tempos distribuindo as palavras na janela de cada fala (peso por sílaba + pausas
  de pontuação). A estimativa serve para pré-visualizar legendas e fechar o vídeo; os tempos reais
  só existem depois que a voz é gerada.
"""
import json, os, re
from plan import LINES

PAUSE = {",": 0.16, ".": 0.30, "!": 0.30, "?": 0.30, "…": 0.30, ":": 0.2}


def syl(w):
    w = re.sub(r"[^a-záàâãéêíóôõúüç]", "", w.lower())
    return max(1, len(re.findall(r"[aeiouáàâãéêíóôõúü]+", w)))


def estimate():
    words = []
    for lid, s, e, text, _ in LINES:
        toks = text.split()
        w = [syl(t) + (0.35 if t.rstrip().endswith("...") else 0) for t in toks]
        pause = [PAUSE.get(t[-1], 0) if t[-1] in PAUSE else 0 for t in toks]
        pause = [(0.38 if t.endswith("...") else p) for t, p in zip(toks, pause)]
        pause[-1] = 0
        avail = (e - s) - sum(pause)
        tot = sum(w)
        c = s
        for t, wi, p in zip(toks, w, pause):
            d = avail * wi / tot
            words.append(dict(w=t, s=round(c, 3), e=round(c + d, 3), line=lid))
            c += d + p
    return dict(words=words, estimated=True)


def load_timeline(workdir=None):
    if workdir:
        p = os.path.join(workdir, "timeline.json")
        if os.path.exists(p):
            return json.load(open(p))
    return estimate()
