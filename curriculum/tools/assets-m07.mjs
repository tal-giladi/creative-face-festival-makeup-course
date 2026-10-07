// Module 7 diagrams (Patterns and Complete Looks) and the P6 / P9 project images.
// Run: node curriculum/tools/assets-m07.mjs
import { plain, strip, faceLayer } from './lib/figure.mjs';
import { P, SOFT, INK, OK, BAD, ACCENT, label, arrow, badge, tick, cross, line, stroke, teardrop, petal, dot, dots, sponge, glow, gem, glitter, brush, pol, spline, polyD, rng } from './lib/art.mjs';
import { SKIN, L } from './lib/face.mjs';

const n1 = (v) => (Math.round(v * 10) / 10).toString();

// ---------- local helpers (not in the shared lib) ----------

// A face with paint below the features (eyes, brows, lips stay on top).
const face = (under, skin = 'medium', over = '', { eyes = 'open' } = {}) => faceLayer({ under, over, skin, eyes });

// Mirror across the face center line; paint one half and get both.
const mirror = (c) => `<g transform="translate(400 0) scale(-1 1)">${c}</g>`;
const both = (c) => c + mirror(c);

// Clip content to a path.
let kid = 0;
const clipTo = (d, content) => { const id = `m7c${kid++}`; return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id})">${content}</g>`; };

// Embed any content in a plain canvas box (x, y, w, h) showing `view`.
const embed = (content, [vx, vy, vw, vh], x, y, w, h, { bg = '#fbf8f4', frame = true } = {}) =>
  (frame ? `<rect x="${x - 1}" y="${y - 1}" width="${w + 2}" height="${h + 2}" rx="8" fill="#fff" stroke="#e3ddd5"/>` : '')
  + `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${bg}"/>${content}</svg>`;

// Offset a dense curve sideways: d(t) gives the offset (units) at t = 0..1 along the curve.
function offsetCurve(c, d) {
  const out = [];
  for (let i = 0; i < c.length; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const k = d(i / (c.length - 1));
    out.push([c[i][0] - dy * k, c[i][1] + dx * k]);
  }
  return out;
}
// Closed band between two dense curves of the same direction.
const bandD = (a, b) => polyD([...a, ...[...b].reverse()], true);

// Gray construction lines (guides you sketch lightly or imagine).
const GUIDE = '#b9b2a8';
const guideLine = (pts, w = 1.2) => line(pts, { w, color: GUIDE, dash: '4 4' });
const guideCircle = (cx, cy, r, w = 1.2) => `<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" fill="none" stroke="${GUIDE}" stroke-width="${w}" stroke-dasharray="4 4"/>`;

// Bright festival colors (same family as Module 5).
const C = {
  magenta: P.magenta, hotPink: '#ff2f8f', orange: '#ff7a12', yellow: '#ffd21f', lime: '#9be22e', teal: '#00b8a9',
  cyan: '#1fc7f2', blue: '#2563eb', purple: '#7b2fd0', violet: '#a96bf0', gold: '#e8b33a', red: '#e8273b', green: '#1fae4b',
};
const BLACK = P.black, WHITE = P.white;

// Eye area (left eye) as on the festival face map; mirror for the right.
const EYE_ZONE = 'M114 226C128 200 170 198 186 226C170 248 128 250 114 226Z';

// ===================================================================================
// 07.1 Dotwork and mandalas
// ===================================================================================

// A dot mandala centered at (cx, cy). Geometry is designed at radius 100 and scaled by s.
// pal: { center, ring, petal, big, small, tiny, hi }. stage 1..5 builds it up; guides draws the
// light construction circles and spokes.
function mandala(cx, cy, s, pal, { stage = 5, guides = false, n = 8, bold = 1 } = {}) {
  const o = [];
  const b = bold;
  const at = (r, deg) => pol(cx, cy, r * s, deg - 90);
  const step = 360 / n;
  if (guides) {
    for (const r of [20, 40, 64, 84]) o.push(guideCircle(cx, cy, r * s, 1));
    for (let i = 0; i < n; i++) { const a = at(12, i * step), b = at(96, i * step); o.push(guideLine([a, b], 1)); }
  }
  // center
  o.push(dot(cx, cy, 11 * s * b, pal.center));
  if (stage >= 2) for (let i = 0; i < n; i++) { const [x, y] = at(22, i * step); o.push(dot(x, y, 5 * s * b, pal.ring)); }
  if (stage >= 3) for (let i = 0; i < n; i++) { const a = i * step + step / 2; const [x, y] = at(47, a); o.push(teardrop(x, y, a + 90, 27 * s, 17 * s * b, pal.petal)); }
  if (stage >= 4) {
    for (let i = 0; i < n; i++) {
      const [x, y] = at(69, i * step + step / 2); o.push(dot(x, y, 7 * s * b, pal.big));
      const [u, v] = at(56, i * step); o.push(dot(u, v, 4.6 * s * b, pal.small));
    }
    for (let i = 0; i < n * 2; i++) { const [x, y] = at(81, i * step / 2 + step / 4); o.push(dot(x, y, 2.8 * s * b, pal.tiny)); }
  }
  if (stage >= 5) {
    for (let i = 0; i < n; i++) {
      const a = i * step + step / 2;
      [[89, 4.4], [98, 3.1], [105.5, 2]].forEach(([r, rr]) => { const [x, y] = at(r, a); o.push(dot(x, y, rr * s * b, pal.big)); });
      const [hx, hy] = at(69, a); o.push(dot(hx - 2 * s, hy - 2 * s, 2.2 * s * b, pal.hi));
      const [px, py] = at(47, a); o.push(dot(px - 1.5 * s, py - 1.5 * s, 3 * s * b, pal.hi));
    }
    o.push(dot(cx - 3 * s, cy - 3 * s, 3.4 * s * b, pal.hi));
  }
  return o.join('');
}

// Palettes for mandalas.
const PAL_PAPER = { center: C.magenta, ring: C.orange, petal: C.purple, big: C.teal, small: C.magenta, tiny: C.orange, hi: WHITE };
const PAL_FACE = { center: C.magenta, ring: C.yellow, petal: C.purple, big: C.cyan, small: C.yellow, tiny: WHITE, hi: WHITE };

// Dot arcs along the cheekbone (left side), stage 1..3.
function cheekArcs(pal = { a: C.cyan, b: C.yellow, c: WHITE, d: C.magenta }, { stage = 3 } = {}) {
  const A = [[160, 268], [140, 270], [122, 262], [109, 247], [102, 228], [100, 208]];
  const B = [[154, 283], [133, 285], [114, 277], [99, 261], [90, 241], [88, 220]];
  const o = [];
  o.push(dots(A, 7, 6, 3, pal.a));
  if (stage >= 2) o.push(dots(B, 7, 4.2, 2.2, pal.b));
  if (stage >= 3) {
    o.push(dots([[104, 196], [108, 184], [114, 174]], 3, 2.6, 1.6, pal.a));
    [[160, 268], [109, 247]].forEach(([x, y]) => o.push(dot(x - 1.6, y - 1.6, 1.7, pal.c)));
  }
  return o.join('');
}

