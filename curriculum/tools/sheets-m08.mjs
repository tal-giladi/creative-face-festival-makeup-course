// Module 8 printables -> labs/module-08/ (A4 and Letter, PDF + SVG).
// Run: node curriculum/tools/sheets-m08.mjs
import { join } from 'node:path';
import { Sheet, frame, MARGIN, GREY, LIGHT, INK, MODEL } from './lib/sheet.mjs';
import { FACE, circleD } from './lib/face.mjs';
import { ROOT } from './lib/figure.mjs';
import { petal, stroke, pol } from './lib/art.mjs';
import { spline, rng, ribbon, taper } from './lib/geom.mjs';

const OUT = join(ROOT, 'labs', 'module-08');
const FACE_LINE = { color: '#8d939c', width: 0.45 };
const SOFTL = { color: '#b8bdc4', width: 0.3 };
const DASH = { color: '#c9ced6', width: 0.3, dash: [1.5, 1.5] };
const MODEL_LINE = { color: MODEL, width: 0.45 };
const CUT = { color: INK, width: 0.45 };

function pages(base, title, sub, draw) {
  for (const paper of ['a4', 'letter']) {
    const sh = new Sheet(paper, title);
    const { top, bottom } = frame(sh, title, sub);
    draw(sh, top, bottom);
    sh.save(join(OUT, base));
  }
}

// Outline every path and circle in an SVG markup string, placed at (x, y), k mm per unit.
function outlines(sh, markup, x, y, k, opts = MODEL_LINE) {
  for (const m of markup.matchAll(/<path d="([^"]+)"/g)) sh.path(m[1], x, y, k, opts);
  for (const m of markup.matchAll(/<circle cx="([\d.-]+)" cy="([\d.-]+)" r="([\d.-]+)"/g)) sh.path(circleD(+m[1], +m[2], +m[3]), x, y, k, opts);
}
const ring = (sh, cx, cy, r, opts = { color: LIGHT, width: 0.35 }) => sh.path(circleD(cx, cy, r), 0, 0, 1, opts);
function sun(sh, cx, cy, r = 2.2) {
  ring(sh, cx, cy, r, { color: GREY, width: 0.35 });
  for (let i = 0; i < 8; i++) { const a = pol(cx, cy, r + 0.8, i * 45), b = pol(cx, cy, r + 2.2, i * 45); sh.line(a[0], a[1], b[0], b[1], { color: GREY, width: 0.35 }); }
}
const head = (sh, x, y, s) => sh.text(x, y, s, { size: 3.4, color: INK, bold: true });
const note = (sh, x, y, s, o = {}) => sh.text(x, y, s, { size: 2.5, color: GREY, ...o });

// Practice face outline (same drawing as labs/common) at (x, y), k mm per face unit.
function face(sh, x, y, k) {
  const F = FACE;
  sh.path(F.neck, x, y, k, FACE_LINE);
  sh.path(F.earL, x, y, k, FACE_LINE); sh.path(F.earR, x, y, k, FACE_LINE);
  sh.path(F.head, x, y, k, { ...FACE_LINE, width: 0.55 });
  sh.path(F.hair, x, y, k, { ...SOFTL, dash: [1.2, 1.6] });
  sh.path(F.browL, x, y, k, SOFTL); sh.path(F.browR, x, y, k, SOFTL);
  sh.path(F.eyeL, x, y, k, FACE_LINE); sh.path(F.eyeR, x, y, k, FACE_LINE);
  sh.path(circleD(150, 225, 9), x, y, k, SOFTL); sh.path(circleD(250, 225, 9), x, y, k, SOFTL);
  sh.path(F.nose, x, y, k, SOFTL);
  sh.path(F.lipUp, x, y, k, FACE_LINE); sh.path(F.lipLo, x, y, k, FACE_LINE);
}

