"""Alinha as palavras da legenda ao áudio falado, usando as pausas reais (vírgulas, dois-pontos, fim de frase)."""
import numpy as np
from timing import syl

SYL_OVERRIDE = {"gb": 2, "gobê": 2}
RANK = {".": 0, "!": 0, "?": 0, "…": 0, ":": 1, ",": 2}


def inner_pauses(a, sr, min_len=0.075):
    fl = int(0.01 * sr)
    env = np.array([np.sqrt((a[i:i + fl] ** 2).mean()) for i in range(0, len(a) - fl, fl)])
    thr = 0.05 * np.percentile(env, 95)
    sil, out, i = env < thr, [], 0
    while i < len(sil):
        if sil[i]:
            j = i
            while j < len(sil) and sil[j]:
                j += 1
            if i > 8 and j < len(sil) - 8 and (j - i) * 0.01 >= min_len:
                out.append((i * 0.01, j * 0.01))
            i = j
        else:
            i += 1
    return out


def _end(x):
    x = x.rstrip()
    return "…" if x.endswith("...") or x.endswith("…") else x[-1]


def word_times(shown_words, audio, sr, t0):
    dur = len(audio) / sr
    w = [SYL_OVERRIDE.get(x.lower().strip(",.:!?…"), syl(x)) for x in shown_words]
    tot_w = float(sum(w))
    cand = sorted((RANK[_end(x)], i) for i, x in enumerate(shown_words[:-1]) if _end(x) in RANK)
    pauses = inner_pauses(audio, sr)
    chosen = {}                     # índice da palavra antes da quebra -> pausa (início, fim)
    free = list(pauses)
    for _, i in cand:               # quebras mais importantes primeiro
        exp = dur * sum(w[: i + 1]) / tot_w
        near = [p for p in free if abs((p[0] + p[1]) / 2 - exp) <= min(0.8, 0.3 + 0.06 * dur)]
        if near:
            p = min(near, key=lambda p: abs((p[0] + p[1]) / 2 - exp))
            chosen[i] = p
            free.remove(p)
    cuts, last = [], -1.0
    for i in sorted(chosen):        # as pausas precisam seguir a ordem das palavras
        if chosen[i][0] > last:
            cuts.append(i)
            last = chosen[i][1]
    pz = [chosen[i] for i in cuts]
    idx = [0] + [c + 1 for c in cuts] + [len(shown_words)]
    times = [0.0] + [p for pe in pz for p in pe] + [dur]
    out = []
    for n in range(len(idx) - 1):
        a, b, ts, te = idx[n], idx[n + 1], times[2 * n], times[2 * n + 1]
        tot = sum(w[a:b])
        c = ts
        for x, wi in zip(shown_words[a:b], w[a:b]):
            d = (te - ts) * wi / tot
            out.append((x, t0 + c, t0 + c + d))
            c += d
    return out
