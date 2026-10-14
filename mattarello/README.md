# Mattarello Gourmet — landing page

Site estático (HTML + CSS + JS puro, sem build). Abra `index.html` ou publique a pasta em qualquer hospedagem estática.
Para testar localmente: `python3 -m http.server` dentro desta pasta.

## O que editar
- **`js/config.js`** — link do iFood, WhatsApp, telefone, Instagram, endereço, link do Google Maps e horários.
  Campos vazios não aparecem na página; ao preencher, os botões e o bloco de contato surgem sozinhos.
- **`index.html`** — textos, nomes dos pratos e fotos. As fotos ficam em `img/`.
- **`css/style.css`** — cores e tipografia estão nas variáveis de `:root` (baseado no `DESIGN.md`, com o vermelho
  e o verde do logotipo no lugar do amarelo).

## Adicionar mais mídias ao carrossel
No `index.html`, dentro da seção `#inicio`, duplique **um** `<article class="hero__text">`, **um**
`<figure class="hero__slide">` e **um** `<button class="hero__bar">` (e ajuste o `data-slide`). O JS detecta o total sozinho.
Fotos ideais: vertical 4:5 (ex.: 1080×1350), sem barras pretas.
