// Module 5 printables -> labs/module-05/ (A4 and Letter, PDF + SVG).
// Run: node curriculum/tools/sheets-m05.mjs
// The design shapes come from assets-m05.mjs (importing it also rebuilds the module's diagrams).
import { join } from 'node:path';
import { Sheet, frame, MARGIN, GREY, LIGHT, INK, MODEL } from './lib/sheet.mjs';
import { FACE, circleD } from './lib/face.mjs';
import { ROOT } from './lib/figure.mjs';
import { pol } from './lib/art.mjs';
import { layoutA, layoutB, layoutC, liner, crease, browDots, BONE, ZONE } from './assets-m05.mjs';

const OUT = join(ROOT, 'labs', 'module-05');
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

// Outline every shape in an SVG markup string (paths and circles) at (x, y), k mm per unit.
// Paths inside <defs> (clip paths, gradients) are skipped.
function outlines(sh, markup, x, y, k, opts = MODEL_LINE) {
  const m0 = markup.replace(/<defs>[\s\S]*?<\/defs>/g, '');
  for (const m of m0.matchAll(/<path d="([^"]+)"/g)) sh.path(m[1], x, y, k, opts);
  for (const m of m0.matchAll(/<circle cx="([\d.-]+)" cy="([\d.-]+)" r="([\d.-]+)"/g)) sh.path(circleD(+m[1], +m[2], +m[3]), x, y, k, opts);
}
const ring = (sh, cx, cy, r, opts = { color: LIGHT, width: 0.35 }) => sh.path(circleD(cx, cy, r), 0, 0, 1, opts);
// Mirror absolute path data (M L C Q S T only) across the face center line x = 200.
const flipD = (d) => { let i = 0; return d.replace(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g, (t) => { if (/[A-Za-z]/.test(t)) { i = 0; return t; } return (i++ % 2 === 0) ? (400 - +t).toFixed(1) : t; }); };
// Outline a design and its mirror image (mirror groups in the markup are drawn as their left side).
function outlinesBoth(sh, markup, x, y, k, opts = MODEL_LINE) {
  outlines(sh, markup, x, y, k, opts);
  const m0 = markup.replace(/<defs>[\s\S]*?<\/defs>/g, '');
  for (const m of m0.matchAll(/<path d="([^"]+)"/g)) sh.path(flipD(m[1]), x, y, k, opts);
  for (const m of m0.matchAll(/<circle cx="([\d.-]+)" cy="([\d.-]+)" r="([\d.-]+)"/g)) sh.path(circleD(400 - +m[1], +m[2], +m[3]), x, y, k, opts);
}

// Outline face (frame 400 x 500) at (x, y), k mm per unit.
function face(sh, x, y, k, { eyes = 'closed', centre = true } = {}) {
  const F = FACE;
  sh.path('M158 404C160 420 159 432 156 444M242 404C240 420 241 432 244 444', x, y, k, FACE_LINE);
  sh.path(F.earL, x, y, k, FACE_LINE); sh.path(F.earR, x, y, k, FACE_LINE);
  sh.path(F.head, x, y, k, { ...FACE_LINE, width: 0.55 });
  sh.path(F.hair, x, y, k, { ...SOFTL, dash: [1.2, 1.6] });
  sh.path(F.browL, x, y, k, SOFTL); sh.path(F.browR, x, y, k, SOFTL);
  if (eyes === 'closed') { sh.path(F.closedL, x, y, k, FACE_LINE); sh.path(F.closedR, x, y, k, FACE_LINE); }
  else {
    sh.path(F.eyeL, x, y, k, FACE_LINE); sh.path(F.eyeR, x, y, k, FACE_LINE);
    sh.path(circleD(150, 225, 9), x, y, k, SOFTL); sh.path(circleD(250, 225, 9), x, y, k, SOFTL);
    sh.path(F.lidL, x, y, k, SOFTL); sh.path(F.lidR, x, y, k, SOFTL);
  }
  sh.path(F.nose, x, y, k, SOFTL);
  sh.path(F.lipUp, x, y, k, FACE_LINE); sh.path(F.lipLo, x, y, k, FACE_LINE);
  if (centre) sh.path('M200 70V425', x, y, k, DASH);
}
// Biggest face that fits a box -> { x, y, k } (shows face units ox..ox+fw, oy..oy+fh)
const fit = (x, y, w, h, fw = 320, fh = 380, ox = 40, oy = 60) => {
  const k = Math.min(w / fw, h / fh);
  return { x: x + (w - fw * k) / 2 - ox * k, y: y + (h - fh * k) / 2 - oy * k, k };
};

