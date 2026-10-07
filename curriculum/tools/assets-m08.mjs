// Module 8 diagrams (Advanced Color and Illusion). Run: node curriculum/tools/assets-m08.mjs
import { plain, strip, paperPanel } from './lib/figure.mjs';
import { P, SOFT, INK, OK, BAD, ACCENT, label, arrow, badge, tick, cross, line, stroke, petal, dot, dots, star, sparkle, brush, pol, rng, spline, polyD } from './lib/art.mjs';
import { SKIN, L, faceSVG, headClip } from './lib/face.mjs';
import { taper } from './lib/geom.mjs';

const OUTLINE = '#5b4636';
const n1 = (v) => (Math.round(v * 10) / 10).toString();

// ---------- color helpers ----------
const hx = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (a) => '#' + a.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => { const A = hx(a), B = hx(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
const light = (c, t = 0.5) => mix(c, '#ffffff', t);
// A darker shade of the same color (not gray): darken the channels, keep the hue.
const shade = (c, t = 0.4) => toHex(hx(c).map((v) => v * (1 - t)));
const smooth = (x) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
// Color at u (0..1) across a list of colors; `blend` < 1 keeps pure plateaus between the transitions.
function ramp(colors, u, blend = 1) {
  if (colors.length === 1) return colors[0];
  const n = colors.length - 1, x = Math.max(0, Math.min(0.9999, u)) * n, i = Math.floor(x), f = x - i;
  const g = blend >= 1 ? f : smooth((f - (1 - blend) / 2) / blend);
  return mix(colors[i], colors[i + 1], g);
}

// ---------- svg helpers ----------
let uid = 0;
const nid = (p = 'm8') => `${p}${uid++}`;
const clipTo = (d, content) => { const id = nid('cl'); return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id})">${content}</g>`; };
const blur = (content, sd = 3) => { const id = nid('bl'); return `<defs><filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${sd}"/></filter></defs><g filter="url(#${id})">${content}</g>`; };
// Linear gradient in user space from (x1, y1) to (x2, y2); stops: [[offset, color, opacity?], ...]
function linG(x1, y1, x2, y2, stops) {
  const id = nid('lg');
  return { def: `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a < 1 ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient></defs>`, url: `url(#${id})` };
}
function radG(cx, cy, r, stops, { fx = cx, fy = cy } = {}) {
  const id = nid('rg');
  return { def: `<defs><radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" fx="${n1(fx)}" fy="${n1(fy)}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a < 1 ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient></defs>`, url: `url(#${id})` };
}
// Fade content out toward the edges of an ellipse (paint faded into the skin).
function faded(content, cx, cy, rx, ry, inner = 0.5) {
  const id = nid('fm'), g = nid('fg');
  return `<defs><radialGradient id="${g}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${rx}" gradientTransform="translate(${cx} ${cy}) scale(1 ${n1(ry / rx)}) translate(${-cx} ${-cy})"><stop offset="${inner}" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`
    + `<mask id="${id}" maskUnits="userSpaceOnUse" x="${cx - rx - 10}" y="${cy - ry - 10}" width="${2 * rx + 20}" height="${2 * ry + 20}"><rect x="${cx - rx}" y="${cy - ry}" width="${2 * rx}" height="${2 * ry}" fill="url(#${g})"/></mask></defs><g mask="url(#${id})">${content}</g>`;
}
// Sponge texture: tiny light dots, clipped to path d.
function texture(d, [x, y, w, h], { seed = 3, color = '#ffffff', opacity = 0.3, density = 60 } = {}) {
  const rnd = rng(seed), o = [];
  for (let i = 0; i < Math.round((w * h) / density); i++) o.push(dot(x + rnd() * w, y + rnd() * h, 0.5 + rnd() * 1.1, color));
  return clipTo(d, `<g opacity="${opacity}">${o.join('')}</g>`);
}
const ellD = (cx, cy, rx, ry) => { const k = 0.5523; return `M${cx + rx} ${cy}C${cx + rx} ${cy + ry * k} ${cx + rx * k} ${cy + ry} ${cx} ${cy + ry}C${cx - rx * k} ${cy + ry} ${cx - rx} ${cy + ry * k} ${cx - rx} ${cy}C${cx - rx} ${cy - ry * k} ${cx - rx * k} ${cy - ry} ${cx} ${cy - ry}C${cx + rx * k} ${cy - ry} ${cx + rx} ${cy - ry * k} ${cx + rx} ${cy}Z`; };
const blobD = (cx, cy, r, seed = 1, wob = 0.25, n = 9) => { const rnd = rng(seed), pts = []; for (let i = 0; i < n; i++) pts.push(pol(cx, cy, r * (1 - wob / 2 + rnd() * wob), i * (360 / n))); return polyD(spline([...pts, pts[0], pts[1], pts[2]], 10).slice(10, 10 + n * 10 + 1), true); };

// Soft multi-color blend in an ellipse, faded at the edges (a sponged patch). deg = blend direction.
function blendPatch(cx, cy, rx, ry, colors, { deg = 0, seed = 5, inner = 0.55, plateau = 0.6, tex = true } = {}) {
  const [x1, y1] = pol(cx, cy, rx, deg + 180), [x2, y2] = pol(cx, cy, rx, deg);
  const stops = [];
  for (let k = 0; k <= 24; k++) stops.push([(k / 24).toFixed(3), ramp(colors, k / 24, plateau)]);
  const g = linG(x1, y1, x2, y2, stops);
  const d = ellD(cx, cy, rx, ry);
  return faded(g.def + `<path d="${d}" fill="${g.url}"/>` + (tex ? texture(d, [cx - rx, cy - ry, 2 * rx, 2 * ry], { seed }) : ''), cx, cy, rx, ry, inner);
}

// A face with paint below the features (clipped to the head) and extras on top.
function face(under, skin = 'medium', over = '', { eyes = 'open', centre = false } = {}) {
  const id = nid('fc');
  return `<defs>${headClip(id)}</defs>${faceSVG({ skin, eyes, parts: 'base' })}<g clip-path="url(#${id})">${under}</g>${faceSVG({ skin, eyes, centre, parts: 'features' })}${over}`;
}
const mirror = (content) => `<g transform="translate(400 0) scale(-1 1)">${content}</g>`;

// Forearm seen from the inner side, wrist left, elbow right (frame 300 x 200).
const ARMCLIP = 'M-10 62C70 56 170 50 310 42V172C170 166 70 158 -10 154Z';
const forearm = (skin = 'tan') => `<path d="${ARMCLIP}" fill="${SKIN[skin] ?? skin}"/>`
  + `<path d="M-10 62C70 56 170 50 310 42M-10 154C70 158 170 166 310 172" fill="none" stroke="${OUTLINE}" stroke-width="2.4"/>`;
const paper = (x = 15, y = 15, w = 270, h = 210) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#ffffff" stroke="#e3ddd5"/>`;
const good = (p) => ({ ...p, labelColor: OK });
const bad = (p) => ({ ...p, labelColor: BAD });

// ---------- stroke geometry ----------
// Frame along a spline: centerline points, unit normals and arc-length fractions.
function frameOf(pts, per = 20) {
  const c = spline(pts, per), acc = [0];
  for (let i = 1; i < c.length; i++) acc.push(acc[i - 1] + Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]));
  const T = acc[acc.length - 1] || 1;
  const nrm = c.map((_, i) => { const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; });
  return { c, nrm, t: acc.map((v) => v / T) };
}
// Point across a stroke: t along (0..1), f across (-1 left .. 1 right), half-width function hw(t).
function at(fr, t, f, hw) {
  let i = fr.t.findIndex((v) => v >= t); if (i < 0) i = fr.t.length - 1;
  const w = hw(fr.t[i]);
  return [fr.c[i][0] + fr.nrm[i][0] * w * f, fr.c[i][1] + fr.nrm[i][1] * w * f];
}
// A stroke whose color changes ACROSS its width (a split-cake / one-stroke load, or a shaded tube).
// colors listed from the left edge to the right edge (relative to the stroke direction).
function sliced(pts, W, profile, colors, { n = 30, plateau = 0.7, opacity = 1 } = {}) {
  const fr = frameOf(pts), hw = (t) => (W / 2) * profile(t), o = [];
  for (let k = 0; k < n; k++) {
    const f0 = -1 + (2 * k) / n, f1 = Math.min(1, -1 + (2 * (k + 1.25)) / n);
    const A = fr.c.map((p, i) => [p[0] + fr.nrm[i][0] * hw(fr.t[i]) * f0, p[1] + fr.nrm[i][1] * hw(fr.t[i]) * f0]);
    const B = fr.c.map((p, i) => [p[0] + fr.nrm[i][0] * hw(fr.t[i]) * f1, p[1] + fr.nrm[i][1] * hw(fr.t[i]) * f1]);
    { const col = ramp(colors, (k + 0.5) / n, plateau); o.push(`<path d="${polyD([...A, ...B.reverse()], true)}" fill="${col}" stroke="${col}" stroke-width="0.5"/>`); }
  }
  return `<g${opacity < 1 ? ` opacity="${opacity}"` : ''}>${o.join('')}</g>`;
}
const outlineOf = (pts, W, profile) => { const fr = frameOf(pts), hw = (t) => (W / 2) * profile(t); const A = fr.c.map((p, i) => [p[0] + fr.nrm[i][0] * hw(fr.t[i]) * -1, p[1] + fr.nrm[i][1] * hw(fr.t[i]) * -1]); const B = fr.c.map((p, i) => [p[0] + fr.nrm[i][0] * hw(fr.t[i]), p[1] + fr.nrm[i][1] * hw(fr.t[i])]); return polyD([...A, ...B.reverse()], true); };

// Width profiles for one-stroke shapes.
const PROF = {
  leaf: (t) => Math.max(0.06, Math.sin(Math.PI * Math.min(1, t * 1.05)) ** 0.75),
  even: (t) => (t < 0.03 ? 0.85 + t * 5 : t > 0.97 ? 0.85 + (1 - t) * 5 : 1),
  swirl: (t) => Math.max(0.08, Math.min(1, t * 5) * (1 - t) ** 0.6),
  pinch: (t) => Math.max(0.1, Math.sin(Math.PI * t) ** 0.6),
};

// =================================================================================
// 08.1 Three-color blends and split cakes (skin: fair)
// =================================================================================
const SUN3 = [P.yellow, P.magenta, P.purple];          // sponge blend: middle color is a neighbor of both
const PETAL = ['#fff0f6', '#ffb3d4', P.magenta, '#8a1f78'];   // petal split cake, light to dark
const LEAFC = ['#e9f7a8', P.lime, P.green, '#1d6b2a'];          // leaf split cake

// Wide sponge seen from below with N color stripes (or clean).
function spongeBottom(x, y, w, h, colors = null) {
  const d = `M${x - w / 2 + 12} ${y - h / 2}H${x + w / 2 - 12}Q${x + w / 2} ${y - h / 2} ${x + w / 2} ${y - h / 2 + 12}V${y + h / 2 - 12}Q${x + w / 2} ${y + h / 2} ${x + w / 2 - 12} ${y + h / 2}H${x - w / 2 + 12}Q${x - w / 2} ${y + h / 2} ${x - w / 2} ${y + h / 2 - 12}V${y - h / 2 + 12}Q${x - w / 2} ${y - h / 2} ${x - w / 2 + 12} ${y - h / 2}Z`;
  let fill = '#f6e7d0', defs = '';
  if (colors) {
    const st = []; colors.forEach((c, i) => { st.push([(i / colors.length + 0.02).toFixed(3), c], [((i + 1) / colors.length - 0.02).toFixed(3), c]); });
    const g = linG(x - w / 2, y, x + w / 2, y, st); defs = g.def; fill = g.url;
  }
  const pores = Array.from({ length: 26 }, (_, i) => dot(x - w / 2 + 10 + ((i * 37) % (w - 20)), y - h / 2 + 8 + ((i * 23) % (h - 16)), 1.5, 'rgba(90,60,30,0.25)')).join('');
  return defs + `<path d="${d}" fill="${fill}" stroke="#c8a67a" stroke-width="2.5"/>` + pores;
}
const cakeTop = (x, y, r, color) => `<circle cx="${x}" cy="${y}" r="${r + 5}" fill="#e9ecef" stroke="#adb5bd" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="rgba(0,0,0,0.2)"/>`;
const plate = (cx, cy, r = 110) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" stroke="#c9cdd3" stroke-width="2.5"/><circle cx="${cx}" cy="${cy}" r="${r - 14}" fill="none" stroke="#eef0f3" stroke-width="3"/>`;

