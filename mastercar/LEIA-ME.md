# Master Car — landing page

Site estático (HTML + CSS + JS), sem build. Para gerar uma versão em arquivo único (tudo embutido): `python3 build-single.py`. Para ver, abra `index.html` no navegador
ou rode `python3 -m http.server` dentro desta pasta.

Visual: preto de showroom, um acento amarelo nos botões, títulos pesados em caixa alta e texto corrido em
caixa normal (fonte Archivo, variável, local em `fonts/`). Botões com cantos cortados em diagonal.
Animações com GSAP + ScrollTrigger + SplitText (arquivos locais em `vendor/`). Respeita `prefers-reduced-motion`.

## Antes de publicar

1. **WhatsApp** — em `js/main.js`, troque `CONFIG.whatsapp` (hoje `5500000000000`, número fictício)
   pelo número real, com DDI + DDD, só dígitos. Todos os botões e o formulário usam esse valor.
2. **Textos dos serviços** — `index.html`, seções "Serviços", "Processo" e "Dúvidas". Ajuste ao que
   a Master Car realmente oferece.
3. **Endereço, horário e Instagram** — não foram inventados. Adicione no rodapé (`.footer__contact`).

## Adicionar fotos de carros (foco da página)

- Coloque o arquivo em `assets/img/` (já recortado, sem barra de status do celular).
- **Galeria "Nossos trabalhos":** copie um bloco `<figure class="work">…</figure>` em `#worksGrid`
  (antes do bloco `work--cta`), troque `src`, `alt` e o texto do `figcaption`. O visualizador de fotos
  (clique para ampliar, setas do teclado) passa a incluir a nova foto sozinho.
- **Topo da página:** carrossel em `.hero__stage-in` (`<figure class="hero__slide">`). Para incluir uma foto,
  adicione um `figure`, um `<button class="pip">` em `.pips` e o nome em `heroNames` no `js/main.js`.
- **Placas:** borre as placas de carros de clientes antes de publicar.

## Outras mídias

- Vídeo do estúdio: `assets/video/estudio.mp4` (+ `estudio-poster.jpg`). Sem áudio, em loop.
- Os serviços usam `data-img` em cada `<li class="svc__item">`; as etapas do processo usam `<figure class="pstep__img">`.

## Estrutura

```
index.html   conteúdo
css/style.css  estilos e componentes
js/main.js   menu, carrossel, galeria, animações, formulário → WhatsApp
vendor/      gsap, ScrollTrigger, SplitText
fonts/       Archivo (variável)
```
