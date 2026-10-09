#!/usr/bin/env node
/**
 * Verificador do Design System "Superhuman".
 * Varre CSS/HTML/JSX/TSX/Vue/Svelte e reprova o que viola as regras R1–R19
 * (ver SKILL.md). Sem dependências.
 *
 * Uso:  node check-design.mjs [pasta-ou-arquivo=.] [--strict] [--quiet]
 *   --strict  avisos (warn) também reprovam (exit 1)
 *   --quiet   só imprime o resumo
 * Escape (apenas com pedido explícito do usuário): comentário `ds-allow: motivo` na MESMA linha.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'

const args = process.argv.slice(2)
const target = resolve(args.find((a) => !a.startsWith('--')) ?? '.')
const strict = args.includes('--strict')
const quiet = args.includes('--quiet')

const EXT = new Set(['.css', '.scss', '.html', '.htm', '.tsx', '.jsx', '.ts', '.js', '.mjs', '.vue', '.svelte', '.astro', '.mdx'])
const SKIP = new Set(['node_modules', 'dist', 'build', '.git', '.next', '.nuxt', '.svelte-kit', 'coverage', '.turbo', '.vercel', '.output', 'design-system-superhuman'])

const PALETTE = new Set(['421d24', '714cb6', 'd4c7ff', '0c4243', 'f2f0eb', 'e3e3e2', '292827', '666666', 'ffffff'])
const ALLOWED_RADII = new Set([0, 8, 16, 999, 9999])
const RAW_TW_COLORS = 'red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone'
const COLOR_UTIL = 'bg|text|border|ring|ring-offset|fill|stroke|outline|divide|from|to|via|shadow|decoration|accent|caret|placeholder'

const rules = [] // { id, level, msg }
const findings = []
const add = (file, line, level, id, msg, snippet) => findings.push({ file, line, level, id, msg, snippet: snippet.trim().slice(0, 140) })

function* walk(p) {
  const st = statSync(p)
  if (st.isFile()) { if (EXT.has(extname(p)) && !/\.min\./.test(p)) yield p; return }
  for (const name of readdirSync(p)) {
    if (SKIP.has(name) || name.startsWith('.')) continue
    yield* walk(join(p, name))
  }
}

const norm = (hex) => {
  let h = hex.slice(1).toLowerCase()
  if (h.length <= 4) h = [...h].map((c) => c + c).join('')
  return h.slice(0, 6)
}
const toHex = (r, g, b) => [r, g, b].map((n) => Number(n).toString(16).padStart(2, '0')).join('')

const HEADING_TAG = /<h[1-3]\b[^>]*>?/i
const ok = (cond) => (cond ? [] : null)

function checkLine(file, i, line, isCss) {
  if (/ds-allow/.test(line)) return
  const L = i + 1
  const A = (level, id, msg) => add(file, L, level, id, msg, line)

  // ----- R2/R3: cores fora da paleta, preto puro -----
  for (const m of line.matchAll(/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g)) {
    const before = line.slice(Math.max(0, m.index - 12), m.index)
    if (/(?:href|to|id|for|name|data-[\w-]+|aria-[\w-]+)=["'`]?$/i.test(before) || /url\($/.test(before) || /&$|\w$/.test(before)) continue
    const h = norm(m[0])
    if (h === '000000') A('error', 'R3', `preto puro (${m[0]}) — use Ink Charcoal #292827`)
    else if (!PALETTE.has(h)) A('error', 'R2', `cor fora da paleta: ${m[0]} — use um token --color-*`)
  }
  for (const m of line.matchAll(/rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/gi)) {
    const h = toHex(...m.slice(1, 4))
    if (h === '000000') A('error', 'R3', 'rgb() preto puro — use Ink Charcoal #292827')
    else if (!PALETTE.has(h)) A('error', 'R2', `rgb(${m[1]}, ${m[2]}, ${m[3]}) fora da paleta`)
  }
  if (/\bhsla?\(/i.test(line)) A('error', 'R2', 'hsl() — use somente tokens de cor da paleta')
  if (new RegExp(`(?<![\\w-])(?:${COLOR_UTIL})-black\\b`).test(line)) A('error', 'R3', 'classe *-black — use ink-charcoal')
  if (new RegExp(`(?<![\\w-])(?:${COLOR_UTIL})-(?:${RAW_TW_COLORS})-\\d{2,3}\\b`).test(line)) A('error', 'R2', 'cor padrão do Tailwind (ex.: blue-500) — use apenas tokens do design system')
  if (/(?<![\w-])(?:color|background(?:-color)?|border-color|fill|stroke):\s*(?:black|red|blue|green|orange|yellow|purple|pink|gray|grey)\s*[;}"']/i.test(line)) A('error', 'R2', 'cor nomeada do CSS — use tokens')

  // ----- R5: violeta só em texto de link -----
  if (new RegExp(`(?<![\\w-])(?:bg|border|ring|fill|stroke|outline|from|to|via|divide|shadow)-royal-violet\\b`).test(line)) A('error', 'R5', 'Royal Violet como preenchimento/borda/ícone — reservado a texto de link')
  if (/(?:background(?:-color)?|border(?:-[a-z]+)*|fill|stroke|outline(?:-color)?)\s*:[^;]*(?:royal-violet|#714cb6)/i.test(line)) A('error', 'R5', 'Royal Violet como preenchimento/borda/ícone — reservado a texto de link')

  // ----- R7: Deep Lagoon só em faixas full-bleed -----
  if (/deep-lagoon/.test(line) && /rounded|card|\bshadow\b/.test(line)) A('warn', 'R7', 'Deep Lagoon só em faixas full-bleed — não em cards/componentes')

  // ----- R8: família tipográfica única -----
  if (/(?<![\w-])font-(?:serif|mono)\b/.test(line)) A('warn', 'R8', 'segunda família tipográfica — o sistema usa só Super Sans VF')
  if (isCss && /font-family\s*:/i.test(line) && !/var\(--font-|^\s*--/.test(line)) A('warn', 'R8', 'font-family fora do token --font-super-sans-vf')

  // ----- R9: peso/estilo de títulos -----
  if (HEADING_TAG.test(line) && !/t-label-bold|text-label-bold/.test(line)) {
    if (/(?<![\w-])font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black|w540)\b/.test(line) || /font-\[?[1-9]\d\d\]?/.test(line) && !/font-\[?460\]?/.test(line)) A('error', 'R9', 'título com peso ≠ 460 — headlines usam font-w460')
    if (/(?<![\w-])(?:uppercase|lowercase|capitalize|italic)\b/.test(line)) A('error', 'R9', 'título com text-transform/itálico — proibido')
    if (/style=["'][^"']*font-weight\s*:\s*(?!460)/i.test(line)) A('error', 'R9', 'título com font-weight inline ≠ 460')
  }
  if (/(?<![\w-])font-(?:extrabold|black)\b|font-weight\s*:\s*[89]00\b/.test(line)) A('warn', 'R9', 'peso ≥ 800 — o sistema vai no máximo a 700 (só rótulos pequenos)')

  // ----- R12: raios -----
  for (const m of line.matchAll(/(?<![\w-])rounded(?:-(?:t|b|l|r|tl|tr|bl|br|s|e|ss|se|es|ee))?(?:-([\w[\]./%-]+))?(?![\w-])/g)) {
    const s = m[1]
    if (s === undefined) A('error', 'R12', '`rounded` puro (4px) — use rounded-card/-button (16), rounded-lg (8) ou rounded-full')
    else if (['sm', 'md', 'xs', '4xl'].includes(s)) A('error', 'R12', `rounded-${s} fora da escala de raios (0 · 8 · 16 · 999)`)
    else if (['xl', '3xl'].includes(s)) A('warn', 'R12', `rounded-${s} existe como token mas nenhum componente o usa (8 · 16 · 999)`)
    else if (s.startsWith('[')) {
      const px = /\[(\d+(?:\.\d+)?)px\]/.exec(s)
      if (!px || !ALLOWED_RADII.has(Number(px[1]))) A('warn', 'R12', `raio arbitrário ${s} — use 0, 8, 16 ou 999`)
    }
  }
  for (const m of line.matchAll(/border(?:-(?:top|bottom)-(?:left|right))?-radius\s*:\s*([^;}"']+)/gi)) {
    for (const px of m[1].matchAll(/(\d+(?:\.\d+)?)px/g)) if (!ALLOWED_RADII.has(Number(px[1]))) A('warn', 'R12', `border-radius ${px[0]} fora da escala (0 · 8 · 16 · 999)`)
  }

  // ----- R13: sombras -----
  if (/(?<![\w-])(?:shadow-(?:xs|sm|md|lg|xl|2xl|inner|\[)|drop-shadow)/.test(line)) A('error', 'R13', 'sombra — o sistema não usa sombras (profundidade vem de camadas/fotografia)')
  if (/box-shadow\s*:\s*(?!\s*(?:none|inherit|initial|unset|var\(--shadow-subtle\)|rgb\(113,\s*76,\s*182\)\s*0px 0px 0px 1px inset))/i.test(line)) A('error', 'R13', 'box-shadow — só --shadow-subtle é permitida')
  if (/\bboxShadow\s*:\s*['"`](?!none|var\(--shadow-subtle\))/.test(line)) A('error', 'R13', 'boxShadow inline — só --shadow-subtle é permitida')
  if (/\bborderRadius\s*:\s*['"`]?(?!0\b|8\b|16\b|999|var\()\d/.test(line)) A('warn', 'R12', 'borderRadius inline fora da escala (0 · 8 · 16 · 999)')
  if (/(?:text-shadow|filter\s*:\s*drop-shadow)/i.test(line)) A('error', 'R13', 'sombra de texto/drop-shadow — proibido')

  // ----- R14: gradientes -----
  if (/linear-gradient\(|conic-gradient\(|(?<![\w-])bg-(?:gradient-to-|linear-|conic-)/.test(line)) A('error', 'R14', 'gradiente linear/cônico — proibido em superfícies de UI')
  if (/radial-gradient\(|(?<![\w-])bg-radial/.test(line)) A('warn', 'R14', 'radial-gradient só é permitido na faixa atmosférica (.band-gradient)')

  // ----- R1: página inteira em branco -----
  if (isCss && /^(?:\s*)(?:html|body|:root|#root|#app)\b[^{]*\{[^}]*background(?:-color)?\s*:\s*(?:#fff(?:fff)?|white|var\(--color-paper-white\))/i.test(line)) A('error', 'R1', 'fundo da página branco — o canvas é Warm Parchment #f2f0eb')
  if (/<(?:body|main)\b[^>]*\bbg-(?:white|paper-white)\b|min-h-screen[^"'`]*\bbg-(?:white|paper-white)\b|\bbg-(?:white|paper-white)\b[^"'`]*min-h-screen/.test(line)) A('warn', 'R1', 'página inteira em branco — use bg-warm-parchment no canvas')

  // ----- R17: alinhamento -----
  if (/<p\b[^>]*(?:text-center|text-align\s*:\s*center)/.test(line)) A('warn', 'R17', 'parágrafo centralizado — texto com mais de 2 linhas fica alinhado à esquerda')

  // ----- R19: tema claro -----
  if (/(?<![\w-])dark:[\w-]|prefers-color-scheme\s*:\s*dark/.test(line)) A('warn', 'R19', 'tema escuro — o sistema é light-only (a única superfície escura são as faixas)')
}

// blocos CSS (seletor { decl }) — títulos com peso errado
function checkCssBlocks(file, text) {
  for (const m of text.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
    const sel = m[1].trim()
    if (!/(?:^|[\s,>+~])h[1-3]\b|\.(?:t-)?(?:display|heading(?:-[a-z]+)?|headline|hero-title|section-title)\b/.test(sel) || /label-bold/.test(sel)) continue
    const w = /font-weight\s*:\s*([\w.]+)/i.exec(m[2])
    if (w && w[1] !== '460' && !/var\(--font-weight-w460\)/.test(m[2]) && !/ds-allow/.test(m[0])) {
      const line = text.slice(0, m.index + m[0].indexOf('font-weight')).split('\n').length
      add(file, line, 'error', 'R9', `título (${sel.split('\n').pop().trim()}) com font-weight ${w[1]} — headlines usam 460`, m[0].slice(0, 100))
    }
  }
}

let files = 0
for (const f of walk(target)) {
  files++
  const text = readFileSync(f, 'utf8')
  const isCss = /\.s?css$/.test(f)
  const rel = relative(process.cwd(), f)
  text.split('\n').forEach((line, i) => checkLine(rel, i, line, isCss))
  if (isCss) checkCssBlocks(rel, text)
}

const errors = findings.filter((x) => x.level === 'error')
const warns = findings.filter((x) => x.level === 'warn')
if (!quiet) {
  const byFile = Map.groupBy(findings, (x) => x.file)
  for (const [file, list] of byFile) {
    console.log(`\n${file}`)
    for (const x of list.sort((a, b) => a.line - b.line)) console.log(`  ${x.line}  ${x.level === 'error' ? 'ERRO ' : 'aviso'}  ${x.id}  ${x.msg}\n        ${x.snippet}`)
  }
}
console.log(`\nDesign System Superhuman — ${files} arquivo(s): ${errors.length} erro(s), ${warns.length} aviso(s)`)
if (errors.length || (strict && warns.length)) { console.log('✗ REPROVADO — corrija as violações (regras em SKILL.md).'); process.exit(1) }
console.log('✓ APROVADO')
