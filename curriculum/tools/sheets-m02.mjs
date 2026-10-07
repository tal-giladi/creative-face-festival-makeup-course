// Module 2 printable stroke-drill sheets -> labs/module-02/ (A4 and Letter, PDF + SVG).
// Each drill block has three rows: Trace (gray models), Copy (one model, then start dots), On your own.
// Run: node curriculum/tools/sheets-m02.mjs
import { join } from 'node:path';
import { Sheet, frame, MARGIN, GREY, LIGHT, FAINT, INK, MODEL } from './lib/sheet.mjs';
import { ARM } from './lib/face.mjs';
import { ROOT } from './lib/figure.mjs';
import { stroke, teardrop, spiral, dot, dots, pol } from './lib/art.mjs';
import { samplePath } from './lib/geom.mjs';

const OUT = join(ROOT, 'labs', 'module-02');
const SUB = 'Trace the gray shapes, copy them from the start dots, then paint them on your own. Turn the paper when it helps.';

// Draw SVG fragments from art.mjs (paths and circles) as filled shapes, placed at (ox, oy), scale k.
function put(sh, frag, ox, oy, { fill = MODEL, k = 1 } = {}) {
  for (const m of frag.matchAll(/<path d="([^"]+)"/g)) {
    for (const p of samplePath(m[1], 0.4)) sh.poly(p.pts.map(([x, y]) => [ox + x * k, oy + y * k]), { fill });
  }
  for (const m of frag.matchAll(/<circle cx="([\d.-]+)" cy="([\d.-]+)" r="([\d.]+)"/g)) sh.circle(ox + +m[1] * k, oy + +m[2] * k, +m[3] * k, { fill });
}

// Curl: lead-in, then a spiral into the center (same as the diagrams).
function curlPts(cx, cy, r, { turns = 1, startDeg = 180, dir = 1, lead = 10, inner = 0.2 } = {}) {
  const pts = [], n = Math.ceil(turns * 18);
  for (let i = 0; i <= n; i++) { const t = i / n; pts.push(pol(cx, cy, r * (1 - t * (1 - inner)), startDeg + dir * t * turns * 360)); }
  const back = startDeg - dir * 90;
  return lead ? [pol(pts[0][0], pts[0][1], lead, back), ...pts] : pts;
}

// A model: w x h mm, svg = art fragment in mm, start = where the brush starts, arrow = direction hint.
const M = (w, h, svg, start, arrow = null) => ({ w, h, svg, start, arrow });

function arrowLine(sh, pts, ox, oy) {
  const P = pts.map(([x, y]) => [ox + x, oy + y]);
  sh.pline(P, { color: GREY, width: 0.3 });
  const [a, b] = [P[P.length - 2], P[P.length - 1]], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  sh.pline([[b[0] - 1.6 * Math.cos(ang - 0.5), b[1] - 1.6 * Math.sin(ang - 0.5)], b, [b[0] - 1.6 * Math.cos(ang + 0.5), b[1] - 1.6 * Math.sin(ang + 0.5)]], { color: GREY, width: 0.3 });
}

// One drill block: title + three rows.
function block(sh, x0, y0, w, h, title, model) {
  sh.text(x0, y0 + 3.6, title, { size: 3.4, color: INK, bold: true });
  const top = y0 + 6, rowH = (h - 8) / 3, lab = 22, gap = 5;
  const n = Math.max(1, Math.floor((w - lab + gap) / (model.w + gap)));
  ['Trace', 'Copy', 'On your own'].forEach((name, r) => {
    const ry = top + r * rowH;
    sh.text(x0, ry + rowH / 2 + 1, name, { size: 2.7, color: GREY });
    sh.line(x0 + lab, ry + rowH, x0 + w, ry + rowH, { color: FAINT, width: 0.25 });
    const my = ry + (rowH - model.h) / 2;
    for (let i = 0; i < n; i++) {
      const mx = x0 + lab + i * (model.w + gap);
      if (r === 0 || (r === 1 && i === 0)) {
        put(sh, model.svg, mx, my);
        if (i === 0 && r === 0) {
          sh.circle(mx + model.start[0], my + model.start[1], 0.8, { fill: INK });
          if (model.arrow) arrowLine(sh, model.arrow, mx, my);
        }
      } else if (r === 1) sh.circle(mx + model.start[0], my + model.start[1], 0.7, { fill: LIGHT });
    }
  });
}