// Small spray bottle (side view), nozzle at (x, y) pointing left.
const sprayBottle = (x, y) => `<rect x="${x + 2}" y="${y - 5}" width="16" height="10" rx="2" fill="#adb5bd"/><path d="M${x + 6} ${y + 5}h10v8h-10z" fill="#ced4da"/><rect x="${x}" y="${y + 13}" width="24" height="44" rx="6" fill="#d0ebff" stroke="#74c0fc" stroke-width="1.5"/><path d="M${x + 18} ${y - 4}l9 6" stroke="#868e96" stroke-width="3" stroke-linecap="round"/>`;

// Split cake from above: stripes side by side in a pan. dirty: smeared across the stripes.
function splitCake(cx, cy, w, h, colors, { gloss = false, dirty = false, seed = 4 } = {}) {
  const x0 = cx - w / 2, y0 = cy - h / 2, sw = w / colors.length;
  const inner = `M${x0 + 8} ${y0}H${x0 + w - 8}Q${x0 + w} ${y0} ${x0 + w} ${y0 + 8}V${y0 + h - 8}Q${x0 + w} ${y0 + h} ${x0 + w - 8} ${y0 + h}H${x0 + 8}Q${x0} ${y0 + h} ${x0} ${y0 + h - 8}V${y0 + 8}Q${x0} ${y0} ${x0 + 8} ${y0}Z`;
  let o = `<rect x="${x0 - 7}" y="${y0 - 7}" width="${w + 14}" height="${h + 14}" rx="12" fill="#e9ecef" stroke="#adb5bd" stroke-width="1.5"/>`;
  let s = colors.map((c, i) => `<rect x="${n1(x0 + i * sw - 0.5)}" y="${y0}" width="${n1(sw + 1)}" height="${h}" fill="${c}"/>`).join('');
  if (dirty) {
    const rnd = rng(seed);
    for (let k = 0; k < 5; k++) {
      const yy = y0 + 10 + rnd() * (h - 20), xx = x0 + rnd() * w * 0.6;
      s += stroke([[xx, yy], [xx + w * 0.25, yy + (rnd() - 0.5) * 10], [xx + w * 0.45, yy + (rnd() - 0.5) * 14]], { w: 7 + rnd() * 6, color: mix(colors[k % colors.length], '#7c6a52', 0.45), opacity: 0.85 });
    }
  }
  if (gloss) s += `<path d="M${x0 + 10} ${y0 + h * 0.75}L${x0 + w * 0.55} ${y0 + 6}" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity="0.45"/><path d="M${x0 + 26} ${y0 + h * 0.85}L${x0 + w * 0.7} ${y0 + 12}" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.35"/>`;
  o += clipTo(inner, s) + `<path d="${inner}" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="1.2"/>`;
  return o;
}

// Flat brush seen from above: bristle edge centered at (x, y), handle toward deg + 180.
// colors: stripes across the bristles (null = clean). w: bristle width.
function flatBrush(x, y, deg, w = 46, colors = null, { len = 150 } = {}) {
  const back = deg + 180, p = (r, k) => pol(...pol(x, y, r, back), k, deg + 90);
  const hairL = 30, ferL = 22;
  const hairPts = [p(0, -w / 2), p(0, w / 2), p(hairL, w / 2 * 0.96), p(hairL, -w / 2 * 0.96)];
  let hair;
  if (colors) {
    const o = []; const n = colors.length;
    for (let i = 0; i < n; i++) {
      const a = -w / 2 + (i * w) / n, b = -w / 2 + ((i + 1) * w) / n + 0.6;
      o.push(`<path d="${polyD([p(0, a), p(0, b), p(hairL * 0.7, b * 0.98), p(hairL * 0.7, a * 0.98)], true)}" fill="${colors[i]}"/>`);
    }
    hair = `<path d="${polyD(hairPts, true)}" fill="#e8dccb"/>` + o.join('');
  } else hair = `<path d="${polyD(hairPts, true)}" fill="#e8dccb"/>`;
  const fer = polyD([p(hairL, w / 2 * 0.98), p(hairL + ferL, w / 2 * 0.9), p(hairL + ferL, -w / 2 * 0.9), p(hairL, -w / 2 * 0.98)], true);
  const handle = polyD([p(hairL + ferL, w * 0.22), p(len, w * 0.13), p(len, -w * 0.13), p(hairL + ferL, -w * 0.22)], true);
  return `<path d="${handle}" fill="#2b6cb0"/><path d="${fer}" fill="#c3c9d1" stroke="#868e96" stroke-width="1"/>${hair}<path d="${polyD(hairPts, true)}" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="1"/>`;
}

// One-stroke shapes.
// Leaf: colors across the stroke, dark edge on one side, light on the other.
const oneLeaf = (pts, W, colors = LEAFC) => sliced(pts, W, PROF.leaf, colors, { plateau: 0.85 })
  + stroke(pts.map((q, i) => (i === 0 ? q : q)).slice(0, -1), { w: 1.6, color: light(colors[0], 0.3), opacity: 0.0 });
// Petal: light at the base (center of the flower), dark at the rim.
function onePetal(x, y, deg, len, w, colors = PETAL) {
  const g = radG(x, y, len * 1.02, colors.map((c, i) => [(0.15 + (0.85 * i) / (colors.length - 1)).toFixed(3), c]));
  let o = g.def + petal(x, y, deg, len, w, g.url, { round: true });
  for (const k of [-0.22, 0, 0.22]) { const a = pol(x, y, len * 0.25, deg + k * 40), b = pol(x, y, len * 0.85, deg + k * 55); o += `<path d="M${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}" stroke="#ffffff" stroke-width="1.1" opacity="0.35" stroke-linecap="round"/>`; }
  return o;
}
// Rotated flower: the brush turns around its light corner, so the colors run in rings.
function oneFlower(cx, cy, R, colors = PETAL, { petals = 6 } = {}) {
  const pts = [];
  for (let i = 0; i <= 120; i++) { const th = (i / 120) * 360; const r = R * (0.8 + 0.2 * Math.abs(Math.sin(((th * petals) / 2) * Math.PI / 180)) ** 0.6); pts.push(pol(cx, cy, r, th - 90)); }
  const g = radG(cx, cy, R, colors.map((c, i) => [(0.05 + (0.95 * i) / (colors.length - 1)).toFixed(3), c]));
  let o = g.def + `<path d="${polyD(pts, true)}" fill="${g.url}"/>`;
  for (let i = 0; i < petals; i++) { const a = pol(cx, cy, R * 0.2, i * (360 / petals) - 90 + 180 / petals), b = pol(cx, cy, R * 0.82, i * (360 / petals) - 90 + 180 / petals); o += `<path d="M${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}" stroke="${shade(colors[colors.length - 1], 0.2)}" stroke-width="1.2" opacity="0.45" stroke-linecap="round"/>`; }
  return o;
}

{
  // Sponge: three colors in one blend.
  const V = [0, 0, 300, 240];
  const [A, B, C] = SUN3;
  const zone = (x1, x2, y) => `<path d="M${x1} ${y - 6}V${y}H${x2}V${y - 6}" fill="none" stroke="${INK}" stroke-width="2"/>`;
  strip('m08-l01-sponge-three', 'A three-color sponge blend in five pictures. 1: a wide, damp sponge rubbed on yellow, pink and purple, three stripes side by side. 2: dab it on the plate a few times so the stripes meet softly. 3: dab it on the paper, keeping the colors in the same direction. 4: dab a little left and right over the two places where the colors meet. Done: a smooth blend from yellow through pink to purple, with two blending zones and soft edges.', [
    paperPanel(cakeTop(65, 180, 32, A) + cakeTop(150, 180, 32, B) + cakeTop(235, 180, 32, C) + spongeBottom(150, 75, 210, 70, [A, B, C]), V, '1', 'Three stripes, one sponge'),
    paperPanel(plate(150, 120, 108) + blendPatch(150, 120, 82, 34, SUN3, { seed: 3, inner: 0.7, plateau: 0.35 }) + arrow([[150, 30], [150, 72]], { width: 3 }), V, '2', 'Dab on the plate'),
    paperPanel(paper() + blendPatch(150, 120, 115, 52, SUN3, { seed: 4, inner: 0.82, plateau: 0.3 }) + label(150, 50, 'press and lift', { size: 17, color: ACCENT }), V, '3', 'Dab, same direction'),
    paperPanel(paper() + blendPatch(150, 120, 115, 52, SUN3, { seed: 4, inner: 0.82, plateau: 0.75 })
      + arrow([[108, 195], [88, 195]], { width: 2.5, head: 7 }) + arrow([[118, 195], [138, 195]], { width: 2.5, head: 7 })
      + arrow([[182, 195], [162, 195]], { width: 2.5, head: 7 }) + arrow([[192, 195], [212, 195]], { width: 2.5, head: 7 }), V, '4', 'Blend the two zones'),
    paperPanel(paper() + blendPatch(150, 115, 125, 62, SUN3, { seed: 5, inner: 0.45, plateau: 0.85 }) + zone(85, 130, 205) + zone(170, 215, 205) + label(150, 228, 'two blending zones', { size: 16, halo: false }), V, 'Done', 'Smooth, three colors'),
  ], { pw: 190 });
}

{
  // Wet-edge timing on a fair forearm: layer method.
  const V = [0, 20, 300, 180];
  const arm = forearm('fair');
  const base = blendPatch(110, 108, 80, 40, [P.yellow, P.yellow], { seed: 11, inner: 0.6 });
  const goodP = blendPatch(150, 108, 120, 44, SUN3, { seed: 12, inner: 0.6, plateau: 0.8 });
  const ring = base + `<path d="M150 72C138 90 136 126 150 146" fill="none" stroke="${shade(P.magenta, 0.3)}" stroke-width="5" opacity="0.8"/>` + blendPatch(205, 108, 70, 40, [P.magenta, P.purple], { seed: 13, inner: 0.7 });
  const mud = blur(blendPatch(150, 108, 110, 42, [P.yellow, '#9b6a4a', '#7a5a6a', P.purple], { seed: 14, inner: 0.5, tex: false }), 2.5)
    + `<path d="M70 96C120 92 170 104 230 98M74 120C130 124 180 116 228 124" stroke="#ffffff" stroke-width="3" opacity="0.35" fill="none"/>`;
  strip('m08-l01-wet-edge', 'Wet-edge timing on a fair forearm. Good: the second color was dabbed on while the edge of the first was still slightly damp, so the blend is smooth. Avoid: the first color dried before the next was added, so a hard line shows where the pink starts. Avoid: the sponge was too wet, so the colors ran together into a muddy, streaky patch.', [
    good(paperPanel(arm + clipTo(ARMCLIP, goodP) + tick(270, 190, 16), V, 'Good', 'Added while damp')),
    bad(paperPanel(arm + clipTo(ARMCLIP, ring) + cross(270, 190, 16), V, 'Avoid', 'Waited too long: hard line')),
    bad(paperPanel(arm + clipTo(ARMCLIP, mud) + cross(270, 190, 16), V, 'Avoid', 'Too wet: mud')),
  ], { pw: 250, arrows: false });
}