// ---------------------------------------------------------------------------------
// 1. Bold palette cards (lesson 05.1)
pages('bold-palette-cards', 'Bold festival palette cards', 'Paint the three colors, then the test tile: color blocks, black lines between them, white dots. Lesson 05.1.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, cols = 2, rows = 3, gap = 6;
  const cw = (w - gap) / cols, chh = (bottom - top - 2 * gap) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = MARGIN + c * (cw + gap), y = top + r * (chh + gap);
    sh.rect(x, y, cw, chh, { stroke: GREY, width: 0.3 });
    sh.text(x + 3, y + 6, 'Palette name: ____________________', { size: 2.8, color: INK });
    ['main', 'second', 'pop'].forEach((l, i) => {
      const scx = x + 10 + i * 16;
      ring(sh, scx, y + 17, 5.5, { color: LIGHT, width: 0.35 });
      sh.text(scx, y + 26, l, { size: 2.3, color: GREY, anchor: 'middle' });
    });
    ring(sh, x + 58, y + 17, 3.5, { color: GREY, width: 0.35 });
    sh.text(x + 58, y + 26, 'black', { size: 2.3, color: GREY, anchor: 'middle' });
    ring(sh, x + 68, y + 17, 3.5, { color: LIGHT, width: 0.35 });
    sh.text(x + 68, y + 26, 'white', { size: 2.3, color: GREY, anchor: 'middle' });
    // test tile with three diagonal blocks
    const tx = x + 4, ty = y + 30, tw = cw - 8, th = chh - 52;
    sh.rect(tx, ty, tw, th, { stroke: LIGHT, width: 0.35 });
    for (let i = 1; i <= 3; i++) {
      const bx = tx + (tw * i) / 4;
      sh.line(bx - th * 0.3, ty + th, bx + th * 0.3, ty, { color: '#d5d9df', width: 0.3, dash: [1.2, 1.2] });
    }
    sh.text(x + 4, ty + th + 5, 'Skin: light / medium / deep  ·  White base under bright colors? yes / no', { size: 2.3, color: GREY });
    sh.text(x + 4, ty + th + 10, 'From 3 m away: clear / blurry  ·  Black lines help? yes / no', { size: 2.3, color: GREY });
    sh.text(x + 4, ty + th + 15, 'Palette type: neighbors / opposites / neon look', { size: 2.3, color: GREY });
  }
});

