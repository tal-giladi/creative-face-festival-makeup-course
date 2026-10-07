// Module 9 diagrams (Fantasy Characters and Masks) and the P10 / P11 / P12 project images.
// Run: node curriculum/tools/assets-m09.mjs
// The design functions are exported for sheets-m09.mjs (importing this file rebuilds the diagrams).
import { plain, strip, faceLayer, save } from './lib/figure.mjs';
import { P, SOFT, INK, OK, BAD, ACCENT, label, arrow, badge, tick, cross, line, stroke, teardrop, petal, dot, dots, sparkle, star, glitter, curlPts, pol, spline, polyD, rng } from './lib/art.mjs';
import { SKIN, L, FACE, faceSVG } from './lib/face.mjs';
import { taper } from './lib/geom.mjs';

const n1 = (v) => (Math.round(v * 10) / 10).toString();
const OUTLINE = '#5b4636';
const BLACK = P.black, WHITE = P.white;

// =====================================================================================
// Local helpers (not in the shared lib)
// =====================================================================================

// ---------- color ----------
const hx = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (a) => '#' + a.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => { const A = hx(a), B = hx(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
const tint = (c, t = 0.5) => mix(c, '#ffffff', t);
const shade = (c, t = 0.4) => toHex(hx(c).map((v) => v * (1 - t)));
const smooth = (x) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
function ramp(colors, u, blend = 1) {
  if (colors.length === 1) return colors[0];
  const n = colors.length - 1, x = Math.max(0, Math.min(0.9999, u)) * n, i = Math.floor(x), f = x - i;
  const g = blend >= 1 ? f : smooth((f - (1 - blend) / 2) / blend);
  return mix(colors[i], colors[i + 1], g);
}

// ---------- svg ----------
let uid = 0;
const nid = (p = 'n9') => `${p}${uid++}`;
const clipTo = (d, content) => { const id = nid('cl'); return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id})">${content}</g>`; };
const blur = (content, sd = 3) => { const id = nid('bl'); return `<defs><filter id="${id}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="${sd}"/></filter></defs><g filter="url(#${id})">${content}</g>`; };
const gstops = (stops) => stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a < 1 ? ` stop-opacity="${a}"` : ''}/>`).join('');
function linG(x1, y1, x2, y2, stops) {
  const id = nid('lg');
  return { def: `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}">${gstops(stops)}</linearGradient></defs>`, url: `url(#${id})` };
}
function radG(cx, cy, r, stops, { fx = cx, fy = cy } = {}) {
  const id = nid('rg');
  return { def: `<defs><radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" fx="${n1(fx)}" fy="${n1(fy)}">${gstops(stops)}</radialGradient></defs>`, url: `url(#${id})` };
}
// Gradient in the shape's own box (objectBoundingBox), top -> bottom by default.
function boxG(stops, { x1 = 0, y1 = 0, x2 = 0, y2 = 1 } = {}) {
  const id = nid('bg');
  return { def: `<defs><linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${gstops(stops)}</linearGradient></defs>`, url: `url(#${id})` };
}
// Fade content toward the edge of an ellipse (paint sponged softly into the skin).
function faded(content, cx, cy, rx, ry, inner = 0.55) {
  const id = nid('fm'), g = nid('fg');
  return `<defs><radialGradient id="${g}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${rx}" gradientTransform="translate(${cx} ${cy}) scale(1 ${n1(ry / rx)}) translate(${-cx} ${-cy})"><stop offset="${inner}" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`
    + `<mask id="${id}" maskUnits="userSpaceOnUse" x="${cx - rx - 10}" y="${cy - ry - 10}" width="${2 * rx + 20}" height="${2 * ry + 20}"><rect x="${cx - rx}" y="${cy - ry}" width="${2 * rx}" height="${2 * ry}" fill="url(#${g})"/></mask></defs><g mask="url(#${id})">${content}</g>`;
}
const ellD = (cx, cy, rx, ry) => { const k = 0.5523; return `M${cx + rx} ${cy}C${cx + rx} ${cy + ry * k} ${cx + rx * k} ${cy + ry} ${cx} ${cy + ry}C${cx - rx * k} ${cy + ry} ${cx - rx} ${cy + ry * k} ${cx - rx} ${cy}C${cx - rx} ${cy - ry * k} ${cx - rx * k} ${cy - ry} ${cx} ${cy - ry}C${cx + rx * k} ${cy - ry} ${cx + rx} ${cy - ry * k} ${cx + rx} ${cy}Z`; };
// Sponge texture: tiny light dots clipped to d.
function texture(d, [x, y, w, h], { seed = 3, color = '#ffffff', opacity = 0.25, density = 55 } = {}) {
  const rnd = rng(seed), o = [];
  for (let i = 0; i < Math.round((w * h) / density); i++) o.push(dot(x + rnd() * w, y + rnd() * h, 0.4 + rnd() * 1.0, color));
  return clipTo(d, `<g opacity="${opacity}">${o.join('')}</g>`);
}
// Soft sponged color patch: an ellipse of blended colors faded at the edges.
function patch(cx, cy, rx, ry, colors, { deg = 0, seed = 5, inner = 0.5, plateau = 0.7, opacity = 1, tex = true } = {}) {
  const [x1, y1] = pol(cx, cy, Math.max(rx, ry), deg + 180), [x2, y2] = pol(cx, cy, Math.max(rx, ry), deg);
  const st = []; for (let k = 0; k <= 20; k++) st.push([(k / 20).toFixed(3), ramp(colors, k / 20, plateau)]);
  const g = linG(x1, y1, x2, y2, st), d = ellD(cx, cy, rx, ry);
  return `<g${opacity < 1 ? ` opacity="${opacity}"` : ''}>${faded(g.def + `<path d="${d}" fill="${g.url}"/>` + (tex ? texture(d, [cx - rx, cy - ry, 2 * rx, 2 * ry], { seed }) : ''), cx, cy, rx, ry, inner)}</g>`;
}

// Mirror across the face center line.
const mirror = (c) => `<g transform="translate(400 0) scale(-1 1)">${c}</g>`;
const both = (c) => c + mirror(c);
const mpt = ([x, y]) => [400 - x, y];

// A face with paint under the features and extras on top.
const face = (under, skin = 'medium', over = '', { eyes = 'open', brows = true } = {}) => faceLayer({ under, over, skin, eyes, brows });

// Embed content in a framed box on a plain canvas.
const embed = (content, [vx, vy, vw, vh], x, y, w, h, { bg = '#fbf8f4', frame = true } = {}) =>
  (frame ? `<rect x="${x - 1}" y="${y - 1}" width="${w + 2}" height="${h + 2}" rx="8" fill="#fff" stroke="#e3ddd5"/>` : '')
  + `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${bg}"/>${content}</svg>`;

// Gray construction lines (light sketch).
const GUIDE = '#b9b2a8';
const guide = (pts, w = 1.3) => line(pts, { w, color: GUIDE, dash: '4 4' });
// Light sketch line in paint (what you actually paint first).
const sketch = (pts, color = '#e8c9a8', w = 1.6) => line(pts, { w, color });

// Eye area (left eye) as on the festival face map; mirror for the right.
export const EYE_ZONE = 'M112 226C126 199 172 197 188 226C172 250 126 252 112 226Z';
const eyeZones = (w = 1.6) => both(`<path d="${EYE_ZONE}" fill="none" stroke="#e03131" stroke-width="${w}" stroke-dasharray="4 4"/>`);

// ---------- stroke geometry (shaded tubes and split loads) ----------
function frameOf(pts, per = 20) {
  const c = spline(pts, per), acc = [0];
  for (let i = 1; i < c.length; i++) acc.push(acc[i - 1] + Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]));
  const T = acc[acc.length - 1] || 1;
  const nrm = c.map((_, i) => { const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; });
  return { c, nrm, t: acc.map((v) => v / T), len: T };
}
const edge = (fr, hw, f) => fr.c.map((p, i) => [p[0] + fr.nrm[i][0] * hw(fr.t[i]) * f, p[1] + fr.nrm[i][1] * hw(fr.t[i]) * f]);
// Stroke whose color changes across its width (left edge -> right edge of the travel direction).
function sliced(pts, W, profile, colors, { n = 26, plateau = 0.8 } = {}) {
  const fr = frameOf(pts), hw = (t) => (W / 2) * profile(t), o = [];
  for (let k = 0; k < n; k++) {
    const f0 = -1 + (2 * k) / n, f1 = Math.min(1, -1 + (2 * (k + 1.3)) / n);
    o.push(`<path d="${polyD([...edge(fr, hw, f0), ...edge(fr, hw, f1).reverse()], true)}" fill="${ramp(colors, (k + 0.5) / n, plateau)}"  data-s="1"/>`);
  }
  return o.join('');
}
const outlineOf = (pts, W, profile) => { const fr = frameOf(pts), hw = (t) => (W / 2) * profile(t); return polyD([...edge(fr, hw, -1), ...edge(fr, hw, 1).reverse()], true); };
const PROF = {
  horn: (t) => Math.max(0.04, (1 - t) ** 0.85),
  leaf: (t) => Math.max(0.05, Math.sin(Math.PI * Math.min(1, t)) ** 0.7),
  wave: (t) => Math.max(0.06, Math.min(1, t * 4 + 0.35) * (1 - t) ** 0.55),
  even: (t) => (t < 0.03 ? 0.8 + t * 6 : t > 0.97 ? 0.8 + (1 - t) * 6 : 1),
};

// Gold: a metallic gradient in user space across a box.
const GOLD_STOPS = [[0, '#fff3c4'], [0.3, '#f4cf5c'], [0.62, '#d39a24'], [1, '#8f5d12']];
const goldG = (x1, y1, x2, y2) => linG(x1, y1, x2, y2, GOLD_STOPS);

// ---------- jewels ----------
// A faceted gem with a soft shadow, a radial body, facets and a glint. shape: round | drop | oval | marquise.
export function jewel(cx, cy, r, color = '#2fb8e8', { shape = 'round', deg = -90, setting = false } = {}) {
  let d;
  if (shape === 'drop') {
    const tip = pol(cx, cy, r * 1.9, deg), a = pol(cx, cy, r, deg - 90), b = pol(cx, cy, r, deg + 90), bk = pol(cx, cy, r, deg + 180);
    const k = r * 0.56;
    const c1 = pol(a[0], a[1], k, deg + 180), c2 = pol(bk[0], bk[1], k, deg - 90), c3 = pol(bk[0], bk[1], k, deg + 90), c4 = pol(b[0], b[1], k, deg + 180);
    d = `M${n1(tip[0])} ${n1(tip[1])}Q${n1((a[0] + tip[0]) / 2 + (a[0] - cx) * 0.35)} ${n1((a[1] + tip[1]) / 2 + (a[1] - cy) * 0.35)} ${n1(a[0])} ${n1(a[1])}C${n1(c1[0])} ${n1(c1[1])} ${n1(c2[0])} ${n1(c2[1])} ${n1(bk[0])} ${n1(bk[1])}C${n1(c3[0])} ${n1(c3[1])} ${n1(c4[0])} ${n1(c4[1])} ${n1(b[0])} ${n1(b[1])}Q${n1((b[0] + tip[0]) / 2 + (b[0] - cx) * 0.35)} ${n1((b[1] + tip[1]) / 2 + (b[1] - cy) * 0.35)} ${n1(tip[0])} ${n1(tip[1])}Z`;
  } else if (shape === 'oval') {
    d = `${ellD(0, 0, r * 0.72, r * 1.15)}`;
    d = d.replace(/-?\d+(\.\d+)?(e-?\d+)? -?\d+(\.\d+)?(e-?\d+)?/g, (m) => { const [u, v] = m.split(' ').map(Number); const a = (deg + 90) * Math.PI / 180; return `${n1(cx + u * Math.cos(a) - v * Math.sin(a))} ${n1(cy + u * Math.sin(a) + v * Math.cos(a))}`; });
  } else if (shape === 'marquise') {
    const t1 = pol(cx, cy, r * 1.5, deg), t2 = pol(cx, cy, r * 1.5, deg + 180), a = pol(cx, cy, r * 1.1, deg - 90), b = pol(cx, cy, r * 1.1, deg + 90);
    d = `M${n1(t1[0])} ${n1(t1[1])}Q${n1(a[0])} ${n1(a[1])} ${n1(t2[0])} ${n1(t2[1])}Q${n1(b[0])} ${n1(b[1])} ${n1(t1[0])} ${n1(t1[1])}Z`;
  } else d = polyD(Array.from({ length: 10 }, (_, i) => pol(cx, cy, r, i * 36 + 18)), true);
  const body = radG(cx - r * 0.3, cy - r * 0.35, r * 1.6, [[0, tint(color, 0.75)], [0.35, tint(color, 0.15)], [0.7, color], [1, shade(color, 0.5)]]);
  const o = [];
  o.push(blur(`<path d="${d}" fill="#000" opacity="0.35" transform="translate(${n1(r * 0.12)} ${n1(r * 0.22)})"/>`, Math.max(0.8, r * 0.18)));
  if (setting) { const g = goldG(cx - r, cy - r, cx + r, cy + r); o.push(g.def + `<path d="${d}" fill="none" stroke="${g.url}" stroke-width="${n1(r * 0.42)}" stroke-linejoin="round"/>`); }
  o.push(body.def + `<path d="${d}" fill="${body.url}" stroke="${shade(color, 0.55)}" stroke-width="${n1(Math.max(0.6, r * 0.07))}" stroke-linejoin="round"/>`);
  // facets: a table and spokes (round), or a center line (others)
  if (shape === 'round') {
    const tb = Array.from({ length: 10 }, (_, i) => pol(cx, cy, r * 0.5, i * 36 + 18));
    o.push(`<path d="${polyD(tb, true)}" fill="#fff" fill-opacity="0.18" stroke="#fff" stroke-opacity="0.45" stroke-width="${n1(r * 0.05)}"/>`);
    o.push(tb.map((p, i) => { const q = pol(cx, cy, r, i * 36 + 18); return `<path d="M${n1(p[0])} ${n1(p[1])}L${n1(q[0])} ${n1(q[1])}" stroke="#fff" stroke-opacity="0.3" stroke-width="${n1(r * 0.04)}"/>`; }).join(''));
  } else {
    const a = pol(cx, cy, r * (shape === 'drop' ? 1.6 : 1.2), deg), b = pol(cx, cy, r * 0.9, deg + 180);
    o.push(`<path d="M${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}" stroke="#fff" stroke-opacity="0.35" stroke-width="${n1(r * 0.06)}"/>`);
  }
  o.push(`<ellipse cx="${n1(cx - r * 0.35)}" cy="${n1(cy - r * 0.38)}" rx="${n1(r * 0.28)}" ry="${n1(r * 0.16)}" fill="#fff" opacity="0.85" transform="rotate(-35 ${n1(cx - r * 0.35)} ${n1(cy - r * 0.38)})"/>`);
  o.push(dot(cx + r * 0.38, cy + r * 0.3, r * 0.08, '#fff'));
  return o.join('');
}
// Pearl: a white bead with soft shading.
export function pearl(cx, cy, r, { color = '#fbf6ee' } = {}) {
  const g = radG(cx - r * 0.35, cy - r * 0.4, r * 1.5, [[0, '#ffffff'], [0.45, color], [1, mix(color, '#9a8f84', 0.55)]]);
  return blur(`<circle cx="${n1(cx + r * 0.12)}" cy="${n1(cy + r * 0.2)}" r="${n1(r)}" fill="#000" opacity="0.25"/>`, Math.max(0.6, r * 0.15))
    + g.def + `<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" fill="${g.url}" stroke="#b9ab98" stroke-width="${n1(Math.max(0.4, r * 0.08))}"/>`
    + `<circle cx="${n1(cx - r * 0.35)}" cy="${n1(cy - r * 0.35)}" r="${n1(r * 0.25)}" fill="#fff"/>`;
}