{
  // Dot tools and sizes on paper: what makes which dot.
  const o = [];
  const tools = [
    ['Brush tip', 'tiny', 2.2, (x, y) => brush(x, y - 6, 118, 130, { size: 0.8, color: '#7b4a2a' })],
    ['Dotting tool, small end', 'small', 4, (x, y) => `<g transform="rotate(28 ${x} ${y})"><rect x="${x - 3}" y="${y - 118}" width="6" height="104" rx="3" fill="#868e96"/><circle cx="${x}" cy="${y - 10}" r="4.5" fill="#adb5bd" stroke="#495057"/></g>`],
    ['Brush handle end', 'medium', 6.5, (x, y) => `<g transform="rotate(28 ${x} ${y})"><rect x="${x - 6.5}" y="${y - 120}" width="13" height="114" rx="6.5" fill="#c0392b"/><rect x="${x - 7}" y="${y - 132}" width="14" height="16" fill="#b8bec6"/></g>`],
    ['Dotting tool, big end', 'big', 9, (x, y) => `<g transform="rotate(28 ${x} ${y})"><rect x="${x - 3}" y="${y - 120}" width="6" height="104" rx="3" fill="#868e96"/><circle cx="${x}" cy="${y - 10}" r="9.5" fill="#adb5bd" stroke="#495057"/></g>`],
    ['Cotton swab', 'extra big', 12, (x, y) => `<g transform="rotate(28 ${x} ${y})"><rect x="${x - 2.5}" y="${y - 126}" width="5" height="110" rx="2.5" fill="#e9ecef" stroke="#adb5bd"/><ellipse cx="${x}" cy="${y - 12}" rx="10" ry="14" fill="#fff" stroke="#adb5bd"/></g>`],
  ];
  tools.forEach(([name, size, r, art], i) => {
    const x = 20 + i * 168, y = 20;
    o.push(`<rect x="${x}" y="${y}" width="156" height="300" rx="12" fill="#fff" stroke="#e3ddd5" stroke-width="2"/>`);
    o.push(art(x + 70, y + 150));
    o.push(dots([[x + 30, y + 196], [x + 126, y + 196]], 4, r, r, C.purple));
    o.push(dots([[x + 30, y + 232], [x + 126, y + 232]], 4, r, r, C.teal));
    o.push(label(x + 78, y + 270, name, { size: 14, bold: true, halo: false }));
    o.push(label(x + 78, y + 290, `${size} dots`, { size: 14, color: SOFT, halo: false }));
  });
  plain('m07-l01-dot-tools', 'Five tools and the dots they make, smallest to biggest. Brush tip: tiny dots. Small end of a dotting tool: small dots. Brush handle end: medium dots. Big end of a dotting tool: big dots. Cotton swab: extra big, soft dots. Each tool makes rows of the same size when you dip it again before every dot.', 860, 340, o.join(''));
}

{
  // Placing a ring of dots by quarters (paper).
  const view = [0, 0, 300, 300];
  const cx = 150, cy = 150, R = 95;
  const ring = (k, col, r = 9) => { let o = ''; for (let i = 0; i < k; i++) { const [x, y] = pol(cx, cy, R, -90 + (i * 360) / k); o += dot(x, y, r, col); } return o; };
  const base = guideCircle(cx, cy, R, 1.4) + guideLine([[cx, cy - R - 20], [cx, cy + R + 20]], 1.4) + guideLine([[cx - R - 20, cy], [cx + R + 20, cy]], 1.4) + dot(cx, cy, 12, C.magenta);
  const diag = guideLine([pol(cx, cy, R + 20, -45), pol(cx, cy, R + 20, 135)], 1.4) + guideLine([pol(cx, cy, R + 20, 45), pol(cx, cy, R + 20, 225)], 1.4);
  const P1 = (k) => { let o = ''; for (let i = 0; i < 16; i++) { if (i % k) continue; const [x, y] = pol(cx, cy, R, -90 + i * 22.5); o += dot(x, y, 9, C.teal); } return o; };
  const between = (from, col) => { let o = ''; for (let i = 0; i < 16; i++) { if (i % from === 0 || i % (from / 2)) continue; const [x, y] = pol(cx, cy, R, -90 + i * 22.5); o += dot(x, y, 9, col); } return o; };
  strip('m07-l01-quarters', 'Placing an even ring of 16 dots by quarters, in four pictures. 1: a center dot, a light guide circle and a cross; one dot at the top, bottom, left and right, like 12, 6, 9 and 3 on a clock. 2: one dot halfway between each pair, now 8 dots. 3: one dot halfway in each gap again, now 16 dots, in a new color so you can see them. Done: 16 even dots, the same size and the same gaps all the way round.', [
    { content: base + P1(4), view, label: '1', caption: '4: top, bottom, sides' },
    { content: base + diag + P1(4) + between(4, C.orange), view, label: '2', caption: '8: halfway between' },
    { content: base + diag + P1(4) + between(4, C.orange) + between(2, C.purple), view, label: '3', caption: '16: halfway again' },
    { content: dot(cx, cy, 12, C.magenta) + ring(16, C.teal), view, label: 'Done', caption: 'Even all round' },
  ].map((p) => ({ ...p, bg: '#ffffff' })), { pw: 200, gap: 34 });
}

{
  // A dot mandala on paper, step by step.
  const view = [0, 0, 300, 300];
  const M = (stage, guides = true) => mandala(150, 150, 1.25, PAL_PAPER, { stage, guides });
  strip('m07-l01-mandala-steps', 'A dot mandala on paper in five pictures. 1: a light guide circle and spokes, and a big magenta dot in the center. 2: a ring of 8 orange dots close to the center, one on each spoke. 3: 8 purple petals between the spokes, dragged outward from a dot. 4: a ring of big teal dots at the petal tips, small magenta dots on the spokes and an outer ring of tiny orange dots. Done: a trail of three teal dots, big to tiny, on each petal line, and white highlight dots.', [
    { content: M(1), view, label: '1', caption: 'Guides, center' },
    { content: M(2), view, label: '2', caption: 'First ring' },
    { content: M(3), view, label: '3', caption: 'Petals' },
    { content: M(4), view, label: '4', caption: 'Outer rings' },
    { content: M(5, false), view, label: 'Done', caption: 'Trails, highlights' },
  ].map((p) => ({ ...p, bg: '#ffffff' })), { pw: 180, gap: 30 });
}

{
  // Forehead mandala and cheekbone dot arcs, step by step, brown skin.
  const view = [60, 70, 280, 260];
  const F = (under) => ({ content: face(under, 'brown'), view });
  const MC = [200, 134], s = 0.48;
  const M = (stage, guides = false) => mandala(MC[0], MC[1], s, PAL_FACE, { stage, guides, bold: 1.25 });
  const marks = dot(200, 134, 2.4, '#f3e6c4') + guideCircle(200, 134, 46, 1) + guideLine([[200, 84], [200, 184]], 1) + guideLine([[150, 134], [250, 134]], 1);
  strip('m07-l01-face-steps', 'A forehead mandala with cheekbone dot arcs on brown skin, in five pictures. 1: a light mark on the forehead center, halfway between the brows and the hairline, with an imagined circle and cross. 2: a magenta center dot, a ring of 8 yellow dots and 8 purple petals. 3: the outer rings: big cyan dots, small yellow dots and tiny white dots. 4: a curved arc of cyan dots along each cheekbone, big under the eye and getting smaller toward the temple, then a second arc of smaller yellow dots below it. Done: cyan dot trails out of the mandala, a magenta dot at the start of each arc, and white highlight dots.', [
    { ...F(marks), label: '1', caption: 'Mark the center' },
    { ...F(M(3)), label: '2', caption: 'Center, petals' },
    { ...F(M(4)), label: '3', caption: 'Outer rings' },
    { ...F(M(4) + both(cheekArcs(undefined, { stage: 2 }))), label: '4', caption: 'Cheekbone arcs' },
    { ...F(M(5) + both(cheekArcs())), label: 'Done', caption: 'Trails, highlights' },
  ], { pw: 190, gap: 30 });
}

{
  // Good ring vs three common mistakes (paper).
  const view = [0, 0, 300, 300];
  const cx = 150, cy = 150, R = 90;
  const ringPts = (k, f = () => 0) => Array.from({ length: k }, (_, i) => pol(cx, cy, R, -90 + (i * 360) / k + f(i)));
  const good = dot(cx, cy, 12, C.magenta) + ringPts(12).map(([x, y]) => dot(x, y, 9, C.teal)).join('');
  // shrinking: one dip for the whole ring
  const shrink = dot(cx, cy, 12, C.magenta) + ringPts(12).map(([x, y], i) => dot(x, y, Math.max(2.4, 10 - i * 0.7), C.teal)).join('');
  // went round without quarters: gaps drift, last gap too big
  const drift = dot(cx, cy, 12, C.magenta) + Array.from({ length: 11 }, (_, i) => pol(cx, cy, R, -90 + i * 27.5)).map(([x, y]) => dot(x, y, 9, C.teal)).join('');
  // no guide: wobbly ring, off center
  const r2 = rng(5);
  const wob = dot(cx + 10, cy - 6, 12, C.magenta) + ringPts(12).map(([x, y]) => dot(x + (r2() - 0.5) * 22, y + (r2() - 0.5) * 22, 9, C.teal)).join('');
  strip('m07-l01-mistakes', 'A good ring of dots and three mistakes, on paper. Good: 12 dots of the same size, the same gap between each, around a center dot. Avoid: dots that get smaller and smaller around the ring, because the tool was dipped only once. Avoid: dots placed one after another round the circle, so the gaps drift and the last gap is too big. Avoid: no guide circle, so the ring is wobbly and the center dot is off center.', [
    { content: good, view, label: 'Good', caption: 'Even size, even gaps' },
    { content: shrink, view, label: 'Avoid', caption: 'One dip: dots shrink' },
    { content: drift, view, label: 'Avoid', caption: 'Gap left at the end' },
    { content: wob, view, label: 'Avoid', caption: 'No guide: wobbly' },
  ].map((p) => ({ ...p, bg: '#ffffff' })), { pw: 200, gap: 30, arrows: false });
}

