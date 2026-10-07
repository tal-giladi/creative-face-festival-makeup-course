// Module 3 printables -> labs/module-03/ (A4 and Letter, PDF + SVG).
// Run: node curriculum/tools/sheets-m03.mjs
import { join } from 'node:path';
import { Sheet, frame, MARGIN, GREY, LIGHT, INK, MODEL } from './lib/sheet.mjs';
import { FACE, L, circleD } from './lib/face.mjs';
import { ROOT } from './lib/figure.mjs';
import { petal, teardrop, stroke, dots, pol } from './lib/art.mjs';

const OUT = join(ROOT, 'labs', 'module-03');
const FACE_LINE = { color: '#8d939c', width: 0.45 };
const SOFTL = { color: '#b8bdc4', width: 0.3 };
const DASH = { color: '#c9ced6', width: 0.3, dash: [1.5, 1.5] };
const MODEL_LINE = { color: MODEL, width: 0.45 };

function pages(base, title, sub, draw) {
  for (const paper of ['a4', 'letter']) {
    const sh = new Sheet(paper, title);
    const { top, bottom } = frame(sh, title, sub);
    draw(sh, top, bottom);
    sh.save(join(OUT, base));
  }
}

// Outline every shape in an SVG markup string (paths and circles), placed at (x, y), k mm per unit.
function outlines(sh, markup, x, y, k, opts = MODEL_LINE) {
  for (const m of markup.matchAll(/<path d="([^"]+)"/g)) sh.path(m[1], x, y, k, opts);
  for (const m of markup.matchAll(/<circle cx="([\d.-]+)" cy="([\d.-]+)" r="([\d.-]+)"/g)) sh.path(circleD(+m[1], +m[2], +m[3]), x, y, k, opts);
}
const ring = (sh, cx, cy, r, opts = { color: LIGHT, width: 0.35 }) => sh.path(circleD(cx, cy, r), 0, 0, 1, opts);

// Small sun mark (light direction).
function sun(sh, cx, cy, r = 2.2) {
  ring(sh, cx, cy, r, { color: GREY, width: 0.35 });
  for (let i = 0; i < 8; i++) { const a = pol(cx, cy, r + 0.8, i * 45), b = pol(cx, cy, r + 2.2, i * 45); sh.line(a[0], a[1], b[0], b[1], { color: GREY, width: 0.35 }); }
}

// The practice motif from lesson 03.5 (flower, two leaves, swirl, dots), as SVG in its own units.
function motifSVG(cx, cy, s) {
  const o = [];
  o.push(stroke([[cx + 20 * s, cy + 6 * s], [cx + 60 * s, cy + 20 * s], [cx + 80 * s, cy - 6 * s], [cx + 66 * s, cy - 26 * s], [cx + 52 * s, cy - 16 * s]], { w: 8 * s, kind: 'end' }));
  o.push(petal(cx - 10 * s, cy + 22 * s, 150, 50 * s, 24 * s), petal(cx + 8 * s, cy + 26 * s, 60, 46 * s, 22 * s));
  for (const a of [0, 72, 144, 216, 288]) o.push(petal(cx, cy, a - 90, 40 * s, 30 * s));
  o.push(`<circle cx="${cx}" cy="${cy}" r="${10 * s}" fill="#000"/>`);
  o.push(dots([[cx - 44 * s, cy - 20 * s], [cx - 50 * s, cy + 2 * s], [cx - 40 * s, cy + 22 * s]], 3, 5 * s, 3 * s));
  return o.join('');
}

// Heart and star points in mm.
function heartPts(cx, cy, s) {
  const out = [];
  for (let i = 0; i <= 80; i++) {
    const t = (i / 80) * 2 * Math.PI;
    out.push([cx + 16 * Math.sin(t) ** 3 * s, cy + (2 - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))) * s]);
  }
  return out;
}
const starPts = (cx, cy, r, ri = r * 0.45) => Array.from({ length: 11 }, (_, i) => pol(cx, cy, i % 2 ? ri : r, -90 + i * 36));

