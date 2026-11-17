/* GOBÊ — comercial vertical 9:16 renderizado quadro a quadro em Canvas 2D.
   Tudo é função do tempo: render(t) desenha o quadro no instante t (segundos). */
'use strict';
const W = 1080, H = 1920, FPS = 30;
const COL = {
  brown: '#4A2418', dark: '#2B120A', deep: '#1d0b06', mid: '#6B3A25', light: '#8a4d33',
  pink: '#F4A6BC', pinkD: '#d98aa3', red: '#B3122E', redD: '#8c0d24',
  cream: '#F7E6CF', creamD: '#dcc3a0'
};
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

/* ---------- utilidades ---------- */
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eO3 = t => 1 - Math.pow(1 - t, 3);
const eO5 = t => 1 - Math.pow(1 - t, 5);
const eI3 = t => t * t * t;
const eBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const eElastic = t => t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -9 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
const eBounce = t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; };
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function star4(g, x, y, r, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.beginPath();
  for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.moveTo(0, -r); g.quadraticCurveTo(0, 0, r * .0 + r, 0); }
  g.restore();
}
function sparkle(g, x, y, r, rot, color, alpha) {
  if (alpha <= 0 || r <= 0) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = alpha; g.fillStyle = color; g.beginPath();
  g.moveTo(0, -r); g.quadraticCurveTo(r * .12, -r * .12, r, 0); g.quadraticCurveTo(r * .12, r * .12, 0, r);
  g.quadraticCurveTo(-r * .12, r * .12, -r, 0); g.quadraticCurveTo(-r * .12, -r * .12, 0, -r); g.fill(); g.restore();
}
function radial(g, x, y, r0, r1, stops) { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(s => gr.addColorStop(s[0], s[1])); return gr; }
function linear(g, x0, y0, x1, y1, stops) { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(s => gr.addColorStop(s[0], s[1])); return gr; }

/* ---------- texturas (pré-renderizadas uma vez) ---------- */
const TEX = {};
let LOGO = null;

function mkBrownieTop() {
  const [c, g] = mk(620, 300); const r = mulberry32(11);
  g.fillStyle = linear(g, 0, 0, 0, 300, [[0, '#4d2616'], [.5, '#3c1b0d'], [1, '#2e1309']]); g.fillRect(0, 0, 620, 300);
  for (let i = 0; i < 70; i++) { const x = r() * 620, y = r() * 300, rad = 18 + r() * 50; g.fillStyle = radial(g, x, y, 0, rad, [[0, 'rgba(140,78,48,.22)'], [1, 'rgba(140,78,48,0)']]); g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  // papel de brownie: crosta brilhante craquelada
  for (let i = 0; i < 22; i++) {
    let x = r() * 620, y = r() * 300, a = r() * 6.28; const pts = [[x, y]];
    const n = 5 + (r() * 7 | 0);
    for (let k = 0; k < n; k++) { a += (r() - .5) * 1.4; x += Math.cos(a) * (14 + r() * 26); y += Math.sin(a) * (14 + r() * 26); pts.push([x, y]); }
    g.lineJoin = 'round'; g.lineCap = 'round';
    g.strokeStyle = 'rgba(14,4,1,.75)'; g.lineWidth = 2.6; g.beginPath(); pts.forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
    g.strokeStyle = 'rgba(170,105,70,.35)'; g.lineWidth = 1; g.beginPath(); pts.forEach((p, k) => k ? g.lineTo(p[0] + 1.5, p[1] + 1.5) : g.moveTo(p[0] + 1.5, p[1] + 1.5)); g.stroke();
  }
  for (let i = 0; i < 26; i++) { const x = r() * 620, y = r() * 300; g.save(); g.translate(x, y); g.rotate(r() * 3); g.fillStyle = `rgba(255,225,200,${.05 + r() * .12})`; g.beginPath(); g.ellipse(0, 0, 6 + r() * 22, 2 + r() * 5, 0, 0, 6.3); g.fill(); g.restore(); }
  g.fillStyle = linear(g, 0, 0, 620, 300, [[0, 'rgba(255,220,190,0)'], [.3, 'rgba(255,220,190,.26)'], [.5, 'rgba(255,220,190,0)'], [.75, 'rgba(255,220,190,.12)'], [1, 'rgba(0,0,0,.1)']]); g.fillRect(0, 0, 620, 300);
  return c;
}
function mkFudgeFace(w, h, seed, crust) {
  const [c, g] = mk(w, h); const r = mulberry32(seed);
  g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#5a2c19'], [.5, '#6a3520'], [1, '#4e2613']]); g.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { const x = r() * w, y = r() * h, rad = 20 + r() * 40; g.fillStyle = radial(g, x, y, 0, rad, [[0, 'rgba(120,64,38,.22)'], [1, 'rgba(120,64,38,0)']]); g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  for (let i = 0; i < w * h / 380; i++) { // poros do miolo
    const x = r() * w, y = r() * h, rx = 1.5 + r() * 5, ry = .8 + r() * 2.6;
    g.fillStyle = 'rgba(22,7,2,.72)'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 6.3); g.fill();
    g.fillStyle = 'rgba(190,118,78,.6)'; g.beginPath(); g.ellipse(x, y + ry * .9, rx, ry * .5, 0, 0, 3.2); g.fill();
  }
  for (let i = 0; i < w * h / 160; i++) { g.fillStyle = r() < .55 ? 'rgba(170,100,64,.6)' : 'rgba(25,8,3,.4)'; g.fillRect(r() * w, r() * h, 1 + r() * 2.4, 1 + r() * 2.4); }
  for (let i = 0; i < Math.max(3, w / 110 | 0); i++) { // gotas de chocolate dentro do brownie
    const x = r() * w, y = h * .2 + r() * h * .6, s = 14 + r() * 20;
    g.save(); g.translate(x, y); g.rotate(r() * 3);
    g.fillStyle = '#25100a'; g.beginPath(); g.moveTo(-s, -s * .5); g.lineTo(s * .2, -s * .8); g.lineTo(s, -s * .1); g.lineTo(s * .7, s * .6); g.lineTo(-s * .6, s * .7); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,205,170,.3)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-s * .8, -s * .35); g.lineTo(s * .1, -s * .65); g.stroke(); g.restore();
  }
  g.fillStyle = linear(g, 0, 0, 0, h, [[0, 'rgba(255,225,200,0)'], [.22, 'rgba(255,225,200,.22)'], [.4, 'rgba(255,225,200,0)']]); g.fillRect(0, 0, w, h);
  if (crust) { // crosta superior e inferior
    g.fillStyle = linear(g, 0, 0, 0, 16, [[0, '#1f0a04'], [1, 'rgba(31,10,4,0)']]); g.fillRect(0, 0, w, 16);
    g.fillStyle = linear(g, 0, h - 22, 0, h, [[0, 'rgba(31,10,4,0)'], [1, '#1b0803']]); g.fillRect(0, h - 22, w, 22);
  }
  return c;
}