// ===================================================================================
// 07.2 Geometric lines
// ===================================================================================

const tri = (pts, fill, { outline = null, w = 2.4 } = {}) => `<path d="${polyD(pts, true)}" fill="${fill}"${outline ? ` stroke="${outline}" stroke-width="${w}" stroke-linejoin="round"` : ''}/>`;
const seg = (pts, { w = 2.4, color = BLACK, cap = 'round' } = {}) => `<path d="${polyD(pts)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="${cap}" stroke-linejoin="round"/>`;
// Chevron: vertex at (x, y) pointing `deg`, arms of length len opening by `open` degrees each side.
const chevron = (x, y, deg, len, { w = 5, color = BLACK, open = 42 } = {}) => seg([pol(x, y, len, deg + 180 - open), [x, y], pol(x, y, len, deg + 180 + open)], { w, color });
// Lerp between two points.
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// The geometric festival design (left half; the diamond sits on the center line).
const GEO = {
  dia: [[200, 110], [217, 148], [200, 184], [183, 148]],
  brow: [[183, 148], [156, 150], [132, 158], [114, 172]],
  brow2: [[192, 128], [160, 128], [132, 136], [110, 150]],
  chev: { base: [150, 274], deg: 206, gap: 16, len: 17 },
  cheekLine: [[166, 288], [140, 286], [116, 276], [98, 258], [90, 236]],
};
const browTeeth = (cols) => {
  const b = GEO.brow, o = [];
  const pts = [b[0], lerp(b[0], b[1], 0.5), b[1], lerp(b[1], b[2], 0.5), b[2], lerp(b[2], b[3], 0.5), b[3]];
  for (let i = 0; i < 3; i++) {
    const p0 = pts[i * 2], p2 = pts[i * 2 + 2], m = lerp(p0, p2, 0.5);
    const len = [18, 15, 12][i];
    o.push(tri([p0, p2, [m[0] - 2, m[1] + len]], cols[i % cols.length]));
  }
  return o.join('');
};
// Nested chevrons along the cheekbone, pointing up and out toward the temple.
const chevStack = (cols, { outline = true } = {}) => {
  const { base, deg, gap, len } = GEO.chev;
  return cols.map((c, k) => { const [x, y] = pol(base[0], base[1], k * gap, deg); return (outline ? chevron(x, y, deg, len, { w: 7.5, color: BLACK, open: 50 }) : '') + chevron(x, y, deg, len, { w: 4.6, color: c, open: 50 }); }).join('');
};
// stage: 1 anchors, 2 linework, 3 color, 4 cheekbone, 5 finish
function geoDesign(cols = [C.teal, C.cyan, C.magenta, C.orange, C.yellow], { stage = 5, anchors = false } = {}) {
  const [c1, c2, c3, c4, c5] = cols;
  const o = [];
  const SK = '#f3e6c4';
  if (anchors || stage === 1) {
    const a = [...GEO.dia, GEO.brow[3], GEO.brow2[0], GEO.brow2[3], ...[0, 1, 2].map((k) => pol(...GEO.chev.base, k * GEO.chev.gap, GEO.chev.deg))];
    const left = a.filter(([x]) => x <= 200).map(([x, y]) => dot(x, y, 3, SK)).join('');
    o.push(left + mirror(left));
    if (stage === 1) return o.join('');
  }
  // color fills (under the black lines)
  if (stage >= 3) {
    const [t, r, bt, l] = GEO.dia, ctr = [200, 148];
    o.push(tri([t, ctr, l], c1), tri([t, r, ctr], c2), tri([l, ctr, bt], c2), tri([ctr, r, bt], c1));
    o.push(both(browTeeth([c3, c4, c5])));
  }
  if (stage >= 2) {
    o.push(tri(GEO.dia, 'none', { outline: BLACK, w: 2.8 }));
    if (stage >= 3) o.push(seg([GEO.dia[0], [200, 148], GEO.dia[2]], { w: 1.4 }), seg([GEO.dia[1], [200, 148], GEO.dia[3]], { w: 1.4 }));
    o.push(both(seg(GEO.brow, { w: 2.6 }) + seg(GEO.brow2, { w: 2, color: stage >= 3 ? c1 : BLACK })));
    if (stage >= 3) o.push(both(browTeeth(['none']).replace(/fill="none"/g, `fill="none" stroke="${BLACK}" stroke-width="1.8" stroke-linejoin="round"`)));
  }
  if (stage >= 4) {
    const side = chevStack([c3, c4, c5])
      + dots(GEO.cheekLine, 7, 3, 2, c2);
    o.push(both(side));
  }
  if (stage >= 5) {
    o.push(dot(200, 98, 3.4, WHITE), dot(200, 88, 2.4, WHITE), dot(200, 196, 2.6, WHITE));
    o.push(both(dot(GEO.brow[3][0] - 3, GEO.brow[3][1] + 6, 3.4, c5) + dot(GEO.brow2[3][0] - 4, GEO.brow2[3][1] + 2, 3, WHITE) + dot(GEO.brow2[0][0] - 1, GEO.brow2[0][1], 2.2, WHITE)
      + dot(GEO.dia[3][0] - 7, GEO.dia[3][1] - 8, 1.8, WHITE)));
    o.push(dot(195, 134, 2, WHITE), tri([[192, 392], [208, 392], [200, 406]], c3, { outline: BLACK, w: 2 }), dot(200, 385, 2.2, WHITE));
  }
  return o.join('');
}

{
  // Straight lines on paper: anchor dots and short connected strokes vs one long stroke.
  const view = [0, 0, 300, 300];
  const T = [[150, 50], [255, 235], [45, 235]];
  const anchors = T.map(([x, y]) => dot(x, y, 6, C.purple)).join('');
  const short = (a, b, k, gap = 0) => { let o = ''; for (let i = 0; i < k; i++) o += seg([lerp(a, b, i / 3 + gap), lerp(a, b, (i + 1) / 3 - gap)], { w: 5, color: BLACK }); return o; };
  const partial = short(T[0], T[1], 3, 0.03) + short(T[1], T[2], 1, 0.03);
  const r = rng(9);
  const wob = (a, b) => { const pts = []; for (let i = 0; i <= 10; i++) { const p = lerp(a, b, i / 10); pts.push([p[0] + (r() - 0.5) * 9, p[1] + (r() - 0.5) * 9]); } return line(pts, { w: 5, color: BLACK }); };
  const done = tri(T, C.yellow) + tri(T, 'none', { outline: BLACK, w: 5 }) + T.map(([x, y]) => dot(x, y, 6, C.purple)).join('');
  strip('m07-l02-short-strokes', 'A straight-sided triangle on paper, in four pictures, and the mistake to avoid. 1: three anchor dots for the corners. 2: join the dots with short strokes, each about a third of a side, starting where the last one ended. 3: fill the triangle with yellow. Done: a clean black outline with a purple dot on each corner. Avoid: each side drawn in one long stroke without anchor dots, so the lines wobble and the corners miss each other.', [
    { content: anchors, view, label: '1', caption: 'Anchor dots first' },
    { content: anchors + partial + arrow([[200, 110], [226, 156]], { width: 3 }), view, label: '2', caption: 'Short strokes, dot to dot' },
    { content: tri(T, C.yellow) + short(T[0], T[1], 3) + short(T[1], T[2], 3) + short(T[2], T[0], 3) + anchors, view, label: '3', caption: 'Fill' },
    { content: done, view, label: 'Done', caption: 'Outline, corner dots' },
    { content: wob(T[0], [258, 228]) + wob([262, 238], [40, 228]) + wob([52, 240], [142, 58]), view, label: 'Avoid', caption: 'One long stroke' },
  ].map((p) => ({ ...p, bg: '#ffffff' })), { pw: 170, gap: 26 });
}