// ---------------------------------------------------------------------------------
// 2. Prep and set test log (lesson 05.2)
pages('prep-and-set-test', 'Prep, paint, set: rub test log', 'Paint the same small stripe on each forearm patch with a different prep or set, then do the rub test. Lesson 05.2.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN;
  const heads = ['Patch', 'Skin prep', 'Set with', 'Wait', 'Tissue after rub', 'Edges after rub', 'Notes'];
  const fr = [0.08, 0.2, 0.15, 0.08, 0.16, 0.15, 0.18];
  const xs = [MARGIN]; fr.forEach((f) => xs.push(xs.at(-1) + f * w));
  let y = top + 4;
  sh.rect(MARGIN, y, w, 8, { fill: '#f1f3f5' });
  heads.forEach((h, i) => sh.text(xs[i] + 1.5, y + 5.4, h, { size: 2.7, color: INK, bold: true }));
  const rowsData = [
    ['A', 'nothing (control)', 'nothing'],
    ['B', 'clean + moisturizer, dry', 'nothing'],
    ['C', 'clean + moisturizer, dry', 'powder'],
    ['D', 'clean + moisturizer, dry', 'setting spray'],
    ['E', 'cream, still wet (watch!)', 'nothing'],
    ['F', '', ''],
  ];
  const rh = 15;
  y += 8;
  rowsData.forEach(([a, b, c], r) => {
    const ry = y + r * rh;
    sh.line(MARGIN, ry + rh, MARGIN + w, ry + rh, { color: LIGHT, width: 0.3 });
    sh.text(xs[0] + 2, ry + 8, a, { size: 3.4, color: INK, bold: true });
    sh.text(xs[1] + 1.5, ry + 8, b, { size: 2.4, color: GREY });
    sh.text(xs[2] + 1.5, ry + 8, c, { size: 2.4, color: GREY });
    sh.text(xs[3] + 1.5, ry + 8, '10 min', { size: 2.4, color: LIGHT });
    sh.text(xs[4] + 1.5, ry + 8, 'clean / some / lots', { size: 2.3, color: GREY });
    sh.text(xs[5] + 1.5, ry + 8, 'sharp / smudged', { size: 2.3, color: GREY });
  });
  xs.forEach((xx) => sh.line(xx, top + 4, xx, y + rowsData.length * rh, { color: LIGHT, width: 0.3 }));
  sh.rect(MARGIN, top + 4, w, 8 + rowsData.length * rh, { stroke: GREY, width: 0.35 });

  // the rub test, and a forearm map of the patches
  let y2 = y + rowsData.length * rh + 10;
  sh.text(MARGIN, y2, 'The rub test', { size: 3.6, color: INK, bold: true });
  const steps = [
    '1. Paint the patch and let it dry until it is no longer shiny.',
    '2. Set it (or not), as the row says. Wait 10 minutes.',
    '3. Press a clean tissue on the patch for 3 seconds. Look at the tissue.',
    '4. Rub the patch gently with a fingertip, 5 times. Look at the edges.',
    '5. Optional: blow warm breath on it or hold a damp cloth near it for a minute, then repeat.',
  ];
  steps.forEach((s, i) => sh.text(MARGIN, y2 + 7 + i * 5.5, s, { size: 2.8, color: GREY }));
  y2 += 7 + steps.length * 5.5 + 6;
  sh.text(MARGIN, y2, 'Where the patches go on your forearm', { size: 3.2, color: INK, bold: true });
  const ah = Math.min(34, bottom - y2 - 6), ay = y2 + 4;
  sh.path(`M${MARGIN} ${ay + 4}C${MARGIN + 60} ${ay} ${MARGIN + 120} ${ay - 2} ${MARGIN + w} ${ay - 4}`, 0, 0, 1, FACE_LINE);
  sh.path(`M${MARGIN} ${ay + ah}C${MARGIN + 60} ${ay + ah + 2} ${MARGIN + 120} ${ay + ah + 4} ${MARGIN + w} ${ay + ah + 6}`, 0, 0, 1, FACE_LINE);
  sh.text(MARGIN + 2, ay + ah / 2 + 1, 'wrist', { size: 2.4, color: GREY });
  sh.text(MARGIN + w - 2, ay + ah / 2 + 1, 'elbow', { size: 2.4, color: GREY, anchor: 'end' });
  ['A', 'B', 'C', 'D', 'E', 'F'].forEach((l, i) => {
    const px = MARGIN + 22 + i * ((w - 44) / 5);
    sh.rect(px - 9, ay + ah / 2 - 7, 18, 14, { stroke: LIGHT, width: 0.35 });
    sh.text(px, ay + ah / 2 + 1, l, { size: 3, color: GREY, anchor: 'middle' });
  });
});

// ---------------------------------------------------------------------------------
// 3. Festival face map (lesson 05.3)
pages('festival-face-map', 'Festival face map', 'The five festival zones and the eye area (dotted). Plan a layout here before you paint. Lesson 05.3.', (sh, top, bottom) => {
  const f = fit(MARGIN, top + 2, sh.w - 2 * MARGIN, bottom - top - 18, 320, 390, 40, 60);
  face(sh, f.x, f.y, f.k, { eyes: 'open' });
  const Z = { color: '#9aa1ad', width: 0.4, dash: [1.6, 1.2] };
  const flip = flipD;
  for (const d of [ZONE.arc, ZONE.cheek]) { sh.path(d, f.x, f.y, f.k, Z); sh.path(flip(d), f.x, f.y, f.k, Z); }
  sh.path(ZONE.hair, f.x, f.y, f.k, Z);
  sh.path(circleD(200, 152, 16), f.x, f.y, f.k, Z);
  sh.path('M178 398C178 389 188 384 200 384C212 384 222 389 222 398C222 407 212 412 200 412C188 412 178 407 178 398Z', f.x, f.y, f.k, Z);
  const eyeZ = { color: '#c0392b', width: 0.35, dash: [0.6, 1.2] };
  sh.path('M114 226C128 200 170 198 186 226C170 248 128 250 114 226Z', f.x, f.y, f.k, eyeZ);
  sh.path('M286 226C272 200 230 198 214 226C230 248 272 250 286 226Z', f.x, f.y, f.k, eyeZ);
  const P = (u, v) => [f.x + u * f.k, f.y + v * f.k];
  const num = (u, v, n) => { const [a, b] = P(u, v); ring(sh, a, b, 2.6, { color: INK, width: 0.35 }); sh.text(a, b + 1, n, { size: 2.8, color: INK, anchor: 'middle', bold: true }); };
  num(104, 160, '1'); num(296, 160, '1'); num(116, 284, '2'); num(284, 284, '2'); num(232, 152, '3'); num(200, 78, '4'); num(236, 400, '5');
  const ky = bottom - 10;
  sh.text(MARGIN, ky, '1 brow-to-temple arc  ·  2 cheekbone line  ·  3 third eye (forehead center)  ·  4 hairline  ·  5 chin', { size: 2.7, color: INK });
  sh.text(MARGIN, ky + 5, 'Dotted ovals: the eye area. Only eye-safe products there (lesson 05.4).', { size: 2.6, color: GREY });
});