// ---------- texture builders ----------
// Overlapping scales (rows of U shapes) clipped to region d. colorAt(x, y) gives each scale's color.
export function scales(d, [bx, by, bw, bh], { r = 9, colorAt = () => '#1fa88f', line = null, hi = true, seed = 4, dyK = 0.62 } = {}) {
  const rows = [], dy = r * dyK;
  for (let j = 0, y = by + bh; y > by - r * 1.4; j++, y -= dy) rows.push([y, j % 2 ? r : 0]);
  const o = [], cache = new Map();
  const grad = (c) => {
    if (!cache.has(c)) { const g = boxG([[0, shade(c, 0.45)], [0.55, c], [1, tint(c, 0.35)]]); cache.set(c, g); o.push(g.def); }
    return cache.get(c).url;
  };
  const shapes = [];
  for (const [y, off] of rows) {
    for (let x = bx - r * 2 + off; x < bx + bw + r * 2; x += r * 2) {
      const c = colorAt(x, y);
      const u = `M${n1(x - r)} ${n1(y)}C${n1(x - r)} ${n1(y + r * 1.33)} ${n1(x + r)} ${n1(y + r * 1.33)} ${n1(x + r)} ${n1(y)}Z`;
      shapes.push(`<path d="${u}" fill="${grad(c)}" stroke="${line ?? shade(c, 0.6)}" stroke-width="${n1(r * 0.12)}" stroke-linejoin="round"/>`);
      if (hi) shapes.push(`<path d="M${n1(x - r * 0.62)} ${n1(y + r * 0.45)}C${n1(x - r * 0.55)} ${n1(y + r * 0.95)} ${n1(x + r * 0.2)} ${n1(y + r * 1.02)} ${n1(x + r * 0.5)} ${n1(y + r * 0.7)}" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="${n1(r * 0.1)}" stroke-linecap="round"/>`);
    }
  }
  return clipTo(d, o.join('') + shapes.join(''));
}
// Lace edge along a curve: scallops bulging to the side `side` (1 or -1), with eyelet dots.
export function lace(pts, { n = 9, h = 7, color = WHITE, w = 1.6, fill = null, dotsIn = true, picot = true } = {}) {
  const fr = frameOf(pts, 30), o = [];
  const at = (t) => { let i = fr.t.findIndex((v) => v >= t); if (i < 0) i = fr.c.length - 1; return [fr.c[i], fr.nrm[i]]; };
  let path = '';
  for (let k = 0; k < n; k++) {
    const [a] = at(k / n), [b] = at((k + 1) / n), [m, nm] = at((k + 0.5) / n);
    const c = [m[0] + nm[0] * h * 2, m[1] + nm[1] * h * 2];
    path += `M${n1(a[0])} ${n1(a[1])}Q${n1(c[0])} ${n1(c[1])} ${n1(b[0])} ${n1(b[1])}`;
    if (fill) o.push(`<path d="M${n1(a[0])} ${n1(a[1])}Q${n1(c[0])} ${n1(c[1])} ${n1(b[0])} ${n1(b[1])}Z" fill="${fill}"/>`);
    if (dotsIn) o.push(dot(m[0] + nm[0] * h * 0.5, m[1] + nm[1] * h * 0.5, w * 0.9, color));
    if (picot) o.push(dot(m[0] + nm[0] * (h * 1.0 + w * 1.6), m[1] + nm[1] * (h * 1.0 + w * 1.6), w * 0.75, color));
  }
  o.push(`<path d="${path}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`);
  return o.join('');
}
// A leaf with a two-tone (split-load) body, a midrib and veins. Base (x, y), pointing deg.
export function leaf(x, y, deg, len, w, [c1, c2] = ['#1f7a3a', '#9be22e'], { veins = true, outline = null, bend = 0.12 } = {}) {
  const tip = pol(x, y, len, deg), m = pol(x, y, len * 0.5, deg), bm = pol(m[0], m[1], len * bend, deg + 90);
  const pts = [[x, y], [bm[0], bm[1]], tip];
  const prof = (t) => Math.max(0.04, Math.sin(Math.PI * Math.min(1, t)) ** 0.75 * (t < 0.15 ? 0.6 + t * 2.6 : 1));
  const o = [sliced(pts, w, prof, [c1, c1, c2])];
  const fr = frameOf(pts);
  if (outline) o.push(`<path d="${outlineOf(pts, w, prof)}" fill="none" stroke="${outline}" stroke-width="1.4" stroke-linejoin="round"/>`);
  if (veins) {
    o.push(`<path d="${polyD(fr.c.slice(0, Math.floor(fr.c.length * 0.92)))}" fill="none" stroke="#fff" stroke-opacity="0.6" stroke-width="${n1(Math.max(0.8, w * 0.06))}" stroke-linecap="round"/>`);
    for (const t of [0.25, 0.42, 0.58, 0.72]) {
      let i = fr.t.findIndex((v) => v >= t); const p = fr.c[i], nm = fr.nrm[i];
      const hw = (w / 2) * prof(t) * 0.75;
      for (const s of [-1, 1]) {
        const e = [p[0] + nm[0] * hw * s + (fr.c[Math.min(fr.c.length - 1, i + 6)][0] - p[0]) * 0.9, p[1] + nm[1] * hw * s + (fr.c[Math.min(fr.c.length - 1, i + 6)][1] - p[1]) * 0.9];
        o.push(`<path d="M${n1(p[0])} ${n1(p[1])}L${n1(e[0])} ${n1(e[1])}" stroke="#fff" stroke-opacity="0.4" stroke-width="${n1(Math.max(0.6, w * 0.035))}" stroke-linecap="round"/>`);
      }
    }
  }
  return o.join('');
}
// A feather: shaft from base (x, y) pointing deg; barbs; color from base to tip.
export function feather(x, y, deg, len, w, colors, { bend = 0.1, shaft = '#fff3c4', barbs = true } = {}) {
  const tip = pol(x, y, len, deg), m = pol(x, y, len * 0.55, deg), bm = pol(m[0], m[1], len * bend, deg + 90);
  const pts = [[x, y], bm, tip];
  const prof = (t) => Math.max(0.05, (t < 0.12 ? t / 0.12 * 0.55 : 0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, (t - 0.12) / 0.95)) ** 0.6) * (t > 0.8 ? Math.max(0.04, ((1 - t) / 0.2) ** 0.6) : 1));
  const fr = frameOf(pts), o = [];
  const st = colors.map((c, i) => [(i / (colors.length - 1)).toFixed(2), c]);
  const g = linG(x, y, tip[0], tip[1], st);
  const d = outlineOf(pts, w, prof);
  o.push(g.def + `<path d="${d}" fill="${g.url}"/>`);
  // darker edges for depth
  o.push(clipTo(d, `<path d="${d}" fill="none" stroke="${shade(colors[colors.length - 1], 0.45)}" stroke-opacity="0.55" stroke-width="${n1(w * 0.22)}"/>`));
  if (barbs) {
    const b = [];
    for (let t = 0.14; t < 0.94; t += 0.045) {
      let i = fr.t.findIndex((v) => v >= t); const p = fr.c[i], nm = fr.nrm[i];
      const hw = (w / 2) * prof(t);
      const fw = fr.c[Math.min(fr.c.length - 1, i + 5)];
      for (const s of [-1, 1]) {
        const e = [p[0] + nm[0] * hw * s * 0.95 + (fw[0] - p[0]) * 1.2, p[1] + nm[1] * hw * s * 0.95 + (fw[1] - p[1]) * 1.2];
        b.push(`M${n1(p[0])} ${n1(p[1])}L${n1(e[0])} ${n1(e[1])}`);
      }
    }
    o.push(clipTo(d, `<path d="${b.join('')}" stroke="#fff" stroke-opacity="0.35" stroke-width="${n1(Math.max(0.5, w * 0.03))}" stroke-linecap="round"/>`));
  }
  o.push(`<path d="${polyD(fr.c.slice(0, Math.floor(fr.c.length * 0.9)))}" fill="none" stroke="${shaft}" stroke-width="${n1(Math.max(0.8, w * 0.06))}" stroke-linecap="round"/>`);
  return o.join('');
}
// Filigree scroll: a tapered curl in gold (or any color), optional dark under-line for contrast.
function scroll(cx, cy, r, { turns = 1.1, startDeg = 0, dir = -1, lead = 20, w = 4, color = null, under = null, inner = 0.25 } = {}) {
  const pts = curlPts(cx, cy, r, { turns, startDeg, dir, lead, inner });
  return (under ? stroke(pts, { w: w + 2.2, color: under, kind: 'end' }) : '') + stroke(pts, { w, color: color ?? '#e1b43c', kind: 'end' });
}

// Paper card for diagrams.
const card = (x, y, w, h, fill = '#fff') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="#e3ddd5" stroke-width="2"/>`;
const chip = (cx, cy, r, color, name = null) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="${color === WHITE ? '#c9ced6' : 'rgba(0,0,0,0.18)'}" stroke-width="1.5"/>` + (name ? label(cx, cy + r + 18, name, { size: 13, color: SOFT, halo: false }) : '');
const good = (p) => ({ ...p, labelColor: OK });
const bad = (p) => ({ ...p, labelColor: BAD });

// =====================================================================================
// 09.1 From idea to face design — theme "Ocean queen" (skin: tan)
// =====================================================================================
const SEA = { teal: '#12b5a5', aqua: '#5fdcd0', blue: '#2563eb', deep: '#1f2f7a', purple: '#7b3fc4', violet: '#a77be0', pearl: '#fbf6ee', gold: '#e1b43c' };

// Wave crest: a thick band rising from the brow center and curling over at (cx, cy).
function waveBand(cx, cy, r, { lead = 52, w = 24, colors = [SEA.aqua, SEA.teal, SEA.blue], outline = BLACK, hi = true, flat = false, startDeg = 0, dir = -1, turns = 1.05, from = null, taperIn = false } = {}) {
  const pts = from ? [...from, ...curlPts(cx, cy, r, { turns, startDeg, dir, lead: 0, inner: 0.22 })] : curlPts(cx, cy, r, { turns, startDeg, dir, lead, inner: 0.22 });
  const prof = taperIn ? (t) => Math.max(0.06, Math.min(1, t * 3) ** 0.8 * (1 - t) ** 0.55 * 1.25) : PROF.wave;
  const d = outlineOf(pts, w, prof);
  const o = [];
  if (flat) o.push(`<path d="${d}" fill="${colors[1]}"/>`);
  else o.push(sliced(pts, w, prof, colors));
  if (outline) o.push(`<path d="${d}" fill="none" stroke="${outline}" stroke-width="2.2" stroke-linejoin="round"/>`);
  if (hi) { const fr = frameOf(pts); const e = edge(fr, (t) => (w / 2) * prof(t), dir < 0 ? -0.45 : 0.45); o.push(`<path d="${polyD(e.slice(Math.floor(e.length * 0.08), Math.floor(e.length * 0.7)))}" fill="none" stroke="#fff" stroke-opacity="0.85" stroke-width="2" stroke-linecap="round"/>`); }
  return o.join('');
}
// The chosen Ocean-queen design (thumbnail A): wave crown, temple scales, pearl line, gems.
// stage 1 sketch, 2 sponge, 3 waves + linework, 4 scales + pearls, 5 finish.
export function oceanQueen({ stage = 5, flat = false } = {}) {
  const o = [];
  const half = [];
  if (stage === 1) {
    const sk = [];
    sk.push(sketch([[196, 184], [182, 174], [170, 158], ...curlPts(148, 124, 21, { turns: 0.9, startDeg: 15, dir: -1, lead: 0, inner: 0.3 })]));
    sk.push(sketch([[156, 184], [136, 180], [122, 170], ...curlPts(106, 150, 13, { turns: 0.9, startDeg: 30, dir: -1, lead: 0, inner: 0.3 })]));
    sk.push(sketch([[122, 186], [108, 200], [100, 222], [104, 246]]));
    o.push(both(sk.join('')), sketch([[200, 176], [200, 92]]), sketch([[160, 176], [180, 182], [200, 184], [220, 182], [240, 176]]));
    return o.join('');
  }
  // sponge base: soft teal-purple glow behind the crown and on the temples
  if (stage >= 2 && !flat) {
    o.push(patch(200, 140, 110, 48, [SEA.aqua, SEA.teal, SEA.aqua], { deg: 0, inner: 0.3, opacity: 0.55, seed: 3 }));
    half.push(patch(106, 214, 26, 56, [SEA.violet, SEA.teal], { deg: 90, inner: 0.3, opacity: 0.6, seed: 6 }));
  }
  if (stage >= 4) {
    const region = 'M96 166C112 170 124 190 124 212C124 236 118 254 108 268C96 262 88 240 86 212C85 192 88 174 96 166Z';
    half.push(faded(scales(region, [84, 164, 42, 106], { r: 6, colorAt: (x, y) => ramp([SEA.aqua, SEA.teal, SEA.purple], (y - 166) / 104) }), 102, 216, 22, 56, 0.25));
  }
  if (stage >= 3) {
    half.push(waveBand(106, 150, 13, { w: 15, colors: [SEA.violet, SEA.purple, SEA.deep], flat, startDeg: 30, turns: 1.05, from: [[156, 184], [136, 180], [122, 170]] }));
    half.push(waveBand(148, 124, 21, { w: 24, flat, startDeg: 15, turns: 1.05, from: [[196, 184], [182, 174], [170, 158]] }));
  }
  o.push(both(half.join('')));
  if (stage >= 3) {
    // center crest: a tall teardrop flame of water on the center line
    const g = linG(200, 80, 200, 178, [[0, SEA.aqua], [0.5, SEA.teal], [1, SEA.blue]]);
    const cd = `M200 92C210 112 214 132 210 152C207 166 203 174 200 178C197 174 193 166 190 152C186 132 190 112 200 92Z`;
    o.push(flat ? `<path d="${cd}" fill="${SEA.teal}"/>` : g.def + `<path d="${cd}" fill="${g.url}"/>`);
    o.push(`<path d="${cd}" fill="none" stroke="${BLACK}" stroke-width="2.2"/>`);
    o.push(`<path d="M197 112C193 128 193 144 196 160" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.85"/>`);
  }
  if (stage >= 4) {
    // pearl string along the bottom of the crown, over the brows
    const pts = spline([[124, 168], [150, 172], [176, 180], [200, 184]], 10);
    const pr = [];
    for (let i = 0; i <= 8; i++) { const p = pts[Math.round(i * (pts.length - 1) / 8)]; pr.push(flat ? dot(p[0], p[1], 3.4 - i * 0.12, WHITE) + `<circle cx="${n1(p[0])}" cy="${n1(p[1])}" r="${n1(3.4 - i * 0.12)}" fill="none" stroke="#9aa1ab" stroke-width="0.8"/>` : pearl(p[0], p[1], 3.6 - i * 0.12)); }
    o.push(both(pr.join('')));
  }
  if (stage >= 5) {
    o.push(both(dots([[128, 96], [112, 110], [100, 128]], 4, 3, 1.6, WHITE) + dot(118, 142, 2, SEA.gold) + dot(156, 92, 2.4, SEA.gold) + dot(166, 82, 1.6, WHITE)));
    o.push(flat ? dot(200, 192, 5, SEA.gold) : jewel(200, 192, 6, '#2fd0e8', { shape: 'drop', deg: 90, setting: true }));
    if (!flat) o.push(both(jewel(148, 126, 4.2, '#a77be0') + jewel(106, 151, 3, '#5fdcd0')));
    else o.push(both(dot(148, 126, 4, SEA.violet)));
  }
  return o.join('');
}
// Thumbnail B: one-sided shell and waves; C: busy scattered motifs.
function oceanB({ flat = true } = {}) {
  const o = [];
  // big shell fan on the left temple
  const cx = 132, cy = 158;
  for (let i = 0; i < 7; i++) { const a = 200 + i * 24; o.push(petal(cx, cy, a, 54, 20, i % 2 ? SEA.violet : SEA.purple, { round: true })); }
  for (let i = 0; i < 7; i++) { const a = 200 + i * 24; o.push(line([[cx, cy], pol(cx, cy, 46, a)], { w: 1.6, color: BLACK })); }
  o.push(dot(cx, cy, 7, SEA.gold));
  o.push(waveBand(122, 268, 13, { w: 17, flat, startDeg: 10, dir: -1, taperIn: true, from: [[180, 300], [160, 296], [142, 284]] }));
  o.push(waveBand(136, 312, 10, { w: 13, flat, startDeg: 10, dir: -1, taperIn: true, colors: [SEA.violet, SEA.purple, SEA.deep], from: [[184, 336], [168, 332], [152, 324]] }));
  o.push(dots([[104, 206], [102, 226], [108, 244]], 4, 3, 2, SEA.teal), dot(182, 150, 3, SEA.gold), dot(176, 136, 2, SEA.gold));
  return o.join('');
}
function oceanC() {
  const o = [], r = rng(11);
  const spots = [[150, 110], [250, 110], [200, 140], [120, 160], [280, 160], [160, 290], [240, 290], [110, 270], [290, 270], [200, 96], [130, 320], [270, 320], [175, 395], [225, 395], [200, 170]];
  spots.forEach(([x, y], i) => {
    const k = i % 4;
    if (k === 0) o.push(star(x, y, 9, SEA.gold, { outline: BLACK, ow: 1 }));
    else if (k === 1) for (let j = 0; j < 5; j++) o.push(petal(x, y + 4, 230 + j * 20, 14, 7, SEA.violet));
    else if (k === 2) o.push(`<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="${SEA.teal}" stroke-width="2"/>`);
    else o.push(stroke([[x - 10, y], [x - 3, y - 6], [x + 4, y], [x + 11, y - 6]], { w: 4, color: SEA.blue }));
    o.push(dot(x + (r() - 0.5) * 30, y + 14 + r() * 8, 2.4, WHITE));
  });
  return o.join('');
}

