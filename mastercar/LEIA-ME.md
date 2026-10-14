# Master Car — landing page

Site estático (HTML + CSS + JS), sem build. Para ver, abra `index.html` no navegador
ou rode `python3 -m http.server` dentro desta pasta.

Visual baseado no `DESIGN.md` (estilo showroom: preto, tipografia condensada em caixa alta,
raio 0, sem sombras, um único acento amarelo por tela). Animações com GSAP + ScrollTrigger + SplitText
(arquivos locais em `vendor/`). Respeita `prefers-reduced-motion`.

## Antes de publicar

1. **WhatsApp** — em `js/main.js`, troque `CONFIG.whatsapp` (hoje `5500000000000`, número fictício)
   pelo número real, com DDI + DDD, só dígitos. Todos os botões e o formulário usam esse valor.
2. **Textos dos serviços** — `index.html`, seções "Serviços", "Processo" e "Dúvidas". Foram escritos
   a partir do que aparece nas fotos/vídeo (polimento, lixamento, vidros, couro, proteção). Ajuste ao que
   a Master Car realmente oferece.
3. **Endereço, horário e Instagram** — não foram inventados. Adicione no rodapé (`.footer__contact`).

## Trocar ou adicionar imagens

- Fotos em `assets/img/`. Para trocar uma, substitua o arquivo mantendo o nome.
- Vídeo do hero: `assets/video/estudio.mp4` (+ `estudio-poster.jpg`). Sem áudio, em loop.
- Os serviços usam `data-img` em cada `<li class="svc__item">`; as etapas do processo usam `<figure class="pstep__img">`.

## Estrutura

```
index.html   conteúdo
css/style.css  tokens do design + componentes
js/main.js   menu, pré-carregamento, animações, formulário → WhatsApp
vendor/      gsap, ScrollTrigger, SplitText
fonts/       Barlow Condensed (substituta livre da LamboType)
```

Observação de design: o texto do botão amarelo é escuro (#202020), não branco como no guia,
porque branco sobre #ffc000 não passa no contraste mínimo de acessibilidade.