// ---------------------------------------------------------------------------------
// 4. Three festival layouts to trace, plus one blank (lesson 05.3)
pages('festival-layouts', 'Three festival layouts', 'Trace the gray shapes, or paint them in your colors. The fourth face is for your own layout. Lesson 05.3.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, gap = 6, cw = (w - gap) / 2, chh = (bottom - top - gap) / 2;
  const designs = [['A  Temple arcs', layoutA()], ['B  Cheekbone line', layoutB()], ['C  Crown', layoutC()], ['D  Your own', '']];
  designs.forEach(([name, d], i) => {
    const x = MARGIN + (i % 2) * (cw + gap), y = top + Math.floor(i / 2) * (chh + gap);
    sh.rect(x, y, cw, chh, { stroke: '#e3e6eb', width: 0.25 });
    sh.text(x + 3, y + 6, name, { size: 3.4, color: INK, bold: true });
    const f = fit(x + 2, y + 8, cw - 4, chh - 10, 300, 360, 50, 70);
    face(sh, f.x, f.y, f.k);
    if (d) outlinesBoth(sh, d, f.x, f.y, f.k);
  });
});

// ---------------------------------------------------------------------------------
// 5. Eye designs on the eye-area outline (lesson 05.4)
pages('eye-designs', 'Bold eye designs', 'Trace the gray design on the left eye, then mirror it on the right eye. Eyes open. Lesson 05.4.', (sh, top, bottom) => {
  const rows = [
    ['Graphic wing', liner({ wing: [96, 204], w: 6 })],
    ['Floating crease', crease() + liner({ wing: [108, 214], w: 4 })],
    ['Dots under the brow', browDots()],
    ['Brow-bone color (shape)', `<path d="${BONE}"/>` + liner({ wing: [106, 212], w: 4 })],
  ];
  const w = sh.w - 2 * MARGIN, rh = (bottom - top - 6) / rows.length;
  const k = Math.min((w - 4) / 240, (rh - 10) / 105);
  rows.forEach(([name, d], i) => {
    const y = top + i * rh;
    sh.rect(MARGIN, y + 1, w, rh - 2, { stroke: '#e3e6eb', width: 0.25 });
    sh.text(MARGIN + 3, y + 6.5, name, { size: 3.2, color: INK, bold: true });
    const x0 = MARGIN + (w - 240 * k) / 2 - 80 * k, y0 = y + 8 + (rh - 10 - 105 * k) / 2 - 160 * k;
    const F = FACE;
    for (const p of [F.browL, F.browR]) sh.path(p, x0, y0, k, SOFTL);
    sh.path(F.eyeL, x0, y0, k, FACE_LINE); sh.path(F.eyeR, x0, y0, k, FACE_LINE);
    sh.path(F.lidL, x0, y0, k, SOFTL); sh.path(F.lidR, x0, y0, k, SOFTL);
    sh.path(circleD(150, 225, 9), x0, y0, k, SOFTL); sh.path(circleD(250, 225, 9), x0, y0, k, SOFTL);
    sh.path('M193 236C192 252 190 262 189 266M207 236C208 252 210 262 211 266', x0, y0, k, SOFTL);
    sh.path('M200 165V255', x0, y0, k, DASH);
    outlines(sh, d, x0, y0, k);
    // start marks on the right eye: mirror of the design's first and last points
    const m = (u, v) => sh.circle(x0 + (400 - u) * k, y0 + v * k, 0.7, { fill: GREY });
    if (i === 0) { m(96, 204); m(176, 222); }
    if (i === 1) { m(176, 209); m(102, 198); }
    if (i === 2) { m(175, 197); m(118, 202); }
    if (i === 3) { m(178, 207); m(92, 199); }
  });
  sh.text(MARGIN, bottom - 1, 'Eye area: eye-safe products only. Never on the waterline. No neon or glitter here.', { size: 2.5, color: '#c0392b' });
});

console.log('labs/module-05 sheets written');
void pol;