// ---------------------------------------------------------------------------------
// 1. Color-mixing chart (lesson 03.1)
pages('color-mixing-chart', 'Color-mixing chart', 'In each circle mix its row color with its column color. Pure colors on the diagonal. Lesson 03.1.', (sh, top, bottom) => {
  const names = ['yellow', 'red', 'blue', 'white', 'black'];
  const w = sh.w - 2 * MARGIN;
  const cell = Math.min(24, (w - 26) / names.length);
  const gx = MARGIN + 26, gy = top + 10;
  sh.text(MARGIN, top + 4, 'Mixing grid', { size: 3.6, color: INK, bold: true });
  names.forEach((n, i) => {
    sh.text(gx + i * cell + cell / 2, gy + 2, n, { size: 2.8, color: INK, anchor: 'middle' });
    sh.text(MARGIN, gy + 8 + i * cell + cell / 2 + 1, n, { size: 2.8, color: INK });
    for (let j = 0; j <= i; j++) {
      const cx = gx + j * cell + cell / 2, cy = gy + 8 + i * cell + cell / 2;
      ring(sh, cx, cy, cell * 0.38, { color: i === j ? GREY : LIGHT, width: i === j ? 0.5 : 0.35 });
      if (i === j) sh.text(cx, cy + cell * 0.38 + 3, 'pure', { size: 2.2, color: GREY, anchor: 'middle' });
    }
  });
  // notes next to the triangle
  const nx = gx + 3 * cell + 4;
  sh.text(nx, gy + 16, 'Light color first, then add the', { size: 2.7, color: GREY });
  sh.text(nx, gy + 20.5, 'darker one a little at a time.', { size: 2.7, color: GREY });
  sh.text(nx, gy + 27, 'Write your recipe under a circle,', { size: 2.7, color: GREY });
  sh.text(nx, gy + 31.5, 'e.g. "yellow 3 : blue 1".', { size: 2.7, color: GREY });
  sh.text(nx, gy + 38, 'Extra: try pink + blue next to red + blue.', { size: 2.7, color: GREY });

  // tint and shade ladders
  let y = gy + 8 + names.length * cell + 12;
  sh.text(MARGIN, y, 'Tint and shade ladders', { size: 3.6, color: INK, bold: true });
  y += 6;
  const lad = ['red', 'yellow', 'blue', 'green (mix)', 'purple (mix)'];
  const bx = MARGIN + 26, bw = (w - 26) / 7;
  const heads = ['lots of white', 'white', 'a little white', 'pure', 'touch of black', 'a bit more', 'more black'];
  heads.forEach((h, i) => sh.text(bx + i * bw + bw / 2, y + 2, h, { size: 2.3, color: i === 3 ? INK : GREY, anchor: 'middle', bold: i === 3 }));
  const rowH = Math.min(16, (bottom - y - 12) / lad.length);
  lad.forEach((n, r) => {
    const ry = y + 5 + r * rowH;
    sh.text(MARGIN, ry + rowH / 2 + 1, n, { size: 2.8, color: INK });
    for (let i = 0; i < 7; i++) sh.rect(bx + i * bw + 1.5, ry + 1.5, bw - 3, rowH - 3, { stroke: i === 3 ? GREY : LIGHT, width: i === 3 ? 0.5 : 0.3 });
  });
});

// ---------------------------------------------------------------------------------
// 2. Gradient practice (lesson 03.2)
pages('gradient-practice', 'Sponge gradient practice', 'Two colors side by side on the sponge. Dab, do not wipe. Blend between the dashed lines. Lesson 03.2.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, cols = 2, rows = 3, gap = 8;
  const bw = (w - gap) / cols, bh = 46;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = MARGIN + c * (bw + gap), y = top + 4 + r * (bh + 16);
    sh.text(x, y + 3, 'Color 1: ________   Color 2: ________', { size: 2.7, color: GREY });
    sh.rect(x, y + 6, bw, bh - 10, { stroke: LIGHT, width: 0.35 });
    sh.line(x + bw / 3, y + 6, x + bw / 3, y + bh - 4, DASH);
    sh.line(x + 2 * bw / 3, y + 6, x + 2 * bw / 3, y + bh - 4, DASH);
    sh.text(x + bw / 2, y + bh + 0.5, 'overlap zone', { size: 2.3, color: GREY, anchor: 'middle' });
  }
  const y = top + 4 + rows * (bh + 16) + 2;
  sh.text(MARGIN, y, 'Fade into the paper: no hard edge anywhere.', { size: 3.2, color: INK, bold: true });
  const ch = Math.min(60, bottom - y - 10);
  sh.path(`M${sh.w / 2 - 70} ${y + 6 + ch / 2}C${sh.w / 2 - 70} ${y + 6} ${sh.w / 2 + 70} ${y + 6} ${sh.w / 2 + 70} ${y + 6 + ch / 2}C${sh.w / 2 + 70} ${y + 6 + ch} ${sh.w / 2 - 70} ${y + 6 + ch} ${sh.w / 2 - 70} ${y + 6 + ch / 2}Z`, 0, 0, 1, DASH);
  sh.text(sh.w / 2, y + 8 + ch / 2, 'strong in the middle, lighter dabs toward the dashed edge', { size: 2.5, color: GREY, anchor: 'middle' });
});