{
  // Loading a flat brush from a split cake.
  const V = [0, 0, 300, 240];
  const drops = Array.from({ length: 18 }, (_, i) => dot(70 + ((i * 53) % 160), 45 + ((i * 29) % 40), 1.6 + (i % 3) * 0.5, '#74c0fc')).join('');
  const band = (pts, W) => sliced(pts, W, PROF.even, PETAL, { plateau: 0.8 }) + `<path d="${outlineOf(pts, W, PROF.even)}" fill="none" stroke="#d9c2cf" stroke-width="0.8"/>`;
  strip('m08-l01-split-load', 'Loading a flat brush from a split cake in five pictures. 1: mist the cake once or twice so it looks glossy. 2: lay the damp flat brush across the stripes and slide it back and forth along the stripes, always on the same path. 3: the brush now carries every color side by side, white on one corner and dark magenta on the other. 4: a straight test stroke on paper shows clean stripes. Done: one curved stroke paints all four colors at once.', [
    paperPanel(splitCake(150, 150, 170, 110, PETAL, { gloss: true }) + drops + sprayBottle(250, 40), V, '1', 'Mist until glossy'),
    paperPanel(splitCake(150, 110, 170, 150, PETAL) + flatBrush(150, 82, -90, 150, null, { len: 190 })
      + arrow([[262, 95], [262, 50]], { width: 3, head: 9 }) + arrow([[262, 125], [262, 170]], { width: 3, head: 9 }), V, '2', 'Across the stripes, slide along them'),
    paperPanel(flatBrush(150, 45, -90, 100, PETAL, { len: 200 }) + label(85, 40, 'light', { size: 15, color: SOFT, halo: false }) + label(215, 40, 'dark', { size: 15, color: SOFT, halo: false }), V, '3', 'Loaded side by side'),
    paperPanel(paper() + band([[45, 120], [150, 120], [255, 120]], 52), V, '4', 'Test stroke: clean stripes'),
    paperPanel(paper() + band([[45, 180], [95, 110], [150, 92], [205, 110], [255, 180]], 48), V, 'Done', 'One stroke, four colors'),
  ], { pw: 190 });
}

{
  // One-stroke shapes: leaf, petal, swirl and the rotated flower.
  const V = [0, 0, 260, 240];
  const startMark = (x, y) => `<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="${ACCENT}" stroke-width="2.5"/>`;
  const leafPts = [[60, 190], [110, 140], [160, 100], [205, 60]];
  const swPts = [[40, 180], [90, 175], [150, 150], [185, 110], [175, 75], [145, 70], [130, 92], [145, 108]];
  strip('m08-l01-one-stroke', 'Four one-stroke shapes with a split-loaded flat brush. Leaf: press the brush down, slide while turning it a little, and lift to a point; the dark green stays on one edge and the light green on the other. Petal: press with the light corner at the flower center, wiggle out and back, lift; the petal is pale at the base and dark at the rim. Swirl: start on the flat of the brush and finish on its edge, so the line gets thinner. Rotate: keep the light corner still and turn the brush around it for a whole flower in one movement.', [
    paperPanel(oneLeaf(leafPts, 56) + startMark(60, 190) + arrow([[38, 150], [70, 112], [118, 80]], { width: 2.5, head: 8 }), V, '1', 'Leaf: press, slide, lift'),
    paperPanel([0, 72, 144, 216, 288].map((a) => onePetal(130, 125, a - 90, 82, 66)).join('') + dot(130, 125, 9, P.yellow) + dot(127, 122, 2.5, '#ffffff') + startMark(130, 125), V, '2', 'Petal: wiggle out, back'),
    paperPanel(sliced(swPts, 30, PROF.swirl, LEAFC, { plateau: 0.85 }) + startMark(40, 180), V, '3', 'Swirl: flat, then edge'),
    paperPanel(oneFlower(130, 120, 82) + dot(130, 120, 10, P.yellow) + dot(127, 117, 3, '#ffffff') + arrow([[210, 70], [228, 128], [200, 192]], { width: 2.5, head: 8 }) + startMark(130, 120), V, '4', 'Rotate: a flower in one turn'),
  ], { pw: 200, gap: 30, arrows: false });
}

{
  // On the face: sponge blend crescent around the outer eye, then one-stroke flower (fair skin).
  const view = [55, 100, 190, 230];
  const CRES = 'M168 138C132 132 100 150 94 186C90 218 98 258 122 288C134 302 152 306 164 300C142 290 124 266 114 238C108 214 110 188 126 168C138 154 152 146 168 138Z';
  const swoosh = clipTo(CRES, blendPatch(126, 218, 54, 96, SUN3, { deg: -95, seed: 21, inner: 0.7, plateau: 0.8 }));
  const flower = [0, 72, 144, 216, 288].map((a) => onePetal(116, 166, a - 80, 26, 22)).join('') + dot(116, 166, 4.2, P.yellow) + dot(115, 165, 1.3, '#ffffff');
  const leaves = oneLeaf([[134, 154], [148, 140], [164, 132], [182, 130]], 17) + oneLeaf([[104, 252], [108, 270], [118, 286], [132, 296]], 17)
    + sliced([[98, 186], [92, 202], [96, 216], [106, 216], [106, 206]], 8, PROF.swirl, LEAFC);
  const finish = dots([[132, 280], [144, 290], [156, 294]], 3, 3, 2, '#ffffff') + dots([[150, 160], [160, 152]], 2, 2.2, 1.6, '#ffffff') + sparkle(140, 174, 7, '#ffffff');
  const F = (under, lab, cap) => ({ content: face(under, 'fair', '', { eyes: 'open' }), view, label: lab, caption: cap });
  strip('m08-l01-cheek-steps', 'A three-color blend and one-stroke flower on the face, fair skin, in four pictures. 1: a purple, pink and yellow sponge blend in a crescent from above the brow, around the outside of the eye and down onto the cheekbone, outside the eye area. 2: a one-stroke flower of five petals on the temple, pale centers and dark rims. 3: two one-stroke leaves and a small green swirl. Done: a yellow center, white dots and a small sparkle.', [
    F(swoosh, '1', 'Three-color crescent'),
    F(swoosh + flower, '2', 'One-stroke petals'),
    F(swoosh + leaves + flower, '3', 'Leaves and a swirl'),
    F(swoosh + leaves + flower + finish, 'Done', 'Dots and sparkle'),
  ], { pw: 190 });
}

{
  // Common split-cake problems.
  const V = [0, 0, 260, 200];
  const band = (colors, opts = {}) => sliced([[30, 145], [80, 92], [130, 78], [180, 92], [230, 145]], 42, PROF.even, colors, { plateau: 0.8, ...opts });
  const muddyC = [mix(PETAL[0], '#9b7c6c', 0.3), mix(PETAL[1], '#8d6f62', 0.45), mix(P.magenta, '#7c6a52', 0.45), '#6a3a50'];
  const wet = blur(band(PETAL, { plateau: 0.2 }), 2.5) + `<path d="M120 110c2 10 0 20 -2 30" stroke="${P.magenta}" stroke-width="4" stroke-linecap="round" opacity="0.6"/>`;
  const dry = band(PETAL) + clipTo(outlineOf([[30, 145], [80, 92], [130, 78], [180, 92], [230, 145]], 42, PROF.even), Array.from({ length: 9 }, (_, i) => `<path d="M${20 + i * 26} 60L${50 + i * 26} 160" stroke="#ffffff" stroke-width="${3 + (i % 3) * 2}" opacity="0.8"/>`).join(''));
  strip('m08-l01-mistakes', 'A good one-stroke band and three common problems. Good: four clean stripes from white to dark magenta. Avoid: muddy colors, because the brush was rubbed in different directions and mixed the cake. Avoid: too much water, so the colors run into each other and drip. Avoid: too little paint, so the stroke breaks up into dry, streaky gaps.', [
    good(paperPanel(band(PETAL) + splitCake(130, 178, 110, 26, PETAL) + tick(240, 30, 16), V, 'Good', 'Clean stripes')),
    bad(paperPanel(band(muddyC) + splitCake(130, 178, 110, 26, PETAL, { dirty: true, seed: 3 }) + cross(240, 30, 16), V, 'Avoid', 'Muddy cake')),
    bad(paperPanel(wet + splitCake(130, 178, 110, 26, PETAL) + cross(240, 30, 16), V, 'Avoid', 'Too wet: runs')),
    bad(paperPanel(dry + splitCake(130, 178, 110, 26, PETAL) + cross(240, 30, 16), V, 'Avoid', 'Too dry: gaps')),
  ], { pw: 190, gap: 24, arrows: false });
}



// =================================================================================
// 08.2 Making shapes look 3D (skin: medium, brown)
// =================================================================================
const SUNDIR = 225;   // light from the top left
const sunIcon = (x, y, r = 14) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffd43b" stroke="#f59f00" stroke-width="2"/>`
  + Array.from({ length: 8 }, (_, i) => { const [a, b] = [pol(x, y, r + 4, i * 45), pol(x, y, r + 11, i * 45)]; return `<path d="M${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}" stroke="#f59f00" stroke-width="3" stroke-linecap="round"/>`; }).join('');
const castShadow = (d, dx, dy, color = '#000000', op = 0.25, sd = 4) => blur(`<path d="${d}" transform="translate(${dx} ${dy})" fill="${color}" opacity="${op}"/>`, sd);

// Shaded ball. stage: 1 midtone, 2 + shadow, 3 + reflected light, 4 + light and highlight, 5 + cast shadow.
function sphere(cx, cy, r, c, { stage = 5, darkC = null, ground = '#6b5a4a', hard = false, light2 = false } = {}) {
  const dark = darkC ?? shade(c, 0.5);
  const d = ellD(cx, cy, r, r);
  let o = '';
  if (stage >= 5) o += castShadow(ellD(cx, cy + r * 0.92, r * 0.92, r * 0.24), r * 0.38, 0, ground, 0.35, r * 0.07);
  o += `<path d="${d}" fill="${c}"/>`;
  let inner = '';
  if (stage >= 2) {
    if (hard) inner += `<path d="M${cx - r * 1.2} ${cy + r * 1.2}L${cx + r * 1.2} ${cy - r * 1.2}L${cx + r * 1.4} ${cy + r * 1.4}Z" fill="${dark}"/>`;
    else { const g = radG(cx - r * 0.45, cy - r * 0.45, r * 1.85, [[0, dark, 0], [0.5, dark, 0], [0.78, dark, 0.95], [1, dark, 1]]); inner += g.def + `<rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="${g.url}"/>`; }
  }
  if (stage >= 3 && !hard) inner += blur(stroke(Array.from({ length: 9 }, (_, i) => pol(cx, cy, r * 0.9, 10 + i * 9)), { w: r * 0.13, color: mix(dark, c, 0.55), opacity: 0.9 }), r * 0.03);
  if (stage >= 4) {
    const g = radG(cx - r * 0.38, cy - r * 0.4, r * 0.8, [[0, light(c, 0.6), 1], [1, light(c, 0.6), 0]]);
    inner += g.def + `<rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="${g.url}"/>`;
    inner += `<ellipse cx="${n1(cx - r * 0.42)}" cy="${n1(cy - r * 0.45)}" rx="${n1(r * 0.17)}" ry="${n1(r * 0.1)}" transform="rotate(-40 ${n1(cx - r * 0.42)} ${n1(cy - r * 0.45)})" fill="#ffffff" opacity="0.95"/>` + dot(cx - r * 0.2, cy - r * 0.58, r * 0.04, '#ffffff');
    if (light2) inner += `<ellipse cx="${n1(cx + r * 0.42)}" cy="${n1(cy + r * 0.4)}" rx="${n1(r * 0.17)}" ry="${n1(r * 0.1)}" transform="rotate(-40 ${n1(cx + r * 0.42)} ${n1(cy + r * 0.4)})" fill="#ffffff" opacity="0.95"/>`;
  }
  return o + clipTo(d, inner);
}