{
  // Four geometric shapes, each from anchor dots: triangle, chevrons, diamond, star in a circle.
  const o = [];
  const cell = (i, guides, art, name) => {
    const x = 20 + i * 215, y = 20;
    o.push(`<rect x="${x}" y="${y}" width="200" height="430" rx="12" fill="#fff" stroke="#e3ddd5" stroke-width="2"/>`);
    o.push(`<g transform="translate(${x + 100} ${y + 105})">${guides}</g>`);
    o.push(arrow([[x + 100, y + 196], [x + 100, y + 222]], { color: '#c2b8ab', width: 3 }));
    o.push(`<g transform="translate(${x + 100} ${y + 315})">${art}</g>`);
    o.push(label(x + 100, y + 412, name, { size: 16, bold: true, halo: false }));
  };
  const A = (pts, r = 4.5) => pts.map(([x, y]) => dot(x, y, r, '#9a8f84')).join('');
  // triangle
  const T = [[0, -70], [62, 50], [-62, 50]];
  cell(0, A(T) + guideLine([[0, -80], [0, 62]], 1), tri(T, C.orange, { outline: BLACK, w: 4 }) + tri([[0, -30], [28, 22], [-28, 22]], C.yellow, { outline: BLACK, w: 2.5 }) + dot(0, 64, 4, C.magenta) + dot(0, -84, 3, C.magenta), 'Triangle');
  // chevron stack
  const ch = [-48, -12, 24, 60];
  cell(1, ch.map((y) => A([[-60, y - 30], [0, y], [60, y - 30]])).join('') + guideLine([[0, -88], [0, 70]], 1),
    ch.map((y, i) => seg([[-60, y - 30], [0, y], [60, y - 30]], { w: 11, color: [C.magenta, C.orange, C.yellow, C.lime][i] })).join('') + ch.map((y) => seg([[-60, y - 30], [0, y], [60, y - 30]], { w: 2, color: BLACK })).join(''), 'Chevrons');
  // diamond with facets
  const D = [[0, -78], [48, 0], [0, 78], [-48, 0]];
  cell(2, A(D) + guideLine([[0, -88], [0, 88]], 1) + guideLine([[-58, 0], [58, 0]], 1),
    tri([D[0], [0, 0], D[3]], C.teal) + tri([D[0], D[1], [0, 0]], C.cyan) + tri([D[3], [0, 0], D[2]], C.cyan) + tri([[0, 0], D[1], D[2]], C.teal)
    + seg([D[0], D[2]], { w: 2 }) + seg([D[1], D[3]], { w: 2 }) + tri(D, 'none', { outline: BLACK, w: 4 }) + dot(-14, -30, 4, WHITE), 'Diamond');
  // six-point star in a circle
  const S = Array.from({ length: 6 }, (_, i) => pol(0, 0, 70, -90 + i * 60));
  cell(3, guideCircle(0, 0, 70, 1.2) + A(S) + dot(0, 0, 3, '#9a8f84'),
    `<circle cx="0" cy="0" r="70" fill="none" stroke="${C.purple}" stroke-width="4"/>` + tri([S[0], S[2], S[4]], C.violet, { outline: BLACK, w: 3 }) + tri([S[3], S[5], S[1]], C.magenta, { outline: BLACK, w: 3 })
    + tri([pol(0, 0, 35, -90), pol(0, 0, 35, -30), pol(0, 0, 35, 30), pol(0, 0, 35, 90), pol(0, 0, 35, 150), pol(0, 0, 35, 210)], C.yellow, { outline: BLACK, w: 2 }) + S.map(([x, y]) => dot(x, y, 5, WHITE) + `<circle cx="${n1(x)}" cy="${n1(y)}" r="5" fill="none" stroke="${BLACK}" stroke-width="1.5"/>`).join('') + dot(0, 0, 5, C.purple), 'Star in a circle');
  plain('m07-l02-shapes', 'Four geometric shapes, each built from anchor dots. Top row: the gray anchor dots and light guide lines. Bottom row: the finished shape. Triangle: three corner dots, an orange triangle with a yellow triangle inside, black outlines. Chevrons: three dots for each V, stacked; magenta, orange, yellow and lime V shapes with thin black lines. Diamond: four dots on a cross, split into four triangles of teal and cyan with a black outline. Star in a circle: six dots around a circle like a clock at 12, 2, 4, 6, 8 and 10; join every second dot to make two triangles, a six-point star, inside a purple circle.', 880, 470, o.join(''));
}

{
  // The geometric festival design step by step, tan skin.
  const view = [70, 70, 260, 260];
  const F = (under) => ({ content: face(under, 'tan'), view });
  strip('m07-l02-face-steps', 'A symmetrical geometric design on tan skin, in five pictures. 1: light anchor dots on both sides: the four corners of a diamond on the forehead center, the ends of two lines over each brow, and three points along each cheekbone. 2: black lines from dot to dot with a liner brush: the diamond, a line from the diamond over each brow toward the temple, and a second line above it. 3: color: the diamond split into teal and cyan triangles, and magenta, orange and yellow triangles hanging from the brow lines. 4: three nested chevrons on each cheekbone in magenta, orange and yellow, outlined in black and pointing up and out toward the temple, with a line of cyan dots below them. Done: white dots on the corners and the center line, and a small triangle on the chin.', [
    { ...F(geoDesign(undefined, { stage: 1 })), label: '1', caption: 'Anchor dots' },
    { ...F(geoDesign(undefined, { stage: 2, anchors: true })), label: '2', caption: 'Lines, dot to dot' },
    { ...F(geoDesign(undefined, { stage: 3 })), label: '3', caption: 'Fill the shapes' },
    { ...F(geoDesign(undefined, { stage: 4 })), label: '4', caption: 'Cheekbone chevrons' },
    { ...F(geoDesign(undefined, { stage: 5 })), label: 'Done', caption: 'Dots, chin' },
  ], { pw: 190, gap: 30 });
}

{
  // Placement: symmetrical and outside the eye area vs lopsided vs into the eye area (fair skin).
  const view = [70, 70, 260, 260];
  const good = geoDesign();
  // lopsided: right half shifted up and rotated
  const leftHalf = (() => {
    const cols = [C.teal, C.cyan, C.magenta, C.orange, C.yellow];
    return seg(GEO.brow, { w: 2.6 }) + seg(GEO.brow2, { w: 2, color: cols[0] }) + browTeeth([cols[2], cols[3], cols[4]])
      + chevStack([cols[2], cols[3], cols[4]]);
  })();
  const dia = (() => { const [t, r, bt, l] = GEO.dia, c = [200, 148]; return tri([t, c, l], C.teal) + tri([t, r, c], C.cyan) + tri([l, c, bt], C.cyan) + tri([c, r, bt], C.teal) + tri(GEO.dia, 'none', { outline: BLACK, w: 2.8 }); })();
  const lop = dia + leftHalf + `<g transform="translate(400 -14) scale(-1 1) rotate(-8 120 160)">${leftHalf}</g>`;
  const intoEye = dia + both(seg(GEO.brow, { w: 2.6 }) + browTeeth([C.magenta, C.orange, C.yellow])
    + chevron(150, 246, 200, 22, { w: 7, color: C.magenta }) + chevron(128, 238, 186, 18, { w: 6, color: C.orange })
    + seg([[176, 214], [150, 204], [120, 210]], { w: 3, color: C.cyan }));
  const zones = both(`<path d="${EYE_ZONE}" fill="none" stroke="${BAD}" stroke-width="1.6" stroke-dasharray="3 3"/>`);
  strip('m07-l02-placement', 'Where geometric lines go, on fair skin. Good: the diamond on the center line and every line, triangle and chevron mirrored at the same height on both sides, all outside the eye area. Avoid: the right side painted higher and tilted, so the design looks crooked. Avoid: chevrons and lines pushed onto the eyelids and right under the eyes, inside the eye area marked with red dashes.', [
    { content: face(good, 'fair'), view, label: 'Good', caption: 'Mirrored, outside the eye area' },
    { content: face(lop, 'fair'), view, label: 'Avoid', caption: 'One side higher' },
    { content: face(intoEye, 'fair', zones), view, label: 'Avoid', caption: 'Into the eye area' },
  ], { pw: 240, gap: 30, arrows: false });
}

// ===================================================================================
// 07.3 Psychedelic waves and swirls
// ===================================================================================

