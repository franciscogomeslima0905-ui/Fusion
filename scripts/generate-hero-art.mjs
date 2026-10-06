// Arte procedural do hero da Fusion Gym: mãos "esculpidas" em cinza + halter sextavado,
// com iluminação de recorte vermelha (filtros de luz do SVG).
//
// Uso: npm run generate:hero   → gera scripts/hero-art/{preview,top,bottom}.html
// Para exportar as camadas, abra top.html e bottom.html em 1600x1000 com fundo transparente
// (ex.: screenshot com Playwright, deviceScaleFactor 1.5, omitBackground: true) e converta para
// WebP em src/assets/hero/hand-top.webp e hand-bottom.webp (2400x1500) + versões -sm (1200x750).
import fs from 'node:fs';
const out = process.argv[2] ?? '.';
const W = 1600, H = 1000;

const v = (x, y) => ({ x, y });
const add = (a, b) => v(a.x + b.x, a.y + b.y);
const mul = (a, s) => v(a.x * s, a.y * s);
const dir = (deg) => v(Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180));
const f = (n) => n.toFixed(1);

// Tapered capsule from p1 (radius r1) to p2 (radius r2)
function capsule(p1, p2, r1, r2) {
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const L = Math.hypot(dx, dy) || 1;
  const n = v(-dy / L, dx / L);
  const a1 = add(p1, mul(n, r1)), a2 = add(p2, mul(n, r2));
  const b2 = add(p2, mul(n, -r2)), b1 = add(p1, mul(n, -r1));
  return `M${f(a1.x)},${f(a1.y)} L${f(a2.x)},${f(a2.y)} A${f(r2)},${f(r2)} 0 0 0 ${f(b2.x)},${f(b2.y)} L${f(b1.x)},${f(b1.y)} A${f(r1)},${f(r1)} 0 0 0 ${f(a1.x)},${f(a1.y)} Z`;
}

// Finger as a chain of phalanges. Returns paths + tip.
function finger(base, angle, lens, bends, widths) {
  const paths = [];
  let p = base, a = angle;
  for (let i = 0; i < lens.length; i++) {
    a += bends[i];
    const q = add(p, mul(dir(a), lens[i]));
    paths.push(capsule(p, q, widths[i], widths[i + 1]));
    p = q;
  }
  return { paths, tip: p };
}