// ---------------------------------------------------------------------------------
// 1. Three-color blends and one-stroke shapes (lesson 08.1)
pages('blend-and-one-stroke', 'Three-color blends and one-stroke shapes', 'Blend three neighbor colors across each box. Then paint over the gray shapes with a split-loaded flat brush. Lesson 08.1.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, gap = 8, bw = (w - gap) / 2, bh = 30;
  head(sh, MARGIN, top + 3, 'Three-color sponge blends');
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
    const x = MARGIN + c * (bw + gap), y = top + 8 + r * (bh + 12);
    note(sh, x, y + 2, 'Colors:  1 ________   2 ________   3 ________');
    sh.rect(x, y + 4, bw, bh, { stroke: LIGHT, width: 0.35 });
    for (const f of [0.27, 0.4, 0.6, 0.73]) sh.line(x + bw * f, y + 4, x + bw * f, y + 4 + bh, DASH);
    note(sh, x + bw * 0.335, y + bh + 7, 'zone 1', { anchor: 'middle', size: 2.2 });
    note(sh, x + bw * 0.665, y + bh + 7, 'zone 2', { anchor: 'middle', size: 2.2 });
  }
  let y = top + 8 + 2 * (bh + 12) + 4;
  head(sh, MARGIN, y, 'Split-cake test strokes: every stroke should show clean stripes');
  for (let i = 0; i < 5; i++) sh.rect(MARGIN + i * (w / 5) + 2, y + 4, w / 5 - 4, 12, { stroke: LIGHT, width: 0.35 });
  y += 24;
  head(sh, MARGIN, y, 'One-stroke shapes: paint over the gray, light corner on the dot');
  const avail = bottom - y - 6, cell = Math.min(avail, w / 4);
  const k = cell / 120;
  const cx = (i) => MARGIN + (i + 0.5) * (w / 4), cy = y + 6 + cell / 2;
  // leaves
  const leaves = petal(-8, 46, -130, 58, 24) + petal(0, 46, -90, 64, 24) + petal(8, 46, -50, 58, 24);
  outlines(sh, leaves, cx(0), cy, k);
  // five-petal flower
  outlines(sh, [0, 72, 144, 216, 288].map((a) => petal(0, 0, a - 90, 48, 38, '#000', { round: true })).join(''), cx(1), cy, k);
  sh.circle(cx(1), cy, 0.9, { fill: GREY });
  // swirls
  const sw = stroke([[-46, 40], [-10, 36], [24, 14], [34, -14], [18, -34], [0, -28], [2, -12]], { w: 22, kind: 'end' });
  outlines(sh, sw, cx(2), cy, k);
  sh.circle(cx(2) - 46 * k, cy + 40 * k, 0.9, { fill: GREY });
  // rotated flower
  ring(sh, cx(3), cy, 48 * k, MODEL_LINE); ring(sh, cx(3), cy, 9 * k, MODEL_LINE);
  sh.circle(cx(3), cy, 0.9, { fill: GREY });
  ['leaves', 'petals', 'swirl', 'rotate'].forEach((s, i) => note(sh, cx(i), cy + cell / 2 + 2, s, { anchor: 'middle' }));
  const fy = cy + cell / 2 + 8;
  if (bottom - fy > 25) { head(sh, MARGIN, fy, 'Free practice: one-stroke flower, leaves and a swirl without guides'); sh.rect(MARGIN, fy + 3, w, bottom - fy - 5, { stroke: LIGHT, width: 0.35 }); }
});