// Nested bands along a lead curve. The lead curve is the inner edge; bands stack outward (positive
// offset), pinching to a point at both ends (profile). Returns the curves and the band shapes.
const pinch = (t) => Math.sin(Math.PI * Math.min(1, Math.max(0, t))) ** 0.55;
function nest(lead, widths, { profile = pinch, side = 1 } = {}) {
  const c = spline(lead, 18);
  const curves = [c];
  let acc = 0;
  for (const w of widths) { acc += w; const k = acc; curves.push(offsetCurve(c, (t) => side * k * profile(t))); }
  const bands = widths.map((_, i) => bandD(curves[i], curves[i + 1]));
  return { curves, bands };
}
const polyLine = (pts, { w = 2, color = BLACK, opacity = 1 } = {}) => `<path d="${polyD(pts)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${opacity < 1 ? ` opacity="${opacity}"` : ''}/>`;
// Part of a dense curve between t0 and t1.
const part = (c, t0, t1) => c.slice(Math.round(t0 * (c.length - 1)), Math.round(t1 * (c.length - 1)) + 1);

// The wave design (left half): a swirl that rises from between the brows, over the brow and curls at
// the temple, and a second wave that flows from the temple down along the cheekbone.
const SWIRL_LEAD = [[197, 174], [184, 160], [166, 150], [146, 146], [126, 150], [112, 162], [108, 178], [116, 192], [130, 194], [138, 182], [132, 170], [122, 170]];
const CHEEK_LEAD = [[98, 204], [100, 228], [110, 252], [128, 270], [152, 280], [174, 282]];
const WAVE_COLS = [C.yellow, C.orange, C.magenta, C.purple];
const swirlProfile = (t) => Math.min(1, t / 0.14) ** 0.8 * (t > 0.6 ? Math.max(0.12, 1 - (t - 0.6) / 0.45) : 1);
// stage: 1 lead lines, 2 color bands, 3 black lines, 4 echo line, 5 highlights and dots
function waveDesign(cols = WAVE_COLS, { stage = 5, sketch = '#f3e6c4', echo = C.cyan } = {}) {
  const S = nest(SWIRL_LEAD, [4.5, 4.5, 4.5, 5.5], { profile: swirlProfile, side: 1 });
  const K = nest(CHEEK_LEAD, [5, 5, 6], { side: 1 });
  const o = [];
  if (stage === 1) return both(polyLine(S.curves[0], { w: 1.8, color: sketch }) + polyLine(K.curves[0], { w: 1.8, color: sketch }));
  S.bands.forEach((d, i) => o.push(`<path d="${d}" fill="${cols[i % cols.length]}"/>`));
  K.bands.forEach((d, i) => o.push(`<path d="${d}" fill="${cols[(i + 1) % cols.length]}"/>`));
  if (stage >= 4) {
    o.push(polyLine(part(offsetCurve(S.curves[0], (t) => -7 * swirlProfile(t)), 0.14, 0.62), { w: 2.6, color: echo }));
    o.push(polyLine(part(offsetCurve(K.curves[0], (t) => 22 * pinch(t)), 0.12, 0.85), { w: 2.6, color: echo }));
  }
  if (stage >= 3) {
    S.curves.forEach((c, i) => o.push(polyLine(c, { w: i === S.curves.length - 1 ? 3 : 1.6 })));
    K.curves.forEach((c, i) => o.push(polyLine(c, { w: i === K.curves.length - 1 ? 3 : 1.6 })));
  }
  if (stage >= 5) {
    o.push(polyLine(part(offsetCurve(S.curves[0], (t) => 2.3 * swirlProfile(t)), 0.2, 0.55), { w: 1.4, color: WHITE }));
    o.push(polyLine(part(offsetCurve(K.curves[0], (t) => 2.5 * pinch(t)), 0.25, 0.7), { w: 1.4, color: WHITE }));
    o.push(dot(124, 176, 3.4, cols[2]), dot(123, 175, 1.2, WHITE));
    o.push(dots(part(offsetCurve(S.curves[0], (t) => 26 * swirlProfile(t)), 0.16, 0.5).filter((_, i) => i % 2 === 0), 5, 3, 1.8, WHITE));
    o.push(dots([[178, 298], [160, 296], [142, 290]], 3, 2.8, 1.6, WHITE));
  }
  const center = stage >= 5 ? dot(200, 168, 4.6, cols[2]) + dot(198.6, 166.6, 1.6, WHITE) + dots([[200, 154], [200, 140], [200, 128]], 3, 3, 1.8, cols[0]) : '';
  return both(o.join('')) + center;
}

{
  // Nested lines on paper: lead line, nested lines, color bands, finish.
  const view = [0, 0, 300, 300];
  const lead = Array.from({ length: 15 }, (_, i) => { const x = 14 + i * 20; return [x, 214 - 0.32 * (x - 14) - 20 * Math.sin((x - 14) / 41)]; });
  const flat = () => 1;
  const N = nest(lead, [16, 16, 16, 16], { profile: flat, side: -1 });
  const cols = [C.purple, C.magenta, C.orange, C.yellow];
  const L = (k, w = 3) => N.curves.slice(0, k).map((c) => polyLine(c, { w })).join('');
  void flat;
  const fills = N.bands.map((d, i) => `<path d="${d}" fill="${cols[i]}"/>`).join('');
  const hi = N.curves.slice(0, 4).map((c, i) => polyLine(part(offsetCurve(c, () => -4.5), 0.1 + i * 0.08, 0.36 + i * 0.08), { w: 1.8, color: WHITE })).join('');
  strip('m07-l03-nested', 'Nested wave lines on paper, in five pictures. 1: one flowing lead line, drawn slowly in one smooth stroke. 2: a second line that follows the first at the same distance, like a lane next to it. 3: more lines nested the same way, each one copying the one before. 4: the lanes filled with color: purple, magenta, orange and yellow. Done: black lines painted again over the edges, and thin white highlight lines inside the bands.', [
    { content: L(1), view, label: '1', caption: 'One lead line' },
    { content: L(2) + arrow([[150, 230], [150, 196]], { width: 2.5 }), view, label: '2', caption: 'Copy it, same gap' },
    { content: L(5), view, label: '3', caption: 'Keep nesting' },
    { content: fills + L(5, 1.6), view, label: '4', caption: 'Color bands' },
    { content: fills + L(5, 3.4) + hi, view, label: 'Done', caption: 'Lines, highlights' },
  ].map((p) => ({ ...p, bg: '#ffffff' })), { pw: 180, gap: 30 });
}

{
  // Wave-and-swirl design step by step, deep skin.
  const view = [70, 80, 260, 260];
  const F = (under) => ({ content: face(under, 'deep'), view });
  strip('m07-l03-face-steps', 'A wave-and-swirl design on deep skin, in five pictures. 1: two light lead lines on each side: a swirl that rises from between the brows, runs over the brow and curls at the temple, and a wave from the temple down along the cheekbone. 2: color bands that follow each lead line on the outside, yellow, orange, magenta and purple, pinched to a point where they start. 3: thin black lines between the bands and a thicker black line on the outside edge. 4: a thin cyan echo line that follows the outside of each wave at a small distance. Done: white highlight lines in the yellow bands, white dots along the outside, a magenta dot in each curl, and a magenta dot with yellow dots on the forehead center where the two swirls meet.', [
    { ...F(waveDesign(undefined, { stage: 1 })), label: '1', caption: 'Lead line' },
    { ...F(waveDesign(undefined, { stage: 2 })), label: '2', caption: 'Color bands' },
    { ...F(waveDesign(undefined, { stage: 3 })), label: '3', caption: 'Black lines' },
    { ...F(waveDesign(undefined, { stage: 4 })), label: '4', caption: 'Echo line' },
    { ...F(waveDesign(undefined, { stage: 5 })), label: 'Done', caption: 'Highlights, dots' },
  ], { pw: 190, gap: 30 });
}