// Hexagonal cut gem seen from above. stage: 1 pencil outline, 2 midtone, 3 dark facets, 4 light facets, 5 highlight + cast shadow.
function hexGem(cx, cy, R, c, stage = 5, { ground = '#6b5a4a', pencil = '#9aa1ab' } = {}) {
  const V = Array.from({ length: 6 }, (_, i) => pol(cx, cy, R, -90 + 60 * i)), I = Array.from({ length: 6 }, (_, i) => pol(cx, cy, R * 0.55, -90 + 60 * i));
  const outer = polyD(V, true), table = polyD(I, true);
  const facet = (i) => polyD([V[i], V[(i + 1) % 6], I[(i + 1) % 6], I[i]], true);
  const bright = (i) => Math.cos(((-60 + 60 * i - SUNDIR) * Math.PI) / 180);
  let o = '';
  if (stage === 1) return `<path d="${outer}" fill="none" stroke="${pencil}" stroke-width="1.6"/><path d="${table}" fill="none" stroke="${pencil}" stroke-width="1.4"/>` + V.map((v, i) => `<path d="M${n1(v[0])} ${n1(v[1])}L${n1(I[i][0])} ${n1(I[i][1])}" stroke="${pencil}" stroke-width="1.4"/>`).join('');
  if (stage >= 5) o += castShadow(outer, R * 0.18, R * 0.22, ground, 0.35, R * 0.07);
  for (let i = 0; i < 6; i++) {
    const b = bright(i);
    let f = c;
    if (stage >= 3 && b < 0) f = mix(c, shade(c, 0.55), -b);
    if (stage >= 4 && b > 0) f = mix(c, light(c, 0.65), b);
    o += `<path d="${facet(i)}" fill="${f}"/>`;
  }
  if (stage >= 4) { const g = linG(cx - R * 0.5, cy - R * 0.5, cx + R * 0.5, cy + R * 0.5, [[0, light(c, 0.45)], [1, c]]); o += g.def + `<path d="${table}" fill="${g.url}"/>`; }
  else o += `<path d="${table}" fill="${c}"/>`;
  o += V.map((v, i) => `<path d="M${n1(v[0])} ${n1(v[1])}L${n1(I[i][0])} ${n1(I[i][1])}" stroke="${shade(c, 0.35)}" stroke-width="1" opacity="0.5"/>`).join('') + `<path d="${table}" fill="none" stroke="${shade(c, 0.35)}" stroke-width="1" opacity="0.5"/>`;
  if (stage >= 5) {
    o += `<path d="${outer}" fill="none" stroke="${shade(c, 0.6)}" stroke-width="${n1(Math.max(1.2, R * 0.035))}" stroke-linejoin="round"/>`;
    const ins = (p, k) => [p[0] + (cx - p[0]) * k, p[1] + (cy - p[1]) * k];
    o += stroke([ins(V[5], 0.12), ins([(V[5][0] + V[0][0]) / 2, (V[5][1] + V[0][1]) / 2], 0.1), ins(V[0], 0.14)], { w: R * 0.07, color: '#ffffff', opacity: 0.95 });
    o += line([pol(...V[2], 3, 170), pol(...V[3], 3, -10)], { w: R * 0.04, color: light(c, 0.35), opacity: 0.8 });
    o += sparkle(I[5][0] + R * 0.08, I[5][1] + R * 0.12, R * 0.22, '#ffffff');
  }
  return o;
}

// Curved horn with optional spiral grooves. pts: base center -> tip. stage as for the gem.
function horn(pts, W, c, stage = 5, { ground = '#6b5a4a', pencil = '#9aa1ab', grooves = 6 } = {}) {
  const prof = (t) => Math.max(0.02, (1 - t) ** 0.85);
  const shape = outlineOf(pts, W, prof);
  if (stage === 1) return `<path d="${shape}" fill="none" stroke="${pencil}" stroke-width="1.6" stroke-linejoin="round"/>`;
  const dark = shade(c, 0.5);
  const cols = stage === 2 ? [c] : stage === 3 ? [c, c, c, shade(c, 0.3), dark, shade(c, 0.4)]
    : [light(c, 0.55), light(c, 0.25), c, c, shade(c, 0.3), dark, mix(dark, c, 0.5)];
  let o = '';
  if (stage >= 5) o += castShadow(shape, W * 0.22, W * 0.12, ground, 0.3, W * 0.06);
  o += sliced(pts, W, prof, cols, { n: 34, plateau: 1 });
  const fr = frameOf(pts), hw = (t) => (W / 2) * prof(t);
  const FS = [-1.02, -0.4, 0.3, 1.02];
  if (stage >= 4 && grooves) {
    let g = '';
    for (let k = 1; k <= grooves; k++) {
      const t0 = k / (grooves + 1.3);
      const pp = FS.map((f, j) => at(fr, Math.min(0.98, t0 + 0.05 * j), f, hw));
      const lp = FS.map((f, j) => at(fr, Math.max(0, t0 - 0.025 + 0.05 * j), f, hw));
      const wk = Math.max(0.8, 3.4 * (1 - t0));
      g += stroke(pp, { w: wk, color: dark }) + stroke(lp, { w: wk * 0.6, color: light(c, 0.5), opacity: 0.8 });
    }
    o += clipTo(shape, g);
  }
  if (stage >= 5) {
    o += stroke([0.08, 0.3, 0.55, 0.75].map((t) => at(fr, t, -0.55, hw)), { w: W * 0.07, color: '#ffffff', opacity: 0.9 });
    o += `<path d="${shape}" fill="none" stroke="${shade(c, 0.55)}" stroke-width="1.4" stroke-linejoin="round"/>`;
    const tip = at(fr, 0.62, -0.9, hw); o += sparkle(tip[0] - 6, tip[1] - 4, W * 0.18, '#ffffff');
  }
  return o;
}

