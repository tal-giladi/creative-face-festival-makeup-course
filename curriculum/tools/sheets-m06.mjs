// Module 6 printables -> labs/module-06/ (A4 and Letter, PDF + SVG).
// Placement maps (glitter, gems, neon) with shaded no-go zones, a glitter label check sheet,
// and design sheets for projects 7 and 8 (line art from assets-m06.mjs).
// Run: node curriculum/tools/sheets-m06.mjs
import { join } from 'node:path';
import { Sheet, frame, MARGIN, GREY, LIGHT, INK } from './lib/sheet.mjs';
import { FACE, circleD } from './lib/face.mjs';
import { ROOT } from './lib/figure.mjs';
import { samplePath } from './lib/geom.mjs';
import { LINEART, ZONES } from './assets-m06.mjs';

const OUT = join(ROOT, 'labs', 'module-06');
const FACE_LINE = { color: '#8d939c', width: 0.45 };
const SOFT = { color: '#b8bdc4', width: 0.3 };
const DESIGN = { color: '#b3b9c2', width: 0.3 };
const YES = { color: '#5c9e6a', width: 0.45, dash: [1.6, 1.2] };
const NO = '#d9534f', NO_FILL = '#fbe3e2', NO_HATCH = '#eba7a5';
const GUIDE = { color: '#8e6cc9', width: 0.5, dash: [0.6, 1.6] };

// Practice face outline (same drawing as labs/common) at (x, y), k mm per face unit.
function face(sh, x, y, k, { eyes = 'open' } = {}) {
  const F = FACE;
  sh.path(F.neck, x, y, k, FACE_LINE);
  sh.path(F.earL, x, y, k, FACE_LINE); sh.path(F.earR, x, y, k, FACE_LINE);
  sh.path(F.head, x, y, k, { ...FACE_LINE, width: 0.55 });
  sh.path(F.hair, x, y, k, { ...SOFT, dash: [1.2, 1.6] });
  sh.path(F.browL, x, y, k, SOFT); sh.path(F.browR, x, y, k, SOFT);
  if (eyes === 'closed') { sh.path(F.closedL, x, y, k, FACE_LINE); sh.path(F.closedR, x, y, k, FACE_LINE); }
  else {
    sh.path(F.eyeL, x, y, k, FACE_LINE); sh.path(F.eyeR, x, y, k, FACE_LINE);
    sh.path(circleD(150, 225, 9), x, y, k, SOFT); sh.path(circleD(250, 225, 9), x, y, k, SOFT);
  }
  sh.path(F.nose, x, y, k, SOFT);
  sh.path(F.lipUp, x, y, k, FACE_LINE); sh.path(F.lipLo, x, y, k, FACE_LINE);
}