const COOKIE = { cx: 360, cy: 236, R: 300, tilt: .62, thick: 56, w: 720, h: 520 };
function mkCookie() {
  const { cx, cy, R, tilt, thick, w, h } = COOKIE; const r = mulberry32(77);
  // contorno irregular
  const pts = []; const N = 96; const ph = [r() * 6, r() * 6, r() * 6];
  for (let i = 0; i < N; i++) { const a = i / N * 6.2832; const rad = R * (1 + .035 * Math.sin(a * 3 + ph[0]) + .025 * Math.sin(a * 7 + ph[1]) + .015 * Math.sin(a * 13 + ph[2])); pts.push([Math.cos(a) * rad, Math.sin(a) * rad]); }
  const path = (g, ox, oy, sy) => { g.beginPath(); pts.forEach((p, i) => { const X = ox + p[0], Y = oy + p[1] * sy; if (i) g.lineTo(X, Y); else g.moveTo(X, Y); }); g.closePath(); };
  // textura do topo (círculo cheio, sem inclinação)
  const D = 700; const [tc, tg] = mk(D, D); const o = D / 2;
  tg.save(); path(tg, o, o, 1); tg.clip();
  tg.fillStyle = radial(tg, o - 40, o - 60, 20, R * 1.05, [[0, '#e2ad68'], [.55, '#cf8f48'], [.85, '#b9733a'], [1, '#8f5224']]); tg.fillRect(0, 0, D, D);
  for (let i = 0; i < 1400; i++) { const a = r() * 6.28, rr_ = Math.sqrt(r()) * R; const x = o + Math.cos(a) * rr_, y = o + Math.sin(a) * rr_; tg.fillStyle = r() < .5 ? `rgba(255,222,160,${.08 + r() * .14})` : `rgba(110,56,20,${.08 + r() * .16})`; tg.beginPath(); tg.arc(x, y, 2 + r() * 7, 0, 6.3); tg.fill(); }
  for (let i = 0; i < 9; i++) { let x = o + (r() - .5) * R * 1.4, y = o + (r() - .5) * R * 1.4, a = r() * 6.28; tg.strokeStyle = 'rgba(100,50,18,.35)'; tg.lineWidth = 2.4; tg.lineCap = 'round'; tg.beginPath(); tg.moveTo(x, y); for (let k = 0; k < 5; k++) { a += (r() - .5) * 1.2; x += Math.cos(a) * 18; y += Math.sin(a) * 18; tg.lineTo(x, y); } tg.stroke(); }
  // poças de chocolate derretido
  const placed = [];
  const place = (minD, rad) => { for (let tries = 0; tries < 80; tries++) { const a = r() * 6.28, d = Math.sqrt(r()) * (R - rad - 24); const x = o + Math.cos(a) * d, y = o + Math.sin(a) * d; if (placed.every(p => Math.hypot(p.x - x, p.y - y) > p.r + rad + 6)) { placed.push({ x, y, r: rad }); return [x, y]; } } return null; };
  const chip = (x, y, s, melted) => {
    tg.save(); tg.translate(x, y); tg.rotate(r() * 6.28); tg.shadowColor = 'rgba(40,16,4,.55)'; tg.shadowBlur = 10; tg.shadowOffsetY = 5;
    tg.fillStyle = linear(tg, -s, -s, s, s, [[0, '#4a2314'], [1, '#26100a']]); tg.beginPath();
    if (melted) { for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28, rd = s * (.82 + r() * .35); i ? tg.lineTo(Math.cos(a) * rd, Math.sin(a) * rd) : tg.moveTo(Math.cos(a) * rd, Math.sin(a) * rd); } }
    else { tg.moveTo(-s, -s * .45); tg.lineTo(-s * .1, -s * .9); tg.lineTo(s * .9, -s * .5); tg.lineTo(s, s * .35); tg.lineTo(s * .1, s * .85); tg.lineTo(-s * .85, s * .6); }
    tg.closePath(); tg.fill(); tg.shadowColor = 'transparent';
    tg.strokeStyle = 'rgba(255,215,180,.42)'; tg.lineWidth = melted ? 3 : 2.4; tg.lineCap = 'round'; tg.beginPath(); tg.moveTo(-s * .7, -s * .3); tg.lineTo(-s * .05, -s * .7); tg.stroke();
    if (melted) { tg.fillStyle = 'rgba(255,225,200,.35)'; tg.beginPath(); tg.ellipse(-s * .25, -s * .15, s * .22, s * .1, -.5, 0, 6.3); tg.fill(); }
    tg.restore();
  };
  for (let i = 0; i < 5; i++) { const p = place(0, 46); if (p) chip(p[0], p[1], 46, true); }
  for (let i = 0; i < 15; i++) { const s = 24 + r() * 14; const p = place(0, s + 4); if (p) chip(p[0], p[1], s, false); }
  tg.restore();
  // sprite inclinado: lateral extrudada + topo achatado
  const [c, g] = mk(w, h);
  // sombra de contato
  g.fillStyle = radial(g, cx, cy + thick + 30, 10, R * 1.05, [[0, 'rgba(0,0,0,.45)'], [1, 'rgba(0,0,0,0)']]); g.save(); g.translate(cx, cy + thick + 30); g.scale(1, .45); g.translate(-cx, -(cy + thick + 30)); g.fillRect(0, 0, w, h * 2); g.restore();
  for (let k = thick; k >= 0; k -= 2) { path(g, cx, cy + k, tilt); g.fillStyle = k > thick - 6 ? '#7a4520' : linear(g, 0, cy, 0, cy + thick + R * tilt, [[0, '#b97a3c'], [1, '#8d5326']]); g.fill(); }
  g.save(); path(g, cx, cy, tilt); g.clip(); g.translate(cx, cy); g.scale(1, tilt); g.drawImage(tc, -o, -o); g.restore();
  // brilho do topo
  g.save(); path(g, cx, cy, tilt); g.clip(); g.fillStyle = radial(g, cx - 90, cy - 70, 10, R, [[0, 'rgba(255,235,190,.22)'], [1, 'rgba(255,235,190,0)']]); g.fillRect(0, 0, w, h); g.restore();
  path(g, cx, cy, tilt); g.strokeStyle = 'rgba(255,225,170,.25)'; g.lineWidth = 2; g.stroke();
  return c;
}