{
  // The five parts of light on a ball.
  const C = '#8e5bd6', cx = 230, cy = 205, r = 120;
  let o = sunIcon(70, 60, 18) + arrow([[98, 88], [140, 128]], { color: '#f59f00', width: 3 });
  o += `<rect x="40" y="${cy + r - 6}" width="400" height="80" fill="#f1ebe3"/>`;
  o += sphere(cx, cy, r, C, { ground: '#5b4a3a' });
  const pts = [
    [[cx - r * 0.42, cy - r * 0.45], 'highlight', 'white, brightest'],
    [[cx - r * 0.05, cy - r * 0.08], 'midtone', 'the color itself'],
    [[cx + r * 0.52, cy + r * 0.38], 'shadow', 'darker shade, same color'],
    [[cx + r * 0.66, cy + r * 0.62], 'reflected light', 'a little lighter at the edge'],
    [[cx + r * 0.5, cy + r * 0.97], 'cast shadow', 'on the skin, away from the light'],
  ];
  pts.forEach(([[x, y], name, sub], i) => {
    const ly = 70 + i * 74;
    o += dot(x, y, 5, '#ffffff') + `<circle cx="${n1(x)}" cy="${n1(y)}" r="5" fill="none" stroke="${INK}" stroke-width="2"/>`;
    o += `<path d="M${n1(x + 6)} ${n1(y)}L470 ${ly - 5}H486" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
    o += badge(500, ly - 5, String(i + 1), { r: 11 }) + label(520, ly, name, { size: 17, bold: true, anchor: 'start' }) + label(520, ly + 20, sub, { size: 14, color: SOFT, anchor: 'start' });
  });
  plain('m08-l02-sphere', 'The five parts of light on a purple ball, with the light coming from the top left. 1 Highlight: a small white shine on the top left. 2 Midtone: the plain color across the middle. 3 Shadow: a darker shade of the same purple on the bottom right. 4 Reflected light: a slightly lighter band just inside the bottom-right edge. 5 Cast shadow: a soft dark oval on the ground beside the ball, away from the light.', 760, 420, o);
}

{
  // Value ladders and the black-shadow mistake.
  const cols = [['purple', '#8e5bd6'], ['teal', P.teal], ['orange', P.orange]];
  const heads = ['highlight', 'light', 'midtone', 'shadow', 'deep shadow'];
  let o = '';
  heads.forEach((h, i) => { o += label(150 + i * 90, 40, h, { size: 14, bold: i === 2, color: i === 2 ? INK : SOFT, halo: false }); });
  cols.forEach(([name, c], r) => {
    const y = 56 + r * 78;
    o += label(40, y + 38, name, { size: 15, bold: true, anchor: 'start', halo: false });
    [light(c, 0.8), light(c, 0.4), c, shade(c, 0.35), shade(c, 0.6)].forEach((s, i) => { o += `<rect x="${110 + i * 90}" y="${y}" width="80" height="60" rx="10" fill="${s}" stroke="${i === 2 ? INK : 'rgba(0,0,0,0.15)'}" stroke-width="${i === 2 ? 3 : 1.5}"/>`; });
  });
  o += label(110, 312, '+ white', { size: 14, color: SOFT, anchor: 'start', halo: false }) + label(560, 312, '+ a darker shade of the same color', { size: 14, color: SOFT, anchor: 'end', halo: false });
  o += sphere(640, 110, 52, P.teal, { ground: '#8a7a6a' }) + tick(708, 182, 16) + label(640, 210, 'dark teal shadow', { size: 14, halo: false });
  o += sphere(640, 290, 52, P.teal, { darkC: '#3b3b3b', ground: '#8a7a6a' }) + cross(708, 362, 16) + label(640, 390, 'black shadow: dirty', { size: 14, color: BAD, halo: false });
  plain('m08-l02-values', 'Value ladders for purple, teal and orange. From left to right: a highlight with lots of white, a lighter tint, the plain color as the midtone, a darker shade of the same color for the shadow, and a deeper shade. On the right, two teal balls: the good one is shaded with dark teal and looks clean and round; the other is shaded with black and looks gray and dirty.', 740, 410, o);
}

{
  // 3D gem in five steps on paper.
  const V = [0, 0, 240, 220];
  const C = '#2fa8e0';
  const G = (s) => hexGem(120, 112, 78, C, s, { ground: '#8a8f99' });
  strip('m08-l02-gem-steps', 'A 3D gem on paper in five pictures, light from the top left. 1: sketch a hexagon, a smaller hexagon inside it for the flat top, and lines joining the corners. 2: fill everything with the midtone blue. 3: paint the facets on the bottom right with a darker blue. 4: paint the facets on the top left and the top with a lighter blue. Done: a white shine along the top-left edge, a white sparkle, a thin dark outline and a soft cast shadow on the bottom right.', [
    paperPanel(G(1) + sunIcon(26, 26, 10), V, '1', 'Sketch the facets'),
    paperPanel(G(2) + sunIcon(26, 26, 10), V, '2', 'Midtone everywhere'),
    paperPanel(G(3) + sunIcon(26, 26, 10), V, '3', 'Dark facets'),
    paperPanel(G(4) + sunIcon(26, 26, 10), V, '4', 'Light facets'),
    paperPanel(G(5) + sunIcon(26, 26, 10), V, 'Done', 'Shine, cast shadow'),
  ], { pw: 180, gap: 34 });
}

{
  // 3D horn and ribbon on paper.
  const V = [0, 0, 240, 240];
  const HP = [[78, 222], [96, 160], [128, 100], [176, 40]];
  const H = (s) => horn(HP, 70, P.gold, s, { ground: '#8a8f99' });
  // A twisting ribbon: it narrows where it turns edge-on and shows its darker back between twists.
  const RC = P.magenta;
  const ribbon = (s) => {
    const N = 120, W = 48;
    const C = (t) => [22 + 196 * t, 128 + 34 * Math.sin(2 * Math.PI * 0.85 * t + 0.2) - 30 * t];
    const ph = (t) => 2 * Math.PI * 1.05 * t + 0.35;
    const polys = [], shadowD = [];
    for (let i = 0; i < N; i++) {
      const t0 = i / N, t1 = Math.min(1, (i + 1.3) / N), tm = (i + 0.5) / N;
      const nr = (t) => { const a = C(Math.max(0, t - 0.004)), b = C(Math.min(1, t + 0.004)); const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [-dy / l, dx / l]; };
      const wd = (t) => (s === 1 ? W : W * (0.12 + 0.88 * Math.abs(Math.cos(ph(t))))) / 2;
      const p = (t, k) => { const c = C(t), n = nr(t), w = wd(t) * k; return [c[0] + n[0] * w, c[1] + n[1] * w]; };
      const d = polyD([p(t0, -1), p(t1, -1), p(t1, 1), p(t0, 1)], true);
      const cs = Math.cos(ph(tm)), sn = (Math.sin(ph(tm)) + 1) / 2;
      const col = s === 1 ? RC : s === 2 ? (cs >= 0 ? RC : shade(RC, 0.4)) : cs >= 0 ? ramp([light(RC, 0.5), RC, shade(RC, 0.3)], sn) : ramp([shade(RC, 0.3), shade(RC, 0.55)], sn);
      polys.push(`<path d="${d}" fill="${col}" stroke="${col}" stroke-width="0.5"/>`); shadowD.push(d);
    }
    let o = s >= 3 ? castShadow(shadowD.join(''), 6, 9, '#8a8f99', 0.35, 3) : '';
    o += polys.join('');
    if (s >= 3) o += sparkle(200, 62, 9, '#ffffff');
    return o;
  };
  strip('m08-l02-horn-ribbon', 'A 3D horn and a 3D ribbon, light from the top left. Horn, top row: 1 sketch a curved cone. 2 midtone gold. 3 a darker gold band down the right side. 4 lighter gold on the left, then curved spiral grooves, each a dark line with a light line beside it. Done: a white shine on the left, a thin outline, a sparkle and a soft cast shadow. Ribbon, bottom row: 1 a flat pink band. 2 the part where the ribbon turns over is painted darker, because it is the back of the ribbon. Done: light on the top edges, shadow under the folds, white shines and a cast shadow.', [
    paperPanel(H(1) + sunIcon(26, 26, 10), V, '1', 'Sketch the cone'),
    paperPanel(H(2) + sunIcon(26, 26, 10), V, '2', 'Midtone'),
    paperPanel(H(3) + sunIcon(26, 26, 10), V, '3', 'Shadow side'),
    paperPanel(H(4) + sunIcon(26, 26, 10), V, '4', 'Light side, grooves'),
    paperPanel(H(5) + sunIcon(26, 26, 10), V, 'Done', 'Shine, cast shadow'),
    paperPanel(ribbon(1) + sunIcon(26, 26, 10), V, '1', 'Flat band'),
    paperPanel(ribbon(2) + sunIcon(26, 26, 10), V, '2', 'Back side darker'),
    paperPanel(ribbon(3) + sunIcon(26, 26, 10), V, 'Done', 'Light, shadow, shine'),
  ], { cols: 5, pw: 180, gap: 34 });
}

{
  // On the face: a unicorn horn and a gem on the forehead (brown skin).
  const view = [90, 50, 220, 200];
  const HP = [[200, 176], [202, 140], [207, 108], [214, 80]];
  const C = '#b57be6', GC = '#3fc1d9';
  const G = (s) => horn(HP, 46, C, s, { ground: '#2a1a10', pencil: '#e8dccb' }) + hexGem(200, 190, 13, GC, s, { ground: '#2a1a10', pencil: '#e8dccb' });
  const F = (s, lab, cap, extra = '') => ({ content: face(G(s) + extra, 'brown', '', { eyes: 'closed' }), view, label: lab, caption: cap });
  const done = sparkle(176, 92, 7, '#ffffff') + dots([[234, 110], [240, 126], [236, 142]], 3, 2.6, 1.6, '#ffffff') + dots([[168, 120], [162, 136]], 2, 2.2, 1.6, '#ffffff');
  strip('m08-l02-face-steps', 'A 3D unicorn horn and gem on the forehead, brown skin, eyes closed, light from the top left, in five pictures. 1: a light sketch of a curved horn rising from between the brows, with a small hexagon gem at its base. 2: lilac midtone on the horn and blue on the gem. 3: darker shades on the right side of the horn and on the bottom-right gem facets. 4: lighter lilac on the left side, spiral grooves and light top-left facets. Done: white shines, thin outlines, a soft cast shadow on the right and a few white dots and a sparkle.', [
    F(1, '1', 'Light sketch'), F(2, '2', 'Midtones'), F(3, '3', 'Shadows right'), F(4, '4', 'Lights left'), F(5, 'Done', 'Shine, cast shadow', done),
  ], { pw: 175, gap: 30 });
}

{
  // Common 3D mistakes, on teal balls.
  const V = [0, 0, 240, 220];
  const T = P.teal;
  const ground = `<rect x="0" y="178" width="240" height="42" fill="#f1ebe3"/>`;
  strip('m08-l02-mistakes', 'A well-shaded ball and three common mistakes, light from the top left. Good: highlight top left, a soft change to a dark teal shadow bottom right, reflected light and a cast shadow. Avoid: black used for the shadow, so the ball looks gray and dirty. Avoid: highlights on two sides, so the light seems to come from everywhere and the ball looks flat. Avoid: light and dark halves with no midtone between them, so it looks like a split ball, not a round one.', [
    good(paperPanel(ground + sphere(120, 110, 66, T, { ground: '#8a7a6a' }) + sunIcon(26, 26, 10) + tick(220, 26, 16), V, 'Good', 'One light, soft change')),
    bad(paperPanel(ground + sphere(120, 110, 66, T, { darkC: '#333333', ground: '#8a7a6a' }) + sunIcon(26, 26, 10) + cross(220, 26, 16), V, 'Avoid', 'Black shadow')),
    bad(paperPanel(ground + sphere(120, 110, 66, T, { ground: '#8a7a6a', light2: true }) + sunIcon(26, 26, 10) + cross(220, 26, 16), V, 'Avoid', 'Light from two sides')),
    bad(paperPanel(ground + sphere(120, 110, 66, T, { ground: '#8a7a6a', hard: true }) + sunIcon(26, 26, 10) + cross(220, 26, 16), V, 'Avoid', 'No midtone')),
  ], { pw: 180, gap: 24, arrows: false });
}


// =================================================================================
// 08.3 Scales, lace and stencils (skin: tan, deep, medium)
// =================================================================================
const SEA = [P.teal, '#2f7fd6', P.purple];

// Scale centers inside a box, ordered bottom row first (upper rows overlap the tops of lower ones).
function scaleGrid(x0, y0, w, h, r) {
  const out = [], rows = Math.ceil(h / r) + 2, cols = Math.ceil(w / (2 * r)) + 2;
  for (let j = rows - 1; j >= 0; j--) for (let i = -1; i < cols; i++) out.push([x0 + i * 2 * r + (j % 2 ? r : 0), y0 + j * r]);
  return out;
}
// Mask: scale cells white, gaps black (paint through a scale stencil). invert: cells black (the stencil sheet).
function scaleMask(x0, y0, w, h, r, gap = 2.4, { invert = false, window = null } = {}) {
  const id = nid('sm'), on = invert ? '#000' : '#fff', off = invert ? '#fff' : '#000';
  const cells = scaleGrid(x0, y0, w, h, r).map(([x, y]) => `<circle cx="${n1(x)}" cy="${n1(y)}" r="${r}" fill="${on}" stroke="${off}" stroke-width="${gap}"/>`).join('');
  const inner = window ? `<rect x="-500" y="-500" width="2000" height="2000" fill="${off}"/><g clip-path="url(#${id}w)">${cells}</g>` : `<rect x="-500" y="-500" width="2000" height="2000" fill="${off}"/>${cells}`;
  return { def: `<defs>${window ? `<clipPath id="${id}w"><path d="${window}"/></clipPath>` : ''}<mask id="${id}" maskUnits="userSpaceOnUse" x="-500" y="-500" width="2000" height="2000">${inner}</mask></defs>`, url: `url(#${id})` };
}
// Bottom arcs (C-strokes turned on their side) of every scale, as pressure strokes.
const uPts = (x, y, r, a0 = 180, a1 = 0, n = 9) => Array.from({ length: n }, (_, k) => pol(x, y, r, a0 + ((a1 - a0) * k) / (n - 1)));
function scaleStrokes(centers, r, color, w = 4) { return centers.map(([x, y]) => stroke(uPts(x, y, r * 0.97, 175, 5), { w, color })).join(''); }
// Shaded scale cells: each cell darker at the top (tucked under the row above) and lighter at the rim.
function scaleCells(centers, r, colorAt, { gap = 1.6, gapColor = null } = {}) {
  return centers.map(([x, y]) => {
    const c = colorAt(x, y), g = linG(x, y - r, x, y + r, [[0, shade(c, 0.5)], [0.45, c], [0.85, light(c, 0.2)], [1, light(c, 0.35)]]);
    return g.def + `<circle cx="${n1(x)}" cy="${n1(y)}" r="${r}" fill="${g.url}" stroke="${gapColor ?? shade(c, 0.6)}" stroke-width="${gap}"/>`;
  }).join('');
}
const scaleShine = (centers, r, every = 1, op = 0.9) => centers.filter((_, i) => i % every === 0).map(([x, y]) => stroke(uPts(x, y, r * 0.72, 160, 112, 5), { w: r * 0.16, color: '#ffffff', opacity: op })).join('');
// Color of a soft diagonal gradient at (x, y) inside box [x0, y0, w, h].
const gradAt = (colors, x0, y0, w, h) => (x, y) => ramp(colors, Math.max(0, Math.min(1, ((x - x0) / w) * 0.7 + ((y - y0) / h) * 0.3)), 1);

// Rounded rectangle path.
const rrD = (x, y, w, h, r = 10) => `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;

{
  // Using a scale stencil on a tan forearm.
  const V = [0, 0, 300, 220];
  const arm = forearm('tan');
  const base = clipTo(ARMCLIP, blendPatch(150, 108, 115, 50, SEA, { seed: 31, inner: 0.65 }));
  const WIN = rrD(92, 76, 116, 64, 14);
  const R = 11;
  const holes = scaleMask(92, 76, 116, 64, R, 2.6, { window: WIN });
  const paint = (op = 0.85) => `${holes.def}<g mask="${holes.url}" opacity="${op}"><rect x="80" y="60" width="140" height="100" fill="#2a1f6e"/></g>`;
  const sheet = (dy = 0, op = 0.86) => {
    const m = scaleMask(92, 76 + dy, 116, 64, R, 2.6, { invert: true, window: rrD(92, 76 + dy, 116, 64, 14) });
    return `${m.def}<g mask="${m.url}"><rect x="62" y="${48 + dy}" width="176" height="120" rx="8" fill="#e7f1f7" opacity="${op}"/></g><rect x="62" y="${48 + dy}" width="176" height="120" rx="8" fill="none" stroke="#9fb3c2" stroke-width="1.6"/>`;
  };
  const finger = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="15" ry="11" fill="${SKIN.medium}" stroke="${OUTLINE}" stroke-width="1.6"/><path d="M${x - 6} ${y - 3}q6 -5 12 0" fill="none" stroke="#f3e3d6" stroke-width="3" stroke-linecap="round"/>`;
  const spongeSide = (x, y) => `<rect x="${x - 26}" y="${y - 16}" width="52" height="32" rx="7" fill="#f6e7d0" stroke="#c8a67a" stroke-width="2"/><rect x="${x - 26}" y="${y + 9}" width="52" height="7" rx="3" fill="#2a1f6e" opacity="0.8"/>`;
  const result = paint() + clipTo(WIN, scaleShine(scaleGrid(92, 76, 116, 64, R), R * 0.97, 2, 0.85));
  strip('m08-l03-stencil-steps', 'Using a scale stencil on a tan forearm in five pictures. 1: sponge a teal, blue and purple base and let it dry. 2: lay the plastic stencil flat and hold it down with two fingers so it cannot move. 3: dab dark purple through the holes with a nearly dry sponge, working from the edges in. 4: lift the stencil straight up, without sliding it. Done: crisp dark scales over the soft base, with a few white highlights on the scales.', [
    paperPanel(arm + base, V, '1', 'Base, let it dry'),
    paperPanel(arm + base + sheet() + finger(70, 58) + finger(232, 160), V, '2', 'Hold it flat'),
    paperPanel(arm + base + paint() + sheet() + finger(70, 58) + spongeSide(150, 34) + arrow([[150, 52], [150, 74]], { width: 3, head: 8 }) + arrow([[248, 108], [222, 108]], { width: 2.5, head: 7 }) + arrow([[52, 108], [78, 108]], { width: 2.5, head: 7 }), V, '3', 'Dab, nearly dry'),
    paperPanel(arm + base + paint() + `<g opacity="0.9">${sheet(-30, 0.7)}</g>` + arrow([[255, 60], [255, 20]], { width: 3, head: 9 }), [0, -20, 300, 220], '4', 'Lift straight up'),
    paperPanel(arm + base + result, V, 'Done', 'Crisp scales'),
  ], { pw: 190 });
}

{
  // Stencil mistakes on paper.
  const V = [0, 0, 240, 200];
  const WIN = rrD(40, 40, 160, 110, 16), R = 14;
  const m = scaleMask(40, 40, 160, 110, R, 3, { window: WIN });
  const layer = (c = P.purple) => `${m.def}<g mask="${m.url}"><rect x="20" y="20" width="200" height="160" fill="${c}"/></g>`;
  const smear = blur(`<g transform="translate(12 0)" opacity="0.75">${layer()}</g>`, 0).replace(/stdDeviation="0"/, `stdDeviation="9 0.5"`) + layer();
  strip('m08-l03-stencil-mistakes', 'A crisp stencil print and three common problems. Good: clean scale shapes with sharp edges. Avoid: a wet sponge, so the paint bleeds under the stencil and the shapes are fuzzy. Avoid: the stencil was slid sideways when lifted, so the paint is smeared in one direction. Avoid: the stencil moved while dabbing, so every scale has a doubled edge.', [
    good(paperPanel(layer() + tick(222, 182, 15), V, 'Good', 'Crisp edges')),
    bad(paperPanel(blur(layer(), 2.6) + cross(222, 182, 15), V, 'Avoid', 'Wet sponge: bleeds')),
    bad(paperPanel(smear + cross(222, 182, 15), V, 'Avoid', 'Slid off: smeared')),
    bad(paperPanel(`<g opacity="0.6"><g transform="translate(5 4)">${layer()}</g></g>` + layer() + cross(222, 182, 15), V, 'Avoid', 'Moved: double edges')),
  ], { pw: 180, gap: 24, arrows: false });
}

{
  // DIY stencils: tools on top, prints underneath.
  const V = [0, 0, 240, 180];
  // plastic folder with cut holes
  const folderHoles = [star(80, 70, 22, '#000'), star(150, 58, 14, '#000'), star(170, 110, 18, '#000'), star(95, 128, 12, '#000')].join('');
  const fm = nid('fm');
  const folder = `<defs><mask id="${fm}" maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="180"><rect width="240" height="180" fill="#fff"/>${folderHoles}</mask></defs>`
    + `<g transform="rotate(-4 120 90)"><rect x="40" y="25" width="170" height="135" rx="6" fill="#a5d8ff" opacity="0.85" mask="url(#${fm})"/><rect x="40" y="25" width="170" height="135" rx="6" fill="none" stroke="#4dabf7" stroke-width="2"/></g>`;
  // fishnet: a diamond grid of thin threads
  const net = (x0, y0, w, h, s, color, wd = 2) => { let o = ''; for (let k = -h; k < w + h; k += s) { o += `<path d="M${x0 + k} ${y0}L${x0 + k + h} ${y0 + h}" stroke="${color}" stroke-width="${wd}"/><path d="M${x0 + k} ${y0 + h}L${x0 + k + h} ${y0}" stroke="${color}" stroke-width="${wd}"/>`; } return o; };
  const fishnet = clipTo('M40 30C90 20 160 36 205 28L210 152C160 160 90 146 36 156Z', `<rect x="30" y="20" width="190" height="145" fill="#f1f3f5"/>` + net(30, 20, 190, 145, 22, '#212529', 2.6));
  // lace fabric: flowers and scallops on a fine net
  const laceMotifs = (c, sw) => {
    let o = '';
    for (const [x, y] of [[80, 70], [160, 70], [120, 118], [60, 130], [180, 130]]) {
      for (let k = 0; k < 6; k++) { const [px, py] = pol(x, y, 11, k * 60); o += `<circle cx="${n1(px)}" cy="${n1(py)}" r="6" fill="${c}"/>`; }
      o += `<circle cx="${x}" cy="${y}" r="5" fill="${c}"/>`;
    }
    o += line([[40, 34], [80, 46], [120, 34], [160, 46], [200, 34]], { w: sw, color: c });
    return o;
  };
  const lace = clipTo('M40 26H205V160H40Z', `<rect x="30" y="20" width="190" height="145" fill="#5c636a"/>` + net(30, 20, 190, 145, 12, '#ffffff', 1.2) + laceMotifs('#ffffff', 5));
  // prints on skin
  const skinBox = (inner, skin = 'medium') => `<path d="${rrD(30, 25, 180, 135, 14)}" fill="${SKIN[skin]}"/>` + clipTo(rrD(30, 25, 180, 135, 14), inner);
  const starPrint = skinBox([star(80, 70, 22, P.gold), star(150, 58, 14, '#ffffff'), star(170, 110, 18, P.gold), star(95, 128, 12, '#ffffff')].join(''), 'deep');
  const dm = nid('dm');
  const fishPrint = skinBox(`<defs><mask id="${dm}" maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="180"><rect width="240" height="180" fill="#fff"/>${net(30, 20, 190, 145, 22, '#000', 3)}</mask></defs>`
    + `<g mask="url(#${dm})">${blendPatch(120, 92, 110, 80, SEA, { seed: 41, inner: 0.7, tex: false })}</g>`, 'medium');
  const lm = nid('lm');
  const lacePrint = skinBox(`<defs><mask id="${lm}" maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="180"><rect width="240" height="180" fill="#fff"/>${laceMotifs('#000', 5)}${net(30, 20, 190, 145, 12, '#000', 1.4)}</mask></defs>`
    + `<g mask="url(#${lm})"><rect x="30" y="25" width="180" height="135" fill="${P.purple}" opacity="0.9"/></g>`, 'tan');
  strip('m08-l03-diy', 'Three home-made stencils and what they print. Top row, the tools: a piece of a clear blue plastic folder with star shapes cut out; a piece of fishnet stocking; a piece of lace fabric with little flowers on a fine net. Bottom row, the prints on skin: gold and white stars on deep skin; a teal-to-purple gradient broken into diamond scales by the fishnet threads on medium skin; a purple lace print on tan skin, where the flowers stay skin-colored and the net leaves a fine pattern.', [
    { ...paperPanel(folder, V), label: 'Plastic folder', labelColor: INK },
    { ...paperPanel(fishnet, V), label: 'Fishnet (new, washed)', labelColor: INK },
    { ...paperPanel(lace, V), label: 'Lace fabric (new, washed)', labelColor: INK },
    { ...paperPanel(starPrint, V), label: 'Stars', labelColor: OK },
    { ...paperPanel(fishPrint, V), label: 'Diamond scales', labelColor: OK },
    { ...paperPanel(lacePrint, V), label: 'Lace print', labelColor: OK },
  ], { cols: 3, pw: 220, gap: 26, arrows: false });
}

{
  // Freehand scales with C-strokes on paper.
  const V = [0, 0, 260, 220];
  const R = 17, x0 = 30, y0 = 40, w = 200, h = 140;
  const cellsAll = scaleGrid(x0, y0, w, h, R).filter(([x, y]) => x > 20 && x < 245 && y > 35 && y < 190);
  const maxY = Math.max(...cellsAll.map((c) => c[1]));
  const bottomRow = cellsAll.filter((c) => c[1] === maxY);
  const box = `<path d="${rrD(15, 22, 230, 180, 10)}" fill="#ffffff"/>`;
  const g0 = linG(20, 30, 240, 190, SEA.map((c, i) => [(i / 2).toFixed(2), c])); const base = g0.def + `<rect x="15" y="22" width="230" height="180" fill="${g0.url}"/>`;
  const ink = '#1f1650';
  const clip = (c) => clipTo(rrD(15, 22, 230, 180, 10), c);
  const shaded = scaleCells(cellsAll, R, gradAt(SEA, 20, 30, 230, 170), { gap: 1.4 });
  strip('m08-l03-scales-freehand', 'Freehand scales on paper in five pictures. 1: sponge a teal, blue and purple base. 2: paint the bottom row of scales as C-strokes turned on their side, like a row of U shapes, in dark purple. 3: paint the next rows above, each U starting in the gap between two U shapes below, like bricks. 4: shade each scale darker at the top, where it tucks under the row above. Done: a short white highlight inside the bottom curve of each scale, and a few white dots.', [
    paperPanel(box + clip(base), V, '1', 'Base blend'),
    paperPanel(box + clip(base + scaleStrokes(bottomRow, R, ink, 4.5)), V, '2', 'Bottom row of U strokes'),
    paperPanel(box + clip(base + scaleStrokes(cellsAll, R, ink, 4.5)), V, '3', 'Rows above, offset'),
    paperPanel(box + clip(shaded + scaleStrokes(cellsAll, R, ink, 3)), V, '4', 'Darker at the top'),
    paperPanel(box + clip(shaded + scaleStrokes(cellsAll, R, ink, 3) + scaleShine(cellsAll, R, 1)) + dots([[212, 40], [226, 54]], 2, 3, 2, '#ffffff'), V, 'Done', 'White highlights'),
  ], { pw: 180, gap: 34 });
}

// Lace pieces along a baseline (scallops hang below it; the net sits above it).
function laceParts(basePts, n, depth, color = '#ffffff', stage = 5, { w = 2.4 } = {}) {
  const fr = frameOf(basePts, 30), hw = () => depth;
  const P2 = (t, f) => at(fr, Math.max(0, Math.min(1, t)), f, hw);
  let o = '';
  for (let k = 0; k < n; k++) {
    const t0 = k / n, t1 = (k + 1) / n;
    o += line(Array.from({ length: 11 }, (_, s) => P2(t0 + ((t1 - t0) * s) / 10, Math.sin((Math.PI * s) / 10))), { w, color });
    if (stage >= 2) { const [lx, ly] = P2((t0 + t1) / 2, 0.42); o += `<circle cx="${n1(lx)}" cy="${n1(ly)}" r="${n1(depth * 0.27)}" fill="none" stroke="${color}" stroke-width="${n1(w * 0.75)}"/>`; }
    if (stage >= 3) { const [jx, jy] = P2(t0, 0); o += dot(jx, jy, w * 1.4, color); const [px, py] = P2((t0 + t1) / 2, 1.45); o += dot(px, py, w * 1.05, color); }
  }
  if (stage >= 3) { const [jx, jy] = P2(1, 0); o += dot(jx, jy, w * 1.4, color); }
  if (stage >= 4) {
    // A fine diamond net between the baseline and a line 2.4 depths above it, then a dot flower in every other gap.
    const ln = (pts) => line(pts, { w: w * 0.4, color, opacity: 0.8 });
    const top = -2.4, dt = 1 / (2 * n), m = 12;
    for (let k = -2 * n; k <= 4 * n; k++) for (const dir of [1, -1]) {
      const pts = [];
      for (let s = 0; s <= m; s++) { const t = k * dt + dir * (s / m) * 2 * dt * 1.2, f = -0.08 + (top + 0.08) * (s / m); if (t >= 0 && t <= 1) pts.push(P2(t, f)); }
      if (pts.length > 1) o += ln(pts);
    }
    for (let k = 0; k < n; k++) { const [cx, cy] = P2((k + 0.5) / n, -1.3); for (let q = 0; q < 5; q++) { const [x, y] = pol(cx, cy, depth * 0.3, q * 72 - 90); o += dot(x, y, w * 0.95, color); } o += dot(cx, cy, w * 0.75, color); }
  }
  return o;
}

{
  // Freehand lace on deep skin.
  const V = [0, 0, 260, 180];
  const skin = `<path d="${rrD(10, 10, 240, 160, 12)}" fill="${SKIN.deep}"/>`;
  const B = [[25, 100], [90, 92], [170, 92], [235, 100]];
  const L = (s) => skin + laceParts(B, 5, 24, '#ffffff', s);
  strip('m08-l03-lace', 'Freehand white lace on deep skin in four pictures. 1: a row of scallops, round U shapes joined along a gentle curve. 2: a smaller loop inside each scallop. 3: a dot at every point where two scallops meet and a hanging dot under each scallop. Done: a fine net of crossing thin lines above the scallops, with a small dot flower in each gap.', [
    paperPanel(L(1), V, '1', 'Scallop edge'),
    paperPanel(L(2), V, '2', 'Loops inside'),
    paperPanel(L(3), V, '3', 'Dots'),
    paperPanel(L(4), V, 'Done', 'Net and dot flowers'),
  ], { pw: 200 });
}

{
  // On the face: stencil scales around the temples and a lace band above the brows (deep skin).
  const view = [60, 70, 280, 260];
  const AREA = 'M158 132C122 124 96 150 92 186C88 222 96 256 118 280C130 292 146 296 156 290C138 278 122 260 114 240C106 218 106 196 114 180C124 162 140 146 158 132Z';
  const R = 9;
  const base = clipTo(AREA, blendPatch(126, 210, 60, 96, SEA, { deg: -100, seed: 61, inner: 0.72 }));
  const m = scaleMask(80, 110, 110, 200, R, 1.8, { window: AREA });
  const scales = `${m.def}<g mask="${m.url}" opacity="0.8"><rect x="80" y="110" width="110" height="200" fill="#241a5e"/></g>`;
  const shine = clipTo(AREA, scaleShine(scaleGrid(80, 110, 110, 200, R), R * 0.95, 3, 0.85)) + dots([[150, 300], [162, 306]], 2, 2.4, 1.8, '#ffffff');
  const laceB = [[138, 160], [170, 150], [230, 150], [262, 160]];
  const lace = laceParts(laceB, 5, 12, '#ffffff', 4, { w: 1.7 });
  const both = (c) => c + mirror(c);
  const F = (under, over, lab, cap) => ({ content: face(under, 'deep', over, { eyes: 'open' }), view, label: lab, caption: cap });
  strip('m08-l03-face-steps', 'Scales and lace on deep skin in four pictures. 1: a teal, blue and purple sponge base in a curve from the temple around the outside of each eye onto the cheekbone, never on the eyelid. 2: dark scales dabbed through a scale stencil held flat on the temple and cheekbone, not over the eyes. 3: white highlights on some of the scales and a few dots. Done: a band of freehand white lace across the forehead above the brows: scallops, loops, dots and a fine net with dot flowers.', [
    F(both(base), '', '1', 'Base blend'),
    F(both(base + scales), '', '2', 'Stencil scales'),
    F(both(base + scales + shine), '', '3', 'Highlights'),
    F(both(base + scales + shine) + lace, '', 'Done', 'Freehand lace'),
  ], { pw: 210 });
}


// =================================================================================
// 08.4 Simple illusions (skin: light, brown, medium, tan, fair)
// =================================================================================
// Every illusion is drawn in its own 260 x 210 box, so the same art can sit on a skin panel or,
// scaled with a transform, on the face.
const skinBox = (skin) => `<path d="${rrD(8, 8, 244, 194, 12)}" fill="${SKIN[skin] ?? skin}"/>`;
const PENCIL = '#8a7462';
const inBox = (c) => clipTo(rrD(8, 8, 244, 194, 12), c);
const rnd8 = (seed) => rng(seed);

// ---------- porcelain crack ----------
const CRACK = {
  main: [[24, 34], [52, 52], [70, 46], [98, 76], [124, 82], [144, 110], [168, 116], [186, 144], [212, 156], [238, 186]],
  branches: [
    [[98, 76], [106, 54], [122, 42], [128, 20]],
    [[144, 110], [130, 132], [138, 150], [122, 176]],
    [[186, 144], [208, 128], [232, 124]],
    [[124, 82], [148, 74], [160, 60]],
    [[52, 52], [44, 76], [52, 92]],
  ],
  chip: [[146, 104], [166, 100], [182, 114], [172, 130], [152, 122]],
};
const crackLine = (pts, w, color, dx = 0, dy = 0, op = 1) => stroke(pts.map(([x, y]) => [x + dx, y + dy]), { w, color, kind: 'end', opacity: op });
function crackArt(stage, { base = true } = {}) {
  const lines = [[CRACK.main, 3.4], ...CRACK.branches.map((b) => [b, 2.2])];
  let o = '';
  // porcelain base: a pale, smooth sponge layer
  if (base) o += faded(`<rect x="0" y="0" width="260" height="210" fill="#f6f2f2"/>` + texture('M0 0H260V210H0Z', [0, 0, 260, 210], { seed: 71, color: '#ffffff', opacity: 0.4 }), 130, 105, 140, 112, 0.62);
  if (stage === 1) return o;
  if (stage >= 3) o += blur(lines.map(([p, w]) => crackLine(p, w * 2.4, '#8d8794', -1.8, -1.8, 0.55)).join(''), 1.2);
  o += lines.map(([p, w]) => crackLine(p, w, '#33293a')).join('');
  if (stage >= 4) o += lines.map(([p, w]) => crackLine(p, w * 0.55, '#ffffff', 1.9, 1.9, 0.95)).join('');
  if (stage >= 5) {
    const d = polyD(CRACK.chip, true);
    const g = linG(146, 100, 180, 130, [[0, '#8f8696'], [1, '#e4dee4']]);
    o += g.def + `<path d="${d}" fill="${g.url}"/>`;
    o += clipTo(d, stroke([CRACK.chip[2], CRACK.chip[0], CRACK.chip[1]], { w: 7, color: '#2a2230', kind: 'none', opacity: 0.8 })) + stroke([CRACK.chip[1], CRACK.chip[2]].map(([x, y]) => [x - 1, y - 1]), { w: 2, color: '#ffffff', kind: 'none' });
    o += `<path d="${d}" fill="none" stroke="#33293a" stroke-width="1.6" stroke-linejoin="round"/>`;
  }

  return o;
}

// ---------- galaxy zipper ----------
const ZX = 130, ZT = 28, ZO = 140, ZB = 200;
const zHW = (y) => (y <= ZT || y >= ZO ? 0 : 34 * Math.sin((Math.PI * (y - ZT)) / (ZO - ZT)) ** 0.75);
const zEdge = (side) => { const o = []; for (let y = ZT; y <= ZO; y += 4) o.push([ZX + side * zHW(y), y]); return o; };
const zOpenD = () => polyD([...zEdge(-1), ...zEdge(1).reverse()], true);
function galaxy(d, [x, y, w, h], seed = 3) {
  const g = radG(x + w * 0.45, y + h * 0.45, Math.max(w, h) * 0.7, [[0, '#7b4bd1'], [0.45, '#3a2a8f'], [1, '#120c3a']]);
  const r = rnd8(seed), stars = [];
  for (let i = 0; i < 40; i++) stars.push(dot(x + r() * w, y + r() * h, 0.5 + r() * 1.3, '#ffffff'));
  return clipTo(d, g.def + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${g.url}"/>` + glowBlob(x + w * 0.4, y + h * 0.55, w * 0.35, '#ff6fd8', 0.35) + stars.join('') + sparkle(x + w * 0.55, y + h * 0.3, 6, '#ffffff') + sparkle(x + w * 0.35, y + h * 0.7, 4, '#ffffff'));
}
const glowBlob = (cx, cy, r, c, op) => { const g = radG(cx, cy, r, [[0, c, op], [1, c, 0]]); return g.def + `<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" fill="${g.url}"/>`; };
function tooth(x, y, ang, { shine = false } = {}) {
  const g = linG(-4, -3, 4, 3, [[0, '#f1f3f5'], [1, '#868e96']]);
  return g.def.replace('gradientUnits="userSpaceOnUse"', 'gradientUnits="userSpaceOnUse"') + `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(ang)})"><rect x="-5" y="-3" width="10" height="6" rx="2" fill="${g.url}" stroke="#495057" stroke-width="0.9"/>${shine ? '<path d="M-3 -1.6H2" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>' : ''}</g>`;
}
function zipperArt(stage) {
  let o = '';
  if (stage === 1) return `<path d="${zOpenD()}" fill="none" stroke="${PENCIL}" stroke-width="1.6" stroke-dasharray="5 4"/><path d="M${ZX} ${ZO}V${ZB}" stroke="${PENCIL}" stroke-width="1.6" stroke-dasharray="5 4"/>`;
  o += galaxy(zOpenD(), [ZX - 40, ZT, 80, ZO - ZT], 9);
  if (stage >= 4) o += clipTo(zOpenD(), blur(`<path d="${polyD(zEdge(-1))}" fill="none" stroke="#000" stroke-width="10" opacity="0.6"/>`, 3));
  if (stage >= 3) {
    const sh = stage >= 4;
    for (let y = ZT + 6, k = 0; y < ZO - 3; y += 7, k++) {
      const dy = 0.5, sl = (zHW(y + dy) - zHW(y - dy)) / (2 * dy), a = (Math.atan(sl) * 180) / Math.PI;
      o += tooth(ZX - zHW(y) + 1, y, -a, { shine: sh }) + tooth(ZX + zHW(y + 3.5) - 1, y + 3.5, a, { shine: sh });
    }
    for (let y = ZO, k = 0; y < ZB; y += 6, k++) o += tooth(ZX + (k % 2 ? 3 : -3), y, 0, { shine: sh });
  }
  if (stage >= 4) {
    // slider and pull tab
    const g = linG(ZX - 9, ZO - 6, ZX + 9, ZO + 14, [[0, '#f8f9fa'], [1, '#868e96']]);
    o += castShadow(`M${ZX - 9} ${ZO - 6}H${ZX + 9}L${ZX + 6} ${ZO + 14}H${ZX - 6}Z M${ZX - 5} ${ZO + 12}H${ZX + 5}V${ZO + 40}H${ZX - 5}Z`, 4, 4, '#000', 0.35, 1.5);
    o += g.def + `<path d="M${ZX - 9} ${ZO - 6}H${ZX + 9}L${ZX + 6} ${ZO + 14}H${ZX - 6}Z" fill="${g.url}" stroke="#495057" stroke-width="1"/>`;
    o += `<rect x="${ZX - 5}" y="${ZO + 12}" width="10" height="28" rx="4" fill="${g.url}" stroke="#495057" stroke-width="1"/><rect x="${ZX - 2}" y="${ZO + 28}" width="4" height="8" rx="2" fill="#495057"/>`;
    o += `<path d="M${ZX - 6} ${ZO - 3}H${ZX + 2}" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/><path d="M${ZX - 2.5} ${ZO + 15}V${ZO + 24}" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round"/>`;
  }
  if (stage >= 5) o += sparkle(ZX + 2, ZO - 2, 5, '#ffffff') + sparkle(ZX + 20, ZT + 30, 4, '#ffffff');
  return o;
}

// ---------- stitched seam ----------
const SEAM = [[28, 160], [80, 128], [140, 110], [196, 84], [236, 50]];
function stitchArt(stage) {
  const fr = frameOf(SEAM, 30), hw = () => 13;
  let o = line(SEAM, { w: 2.2, color: '#8c4f5c', opacity: 0.85 });
  if (stage >= 3) o = blur(line(SEAM, { w: 6, color: '#8c4f5c', opacity: 0.35 }), 2) + o;
  if (stage === 1) return o;
  const ts = Array.from({ length: 9 }, (_, i) => 0.06 + i * 0.11);
  for (const t of ts) {
    const a = at(fr, t - 0.012, -1, hw), b = at(fr, t + 0.012, 1, hw);
    if (stage >= 3) o += blur(`<path d="M${n1(a[0] + 1.5)} ${n1(a[1] + 2.5)}L${n1(b[0] + 1.5)} ${n1(b[1] + 2.5)}" stroke="#3a2a22" stroke-width="3.6" stroke-linecap="round" opacity="0.45"/>`, 1.2)
      + dot(a[0], a[1], 2.2, '#4a2f2a') + dot(b[0], b[1], 2.2, '#4a2f2a');
    o += `<path d="M${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}" stroke="#1d1d22" stroke-width="3.2" stroke-linecap="round"/>`;
    if (stage >= 4) o += `<path d="M${n1(a[0] + (b[0] - a[0]) * 0.15)} ${n1(a[1] + (b[1] - a[1]) * 0.15 - 0.8)}L${n1(a[0] + (b[0] - a[0]) * 0.55)} ${n1(a[1] + (b[1] - a[1]) * 0.55 - 0.8)}" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" opacity="0.9"/>`;
  }
  if (stage >= 4) o += line(SEAM.map(([x, y]) => [x + 1.5, y + 2.6]), { w: 1.1, color: '#ffffff', opacity: 0.45 });
  return o;
}

// Shadow inside an opening, along the edges facing the light: the area of the hole outside a copy
// of itself shifted by (dx, dy), blurred.
const innerShadow = (d, dx, dy, op = 0.65) => clipTo(d, blur(`<path d="M-50 -50H310V260H-50Z ${d}" transform="translate(${dx} ${dy})" fill="#000" fill-rule="evenodd" opacity="${op}"/>`, 4));

// ---------- peeled skin showing scales ----------
function peelShape(seed = 5) {
  const r = rnd8(seed), pts = [];
  for (let i = 0; i < 26; i++) { const a = -150 + (i * 360) / 26; const k = 0.82 + r() * 0.22 + (i % 2 ? -0.06 : 0.06); pts.push([120 + Math.cos((a * Math.PI) / 180) * 64 * k, 118 + Math.sin((a * Math.PI) / 180) * 46 * k, a]); }
  return pts;
}
function peelArt(stage, skin = 'tan') {
  const pts = peelShape(7), hole = polyD(pts.map(([x, y]) => [x, y]), true);
  // hinge: points with angle between -80 and 0 (top right edge)
  const hinge = pts.filter((p) => p[2] >= -84 && p[2] <= 4), others = pts.filter((p) => p[2] > 4).concat(pts.filter((p) => p[2] < -84));
  const A = hinge[0], B = hinge[hinge.length - 1];
  const ux = B[0] - A[0], uy = B[1] - A[1], ul = Math.hypot(ux, uy), nx = -uy / ul, ny = ux / ul;
  const refl = others.map(([x, y]) => { const d = (x - A[0]) * nx + (y - A[1]) * ny; return [x - 2 * d * nx * 0.78, y - 2 * d * ny * 0.78]; });
  const flapPts = [...hinge.map(([x, y]) => [x, y]), ...refl];
  const flap = polyD(flapPts, true);
  if (stage === 1) return `<path d="${hole}" fill="none" stroke="${PENCIL}" stroke-width="1.6" stroke-dasharray="5 4" stroke-linejoin="round"/>`;
  const R = 9, cells = scaleGrid(40, 60, 170, 120, R);
  let o = clipTo(hole, scaleCells(cells, R, gradAt([P.lime, P.green, P.teal], 50, 70, 150, 100), { gap: 1.2 }) + scaleShine(cells, R, 2, 0.8));
  if (stage >= 4) o += innerShadow(hole, 12, 12, 0.6);
  if (stage >= 3) {
    const sk = SKIN[skin] ?? skin;
    if (stage >= 4) o += castShadow(flap, 7, 9, '#000', 0.3, 3.5);
    const g = linG(A[0], A[1], A[0] - nx * 60, A[1] - ny * 60, [[0, shade(sk, 0.18)], [0.5, mix(sk, '#ffffff', 0.08)], [1, mix(sk, '#ffffff', 0.18)]]);
    o += g.def + `<path d="${flap}" fill="${g.url}" stroke="${shade(sk, 0.35)}" stroke-width="1.2" stroke-linejoin="round"/>`;
    if (stage >= 5) o += line(hinge.map(([x, y]) => [x - nx * 3, y - ny * 3]), { w: 2, color: '#ffffff', opacity: 0.75 });
  }
  if (stage >= 5) o += line(pts.filter((p) => p[2] > 10 && p[2] < 120).map(([x, y]) => [x + 1.6, y + 1.6]), { w: 1.4, color: '#ffffff', opacity: 0.6 });
  o += `<path d="${hole}" fill="none" stroke="${shade(SKIN[skin] ?? skin, 0.4)}" stroke-width="1.2" stroke-linejoin="round"/>`;
  return o;
}

{
  // Porcelain crack, step by step (light skin).
  const V = [0, 0, 260, 210];
  const P1 = (s, lab, cap) => paperPanel(skinBox('light') + inBox(crackArt(s)) + sunIcon(30, 30, 9), V, lab, cap);
  strip('m08-l04-crack-steps', 'A porcelain crack on light skin in five pictures, light from the top left. 1: a smooth, pale porcelain base sponged on and faded at the edges. 2: thin, jagged dark lines that branch like a real crack, thick at the start and thinning to a point. 3: a soft gray shadow along the top-left side of every line. 4: a thin white line along the bottom-right side of every line. Done: a small chip where a piece seems to be missing, dark at the top-left edge and light at the bottom right.', [
    P1(1, '1', 'Porcelain base'), P1(2, '2', 'Jagged, branching lines'), P1(3, '3', 'Shadow: top-left side'), P1(4, '4', 'Shine: bottom-right side'), P1(5, 'Done', 'A missing chip'),
  ], { pw: 180, gap: 34 });
}

{
  // Galaxy zipper, step by step (brown skin).
  const V = [0, 0, 260, 210];
  const P1 = (s, lab, cap) => paperPanel(skinBox('brown') + inBox(zipperArt(s)) + sunIcon(30, 30, 9), V, lab, cap);
  strip('m08-l04-zipper-steps', 'A zipper that opens onto a starry galaxy, on brown skin, in five pictures. 1: a light outline of a long lens-shaped opening, and a line below it where the zipper is still closed. 2: fill the opening with dark navy and purple, a soft pink glow and tiny white stars. 3: small gray teeth along both edges of the opening, and interlocking teeth down the closed part. 4: a dark shadow inside the top-left edge of the opening, white shines on the teeth, and the silver slider and pull tab with a small cast shadow. Done: a sparkle on the slider and a faint light line along the bottom-right edge.', [
    P1(1, '1', 'Outline the opening'), P1(2, '2', 'Fill the inside'), P1(3, '3', 'Teeth on both edges'), P1(4, '4', 'Shadow, slider, shine'), P1(5, 'Done', 'Sparkle'),
  ], { pw: 180, gap: 34 });
}

{
  // Stitched seam and peeled skin.
  const V = [0, 0, 260, 210];
  const S = (s, lab, cap) => paperPanel(skinBox('medium') + inBox(stitchArt(s)) + sunIcon(30, 30, 9), V, lab, cap);
  const Pe = (s, lab, cap) => paperPanel(skinBox('tan') + inBox(peelArt(s, 'tan')) + sunIcon(30, 30, 9), V, lab, cap);
  strip('m08-l04-stitch', 'A stitched seam on medium skin in four pictures, light from the top left. 1: a thin, soft dusky-pink seam line. 2: short black stitches across it at even spaces. 3: a dark dot where each stitch enters the skin and a soft shadow below each stitch. Done: a thin white shine on each stitch and a faint light line below the seam.', [
    S(1, '1', 'Seam line'), S(2, '2', 'Stitches across'), S(3, '3', 'Holes and shadow'), S(4, 'Done', 'Shine'),
  ], { pw: 190, gap: 34 });
  strip('m08-l04-peel', 'Peeled skin showing dragon scales, on tan skin, in five pictures, light from the top left. 1: a dashed outline of a torn, ragged shape. 2: green scales painted inside it. 3: the peeled flap of skin curled back over the top-right edge, a little paler on its underside. 4: a shadow inside the top-left edge of the hole and a soft cast shadow under the flap. Done: a light line along the fold of the flap and along the bottom-right torn edge.', [
    Pe(1, '1', 'Tear outline'), Pe(2, '2', 'What is underneath'), Pe(3, '3', 'The curled flap'), Pe(4, '4', 'Shadows'), Pe(5, 'Done', 'Light edges'),
  ], { pw: 180, gap: 34 });
}

{
  // Depth: where the shadow goes decides whether a shape sinks in or pops out.
  const V = [0, 0, 260, 210];
  const hole = ellD(130, 112, 62, 52);
  const inside = galaxy(hole, [60, 55, 140, 115], 21);
  const shadowTL = clipTo(hole, blur(`<path d="${ellD(150, 130, 64, 54)}" fill="none" stroke="#000" stroke-width="26" opacity="0.65" transform="translate(0 0)"/>`, 4).replace('<path', '<path') );
  const shadowIn = (dx, dy) => clipTo(hole, blur(`<path d="M0 0H260V210H0Z ${ellD(130 + dx, 112 + dy, 62, 52)}" fill="#000" fill-rule="evenodd" opacity="0.7"/>`, 4));
  const rim = (deg0, deg1) => stroke(Array.from({ length: 9 }, (_, i) => { const a = deg0 + ((deg1 - deg0) * i) / 8; return [130 + 62 * Math.cos((a * Math.PI) / 180), 112 + 52 * Math.sin((a * Math.PI) / 180)]; }), { w: 3, color: '#ffffff', opacity: 0.85 });
  const edge = `<path d="${hole}" fill="none" stroke="#5b4636" stroke-width="1.4"/>`;
  void shadowTL;
  strip('m08-l04-depth', 'Where the shadow goes decides whether a painted shape sinks in or pops out, with the light from the top left. Good: a round opening onto a galaxy with a dark shadow just inside its top-left edge and a light rim on the bottom right: it looks like a hole in the skin. Avoid: the same opening with no shadow looks like a flat sticker. Avoid: the shadow inside the bottom-right edge and the light rim at the top left: now it looks like a dome sticking out, not a hole.', [
    good(paperPanel(skinBox('medium') + inside + shadowIn(14, 14) + rim(-10, 100) + edge + sunIcon(30, 30, 9) + tick(236, 188, 14), V, 'Good', 'Hole: shadow near the light')),
    bad(paperPanel(skinBox('medium') + inside + edge + sunIcon(30, 30, 9) + cross(236, 188, 14), V, 'Avoid', 'No shadow: flat')),
    bad(paperPanel(skinBox('medium') + inside + shadowIn(-14, -14) + rim(170, 280) + edge + sunIcon(30, 30, 9) + cross(236, 188, 14), V, 'Avoid', 'Wrong side: pops out')),
  ], { pw: 220, arrows: false });
}

{
  // The illusions on the face: placed with the face map, outside the eye area.
  const view = [60, 60, 280, 380];
  const placeAB = (art, a, b, A, B, flip = false) => {
    if (flip) { art = `<g transform="scale(-1 1)">${art}</g>`; a = [-a[0], a[1]]; b = [-b[0], b[1]]; }
    const k = Math.hypot(B[0] - A[0], B[1] - A[1]) / Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ang = (Math.atan2(B[1] - A[1], B[0] - A[0]) - Math.atan2(b[1] - a[1], b[0] - a[0])) * 180 / Math.PI;
    return `<g transform="translate(${n1(A[0])} ${n1(A[1])}) rotate(${n1(ang)}) scale(${k.toFixed(3)}) translate(${n1(-a[0])} ${n1(-a[1])})">${art}</g>`;
  };
  const crackFace = face(placeAB(crackArt(5, { base: false }), [24, 34], [238, 186], [158, 84], [98, 262], true), 'light');
  const zipFace = face(`<g transform="translate(84 272) rotate(-6) scale(0.44)">${zipperArt(5)}</g>`, 'brown');
  const stitchFace = face(placeAB(stitchArt(4), [28, 160], [236, 50], [128, 152], [276, 116]), 'fair');
  const peelFace = face(`<g transform="translate(198 246) scale(0.48)">${peelArt(5, 'tan')}</g>`, 'tan');
  strip('m08-l04-face-done', 'Four finished illusions on different skin tones, all kept outside the eye area. Porcelain crack, light skin: cracks run from the forehead down over the temple, around the outside of the eye. Galaxy zipper, brown skin: a short zipper on the cheek opens onto a starry galaxy. Stitched seam, fair skin: a row of stitches curves across the forehead. Peeled skin, tan skin: a small torn patch on the cheek is curled back to show green dragon scales.', [
    { content: crackFace, view, label: 'Crack', labelColor: OK, caption: 'Forehead to temple' },
    { content: zipFace, view, label: 'Zipper', labelColor: OK, caption: 'On the cheek' },
    { content: stitchFace, view, label: 'Stitches', labelColor: OK, caption: 'Across the forehead' },
    { content: peelFace, view, label: 'Peel', labelColor: OK, caption: 'On the cheek' },
  ], { pw: 175, gap: 22, arrows: false });
}

console.log('m08 diagrams written');