function blob(points) {
  // smooth closed Catmull-Rom path
  const n = points.length;
  let d = `M${f(points[0].x)},${f(points[0].y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n], p1 = points[i], p2 = points[(i + 1) % n], p3 = points[(i + 2) % n];
    const c1 = v(p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6);
    const c2 = v(p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6);
    d += ` C${f(c1.x)},${f(c1.y)} ${f(c2.x)},${f(c2.y)} ${f(p2.x)},${f(p2.y)}`;
  }
  return d + 'Z';
}

// ---------- Dumbbell (hex heads) ----------
const D = v(905, 520); // handle centre
const axisDeg = -14;
const ax = dir(axisDeg), nx = dir(axisDeg + 90);
function hexHead(center, size, depth, shade) {
  // A hex prism seen 3/4: front hexagon + side band towards -axis
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const t = ((60 * i + 30) * Math.PI) / 180;
    // squash along axis to fake perspective (ellipse-ish hexagon)
    const p = add(center, add(mul(ax, Math.cos(t) * size * 0.42), mul(nx, Math.sin(t) * size)));
    pts.push(p);
  }
  const back = pts.map((p) => add(p, mul(ax, -depth)));
  let s = '';
  // side faces
  for (let i = 0; i < 6; i++) {
    const j = (i + 1) % 6;
    const quad = [pts[i], pts[j], back[j], back[i]];
    const light = 0.35 + 0.5 * Math.max(0, Math.cos(((60 * i + 60) * Math.PI) / 180 + 2.2));
    s += `<path d="M${quad.map((p) => `${f(p.x)},${f(p.y)}`).join(' L')}Z" fill="rgb(${Math.round(110 * light * shade)},${Math.round(113 * light * shade)},${Math.round(120 * light * shade)})"/>`;
  }
  s += `<path d="M${pts.map((p) => `${f(p.x)},${f(p.y)}`).join(' L')}Z" fill="url(#hexFace)"/>`;
  // inner bevel ring
  const inner = pts.map((p) => add(center, mul(add(p, mul(center, -1)), 0.72)));
  s += `<path d="M${inner.map((p) => `${f(p.x)},${f(p.y)}`).join(' L')}Z" fill="none" stroke="#5b5f66" stroke-width="5" opacity=".8"/>`;
  return s;
}
function dumbbell() {
  const half = 175, depth = 70, size = 112;
  const leftC = add(D, mul(ax, -half - depth)), rightC = add(D, mul(ax, half + depth));
  const hL = add(D, mul(ax, -half)), hR = add(D, mul(ax, half));
  let s = '<g filter="url(#metal)">';
  // left head: draw it so face points away (towards -axis) -> mirror depth
  s += hexHeadFacing(add(D, mul(ax, -half)), size, depth, -1, 0.9);
  s += `<path d="${capsule(add(hL, mul(ax, -10)), add(hR, mul(ax, 10)), 26, 26)}" fill="url(#handle)"/>`;
  // knurling
  for (let i = -130; i <= 130; i += 13) {
    const c = add(D, mul(ax, i));
    s += `<path d="M${f(add(c, mul(nx, -24)).x)},${f(add(c, mul(nx, -24)).y)} L${f(add(c, mul(nx, 24)).x)},${f(add(c, mul(nx, 24)).y)}" stroke="#2a2c30" stroke-width="2.4" opacity=".55"/>`;
  }
  s += hexHeadFacing(add(D, mul(ax, half)), size, depth, 1, 1.05);
  s += '</g>';
  void leftC; void rightC;
  return s;
}
function hexHeadFacing(innerFaceCenter, size, depth, sign, shade) {
  // prism from innerFaceCenter extending `depth` along sign*axis; visible outer face on right head only
  const outer = add(innerFaceCenter, mul(ax, sign * depth));
  if (sign > 0) return hexHead(outer, size, depth, shade);
  // left head: show inner face (towards handle) + sides
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const t = ((60 * i + 30) * Math.PI) / 180;
    pts.push(add(innerFaceCenter, add(mul(ax, Math.cos(t) * size * 0.42), mul(nx, Math.sin(t) * size))));
  }
  const back = pts.map((p) => add(p, mul(ax, -depth)));
  let s = '';
  for (let i = 0; i < 6; i++) {
    const j = (i + 1) % 6;
    const quad = [pts[i], pts[j], back[j], back[i]];
    const light = 0.3 + 0.5 * Math.max(0, Math.cos(((60 * i + 60) * Math.PI) / 180 + 2.2));
    s += `<path d="M${quad.map((p) => `${f(p.x)},${f(p.y)}`).join(' L')}Z" fill="rgb(${Math.round(110 * light * shade)},${Math.round(113 * light * shade)},${Math.round(120 * light * shade)})"/>`;
  }
  s += `<path d="M${pts.map((p) => `${f(p.x)},${f(p.y)}`).join(' L')}Z" fill="url(#hexFaceDark)"/>`;
  return s;
}

// ---------- Top hand: fist gripping the handle, arm from upper-left ----------
const crease = 'stroke="#25272b" stroke-width="4" stroke-linejoin="round"';
function topHand() {
  const base = [], fingers = [];
  const K = add(D, mul(nx, -46)); // knuckle row centre, just above the handle
  // forearm descends from upper-left into the wrist
  const wrist = add(K, add(mul(ax, -150), mul(nx, -170)));
  base.push(capsule(v(-300, -260), wrist, 165, 92));
  // back of the hand: wrist -> knuckle row (wide, slightly domed)
  const kL = add(K, mul(ax, -118)), kR = add(K, mul(ax, 112));
  base.push(blob([
    add(wrist, mul(ax, -70)), add(wrist, mul(nx, -60)), add(wrist, mul(ax, 80)),
    add(kR, add(mul(ax, 26), mul(nx, -30))), add(kR, mul(nx, 18)),
    add(K, mul(nx, 30)), add(kL, mul(nx, 20)), add(kL, add(mul(ax, -30), mul(nx, -40))),
  ]));
  // thumb: from the wrist side, wraps the handle on the near side, tip under the fingers
  const thumb = finger(add(wrist, add(mul(ax, -30), mul(nx, 70))), axisDeg + 62, [96, 70, 52], [0, -26, -30], [44, 38, 31, 24]);
  base.push(...thumb.paths);
  // four fingers: proximal phalanx crosses the handle, middle tucks under/back
  const spacing = [-84, -28, 28, 82];
  const lens = [[70, 46, 26], [76, 50, 28], [74, 48, 27], [62, 42, 24]];
  const ws = [[33, 31, 28, 24], [35, 33, 30, 26], [34, 32, 29, 25], [30, 28, 25, 22]];
  spacing.forEach((s, i) => {
    const k = add(K, mul(ax, s));
    const fi = finger(k, axisDeg + 90 - 6 + i * 3, lens[i], [0, 58, 62], ws[i]);
    fingers.push([fi.paths[0], fi.paths[1]]);
  });
  return { base, fingers };
}

// ---------- Bottom hand: open palm up, reaching from lower-right ----------
function bottomHand() {
  const base = [], fingers = [];
  const wrist = v(1250, 842);
  base.push(capsule(v(1950, 1240), wrist, 180, 100));
  // palm (seen from the thumb side, palm facing up)
  base.push(blob([v(1300, 780), v(1190, 760), v(1080, 765), v(1012, 790), v(995, 832), v(1030, 876), v(1130, 905), v(1250, 915), v(1320, 875)]));
  // fingers (index on top / nearest to the dumbbell, pinky lowest)
  const bases = [v(1028, 792), v(1012, 818), v(1010, 846), v(1024, 872)];
  const ang = [-160, -170, -178, 174];
  const lens = [[118, 74, 54], [124, 78, 56], [114, 72, 52], [92, 60, 44]];
  const bend = [[0, 10, 12], [0, 16, 18], [0, 24, 24], [0, 30, 30]];
  const ws = [[27, 25, 22, 18], [28, 26, 23, 19], [27, 25, 22, 18], [24, 22, 19, 16]];
  // draw pinky first so the index sits in front
  for (let i = 3; i >= 0; i--) fingers.push(finger(bases[i], ang[i], lens[i], bend[i], ws[i]).paths);
  // thumb: up and slightly left, relaxed
  fingers.push(finger(v(1150, 772), -150, [58, 44, 34], [0, 12, 14], [38, 32, 26, 20]).paths);
  return { base, fingers };
}

const defs = `
<defs>
  <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#b9bcc2"/><stop offset=".55" stop-color="#8d9097"/><stop offset="1" stop-color="#4a4d53"/>
  </linearGradient>
  <linearGradient id="handle" x1="0" y1="0" x2="0" y2="1" gradientTransform="rotate(${axisDeg} .5 .5)">
    <stop offset="0" stop-color="#b9bcc2"/><stop offset=".45" stop-color="#5f6269"/><stop offset="1" stop-color="#1e1f23"/>
  </linearGradient>
  <radialGradient id="hexFace" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#9a9ea6"/><stop offset=".6" stop-color="#4c4f56"/><stop offset="1" stop-color="#1c1d21"/></radialGradient>
  <radialGradient id="hexFaceDark" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#5d6068"/><stop offset="1" stop-color="#16171a"/></radialGradient>

  <filter id="sculpt" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="s1"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="26" result="s2"/>
    <feComposite in="s1" in2="s2" operator="arithmetic" k1="0" k2="0.45" k3="0.55" k4="0" result="soft"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.018 0.05" numOctaves="3" seed="11" result="wr"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="3" result="grain"/>
    <feColorMatrix in="wr" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="wrA"/>
    <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="grainA"/>
    <feComposite in="wrA" in2="soft" operator="arithmetic" k1="0" k2="0.05" k3="1" k4="-0.025" result="b1"/>
    <feComposite in="grainA" in2="b1" operator="arithmetic" k1="0" k2="0.018" k3="1" k4="-0.009" result="bump"/>
    <feDiffuseLighting in="bump" surfaceScale="22" diffuseConstant="1.05" lighting-color="#e9ebef" result="diff">
      <feDistantLight azimuth="225" elevation="26"/>
    </feDiffuseLighting>
    <feSpecularLighting in="bump" surfaceScale="22" specularConstant="1.1" specularExponent="18" lighting-color="#ffffff" result="spec">
      <feDistantLight azimuth="230" elevation="48"/>
    </feSpecularLighting>
    <feDiffuseLighting in="bump" surfaceScale="22" diffuseConstant="1.6" lighting-color="#ff1f1f" result="red">
      <fePointLight x="1700" y="900" z="60"/>
    </feDiffuseLighting>
    <feComposite in="diff" in2="SourceGraphic" operator="arithmetic" k1="1.15" k2="0" k3="0" k4="0" result="lit"/>
    <feComposite in="spec" in2="lit" operator="arithmetic" k1="0" k2="0.55" k3="1" k4="0" result="lit2"/>
    <feComposite in="red" in2="lit2" operator="arithmetic" k1="0" k2="0.55" k3="1" k4="0" result="lit3"/>
    <feComposite in="lit3" in2="SourceAlpha" operator="in"/>
  </filter>

  <radialGradient id="fadeG" cx="880" cy="560" r="820" gradientUnits="userSpaceOnUse"><stop offset=".45" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
  <mask id="fade" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#fadeG)"/></mask>
  <filter id="metal" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="soft"/>
    <feSpecularLighting in="soft" surfaceScale="5" specularConstant="1.2" specularExponent="34" lighting-color="#fff" result="spec">
      <feDistantLight azimuth="235" elevation="50"/>
    </feSpecularLighting>
    <feDiffuseLighting in="soft" surfaceScale="5" diffuseConstant="1.4" lighting-color="#ff2222" result="red">
      <fePointLight x="1650" y="1150" z="160"/>
    </feDiffuseLighting>
    <feComposite in="spec" in2="SourceGraphic" operator="arithmetic" k1="0" k2="0.5" k3="1" k4="0" result="a"/>
    <feComposite in="red" in2="a" operator="arithmetic" k1="0" k2="0.18" k3="1" k4="0" result="b"/>
    <feComposite in="b" in2="SourceAlpha" operator="in"/>
  </filter>
</defs>`;

const g = ({ base, fingers }) =>
  `<g mask="url(#fade)"><g filter="url(#sculpt)"><g fill="#8a8d93">${base.map((d) => `<path d="${d}"/>`).join('')}${fingers
    .map((fp) => fp.map((d) => `<path d="${d}" ${crease}/>`).join('') + fp.map((d) => `<path d="${d}"/>`).join(''))
    .join('')}</g></g></g>`;

const svg = (inner, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:block${bg ? ';background:#050506' : ''}">${defs}${inner}</svg>`;

const page = (body) => `<!doctype html><html><head><style>html,body{margin:0;background:transparent}</style></head><body>${body}</body></html>`;

// layer split: "top" = arm + dumbbell (moves), "bottom" = receiving hand
const topLayer = dumbbell() + g(topHand());
// fingers must sit IN FRONT of the handle — redraw handle centre behind fist is already handled by order
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(`${out}/preview.html`, page(svg(g(bottomHand()) + topLayer, true)));
fs.writeFileSync(`${out}/top.html`, page(svg(topLayer)));
fs.writeFileSync(`${out}/bottom.html`, page(svg(g(bottomHand()))));
console.log('ok');