function mkBall(kind) {
  const S = 190, c0 = S / 2, rad = 78; const [c, g] = mk(S, S); const r = mulberry32(kind.seed);
  const clip = () => { g.beginPath(); g.arc(c0, c0, rad, 0, 6.2832); g.clip(); };
  g.save(); clip();
  g.fillStyle = radial(g, c0 - 24, c0 - 28, 6, rad * 1.1, kind.grad); g.fillRect(0, 0, S, S);
  if (kind.dust) { for (let i = 0; i < 900; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * rad; g.fillStyle = r() < .5 ? 'rgba(48,20,10,.35)' : 'rgba(150,100,72,.35)'; g.beginPath(); g.arc(c0 + Math.cos(a) * d, c0 + Math.sin(a) * d, .8 + r() * 1.8, 0, 6.3); g.fill(); } }
  if (kind.sprinkles) {
    for (let i = 0; i < kind.n; i++) {
      let x, y; do { x = (r() - .5) * 2 * rad; y = (r() - .5) * 2 * rad; } while (x * x + y * y > rad * rad * .92);
      g.save(); g.translate(c0 + x, c0 + y); g.rotate(r() * 6.28);
      const col = kind.sprinkles[(r() * kind.sprinkles.length) | 0]; const L = 9 + r() * 7, Wd = 3.6 + r() * 1.2;
      g.fillStyle = col; rr(g, -L / 2, -Wd / 2, L, Wd, Wd / 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,.28)'; rr(g, -L / 2 + 1.5, -Wd / 2 + .6, L * .6, Wd * .35, 1); g.fill(); g.restore();
    }
  }
  // sombreado esférico e brilho
  g.fillStyle = radial(g, c0 + 18, c0 + 26, rad * .3, rad * 1.05, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.42)']]); g.fillRect(0, 0, S, S);
  g.restore();
  if (!kind.dust) { g.fillStyle = radial(g, c0 - 30, c0 - 36, 0, 26, [[0, 'rgba(255,255,255,.55)'], [1, 'rgba(255,255,255,0)']]); g.beginPath(); g.ellipse(c0 - 30, c0 - 36, 26, 17, -.6, 0, 6.3); g.fill(); }
  else { g.fillStyle = radial(g, c0 - 28, c0 - 34, 0, 34, [[0, 'rgba(255,230,200,.25)'], [1, 'rgba(255,230,200,0)']]); g.fillRect(0, 0, S, S); }
  return c;
}
function mkCup(main, dark) {
  const S = 270, c0 = S / 2; const [c, g] = mk(S, S); const N = 16;
  g.fillStyle = radial(g, c0, c0, 0, 120, [[0, 'rgba(0,0,0,.35)'], [1, 'rgba(0,0,0,0)']]); g.beginPath(); g.arc(c0, c0 + 6, 118, 0, 6.3); g.fill();
  for (let i = 0; i < N; i++) {
    const a = i / N * 6.2832; g.save(); g.translate(c0, c0); g.rotate(a);
    g.fillStyle = i % 2 ? dark : main; g.beginPath(); g.moveTo(-14, -60); g.quadraticCurveTo(-30, -112, -2, -118); g.quadraticCurveTo(30, -112, 14, -60); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(-4, -96, 4, 14, 0, 0, 6.3); g.fill();
    g.restore();
  }
  g.fillStyle = radial(g, c0, c0, 20, 84, [[0, dark], [1, main]]); g.beginPath(); g.arc(c0, c0, 84, 0, 6.3); g.fill();
  return c;
}
function mkBokeh(color) {
  const S = 160; const [c, g] = mk(S, S);
  g.fillStyle = radial(g, 80, 80, 0, 78, [[0, color + '66'], [.7, color + '44'], [.9, color + '66'], [1, color + '00']]); g.beginPath(); g.arc(80, 80, 78, 0, 6.3); g.fill();
  return c;
}
function mkGrain() {
  const [c, g] = mk(256, 256); const im = g.createImageData(256, 256); const r = mulberry32(5);
  for (let i = 0; i < 256 * 256; i++) { const v = 128 + (r() - .5) * 150; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
  g.putImageData(im, 0, 0); return c;
}

function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }

async function init() {
  await Promise.all([
    document.fonts.load('150px Caprasimo'), document.fonts.load('300 40px Outfit'),
    document.fonts.load('500 40px Outfit'), document.fonts.load('700 40px Outfit')
  ]);
  LOGO = await loadImg('../assets/logo_gb.png');
  TEX.bTop = mkBrownieTop();
  TEX.bFront = mkFudgeFace(620, 230, 21, true);
  TEX.bSide = mkFudgeFace(320, 230, 33, true);
  TEX.bSide2 = mkFudgeFace(320, 230, 47, true);
  TEX.cookie = mkCookie();
  TEX.balls = [
    mkBall({ seed: 1, grad: [[0, '#7a3f25'], [.5, '#4a2112'], [1, '#2b1008']], sprinkles: ['#2a0e06', '#3a170b', '#1e0903'], n: 170 }),
    mkBall({ seed: 2, grad: [[0, '#fff3e2'], [.6, '#f2dfc2'], [1, '#cdb08a']], sprinkles: [COL.pink, COL.pink, COL.red, '#ffd0dc'], n: 90 }),
    mkBall({ seed: 3, grad: [[0, '#9b5a3b'], [.6, '#7a4630'], [1, '#4a2619']], dust: true })
  ];
  TEX.cups = [mkCup(COL.pink, COL.pinkD), mkCup(COL.red, COL.redD), mkCup(COL.cream, COL.creamD)];
  TEX.bokeh = { pink: mkBokeh('#F4A6BC'), cream: mkBokeh('#F7E6CF'), red: mkBokeh('#d4304c'), warm: mkBokeh('#ffb36b') };
  TEX.grain = mkGrain();
  // logo auxiliar para máscara de revelação
  [TEX.logoC, TEX.logoG] = mk(LOGO.width, LOGO.height);
}

/* ---------- elementos globais: fundo, bokeh, pó ---------- */
const BOK = (() => { const r = mulberry32(9); const a = []; for (let i = 0; i < 16; i++) a.push({ x: r() * W, y: r() * H, s: 40 + r() * 120, k: ['pink', 'cream', 'red', 'warm', 'warm'][(r() * 5) | 0], sp: .15 + r() * .35, ph: r() * 6.3, al: .10 + r() * .22 }); return a; })();
const DUST = (() => { const r = mulberry32(19); const a = []; for (let i = 0; i < 46; i++) a.push({ x: r() * W, y: r() * H, s: 1.5 + r() * 3.5, sp: 10 + r() * 28, ph: r() * 6.3, al: .15 + r() * .35 }); return a; })();

function backdrop(lt, o = {}) {
  const gx = o.gx ?? 540, gy = o.gy ?? 1050, gr = o.gr ?? 950;
  ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#341710'], [.5, '#4A2418'], [1, '#2b120a']]); ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = radial(ctx, gx, gy, 0, gr, [[0, 'rgba(255,160,90,.34)'], [.5, 'rgba(255,140,80,.10)'], [1, 'rgba(255,140,80,0)']]); ctx.fillRect(0, 0, W, H);
  bokeh(lt);
}
function bokeh(lt) {
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (const b of BOK) { const x = b.x + Math.sin(lt * b.sp + b.ph) * 40, y = (b.y - lt * 16 * b.sp * 2 + H * 3) % H; ctx.globalAlpha = b.al * .7 * (.75 + .25 * Math.sin(lt * .9 + b.ph)); ctx.drawImage(TEX.bokeh[b.k], x - b.s, y - b.s, b.s * 2, b.s * 2); }
  ctx.restore();
}
function dust(lt) {
  ctx.save(); ctx.fillStyle = COL.cream;
  for (const d of DUST) { const x = (d.x + Math.sin(lt * .6 + d.ph) * 30) % W, y = ((d.y - lt * d.sp) % H + H) % H; ctx.globalAlpha = d.al * (.6 + .4 * Math.sin(lt * 2 + d.ph)); ctx.beginPath(); ctx.arc(x, y, d.s, 0, 6.3); ctx.fill(); }
  ctx.restore();
}
function counter(y0, lt) {
  ctx.fillStyle = linear(ctx, 0, y0, 0, H, [[0, '#6a3724'], [.18, '#52281a'], [1, '#26100a']]); ctx.fillRect(0, y0, W, H - y0);
  ctx.fillStyle = linear(ctx, 0, y0 - 2, 0, y0 + 40, [[0, 'rgba(255,200,150,.35)'], [1, 'rgba(255,200,150,0)']]); ctx.fillRect(0, y0 - 2, W, 42);
  ctx.save(); ctx.globalAlpha = .12; ctx.fillStyle = radial(ctx, 540 + Math.sin(lt * .4) * 60, y0 + 160, 0, 520, [[0, 'rgba(255,170,100,1)'], [1, 'rgba(255,170,100,0)']]); ctx.fillRect(0, y0, W, 500); ctx.restore();
}
function contactShadow(x, y, rx, ry, a = .55) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.fillStyle = radial(ctx, 0, 0, 0, rx, [[0, `rgba(10,3,1,${a})`], [.6, `rgba(10,3,1,${a * .5})`], [1, 'rgba(10,3,1,0)']]); ctx.beginPath(); ctx.arc(0, 0, rx, 0, 6.3); ctx.fill(); ctx.restore();
}