// ---------------------------------------------------------------------------------
// 2. Value ladders and shapes to shade (lesson 08.2)
pages('value-ladder', 'Value ladder and 3D shapes', 'Mix five values of one color, then shade each shape with the light from the sun mark. Lesson 08.2.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN;
  head(sh, MARGIN, top + 3, 'Value ladders (no black: darken with a darker neighbor color)');
  const heads = ['highlight', 'light', 'midtone', 'shadow', 'deep shadow'];
  const lx = MARGIN + 26, cw = (w - 26) / 5;
  heads.forEach((h, i) => note(sh, lx + i * cw + cw / 2, top + 10, h, { anchor: 'middle', color: i === 2 ? INK : GREY }));
  for (let r = 0; r < 3; r++) {
    const y = top + 12 + r * 18;
    note(sh, MARGIN, y + 9, 'color: ______', { color: INK });
    for (let i = 0; i < 5; i++) sh.rect(lx + i * cw + 1.5, y + 1, cw - 3, 14, { stroke: i === 2 ? GREY : LIGHT, width: i === 2 ? 0.5 : 0.3 });
  }
  const y0 = top + 12 + 3 * 18 + 6;
  head(sh, MARGIN, y0, 'Shade the shapes: highlight, midtone, shadow, reflected light, cast shadow');
  const rows = 2, cols = 2, ch = (bottom - y0 - 4) / rows, cwid = w / cols;
  const cell = (i) => ({ x: MARGIN + (i % cols) * cwid, y: y0 + 3 + Math.floor(i / cols) * ch });
  const kk = Math.min(cwid, ch) / 120;
  for (let i = 0; i < 4; i++) { const { x, y } = cell(i); sh.rect(x + 1.5, y + 1.5, cwid - 3, ch - 3, { stroke: '#e3e6eb', width: 0.25 }); sun(sh, x + 8, y + 8); }
  // ball with a ground line
  { const { x, y } = cell(0), cx = x + cwid / 2, cy = y + ch / 2 - 2; ring(sh, cx, cy, 38 * kk, MODEL_LINE); sh.line(cx - 50 * kk, cy + 40 * kk, cx + 60 * kk, cy + 40 * kk, SOFTL); note(sh, cx, y + ch - 4, 'ball', { anchor: 'middle' }); }
  // gem: hexagon, table and joining lines
  { const { x, y } = cell(1), cx = x + cwid / 2, cy = y + ch / 2 - 2, R = 40 * kk;
    const V = Array.from({ length: 7 }, (_, i) => pol(cx, cy, R, -90 + 60 * i)), I = Array.from({ length: 7 }, (_, i) => pol(cx, cy, R * 0.55, -90 + 60 * i));
    sh.pline(V, { ...MODEL_LINE }); sh.pline(I, { ...MODEL_LINE });
    for (let i = 0; i < 6; i++) sh.line(V[i][0], V[i][1], I[i][0], I[i][1], MODEL_LINE);
    note(sh, cx, y + ch - 4, 'gem', { anchor: 'middle' }); }
  // horn: a curved cone
  { const { x, y } = cell(2), s = kk * 0.9;
    const d = ribbon([[-30, 50], [-18, 10], [4, -24], [36, -52]], 44, (t) => Math.max(0.02, (1 - t) ** 0.85));
    sh.path(d, x + cwid / 2, y + ch / 2 - 2, s, MODEL_LINE); note(sh, x + cwid / 2, y + ch - 4, 'horn', { anchor: 'middle' }); }
  // ribbon: a wavy band
  { const { x, y } = cell(3), s = kk * 0.9;
    const d = ribbon([[-58, 12], [-30, -12], [0, 0], [28, 14], [56, -10]], 18, taper('none'));
    sh.path(d, x + cwid / 2, y + ch / 2 - 2, s, MODEL_LINE); note(sh, x + cwid / 2, y + ch - 4, 'ribbon', { anchor: 'middle' }); }
});

