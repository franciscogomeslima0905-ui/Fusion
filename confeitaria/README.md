# Ateliê Doce — landing page

Landing page estática (HTML + CSS + JS puro, sem build) da confeitaria, seguindo o sistema visual
"Redbrick" do `DESIGN.md`: vermelho `#e82c2a` sobre branco, títulos em serifa leve (peso 300),
cartões `#f2f2f2` com raio de 25px, links em contorno e sem sombras.

## Como ver

```bash
cd confeitaria
python3 -m http.server 8000   # abra http://localhost:8000
```

Ou publique a pasta `confeitaria/` em qualquer hospedagem estática (Netlify, Vercel, GitHub Pages...).

## O que editar

- **WhatsApp e Instagram:** objeto `CONFIG` no topo de `js/main.js`. Todos os botões "Pedir/Encomendar"
  já montam a mensagem com o nome do doce.
- **Nome da confeitaria:** hoje é um nome provisório, "Ateliê Doce". Troque em `index.html`
  (título, logo, rodapé) e, se quiser outro ícone, em `favicon.svg`.
- **Doces e textos:** seção `#cardapio` em `index.html` (um `<article class="card">` por doce).
- **Fotos:** `img/` (WebP 720×960 e versão `-sm` 480×640). Substitua mantendo os nomes, de preferência
  por originais em alta resolução.

## Animações

Títulos revelados palavra por palavra, imagens reveladas como cortina com parallax, linhas que se
desenham ao rolar, faixa em movimento, filtro do cardápio, acordeão de dúvidas, menu mobile animado,
barra de progresso e botão flutuante. Tudo respeita `prefers-reduced-motion`.

## Fontes

Auto-hospedadas em `fonts/` (licença OFL): Fraunces (substituta da Editorial Old), Inter (substituta
da Surt) e JetBrains Mono (substituta da GT Standard Mono).