/* ---------- tipografia animada ---------- */
function fitFont(txt, family, maxW, size) { ctx.font = family.replace('%', size + 'px'); const w = ctx.measureText(txt).width; return w > maxW ? size * maxW / w : size; }
function textReveal(txt, cx, y, fontTpl, size, color, p, { track = 0, stagger = .07, rise = .9, align = 'center' } = {}) {
  if (p <= 0) return;
  ctx.save(); ctx.font = fontTpl.replace('%', size + 'px'); ctx.letterSpacing = '0px'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = color;
  const chars = [...txt]; const ws = chars.map(ch => ctx.measureText(ch).width + track); const total = ws.reduce((a, b) => a + b, 0) - track;
  let x = align === 'center' ? cx - total / 2 : align === 'left' ? cx : cx - total;
  const n = chars.length; ctx.beginPath(); ctx.rect(x - 40, y - size * 1.05, total + 80, size * 1.5); ctx.clip();
  chars.forEach((ch, i) => { const q = eO5(clamp((p * (1 + stagger * n) - i * stagger))); ctx.globalAlpha = clamp(q * 1.6); ctx.fillText(ch, x, y + (1 - q) * size * rise); x += ws[i]; });
  ctx.restore();
}
function swash(x0, x1, y, p, color = COL.red, lw = 10) {
  if (p <= 0) return; const L = Math.abs(x1 - x0) * 1.15;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.setLineDash([L, L]); ctx.lineDashOffset = L * (1 - eO3(p));
  ctx.beginPath(); ctx.moveTo(x0, y + 4); ctx.bezierCurveTo(x0 + (x1 - x0) * .3, y - 7, x0 + (x1 - x0) * .65, y + 12, x1, y - 2); ctx.stroke(); ctx.restore();
}
function header(lt, title, sub, t0) {
  const p = seg(lt, t0, t0 + 1.0);
  // logo pequena no topo
  const lp = eO3(seg(lt, t0 - .2, t0 + .5)); if (lp > 0) { const h = 74, w = LOGO.width / LOGO.height * h; ctx.save(); ctx.globalAlpha = lp; ctx.drawImage(LOGO, 540 - w / 2, 262 - (1 - lp) * 20, w, h); ctx.restore(); }
  const size = fitFont(title, "% 'Caprasimo'", 860, 168);
  textReveal(title, 540, 488, "% 'Caprasimo'", size, COL.cream, p, { track: 2, stagger: .06 });
  swash(540 - 250, 540 + 250, 518, seg(lt, t0 + .55, t0 + 1.2));
  const sp = eO3(seg(lt, t0 + .7, t0 + 1.4));
  if (sp > 0) { ctx.save(); ctx.globalAlpha = sp * .92; ctx.font = "300 44px 'Outfit'"; ctx.letterSpacing = '2px'; ctx.fillStyle = COL.cream; ctx.textAlign = 'center'; ctx.fillText(sub, 540, 590 + (1 - sp) * 18); ctx.restore(); }
}

/* ---------- partículas (migalhas) ---------- */
function crumbs(lt, t0, x, y, n, seed, cols, spread = 420, up = 520, g = 1800, life = 1.4) {
  const t = lt - t0; if (t < 0 || t > life) return; const r = mulberry32(seed);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (r() - .5) * 2.2, v = (.35 + r() * .65) * up, vx = Math.cos(a) * v * (spread / up), vy = Math.sin(a) * v, s = 3 + r() * 6, rot = r() * 6, col = cols[(r() * cols.length) | 0];
    const px = x + vx * t, py = y + vy * t + .5 * g * t * t; ctx.globalAlpha = clamp((life - t) / .4); ctx.fillStyle = col; ctx.save(); ctx.translate(px, py); ctx.rotate(rot + t * 6 * (r() - .5)); ctx.beginPath(); ctx.moveTo(-s, -s * .5); ctx.lineTo(s * .3, -s); ctx.lineTo(s, s * .4); ctx.lineTo(-s * .4, s); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  ctx.restore();
}

/* ---------- glacê escorrendo (transição e revelações) ---------- */
const DRIPS = (() => { const r = mulberry32(3); const a = []; let x = 10; while (x < W + 60) { const w = 34 + r() * 34; a.push({ x: x + w, w, L: 150 + r() * 330 }); x += w * 2 + r() * 40 - 10; } return a; })();
function dripY(x, k, drips = DRIPS, scale = 1) {
  let m = 0;
  for (const d of drips) {
    const u = (x - d.x) / d.w, au = Math.abs(u), L = d.L * (1 - k * .09) * scale, w = d.w * scale * (1);
    let v = 0;
    if (au <= 1) v = (L - w) + w * Math.sqrt(1 - u * u); else if (au < 1.9) v = (L - w) * .5 * (1 + Math.cos(Math.PI * (au - 1) / .9));
    if (v > m) m = v;
  }
  return m;
}
function glazePath(g, x0, x1, base, k, drips, scale) {
  g.beginPath(); g.moveTo(x0, -2000);
  for (let x = x0; x <= x1; x += 4) g.lineTo(x, base + dripY(x, k, drips, scale) + 14 * Math.sin(x * .011 + k));
  g.lineTo(x1, -2000); g.closePath();
}
const TR_LAGS = [0, .07, .19, .26], TR_DUR = 1.0, MAXL = 500;
function transitionBase(p, k) { const q = eIO(clamp((p - TR_LAGS[k]) / (1 - .26))); return lerp(-MAXL - 80, H + 80, q); }

/* ---------- logo ---------- */
function logoReveal(cx, cy, scale, p, o = {}) {
  // revela a logo "escorrendo" de cima para baixo como glacê
  const lw = LOGO.width, lh = LOGO.height; const g = TEX.logoG; g.clearRect(0, 0, lw, lh);
  g.globalCompositeOperation = 'source-over'; g.drawImage(LOGO, 0, 0);
  if (p < 1) { g.globalCompositeOperation = 'destination-in'; glazePath(g, -20, lw + 20, lerp(-340, lh + 40, eIO(p)), 0, LDRIPS, 1); g.fillStyle = '#000'; g.fill(); g.globalCompositeOperation = 'source-over'; }
  ctx.save(); ctx.translate(cx, cy); ctx.scale(scale, scale);
  if (o.glow) { ctx.globalAlpha = o.glow; ctx.fillStyle = radial(ctx, 0, 0, 0, 520, [[0, 'rgba(244,166,188,.45)'], [1, 'rgba(244,166,188,0)']]); ctx.fillRect(-600, -500, 1200, 1000); ctx.globalAlpha = 1; }
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
  ctx.drawImage(TEX.logoC, -lw / 2, -lh / 2); ctx.restore();
}
const LDRIPS = (() => { const r = mulberry32(8); const a = []; let x = 0; while (x < 760) { const w = 26 + r() * 20; a.push({ x: x + w, w, L: 80 + r() * 190 }); x += w * 2 + 6 + r() * 20; } return a; })();