{
  // Waves that follow the face vs waves that fight it, medium skin.
  const view = [70, 80, 260, 300];
  const good = waveDesign([C.lime, C.teal, C.blue, C.purple]);
  // against the face: straight-ish wavy stripes across the face, over the nose and into the eyes
  const across = (() => {
    const o = [];
    const cols = [C.lime, C.teal, C.blue, C.purple];
    for (let k = 0; k < 4; k++) {
      const y0 = 196 + k * 12;
      const pts = []; for (let x = 70; x <= 330; x += 6) pts.push([x, y0 + 10 * Math.sin((x - 70) / 26)]);
      const top = pts, bot = pts.map(([x, y]) => [x, y + 11]);
      o.push(`<path d="${bandD(top, bot)}" fill="${cols[k]}"/>`, polyLine(top, { w: 1.8 }));
    }
    return o.join('');
  })();
  const busy = (() => {
    const o = [];
    const c = spline(SWIRL_LEAD, 18);
    for (let k = 0; k < 12; k++) o.push(polyLine(offsetCurve(c, (t) => -k * 2.2 * swirlProfile(t)), { w: 1, color: [C.teal, C.blue, C.purple, C.lime, '#3b3b6d'][k % 5] }));
    return both(o.join(''));
  })();
  strip('m07-l03-flow', 'Waves that follow the face and two mistakes, on medium skin. Good: lime, teal, blue and purple bands curve from the forehead center over the brows, round the temples and along the cheekbones, mirrored on both sides, with black lines and white dots. Avoid: wavy stripes painted straight across the face, over the nose and eyes, ignoring its shape. Avoid: fourteen thin lines in similar dark colors with no black separation, which blur into one muddy shape from a distance.', [
    { content: face(good, 'medium'), view, label: 'Good', caption: 'Follows the brow and cheekbone' },
    { content: face(across, 'medium'), view, label: 'Avoid', caption: 'Across the face and eyes' },
    { content: face(busy, 'medium'), view, label: 'Avoid', caption: 'Too many thin lines' },
  ], { pw: 230, gap: 30, arrows: false });
}

{
  // Optical vibration: neighbors are calm, opposites vibrate, black lines keep it readable (paper).
  const view = [0, 0, 300, 300];
  const stripes = (cols, { lines = false, n = 8 } = {}) => {
    const o = [], h = 300 / n;
    const pts = (k) => { const a = []; for (let x = -10; x <= 310; x += 5) a.push([x, k * h + 14 * Math.sin(x / 34)]); return a; };
    for (let k = -1; k <= n; k++) o.push(`<path d="${bandD(pts(k), pts(k + 1.02))}" fill="${cols[(k + 2) % cols.length]}"/>`);
    if (lines) for (let k = -1; k <= n + 1; k++) o.push(polyLine(pts(k), { w: 3.2 }));
    return clipTo('M0 0H300V300H0Z', o.join(''));
  };
  strip('m07-l03-vibration', 'Optical vibration with wavy color bands on paper. Neighbors, calm: teal, blue and green bands sit quietly together. Opposites, vibrate: purple and yellow bands side by side seem to shimmer and move, because they are opposite on the color wheel. Opposites with black lines: the same purple and yellow bands separated by thin black lines still pop, but each band reads clearly.', [
    { content: stripes([C.teal, C.blue, C.green]), view, label: 'Neighbors', labelColor: INK, caption: 'Calm' },
    { content: stripes([C.purple, C.yellow]), view, label: 'Opposites', labelColor: INK, caption: 'Vibrate' },
    { content: stripes([C.purple, C.yellow], { lines: true }), view, label: 'Opposites + black lines', labelColor: OK, caption: 'Pop, still readable' },
  ].map((p) => ({ ...p, bg: '#ffffff' })), { pw: 220, gap: 30, arrows: false });
}

// ===================================================================================
// 07.4 Planning and building a complete festival look
// ===================================================================================

// Eye-safe makeup helpers (same shapes as Module 5).
const bez = (p0, p1, p2, p3, t) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]); };
const lashPt = (t) => bez([120, 226], [132, 210], [166, 209], [180, 227], t);
function liner({ wing = [100, 208], w = 6, color = BLACK } = {}) {
  const pts = [0.97, 0.8, 0.6, 0.4, 0.22, 0.08].map((t) => { const p = lashPt(t); return [p[0], p[1] - w * 0.25]; });
  const top = lashPt(0.2), low = lashPt(0.04);
  const wedgeD = polyD([[top[0], top[1] - w * 0.35], wing, [119.5, 226.5], low, lashPt(0.15)], true);
  return stroke(pts, { w, color, kind: 'start' }) + `<path d="${wedgeD}" fill="${color}" stroke="${color}" stroke-width="1" stroke-linejoin="round"/>`;
}
const lashes = () => [0.12, 0.26, 0.4, 0.54, 0.68, 0.82].map((t) => { const p = lashPt(t); const q = pol(p[0], p[1], 9, -100 - (1 - t) * 50); return line([p, q], { w: 1.6, color: BLACK }); }).join('');
const crease = (c = C.magenta, w = 4.5) => stroke([[176, 209], [160, 200], [140, 197.5], [122, 200], [102, 198]], { w, color: c, kind: 'start' });
const BONE = 'M178 207C166 200 140 197 122 203C112 207 102 205 92 199C96 193 108 191 120 194C140 189 166 190 182 199Z';
const browBone = (c1 = C.magenta, c2 = C.orange) => sponge(BONE, [c2, c1], { deg: 0, soft: 2.4 });
const browDots = (c1 = WHITE, c2 = C.gold) => [[175, 197, 1.6], [164, 193.5, 2], [151, 192.5, 2.3], [138, 194, 2.4], [127, 197.5, 2.2], [118, 202, 1.8]].map(([x, y, r], i) => dot(x, y, r, i % 2 ? c2 : c1)).join('');
const eyeMakeup = () => both(liner({ wing: [102, 208], w: 5 }) + lashes());

// Cheekbone glitter patch (upper cheekbone toward the temple, outside the eye area), left side.
const GLIT = 'M156 268C138 274 116 270 102 256C94 246 90 230 92 214C98 228 104 242 116 252C128 260 142 264 156 268Z';
const glitterPatch = (seed = 7) => glitter(GLIT, [88, 208, 72, 70], { colors: [C.gold, '#fff3b0', C.violet], n: 110, seed, size: [1.2, 2.6] });

// A complete festival look for 07.4: forehead mandala, geometric brow lines, cheekbone dot arcs,
// eye makeup, glitter and gems. stage 1..7.
function festivalLook({ stage = 7, pal = PAL_FACE } = {}) {
  const under = [], over = [];
  const SK = '#c49a74';
  if (stage === 1) {
    under.push(dot(200, 132, 2.4, SK), guideCircle(200, 132, 40, 1));
    under.push(both(line(GEO.brow, { w: 1.4, color: SK }) + dots([[160, 268], [122, 262], [100, 208]], 3, 2.2, 2.2, SK)));
    return { under: under.join(''), over: '' };
  }
  // 2: big shapes in color: mandala center and petals, brow triangles
  under.push(mandala(200, 132, 0.4, pal, { stage: stage >= 4 ? 5 : 3, bold: 1.25 }));
  under.push(both(browTeeth([C.purple, C.magenta, C.orange])));
  // 3: black linework
  if (stage >= 3) under.push(both(seg(GEO.brow, { w: 2.6 }) + browTeeth(['none']).replace(/fill="none"/g, `fill="none" stroke="${BLACK}" stroke-width="1.8" stroke-linejoin="round"`)));
  // 4: dots: cheekbone arcs and mandala outer rings
  if (stage >= 4) under.push(both(cheekArcs({ a: C.cyan, b: C.yellow, c: WHITE, d: C.magenta }, { stage: 3 }) + dot(GEO.brow[3][0] - 3, GEO.brow[3][1] + 6, 3.4, C.yellow)));
  // 5: eye makeup (eye-safe)
  if (stage >= 5) over.push(eyeMakeup());
  // 7: glitter and gems last
  if (stage >= 7) {
    under.push(both(glitterPatch()));
    over.push(gem(200, 132, 6.5, '#ff4fb8'), both(gem(108, 182, 4.2, '#6fd3ff') + gem(184, 158, 3, '#c9a6ff')));
  }
  return { under: under.join(''), over: over.join('') };
}

{
  // The order of work, light skin, 6 panels in two rows.
  const view = [70, 80, 260, 240];
  const F = (stage, extra = '', eyes = 'open') => { const f = festivalLook({ stage }); return { content: face(f.under, 'light', f.over + extra, { eyes }), view }; };
  const spray = `<g transform="translate(300 270)"><rect x="-12" y="-6" width="24" height="38" rx="5" fill="#dbe9f6" stroke="#5c7c99" stroke-width="2"/><rect x="-6" y="-16" width="12" height="11" fill="#5c7c99"/><path d="M6 -13H14" stroke="#5c7c99" stroke-width="4"/></g>` + [[272, 252], [262, 262], [280, 244], [256, 250], [268, 240], [252, 268]].map(([x, y]) => dot(x, y, 2, '#9cc3e6')).join('');
  strip('m07-l04-order', 'A complete festival look built in the right order, on light skin, in seven pictures. 1: prep the skin, then sketch lightly: a mark for the forehead mandala, the brow lines and the cheekbone dot arcs. 2: the big color shapes: the mandala center and purple petals, and purple, magenta and orange triangles under each brow line. 3: black linework over the edges. 4: dots: the mandala rings and trails and the cheekbone arcs in cyan and yellow, with white highlights. 5: eye makeup with eye-safe products only: liner with a small wing and mascara. 6: close the eyes and set everything with setting spray or powder. Done: glitter on the upper cheekbones and face gems on the mandala, temples and brow lines, last, all outside the eye area.', [
    { ...F(1), label: '1', caption: 'Prep, sketch' },
    { ...F(2), label: '2', caption: 'Big color shapes' },
    { ...F(3), label: '3', caption: 'Black linework' },
    { ...F(4), label: '4', caption: 'Dots, white details' },
    { ...F(5), label: '5', caption: 'Eye-safe eye makeup' },
    { ...F(6, spray, 'closed'), label: '6', caption: 'Set, eyes closed' },
    { ...F(7), label: 'Done', caption: 'Glitter and gems last' },
  ], { pw: 190, gap: 30, cols: 4 });
}