{
  // From one idea to simple shapes (paper).
  const o = [];
  o.push(card(20, 20, 200, 470, '#f1fbfa'));
  o.push(label(120, 62, 'Theme', { size: 15, color: SOFT, halo: false }));
  o.push(label(120, 98, 'Ocean queen', { size: 22, bold: true, halo: false }));
  // little crown icon under the theme
  o.push(`<svg x="55" y="120" width="130" height="90" viewBox="90 70 220 140">${oceanQueen({ stage: 5, flat: true })}</svg>`);
  
  o.push(label(120, 236, 'Palette (03.5)', { size: 14, color: SOFT, halo: false }));
  [[SEA.teal, 'main'], [SEA.purple, 'second'], [SEA.gold, 'accent']].forEach(([c, n], i) => o.push(chip(62 + i * 58, 272, 17, c, n)));
  o.push(label(120, 350, 'Mood', { size: 14, color: SOFT, halo: false }));
  o.push(label(120, 376, 'calm, royal,', { size: 15, halo: false }));
  o.push(label(120, 398, 'shiny, cool', { size: 15, halo: false }));
  o.push(arrow([[226, 255], [262, 255]], { color: '#c2b8ab', width: 3 }));
  // feature rows: picture -> simple shape
  o.push(card(270, 20, 560, 470));
  o.push(label(410, 52, 'Key features', { size: 15, bold: true, halo: false }));
  o.push(label(690, 52, 'Simple shapes', { size: 15, bold: true, halo: false }));
  const rows = [
    ['Waves', `<path d="M-60 10C-40 -14 -20 -14 0 6C14 20 28 18 36 4C30 -10 16 -8 18 4" fill="none" stroke="${SEA.blue}" stroke-width="5" stroke-linecap="round"/><path d="M-60 22C-40 2 -20 2 0 20C20 36 46 30 60 10" fill="none" stroke="${SEA.teal}" stroke-width="3" stroke-linecap="round"/>`,
      waveBand(14, -6, 16, { w: 20, startDeg: 10, dir: -1, taperIn: true, from: [[-46, 26], [-22, 20], [2, 6]] }), 'one curl'],
    ['Shell', (() => { let s = ''; for (let i = 0; i < 9; i++) s += line([[0, 22], pol(0, 22, 40, 200 + i * 17.5)], { w: 1.5, color: '#a0785a' }); return `<path d="M-40 12C-38 -20 38 -20 40 12L0 22Z" fill="#f6d7c3" stroke="#a0785a" stroke-width="2"/>` + s; })(),
      (() => { let s = ''; for (let i = 0; i < 5; i++) s += teardrop(...pol(0, 24, 34, 216 + i * 27), 216 + i * 27 + 180, 30, 14, i % 2 ? SEA.violet : SEA.purple); return s + dot(0, 24, 5, SEA.gold); })(), 'teardrop fan'],
    ['Scales', (() => { let s = ''; for (let j = 0; j < 3; j++) for (let i = 0; i < 5; i++) s += `<path d="M${-44 + i * 20 + (j % 2) * 10} ${-14 + j * 12}c0 12 18 12 18 0" fill="none" stroke="${SEA.teal}" stroke-width="2"/>`; return s; })(),
      scales('M-44 -20H44V22H-44Z', [-44, -20, 88, 42], { r: 9, colorAt: (x) => ramp([SEA.aqua, SEA.teal, SEA.purple], (x + 44) / 88) }), 'U rows'],
    ['Pearls', `<path d="M-50 -6C-20 14 20 14 50 -6" fill="none" stroke="#d8cbb8" stroke-width="1.5"/>` + [-40, -20, 0, 20, 40].map((x, i) => pearl(x, -2 + Math.abs(x) * -0.0 + (i === 2 ? 10 : i % 4 === 0 ? 0 : 7), 7)).join(''),
      [-36, -18, 0, 18, 36].map((x, i) => dot(x, 4 + [0, 6, 8, 6, 0][i], 6 - Math.abs(x) * 0.06, WHITE) + `<circle cx="${x}" cy="${4 + [0, 6, 8, 6, 0][i]}" r="${6 - Math.abs(x) * 0.06}" fill="none" stroke="#9aa1ab" stroke-width="1"/>`).join(''), 'white dots'],
  ];
  rows.forEach(([name, pic, shape, how], i) => {
    const y = 120 + i * 98;
    if (i) o.push(`<path d="M290 ${y - 52}H810" stroke="#efe9e1" stroke-width="1.5"/>`);
    o.push(label(330, y + 6, name, { size: 15, bold: true, halo: false }));
    o.push(`<g transform="translate(445 ${y})">${pic}</g>`);
    o.push(arrow([[530, y], [586, y]], { color: '#c2b8ab', width: 3 }));
    o.push(`<g transform="translate(660 ${y})">${shape}</g>`);
    o.push(label(770, y + 6, how, { size: 13, color: SOFT, halo: false, anchor: 'middle' }));
  });
  plain('m09-l01-idea', 'From one idea to simple shapes. Left: the theme card, Ocean queen, with a palette from lesson 03.5, teal as the main color, purple as the second and gold as the accent, and three mood words: calm, royal, shiny and cool. Right: four key features of the theme and the simple face-paint shape each one becomes. Waves become one thick curl. A shell becomes a fan of teardrops. Scales become rows of U shapes. Pearls become white dots.', 850, 510, o.join(''));
}

{
  // Three thumbnails of the same idea on small face outlines.
  const view = [60, 60, 280, 380];
  const T = (under) => faceLayer({ under, skin: 'paper', template: false, lips: false }).replace(/fill="#ffffff"/, 'fill="#ffffff"');
  strip('m09-l01-thumbnails', 'Three quick thumbnails of the same idea, Ocean queen, painted on small face outlines in the same palette. A: a crown of curling waves on the forehead with a tall crest in the center, a pearl line over the brows and scales on the temples. B: one-sided: a big purple shell fan on the left temple with two waves curling down the cheek. C: many small motifs scattered over the whole face: stars, tiny shells, bubbles and little waves.', [
    { content: T(oceanQueen({ stage: 5, flat: true })), view, label: 'A', caption: 'Wave crown', labelColor: ACCENT },
    { content: T(oceanB()), view, label: 'B', caption: 'One side', labelColor: ACCENT },
    { content: T(oceanC()), view, label: 'C', caption: 'Scattered motifs', labelColor: ACCENT },
  ].map((p) => ({ ...p, bg: '#ffffff' })), { pw: 210, gap: 40, arrows: false });
}

{
  // The one-second read: the thumbnails seen small and soft, as from across a room.
  const o = [];
  const view = [60, 60, 280, 380];
  const designs = [oceanQueen({ stage: 5, flat: true }), oceanB(), oceanC()];
  const verdict = ['Clear: chosen', 'Clear', 'Reads as spots'];
  designs.forEach((d, i) => {
    const x = 20 + i * 250;
    o.push(card(x, 20, 230, 300));
    o.push(label(x + 20, 52, String.fromCharCode(65 + i), { size: 18, bold: true, color: ACCENT, halo: false, anchor: 'start' }));
    o.push(`<svg x="${x + 75}" y="${70}" width="80" height="108" viewBox="${view.join(' ')}">${blur(faceLayer({ under: d, skin: 'tan', lips: false }), 3)}</svg>`);
    o.push(label(x + 115, 210, '3 meters away', { size: 13, color: SOFT, halo: false }));
    o.push(i === 2 ? cross(x + 115, 250, 22) : tick(x + 115, 252, 22));
    o.push(label(x + 115, 296, verdict[i], { size: 15, bold: true, color: i === 2 ? BAD : OK, halo: false }));
  });
  plain('m09-l01-distance', 'The one-second read: the three thumbnails shown small and soft, as if seen from about three meters away on tan skin. A, the wave crown, still reads as one clear shape and is chosen. B, the one-sided shell and waves, also reads clearly. C, the scattered small motifs, turns into random colored spots.', 770, 340, o.join(''));
}

{
  // The chosen thumbnail placed on the face map, with the plan beside it.
  const o = [];
  o.push(card(20, 20, 1080, 560));
  const view = [50, 60, 300, 380];
  const map = faceSVG({ template: true, centre: true }) + `<g opacity="0.9">${oceanQueen({ stage: 5, flat: true })}</g>` + eyeZones(1.4);
  const nums = [[244, 96, '1'], [70, 214, '2'], [160, 192, '3'], [228, 190, '4']];
  o.push(`<svg x="40" y="40" width="420" height="532" viewBox="${view.join(' ')}"><rect x="50" y="60" width="300" height="380" fill="#fff"/>${map}${nums.map(([x, y, t]) => badge(x, y, t, { color: INK, r: 10 })).join('')}</svg>`);
  const X = 520;
  o.push(label(X, 76, 'Ocean queen: design plan', { size: 20, bold: true, anchor: 'start', halo: false }));
  o.push(label(X, 116, 'Palette', { size: 16, bold: true, anchor: 'start', halo: false }));
  [[SEA.teal, 'main'], [SEA.purple, 'second'], [SEA.gold, 'accent'], [BLACK, 'lines'], [WHITE, 'details']].forEach(([c, n], i) => o.push(chip(X + 26 + i * 84, 150, 22, c, n)));
  o.push(label(X, 222, 'Parts', { size: 16, bold: true, anchor: 'start', halo: false }));
  ['Wave crown and center crest (star zone)', 'Scales on the temples', 'Pearl line over the brows', 'Gems: center and wave curls (last)'].forEach((t, i) => {
    o.push(badge(X + 12, 252 + i * 34, String(i + 1), { color: INK, r: 11 }));
    o.push(label(X + 34, 257 + i * 34, t, { size: 15, anchor: 'start', halo: false }));
  });
  o.push(label(X, 410, 'Order', { size: 16, bold: true, anchor: 'start', halo: false }));
  ['Sketch', 'Sponge', 'Waves', 'Lines', 'Scales', 'Dots', 'Gems'].forEach((t, i) => {
    const x = X + i * 78;
    o.push(`<rect x="${x}" y="428" width="70" height="34" rx="8" fill="${['#e9ecef', '#d6f3ef', '#bfeee8', '#c7cbd3', '#e2d6f6', '#f3f0ea', '#f6e3b0'][i]}"/>`);
    o.push(label(x + 35, 451, t, { size: 13, halo: false }));
  });
  o.push(label(X, 506, 'Center on the center line; mirror both sides.', { size: 15, color: SOFT, anchor: 'start', halo: false }));
  o.push(label(X, 534, 'Red dashes: eye area. Eye-safe products only.', { size: 15, color: '#e03131', anchor: 'start', halo: false }));
  plain('m09-l01-plan', 'The chosen wave crown placed on the face map with its plan. On the face map: the center crest on the center line of the forehead and the wave crown curling out toward the temples (part 1), scales on the temples (part 2), a pearl line over the brows (part 3) and a gem between the brows (part 4), with the eye area marked in red dashes. The plan lists the palette: teal main, purple second, gold accent, black lines, white details; the four parts; and the order: sketch, sponge, waves, lines, scales, dots, gems.', 1120, 600, o.join(''));
}