/* ---------- caixa de brownie (projeção oblíqua) ---------- */
const OB = { fx: .55, fy: -.40 };
function brownieBox(g, x, y, w, h, d, u0, u1, sideTex) {
  const ox = d * OB.fx, oy = d * OB.fy;
  const TW = TEX.bTop.width, FW = TEX.bFront.width;
  // face lateral direita
  g.save(); g.transform(ox / d, oy / d, 0, 1, x + w, y - h); g.drawImage(sideTex, 0, 0, sideTex.width, sideTex.height, 0, 0, d, h); g.fillStyle = 'rgba(8,2,0,.16)'; g.fillRect(0, 0, d, h); g.restore();
  // frente
  g.drawImage(TEX.bFront, u0 * FW, 0, (u1 - u0) * FW, TEX.bFront.height, x, y - h, w, h); g.fillStyle = 'rgba(8,2,0,.10)'; g.fillRect(x, y - h, w, h);
  // topo
  g.save(); g.transform(1, 0, ox / d, oy / d, x, y - h); g.drawImage(TEX.bTop, u0 * TW, 0, (u1 - u0) * TW, TEX.bTop.height, 0, 0, w, d); g.restore();
  // arestas com luz
  g.save(); g.strokeStyle = 'rgba(255,215,180,.16)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + w, y - h); g.lineTo(x + w + ox, y - h + oy); g.stroke(); g.restore();
}
function steelBlade(g, x, yTopLine, ox, oy, vb, vh, a = 1) {
  // lâmina de espátula/raspador: paralelogramo ao longo da profundidade
  const v0 = Math.max(vb, 0), v1 = vb + vh; if (v1 <= v0 + 4) return;
  const P = [[x, yTopLine - v0], [x + ox, yTopLine + oy - v0], [x + ox, yTopLine + oy - v1], [x, yTopLine - v1]];
  g.save(); g.globalAlpha = a; g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath();
  g.fillStyle = linear(g, x, 0, x + ox, 0, [[0, '#9aa1a8'], [.35, '#eef1f3'], [.6, '#b9bfc5'], [1, '#7c838a']]); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 24; g.shadowOffsetX = 18; g.fill(); g.shadowColor = 'transparent';
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2; g.stroke();
  // cabo
  const hh = 46; const Hn = [[x - 12, yTopLine - v1], [x + ox + 12, yTopLine + oy - v1], [x + ox + 12, yTopLine + oy - v1 - hh], [x - 12, yTopLine - v1 - hh]];
  g.beginPath(); Hn.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath();
  g.fillStyle = linear(g, 0, yTopLine - v1 - hh, 0, yTopLine - v1, [[0, '#6b3a25'], [.5, '#4a2418'], [1, '#2b120a']]); g.fill(); g.strokeStyle = 'rgba(255,200,160,.25)'; g.stroke();
  g.restore();
}
function sauceDrip(g, x, y0, len, w) {
  if (len <= 0) return; const r = w / 2; const y1 = y0 + len;
  g.beginPath(); g.moveTo(x - r, y0 - 2); g.lineTo(x - r * .85, y1 - r * .6); g.arc(x, y1 - r * .2, r * 1.05, Math.PI, 0, true); g.lineTo(x + r, y0 - 2); g.closePath();
  g.fill();
}

/* ---------- CENA 1: apresentação ---------- */
function scene1(lt) {
  backdrop(lt, { gx: 540, gy: 900, gr: 1000 });
  ctx.save(); const z = 1 + lt * .018; ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900);
  // gota de glacê caindo
  const dp = seg(lt, .15, .75);
  if (dp > 0 && dp < 1) { const y = lerp(-60, 640, eI3(dp)); const sq = 1 + dp * .6; ctx.save(); ctx.fillStyle = COL.red; ctx.shadowColor = 'rgba(179,18,46,.6)'; ctx.shadowBlur = 24; ctx.beginPath(); ctx.ellipse(540, y, 16, 16 * sq + 10, 0, 0, 6.3); ctx.fill(); ctx.restore(); }
  const rp = seg(lt, .72, 2.0);
  // brilho atrás da logo
  const glow = eO3(seg(lt, 1.4, 2.6)) * .8;
  const sc = lerp(.98, 1.1, eO3(seg(lt, .7, 3.2)));
  if (rp > 0) logoReveal(540, 700, sc, rp, { glow });
  // wordmark
  const tp = seg(lt, 2.0, 3.0);
  const size = fitFont('GOBÊ', "% 'Caprasimo'", 800, 190);
  textReveal('GOBÊ', 540, 1160, "% 'Caprasimo'", size, COL.cream, tp, { track: 16, stagger: .1 });
  const sp = eO3(seg(lt, 2.5, 3.3));
  if (sp > 0) { ctx.save(); ctx.globalAlpha = sp * .95; ctx.font = "500 34px 'Outfit'"; ctx.letterSpacing = '12px'; ctx.fillStyle = COL.pink; ctx.textAlign = 'center'; ctx.fillText('CONFEITARIA ARTESANAL', 540 + 6, 1240 + (1 - sp) * 14); ctx.restore(); }
  // brilhos
  for (let i = 0; i < 7; i++) { const r = mulberry32(100 + i); const x = 230 + r() * 620, y = 560 + r() * 520; const a = seg(lt, 1.8 + i * .18, 2.5 + i * .18); sparkle(ctx, x, y, 10 + r() * 22, lt * .6, i % 2 ? COL.pink : COL.cream, Math.sin(a * Math.PI) * .9); }
  ctx.restore();
  dust(lt);
}