// ---------------------------------------------------------------------------------
// 3. Pop practice (lesson 03.3)
pages('pop-practice', 'Make it pop: outline and highlight', 'Fill, let dry, outline thin-thick (thicker away from the sun), then white on the sun side. Lesson 03.3.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, cols = 2, rows = 3, cw = w / cols, chh = (bottom - top - 4) / rows;
  const shapes = [
    (cx, cy, s) => sh.pline(heartPts(cx, cy, s * 1.05), { ...MODEL_LINE, closed: true }),
    (cx, cy, s) => sh.pline(starPts(cx, cy, s * 21), { ...MODEL_LINE, closed: true }),
    (cx, cy, s) => ring(sh, cx, cy, s * 17, MODEL_LINE),
    (cx, cy, s) => outlines(sh, petal(0, 0, -90, 40, 24), cx, cy + s * 19, s * 0.95),
    (cx, cy, s) => outlines(sh, [0, 72, 144, 216, 288].map((a) => petal(0, 0, a - 90, 22, 17)).join('') + `<circle cx="0" cy="0" r="5.5" fill="#000"/>`, cx, cy, s * 1.0),
    (cx, cy, s) => outlines(sh, teardrop(0, -14, 90, 34, 18), cx, cy, s * 0.95),
  ];
  shapes.forEach((draw, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    const x = MARGIN + c * cw, y = top + 2 + r * chh;
    sh.rect(x + 2, y + 2, cw - 4, chh - 4, { stroke: '#e3e6eb', width: 0.25 });
    sun(sh, x + 9, y + 9);
    sh.text(x + 14, y + 10, 'light', { size: 2.4, color: GREY });
    draw(x + cw / 2, y + chh / 2 + 2, Math.min(cw, chh) / 52);
  });
});

// ---------------------------------------------------------------------------------
// 4. Symmetry practice (lesson 03.4)
pages('symmetry-practice', 'Symmetry practice: mirror it', 'Paint the gray shape, then its mirror image on the right, starting at the dot. Lesson 03.4.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, cx = sh.w / 2;
  const rowsTop = top + 2, rowH = 24, nRows = 4;
  sh.line(cx, rowsTop, cx, rowsTop + nRows * rowH, { color: GREY, width: 0.35, dash: [2, 1.5] });
  const models = [
    teardrop(-40, 0, 180, 34, 12),                                              // tail pointing to the middle
    stroke([[-12, 6], [-30, 8], [-46, -2], [-44, -12], [-36, -10]], { w: 6, kind: 'end' }), // swirl curling outward
    dots([[-14, 0], [-28, -4], [-42, -10], [-54, -18]], 4, 2.2, 4.2),             // dot trail growing outward
    petal(-12, 2, 200, 40, 16),                                                   // leaf pointing out and up
  ];
  models.forEach((m, i) => {
    const y = rowsTop + i * rowH + rowH / 2, k = 0.62;
    outlines(sh, m, cx - 6, y, k);
    // start mark on the right side (mirror of the model's start)
    const starts = [[-40, 0], [-12, 6], [-14, 0], [-12, 2]];
    const [sx, sy] = starts[i];
    sh.circle(cx + 6 - sx * k, y + sy * k, 0.7, { fill: GREY });
    sh.line(MARGIN, y + rowH / 2, sh.w - MARGIN, y + rowH / 2, { color: '#eef0f3', width: 0.2 });
  });
  // a face with the left half of the 03.4 design to complete
  const y0 = rowsTop + nRows * rowH + 6;
  sh.text(MARGIN, y0, 'Finish the face: copy each part onto the right side, one part at a time.', { size: 3, color: INK, bold: true });
  const avail = bottom - y0 - 4, k = Math.min(avail / 380, w / 400);
  const fx = cx - 200 * k, fy = y0 + 4 - 70 * k;
  for (const d of [FACE.head, FACE.earL, FACE.earR, FACE.browL, FACE.browR, FACE.closedL, FACE.closedR, FACE.nose, FACE.lipUp, FACE.lipLo]) sh.path(d, fx, fy, k, d === FACE.head ? { ...FACE_LINE, width: 0.55 } : (d === FACE.nose || d === FACE.browL || d === FACE.browR ? SOFTL : FACE_LINE));
  sh.path('M200 70V425', fx, fy, k, DASH);
  sh.path('M92 226H308', fx, fy, k, DASH);
  const design = stroke([[178, 172], [152, 160], [126, 165], [110, 182], [116, 198], [130, 194]], { w: 10, kind: 'end' })
    + teardrop(146, 140, 80, 26, 11) + teardrop(122, 150, 60, 22, 9) + teardrop(170, 142, 100, 22, 9)
    + dots([[122, 264], [136, 276], [154, 282]], 4, 5.5, 2.6);
  outlines(sh, design, fx, fy, k);
  for (const [x, yy] of [L.browOutR, L.eyeOutR, L.cheekboneR]) sh.circle(fx + x * k, fy + yy * k, 0.8, { fill: GREY });
  for (const [x, yy] of [L.browOutL, L.eyeOutL, L.cheekboneL]) sh.circle(fx + x * k, fy + yy * k, 0.8, { fill: GREY });
});

