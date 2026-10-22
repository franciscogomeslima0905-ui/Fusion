# Brumar Delivery — landing page

Página estática (HTML + CSS + JS puro, sem build) seguindo o `DESIGN.md` (estilo sweetgreen: canvas creme,
verde-floresta, botão lime em pílula, tipografia display grande com line-height 0.85).

Para ver: `cd brumar-delivery && python3 -m http.server 8000` → http://localhost:8000

## Antes de publicar — edite em `main.js` (topo do arquivo)

- `CONFIG.whatsapp` — número com DDI+DDD, só dígitos (hoje é um placeholder inválido).
- `CONFIG.instagram` — URL do perfil (vazio = link oculto no rodapé).

Nomes e descrições dos produtos (seção `#cardapio` no `index.html`) foram escritos a partir das fotos — ajuste ao
cardápio real. Fontes (Outfit, Figtree, Fraunces) vêm do Google Fonts como substitutas de SweetSans/Grenette.

Animações: abertura do hero, títulos em máscara, reveal ao rolar, parallax, marquee, filtro do cardápio,
botões magnéticos, logo girando no CTA final. Respeita `prefers-reduced-motion`.