/* ---------- CENA 2: brownies ---------- */
function scene2(lt) {
  backdrop(lt, { gx: 560, gy: 1000, gr: 1000 });
  const camP = eIO(seg(lt, 3.0, 6.8));
  const cs = lerp(1.14, 1.55, camP), cx_ = lerp(540, 585, camP), cy_ = lerp(1150, 1125, camP);
  ctx.save(); ctx.translate(540, 1110); ctx.scale(cs, cs); ctx.translate(-cx_, -cy_);
  counter(1050, lt);
  const w = 560, h = 210, d = 280; const ox = d * OB.fx, oy = d * OB.fy; const x0 = 175, yb = 1290;
  const drop = seg(lt, .3, 1.1); const dy = (1 - eBounce(drop)) * -900;
  const enter = seg(lt, 1.0, 1.6), cut = seg(lt, 1.6, 2.5), lift = seg(lt, 2.6, 3.2);
  const sep = eIO(seg(lt, 2.7, 3.9));
  const uc = .46; const wA = w * uc, wB = w * (1 - uc);
  contactShadow(x0 + (w + ox) / 2 + sep * 40, yb + 20, 450 + sep * 70, 80, .62 * eO3(drop));
  if (drop > 0) {
    ctx.save(); ctx.translate(0, dy);
    brownieBox(ctx, x0 - sep * 14, yb, wA, h, d, 0, uc, TEX.bSide);
    brownieBox(ctx, x0 + wA + sep * 96, yb - sep * 6, wB, h, d, uc, 1, TEX.bSide2);
    if (cut > .02 && sep < .02) {
      const sx = x0 + wA; ctx.fillStyle = 'rgba(8,2,0,.9)';
      ctx.beginPath(); ctx.moveTo(sx - 2, yb - h); ctx.lineTo(sx + 3, yb - h); ctx.lineTo(sx + 3 + ox, yb - h + oy); ctx.lineTo(sx - 2 + ox, yb - h + oy); ctx.fill();
      ctx.fillRect(sx - 2, yb - h, 5, eIO(cut) * h);
    }
    // raspador de confeiteiro entra, corta e sai
    let s = lerp(-170, -40, eO3(enter)); s = lerp(s, 215, eIO(cut)); s = lerp(s, -130, eIO(lift));
    if (lt > .95 && lift < 1) steelBlade(ctx, x0 + wA - 2, yb - h, ox, oy, -s, 270, clamp(enter * 1.5) * (1 - eIO(lift)));
    ctx.restore();
    crumbs(lt, 1.95, x0 + wA + ox * .5, yb - h + oy * .5, 18, 7, ['#2a1007', '#3b1a0d', '#6a3520'], 320, 440);
    crumbs(lt, 2.85, x0 + wA + 10, yb - 20, 12, 17, ['#2a1007', '#3b1a0d', '#6a3520'], 380, 260);
    // calda de chocolate
    const pour = seg(lt, 3.9, 5.6);
    if (pour > 0) {
      const ax_ = x0 - sep * 14; const px = ax_ + wA * .5 + ox * .45, ptop = yb - h + oy * .45;
      ctx.save();
      const sw = 28 * (1 - seg(lt, 4.9, 5.6));
      if (sw > .5) { const yEnd = lerp(-300, ptop + 6, eO3(seg(lt, 3.9, 4.3))); ctx.fillStyle = linear(ctx, px - 20, 0, px + 20, 0, [[0, '#1a0803'], [.45, '#5a2818'], [.6, '#2c1109'], [1, '#150602']]); rr(ctx, px - sw / 2, -400, sw, yEnd + 400, sw / 2); ctx.fill(); }
      const pp = eO3(seg(lt, 4.2, 5.3));
      ctx.save(); ctx.beginPath(); ctx.moveTo(ax_, yb - h); ctx.lineTo(ax_ + wA, yb - h); ctx.lineTo(ax_ + wA + ox, yb - h + oy); ctx.lineTo(ax_ + ox, yb - h + oy); ctx.closePath(); ctx.clip();
      ctx.fillStyle = '#2a0f07'; ctx.beginPath(); ctx.ellipse(px, ptop, 250 * pp, 78 * pp, -.35, 0, 6.3); ctx.fill();
      ctx.fillStyle = 'rgba(255,215,190,.45)'; ctx.beginPath(); ctx.ellipse(px - 30 * pp, ptop - 12 * pp, 70 * pp, 9 * pp, -.35, 0, 6.3); ctx.fill();
      ctx.restore();
      const dr = seg(lt, 4.4, 6.4); ctx.save();
      [[.10, 85, 30], [.28, 135, 36], [.47, 62, 28], [.68, 112, 34], [.88, 48, 26]].forEach(([fx, L, wd], i) => { const q = eO3(clamp(dr * 1.3 - i * .1)); const xx = ax_ + wA * fx; ctx.fillStyle = '#2a0f07'; sauceDrip(ctx, xx, yb - h + 2, L * q, wd); if (q > .1) { ctx.fillStyle = 'rgba(255,215,190,.34)'; ctx.beginPath(); ctx.ellipse(xx - wd * .18, yb - h + 10 + L * q * .45, 3, L * q * .32, 0, 0, 6.3); ctx.fill(); } });
      ctx.restore(); ctx.restore();
    }
  }
  ctx.restore();
  header(lt, 'Brownies', 'Intenso, macio e irresistível.', .6);
  dust(lt);
}

/* ---------- CENA 3: cookies ---------- */
function jag(y) { return 15 * Math.sin(y * .045 + 1) + 9 * Math.sin(y * .13 + 2) + 6 * Math.sin(y * .31); }
function scene3(lt) {
  backdrop(lt, { gx: 540, gy: 1060, gr: 980 });
  const camP = eIO(seg(lt, 2.6, 5.9));
  const cs = lerp(1.3, 1.4, camP);
  ctx.save(); ctx.translate(540, 1060); ctx.scale(cs, cs); ctx.translate(-540, -1120);
  counter(1000, lt);
  const cx = 540, cy = 1120; const S = COOKIE;
  const pop = seg(lt, .35, 1.25); const e = eBack(pop);
  const split = eIO(seg(lt, 2.3, 3.7)); const gap = split * 165;
  const shake = seg(lt, 1.9, 2.3) * (1 - seg(lt, 2.3, 2.4));
  contactShadow(cx, cy + 215, 345 + gap * .5, 92, .6 * eO3(pop));
  // cookie desfocado ao fundo
  ctx.save(); ctx.globalAlpha = .55 * eO3(pop); ctx.filter = 'blur(9px) brightness(.7)'; ctx.translate(210, 840); ctx.scale(.45, .45); ctx.rotate(-.35); ctx.drawImage(TEX.cookie, -S.cx, -S.cy); ctx.restore();
  if (pop > 0) {
    const drawHalf = (side) => {
      const sgn = side === 'L' ? -1 : 1;
      ctx.save();
      ctx.translate(cx + sgn * gap / 2 + (Math.sin(lt * 90) * 3 * shake), cy + (1 - e) * -160 - split * sgn * -0);
      const sc = lerp(.3, 1, clamp(e)); ctx.scale(sc, sc);
      ctx.rotate(sgn * split * .13 + (1 - e) * .5 * sgn);
      ctx.translate(-S.cx, -S.cy);
      ctx.beginPath(); if (side === 'L') { ctx.moveTo(-50, -80); for (let y = -80; y <= 600; y += 6) ctx.lineTo(S.cx + jag(y), y); ctx.lineTo(-50, 600); } else { ctx.moveTo(S.w + 50, -80); for (let y = -80; y <= 600; y += 6) ctx.lineTo(S.cx + jag(y), y); ctx.lineTo(S.w + 50, 600); }
      ctx.closePath(); ctx.save(); ctx.clip();
      ctx.drawImage(TEX.cookie, 0, 0);
      // miolo exposto na quebra
      if (split > 0) {
        ctx.lineJoin = 'round'; ctx.beginPath(); for (let y = 60; y <= 420; y += 6) y === 60 ? ctx.moveTo(S.cx + jag(y), y) : ctx.lineTo(S.cx + jag(y), y);
        ctx.strokeStyle = '#efd09a'; ctx.lineWidth = 34; ctx.globalAlpha = Math.min(1, split * 3); ctx.stroke();
        ctx.strokeStyle = '#d6a96a'; ctx.lineWidth = 14; ctx.stroke(); ctx.globalAlpha = 1;
        // chocolate derretido na quebra
        const r = mulberry32(side === 'L' ? 5 : 6); ctx.fillStyle = '#2d1209';
        for (let i = 0; i < 6; i++) { const y = 130 + i * 52 + r() * 14; ctx.beginPath(); ctx.ellipse(S.cx + jag(y) + (side === 'L' ? -6 : 6), y, 18 + r() * 8, 12 + r() * 6, 0, 0, 6.3); ctx.fill(); ctx.fillStyle = 'rgba(255,215,190,.35)'; ctx.beginPath(); ctx.ellipse(S.cx + jag(y) - 4, y - 4, 5, 3, 0, 0, 6.3); ctx.fill(); ctx.fillStyle = '#2d1209'; }
      }
      ctx.restore(); ctx.restore();
    };
    drawHalf('L'); drawHalf('R');
    // fios de chocolate derretido esticando
    if (split > .08) {
      [[-95, 240], [-35, 190], [20, 215], [70, 165], [115, 140]].forEach(([yy, mx], i) => {
        const wid = Math.max(0, 15 * (1 - gap / mx)); if (wid < .6) return; const y = cy + yy - 20; const xl = cx - gap / 2 + 4, xr = cx + gap / 2 - 4; const sag = 26 + gap * .16 + i * 4;
        ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = '#2a0f07'; ctx.lineWidth = wid; ctx.beginPath(); ctx.moveTo(xl, y); ctx.quadraticCurveTo(cx, y + sag, xr, y); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,215,190,.45)'; ctx.lineWidth = wid * .28; ctx.beginPath(); ctx.moveTo(xl + 6, y - wid * .2); ctx.quadraticCurveTo(cx, y + sag - wid * .25, xr - 6, y - wid * .2); ctx.stroke(); ctx.restore();
      });
    }
    crumbs(lt, 2.35, cx, cy + 40, 26, 31, ['#c98d4a', '#e2ad68', '#6b3a1e', '#2d1209'], 360, 320, 1600, 1.6);
    // brilho varrendo
    const sw = seg(lt, 1.2, 2.0); if (sw > 0 && sw < 1) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .5; ctx.fillStyle = linear(ctx, cx - 300 + sw * 600 - 60, 0, cx - 300 + sw * 600 + 60, 0, [[0, 'rgba(255,230,180,0)'], [.5, 'rgba(255,230,180,.5)'], [1, 'rgba(255,230,180,0)']]); ctx.fillRect(cx - 330, cy - 200, 660, 330); ctx.restore(); }
  }
  ctx.restore();
  header(lt, 'Cookies', 'Grandes e cheios de chocolate.', .75);
  dust(lt);
}