{
  // Ocean queen on the face, step by step (tan skin).
  const view = [50, 50, 300, 300];
  const F = (stage) => ({ content: face(oceanQueen({ stage }), 'tan'), view });
  strip('m09-l01-steps', 'The Ocean queen design painted on tan skin, in five pictures. 1: a light sketch of the center line, the wave curls and the brow line. 2: a soft sponge glow of teal and lilac across the forehead and purple-teal on the temples. 3: the waves: a tall teal crest in the center and a big curling wave and a small purple wave on each side, with thin black outlines and white shine lines. 4: scales on the temples, fading into the skin, and a line of pearls over each brow. Done: white and gold dots, gems in the wave curls and a teardrop gem between the brows.', [
    { ...F(1), label: '1', caption: 'Sketch' },
    { ...F(2), label: '2', caption: 'Sponge glow' },
    { ...F(3), label: '3', caption: 'Waves, lines' },
    { ...F(4), label: '4', caption: 'Scales, pearls' },
    { ...F(5), label: 'Done', caption: 'Dots and gems' },
  ], { pw: 200, gap: 30 });
}

// =====================================================================================
// 09.2 Decorative masks (skin: deep) — shared mask machinery, also used by P11
// =====================================================================================

// Left half of a mask outline: start on the center line at the top, cubic segments down to the
// center line at the bottom. halfToD() mirrors it into one closed outline.
const halfToD = (p0, segs) => {
  const pts = [p0, ...segs.map((s) => s[2])];
  let d = `M${p0[0]} ${p0[1]}`;
  for (const [c1, c2, p] of segs) d += `C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p[0]} ${p[1]}`;
  for (let i = segs.length - 1; i >= 0; i--) {
    const [c1, c2] = segs[i], p = pts[i];
    d += `C${400 - c2[0]} ${c2[1]} ${400 - c1[0]} ${c1[1]} ${400 - p[0]} ${p[1]}`;
  }
  return d + 'Z';
};
// Mask shapes (left halves). All leave a wide almond of bare skin around each eye.
export const MASKS = {
  colombina: { p0: [200, 196], segs: [[[190, 182], [170, 172], [148, 174]], [[128, 176], [114, 170], [102, 150]], [[100, 176], [96, 206], [101, 232]], [[106, 256], [128, 270], [152, 268]], [[174, 266], [190, 254], [200, 244]]] },
  cat: { p0: [200, 200], segs: [[[188, 190], [160, 182], [136, 186]], [[118, 188], [102, 180], [88, 164]], [[90, 194], [96, 222], [104, 238]], [[114, 258], [134, 266], [156, 264]], [[176, 262], [190, 252], [200, 246]]] },
  butterfly: { p0: [200, 204], segs: [[[192, 168], [164, 140], [128, 140]], [[100, 140], [86, 164], [94, 190]], [[78, 206], [82, 238], [100, 252]], [[116, 268], [140, 276], [160, 268]], [[180, 260], [192, 252], [200, 246]]] },
  venetian: { p0: [200, 186], segs: [[[188, 170], [164, 160], [144, 162]], [[126, 164], [118, 150], [122, 120]], [[108, 136], [98, 156], [98, 180]], [[88, 196], [94, 226], [102, 244]], [[112, 266], [134, 274], [156, 270]], [[178, 266], [192, 254], [200, 246]]] },
};
export const HOLE_L = 'M112 226C124 199 176 197 190 224C178 251 124 253 112 226Z';
const HOLE_R = 'M288 226C276 199 224 197 210 224C222 251 276 253 288 226Z';
export const maskD = (name) => { const m = MASKS[name]; return halfToD(m.p0, m.segs); };
const maskWithHoles = (name) => `${maskD(name)}${HOLE_L}${HOLE_R}`;
// Lower edge of the left half (outer -> center) for lace.
const lowerEdge = (name) => {
  const segs = MASKS[name].segs, pts = [];
  const start = segs.length - 2; let p = segs[start - 1][2];
  for (let k = start; k < segs.length; k++) {
    const [c1, c2, q] = segs[k];
    for (let i = 0; i <= 12; i++) { const t = i / 12, u = 1 - t; pts.push([u ** 3 * p[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t ** 3 * q[0], u ** 3 * p[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t ** 3 * q[1]]); }
    p = q;
  }
  return pts.filter((_, i) => i % 3 === 0);
};

// S-scroll between two curls (filigree): A curls one way, B the other.
export function sScrollPts([ax, ay], [bx, by], ra, rb, { startA = 90, startB = -90, dirA = 1, dirB = 1, turnsA = 0.9, turnsB = 0.9, mid = [] } = {}) {
  const a = curlPts(ax, ay, ra, { turns: turnsA, startDeg: startA, dir: dirA, lead: 0, inner: 0.3 }).reverse();
  const b = curlPts(bx, by, rb, { turns: turnsB, startDeg: startB, dir: dirB, lead: 0, inner: 0.3 });
  return [...a, ...mid, ...b];
}
const fil = (pts, w, color, kind = 'both') => stroke(pts, { w, color, kind });

// Filigree for the left half of a mask: scrolls on the brow band and the flare, drops and dots.
function maskFiligree(name, color, { w = 2.8, under = null } = {}) {
  const V = (lead, cx, cy, r, startDeg, dir, turns = 1.15) => [...lead, ...curlPts(cx, cy, r, { turns, startDeg, dir, lead: 0, inner: 0.28 })];
  const parts = [
    // brow band: a vine from the center to the temple, ending in a downward curl
    [V([[197, 199], [182, 191], [162, 186], [140, 185]], 122, 194, 8, -90, -1), w],
    // small curls branching up from the vine
    [V([[176, 189], [170, 183]], 165, 178, 4.2, 0, -1), w * 0.8],
    [V([[150, 185], [143, 179]], 138, 175, 3.8, 0, -1), w * 0.75],
    // flare: a curl rising toward the temple tip
    [V([[114, 202], [108, 186], [108, 172]], 114, 166, 4.5, 180, 1), w * 0.85],
    // cheek band: a vine from the nose bridge out, curling up by the outer corner
    [V([[196, 250], [180, 258], [156, 262], [134, 258]], 120, 248, 7, 90, 1), w],
    [V([[166, 261], [160, 268]], 152, 269, 3.2, 0, 1), w * 0.7],
    // outer edge: a short line joining the two curls
    [[[106, 208], [103, 222], [106, 236]], w * 0.7],
  ];
  const o = [];
  if (under) for (const [p, ww] of parts) o.push(stroke(p, { w: ww + 1.8, color: under, kind: 'end' }));
  for (const [p, ww] of parts) o.push(stroke(p, { w: ww, color, kind: 'end' }));
  o.push(teardrop(156, 194, 20, 7, 3.2, color), teardrop(182, 198, 160, 5, 2.6, color), teardrop(172, 252, -20, 6, 3, color));
  o.push(dots([[130, 186], [124, 182], [118, 180]], 3, 1.4, 0.9, color), dot(200, 186, 1.8, color), dot(200, 258, 1.6, color));
  return o.join('');
}

/**
 * The decorative mask, stage by stage. Returns { under, over }.
 *  1 sketch, 2 base color, 3 3D shading, 4 outline + lace, 5 filigree, 6 gems and highlights.
 *  pal: { top, mid, bottom, edge, fil, lace, gem, gem2 }
 */
export function decoMask({ name = 'colombina', stage = 6, pal = {}, flat = false, feathers = false, laceOn = true, gems = true } = {}) {
  const c = { top: '#1fb39a', mid: '#0e7f78', bottom: '#0a4d5c', edge: BLACK, fil: null, lace: WHITE, gem: '#2fd0e8', gem2: '#e4258e', ...pal };
  const D = maskWithHoles(name), outer = maskD(name);
  const o = [];
  if (stage === 1) {
    o.push(`<path d="${outer}" fill="none" stroke="${tint(c.mid, 0.45)}" stroke-width="1.8" stroke-dasharray="5 4"/>`);
    o.push(`<path d="${HOLE_L}${HOLE_R}" fill="none" stroke="${tint(c.mid, 0.45)}" stroke-width="1.8" stroke-dasharray="5 4"/>`);
    o.push(dot(200, MASKS[name].p0[1], 3, tint(c.mid, 0.3)), both(dot(...MASKS[name].segs[1][2], 3, tint(c.mid, 0.3))));
    return { under: o.join(''), over: '' };
  }
  if (stage >= 3 && !flat) o.push(blur(`<path d="${D}" fill="#000" fill-rule="evenodd" opacity="0.38" transform="translate(0 5)"/>`, 4));
  if (feathers && stage >= 4) o.push(featherPlume(c));
  const g = linG(200, 140, 200, 275, [[0, c.top], [0.5, c.mid], [1, c.bottom]]);
  o.push(g.def + `<path d="${D}" fill="${flat ? c.mid : g.url}" fill-rule="evenodd"/>`);
  if (!flat) o.push(texture(D, [80, 110, 240, 170], { seed: 9, opacity: 0.18 }));
  if (stage >= 3 && !flat) {
    o.push(clipTo(D, blur(`<path d="${D}" fill="none" stroke="${shade(c.bottom, 0.5)}" stroke-width="12" opacity="0.75"/>`, 4)));
    o.push(clipTo(D, blur(both(`<path d="M190 196C172 184 140 180 116 186" fill="none" stroke="#fff" stroke-width="7" opacity="0.55" stroke-linecap="round"/><path d="M118 250C134 262 160 262 180 254" fill="none" stroke="#fff" stroke-width="5" opacity="0.35" stroke-linecap="round"/>`), 3.5)));
  }
  if (stage >= 4) {
    if (laceOn) o.push(both(lace(lowerEdge(name), { n: 8, h: 5.5, color: c.lace, w: 1.5, fill: flat ? null : (c.lace === WHITE ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.12)') })));
    o.push(`<path d="${D}" fill="none" stroke="${c.edge}" stroke-width="2.4" stroke-linejoin="round"/>`);
  }
  if (stage >= 5) {
    const gg = goldG(90, 140, 210, 270);
    const filCol = c.fil ?? gg.url;
    o.push(gg.def + both(maskFiligree(name, filCol, { under: flat ? null : 'rgba(0,0,0,0.45)' })));
  }
  const over = [];
  if (stage >= 6) {
    o.push(both(dot(124, 194, 1.5, '#fff') + dot(176, 252, 1.4, '#fff') + sparkle(108, 176, 4.2, '#fff')));
    if (gems) {
      const [tx, ty] = MASKS[name].segs[1][2], cy = MASKS[name].p0[1];
      over.push(flat ? dot(200, cy - 12, 5, c.gem) : jewel(200, cy - 12, 6.2, c.gem, { shape: 'drop', deg: 90, setting: true }));
      over.push(both(flat ? dot(tx + 4, ty + 6, 4, c.gem2) : jewel(tx + 4, ty + 7, 4.4, c.gem2, { setting: true })));
      if (!flat) over.push(both(pearl(180, cy - 8, 2.2) + pearl(166, cy - 15, 1.8)));
    }
  }
  return { under: o.join(''), over: over.join('') };
}
// A painted feather plume rising from the left temple (P11).
function featherPlume(c) {
  const o = [];
  const F = [[106, 146, -66, 76, 24, -0.06], [108, 148, -44, 96, 26, -0.08], [110, 152, -24, 84, 24, -0.1]];
  for (const [x, y, deg, len, w, bend] of F) o.push(feather(x, y, deg, len, w, [c.mid, c.top, tint(c.top, 0.35), tint(c.top, 0.6)], { bend, shaft: '#f4cf5c' }));
  return o.join('');
}

{
  // Four mask shapes, every one leaving a wide ring of bare skin around the eyes.
  const view = [70, 98, 260, 196];
  const shapes = [['colombina', 'Classic', 'fair', { top: '#ef5da8', mid: '#c2185b', bottom: '#7a0f3d' }], ['cat', 'Cat-eye', 'brown', { top: '#4c6ef5', mid: '#2b3fa8', bottom: '#151d5c' }], ['butterfly', 'Butterfly', 'medium', { top: '#ffd43b', mid: '#f08c00', bottom: '#c2410c' }], ['venetian', 'Swept-up', 'deep', { top: '#b197fc', mid: '#7048e8', bottom: '#3b1d8f' }]];
  strip('m09-l02-shapes', 'Four mask shapes, each with gold filigree and a wide almond of bare skin around both eyes. Classic, on fair skin: a pink mask that rises to a point at each temple. Cat-eye, on brown skin: a blue mask with long sharp points flicking out past the brows. Butterfly, on medium skin: an orange and yellow mask with rounded upper wings above the brows. Swept-up, on deep skin: a purple mask whose outer corners sweep up high above the brows like flames.', shapes.map(([n, cap, skin, pal]) => {
    const m = decoMask({ name: n, stage: 6, pal, gems: false });
    return { content: face(m.under, skin, m.over, { brows: false }), view, label: ' ', caption: cap };
  }), { pw: 230, gap: 24, arrows: false });
}

{
  // Filigree on paper, step by step: C-scroll, S-scroll, add drops and dots, mirror, in gold.
  const view = [0, 0, 220, 170];
  const C1 = [[40, 132], [66, 128], [92, 112], ...curlPts(118, 82, 30, { turns: 1.1, startDeg: 150, dir: 1, lead: 0, inner: 0.25 })];
  const S1 = sScrollPts([62, 100], [158, 84], 20, 24, { startA: -90, startB: 90, dirA: -1, dirB: -1, turnsA: 1, turnsB: 1, mid: [[96, 76], [124, 110]] });
  const extra = (col) => teardrop(104, 70, -70, 20, 9, col) + teardrop(118, 120, 110, 18, 8, col) + dots([[146, 132], [162, 138], [178, 136]], 3, 4.2, 2.2, col);
  const motif = (col, w = 6) => fil(S1, w, col) + extra(col);
  const gg = goldG(0, 20, 220, 150);
  const swatch = `<rect x="6" y="6" width="208" height="158" rx="10" fill="#4a2a7a"/>` + gg.def;
  const half = (inner) => `<g transform="translate(110 0) scale(0.52) translate(-38 70)">${inner}</g><g transform="translate(110 0) scale(-0.52 0.52) translate(-38 70)">${inner}</g>`;
  strip('m09-l02-filigree', 'Filigree with a liner brush, on paper, in five pictures. 1: a C-scroll: one smooth line that curls into a tight spiral, thin, then thicker, then thin. 2: an S-scroll: two curls joined by one curve, turning opposite ways. 3: add a teardrop on each side of the S and a line of three dots that get smaller. 4: paint the same motif mirrored on the other side, so the two touch in the middle. Done: the mirrored motif in gold on a purple swatch, with a dark line under the gold.', [
    { content: fil(C1, 7, BLACK), view, label: '1', caption: 'C-scroll' },
    { content: fil(S1, 7, BLACK), view, label: '2', caption: 'S-scroll' },
    { content: motif(BLACK, 7), view, label: '3', caption: 'Drops and dots' },
    { content: half(motif(BLACK, 8)), view, label: '4', caption: 'Mirror it' },
    { content: swatch + half(fil(S1, 11, 'rgba(0,0,0,0.5)') + motif(gg.url, 8)), view, label: 'Done', caption: 'Gold on color' },
  ].map((p) => ({ ...p, bg: '#ffffff' })), { pw: 190, gap: 30 });
}

{
  // The emerald masquerade mask on deep skin, step by step.
  const view = [60, 100, 280, 220];
  const S = (stage) => { const m = decoMask({ stage }); return { content: face(m.under, 'deep', m.over, { brows: stage < 2 }), view }; };
  strip('m09-l02-mask-steps', 'An emerald masquerade mask on deep skin, in six pictures. 1: a light sketch: dots at the center and the two temple tips, the outline, and a wide almond around each eye. 2: the base: eye-safe green sponged inside the outline, lighter at the top and darker at the bottom, nothing inside the almonds. 3: 3D shading: darker green along every edge, a light band over each brow and on the cheek curve, and a soft shadow under the mask. 4: a black outline and a white lace edge of small scallops with dots along the lower edge. 5: gold filigree scrolls, teardrops and dots. Done: white highlight dots and sparkles, a teardrop gem above the center and gems at the temple tips, all well away from the eyes.', [
    { ...S(1), label: '1', caption: 'Sketch' },
    { ...S(2), label: '2', caption: 'Base color' },
    { ...S(3), label: '3', caption: '3D shading' },
    { ...S(4), label: '4', caption: 'Outline, lace' },
    { ...S(5), label: '5', caption: 'Filigree' },
    { ...S(6), label: 'Done', caption: 'Gems, shine' },
  ], { pw: 230, gap: 30, cols: 3 });
}

{
  // Eye-area mistakes next to a safe mask (close-up of the left eye).
  const view = [80, 150, 140, 130];
  const safe = decoMask({ stage: 6 });
  const noHole = `<path d="${maskD('colombina')}" fill="#0e7f78"/>`;
  const lashGems = jewel(132, 214, 3.4, '#e4258e') + jewel(150, 210, 3.6, '#2fd0e8') + jewel(168, 213, 3.4, '#e4258e') + glitter('M118 222C130 206 170 205 182 222C170 214 130 214 118 222Z', [116, 200, 70, 26], { n: 70, seed: 3 });
  const blobby = decoMask({ stage: 4 }).under + both(fil(sScrollPts([186, 192], [160, 186], 4, 6), 8, '#e1b43c') + fil(curlPts(110, 178, 6, { turns: 1, startDeg: 200, dir: 1, lead: 18, inner: 0.3 }), 9, '#e1b43c') + dot(130, 200, 6, '#e1b43c') + dot(150, 258, 6, '#e1b43c'));
  strip('m09-l02-mistakes', 'A close-up of the left eye: a safe mask and three mistakes. Good: a wide almond of bare skin around the eye, fine filigree, and the gems far away at the temple. Avoid: paint right up to the lashes with no eye hole. Avoid: gems and glitter on the eyelid near the lashes. Avoid: thick, blobby gold lines and big dots that look clumsy instead of lacy.', [
    good({ content: face(safe.under, 'deep', safe.over, { brows: false }), view, label: 'Good', caption: 'Gap around the eye' }),
    bad({ content: face(noHole, 'deep', '', { brows: false }), view, label: 'Avoid', caption: 'Paint on the lashes' }),
    bad({ content: face(safe.under, 'deep', lashGems, { brows: false }), view, label: 'Avoid', caption: 'Gems near the lashes' }),
    bad({ content: face(blobby, 'deep', '', { brows: false }), view, label: 'Avoid', caption: 'Thick, blobby lines' }),
  ], { pw: 200, gap: 24, arrows: false });
}

// =====================================================================================
// 09.3 Fantasy characters: fairy (fair), dragon (medium, also P10), forest spirit (deep)
// =====================================================================================

// ---------- fairy ----------
const FAIRY = { pink: '#ff8cc6', rose: '#e64980', lilac: '#c8a2f5', violet: '#8e5bd8', aqua: '#7fe3e0', gold: '#e8b33a' };
const WING_UP = 'M108 210C80 190 70 140 100 116C126 98 158 126 152 156C148 178 128 196 108 210Z';
const WING_LO = 'M108 214C94 234 96 272 120 286C140 296 158 282 152 268C144 252 124 236 108 214Z';
function fairyWing(d, [bx, by], tipPts, { flat = false, veins = true } = {}) {
  const o = [];
  const g = radG(bx, by, 110, [[0, '#fff0f7'], [0.25, FAIRY.pink], [0.6, FAIRY.lilac], [1, FAIRY.aqua]]);
  o.push(flat ? `<path d="${d}" fill="${FAIRY.lilac}"/>` : g.def + `<path d="${d}" fill="${g.url}"/>`);
  if (!flat) o.push(clipTo(d, blur(`<path d="${d}" fill="none" stroke="${FAIRY.violet}" stroke-width="9" opacity="0.6"/>`, 3)));
  if (veins) {
    for (const t of tipPts) o.push(line([[bx, by], [(bx + t[0]) / 2 + (t[1] - by) * 0.06, (by + t[1]) / 2], t], { w: 1.3, color: '#fff', opacity: 0.85 }));
  }
  o.push(`<path d="${d}" fill="none" stroke="${FAIRY.violet}" stroke-width="1.8" stroke-linejoin="round"/>`);
  return o.join('');
}
export function fairy({ stage = 5, flat = false } = {}) {
  const half = [], o = [];
  if (stage === 1) {
    half.push(`<path d="${WING_UP}${WING_LO}" fill="none" stroke="#d9a0c4" stroke-width="1.6" stroke-dasharray="4 4"/>`, dot(108, 212, 2.6, '#d9a0c4'));
    return both(`<g transform="translate(116 212) scale(0.86) translate(-108 -212)">${half.join('')}</g>`) + eyeZones(1.2);
  }
  if (stage >= 2 && !flat) {
    half.push(patch(112, 168, 40, 60, [FAIRY.pink, FAIRY.lilac], { deg: -90, inner: 0.3, opacity: 0.45, seed: 2 }));
  }
  if (stage >= 2) {
    half.push(fairyWing(WING_UP, [108, 210], [[86, 150], [96, 124], [118, 110], [140, 124], [150, 150]], { flat, veins: stage >= 3 }));
    half.push(fairyWing(WING_LO, [108, 214], [[102, 258], [118, 282], [144, 284], [150, 266]], { flat, veins: stage >= 3 }));
  }
  if (stage >= 3) {
    half.push(dots([[100, 118], [86, 136], [80, 160], [84, 184]], 6, 2.6, 1.4, WHITE));
    half.push(dots([[126, 106], [146, 116], [156, 138]], 5, 2.4, 1.4, WHITE));
    half.push(dots([[100, 262], [108, 280], [124, 290]], 4, 2.2, 1.4, WHITE));
  }
  if (stage >= 4) {
    // body of the wings: a slim dotted line toward the brow tail; a vine of dots up the forehead
    half.push(dots([[146, 96], [164, 90], [182, 92]], 5, 1.4, 2.4, FAIRY.rose), teardrop(186, 104, 160, 14, 6, FAIRY.pink), teardrop(184, 88, 200, 12, 5, FAIRY.lilac));
  }
  o.push(both(`<g transform="translate(116 212) scale(0.86) translate(-108 -212)">${half.join('')}</g>`));
  if (stage >= 4) {
    // forehead flower
    for (let i = 0; i < 6; i++) o.push(petal(200, 96, -90 + i * 60, 16, 9, i % 2 ? FAIRY.pink : FAIRY.lilac, { round: true }));
    o.push(dot(200, 96, 4, FAIRY.gold), dot(198.6, 94.6, 1.3, '#fff'));
  }
  if (stage >= 5) {
    o.push(both(`<g transform="translate(116 212) scale(0.86) translate(-108 -212)">${glitter(WING_UP, [70, 100, 90, 112], { n: 70, seed: 5, colors: ['#ffffff', '#ffd6ec', '#d8c4ff'], size: [0.8, 2] })}</g>` + sparkle(138, 104, 6, '#fff') + sparkle(100, 228, 4.5, '#fff') + dot(160, 176, 1.6, '#fff')));
    // eye-safe liner with a tiny flick, and a few lash dots outside the eye area
    o.push(both(`<path d="M122 219C136 206 166 205 180 221" fill="none" stroke="#3a2a4a" stroke-width="2.6" stroke-linecap="round"/><path d="M122 219L112 211" stroke="#3a2a4a" stroke-width="2.2" stroke-linecap="round"/>`));
  }
  return o.join('');
}

// ---------- dragon (also Project 10) ----------
const DRAGON = { em: '#1e9e6a', teal: '#14857f', deep: '#0b4d4a', lime: '#9be22e', gold: '#e1b43c', bronze: '#8a5a1e', ember: '#f08c00' };
export const SCALE_REGION = 'M170 154C134 142 100 158 94 200C90 244 100 292 130 336L142 330C122 292 112 258 110 232C108 210 116 190 136 180C150 174 162 172 174 176Z';
function horn(base, pts, w, { flat = false } = {}) {
  const P2 = [base, ...pts];
  const o = [];
  const d = outlineOf(P2, w, PROF.horn);
  if (!flat) o.push(blur(`<path d="${d}" fill="#000" opacity="0.35" transform="translate(2 4)"/>`, 2.5));
  o.push(flat ? `<path d="${d}" fill="${DRAGON.gold}"/>` : sliced(P2, w, PROF.horn, ['#5e3a10', DRAGON.bronze, DRAGON.gold, '#fff0b8', DRAGON.gold], { plateau: 0.9 }));
  // ridges across the horn
  const fr = frameOf(P2), hw = (t) => (w / 2) * PROF.horn(t);
  const r = [];
  for (const t of [0.12, 0.24, 0.36, 0.48, 0.6, 0.72]) {
    let i = fr.t.findIndex((v) => v >= t); const p = fr.c[i], n = fr.nrm[i], k = hw(fr.t[i]);
    const ahead = fr.c[Math.min(fr.c.length - 1, i + 3)];
    r.push(`M${n1(p[0] - n[0] * k)} ${n1(p[1] - n[1] * k)}Q${n1(ahead[0])} ${n1(ahead[1])} ${n1(p[0] + n[0] * k)} ${n1(p[1] + n[1] * k)}`);
  }
  o.push(clipTo(d, `<path d="${r.join('')}" fill="none" stroke="#5e3a10" stroke-width="1.3" opacity="0.7"/>`));
  o.push(`<path d="${d}" fill="none" stroke="${BLACK}" stroke-width="2" stroke-linejoin="round"/>`);
  return o.join('');
}
// stage: 1 sketch, 2 sponge shading, 3 scales, 4 horns and crest, 5 linework and liner, 6 highlights and gems
export function dragon({ stage = 6, flat = false } = {}) {
  const half = [], o = [];
  if (stage === 1) {
    half.push(`<path d="${SCALE_REGION}" fill="none" stroke="#7fbf9f" stroke-width="1.6" stroke-dasharray="4 4"/>`);
    half.push(sketch([[174, 140], [168, 118], [156, 100], [138, 90], [122, 94]], '#d8b26a'));
    o.push(both(half.join('')), sketch([[200, 92], [200, 176]], '#7fbf9f'), eyeZones(1.2));
    return o.join('');
  }
  if (stage >= 2 && !flat) {
    half.push(patch(108, 230, 26, 92, [DRAGON.lime, DRAGON.em, DRAGON.deep], { deg: 90, inner: 0.25, opacity: 0.75, seed: 8 }));
  }
  if (stage >= 3) {
    const sc = scales(SCALE_REGION, [88, 140, 90, 200], { r: 7, colorAt: (x, y) => ramp([DRAGON.lime, DRAGON.em, DRAGON.teal, DRAGON.deep], Math.min(1, Math.max(0, (y - 150) / 190 + (x - 100) / 300))), line: flat ? BLACK : null });
    half.push(flat ? sc : faded(sc, 118, 236, 52, 110, 0.55));
  }
  if (stage >= 4) {
    half.push(horn([174, 140], [[168, 118], [156, 100], [138, 90], [122, 94]], 28, { flat }));
  }
  if (stage >= 5) {
    // dark outline along the inner edge of the scales and a sharp eye-safe liner flick
    half.push(`<path d="M172 176C160 172 148 174 136 180C116 190 108 210 110 232C112 258 122 292 142 330" fill="none" stroke="#0b3b39" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>`);
    half.push(`<path d="M122 219C136 205 166 205 181 222" fill="none" stroke="${BLACK}" stroke-width="3" stroke-linecap="round"/><path d="M123 218L104 204L126 214Z" fill="${BLACK}"/>`);
  }
  if (stage >= 6) {
    half.push(dots([[136, 186], [126, 196], [118, 212], [116, 232]], 5, 1.8, 1.1, '#e8ffd4'));
    half.push(dots([[120, 262], [126, 284], [136, 306]], 4, 1.6, 1, DRAGON.gold));
  }
  o.push(both(half.join('')));
  if (stage >= 4) {
    // center crest: a column of spikes down the forehead
    const sp = [];
    for (let i = 0; i < 4; i++) {
      const y = 106 + i * 18, s = 10 - i * 1.5;
      const d = `M${200 - s} ${y + s * 1.2}L200 ${y - s * 0.6}L${200 + s} ${y + s * 1.2}Q200 ${y + s * 0.6} ${200 - s} ${y + s * 1.2}Z`;
      const g = linG(200, y - s, 200, y + s, [[0, '#fff0b8'], [0.4, DRAGON.gold], [1, DRAGON.bronze]]);
      sp.push(flat ? `<path d="${d}" fill="${DRAGON.gold}" stroke="${BLACK}" stroke-width="1.6"/>` : g.def + `<path d="${d}" fill="${g.url}" stroke="${BLACK}" stroke-width="1.6" stroke-linejoin="round"/>`);
    }
    o.push(sp.join(''));
  }
  if (stage >= 6) {
    o.push(flat ? dot(200, 180, 5, DRAGON.ember) : jewel(200, 180, 6, '#f08c00', { shape: 'drop', deg: 90, setting: true }));
    o.push(both(sparkle(118, 92, 4, '#fff') + dot(150, 98, 1.6, '#fff')));
  }
  return o.join('');
}

// ---------- forest spirit ----------
const FOREST = { moss: '#5c940d', leaf: '#2f9e44', lime: '#a9e34b', dark: '#1b4d2a', bark: '#6b4423', barkL: '#a0743e', berry: '#e03131', cream: '#fff4d6', gold: '#e1b43c' };
function branch(pts, w, { flat = false } = {}) {
  const prof = (t) => Math.max(0.12, 1 - t * 0.8);
  const d = outlineOf(pts, w, prof);
  return (flat ? `<path d="${d}" fill="${FOREST.bark}"/>` : sliced(pts, w, prof, ['#3d2412', FOREST.bark, FOREST.barkL, '#d9b27c'], { plateau: 0.9 }))
    + `<path d="${d}" fill="none" stroke="#2a180a" stroke-width="1.2" stroke-linejoin="round"/>`;
}
// stage: 1 sketch, 2 moss sponge, 3 branches, 4 leaves and vine, 5 flowers, berries, highlights
export function spirit({ stage = 5, flat = false } = {}) {
  const half = [], o = [];
  if (stage === 1) {
    half.push(sketch([[160, 176], [152, 150], [140, 124], [124, 104], [108, 96]], '#c9a27a'), sketch([[146, 134], [150, 116], [158, 100]], '#c9a27a'));
    half.push(sketch([[132, 188], [112, 196], [100, 222], [104, 252], [124, 276], [150, 284]], '#a8d08d'));
    o.push(both(half.join('')), eyeZones(1.2));
    return o.join('');
  }
  if (stage >= 2 && !flat) {
    half.push(patch(108, 190, 34, 90, [FOREST.lime, FOREST.moss, FOREST.dark], { deg: 90, inner: 0.3, opacity: 0.85, seed: 12 }));
    o.push(patch(200, 88, 100, 22, [FOREST.moss, FOREST.lime, FOREST.moss], { inner: 0.2, opacity: 0.55, seed: 13 }));
  }
  if (stage >= 3) {
    half.push(branch([[160, 176], [152, 150], [140, 124], [124, 104], [108, 96]], 10, { flat }));
    half.push(branch([[146, 134], [150, 116], [158, 100]], 5, { flat }));
    half.push(branch([[128, 108], [124, 92], [128, 80]], 4.5, { flat }));
  }
  if (stage >= 4) {
    const Lf = [[116, 194, 215, 36, 16], [104, 214, 180, 34, 15], [102, 238, 160, 32, 14], [110, 258, 140, 30, 13], [126, 274, 120, 26, 12], [114, 100, 200, 26, 11], [154, 106, -40, 22, 10], [134, 124, 200, 22, 10]];
    Lf.forEach(([x, y, deg, len, w], i) => half.push(leaf(x, y, deg, len, w, i % 2 ? [FOREST.dark, FOREST.lime] : [FOREST.leaf, FOREST.lime], { outline: flat ? BLACK : 'rgba(0,0,0,0.35)' })));
    half.push(line([[132, 186], [116, 194], [104, 214], [104, 240], [114, 262], [132, 278], [154, 286]], { w: 2.2, color: FOREST.dark }));
    half.push(stroke(curlPts(162, 282, 6, { turns: 1.1, startDeg: 180, dir: -1, lead: 10, inner: 0.25 }), { w: 3, color: FOREST.dark, kind: 'end' }));
  }
  if (stage >= 5) {
    const flower = (x, y, r) => Array.from({ length: 5 }, (_, i) => dot(...pol(x, y, r, i * 72 - 90), r * 0.62, FOREST.cream)).join('') + dot(x, y, r * 0.5, FOREST.gold);
    half.push(flower(122, 212, 5.5), flower(110, 250, 4.5), flower(130, 96, 4.5));
    half.push(dot(146, 142, 3.2, FOREST.berry), dot(141, 147, 2.8, FOREST.berry), dot(144, 140, 1, '#fff'));
    half.push(dots([[164, 290], [176, 296], [186, 300]], 3, 2, 1, FOREST.lime));
  }
  o.push(both(half.join('')));
  if (stage >= 5) {
    // a small leaf crown at the center
    o.push(leaf(200, 100, -90, 26, 12, [FOREST.leaf, FOREST.lime]), leaf(198, 102, -130, 20, 9, [FOREST.dark, FOREST.lime]), leaf(202, 102, -50, 20, 9, [FOREST.dark, FOREST.lime]));
    o.push(flat ? dot(200, 112, 4, FOREST.gold) : jewel(200, 112, 4.2, '#2f9e44', { setting: true }));
  }
  return o.join('');
}

{
  // Three characters, each with its features and color story.
  const o = [];
  const chars = [
    ['Fairy', fairy(), 'fair', [FAIRY.pink, FAIRY.lilac, FAIRY.aqua, FAIRY.gold], 'light, sparkly, soft'],
    ['Dragon', dragon(), 'medium', [DRAGON.em, DRAGON.teal, DRAGON.gold, BLACK], 'strong, sharp, shiny'],
    ['Forest spirit', spirit(), 'deep', [FOREST.leaf, FOREST.bark, FOREST.lime, FOREST.berry], 'wild, calm, natural'],
  ];
  const view = [50, 60, 300, 330];
  chars.forEach(([name, design, skin, pal, mood], i) => {
    const x = 20 + i * 330;
    o.push(card(x, 20, 310, 540));
    o.push(label(x + 155, 54, name, { size: 18, bold: true, halo: false }));
    o.push(`<svg x="${x + 15}" y="66" width="280" height="308" viewBox="${view.join(' ')}"><rect x="50" y="60" width="300" height="330" fill="#fbf8f4"/>${face(design, skin)}</svg>`);
    pal.forEach((c, k) => o.push(chip(x + 65 + k * 60, 410, 17, c)));
    o.push(label(x + 155, 456, 'Color story', { size: 13, color: SOFT, halo: false }));
    o.push(label(x + 155, 480, mood, { size: 15, halo: false }));
    o.push(label(x + 155, 520, ['wings, flowers, glitter', 'scales, horns, spikes', 'leaves, branches, berries'][i], { size: 14, color: SOFT, halo: false }));
  });
  plain('m09-l03-characters', 'Three fantasy characters, each built from a few key features and a color story. Fairy, on fair skin: pink, lilac and aqua wings on each temple and upper cheek with white veins, white dots and glitter, a flower on the forehead, eye-safe liner; colors pink, lilac, aqua and gold; light, sparkly and soft. Dragon, on medium skin: green-to-teal scales from the forehead around the temple and down the outer cheek, gold horns rising from the forehead, a line of gold spikes down the center, a sharp liner flick; colors emerald, teal, gold and black; strong, sharp and shiny. Forest spirit, on deep skin: moss-green sponging on the temples and hairline, brown branches rising like antlers, leaves along a vine from the brow down to the cheek, cream flowers and red berries; colors leaf green, bark brown, lime and berry red; wild, calm and natural.', 1010, 580, o.join(''));
}

{
  // Three textures on paper: wing veins, scales, leaves.
  const o = [];
  const cardAt = (i, title, content, sub) => {
    const x = 20 + i * 290;
    o.push(card(x, 20, 270, 300));
    o.push(`<g transform="translate(${x} 20)">${content}</g>`);
    o.push(label(x + 135, 274, title, { size: 16, bold: true, halo: false }));
    o.push(label(x + 135, 298, sub, { size: 13, color: SOFT, halo: false }));
  };
  // wing
  const W = 'M60 210C30 160 40 70 120 50C200 34 236 110 210 160C190 196 120 206 60 210Z';
  const wg = radG(60, 210, 220, [[0, '#fff0f7'], [0.3, FAIRY.pink], [0.65, FAIRY.lilac], [1, FAIRY.aqua]]);
  let wing = wg.def + `<path d="${W}" fill="${wg.url}"/>` + clipTo(W, blur(`<path d="${W}" fill="none" stroke="${FAIRY.violet}" stroke-width="16" opacity="0.5"/>`, 5));
  for (const t of [[52, 120], [80, 66], [126, 50], [176, 62], [214, 108], [204, 160]]) wing += line([[60, 210], [(60 + t[0]) / 2 + 6, (210 + t[1]) / 2], t], { w: 2.2, color: '#fff' });
  wing += `<path d="${W}" fill="none" stroke="${FAIRY.violet}" stroke-width="2.4"/>` + dots([[40, 156], [56, 96], [110, 50], [176, 46], [222, 92]], 10, 3.4, 2.2, '#b48ae8');
  cardAt(0, 'Wing veins', wing, 'lines from one point, dots on the edge');
  // scales
  const SR = 'M30 40H240V220H30Z';
  cardAt(1, 'Scales', clipTo('M40 40H230Q240 40 240 50V210Q240 220 230 220H40Q30 220 30 210V50Q30 40 40 40Z', scales(SR, [30, 40, 210, 180], { r: 16, colorAt: (x, y) => ramp([DRAGON.lime, DRAGON.em, DRAGON.teal, DRAGON.deep], (y - 40) / 200) })), 'dark edge, light curve, row by row');
  // leaves and bark
  let lv = branch([[50, 230], [80, 170], [120, 120], [170, 60]], 18);
  lv += leaf(84, 162, 200, 70, 32, [FOREST.dark, FOREST.lime], { outline: 'rgba(0,0,0,0.35)' }) + leaf(118, 124, -20, 76, 34, [FOREST.leaf, FOREST.lime], { outline: 'rgba(0,0,0,0.35)' }) + leaf(150, 86, 210, 60, 28, [FOREST.dark, FOREST.lime], { outline: 'rgba(0,0,0,0.35)' }) + leaf(166, 64, -10, 56, 26, [FOREST.leaf, FOREST.lime], { outline: 'rgba(0,0,0,0.35)' });
  cardAt(2, 'Leaves and bark', lv, 'two-tone leaf, light vein, dark bark');
  plain('m09-l03-textures', 'Three textures that make a character, on paper. Wing veins: a pink, lilac and aqua wing, darker at the edge, with white vein lines that all start from one point and white dots along the outer edge. Scales: rows of U shapes, each with a dark edge and a light curve inside, light green at the top and deep teal at the bottom. Leaves and bark: a brown branch, dark on one side and light on the other, with two-tone green leaves, each with a light center vein.', 890, 340, o.join(''));
}

{
  // Forest spirit step by step on deep skin.
  const view = [50, 50, 300, 300];
  const F = (stage) => ({ content: face(spirit({ stage }), 'deep'), view });
  strip('m09-l03-spirit-steps', 'A forest spirit on deep skin, in five pictures. 1: a light sketch: a branch line rising from each brow to the hairline and a vine line from the brow around the outer eye area down to the cheekbone. 2: moss-green sponging on the temples and along the hairline, darker at the outside. 3: brown branches like small antlers, dark on one side and light on the other, with a black edge. 4: two-tone leaves along the vine from the brow tail down the side of the face to the cheekbone, ending in a curl, and leaves on the branches. Done: cream five-dot flowers, red berries, lime dots, and a small leaf crown with a green gem in the center.', [
    { ...F(1), label: '1', caption: 'Sketch' },
    { ...F(2), label: '2', caption: 'Moss sponge' },
    { ...F(3), label: '3', caption: 'Branches' },
    { ...F(4), label: '4', caption: 'Leaves, vine' },
    { ...F(5), label: 'Done', caption: 'Flowers, berries' },
  ], { pw: 200, gap: 30 });
}

{
  // A strong character vs two common mistakes (dragon, medium skin).
  const view = [50, 60, 300, 330];
  const flatAll = scales('M40 60H360V440H40Z', [40, 60, 320, 380], { r: 8, colorAt: () => DRAGON.em });
  const rainbow = both(scales(SCALE_REGION, [88, 140, 90, 200], { r: 7, colorAt: (x, y) => ramp(['#e03131', '#f08c00', '#ffd43b', '#3cb44b', '#2f6fe0', '#7b3fc4', '#ff6fae'], (y - 140) / 200) })) + both(horn([174, 140], [[168, 118], [156, 100], [138, 90], [122, 94]], 28, { flat: true }).replace(/#e1b43c/g, '#2f6fe0')) + both(dots([[150, 290], [160, 320]], 4, 3, 3, '#ff6fae') + star(150, 140, 8, '#ffd43b'));
  strip('m09-l03-mistakes', 'A strong dragon and two common mistakes, on medium skin. Good: scales in one place (temple to cheek), horns, a center crest and a small color story of green, teal and gold, so it reads at once. Avoid: scales painted over the whole face in one flat color: no focus and no face left. Avoid: every color of the rainbow plus extra stars and dots: the character is lost and the colors fight.', [
    good({ content: face(dragon(), 'medium'), view, label: 'Good', caption: 'Few features, one story' }),
    bad({ content: face(flatAll, 'medium'), view, label: 'Avoid', caption: 'Texture everywhere' }),
    bad({ content: face(rainbow, 'medium'), view, label: 'Avoid', caption: 'Too many colors' }),
  ], { pw: 230, gap: 30, arrows: false });
}

// =====================================================================================
// 09.4 Designing your own artistic look — worked example "Moon dreamer" (skin: light)
// =====================================================================================
const NIGHT = { navy: '#1f2f7a', indigo: '#3b2a8f', purple: '#7b3fc4', magenta: '#d6336c', pink: '#ff8cc6', silver: '#dfe4ec', moon: '#f6f1d8', gold: '#e1b43c' };
const GALAXY = 'M186 72C140 64 100 92 92 150C86 200 96 240 112 262C124 248 122 214 134 198C150 182 174 178 192 168C202 140 204 104 186 72Z';
function crescent(cx, cy, r, { flat = false } = {}) {
  const d = `M${cx} ${cy - r}A${r} ${r} 0 0 0 ${cx} ${cy + r}A${n1(r * 0.55)} ${r} 0 0 1 ${cx} ${cy - r}Z`;
  const g = radG(cx - r * 0.5, cy - r * 0.3, r * 1.6, [[0, '#ffffff'], [0.45, NIGHT.moon], [1, '#b9b08a']]);
  return (flat ? `<path d="${d}" fill="${NIGHT.moon}"/>` : blur(`<path d="${d}" fill="#fff" opacity="0.6"/>`, 5) + g.def + `<path d="${d}" fill="${g.url}"/>`
    + clipTo(d, `<circle cx="${cx - r * 0.55}" cy="${cy - r * 0.1}" r="${r * 0.14}" fill="#b9b08a" opacity="0.5"/><circle cx="${cx - r * 0.35}" cy="${cy + r * 0.45}" r="${r * 0.1}" fill="#b9b08a" opacity="0.5"/>`))
    + `<path d="${d}" fill="none" stroke="#3a3350" stroke-width="1.8"/>`;
}
// v: 1 busy first try, 2 simpler, 3 final. stage (for v3): 1 sketch, 2 galaxy, 3 moon, 4 stars + constellation, 5 shine + gems
export function moon({ v = 3, stage = 5, flat = false } = {}) {
  const o = [];
  if (v === 1) {
    o.push(both(patch(130, 150, 60, 70, ['#e03131', '#f08c00', '#ffd43b', '#3cb44b', '#2f6fe0', '#7b3fc4'], { deg: 90, inner: 0.4, opacity: 0.6 })));
    o.push(crescent(150, 130, 26, { flat: true }), `<circle cx="252" cy="128" r="16" fill="#f08c00" stroke="#3a3350" stroke-width="1.6"/><ellipse cx="252" cy="128" rx="28" ry="6" fill="none" stroke="#ffd43b" stroke-width="3"/>`);
    const r = rng(7);
    for (let i = 0; i < 22; i++) o.push(star(70 + r() * 260, 90 + r() * 260, 4 + r() * 5, ['#ffd43b', '#fff', '#ff8cc6', '#62c3f5'][i % 4], { outline: '#3a3350', ow: 0.8 }));
    o.push(`<circle cx="270" cy="300" r="12" fill="#3cb44b" stroke="#3a3350" stroke-width="1.5"/><circle cx="128" cy="320" r="9" fill="#e03131" stroke="#3a3350" stroke-width="1.5"/>`);
    return o.join('');
  }
  if (v === 3 && stage === 1) {
    o.push(`<path d="${GALAXY}" fill="none" stroke="#b7a7d8" stroke-width="1.6" stroke-dasharray="4 4"/>`, `<circle cx="150" cy="128" r="26" fill="none" stroke="#b7a7d8" stroke-width="1.6"/>`, eyeZones(1.2));
    return o.join('');
  }
  const gal = (flat ? `<path d="${GALAXY}" fill="${NIGHT.indigo}"/>` : faded(blur(`<path d="${GALAXY}" fill="url(#galx)"/>`, 5) + `<defs><linearGradient id="galx" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${NIGHT.navy}"/><stop offset="0.45" stop-color="${NIGHT.indigo}"/><stop offset="0.75" stop-color="${NIGHT.purple}"/><stop offset="1" stop-color="${NIGHT.magenta}"/></linearGradient></defs>` + texture(GALAXY, [90, 60, 112, 205], { seed: 21, opacity: 0.4, density: 30 }), 142, 160, 74, 112, 0.5));
  o.push(gal);
  if (!flat) o.push(patch(126, 200, 26, 40, [NIGHT.pink, NIGHT.magenta], { inner: 0.2, opacity: 0.45 }));
  if (v === 3 && stage < 3) return o.join('');
  o.push(crescent(150, 128, 26, { flat }));
  if (v === 2) { o.push(star(176, 96, 6, NIGHT.silver), star(118, 176, 5, NIGHT.silver), star(184, 156, 4, NIGHT.silver)); return o.join(''); }
  if (stage >= 4) {
    const C = [[176, 92], [188, 116], [180, 150], [170, 172], [120, 176], [108, 208]];
    o.push(`<path d="M${C.slice(0, 4).map((p) => p.join(' ')).join('L')}M${C[4].join(' ')}L${C[5].join(' ')}" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="2 3" opacity="0.8"/>`);
    C.forEach(([x, y], i) => o.push(sparkle(x, y, i % 2 ? 6 : 8, '#fff'), dot(x, y, 1.6, NIGHT.pink)));
    const r = rng(3);
    for (let i = 0; i < 26; i++) o.push(dot(100 + r() * 96, 80 + r() * 150, 0.6 + r() * 1.3, '#fff'));
  }
  if (stage >= 5) {
    if (!flat) o.push(glitter(GALAXY, [90, 60, 112, 205], { n: 70, seed: 31, colors: ['#ffffff', '#d8c4ff', '#ffd6ec'], size: [0.7, 1.8] }));
    o.push(line([[200, 196], [220, 182], [240, 178]], { w: 1, color: '#9c8fc4', dash: '2 3' }), sparkle(244, 176, 6, '#c8a2f5'), dot(226, 182, 1.6, '#c8a2f5'));
  }
  return o.join('');
}
const moonOver = (stage = 5) => stage >= 5 ? jewel(152, 102, 3.6, '#c8a2f5') + jewel(140, 152, 3, '#ff8cc6') + jewel(188, 116, 2.8, '#ffffff') : '';

// =====================================================================================
// P12 example: "Sunset phoenix" (skin: brown)
// =====================================================================================
const SUN = { y: '#ffd43b', o: '#ff922b', r: '#e8273b', m: '#c2255c', p: '#862e9c', gold: '#e1b43c' };
const FEATHERS = [
  // x, y, deg, len, w, bend, colors (base -> tip)
  [226, 182, -152, 84, 24, 0.12, [SUN.y, SUN.o, SUN.r, SUN.m]],
  [230, 178, -124, 100, 27, 0.1, [SUN.y, SUN.o, SUN.r, SUN.m]],
  [236, 176, -98, 104, 28, 0.06, [SUN.y, SUN.o, SUN.r, SUN.p]],
  [242, 178, -72, 94, 26, -0.06, [SUN.y, SUN.o, SUN.r, SUN.m]],
  [248, 182, -48, 80, 23, -0.1, [SUN.y, SUN.o, SUN.r, SUN.m]],
  [252, 188, -26, 60, 19, -0.12, [SUN.y, SUN.o, SUN.m]],
];
// stage: 1 sketch, 2 glow, 3 feathers, 4 flame swirl + linework, 5 gold, dots and gems
export function phoenix({ stage = 5, flat = false } = {}) {
  const o = [];
  if (stage === 1) {
    for (const [x, y, deg, len] of FEATHERS) o.push(sketch([[x, y], pol(x, y, len * 0.92, deg)], '#e8b48a'));
    o.push(sketch([[262, 190], [290, 210], [300, 244], [292, 276], [270, 294]], '#e8b48a'), eyeZones(1.2));
    return o.join('');
  }
  if (!flat) o.push(patch(238, 124, 84, 64, [SUN.y, SUN.o, SUN.m], { deg: -90, inner: 0.25, opacity: 0.4, seed: 41 }));
  if (stage >= 3) {
    // white underlayer so the warm colors stay bright on darker skin (lesson 03.5)
    if (!flat) for (const [x, y, deg, len, w, bend] of FEATHERS) o.push(`<g opacity="0.9">${feather(x, y, deg, len, w + 3, ['#fff7e6', '#fff7e6'], { bend, barbs: false, shaft: 'none' })}</g>`);
    for (const [x, y, deg, len, w, bend, cols] of FEATHERS) o.push(feather(x, y, deg, len, w, cols, { bend, shaft: '#fff3c4', barbs: !flat }));
  }
  if (stage >= 4) {
    // flame swirl down the temple to the cheekbone
    const sw = [[262, 190], [290, 210], [300, 244], [292, 276], [270, 294], ...curlPts(258, 282, 10, { turns: 1.1, startDeg: 90, dir: 1, lead: 0, inner: 0.25 })];
    const prof = (t) => Math.max(0.06, Math.min(1, t * 5 + 0.2) * (1 - t) ** 0.7);
    const d = outlineOf(sw, 16, prof);
    o.push(flat ? `<path d="${d}" fill="${SUN.o}"/>` : sliced(sw, 16, prof, [SUN.r, SUN.o, SUN.y, '#fff3c4']));
    o.push(`<path d="${d}" fill="none" stroke="${BLACK}" stroke-width="1.8"/>`);
    // a few small feathers on the left cheekbone as an echo
    o.push(feather(132, 288, -150, 40, 12, [SUN.y, SUN.o, SUN.r], { bend: 0.1, barbs: !flat }), feather(138, 292, -170, 32, 10, [SUN.y, SUN.o, SUN.m], { bend: 0.12, barbs: !flat }));
  }
  if (stage >= 5) {
    const gg = goldG(200, 100, 300, 300);
    o.push(gg.def + stroke([[214, 190], [226, 196], ...curlPts(238, 192, 5, { turns: 1, startDeg: 180, dir: -1, lead: 0, inner: 0.3 })], { w: 2.6, color: gg.url, kind: 'end' }));
    o.push(dots([[196, 120], [182, 104], [176, 86]], 5, 2.6, 1.2, SUN.y), dots([[300, 120], [308, 140], [306, 164]], 4, 2.4, 1.2, SUN.o));
    o.push(dots([[150, 300], [164, 306], [178, 306]], 4, 2.2, 1.2, SUN.y));
    o.push(sparkle(214, 82, 5, '#fff'), sparkle(286, 100, 4, '#fff'), dot(270, 70, 1.6, '#fff'));
  }
  return o.join('');
}
const phoenixOver = (stage = 5) => stage >= 5 ? jewel(240, 184, 6, '#e8273b', { shape: 'drop', deg: 90, setting: true }) + jewel(226, 190, 3, '#ffd43b') + jewel(254, 190, 3, '#ffd43b') + jewel(258, 282, 3.2, '#ff922b') : '';

// ---------- 09.4 diagrams ----------
{
  // The design process as one loop: brief, references, thumbnails, refine, paint, check and photo.
  const o = [];
  const steps = ['Brief', 'References', 'Thumbnails', 'Refine', 'Paint', 'Check, photo'];
  const art = [
    `<rect x="-40" y="-46" width="80" height="92" rx="8" fill="#fff" stroke="#c9ced6" stroke-width="2"/>` + [-26, -10, 6, 22].map((y, i) => `<path d="M-28 ${y}H${[24, 28, 16, 22][i]}" stroke="#9aa1ab" stroke-width="3" stroke-linecap="round"/>`).join('') + `<path d="M-28 -34H10" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
    `<rect x="-48" y="-40" width="44" height="36" rx="5" fill="url(#ref1)"/><defs><linearGradient id="ref1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${NIGHT.navy}"/><stop offset="1" stop-color="${NIGHT.magenta}"/></linearGradient></defs>` + crescent(-26, -22, 10, { flat: true }).replace(/stroke-width="1.8"/, 'stroke-width="1"') + `<rect x="4" y="-40" width="44" height="36" rx="5" fill="#0b1026"/>` + [[14, -30], [26, -18], [38, -26], [30, -12]].map(([x, y]) => sparkle(x, y, 4, '#fff')).join('') + `<rect x="-22" y="4" width="44" height="36" rx="5" fill="#fff" stroke="#c9ced6"/>` + lace([[-18, 14], [18, 14]], { n: 4, h: 4, color: '#7b3fc4', w: 1.2 }),
    [-34, 0, 34].map((x, i) => `<svg x="${x - 16}" y="-24" width="32" height="44" viewBox="60 60 280 380">${faceLayer({ under: [moon({ v: 1 }), moon({ v: 2, flat: true }), moon({ v: 3, flat: true })][i], skin: 'paper', lips: false })}</svg>`).join(''),
    `<svg x="-34" y="-46" width="68" height="94" viewBox="60 60 280 380">${faceLayer({ under: moon({ v: 3, flat: true }), skin: 'paper', lips: false })}</svg>` + `<g transform="rotate(35 26 10)"><rect x="22" y="-30" width="8" height="56" rx="2" fill="#f4c542"/><path d="M22 26L26 36L30 26Z" fill="#e9c9a0"/></g>`,
    `<svg x="-34" y="-46" width="68" height="94" viewBox="60 60 280 380">${faceLayer({ under: moon(), over: moonOver(), skin: 'light' })}</svg>`,
    `<rect x="-44" y="-30" width="62" height="46" rx="8" fill="#495057"/><circle cx="-13" cy="-7" r="14" fill="#212529" stroke="#adb5bd" stroke-width="3"/><rect x="-30" y="-36" width="20" height="8" rx="2" fill="#495057"/>` + [0, 1, 2].map((i) => `<rect x="24" y="${-30 + i * 20}" width="12" height="12" rx="2" fill="#fff" stroke="#9aa1ab" stroke-width="2"/>` + tick(30, -24 + i * 20, 9)).join(''),
  ];
  steps.forEach((s, i) => {
    const x = 20 + i * 172;
    o.push(card(x, 20, 152, 190));
    o.push(badge(x + 20, 42, String(i + 1), { r: 12 }));
    o.push(`<g transform="translate(${x + 76} 112)">${art[i]}</g>`);
    o.push(label(x + 76, 190, s, { size: 15, bold: true, halo: false }));
    if (i < steps.length - 1) o.push(arrow([[x + 154, 115], [x + 170, 115]], { color: '#c2b8ab', width: 3, head: 7 }));
  });
  o.push(arrow([[1000, 214], [1000, 240], [520, 252], [96, 240], [96, 216]], { color: ACCENT, width: 2.5, dash: '6 5' }));
  o.push(label(560, 274, 'Not happy? Go back one step and try again', { size: 14, color: ACCENT, halo: false }));
  plain('m09-l04-process', 'The design process in six steps with a loop back. 1 Brief: a short note of what, where and how long. 2 References: a few pictures to learn from: a night sky color, stars, a lace pattern. 3 Thumbnails: three small sketches on face outlines. 4 Refine: improve the chosen sketch. 5 Paint: the finished face. 6 Check and photo: a self-check list and a camera. A dashed arrow from the end back to the start says: not happy? Go back one step and try again.', 1050, 290, o.join(''));
}

{
  // Copying one picture vs. learning from several references.
  const o = [];
  o.push(card(20, 20, 380, 330), card(420, 20, 620, 330));
  o.push(label(210, 52, 'Copying', { size: 17, bold: true, color: BAD, halo: false }));
  o.push(label(730, 52, 'Using references', { size: 17, bold: true, color: OK, halo: false }));
  const mini = (under, skin, x, y, w = 100, over = '') => `<svg x="${x}" y="${y}" width="${w}" height="${w * 1.36}" viewBox="60 60 280 380">${faceLayer({ under, over, skin, lips: true })}</svg>`;
  // someone else's design (the dragon) copied exactly
  o.push(`<rect x="44" y="76" width="130" height="176" rx="6" fill="#fff" stroke="#c9ced6" stroke-width="2"/>`, mini(dragon({ flat: false }), 'medium', 59, 86, 100));
  o.push(label(109, 274, "Someone's photo", { size: 13, color: SOFT, halo: false }));
  o.push(arrow([[184, 164], [236, 164]], { color: '#c2b8ab', width: 3 }));
  o.push(mini(dragon({ flat: false }), 'light', 246, 86, 120));
  o.push(label(306, 274, 'The same face', { size: 13, color: SOFT, halo: false }));
  o.push(cross(210, 318, 20));
  // three references, one idea taken from each
  const refs = [
    [`<rect width="96" height="70" rx="6" fill="url(#sky1)"/><defs><linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${NIGHT.navy}"/><stop offset="0.6" stop-color="${NIGHT.purple}"/><stop offset="1" stop-color="${NIGHT.pink}"/></linearGradient></defs>`, 'Sky: colors'],
    [`<rect width="96" height="70" rx="6" fill="#0b1026"/>` + [[16, 18], [40, 30], [66, 20], [80, 46], [30, 54]].map(([x, y], i, a) => (i ? `<path d="M${a[i - 1][0]} ${a[i - 1][1]}L${x} ${y}" stroke="#fff" stroke-width="1" stroke-dasharray="2 2"/>` : '') + sparkle(x, y, 6, '#fff')).join(''), 'Stars: lines'],
    [`<rect width="96" height="70" rx="6" fill="#fff" stroke="#c9ced6"/>` + crescent(48, 35, 24), 'Moon: shape'],
  ];
  refs.forEach(([g, cap], i) => {
    const y = 72 + i * 92;
    o.push(`<g transform="translate(446 ${y})">${g}</g>`, label(494, y + 88, cap, { size: 13, color: SOFT, halo: false }));
    o.push(arrow([[552, y + 36], [ 640, 170 + (i - 1) * 24]], { color: '#c2b8ab', width: 2.5 }));
  });
  o.push(mini(moon(), 'light', 660, 70, 150, moonOver()));
  o.push(label(735, 290, 'A new design', { size: 13, color: SOFT, halo: false }));
  o.push(tick(735, 322, 20));
  o.push(label(940, 140, 'Take one idea', { size: 14, halo: false }), label(940, 160, 'from each', { size: 14, halo: false }), label(940, 196, 'Mix them', { size: 14, halo: false }), label(940, 216, 'your way', { size: 14, halo: false }));
  plain('m09-l04-references', 'Copying versus using references. Copying: someone else\'s photo of a dragon face is painted again exactly, the same face: avoid. Using references: one idea is taken from each of three pictures: the colors of a night sky, the dotted lines of star constellations and the shape of a crescent moon. Mixed together they make a new design: a moon on one side of the forehead with a galaxy blend and constellation stars.', 1060, 370, o.join(''));
}

{
  // Three versions of the same idea, each better than the last.
  const view = [60, 60, 280, 330];
  strip('m09-l04-iterate', 'Three versions of the Moon dreamer design on light skin. Version 1: a rainbow blend, a moon, a planet and many stars and dots all over the face, too busy, with no clear center. Version 2: one galaxy blend from navy to magenta on the left forehead and temple with the moon on it and three stars: clear, but a little plain. Version 3: the same layout with dotted constellation lines and sparkle stars, glitter on the galaxy, a few small gems and one small star echo on the right side.', [
    bad({ content: face(moon({ v: 1 }), 'light'), view, label: 'Version 1', caption: 'Too busy' }),
    { content: face(moon({ v: 2 }), 'light'), view, label: 'Version 2', caption: 'Clear, a bit plain', labelColor: '#e8590c' },
    good({ content: face(moon(), 'light', moonOver()), view, label: 'Version 3', caption: 'Clear and rich' }),
  ], { pw: 220, gap: 40 });
}

{
  // A portfolio page.
  const o = [];
  o.push(`<rect x="20" y="20" width="760" height="520" rx="14" fill="#fff" stroke="#e3ddd5" stroke-width="2"/>`);
  o.push(label(48, 64, 'Moon dreamer', { size: 24, bold: true, anchor: 'start', halo: false }));
  o.push(label(48, 90, 'October · 85 minutes · light skin, my own face', { size: 14, color: SOFT, anchor: 'start', halo: false }));
  const photo = (x, y, w, h, view, under, over) => `<rect x="${x - 4}" y="${y - 4}" width="${w + 8}" height="${h + 8}" rx="4" fill="#f1f3f5"/><svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${view.join(' ')}" preserveAspectRatio="xMidYMid slice"><rect x="${view[0]}" y="${view[1]}" width="${view[2]}" height="${view[3]}" fill="#e9e4f2"/>${faceLayer({ under, over, skin: 'light' })}</svg>`;
  o.push(photo(48, 110, 230, 300, [40, 40, 320, 420], moon(), moonOver()));
  o.push(label(163, 436, 'Front, 1 m away', { size: 13, color: SOFT, halo: false }));
  o.push(photo(300, 110, 170, 140, [90, 70, 130, 110], moon(), moonOver()));
  o.push(label(385, 274, 'Close-up', { size: 13, color: SOFT, halo: false }));
  o.push(photo(300, 290, 170, 120, [60, 40, 280, 240], moon({ v: 2 }), ''));
  o.push(label(385, 436, 'Version 2 (before)', { size: 13, color: SOFT, halo: false }));
  const X = 500;
  o.push(label(X, 128, 'Brief', { size: 15, bold: true, anchor: 'start', halo: false }));
  o.push(label(X, 150, 'Dreamy night look for a party', { size: 14, anchor: 'start', halo: false }));
  o.push(label(X, 186, 'Palette', { size: 15, bold: true, anchor: 'start', halo: false }));
  [NIGHT.navy, NIGHT.purple, NIGHT.magenta, NIGHT.moon, WHITE].forEach((c, i) => o.push(chip(X + 16 + i * 44, 210, 14, c)));
  o.push(label(X, 256, 'Worked', { size: 15, bold: true, anchor: 'start', halo: false }));
  o.push(label(X, 278, 'One side only; galaxy blend', { size: 14, anchor: 'start', halo: false }));
  o.push(label(X, 314, 'Next time', { size: 15, bold: true, anchor: 'start', halo: false }));
  o.push(label(X, 336, 'Smaller stars, crisper moon edge', { size: 14, anchor: 'start', halo: false }));
  o.push(label(X, 372, 'Self-check', { size: 15, bold: true, anchor: 'start', halo: false }));
  ['Reads in one second', 'Eye area clear', 'Skin fine after'].forEach((t, i) => o.push(tick(X + 8, 396 + i * 24, 10), label(X + 24, 400 + i * 24, t, { size: 14, anchor: 'start', halo: false })));
  o.push(label(400, 510, 'Plain light, plain background, the same distance every time.', { size: 14, color: SOFT, halo: false }));
  plain('m09-l04-portfolio', 'A portfolio page for one design, Moon dreamer. Title, date, time taken and skin. Three photos: the front from about one meter, a close-up of the moon and stars, and version 2 from before, for comparison. Beside them: the brief, a dreamy night look for a party; the palette of navy, purple, magenta, moon cream and white; what worked, one side only and the galaxy blend; what to change next time, smaller stars and a crisper moon edge; and three ticked self-check items: reads in one second, eye area clear, skin fine after. At the bottom: plain light, plain background, the same distance every time.', 800, 560, o.join(''));
}

// =====================================================================================
// Projects P10, P11, P12: finished references and step strips
// =====================================================================================
const hero = (name, title, under, skin, over = '', opts = {}) => {
  const [vx, vy, vw, vh] = opts.view ?? [40, 40, 320, 440];
  plain(name, title, vw * 2, vh * 2, `<svg x="0" y="0" width="${vw * 2}" height="${vh * 2}" viewBox="${vx} ${vy} ${vw} ${vh}"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#fbf8f4"/>${faceLayer({ under, over, skin, brows: opts.brows ?? true })}</svg>`);
};

// P10: emerald dragon, medium skin
hero('p10-fantasy-character', 'Project 10 finished on medium skin: an emerald dragon. Green-to-teal scales, fading into the skin, run from the forehead above each brow around the temple and down the outer cheek to the jaw, edged on the inside with a thin black line. Two gold horns with ridges and a soft shadow rise from the upper forehead and curve outward. A column of four gold spikes runs down the center of the forehead to an orange teardrop gem between the brows. Eye-safe black liner ends in a sharp flick toward each temple. White and gold dots and two sparkles finish it.', dragon(), 'medium', '', { view: [40, 30, 320, 450] });
{
  const view = [50, 40, 300, 330];
  const S = (stage) => ({ content: face(dragon({ stage }), 'medium'), view });
  strip('p10-fantasy-character-steps', 'Project 10, the emerald dragon, in six pictures on medium skin. 1: a light sketch: the scale area from the forehead around the temple to the jaw, the horn line and the center line, with the eye area kept clear. 2: a sponge blend of lime, emerald and deep teal over the scale area, darker toward the jaw. 3: scales, row by row, with a stencil or freehand, fading into the skin at the edges. 4: gold horns shaded dark on one side and light on the other, with ridges, and a column of gold spikes down the center. 5: a black line along the inner edge of the scales and eye-safe liner with a sharp flick. Done: white and gold highlight dots, sparkles and a gem between the brows.', [
    { ...S(1), label: '1', caption: 'Sketch' },
    { ...S(2), label: '2', caption: 'Sponge blend' },
    { ...S(3), label: '3', caption: 'Scales' },
    { ...S(4), label: '4', caption: 'Horns, crest' },
    { ...S(5), label: '5', caption: 'Lines, liner' },
    { ...S(6), label: 'Done', caption: 'Shine, gem' },
  ], { pw: 220, gap: 30, cols: 3 });
}

// P11: royal masquerade with a feather plume, light skin
const ROYAL = { top: '#9c36b5', mid: '#5f1a7a', bottom: '#2b0b3f', lace: WHITE, gem: '#e8273b', gem2: '#2fd0e8' };
export const artisticMask = (stage = 6, flat = false) => decoMask({ name: 'colombina', stage, pal: ROYAL, feathers: true, flat });
{
  const m = artisticMask();
  hero('p11-artistic-mask', 'Project 11 finished on light skin: a royal masquerade mask. A plum mask, light at the top and almost black at the bottom, covers the brows and the upper cheeks and rises to a point at each temple, leaving a wide almond of bare skin around each open eye. It has 3D shading: dark along every edge, light bands over the brows and on the cheek curve, and a soft shadow on the skin. A white lace edge of scallops and dots hangs along the lower edge. Gold filigree vines curl along the brow band, the temple tips and the cheek band. Three painted feathers in plum and violet with gold shafts rise from the left temple. A red teardrop gem sits above the center, blue gems at the temple tips and two small pearls on each side.', m.under, 'light', m.over, { view: [40, 30, 320, 450], brows: false });
  const view = [56, 40, 288, 260];
  const S = (stage) => { const k = artisticMask(stage); return { content: face(k.under, 'light', k.over, { brows: stage < 2 }), view }; };
  strip('p11-artistic-mask-steps', 'Project 11, the royal masquerade mask, in six pictures on light skin. 1: a light sketch: center and temple dots, the outline and a wide almond around each eye. 2: eye-safe plum sponged inside the outline, lighter at the top. 3: 3D shading along the edges, light bands on the brow and cheek curve, a soft shadow below. 4: three painted feathers rising from the left temple, a black outline and the white lace edge. 5: gold filigree vines, curls, teardrops and dots. Done: white sparkles, a teardrop gem above the center, gems at the temple tips and small pearls, all far from the eyes.', [
    { ...S(1), label: '1', caption: 'Sketch' },
    { ...S(2), label: '2', caption: 'Base color' },
    { ...S(3), label: '3', caption: '3D shading' },
    { ...S(4), label: '4', caption: 'Feathers, lace' },
    { ...S(5), label: '5', caption: 'Filigree' },
    { ...S(6), label: 'Done', caption: 'Gems, shine' },
  ], { pw: 230, gap: 30, cols: 3 });
}

// P12: sunset phoenix, brown skin
hero('p12-original-design', 'Project 12 example on brown skin: Sunset phoenix, an original one-sided design. Six flame-shaped feathers fan up from above the right brow over the forehead and the right temple, each yellow at the base, then orange, red and magenta or purple at the tip, with a pale shaft and fine barbs, painted over a soft white layer so the colors stay bright. A flame swirl in red, orange and yellow runs from the right temple down to the cheekbone and curls under the eye area. Two small feathers on the left cheekbone echo the design. Gold filigree curls, yellow and orange dot trails, white sparkles, a red teardrop gem at the base of the feathers and small yellow and orange gems finish it.', phoenix(), 'brown', phoenixOver(), { view: [40, 30, 320, 450] });
{
  const view = [50, 40, 300, 330];
  const S = (stage) => ({ content: face(phoenix({ stage }), 'brown', phoenixOver(stage)), view });
  strip('p12-original-design-steps', 'Project 12, the Sunset phoenix, in five pictures on brown skin. 1: a light sketch of the six feather lines fanning from above the right brow and the swirl line down the right temple, with the eye area kept clear. 2: a soft sponge glow of yellow, orange and magenta behind the feathers. 3: a thin white layer under each feather, then each feather in yellow, orange, red and magenta from base to tip, with a pale shaft. 4: the flame swirl down the temple with a black outline, and two small feathers on the left cheekbone. Done: gold filigree curls, dot trails, sparkles and gems at the base of the feathers.', [
    { ...S(1), label: '1', caption: 'Sketch' },
    { ...S(2), label: '2', caption: 'Glow' },
    { ...S(3), label: '3', caption: 'Feathers' },
    { ...S(4), label: '4', caption: 'Swirl, echo' },
    { ...S(5), label: 'Done', caption: 'Gold and gems' },
  ], { pw: 200, gap: 30 });
}
{
  // P12 process: brief -> palette and references -> three thumbnails -> chosen and refined -> finished
  const o = [];
  o.push(card(20, 20, 210, 330));
  o.push(label(125, 52, 'Brief', { size: 16, bold: true, halo: false }));
  ['Sunset phoenix', 'Summer party, 4 hours', 'One side, warm colors', 'No paint near the eyes'].forEach((t, i) => o.push(label(125, 86 + i * 26, t, { size: 14, halo: false, color: i ? INK : ACCENT })));
  [SUN.y, SUN.o, SUN.r, SUN.m, SUN.gold].forEach((c, i) => o.push(chip(53 + i * 36, 220, 13, c)));
  o.push(label(125, 258, 'Palette: warm', { size: 13, color: SOFT, halo: false }));
  o.push(`<g transform="translate(85 300)">${feather(0, 26, -60, 50, 14, [SUN.y, SUN.o, SUN.r])}</g>`, `<rect x="130" y="276" width="56" height="44" rx="6" fill="url(#sun2)"/><defs><linearGradient id="sun2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SUN.p}"/><stop offset="0.5" stop-color="${SUN.r}"/><stop offset="1" stop-color="${SUN.y}"/></linearGradient></defs>`);
  o.push(arrow([[236, 185], [262, 185]], { color: '#c2b8ab', width: 3 }));
  o.push(card(270, 20, 380, 330));
  o.push(label(460, 52, 'Thumbnails', { size: 16, bold: true, halo: false }));
  const thumbs = [
    both(Array.from({ length: 3 }, (_, i) => feather(150 - i * 8, 170, -100 - i * 22, 70, 18, [SUN.y, SUN.o, SUN.r], { barbs: false }))),
    phoenix({ flat: true }),
    Array.from({ length: 5 }, (_, i) => feather(200, 330, -140 + i * 25, 120, 22, [SUN.y, SUN.o, SUN.r], { barbs: false })).join(''),
  ];
  thumbs.forEach((t, i) => {
    const x = 284 + i * 122;
    o.push(`<svg x="${x}" y="70" width="110" height="150" viewBox="60 60 280 380">${faceLayer({ under: t, skin: 'paper', lips: false })}</svg>`);
    o.push(label(x + 55, 244, ['Two sides', 'One side', 'Chin fan'][i], { size: 13, color: SOFT, halo: false }));
    o.push(i === 1 ? tick(x + 55, 280, 18) : cross(x + 55, 280, 16));
  });
  o.push(label(460, 326, 'One side reads best and is new', { size: 14, halo: false }));
  o.push(arrow([[656, 185], [682, 185]], { color: '#c2b8ab', width: 3 }));
  o.push(card(690, 20, 250, 330));
  o.push(label(815, 52, 'Finished', { size: 16, bold: true, halo: false }));
  o.push(`<svg x="725" y="66" width="180" height="250" viewBox="60 40 280 390">${faceLayer({ under: phoenix(), over: phoenixOver(), skin: 'brown' })}</svg>`);
  o.push(label(815, 336, 'Then self-check and photo', { size: 13, color: SOFT, halo: false }));
  plain('p12-original-design-process', 'The process behind the Sunset phoenix. Brief: Sunset phoenix, a summer party lasting 4 hours, one side, warm colors, no paint near the eyes; a warm palette of yellow, orange, red, magenta and gold, with a feather and a sunset sky as references. Thumbnails: feathers on both sides, feathers on one side, and a fan rising from the chin; the one-sided version is chosen because it reads best and is new. Finished: the full phoenix design painted on brown skin, followed by the self-check and a photo.', 960, 370, o.join(''));
}
