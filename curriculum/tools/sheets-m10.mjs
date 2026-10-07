// Module 10 printables -> labs/module-10/ (A4 and Letter, PDF + SVG).
// Each design sheet is a body outline (the same drawing as the lesson pictures) with one design in
// light gray to trace or paint over. The design shapes come from assets-m10.mjs (importing it also
// rebuilds the module's diagrams).
// Run: node curriculum/tools/sheets-m10.mjs
import { join } from 'node:path';
import { Sheet, frame, MARGIN, GREY, LIGHT } from './lib/sheet.mjs';
import { FACE, BODY, circleD } from './lib/face.mjs';
import { ROOT } from './lib/figure.mjs';
import { samplePath } from './lib/geom.mjs';
import { LINEART, LONG, WRIST, TORSO, AF } from './assets-m10.mjs';

const OUT = join(ROOT, 'labs', 'module-10');
const OUTL = { color: '#8d939c', width: 0.5 };
const SOFTL = { color: '#b8bdc4', width: 0.3 };
const DASH = { color: '#c9ced6', width: 0.3, dash: [1.5, 1.5] };
const DESIGN = { color: '#b3b9c2', width: 0.3 };

function pages(base, title, sub, draw) {
  for (const paper of ['a4', 'letter']) {
    const sh = new Sheet(paper, title);
    const { top, bottom } = frame(sh, title, sub);
    draw(sh, top, bottom);
    sh.save(join(OUT, base));
  }
}
// Biggest box of w x h units (starting at ox, oy) that fits (bx, by, bw, bh) mm -> placement.
const fit = (bx, by, bw, bh, ox, oy, w, h) => { const k = Math.min(bw / w, bh / h); return { x: bx + (bw - w * k) / 2 - ox * k, y: by + (bh - h * k) / 2 - oy * k, k }; };

// ---- tiny SVG fragment flattener (paths, circles, nested <g transform>), as in sheets-m04 ----
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
    if (!d) continue;
    for (const p of samplePath(d, 1)) out.push({ pts: p.pts.map((q) => ap(m, q)), closed: p.closed });
  }
  return out;
}
// Point-in-polygon (even-odd) for clipping the design to the skin.
const polyOf = (d) => samplePath(d, 2).flatMap((p) => p.pts);
const inside = (poly, [x, y]) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
// Draw design line art at placement f, keeping only the parts inside any of the clip polygons.
function design(sh, art, f, clips) {
  for (const p of flatten(art)) {
    let run = [];
    const flush = () => { if (run.length > 1) sh.pline(run.map(([u, v]) => [f.x + u * f.k, f.y + v * f.k]), { ...DESIGN, closed: false }); run = []; };
    const pts = p.closed ? [...p.pts, p.pts[0]] : p.pts;
    for (const q of pts) { if (clips.some((c) => inside(c, q))) run.push(q); else flush(); }
    flush();
  }
}

// ---- outlines ----
const longHand = (sh, f) => { sh.path(LONG, f.x, f.y, f.k, OUTL); sh.path(WRIST, f.x, f.y, f.k, DASH); };
const upper = (sh, f) => {
  sh.path(`${BODY.outline}M20 300C19 340 18 400 18 440M380 300C381 340 382 400 382 440`, f.x, f.y, f.k, OUTL);
  sh.path(BODY.collarbones, f.x, f.y, f.k, SOFTL);
  sh.path('M200 135V440', f.x, f.y, f.k, DASH);
  sh.path('M74 440C74 380 75 330 76 300C78 272 82 248 90 230M326 440C326 380 325 330 324 300C322 272 318 248 310 230', f.x, f.y, f.k, SOFTL);
};
// Path drawn only inside the unit box [u0, v0, u1, v1].
function boxed(sh, d, f, box, style) {
  const [u0, v0, u1, v1] = box;
  for (const p of samplePath(d, 1.5)) {
    let run = [];
    const flush = () => { if (run.length > 1) sh.pline(run.map(([u, v]) => [f.x + u * f.k, f.y + v * f.k]), { ...style, closed: false }); run = []; };
    for (const q of p.closed ? [...p.pts, p.pts[0]] : p.pts) { if (q[0] >= u0 && q[0] <= u1 && q[1] >= v0 && q[1] <= v1) run.push(q); else flush(); }
    flush();
  }
}
const ARMBOX = [40, 90, 420, 800];
const armFigure = (sh, f) => {
  for (const d of [AF.torsoLine, AF.neckR, AF.armOuter]) boxed(sh, d, f, ARMBOX, OUTL);
  sh.path(AF.collar, f.x, f.y, f.k, SOFTL);
  boxed(sh, 'M150 300C200 318 260 328 420 318', f, ARMBOX, DASH);
  sh.path('M330 140V318', f.x, f.y, f.k, DASH);
  sh.path('M92 404q12 6 26 2', f.x, f.y, f.k, SOFTL);
};
const faceOutline = (sh, f) => {
  const F = FACE;
  sh.path('M158 404C160 420 159 432 156 444M242 404C240 420 241 432 244 444', f.x, f.y, f.k, OUTL);
  for (const d of [F.earL, F.earR, F.head, F.eyeL, F.eyeR, F.lipUp, F.lipLo]) sh.path(d, f.x, f.y, f.k, OUTL);
  for (const d of [F.browL, F.browR, F.nose]) sh.path(d, f.x, f.y, f.k, SOFTL);
};
const LONG_POLY = polyOf(`${LONG}Z`), TORSO_POLY = polyOf(TORSO), ARM_POLY = polyOf(AF.arm), TSKIN_POLY = polyOf(AF.torsoSkin);