/* ---------- CENA 4: brigadeiros ---------- */
const GRID = (() => { const a = []; const cols = 3, rows = 4; const r = mulberry32(14); const kinds = [0, 1, 2, 1, 2, 0, 2, 0, 1, 0, 1, 2]; for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const k = j * cols + i; a.push({ x: 540 + (i - 1) * 200 + (j % 2 ? 0 : 0), y: 800 + j * 170, kind: kinds[k], order: k, ph: r() * 6 }); } return a; })();
function brigadeiro(x, y, kind, p, lt, scale = 1) {
  if (p <= 0) return; const e = eElastic(clamp(p)); const sc = Math.max(0, e) * scale; const yo = (1 - eO3(clamp(p * 1.4))) * -120;
  ctx.save(); ctx.translate(x, y + yo); ctx.scale(sc, sc);
  ctx.globalAlpha = clamp(p * 3);
  ctx.drawImage(TEX.cups[kind], -135, -135); ctx.save(); ctx.scale(1.22, 1.22); ctx.drawImage(TEX.balls[kind], -95, -102); ctx.restore();
  ctx.restore();
}
function scene4(lt) {
  backdrop(lt, { gx: 540, gy: 1000, gr: 1050 });
  const camP = eIO(seg(lt, 1.0, 5.8)); const cs = lerp(1.08, 1.2, camP);
  ctx.save(); ctx.translate(540, 1125); ctx.scale(cs, cs); ctx.rotate(lerp(-.012, .012, camP)); ctx.translate(-540 + lerp(10, -10, camP), -1090 + lerp(10, -10, camP));
  // bandeja
  const tp = eO3(seg(lt, .2, 1.0));
  ctx.save(); ctx.globalAlpha = tp; ctx.translate(540, 1090 + (1 - tp) * 60);
  ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 36;
  rr(ctx, -380, -420, 760, 840, 70); ctx.fillStyle = linear(ctx, 0, -420, 0, 420, [[0, '#6f3b27'], [1, '#4a2418']]); ctx.fill(); ctx.shadowColor = 'transparent';
  rr(ctx, -380, -420, 760, 840, 70); ctx.strokeStyle = 'rgba(255,200,160,.28)'; ctx.lineWidth = 4; ctx.stroke();
  rr(ctx, -352, -392, 704, 784, 52); ctx.fillStyle = linear(ctx, 0, -392, 0, 392, [[0, '#3a1a10'], [1, '#2e130b']]); ctx.fill();
  ctx.strokeStyle = 'rgba(244,166,188,.55)'; ctx.lineWidth = 2; ctx.setLineDash([2, 14]); ctx.lineCap = 'round'; rr(ctx, -330, -370, 660, 740, 40); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  for (const b of GRID) { const p = seg(lt, 1.0 + b.order * .12, 1.9 + b.order * .12); contactShadow(b.x + 5, b.y + 48, 66, 19, .55 * clamp(p * 2)); }
  for (const b of GRID) { const p = seg(lt, 1.0 + b.order * .12, 1.9 + b.order * .12); brigadeiro(b.x, b.y, b.kind, p, lt, .72); }
  // brilhos nos doces
  GRID.forEach((b, i) => { const q = seg(lt, 2.8 + i * .17, 3.5 + i * .17); sparkle(ctx, b.x - 28, b.y - 40, 20 + (i % 3) * 6, 0, '#fff', Math.sin(q * Math.PI) * .95); });
  ctx.restore();
  header(lt, 'Brigadeiros', 'Para todos os gostos.', .75);
  dust(lt);
}

/* ---------- CENA 5: variedade ---------- */
function miniBrownie(x, y, sc, p, kind) {
  if (p <= 0) return; const e = eBack(clamp(p)); ctx.save(); ctx.translate(x, y + (1 - eO3(clamp(p * 1.3))) * -160); ctx.scale(sc * e, sc * e); ctx.globalAlpha = clamp(p * 3);
  brownieBox(ctx, -300, 0, 520, 150, 240, 0, 1, TEX.bSide); ctx.restore();
}
function scene5(lt) {
  backdrop(lt, { gx: 540, gy: 1060, gr: 1100 });
  const camP = eO3(seg(lt, 0, 4)); const cs = lerp(1.34, 1.24, camP);
  ctx.save(); ctx.translate(540, 1110); ctx.scale(cs, cs); ctx.translate(-540, -1215);
  counter(1010, lt);
  contactShadow(540, 1385, 470, 90, .5);
  const pc = seg(lt, .8, 1.6);
  if (pc > 0) { const e = eBack(clamp(pc)); ctx.save(); ctx.translate(690, 1065 - (1 - clamp(pc)) * 200); ctx.scale(.62 * e, .62 * e); ctx.rotate(.08); contactShadow(0, 150, 300, 50, .5); ctx.drawImage(TEX.cookie, -COOKIE.cx, -COOKIE.cy); ctx.restore(); }
  miniBrownie(300, 1190, .6, seg(lt, .5, 1.3));
  miniBrownie(325, 1128, .56, seg(lt, .75, 1.55));
  const front = [[300, 1330, 0], [470, 1362, 1], [640, 1346, 2], [810, 1366, 0], [390, 1262, 2], [720, 1255, 1], [555, 1262, 0]];
  front.forEach((f, i) => { const p = seg(lt, 1.2 + i * .1, 2.0 + i * .1); contactShadow(f[0] + 3, f[1] + 36, 50, 14, .55 * clamp(p * 2)); });
  front.forEach((f, i) => { const p = seg(lt, 1.2 + i * .1, 2.0 + i * .1); brigadeiro(f[0], f[1], f[2], p, lt, .56); });
  ctx.restore();
  // título
  const t0 = .5;
  const lp = eO3(seg(lt, t0 - .2, t0 + .5)); if (lp > 0) { const h = 74, w = LOGO.width / LOGO.height * h; ctx.save(); ctx.globalAlpha = lp; ctx.drawImage(LOGO, 540 - w / 2, 262, w, h); ctx.restore(); }
  textReveal('Tem para', 540, 450, "% 'Caprasimo'", 132, COL.cream, seg(lt, t0, t0 + .9), { stagger: .06 });
  textReveal('todo gosto.', 540, 580, "% 'Caprasimo'", 132, COL.cream, seg(lt, t0 + .15, t0 + 1.05), { stagger: .06 });
  swash(540 - 260, 540 + 260, 612, seg(lt, t0 + .8, t0 + 1.4));
  // legenda
  const cp = eO3(seg(lt, 2.2, 3.0)); if (cp > 0) { ctx.save(); ctx.globalAlpha = cp; ctx.font = "500 38px 'Outfit'"; ctx.letterSpacing = '6px'; ctx.textAlign = 'center'; ctx.fillStyle = COL.cream; const y = 1500 + (1 - cp) * 16; ctx.fillText('BROWNIES  •  COOKIES  •  BRIGADEIROS', 540 + 3, y); ctx.restore(); }
  dust(lt);
}

