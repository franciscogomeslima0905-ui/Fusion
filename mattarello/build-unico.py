#!/usr/bin/env python3
"""Gera mattarello-unico.html: a página inteira (CSS, JS, fontes e fotos) em um único arquivo."""
import re, base64, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
rd = lambda p: open(p, encoding='utf-8').read()

html, css = rd('index.html'), rd('css/style.css')
css = re.sub(r"url\('\.\./fonts/([\w-]+\.woff2)'\)", lambda m: f"url('data:font/woff2;base64,{b64('fonts/' + m.group(1))}')", css)
html = re.sub(r'\s*<link rel="preload"[^>]*>', '', html)
html = html.replace('<link rel="stylesheet" href="css/style.css" />', '<style>\n' + css + '\n</style>')
html = html.replace('<script src="js/config.js"></script>', '<script>\n' + rd('js/config.js') + '\n</script>')
html = html.replace('<script src="js/main.js"></script>', '<script>\n' + rd('js/main.js') + '\n</script>')
html = html.replace('href="favicon.svg"', 'href="data:image/svg+xml;base64,' + b64('favicon.svg') + '"')
html = re.sub(r'src="img/([\w-]+\.jpg)"', lambda m: f'src="data:image/jpeg;base64,{b64("img/" + m.group(1))}"', html)
open('mattarello-unico.html', 'w', encoding='utf-8').write(html)
print(f'mattarello-unico.html: {len(html) // 1024} KB')
