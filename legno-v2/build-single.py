#!/usr/bin/env python3
"""Gera legno-pagina-unica.html: index.html com todas as imagens embutidas (base64).
Uso: python3 build-single.py"""
import base64, mimetypes, pathlib, re

base = pathlib.Path(__file__).parent
html = (base / "index.html").read_text(encoding="utf-8")

def data_uri(rel):
    path = base / rel
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()

html = re.sub(r"""(src=|url\()(["']?)(img/[^"')\s]+)\2""",
              lambda m: f"{m.group(1)}{m.group(2)}{data_uri(m.group(3))}{m.group(2)}", html)

out = base / "legno-pagina-unica.html"
out.write_text(html, encoding="utf-8")
print(f"{out.name}: {out.stat().st_size / 1024:.0f} KB")