/* ---------- CENA 6: encerramento ---------- */
function scene6(lt) {
  backdrop(lt, { gx: 540, gy: 760, gr: 1100 });
  ctx.save(); const z = 1 + lt * .012; ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900);
  const rp = seg(lt, .6, 1.6); const pulse = 1 + .02 * Math.sin(lt * 2.4);
  // anel de brilho
  const ring = seg(lt, 1.2, 2.3); if (ring > 0 && ring < 1) { ctx.save(); ctx.strokeStyle = COL.pink; ctx.globalAlpha = (1 - ring) * .6; ctx.lineWidth = 6 * (1 - ring) + 1; ctx.beginPath(); ctx.arc(540, 600, 120 + eO3(ring) * 520, 0, 6.3); ctx.stroke(); ctx.restore(); }
  if (rp > 0) logoReveal(540, 600, 1.08 * pulse, rp, { glow: eO3(seg(lt, .9, 1.9)) * .9 });
  const size = fitFont('GOBÊ', "% 'Caprasimo'", 820, 210);
  textReveal('GOBÊ', 540, 1045, "% 'Caprasimo'", size, COL.cream, seg(lt, 1.2, 2.1), { track: 18, stagger: .1 });
  const gp = eO3(seg(lt, 1.6, 2.3)); if (gp > 0) { ctx.save(); ctx.globalAlpha = gp; ctx.font = "500 40px 'Outfit'"; ctx.letterSpacing = '14px'; ctx.fillStyle = COL.pink; ctx.textAlign = 'center'; ctx.fillText('GOMES & BORGES', 540 + 7, 1120 + (1 - gp) * 14); ctx.restore(); }
  const lw = eO3(seg(lt, 1.8, 2.4)); if (lw > 0) { ctx.save(); ctx.strokeStyle = COL.red; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(540 - 90 * lw, 1182); ctx.lineTo(540 + 90 * lw, 1182); ctx.stroke(); ctx.restore(); }
  textReveal('Pequenos momentos,', 540, 1300, "% 'Caprasimo'", 62, COL.cream, seg(lt, 2.0, 2.8), { stagger: .03, rise: .8 });
  textReveal('grandes delícias.', 540, 1382, "% 'Caprasimo'", 62, COL.pink, seg(lt, 2.3, 3.1), { stagger: .03, rise: .8 });
  for (let i = 0; i < 9; i++) { const r = mulberry32(300 + i); const ang = r() * 6.28, rad = 340 + r() * 260; const x = 540 + Math.cos(ang) * rad, y = 760 + Math.sin(ang) * rad * .8; const a = seg(lt, 1.2 + i * .2, 2.2 + i * .2); sparkle(ctx, x, y, 10 + r() * 20, lt * .5, i % 2 ? COL.pink : COL.cream, Math.sin(a * Math.PI) * .9); }
  ctx.restore();
  dust(lt);
}

/* ---------- montagem ---------- */
const BOUND = [0, 4, 10, 15, 20, 23]; const END = 27;
const SCENES = [scene1, scene2, scene3, scene4, scene5, scene6];
const START = BOUND.map((b, i) => i === 0 ? 0 : b - TR_DUR / 2);
function sceneAt(t) { let i = 0; for (let k = 1; k < BOUND.length; k++) if (t >= BOUND[k] - TR_DUR / 2) i = k; return i; }

function post(t, frame) {
  // vinheta
  ctx.save(); ctx.fillStyle = radial(ctx, 540, 960, 520, 1250, [[0, 'rgba(10,3,1,0)'], [1, 'rgba(10,3,1,.62)']]); ctx.fillRect(0, 0, W, H);
  // luz quente suave
  ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .35; ctx.fillStyle = linear(ctx, 0, 0, W, H, [[0, 'rgba(255,170,100,.0)'], [1, 'rgba(255,120,80,.35)']]); ctx.fillRect(0, 0, W, H);
  // grão
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .075; const pat = ctx.createPattern(TEX.grain, 'repeat'); ctx.translate((frame * 53) % 256, (frame * 97) % 256); ctx.fillStyle = pat; ctx.fillRect(-256, -256, W + 512, H + 512);
  ctx.restore();
  // entrada e saída em fade
  const fi = 1 - seg(t, 0, .35), fo = seg(t, END - .22, END);
  if (fi > 0 || fo > 0) { ctx.save(); ctx.fillStyle = COL.dark; ctx.globalAlpha = Math.max(fi, fo * .0 + fo); ctx.fillRect(0, 0, W, H); ctx.restore(); }
}

function render(t) {
  const frame = Math.round(t * FPS);
  const i = sceneAt(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  let p = -1;
  if (i > 0) p = (t - (BOUND[i] - TR_DUR / 2)) / TR_DUR;
  if (p >= 0 && p < 1) {
    // transição "glacê": cena anterior, faixas vermelha / marrom / rosa e a cena nova revelada por cima
    SCENES[i - 1](t - START[i - 1]);
    const e = [0, 1, 2, 3].map(k => transitionBase(p, k));
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; glazePath(ctx, -10, W + 10, e[0], 0, DRIPS, 1); ctx.fillStyle = COL.red; ctx.fill(); ctx.restore();
    glazePath(ctx, -10, W + 10, e[1], 1, DRIPS, 1); ctx.fillStyle = COL.brown; ctx.fill();
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10; glazePath(ctx, -10, W + 10, e[2], 2, DRIPS, 1); ctx.fillStyle = COL.pink; ctx.fill(); ctx.restore();
    ctx.save(); glazePath(ctx, -10, W + 10, e[3] , 3, DRIPS, 1); ctx.clip();
    SCENES[i](t - START[i]);
    ctx.restore();
  } else {
    SCENES[i](t - START[i]);
  }
  post(t, frame);
}
window.render = render;
window.TOTAL = END;
init().then(() => { window.READY = true; }).catch(e => { window.ERR = String(e && e.stack || e); });