// 1. Face-to-body plan (10.1)
pages('face-to-body-plan', 'Plan sheet · From face to body', 'Draw your face design small on the left, then re-plan it for the arm and the shoulder. Lesson 10.1.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, bh = (bottom - top) * 0.58, cw = w / 3;
  const ff = fit(MARGIN, top + 6, cw - 4, bh - 8, 70, 60, 260, 400);
  faceOutline(sh, ff);
  const fh = fit(MARGIN + cw, top + 6, cw - 4, bh - 8, 60, 50, 230, 670);
  longHand(sh, fh);
  const fa = fit(MARGIN + 2 * cw, top + 6, cw - 4, bh - 8, 40, 90, 380, 700);
  armFigure(sh, fa);
  ['1 · Face', '2 · Hand and forearm', '3 · Shoulder and arm'].forEach((t, i) => sh.text(MARGIN + i * cw + 2, top + 4, t, { size: 3.2, color: GREY, bold: true }));
  const rows = ['Motifs I keep (flower, leaf, star, swirl...):', 'Flow line on the arm (spiral, along the arm):', 'Flow line on the shoulder (cap, collarbone, center line):',
    'Colors (3-4) that show on this skin:', 'Bigger brush and sponge I will use:', 'Where clothes, straps or bags will touch:'];
  let y = top + bh + 8;
  const gap = (bottom - y - 4) / rows.length;
  for (const r of rows) { sh.text(MARGIN, y, r, { size: 3, color: GREY }); sh.line(MARGIN, y + gap * 0.62, sh.w - MARGIN, y + gap * 0.62, { color: LIGHT, width: 0.25 }); y += gap; }
});

// 2. Vine bracelet (10.2)
pages('vine-bracelet', 'Design sheet · Vine bracelet', 'Back of the left hand and forearm. Trace the gray vine, leaves and flower; the vine leaves one edge and comes back on the other. Lesson 10.2.', (sh, top, bottom) => {
  const f = fit(MARGIN, top + 2, sh.w - 2 * MARGIN, bottom - top - 10, 60, 50, 260, 670);
  longHand(sh, f);
  design(sh, LINEART.vine, f, [LONG_POLY]);
  sh.text(MARGIN, bottom - 1, 'Order: lead lines, vines, leaves, flowers, highlights and dots. Right-handed? Paint your left hand, as drawn here.', { size: 2.8, color: GREY });
});

// 3. Collarbone necklace with wings (10.3)
pages('collarbone-necklace', 'Design sheet · Collarbone necklace and wings', 'Front view. The chain follows the collarbones, the pendant sits on the center line, the wings fan over the shoulder caps. Lesson 10.3.', (sh, top, bottom) => {
  const f = fit(MARGIN, top + 2, sh.w - 2 * MARGIN, bottom - top - 10, 0, 30, 400, 410);
  upper(sh, f);
  design(sh, LINEART.necklace, f, [TORSO_POLY]);
  sh.text(MARGIN, bottom - 1, 'Order: guide dots, chain and drops, pendant, wings, white highlights and dots. Keep it above the neckline.', { size: 2.8, color: GREY });
});

// 4. Arm-and-shoulder piece (P13)
pages('arm-shoulder-piece', 'Design sheet · Arm-and-shoulder piece (Project 13)', 'Front view of the right shoulder and arm. Trace the flower, the vines and the bracelet, then try your own colors.', (sh, top, bottom) => {
  const f = fit(MARGIN, top + 2, sh.w - 2 * MARGIN, bottom - top - 10, 40, 90, 380, 700);
  armFigure(sh, f);
  design(sh, LINEART.armPiece, f, [ARM_POLY, TSKIN_POLY]);
  sh.text(MARGIN, bottom - 1, 'Order: lead lines, shoulder flower, vines and leaves, bracelet and buds, outlines, highlights and dots.', { size: 2.8, color: GREY });
});

console.log('labs/module-10 sheets written');