{
  // A filled-in design plan: palette, face map sketch with numbered parts, order and timing.
  const o = [];
  o.push(`<rect x="20" y="20" width="900" height="470" rx="14" fill="#fff" stroke="#e3ddd5" stroke-width="2"/>`);
  // face map sketch (outline only) with colored marks
  const sketch = faceLayer({ template: true, eyes: 'closed', centre: true, under: '', over: '' });
  const marks = mandala(200, 132, 0.4, PAL_FACE, { stage: 3 }).replace(/fill="#ffffff"/g, `fill="${C.yellow}"`)
    + both(seg(GEO.brow, { w: 2.2, color: C.purple }) + dots([[160, 268], [140, 270], [122, 262], [109, 247], [102, 228]], 5, 4, 2.4, C.cyan) + `<path d="${GLIT}" fill="${C.gold}" fill-opacity="0.35" stroke="${C.gold}" stroke-dasharray="3 3"/>`)
    + both(`<path d="${EYE_ZONE}" fill="none" stroke="${BAD}" stroke-width="1.6" stroke-dasharray="3 3"/>`);
  const nums = [[[200, 76], '1'], [[100, 140], '2'], [[78, 290], '3'], [[76, 226], '4']].map(([[x, y], n]) => badge(x, y, n, { r: 11, color: INK })).join('');
  o.push(embed(sketch.replace('</g>', '</g>') + marks + nums, [50, 50, 300, 300], 40, 60, 360, 360, { bg: '#ffffff', frame: false }));
  o.push(label(220, 450, 'Face map sketch', { size: 16, bold: true, halo: false }));
  // palette
  o.push(label(450, 70, 'Palette', { size: 18, bold: true, anchor: 'start', halo: false }));
  [[C.purple, 'main'], [C.magenta, 'second'], [C.cyan, 'accent'], [BLACK, 'lines'], [WHITE, 'details']].forEach(([c, n], i) => {
    o.push(`<circle cx="${470 + i * 66}" cy="104" r="20" fill="${c}" stroke="#adb5bd" stroke-width="1.5"/>`, label(470 + i * 66, 144, n, { size: 13, color: SOFT, halo: false }));
  });
  // parts
  o.push(label(450, 186, 'Parts', { size: 18, bold: true, anchor: 'start', halo: false }));
  [['1', 'Forehead mandala (star zone)'], ['2', 'Geometric brow lines'], ['3', 'Cheekbone dot arcs'], ['4', 'Glitter and gems (last)']].forEach(([n, t], i) => {
    o.push(badge(462, 212 + i * 30, n, { r: 10, color: INK }), label(482, 217 + i * 30, t, { size: 15, anchor: 'start', halo: false }));
  });
  // timing
  o.push(label(450, 350, 'Time: about 80 minutes', { size: 18, bold: true, anchor: 'start', halo: false }));
  const T = [['Prep', 10, '#ced4da'], ['Color', 20, C.violet], ['Lines', 15, '#495057'], ['Dots', 15, C.cyan], ['Eyes', 5, '#868e96'], ['Set', 5, '#9cc3e6'], ['Sparkle', 10, C.gold]];
  let x = 450; const scale = 5.6;
  T.forEach(([n, m, c]) => { const w = m * scale; o.push(`<rect x="${x}" y="368" width="${w - 3}" height="28" rx="5" fill="${c}"/>`, label(x + (w - 3) / 2, 418, n, { size: 13, color: SOFT, halo: false }), label(x + (w - 3) / 2, 438, `${m}`, { size: 13, color: INK, halo: false })); x += w; });
  o.push(label(450, 470, 'Red dashes: eye area. Eye-safe products only.', { size: 14, color: BAD, anchor: 'start', halo: false }));
  plain('m07-l04-plan', 'A filled-in design plan for a festival look. Left: a face map sketch with the eye area marked in red dashes and four numbered parts: 1, a dot mandala on the forehead center, the star zone; 2, geometric lines over the brows; 3, dot arcs along the cheekbones; 4, glitter on the upper cheekbones and gems, added last. Right: the palette, purple as the main color, magenta second, cyan as the accent, black for lines and white for details; the list of parts; and the timing, about 80 minutes: prep 10, color 20, lines 15, dots 15, eye makeup 5, setting 5 and glitter and gems 10 minutes.', 940, 510, o.join(''));
}

