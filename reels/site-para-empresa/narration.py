"""Gera a narração (voz em pt-BR) do Reels e o mapa de tempo de cada palavra.

Uso: python3 narration.py <pasta-do-modelo-kokoro> <pasta-de-saida>
Cada trecho (cláusula) é sintetizado separado para que os tempos das legendas
fiquem exatos; as pausas entre eles são controladas aqui.
"""
import json, re, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

MODEL_DIR, OUT_DIR = sys.argv[1], sys.argv[2]
VOICE, SPEED, SR = "pm_alex", 1.1, 24000

# (cena, texto). Pontuação define as pausas; "|" marca onde o texto é dividido sem pausa longa.
SCRIPT = [
    ("hook", "Sua empresa ainda não tem um site?"),
    ("hook", "Olha só cinco motivos pra mudar isso."),
    ("r1", "Número um: credibilidade."),
    ("r1", "Quem não está na internet, parece que não existe."),
    ("r2", "Número dois: o Google te encontra."),
    ("r2", "Vinte e quatro horas por dia, até enquanto você dorme."),
    ("r3", "Número três: você vende mais, trabalhando menos."),
    ("r3", "O cliente tira as dúvidas e já chama no WhatsApp."),
    ("r4", "Número quatro: você se destaca da concorrência."),
    ("r4", "Uma vitrine profissional passa confiança."),
    ("r5", "Número cinco: o site é seu."),
    ("r5", "Rede social muda as regras, o seu site não."),
    ("prazo", "A nossa empresa resolve isso em até quatro dias."),
    ("pagto", "E o nosso diferencial? Pagamento único."),
    ("pagto", "Sem mensalidade, diferente de outras empresas que cobram taxa todo mês."),
    ("cta", "Chama no direct e tire seu site do papel."),
]
# Texto exibido nas legendas (números em algarismos, mais legível na tela)
DISPLAY = {
    "Número um": "NÚMERO 1", "Número dois": "NÚMERO 2", "Número três": "NÚMERO 3",
    "Número quatro": "NÚMERO 4", "Número cinco": "NÚMERO 5",
    "Vinte e quatro horas": "24 HORAS", "cinco motivos": "5 MOTIVOS", "quatro dias": "4 DIAS",
}
GAP = {",": 0.14, ":": 0.22, ".": 0.38, "?": 0.34, "": 0.1}
PHRASE_GAP = 0.12

def syllables(w):
    w = re.sub(r"[^a-záàâãéêíóôõúüç]", "", w.lower())
    return max(1, len(re.findall(r"[aeiouáàâãéêíóôõúü]+", w)))

def trim(a, thr=0.012, pad=int(0.02 * SR)):
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(0, idx[0] - pad): idx[-1] + pad] if len(idx) else a

k = Kokoro(f"{MODEL_DIR}/kokoro-v1.0.onnx", f"{MODEL_DIR}/voices-v1.0.bin")
audio, t = [np.zeros(int(0.35 * SR), dtype=np.float32)], 0.35
phrases, words = [], []

for scene, text in SCRIPT:
    p_start = t
    clauses = re.findall(r"[^,.?]+[,.?]?", text)
    for ci, cl in enumerate(clauses):
        cl = cl.strip()
        punct = cl[-1] if cl[-1] in ",.?" else ""
        raw = cl.rstrip(",.?").strip()
        s, _ = k.create(cl, voice=VOICE, speed=SPEED, lang="pt-br")
        s = trim(s.astype(np.float32))
        dur = len(s) / SR
        ws = raw.split()
        # peso por sílaba; palavra antes de ":" ganha um respiro
        wt = [syllables(w) + (0.8 if w.endswith(":") else 0) for w in ws]
        tot = sum(wt)
        c = t
        for w, wi in zip(ws, wt):
            d = dur * wi / tot
            words.append({"w": w.rstrip(":"), "s": round(c, 3), "e": round(c + d, 3), "scene": scene})
            c += d
        audio.append(s)
        gap = GAP[punct] if ci < len(clauses) - 1 or True else 0
        audio.append(np.zeros(int(gap * SR), dtype=np.float32))
        t += dur + gap
    phrases.append({"scene": scene, "text": text, "s": round(p_start, 3), "e": round(t, 3)})
    audio.append(np.zeros(int(PHRASE_GAP * SR), dtype=np.float32)); t += PHRASE_GAP

# respiro final
audio.append(np.zeros(int(0.9 * SR), dtype=np.float32)); t += 0.9
wav = np.concatenate(audio)
wav = wav / max(1e-6, np.abs(wav).max()) * 0.92
sf.write(f"{OUT_DIR}/voice.wav", wav, SR)
json.dump({"duration": round(t, 3), "phrases": phrases, "words": words, "display": DISPLAY},
          open(f"{OUT_DIR}/timeline.json", "w"), ensure_ascii=False, indent=1)
print("duração", round(t, 2), "s;", len(words), "palavras")
for p in phrases: print(f'{p["s"]:6.2f}-{p["e"]:6.2f} [{p["scene"]}] {p["text"]}')