// ---------------------------------------------------------------------------------
// 3. Stencil cut-outs (lesson 08.3)
const halfDisc = (cx, cy, r) => [...Array.from({ length: 13 }, (_, i) => pol(cx, cy, r, 180 - i * 15)).reverse(), [cx - r, cy]];
const starPts = (cx, cy, r, ri = r * 0.45) => Array.from({ length: 11 }, (_, i) => pol(cx, cy, i % 2 ? ri : r, -90 + i * 36));
pages('stencil-cutouts', 'Stencil cut-outs', 'Cut out a card, tape it on thin clear plastic, and an adult cuts the black shapes through both. Lesson 08.3.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, gap = 8, cw = (w - gap) / 2, ch = Math.min(70, (bottom - top - 22 - gap) / 2);
  const cards = ['A  Scales', 'B  Stars', 'C  Lace edge', 'D  Diamonds (fishnet look)'];
  cards.forEach((name, i) => {
    const x = MARGIN + (i % 2) * (cw + gap), y = top + 4 + Math.floor(i / 2) * (ch + gap);
    sh.rect(x, y, cw, ch, { stroke: GREY, width: 0.3 });
    for (const [a, b] of [[[x, y], [x + cw, y]], [[x + cw, y], [x + cw, y + ch]], [[x + cw, y + ch], [x, y + ch]], [[x, y + ch], [x, y]]]) sh.line(a[0], a[1], b[0], b[1], { color: '#ffffff', width: 0.32, dash: [2, 1.4] });
    sh.text(x + 3, y + 5, name, { size: 3, color: INK, bold: true });
    const ix = x + 8, iy = y + 10, iw = cw - 16, ih = ch - 16;
    if (i === 0) {
      const r = 4.5;
      for (let row = 0; row < Math.floor(ih / (r + 2.5)); row++) for (let k = 0; k < Math.floor(iw / (2 * r + 2)) - (row % 2); k++) {
        const cx = ix + r + 1 + k * (2 * r + 2) + (row % 2 ? r + 1 : 0), cy = iy + 2 + row * (r + 2.5);
        sh.pline(halfDisc(cx, cy, r), { ...CUT, closed: true, fill: '#1f2a44' });
      }
    }
    if (i === 1) {
      [[0.2, 0.35, 8], [0.5, 0.3, 5], [0.78, 0.4, 7], [0.35, 0.75, 4.5], [0.65, 0.78, 6]].forEach(([u, v, r]) => sh.pline(starPts(ix + u * iw, iy + v * ih, r), { ...CUT, closed: true, fill: '#1f2a44' }));
    }
    if (i === 2) {
      const r = 5, n = Math.floor(iw / (2 * r + 1.5));
      for (let k = 0; k < n; k++) {
        const cx = ix + r + k * (2 * r + 1.5);
        sh.pline(halfDisc(cx, iy + 6, r), { ...CUT, closed: true, fill: '#1f2a44' });
        sh.circle(cx, iy + 6 + r + 4, 1.4, { fill: '#1f2a44' });
        if (k < n - 1) sh.circle(cx + r + 0.75, iy + 3, 1, { fill: '#1f2a44' });
      }
      for (let k = 0; k < n; k++) sh.circle(ix + r + k * (2 * r + 1.5), iy + ih - 6, 2.2, { fill: '#1f2a44' });
      note(sh, ix, iy + ih - 12, 'small circles: use a hole punch');
    }
    if (i === 3) {
      const dw = 3.2, dh = 4.4;
      for (let row = 0; row < Math.floor(ih / (dh + 1.2)); row++) for (let k = 0; k < Math.floor(iw / (2 * dw + 1.6)); k++) {
        const cx = ix + dw + k * (2 * dw + 1.6) + (row % 2 ? dw + 0.8 : 0), cy = iy + dh + row * (dh + 1.2);
        if (cx + dw > ix + iw) continue;
        sh.pline([[cx, cy - dh], [cx + dw, cy], [cx, cy + dh], [cx - dw, cy]], { ...CUT, closed: true, fill: '#1f2a44' });
      }
    }
  });
  const y = top + 4 + 2 * (ch + gap) + 2;
  note(sh, MARGIN, y, 'Adults only: cut on a cutting mat with small scissors or a craft knife. Smooth sharp corners. Wash before first use.', { color: INK });
  note(sh, MARGIN, y + 5, 'Use: hold flat, dab with a nearly dry sponge from the edges in, lift straight up. Never over the eyes.');
  note(sh, MARGIN, y + 10, 'After use: soapy water, rinse, press dry between paper towels. Keep it for face paint only.');
});