{
  // Check photos: daylight close up, daylight from 3 meters, and under UV light.
  const f = festivalLook({ stage: 7 });
  const day = face(f.under, 'brown', f.over);
  // UV: dark room, only fluorescent paint glows. In this look the cyan and yellow dots and the magenta
  // petals were painted with UV paint (all outside the eye area); everything else stays dark.
  const uvSkin = '#2a2140';
  const uvPal = { ...PAL_FACE, center: '#ff3fd0', petal: '#5a3c8a', ring: '#f4ff3a', big: '#25e6ff', small: '#f4ff3a', tiny: '#d6faff', hi: '#ffffff' };
  const uvUnder = mandala(200, 132, 0.4, uvPal, { stage: 5, bold: 1.25 }) + both(cheekArcs({ a: '#25e6ff', b: '#f4ff3a', c: '#ffffff', d: '#ff3fd0' }, { stage: 3 }));
  const glowF = `<defs><filter id="m7uv" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
  const uv = glowF + faceLayer({ skin: uvSkin, under: `<g filter="url(#m7uv)">${uvUnder}</g>`, over: '' }).replace(/stroke="#5b4636"/g, 'stroke="#4a3d63"');
  strip('m07-l04-photos', 'Three check photos of the finished look. Daylight, close up, on brown skin: every color, line and dot is clear. Daylight, from about 3 meters: the mandala, the brow lines and the cheekbone arcs still read as clear shapes. Under UV light in a dark room: only the parts painted with UV face paint glow, here the mandala and the cheekbone dot arcs in neon pink, yellow and cyan, all outside the eye area; the rest of the face stays dark.', [
    { content: day, view: [70, 80, 260, 260], label: 'Daylight, close up', labelColor: INK },
    { content: day, view: [-160, -120, 720, 720], label: 'Daylight, 3 meters', labelColor: INK },
    { content: uv, view: [70, 80, 260, 260], label: 'UV light, dark room', labelColor: INK, bg: '#120c22' },
  ], { pw: 230, gap: 30, arrows: false });
}

// ===================================================================================
// Project 6 · Festival eye
// ===================================================================================

const P6_VIEW = [70, 130, 260, 170];
// Temple chevrons and dot trail, outside the eye area (left side).
const templeChev = (cols = [C.magenta, C.purple, C.cyan]) => {
  const base = [124, 170], deg = 214;
  return cols.map((c, k) => { const [x, y] = pol(base[0], base[1], k * 11, deg); return chevron(x, y, deg, 13, { w: 6.5, color: BLACK, open: 50 }) + chevron(x, y, deg, 13, { w: 3.8, color: c, open: 50 }); }).join('');
};
function festivalEye({ stage = 6 } = {}) {
  const under = [], over = [];
  const SK = '#f1dfc0';
  if (stage === 1) {
    over.push(both(`<path d="${EYE_ZONE}" fill="none" stroke="${BAD}" stroke-width="1.3" stroke-dasharray="3 3"/>` + `<path d="M146 238L120 227L100 208" fill="none" stroke="#868e96" stroke-width="1.4" stroke-dasharray="4 3"/>` + dot(100, 208, 2.2, '#5b4636') + dot(124, 170, 2.4, SK)));
    return { under: '', over: over.join('') };
  }
  if (stage >= 4) under.push(both(browBone(C.magenta, C.violet)));
  if (stage >= 2) over.push(both(liner({ wing: [100, 208], w: 6 })));
  if (stage >= 3) over.push(both(crease(C.cyan, 4)));
  if (stage >= 4) over.push(both(browDots(WHITE, C.gold)));
  if (stage >= 5) under.push(both(templeChev() + dots([[103, 216], [104, 234], [110, 251], [122, 264]], 4, 3.2, 1.6, C.cyan) + dots([[136, 176], [150, 172], [164, 172]], 3, 1.6, 2.4, C.magenta)));
  if (stage >= 6) over.push(both(gem(100, 150, 4.4, '#c9a6ff', { shape: 'drop', deg: 214 }) + gem(122, 264, 2.8, '#6fd3ff') + lashes()));
  return { under: under.join(''), over: over.join('') };
}

{
  const f = festivalEye();
  plain('p06-festival-eye', 'Project 6 finished on medium skin: a bold festival eye on both eyes. Eye-safe black liner with a long, sharp wing; a cyan floating crease line above the natural crease; a soft magenta to violet blend on the brow bone; white and gold dots under each brow. Outside the eye area: three nested chevrons in magenta, purple and cyan above each brow tail, pointing up and out toward the temple, with a violet drop-shaped gem at the tip; magenta dots above the brow; a cyan dot trail from the temple down to the cheekbone with a small blue gem at its end. Nothing on the eyelid near the lashes, and no glitter or gems inside the eye area.', 780, 520, embed(face(f.under, 'medium', f.over), P6_VIEW, 20, 20, 740, 484, { frame: false }));
}

{
  const F = (stage) => { const f = festivalEye({ stage }); return { content: face(f.under, 'medium', f.over), view: P6_VIEW }; };
  strip('p06-festival-eye-steps', 'Project 6 in six pictures, eyes open, on medium skin. 1: mark the eye area in your mind, find the wing angle from the lower lash line toward the brow tail and dot the wing tip and the temple point. 2: eye-safe liner along the upper lash line, pulled out to the wing tip. 3: a cyan floating crease line with eye-safe paint, just above the natural crease. 4: a magenta to violet blend of eye-safe color on the brow bone, and white and gold dots under the brows. 5: outside the eye area on each temple, three nested chevrons and dot trails with face paint. Done: mascara, a drop gem at each chevron tip and a small gem at the end of each dot trail, all outside the eye area.', [
    { ...F(1), label: '1', caption: 'Mark the angle' },
    { ...F(2), label: '2', caption: 'Liner and wing' },
    { ...F(3), label: '3', caption: 'Floating crease' },
    { ...F(4), label: '4', caption: 'Brow bone, dots' },
    { ...F(5), label: '5', caption: 'Temple chevrons' },
    { ...F(6), label: 'Done', caption: 'Gems at the temple' },
  ], { pw: 250, gap: 30, cols: 3 });
}

// ===================================================================================
// Project 9 · Symmetrical trance face
// ===================================================================================

const TRANCE = [C.yellow, C.orange, C.magenta, C.purple];
// stage 1 sketch, 2 swirl bands, 3 mandala, 4 linework, 5 cheekbone chevrons + arcs, 6 white dots, 7 eye makeup + gems + glitter
function trance({ stage = 7 } = {}) {
  const S = nest(SWIRL_LEAD.map(([x, y]) => [x, y - 12]), [4.5, 4.5, 4.5, 5.5], { profile: swirlProfile, side: 1 });
  const under = [], over = [], side = [];
  const SK = '#f3e6c4';
  if (stage === 1) {
    side.push(polyLine(S.curves[0], { w: 1.6, color: '#b98a5e' }), dots([[150, 274], [139, 267], [128, 260]], 3, 2.2, 2.2, '#b98a5e'));
    under.push(both(side.join('')), dot(200, 112, 2.4, '#b98a5e'), guideCircle(200, 112, 30, 1));
    return { under: under.join(''), over: '' };
  }
  void SK;
  S.bands.forEach((d, i) => side.push(`<path d="${d}" fill="${TRANCE[i]}"/>`));
  if (stage >= 4) S.curves.forEach((c, i) => side.push(polyLine(c, { w: i === S.curves.length - 1 ? 3 : 1.6 })));
  if (stage >= 5) side.push(chevStack([C.magenta, C.orange, C.yellow]), dots(GEO.cheekLine, 7, 3.4, 2, C.cyan));
  if (stage >= 6) {
    side.push(polyLine(part(offsetCurve(S.curves[0], (t) => 2.3 * swirlProfile(t)), 0.2, 0.55), { w: 1.4, color: WHITE }));
    side.push(dots(part(offsetCurve(S.curves[0], (t) => 26 * swirlProfile(t)), 0.2, 0.5).filter((_, i) => i % 2 === 0), 4, 3, 1.8, WHITE));
    side.push(dot(124, 164, 3.4, C.cyan));
  }
  under.push(both(side.join('')));
  if (stage >= 3) under.push(mandala(200, 112, 0.3, { center: C.magenta, ring: C.yellow, petal: C.cyan, big: C.purple, small: C.yellow, tiny: WHITE, hi: WHITE }, { stage: stage >= 6 ? 5 : 4, bold: 1.35 }));
  if (stage >= 4) under.push(dot(200, 158, 4.4, C.magenta), dots([[200, 170], [200, 180]], 2, 2.6, 1.8, C.yellow));
  if (stage >= 6) under.push(tri([[191, 388], [209, 388], [200, 404]], C.purple, { outline: BLACK, w: 2 }), dot(200, 380, 2.4, WHITE), dot(200, 412, 2, C.yellow));
  if (stage >= 7) {
    over.push(eyeMakeup(), gem(200, 112, 5, '#ff4fb8'), both(gem(124, 164, 3.6, '#6fd3ff')), gem(200, 158, 3, '#c9a6ff'));
  }
  return { under: under.join(''), over: over.join('') };
}

{
  const f = trance();
  plain('p09-symmetrical-trance', 'Project 9 finished on fair skin: a symmetrical trance face. On the forehead center, a small dot mandala in magenta, cyan, purple and yellow with a pink gem in the middle. From between the brows, two swirls of yellow, orange, magenta and purple bands outlined in black rise over the brows and curl at the temples, with a blue gem in each curl, white highlight lines and white dots along the outside. On each cheekbone, three nested chevrons in magenta, orange and yellow point up and out, with a cyan dot line below them. A purple triangle with dots on the chin. Eye-safe liner and mascara; nothing on the eyelids.', 640, 760, embed(face(f.under, 'fair', f.over), [60, 66, 280, 360], 20, 20, 600, 720, { frame: false }));
}

{
  const view = [70, 70, 260, 260];
  const F = (stage, eyes = 'open') => { const f = trance({ stage }); return { content: face(f.under, 'fair', f.over, { eyes }), view }; };
  strip('p09-symmetrical-trance-steps', 'Project 9 in seven pictures on fair skin. 1: prep, then sketch lightly: the forehead center mark and circle, the swirl lead line on each side and three points on each cheekbone. 2: the swirl bands, yellow, orange, magenta and purple, both sides. 3: the forehead mandala: center, ring and petals. 4: black linework on all the band edges, and a magenta dot with yellow dots between the brows. 5: nested chevrons and cyan dot lines on the cheekbones. 6: white highlights and dots, the mandala trails and the chin triangle. Done: eye-safe liner and mascara, set the face, then gems last: on the mandala, in each curl and between the brows, all outside the eye area.', [
    { ...F(1), label: '1', caption: 'Prep, sketch' },
    { ...F(2), label: '2', caption: 'Swirl bands' },
    { ...F(3), label: '3', caption: 'Mandala' },
    { ...F(4), label: '4', caption: 'Black linework' },
    { ...F(5), label: '5', caption: 'Chevrons, dots' },
    { ...F(6), label: '6', caption: 'White details' },
    { ...F(7), label: 'Done', caption: 'Eyes, set, gems' },
  ], { pw: 200, gap: 30, cols: 4 });
}

console.log('m07 diagrams written');
const WAVE_SHEET = spline(SWIRL_LEAD, 10);
export { mandala, cheekArcs, PAL_FACE, PAL_PAPER, C, EYE_ZONE, offsetCurve, bandD, geoDesign, festivalEye, trance, GEO, WAVE_SHEET };