// ---------------------------------------------------------------------------------
// 5. Palette cards (lesson 03.5)
pages('palette-cards', 'Palette cards', 'One palette per card: tick the type, paint the swatches, fill the 60-30-10 bar. Lesson 03.5.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, cols = 2, rows = 3, gap = 6;
  const cw = (w - gap) / cols, chh = (bottom - top - 2 * gap) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = MARGIN + c * (cw + gap), y = top + r * (chh + gap);
    sh.rect(x, y, cw, chh, { stroke: GREY, width: 0.3 });
    sh.text(x + 3, y + 6, 'Name: ______________________', { size: 2.8, color: INK });
    const types = ['analogous', 'complementary', 'mono + accent', 'warm / cool'];
    types.forEach((t, i) => {
      const tx = x + 3 + (i % 2) * (cw / 2 - 2), ty = y + 12 + Math.floor(i / 2) * 5.5;
      sh.rect(tx, ty - 2.6, 3, 3, { stroke: GREY, width: 0.3 });
      sh.text(tx + 4.5, ty, t, { size: 2.6, color: GREY });
    });
    const sy = y + 32, labs = ['main', 'second', 'accent', 'extra'];
    labs.forEach((l, i) => {
      const scx = x + 10 + i * ((cw - 16) / 4) + 2;
      ring(sh, scx, sy, 6, { color: LIGHT, width: 0.35 });
      sh.text(scx, sy + 9.5, l, { size: 2.3, color: GREY, anchor: 'middle' });
    });
    const by = y + chh - 16, bw = cw - 10;
    sh.rect(x + 5, by, bw, 6, { stroke: GREY, width: 0.3 });
    sh.line(x + 5 + bw * 0.6, by, x + 5 + bw * 0.6, by + 6, { color: GREY, width: 0.3 });
    sh.line(x + 5 + bw * 0.9, by, x + 5 + bw * 0.9, by + 6, { color: GREY, width: 0.3 });
    sh.text(x + 5 + bw * 0.3, by + 9.5, '60 main', { size: 2.3, color: GREY, anchor: 'middle' });
    sh.text(x + 5 + bw * 0.75, by + 9.5, '30 second', { size: 2.3, color: GREY, anchor: 'middle' });
    sh.text(x + 5 + bw * 0.95, by - 1.5, '10', { size: 2.3, color: GREY, anchor: 'middle' });
    sh.text(x + 5, sy + 17, 'Skin tone notes:', { size: 2.6, color: GREY });
    for (let ly = sy + 24; ly < by - 6; ly += 7) sh.line(x + 5, ly, x + cw - 5, ly, { color: LIGHT, width: 0.25 });
  }
});

// ---------------------------------------------------------------------------------
// 6. One design, three palettes (lesson 03.5, module practical)
pages('three-palettes', 'Module 3 practical: one design, three palettes', 'Same shapes three times; only the colors change. Same light side for all three. Lesson 03.5.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, rows = 3, rh = (bottom - top) / rows;
  for (let r = 0; r < rows; r++) {
    const y = top + r * rh;
    sh.rect(MARGIN, y + 1, w, rh - 3, { stroke: '#e3e6eb', width: 0.25 });
    sh.text(MARGIN + 3, y + 7, ['A', 'B', 'C'][r], { size: 4.4, color: INK, bold: true });
    const k = Math.min((rh - 14) / 125, (w * 0.5) / 155);
    outlines(sh, motifSVG(0, 0, 1), MARGIN + 14 + 62 * k, y + rh / 2 - 10 * k, k);
    sun(sh, MARGIN + 12, y + 14);
    const nx = MARGIN + w * 0.6;
    sh.text(nx, y + 9, 'Palette type: ________________', { size: 2.8, color: INK });
    ['main', 'second', 'accent'].forEach((l, i) => {
      const scx = nx + 6 + i * 20;
      ring(sh, scx, y + 20, 5.5, { color: LIGHT, width: 0.35 });
      sh.text(scx, y + 29, l, { size: 2.3, color: GREY, anchor: 'middle' });
    });
    sh.text(nx, y + 38, 'Skin tone: ______________', { size: 2.7, color: GREY });
    sh.text(nx, y + 45, 'White underneath?  yes / no', { size: 2.7, color: GREY });
    sh.text(nx, y + 52, 'Favorite?  yes / no', { size: 2.7, color: GREY });
  }
});

console.log('labs/module-03 sheets written');