// ---- tiny SVG fragment flattener (paths, circles, ellipses, nested <g transform>) ----
const mul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
function parseTf(s = '') {
  let m = [1, 0, 0, 1, 0, 0];
  for (const [, fn, args] of s.matchAll(/(translate|scale|rotate)\(([^)]*)\)/g)) {
    const v = args.split(/[\s,]+/).filter(Boolean).map(Number);
    if (fn === 'translate') m = mul(m, [1, 0, 0, 1, v[0], v[1] ?? 0]);
    if (fn === 'scale') m = mul(m, [v[0], 0, 0, v[1] ?? v[0], 0, 0]);
    if (fn === 'rotate') {
      const a = (v[0] * Math.PI) / 180, c = Math.cos(a), s2 = Math.sin(a), [cx, cy] = [v[1] ?? 0, v[2] ?? 0];
      m = mul(m, [1, 0, 0, 1, cx, cy]); m = mul(m, [c, s2, -s2, c, 0, 0]); m = mul(m, [1, 0, 0, 1, -cx, -cy]);
    }
  }
  return m;
}
const ap = (m, [x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
function flatten(frag) {
  const out = [], stack = [[1, 0, 0, 1, 0, 0]];
  const clean = frag.replace(/<defs>[\s\S]*?<\/defs>/g, '');
  for (const t of clean.match(/<[^>]+>/g) ?? []) {
    const attr = (n) => (t.match(new RegExp(`\\s${n}="([^"]*)"`)) ?? [])[1];
    if (t.startsWith('<g')) { stack.push(mul(stack[stack.length - 1], parseTf(attr('transform')))); continue; }
    if (t.startsWith('</g')) { stack.pop(); continue; }
    const m = mul(stack[stack.length - 1], parseTf(attr('transform')));
    let d = null;
    if (t.startsWith('<path')) d = attr('d');
    else if (t.startsWith('<circle')) d = circleD(+attr('cx'), +attr('cy'), +attr('r'));
    else if (t.startsWith('<ellipse')) { const cx = +attr('cx'), cy = +attr('cy'), rx = +attr('rx'), ry = +attr('ry'); for (const p of samplePath(circleD(0, 0, 1), 0.05)) out.push({ pts: p.pts.map(([x, y]) => ap(m, [cx + x * rx, cy + y * ry])), closed: true }); continue; }
    if (!d) continue;
    for (const p of samplePath(d, 1)) out.push({ pts: p.pts.map((q) => ap(m, q)), closed: p.closed });
  }
  return out;
}
const both = (d) => `<path d="${d}"/><g transform="translate(400 0) scale(-1 1)"><path d="${d}"/></g>`;

// Place a face filling the space between the header and the footer; returns a mapper.
function place(sh, top, bottom, { left = MARGIN, width = sh.w - 2 * MARGIN, reserve = 0 } = {}) {
  const h = bottom - top - 4 - reserve, w = width;
  const k = Math.min(w / 320, h / 450);
  const x = left + (w - 320 * k) / 2 - 40 * k, y = top + 2 - 50 * k;
  return { x, y, k, at: (u, v) => [x + u * k, y + v * k] };
}
const drawLines = (sh, f, frag, style) => { for (const p of flatten(frag)) sh.pline(p.pts.map(([u, v]) => f.at(u, v)), { ...style, closed: p.closed }); };

// No-go ellipse: pale fill, 45-degree hatch lines, dashed red edge.
function noGo(sh, f, cx, cy, rx, ry) {
  const pts = Array.from({ length: 64 }, (_, i) => { const a = (i / 64) * 2 * Math.PI; return f.at(cx + rx * Math.cos(a), cy + ry * Math.sin(a)); });
  sh.pline(pts, { color: NO_FILL, width: 0.01, closed: true, fill: NO_FILL });
  // lines y = x + c (face units), every 9 units
  for (let c = cy - cx - (rx + ry); c <= cy - cx + (rx + ry); c += 9) {
    // solve ((x-cx)/rx)^2 + ((x + c - cy)/ry)^2 = 1 for x
    const A = 1 / rx ** 2 + 1 / ry ** 2, B = -2 * cx / rx ** 2 + 2 * (c - cy) / ry ** 2, C = cx ** 2 / rx ** 2 + (c - cy) ** 2 / ry ** 2 - 1;
    const disc = B * B - 4 * A * C; if (disc <= 0) continue;
    const x1 = (-B - Math.sqrt(disc)) / (2 * A), x2 = (-B + Math.sqrt(disc)) / (2 * A);
    sh.pline([f.at(x1, x1 + c), f.at(x2, x2 + c)], { color: NO_HATCH, width: 0.35 });
  }
  sh.pline(pts, { color: NO, width: 0.4, closed: true, dash: [1.4, 1] });
}
const NO_EYE_S = [[150, 224, 40, 26], [250, 224, 40, 26]], NO_EYE_L = [[150, 226, 46, 42], [250, 226, 46, 42]], NO_LIPS = [200, 354, 40, 20];
const num = (sh, f, u, v, s) => { const [x, y] = f.at(u, v); sh.text(x, y + 1.3, s, { size: 3.8, color: INK, bold: true, anchor: 'middle' }); };

function pages(base, title, sub, draw) {
  for (const paper of ['a4', 'letter']) {
    const sh = new Sheet(paper, title);
    const { top, bottom } = frame(sh, title, sub);
    draw(sh, top, bottom);
    sh.save(join(OUT, base));
  }
}
// Legend lines at the bottom of a map.
function legend(sh, bottom, items) {
  items.forEach(([kind, text], i) => {
    const y = bottom - 4 - (items.length - 1 - i) * 6, x = MARGIN;
    if (kind === 'yes') sh.rect(x, y - 3, 6, 4, { stroke: YES.color, width: 0.4, fill: '#e3f1e5' });
    else if (kind === 'no') sh.rect(x, y - 3, 6, 4, { stroke: NO, width: 0.4, fill: NO_FILL });
    else if (kind === 'guide') sh.line(x, y - 1, x + 6, y - 1, { color: GUIDE.color, width: 0.6, dash: GUIDE.dash });
    sh.text(x + 9, y, text, { size: 3, color: INK });
  });
}

// 1. Glitter map
pages('glitter-map', 'Glitter map', 'Where cosmetic glitter goes (dashed green) and where it never goes (red hatched). Lesson 06.2, project 8.', (sh, top, bottom) => {
  const f = place(sh, top, bottom, { reserve: 28 });
  face(sh, f.x, f.y, f.k);
  for (const e of NO_EYE_S) noGo(sh, f, ...e); noGo(sh, f, ...NO_LIPS);
  drawLines(sh, f, both(ZONES.CRESC) + both(ZONES.HAIRLINE) + `<path d="${ZONES.FORE}"/>`, YES);
  num(sh, f, 132, 279, '1'); num(sh, f, 268, 279, '1'); num(sh, f, 140, 78, '2'); num(sh, f, 226, 134, '3');
  legend(sh, bottom, [['yes', '1 Cheekbones up to the temples  ·  2 Hairline and parting  ·  3 Forehead center  ·  also collarbones'], ['no', 'No glitter: eyelids, lash line, the skin just under the eyes, lips'], ['', 'Glitter goes on a thin base (cosmetic glitter gel, or aloe gel / a little petroleum jelly on the body). Pat, don\'t rub.']]);
});

// 2. Gem map
pages('gem-map', 'Face gem map', 'Gem guide lines (purple dots) and no-go zones (red hatched). Lesson 06.3, project 8.', (sh, top, bottom) => {
  const f = place(sh, top, bottom, { reserve: 28 });
  face(sh, f.x, f.y, f.k);
  for (const e of NO_EYE_S) noGo(sh, f, ...e); noGo(sh, f, ...NO_LIPS);
  const browPath = (pts) => `M${pts.map((p) => p.join(' ')).join('L')}`;
  drawLines(sh, f, both(browPath([...ZONES.BROW_LINE, ...ZONES.TEMPLE_LINE.slice(1)])) + both(browPath([[112, 262], [126, 276], [148, 284]])) + `<path d="M200 104V160"/>`, GUIDE);
  for (const [u, v] of [...ZONES.BROW_LINE, [100, 214], [112, 262], [148, 284]]) for (const s of [1, -1]) { const [x, y] = f.at(s > 0 ? u : 400 - u, v); sh.circle(x, y, 0.9, { fill: '#c5b3e6' }); }
  num(sh, f, 128, 146, '1'); num(sh, f, 272, 146, '1'); num(sh, f, 216, 110, '2'); num(sh, f, 134, 302, '3'); num(sh, f, 266, 302, '3');
  legend(sh, bottom, [['guide', '1 Above the brows, along the brow bone, to the temple  ·  2 Forehead center  ·  3 Top of the cheekbone'], ['no', 'No gems: eyelids, lash line, the skin just under the eyes, lips. Keep gems away from small children.'], ['', 'Biggest gem at the center or the outer end, smaller gems toward the edges.']]);
});

// 3. Neon map
pages('neon-map', 'Where neon may go', 'Neon / UV face paint only in the dashed green zones; never in the red hatched eye area. Lesson 06.4, project 7.', (sh, top, bottom) => {
  const f = place(sh, top, bottom, { reserve: 28 });
  face(sh, f.x, f.y, f.k);
  for (const e of NO_EYE_L) noGo(sh, f, ...e);
  drawLines(sh, f, both(ZONES.CHEEK_NEON) + both(ZONES.TEMPLE_NEON) + `<path d="${ZONES.FORE_NEON}"/>` + `<path d="M230 398C230 405 217 411 200 411C183 411 170 405 170 398C170 391 183 385 200 385C217 385 230 391 230 398Z"/>`, YES);
  legend(sh, bottom, [['yes', 'Neon / UV face paint (if the label allows): forehead, temples, cheeks, jaw, body'], ['no', 'Eye area (brows, eyelids, under the eyes): no fluorescent, UV or glow-in-the-dark paint'], ['', 'Near the eyes use only ordinary, non-fluorescent paint whose label allows the eye area.']]);
});

// 4. Glitter label check
pages('glitter-label-check', 'Glitter label check', 'One row per glitter, gel or gem glue you own. Lesson 06.1 (and 06.3 for glues).', (sh, top, bottom) => {
  const cols = [['Product', 40], ['Sold for skin?', 22], ['Ingredient list?', 22], ['Flakes: plastic / plant / mica / ?', 32], ['Eye warning?', 22], ['Patch test: date and result', 30], ['Use it?', 18]];
  const total = cols.reduce((a, c) => a + c[1], 0), scale = (sh.w - 2 * MARGIN) / total;
  let x = MARGIN; const y0 = top + 4, rowH = 14, rows = Math.floor((bottom - y0 - 30) / rowH);
  sh.rect(MARGIN, y0, sh.w - 2 * MARGIN, 10, { fill: '#f1f3f5' });
  for (const [t, w] of cols) {
    const cw = w * scale;
    const words = t.split(' '); let lineS = '', ly = y0 + 4.2;
    for (const wd of words) { if ((lineS + ' ' + wd).length * 1.45 > cw && lineS) { sh.text(x + 1.5, ly, lineS, { size: 2.6, color: INK, bold: true }); ly += 3.2; lineS = wd; } else lineS = lineS ? lineS + ' ' + wd : wd; }
    sh.text(x + 1.5, ly, lineS, { size: 2.6, color: INK, bold: true });
    sh.line(x, y0, x, y0 + 10 + rows * rowH, { color: LIGHT });
    x += cw;
  }
  sh.line(x, y0, x, y0 + 10 + rows * rowH, { color: LIGHT });
  for (let r = 0; r <= rows; r++) sh.line(MARGIN, y0 + 10 + r * rowH, sh.w - MARGIN, y0 + 10 + r * rowH, { color: LIGHT });
  sh.line(MARGIN, y0, sh.w - MARGIN, y0, { color: LIGHT });
  const ny = y0 + 10 + rows * rowH + 6;
  ['Sold for skin: the pack or seller says cosmetic glitter, face and body, or makeup. No: craft glitter. Never on skin.',
    'Ingredient list: no list means not for skin. Plastic glitter often says polyethylene terephthalate (PET) or polyester.',
    'Eye warning: believe it. Beginners keep all glitter and gems off the eyelids and lash line anyway.',
    'Patch test: inner arm, wear it as long as a design, then watch 24-48 hours (lesson 01.3).'].forEach((t, i) => sh.text(MARGIN, ny + i * 4.6, t, { size: 2.8, color: GREY }));
});

// 5-6. Project design sheets: the design in light gray lines on the practice face.
function designSheet(base, title, sub, art, note) {
  pages(base, title, sub, (sh, top, bottom) => {
    const f = place(sh, top, bottom, { reserve: 8 });
    face(sh, f.x, f.y, f.k);
    drawLines(sh, f, art, DESIGN);
    sh.text(MARGIN, bottom - 1, note, { size: 2.8, color: GREY });
  });
}
designSheet('design-p07-neon', 'Design sheet · Neon glow (project 7)', 'Eyes open. Neon ribbons on the cheeks, a sun-burst on the forehead, dot trails at the temples.', LINEART.p07,
  'On a real face: neon only outside the eye area. Near the eyes, ordinary eye-safe colors only. Lesson 06.4.');
designSheet('design-p08-glitter-gems', 'Design sheet · Glitter and gems (project 8)', 'Eyes open. Glitter crescents on the cheekbones, a gem arch above each brow, a forehead jewel.', LINEART.p08,
  'On a real face: no glitter or gems on the eyelids or lash line. Lessons 06.2 and 06.3.');

console.log('labs/module-06 sheets written');
void GREY;
