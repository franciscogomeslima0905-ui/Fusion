# Brumar Delivery — landing page

Página estática (HTML + CSS + JS puro, sem build) seguindo o layout do `DESIGN.md` (estilo sweetgreen) com paleta creme + vinho/tijolo + dourado (sem preto);
hero com vídeo (`assets/hero.mp4`) ocupando toda a área inicial, texto e botão abaixo dele; tipografia display grande com line-height 0.85.

Para ver: `cd brumar-delivery && python3 -m http.server 8000` → http://localhost:8000

## Antes de publicar — edite em `main.js` (topo do arquivo)

- `CONFIG.whatsapp` — número com DDI+DDD, só dígitos (hoje é um placeholder inválido).
- `CONFIG.instagram` — já aponta para @brumar_delivery (vazio = link oculto no rodapé).

Nomes e descrições dos produtos (seção `#cardapio` no `index.html`) foram escritos a partir das fotos — ajuste ao
cardápio real. Fontes (Outfit, Figtree, Fraunces) vêm do Google Fonts como substitutas de SweetSans/Grenette.

Animações: abertura do hero, títulos em máscara, reveal ao rolar, parallax, marquee, filtro do cardápio,
botões magnéticos, logo girando no CTA final. Respeita `prefers-reduced-motion`.
