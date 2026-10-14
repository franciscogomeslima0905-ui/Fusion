#!/usr/bin/env python3
"""Gera um único HTML autocontido (CSS, JS, fontes, imagens e vídeo embutidos).
Uso: python3 build-single.py [saida.html]   (padrão: master-car-landing.html)"""
import base64, re, sys, json, pathlib

root = pathlib.Path(__file__).resolve().parent
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'master-car-landing.html'
b64 = lambda p: base64.b64encode((root / p).read_bytes()).decode()
mime = {'.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.woff2': 'font/woff2'}

html = (root / 'index.html').read_text(encoding='utf-8')

# CSS (com fontes em data URI)
css = (root / 'css/style.css').read_text(encoding='utf-8')
css = re.sub(r"url\('\.\./(fonts/[^']+)'\)",
             lambda m: f"url('data:font/woff2;base64,{b64(m.group(1))}')", css)
html = html.replace('<link rel="stylesheet" href="css/style.css">', f'<style>{css}</style>')

# Remove preloads de arquivos locais
html = re.sub(r'\s*<link rel="preload"[^>]*>', '', html)

# Mídias: cada arquivo entra uma única vez (base64 no JSON) e é ligado via blob URL
assets = {}
def key(path):
    assets[path] = (mime[pathlib.Path(path).suffix], b64(path))
    return path

html = re.sub(r'data-img="(assets/[^"]+)"', lambda m: f'data-img="{key(m.group(1))}"', html)
html = re.sub(r'(<(?:img|source)\b[^>]*?)\ssrc="(assets/[^"]+)"',
              lambda m: f'{m.group(1)} data-asset="{key(m.group(2))}"', html)
html = re.sub(r'\sposter="(assets/[^"]+)"', lambda m: f' data-poster="{key(m.group(1))}"', html)
html = re.sub(r'content="assets/[^"]*"', 'content=""', html)

loader = """
(function(){
  var A = %s, U = {};
  function url(k){ if(!U[k]){ var d=A[k], s=atob(d[1]), n=s.length, u=new Uint8Array(n);
    for(var i=0;i<n;i++) u[i]=s.charCodeAt(i); U[k]=URL.createObjectURL(new Blob([u],{type:d[0]})); } return U[k]; }
  document.querySelectorAll('[data-poster]').forEach(function(e){ e.poster = url(e.dataset.poster); });
  document.querySelectorAll('img[data-asset]').forEach(function(e){ e.src = url(e.dataset.asset); });
  document.querySelectorAll('[data-img]').forEach(function(e){ e.dataset.img = url(e.dataset.img); });
  document.querySelectorAll('source[data-asset]').forEach(function(e){ e.src = url(e.dataset.asset); e.parentNode.load(); });
})();
""" % json.dumps(assets, separators=(',', ':'))

scripts = ''.join((root / p).read_text(encoding='utf-8') + '\n;\n'
                  for p in ['vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js', 'vendor/SplitText.min.js'])
tail = re.compile(r'<script src="vendor/gsap\.min\.js"></script>.*?<script src="js/main\.js"></script>', re.S)
main = (root / 'js/main.js').read_text(encoding='utf-8')
assert tail.search(html)
html = tail.sub(lambda m: f'<script>{loader}</script>\n<script>{scripts}</script>\n<script>{main}</script>', html)

out.write_text(html, encoding='utf-8')
print(f'{out}  {out.stat().st_size/1e6:.1f} MB')