function drillSheet(base, title, blocks) {
  for (const paper of ['a4', 'letter']) {
    const sh = new Sheet(paper, title);
    const { top, bottom } = frame(sh, title, SUB);
    // block height follows the model height; spare space is shared out evenly
    const need = blocks.map(([, m]) => 3 * (m.h + 4) + 8);
    const spare = (bottom - top - 2 - need.reduce((a, b) => a + b, 0)) / blocks.length;
    let y = top + 2;
    blocks.forEach(([name, model], i) => { const h = need[i] + spare; block(sh, MARGIN, y, sh.w - 2 * MARGIN, h - 3, name, model); y += h; });
    sh.save(join(OUT, base));
  }
}

// ---------- 1. Pressure strokes (02.1) ----------
drillSheet('drill-1-pressure-strokes', 'Drill 1 · Pressure strokes (thin, thick, thin)', [
  ['Straight strokes', M(28, 6, stroke([[1, 3], [14, 3], [27, 3]], { w: 4.6 }), [1, 3], [[3, -1.5], [25, -1.5]])],
  ['Curved strokes', M(28, 9, stroke([[1, 8], [14, 2.2], [27, 8]], { w: 4.6 }), [1, 8], [[4, -1.5], [24, -1.5]])],
  ['Down strokes (pull toward you)', M(10, 12, stroke([[5, 0.6], [5.5, 6], [5, 11.4]], { w: 4 }), [5, 0.6], [[9.5, 1.5], [9.5, 10.5]])],
  ['S strokes', M(30, 10, stroke([[1, 7], [8, 2.5], [15, 5], [22, 8], [29, 3]], { w: 4.2 }), [1, 7], [[3, -0.5], [27, -0.5]])],
]);

// ---------- 2. Teardrops and petals (02.2) ----------
const flower = (cx, cy) => [0, 1, 2, 3, 4].map((i) => { const a = -90 + i * 72; const h = pol(cx, cy, 8.2, a); return teardrop(h[0], h[1], a + 180, 6.6, 5.6, '#000'); }).join('');
drillSheet('drill-2-teardrops-petals', 'Drill 2 · Teardrops and petals', [
  ['Teardrops, tail to the side', M(26, 7, teardrop(3.6, 3.5, 0, 22, 6.6, '#000'), [3.6, 3.5], [[3, -1.8], [24, -1.8]])],
  ['Teardrops, tail toward you', M(9, 14, teardrop(4.5, 3.4, 90, 10.4, 6.2, '#000'), [4.5, 3.4], [[8.5, 1], [8.5, 12]])],
  ['Curved teardrops (commas)', M(24, 9, teardrop(3.6, 5, -8, 20, 6.4, '#000', { curve: 1.2 }), [3.6, 5])],
  ['Five-petal flowers (head outside, tail to the center)', M(22, 20, flower(11, 10.4) + dot(11, 10.4, 0.6, '#000'), [11, 2.2])],
]);

// ---------- 3. Swirls, curls and spirals (02.3) ----------
const sA = curlPts(10.8, 5, 4, { turns: 0.95, startDeg: 0, dir: -1, lead: 5 });
const sB = sA.map(([x, y]) => [2 * 14.8 - x, 2 * 10 - y]);
drillSheet('drill-3-swirls-spirals', 'Drill 3 · Swirls, curls and spirals', [
  ['Curls turning right, then left', M(34, 14, stroke(curlPts(7, 6, 5.2, { turns: 1, startDeg: 180, dir: 1, lead: 7.5 }), { w: 3.4 }) + stroke(curlPts(27, 6, 5.2, { turns: 1, startDeg: 0, dir: -1, lead: 7.5 }), { w: 3.4 }), [1.8, 13.5])],
  ['Spirals (move the whole arm)', M(18, 18, spiral(9, 9, 8.4, 1.8, { w: 3.1, startDeg: 180 }), [0.6, 9])],
  ['S swirls (paint one half, turn the paper, paint the other)', M(30, 20, stroke(sA, { w: 3.2 }) + stroke(sB, { w: 3.2 }), [14.8, 10])],
]);