// ---------------------------------------------------------------------------------
// 4. Freehand scales and lace (lesson 08.3)
const uArc = (cx, cy, r) => Array.from({ length: 10 }, (_, i) => pol(cx, cy, r, 180 - i * 20));
pages('scales-lace-practice', 'Freehand scales and lace', 'Trace the gray models first, then fill the empty boxes on your own. Lesson 08.3.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, H = bottom - top - 6, bh = H / 2 - 10;
  // scales
  head(sh, MARGIN, top + 3, 'Scales: bottom row first, each U starts in a gap of the row below');
  const half = (w - 8) / 2, sy = top + 7, r = 6;
  sh.rect(MARGIN, sy, half, bh, { stroke: LIGHT, width: 0.3 }); sh.rect(MARGIN + half + 8, sy, half, bh, { stroke: LIGHT, width: 0.3 });
  const rows = Math.floor((bh - 6) / r);
  for (let row = 0; row < rows; row++) {
    const cy = sy + bh - 4 - row * r - r;
    for (let k = 0; k < Math.floor(half / (2 * r)); k++) {
      const cx = MARGIN + r + 2 + k * 2 * r + (row % 2 ? r : 0);
      if (cx + r > MARGIN + half - 1) continue;
      sh.pline(uArc(cx, cy, r), MODEL_LINE);
    }
    sh.line(MARGIN + half + 10, cy + r, MARGIN + 2 * half + 6, cy + r, { color: '#e3e6eb', width: 0.25, dash: [0.8, 1.6] });
  }
  note(sh, MARGIN + half + 10, sy + 4, 'your own: one row per dotted line');
  // lace
  const ly = sy + bh + 10;
  head(sh, MARGIN, ly, 'Lace: scallops, loops, dots, then a fine net with dot flowers');
  sh.rect(MARGIN, ly + 4, w, bh, { stroke: LIGHT, width: 0.3 });
  const base = (yy, x0, x1) => spline([[x0, yy + 3], [(2 * x0 + x1) / 3, yy], [(x0 + 2 * x1) / 3, yy], [x1, yy + 3]], 30);
  const drawLace = (yy, x0, x1, model) => {
    const b = base(yy, x0, x1), n = 8, d = 7;
    const P2 = (t, f) => { const i = Math.min(b.length - 1, Math.round(t * (b.length - 1))); return [b[i][0], b[i][1] + f * d]; };
    if (!model) { sh.pline(b, { color: '#c9ced6', width: 0.3, dash: [0.8, 1.6] }); return; }
    for (let k = 0; k < n; k++) {
      const t0 = k / n, t1 = (k + 1) / n;
      sh.pline(Array.from({ length: 11 }, (_, s) => P2(t0 + ((t1 - t0) * s) / 10, Math.sin((Math.PI * s) / 10))), MODEL_LINE);
      const [lx2, ly2] = P2((t0 + t1) / 2, 0.42); ring(sh, lx2, ly2, d * 0.27, MODEL_LINE);
      const [jx, jy] = P2(t0, 0); sh.circle(jx, jy, 0.8, { fill: MODEL });
      const [px, py] = P2((t0 + t1) / 2, 1.45); sh.circle(px, py, 0.6, { fill: MODEL });
      const [fx, fy] = P2((t0 + t1) / 2, -1.4); for (let q = 0; q < 5; q++) { const [qx, qy] = pol(fx, fy, d * 0.3, q * 72 - 90); sh.circle(qx, qy, 0.5, { fill: MODEL }); }
    }
    const [jx, jy] = P2(1, 0); sh.circle(jx, jy, 0.8, { fill: MODEL });
    for (let k = 0; k <= n; k++) { const [ax, ay] = P2(k / n, 0); sh.line(ax, ay, ax + d * 1.1, ay - d * 2.4, { color: MODEL, width: 0.2 }); sh.line(ax, ay, ax - d * 1.1, ay - d * 2.4, { color: MODEL, width: 0.2 }); }
  };
  drawLace(ly + 4 + bh * 0.33, MARGIN + 10, MARGIN + w - 10, true);
  drawLace(ly + 4 + bh * 0.78, MARGIN + 10, MARGIN + w - 10, false);
  note(sh, MARGIN + 4, ly + 4 + bh * 0.62, 'your own lace along the dotted curve');
});

// ---------------------------------------------------------------------------------
// 5. Illusion outlines on the face (lesson 08.4)
// Geometry from assets-m08.mjs (same coordinates), mapped onto the face frame.
const CRACK = [[[24, 34], [52, 52], [70, 46], [98, 76], [124, 82], [144, 110], [168, 116], [186, 144], [212, 156], [238, 186]],
  [[98, 76], [106, 54], [122, 42], [128, 20]], [[144, 110], [130, 132], [138, 150], [122, 176]], [[186, 144], [208, 128], [232, 124]], [[124, 82], [148, 74], [160, 60]], [[52, 52], [44, 76], [52, 92]]];
