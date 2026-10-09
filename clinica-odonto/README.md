# Clínica Odontológica — página de vendas

Landing page de clínica odontológica feita com **React 19 + Vite + TypeScript + Tailwind CSS 4**
e um servidor **Node.js** sem dependências para produção. Layout baseado no modelo de referência
(hero, diferenciais, serviços, números, consulta gratuita, depoimentos, dicas, galeria e CTA final).

## Como rodar

Requisito: Node.js 20+.

```bash
cd clinica-odonto
npm install
npm run dev       # desenvolvimento → http://localhost:5173
npm run build     # gera dist/
npm start         # serve dist/ (porta 3000, ou PORT=xxxx)
npm run lint && npm run typecheck
```

## Logo e imagens

Coloque os arquivos em `src/assets/images/` com **exatamente** estes nomes
(`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` ou `.svg`). Não precisa mexer em código:
enquanto um arquivo não existir, a página mostra um espaço reservado.

| Arquivo | Onde aparece | Proporção sugerida |
|---|---|---|
| `logo` | Cabeçalho e rodapé | fundo transparente (PNG/SVG) |
| `hero` | Topo da página (paciente sorrindo) | ~4:4,3 |
| `doutor` | Bloco "consulta gratuita" (dentista, fundo transparente fica melhor) | 4:5 |
| `servico-clinica-geral`, `servico-estetica`, `servico-implantes`, `servico-ortodontia` | Cards de serviços | 4:3 |
| `dica-1`, `dica-2`, `dica-3` | Artigos | 16:10 |
| `galeria-1` … `galeria-5` | Galeria de sorrisos | 4:5 |

## Conteúdo

Tudo fica em [`src/config/site.ts`](src/config/site.ts): nome, WhatsApp, endereço, horários,
serviços, números, depoimentos e artigos. Cores em `src/index.css` (bloco `@theme`).

### ⚠️ Antes de publicar

- [ ] Trocar nome, WhatsApp, e-mail, endereço e responsável técnico (CRO) — hoje são **provisórios**.
- [ ] Confirmar os números (10+ anos, 1.000+ pacientes, 20+ especialistas, 98%).
- [ ] Trocar os depoimentos de exemplo por avaliações **reais**, autorizadas pelos pacientes.
- [ ] Publicidade odontológica segue as regras do CFO (evitar promessas de resultado e "antes e depois" sem as exigências éticas).