// ---------- 4. Dots (02.4) ----------
const ring = (cx, cy, r, n, rad, off = -90) => Array.from({ length: n }, (_, i) => { const p = pol(cx, cy, r, off + (i * 360) / n); return dot(p[0], p[1], rad, '#000'); }).join('');
drillSheet('drill-4-dots', 'Drill 4 · Dots, dot trails and dot flowers', [
  ['Even dots (dip before every dot)', M(6, 6, dot(3, 3, 2.2, '#000'), [3, 3])],
  ['Dot trails (dip once, dots get smaller)', M(40, 12, dots([[2, 10], [12, 4], [24, 2.5], [38, 6]], 7, 2.4, 0.7, '#000'), [2, 10], [[4, 13.5], [36, 11]])],
  ['Three sizes: big, medium, small', M(18, 6, dot(3, 3, 2.6, '#000') + dot(9.5, 3, 1.8, '#000') + dot(15, 3, 1.1, '#000'), [3, 3])],
  ['Dot flowers (ring of six, center, small dots in the gaps)', M(20, 20, ring(10, 10, 4.4, 6, 2.2) + dot(10, 10, 1.9, '#000') + ring(10, 10, 8.4, 6, 0.9, -60), [10, 5.6])],
]);

// ---------- 5. Hand sampler plan (02.5) ----------
// Same rows as the 02.5 diagram, in the ARM frame (units), drawn on two hands: gray models to trace, and an empty hand.
const sRow1 = [0, 1, 2].map((i) => stroke([[150 + i * 32, 262], [162 + i * 32, 256], [176 + i * 32, 262]], { w: 8 })).join('');
const sRow2 = [0, 1, 2, 3].map((i) => teardrop(154 + i * 24, 292, 60, 22, 11, '#000')).join('');
const sRow3 = stroke(curlPts(166, 326, 10, { turns: 1, startDeg: 0, dir: -1, lead: 14 }), { w: 6 }) + stroke(curlPts(226, 326, 10, { turns: 1, startDeg: 180, dir: 1, lead: 14 }), { w: 6 });
const sRow4 = dots([[150, 356], [180, 352], [210, 356], [244, 352]], 7, 5, 1.6, '#000');
const sFlower = ring(196, 326, 9, 6, 4.5) + dot(196, 326, 4, '#000') + ring(196, 326, 16, 6, 1.6, -60);
for (const paper of ['a4', 'letter']) {
  const title = 'Hand sampler plan';
  const sh = new Sheet(paper, title);
  const { top, bottom } = frame(sh, title, 'Left: trace the gray sampler. Right: plan your own, then paint it on the back of your hand (lesson 02.5).');
  const k = Math.min((sh.w - 2 * MARGIN - 8) / 2 / 200, (bottom - top - 12) / 440);
  [0, 1].forEach((i) => {
    const ox = MARGIN + i * (sh.w - 2 * MARGIN) / 2 + ((sh.w - 2 * MARGIN) / 2 - 200 * k) / 2 - 70 * k;
    const oy = top + 8 - 60 * k;
    sh.path(ARM.outline, ox, oy, k, { color: '#8d939c', width: 0.5 });
    for (const [x, y] of ARM.knuckles) sh.path(`M${x - 7} ${y + 4}Q${x} ${y - 1} ${x + 7} ${y + 4}`, ox, oy, k, { color: LIGHT, width: 0.3 });
    sh.path('M150 385C180 392 220 392 246 385', ox, oy, k, { color: LIGHT, width: 0.25, dash: [1.5, 1.5] });
    if (i === 0) {
      put(sh, sRow1 + sRow2 + sRow3 + sRow4 + sFlower, ox, oy, { k });
      const t = (y, s) => sh.text(ox + 268 * k, oy + y * k, s, { size: 2.6, color: GREY });
      t(262, '1 strokes'); t(294, '2 teardrops'); t(328, '3 curls + flower'); t(358, '4 dot trail');
    }
    sh.text(ox + 196 * k, top + 4, i === 0 ? 'Trace' : 'Your plan', { size: 3.4, color: INK, bold: true, anchor: 'middle' });
  });
  sh.save(join(OUT, 'hand-sampler'));
}

console.log('labs/module-02 sheets written');