const SEAM = [[28, 160], [80, 128], [140, 110], [196, 84], [236, 50]];
function mapAB(a, b, A, B, flip = false) {
  if (flip) { a = [-a[0], a[1]]; b = [-b[0], b[1]]; }
  const k = Math.hypot(B[0] - A[0], B[1] - A[1]) / Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ang = Math.atan2(B[1] - A[1], B[0] - A[0]) - Math.atan2(b[1] - a[1], b[0] - a[0]), c = Math.cos(ang), s = Math.sin(ang);
  return ([x, y]) => { if (flip) x = -x; const u = (x - a[0]) * k, v = (y - a[1]) * k; return [A[0] + c * u - s * v, A[1] + s * u + c * v]; };
}
const mapTS = (tx, ty, k, deg = 0) => { const c = Math.cos((deg * Math.PI) / 180), s = Math.sin((deg * Math.PI) / 180); return ([x, y]) => [tx + k * (c * x - s * y), ty + k * (s * x + c * y)]; };
pages('illusion-outlines', 'Illusion outlines', 'Light comes from the top left (sun mark). Paint each illusion on the gray guide lines. Lesson 08.4.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, gap = 6, fw = (w - gap) / 2, fh = bottom - top - 40;
  const k = Math.min(fw / 320, fh / 420);
  const F = (i) => ({ x: MARGIN + i * (fw + gap) + (fw - 320 * k) / 2 - 40 * k, y: top + 6 - 60 * k });
  const toMM = (f) => ([x, y]) => [f.x + x * k, f.y + y * k];
  const G = { color: '#9aa1ad', width: 0.4, dash: [1.2, 1] };
  [0, 1].forEach((i) => { const f = F(i); face(sh, f.x, f.y, k); sun(sh, MARGIN + i * (fw + gap) + 6, top + 6); });
  note(sh, MARGIN + 12, top + 7, 'crack + stitches'); note(sh, MARGIN + fw + gap + 12, top + 7, 'zipper + peel');
  // face 1: crack (mirrored onto the left temple) and stitches across the forehead
  { const f = F(0), m = mapAB([24, 34], [238, 186], [166, 94], [104, 258], true), mm = toMM(f);
    for (const c of CRACK) sh.pline(c.map((p) => mm(m(p))), G);
    const s = mapAB([28, 160], [236, 50], [128, 152], [276, 116]), seam = spline(SEAM, 12).map((p) => mm(s(p)));
    sh.pline(seam, G);
    for (let i = 0; i < 9; i++) { const j = Math.round((0.06 + i * 0.11) * (seam.length - 1)), a = seam[Math.max(0, j - 1)], b = seam[Math.min(seam.length - 1, j + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l, L = 13 * k * 0.7; sh.line(seam[j][0] - nx * L, seam[j][1] - ny * L, seam[j][0] + nx * L, seam[j][1] + ny * L, { color: '#9aa1ad', width: 0.4 }); } }
  // face 2: zipper on the left cheek, peel on the right cheek
  { const f = F(1), mm = toMM(f), z = mapTS(84, 272, 0.44, -6);
    const hw = (y) => (y <= 28 || y >= 140 ? 0 : 34 * Math.sin((Math.PI * (y - 28)) / 112) ** 0.75);
    const L = [], R = []; for (let y = 28; y <= 140; y += 4) { L.push(mm(z([130 - hw(y), y]))); R.push(mm(z([130 + hw(y), y]))); }
    sh.pline([...L, ...R.reverse()], { ...G, closed: true });
    sh.pline([mm(z([130, 140])), mm(z([130, 200]))], G);
    sh.pline([mm(z([121, 134])), mm(z([139, 134])), mm(z([136, 154])), mm(z([124, 154]))], { ...G, closed: true });
    const p = mapTS(198, 246, 0.48), r = rng(7), pts = [];
    for (let i = 0; i < 26; i++) { const a = -150 + (i * 360) / 26, kk = 0.82 + r() * 0.22 + (i % 2 ? -0.06 : 0.06); pts.push(mm(p([120 + Math.cos((a * Math.PI) / 180) * 64 * kk, 118 + Math.sin((a * Math.PI) / 180) * 46 * kk]))); }
    sh.pline(pts, { ...G, closed: true }); }
  // hole or bump practice, right under the faces
  const faceBottom = F(0).y + 500 * k;
  const yb = faceBottom + 6;
  head(sh, MARGIN, yb, 'Hole or bump? Same circle, shadow on a different side.');
  for (let i = 0; i < 6; i++) {
    const cx = MARGIN + 14 + i * (w - 28) / 5, cy = yb + 12;
    ring(sh, cx, cy, 7, MODEL_LINE); sun(sh, cx - 11, cy - 6, 1.4);
    note(sh, cx, cy + 11, i < 3 ? 'hole' : 'bump', { anchor: 'middle' });
  }
  // module practical plan
  const yp = yb + 30;
  if (bottom - yp > 30) {
    head(sh, MARGIN, yp, 'Module 8 practical: my illusion plan');
    const rows = ['Illusion (crack / zipper / stitches / peel):', 'Where on the face (outside the eye area):', 'Light comes from:', 'Blend colors (08.1):', 'Shadow shade, not black (08.2):', 'Scales or lace (08.3, optional):'];
    rows.forEach((s, i) => { const y = yp + 8 + i * Math.min(8, (bottom - yp - 10) / rows.length); note(sh, MARGIN, y, s, { color: INK }); sh.line(MARGIN + 72, y + 0.6, sh.w - MARGIN, y + 0.6, { color: LIGHT, width: 0.25 }); });
  }
});

console.log('labs/module-08 sheets written');
