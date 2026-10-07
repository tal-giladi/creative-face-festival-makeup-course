// Module 9 printables -> labs/module-09/ (A4 and Letter, PDF + SVG).
// Run: node curriculum/tools/sheets-m09.mjs
// The design shapes come from assets-m09.mjs (importing it also rebuilds the module's diagrams).
import { join } from 'node:path';
import { Sheet, frame, MARGIN, GREY, LIGHT, INK, MODEL } from './lib/sheet.mjs';
import { FACE, circleD } from './lib/face.mjs';
import { ROOT } from './lib/figure.mjs';
import { pol, spline, curlPts } from './lib/art.mjs';
import { samplePath } from './lib/geom.mjs';
import { EYE_ZONE, HOLE_L, maskD, sScrollPts, SCALE_REGION, fairy, spirit } from './assets-m09.mjs';

const OUT = join(ROOT, 'labs', 'module-09');
const FACE_LINE = { color: '#8d939c', width: 0.45 };
const SOFTL = { color: '#b8bdc4', width: 0.3 };
const DASH = { color: '#c9ced6', width: 0.3, dash: [1.5, 1.5] };
const MODEL_LINE = { color: MODEL, width: 0.4 };
const EYEZ = { color: '#c0392b', width: 0.35, dash: [0.6, 1.2] };

function pages(base, title, sub, draw) {
  for (const paper of ['a4', 'letter']) {
    const sh = new Sheet(paper, title);
    const { top, bottom } = frame(sh, title, sub);
    draw(sh, top, bottom);
    sh.save(join(OUT, base));
  }
}
// Mirror absolute path data across the face center line x = 200.
const flipD = (d) => { let i = 0; return d.replace(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g, (t) => { if (/[A-Za-z]/.test(t)) { i = 0; return t; } return (i++ % 2 === 0) ? (400 - +t).toFixed(1) : t; }); };
// Outline every path and circle of an SVG markup string (skips defs and mirrored groups).
function outlines(sh, markup, x, y, k, opts = MODEL_LINE, { flip = false } = {}) {
  const m0 = markup.replace(/<defs>[\s\S]*?<\/defs>/g, '').replace(/<g transform="translate\(400 0\) scale\(-1 1\)">[\s\S]*?<\/g>/g, '');
  for (const m of m0.matchAll(/<path d="([^"]+)"/g)) { if (/[Aa]/.test(m[1])) continue; sh.path(m[1], x, y, k, opts); if (flip) sh.path(flipD(m[1]), x, y, k, opts); }
  for (const m of m0.matchAll(/<circle cx="([\d.-]+)" cy="([\d.-]+)" r="([\d.-]+)"/g)) {
    if (+m[3] < 1.2) continue;
    sh.path(circleD(+m[1], +m[2], +m[3]), x, y, k, opts);
    if (flip) sh.path(circleD(400 - +m[1], +m[2], +m[3]), x, y, k, opts);
  }
}
// Trace paths and circles of SVG markup, honoring nested <g transform> (translate/scale/rotate),
// skipping defs, clip paths and the many thin strips of shaded fills (data-s).
function traceMarkup(sh, markup, x, y, k, opts = MODEL_LINE) {
  const m0 = markup.replace(/<defs>[\s\S]*?<\/defs>/g, '');
  const parseT = (t) => {
    const ops = [...(t ?? '').matchAll(/(translate|scale|rotate)\(([^)]+)\)/g)].map(([, f, a]) => [f, a.trim().split(/[\s,]+/).map(Number)]);
    return ([u, v]) => { for (let i = ops.length - 1; i >= 0; i--) { const [f, a] = ops[i]; if (f === 'translate') { u += a[0]; v += a[1] ?? 0; } else if (f === 'scale') { u *= a[0]; v *= a[1] ?? a[0]; } else { const r = a[0] * Math.PI / 180, cx = a[1] ?? 0, cy = a[2] ?? 0, du = u - cx, dv = v - cy; u = cx + du * Math.cos(r) - dv * Math.sin(r); v = cy + du * Math.sin(r) + dv * Math.cos(r); } } return [u, v]; };
  };
  const stack = [(p) => p];
  const T = (p) => { for (let i = stack.length - 1; i >= 0; i--) p = stack[i](p); return p; };
  for (const m of m0.matchAll(/<g\b([^>]*)>|<\/g>|<path d="([^"]+)"([^>]*)>|<circle cx="([\d.-]+)" cy="([\d.-]+)" r="([\d.-]+)"([^>]*)>/g)) {
    if (m[0] === '</g>') { if (stack.length > 1) stack.pop(); continue; }
    if (m[0].startsWith('<g')) { const t = /transform="([^"]+)"/.exec(m[1] ?? ''); stack.push(t ? parseT(t[1]) : (p) => p); continue; }
    if (m[2]) {
      const own = /transform="([^"]+)"/.exec(m[3] ?? '');
      if (/data-s|fill="#000"|stroke-opacity|opacity="0\.[0-4]/.test(m[3] ?? '') || /[Aa]/.test(m[2])) continue;
      const f = own ? parseT(own[1]) : (p) => p;
      for (const p of samplePath(m[2], 2)) sh.pline(p.pts.map((q) => { const [u, v] = T(f(q)); return [x + u * k, y + v * k]; }), { ...opts, closed: p.closed });
    } else if (m[4]) {
      if (+m[6] < 1.4) continue;
      const c = circleD(+m[4], +m[5], +m[6]);
      for (const p of samplePath(c, 1.5)) sh.pline(p.pts.map((q) => { const [u, v] = T(q); return [x + u * k, y + v * k]; }), { ...opts, closed: true });
    }
  }
}
const ring = (sh, cx, cy, r, opts = { color: LIGHT, width: 0.35 }) => sh.path(circleD(cx, cy, r), 0, 0, 1, opts);
const pline = (sh, pts, x, y, k, opts) => sh.pline(pts.map(([u, v]) => [x + u * k, y + v * k]), opts);

// Outline face (frame 400 x 500) at (x, y), k mm per unit.
function face(sh, x, y, k, { eyes = 'open', centre = true, neck = true, brows = true } = {}) {
  const F = FACE;
  if (neck) sh.path('M158 404C160 420 159 432 156 444M242 404C240 420 241 432 244 444', x, y, k, FACE_LINE);
  sh.path(F.earL, x, y, k, FACE_LINE); sh.path(F.earR, x, y, k, FACE_LINE);
  sh.path(F.head, x, y, k, { ...FACE_LINE, width: 0.55 });
  sh.path(F.hair, x, y, k, { ...SOFTL, dash: [1.2, 1.6] });
  if (brows) { sh.path(F.browL, x, y, k, SOFTL); sh.path(F.browR, x, y, k, SOFTL); }
  if (eyes === 'closed') { sh.path(F.closedL, x, y, k, FACE_LINE); sh.path(F.closedR, x, y, k, FACE_LINE); }
  else {
    sh.path(F.eyeL, x, y, k, FACE_LINE); sh.path(F.eyeR, x, y, k, FACE_LINE);
    sh.path(circleD(150, 225, 9), x, y, k, SOFTL); sh.path(circleD(250, 225, 9), x, y, k, SOFTL);
  }
  sh.path(F.nose, x, y, k, SOFTL);
  sh.path(F.lipUp, x, y, k, FACE_LINE); sh.path(F.lipLo, x, y, k, FACE_LINE);
  if (centre) sh.path('M200 70V425', x, y, k, DASH);
}
const eyeZones = (sh, x, y, k) => { sh.path(EYE_ZONE, x, y, k, EYEZ); sh.path(flipD(EYE_ZONE), x, y, k, EYEZ); };
const fit = (x, y, w, h, fw = 320, fh = 380, ox = 40, oy = 60) => {
  const k = Math.min(w / fw, h / fh);
  return { x: x + (w - fw * k) / 2 - ox * k, y: y + (h - fh * k) / 2 - oy * k, k };
};
const field = (sh, lab, x, y, w, size = 2.9) => { sh.text(x, y, lab, { size, color: INK }); sh.line(x + Math.min(36, lab.length * size * 0.55 + 3), y + 0.6, x + w, y + 0.6, { color: LIGHT }); };
const box = (sh, x, y) => sh.rect(x, y - 2.8, 3.2, 3.2, { stroke: GREY, width: 0.3 });

// Point-in-polygon for scale rows inside a region.
const inPoly = (poly, [x, y]) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };

// ---------------------------------------------------------------------------------
// 1. Idea thumbnails (lesson 09.1, P12)
pages('idea-thumbnails', 'Idea thumbnails', 'One theme, six quick ideas. Sketch in 3 to 5 minutes each, then pick the one you can read in one second from 3 meters. Lesson 09.1.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN;
  field(sh, 'Theme:', MARGIN, top + 4, w * 0.5);
  field(sh, 'Palette (03.5):', MARGIN + w * 0.54, top + 4, w * 0.46);
  sh.text(MARGIN, top + 11, 'Key features:', { size: 2.9, color: INK });
  for (let i = 0; i < 5; i++) { sh.text(MARGIN + 24 + i * (w - 24) / 5, top + 11, `${i + 1}.`, { size: 2.7, color: GREY }); sh.line(MARGIN + 28 + i * (w - 24) / 5, top + 11.6, MARGIN + 20 + (i + 1) * (w - 24) / 5, top + 11.6, { color: LIGHT }); }
  const y0 = top + 16, cols = 3, rows = 2, gap = 4, cw = (w - (cols - 1) * gap) / cols, ch = (bottom - y0 - 8 - (rows - 1) * gap) / rows;
  for (let i = 0; i < 6; i++) {
    const c = i % cols, r = Math.floor(i / cols), x = MARGIN + c * (cw + gap), y = y0 + r * (ch + gap);
    sh.rect(x, y, cw, ch, { stroke: '#e3e6eb', width: 0.25 });
    sh.text(x + 2.5, y + 5, String.fromCharCode(65 + i), { size: 3.6, color: INK, bold: true });
    const f = fit(x + 2, y + 6, cw - 4, ch - 22, 300, 370, 50, 60);
    face(sh, f.x, f.y, f.k, { neck: false });
    eyeZones(sh, f.x, f.y, f.k);
    sh.text(x + 2.5, y + ch - 10, 'Reads from 3 m?', { size: 2.5, color: GREY });
    for (const [lab, dx] of [['yes', 26], ['no', 38]]) { box(sh, x + dx, y + ch - 10 + 0.4); sh.text(x + dx + 4.4, y + ch - 10, lab, { size: 2.5, color: GREY }); }
    sh.line(x + 2.5, y + ch - 3.5, x + cw - 2.5, y + ch - 3.5, { color: LIGHT });
  }
  sh.text(MARGIN, bottom - 1, 'Red dotted ovals: eye area. Plan only eye-safe products there, and no gems or glitter near the lashes.', { size: 2.5, color: '#c0392b' });
});

// ---------------------------------------------------------------------------------
// 2. Mood and palette planner (lessons 09.1, 09.3, 09.4, P12)
pages('mood-palette', 'Mood, features and palette planner', 'Turn one idea into features, simple shapes and a color story before you sketch on the face. Lessons 09.1, 09.3 and 09.4.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN;
  let y = top + 4;
  field(sh, 'Theme or character:', MARGIN, y, w * 0.6); field(sh, 'Mood words:', MARGIN + w * 0.63, y, w * 0.37);
  y += 9;
  sh.text(MARGIN, y, 'Key features and their simple shapes', { size: 3.6, color: INK, bold: true });
  const rh = 17;
  for (let i = 0; i < 5; i++) {
    const yy = y + 4 + i * rh;
    sh.text(MARGIN, yy + 6, `${i + 1}.`, { size: 3, color: INK });
    sh.line(MARGIN + 5, yy + 6.6, MARGIN + w * 0.32, yy + 6.6, { color: LIGHT });
    sh.rect(MARGIN + w * 0.36, yy, w * 0.27, rh - 3, { stroke: '#e3e6eb', width: 0.25 });
    sh.rect(MARGIN + w * 0.70, yy, w * 0.30, rh - 3, { stroke: '#e3e6eb', width: 0.25 });
    if (!i) { sh.text(MARGIN + w * 0.37, yy + 3, 'the real thing', { size: 2.3, color: GREY }); sh.text(MARGIN + w * 0.71, yy + 3, 'as brush strokes', { size: 2.3, color: GREY }); }
    sh.text(MARGIN + w * 0.655, yy + 7.5, '->', { size: 3, color: GREY, anchor: 'middle' });
  }
  y += 4 + 5 * rh + 4;
  sh.text(MARGIN, y, 'Color story', { size: 3.6, color: INK, bold: true });
  ['main (60%)', 'second (30%)', 'accent (10%)', 'black', 'white'].forEach((l, i) => {
    const cx = MARGIN + 9 + i * 22;
    ring(sh, cx, y + 9, 6, { color: i === 3 ? GREY : LIGHT, width: 0.35 });
    sh.text(cx, y + 19, l, { size: 2.3, color: GREY, anchor: 'middle' });
  });
  const kx = MARGIN + 118;
  sh.text(kx, y + 5, 'Palette type (lesson 03.5):', { size: 2.8, color: INK });
  ['analogous', 'complementary', 'monochrome + accent', 'warm with a cool touch', 'cool with a warm touch'].forEach((t, i) => { box(sh, kx, y + 10.5 + i * 4.6); sh.text(kx + 5, y + 10.5 + i * 4.6, t, { size: 2.6, color: GREY }); });
  y += 36;
  sh.text(MARGIN, y, 'References: what I take from each (never the whole design)', { size: 3.6, color: INK, bold: true });
  for (let i = 0; i < 3; i++) {
    const yy = y + 5 + i * 9;
    sh.text(MARGIN, yy + 3, `Picture ${i + 1}:`, { size: 2.8, color: INK }); sh.line(MARGIN + 17, yy + 3.6, MARGIN + w * 0.45, yy + 3.6, { color: LIGHT });
    sh.text(MARGIN + w * 0.48, yy + 3, 'I take:', { size: 2.8, color: INK }); sh.line(MARGIN + w * 0.48 + 11, yy + 3.6, MARGIN + w, yy + 3.6, { color: LIGHT });
    sh.text(MARGIN + w * 0.48 + 12, yy + 2.6, i === 0 ? 'e.g. the colors' : i === 1 ? 'e.g. one shape' : 'e.g. a texture', { size: 2.2, color: '#d0d4da' });
  }
  y += 36;
  sh.text(MARGIN, y, 'Constraints', { size: 3.6, color: INK, bold: true });
  field(sh, 'Where and how long:', MARGIN, y + 7, w * 0.48); field(sh, 'Time to paint:', MARGIN + w * 0.52, y + 7, w * 0.48);
  field(sh, 'Products I have:', MARGIN, y + 14, w * 0.48); field(sh, 'Skin tone notes:', MARGIN + w * 0.52, y + 14, w * 0.48);
  const cy = Math.min(bottom - 10, y + 22);
  ['Eye area: eye-safe products only', 'Every product patch-tested', 'No sacred or cultural designs worn as a costume'].forEach((t, i) => { box(sh, MARGIN + i * 64, cy); sh.text(MARGIN + 5 + i * 64, cy, t, { size: 2.5, color: GREY }); });
});

// ---------------------------------------------------------------------------------
// 3. Filigree and lace drill (lesson 09.2)
pages('filigree-drill', 'Filigree and lace drill', 'Trace each gray model with a liner brush, then paint it again in the empty space beside it. Thin, then thicker, then thin. Lesson 09.2.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, rows = 5, rh = (bottom - top - 4) / rows;
  const models = [
    ['C-scroll', [[-30, 22], [-14, 18], [0, 8], ...curlPts(10, -2, 14, { turns: 1.1, startDeg: 150, dir: 1, lead: 0, inner: 0.25 })]],
    ['S-scroll', sScrollPts([-28, 2], [24, -6], 10, 12, { startA: -90, startB: 90, dirA: -1, dirB: -1, turnsA: 1, turnsB: 1, mid: [[-10, -10], [6, 10]] })],
    ['Vine with curls', [[-40, 10], [-20, 4], [0, 2], [20, 4], ...curlPts(30, -4, 8, { turns: 1.15, startDeg: 90, dir: -1, lead: 0, inner: 0.3 })]],
  ];
  models.forEach(([name, pts], i) => {
    const y = top + i * rh;
    sh.rect(MARGIN, y + 1, w, rh - 2, { stroke: '#e3e6eb', width: 0.25 });
    sh.text(MARGIN + 3, y + 6, name, { size: 3.2, color: INK, bold: true });
    for (let c = 0; c < 3; c++) {
      const cx = MARGIN + 30 + c * (w - 30) / 3, cy = y + rh / 2 + 2, k = Math.min(0.62, (rh - 12) / 50);
      if (c === 0) pline(sh, spline(pts, 6), cx, cy, k, { color: MODEL, width: 0.7 });
      else if (c === 1) pline(sh, spline(pts, 6), cx, cy, k, { color: '#dde1e6', width: 0.4, dash: [1, 1.2] });
      else sh.circle(cx + pts[0][0] * k, cy + pts[0][1] * k, 0.7, { fill: GREY });
    }
  });
  // mirrored pair
  {
    const y = top + 3 * rh;
    sh.rect(MARGIN, y + 1, w, rh - 2, { stroke: '#e3e6eb', width: 0.25 });
    sh.text(MARGIN + 3, y + 6, 'Mirror it: paint the right half to match', { size: 3.2, color: INK, bold: true });
    const S1 = sScrollPts([-28, 2], [24, -6], 10, 12, { startA: -90, startB: 90, dirA: -1, dirB: -1, turnsA: 1, turnsB: 1, mid: [[-10, -10], [6, 10]] });
    const cx = MARGIN + w / 2, cy = y + rh / 2 + 3, k = 0.5;
    pline(sh, spline(S1, 6).map(([u, v]) => [-(u + 34), v]), cx, cy, k, { color: MODEL, width: 0.7 });
    sh.line(cx, y + 9, cx, y + rh - 4, DASH);
    sh.circle(cx + 6 * k, cy + 2 * k, 0.7, { fill: GREY });
  }
  // lace edge
  {
    const y = top + 4 * rh;
    sh.rect(MARGIN, y + 1, w, rh - 2, { stroke: '#e3e6eb', width: 0.25 });
    sh.text(MARGIN + 3, y + 6, 'Lace edge: scallops, then a dot in each, then tiny dots outside', { size: 3.2, color: INK, bold: true });
    const n = 14, x0 = MARGIN + 8, step = (w - 16) / n, by = y + rh * 0.42;
    for (let i = 0; i < n; i++) {
      const a = x0 + i * step, model = i < 5;
      const pts = []; for (let t = 0; t <= 12; t++) { const u = t / 12; pts.push([a + u * step, by + Math.sin(Math.PI * u) * step * 0.55]); }
      sh.pline(pts, model ? { color: MODEL, width: 0.6 } : { color: '#dde1e6', width: 0.35, dash: [1, 1.2] });
      if (model) { sh.circle(a + step / 2, by + step * 0.22, 0.7, { fill: MODEL }); sh.circle(a + step / 2, by + step * 0.8, 0.5, { fill: MODEL }); }
    }
    sh.line(x0, by, x0 + n * step, by, { color: MODEL, width: 0.5 });
  }
});

// ---------------------------------------------------------------------------------
// 4. Artistic mask to trace (lesson 09.2, P11)
pages('artistic-mask', 'Project 11: artistic mask', 'Trace the gray mask, lace and filigree, or use it as a guide for your own shape. Keep the almond around each eye bare. Lesson 09.2.', (sh, top, bottom) => {
  const f = fit(MARGIN, top + 2, sh.w - 2 * MARGIN, bottom - top - 22, 300, 360, 50, 60);
  face(sh, f.x, f.y, f.k, { brows: false });
  eyeZones(sh, f.x, f.y, f.k);
  sh.path(maskD('colombina'), f.x, f.y, f.k, { color: MODEL, width: 0.55 });
  sh.path(HOLE_L, f.x, f.y, f.k, { color: MODEL, width: 0.55 }); sh.path(flipD(HOLE_L), f.x, f.y, f.k, { color: MODEL, width: 0.55 });
  // filigree vines (the same as the diagrams), both sides
  const V = (lead, cx, cy, r, s, d) => [...lead, ...curlPts(cx, cy, r, { turns: 1.15, startDeg: s, dir: d, lead: 0, inner: 0.28 })];
  const vines = [V([[197, 199], [182, 191], [162, 186], [140, 185]], 122, 194, 8, -90, -1), V([[176, 189], [170, 183]], 165, 178, 4.2, 0, -1), V([[150, 185], [143, 179]], 138, 175, 3.8, 0, -1), V([[114, 202], [108, 186], [108, 172]], 114, 166, 4.5, 180, 1), V([[196, 250], [180, 258], [156, 262], [134, 258]], 120, 248, 7, 90, 1)];
  for (const v of vines) { const p = spline(v, 8); pline(sh, p, f.x, f.y, f.k, { color: MODEL, width: 0.4 }); pline(sh, p.map(([u, vv]) => [400 - u, vv]), f.x, f.y, f.k, { color: MODEL, width: 0.4 }); }
  // lace scallops along the lower edge
  const lower = samplePath(maskD('colombina'), 2)[0].pts.filter(([u, v]) => v > 236 && u < 200 && u > 100);
  // feathers: three guide lines from the left temple
  for (const [deg, len] of [[-66, 76], [-44, 96], [-24, 84]]) { const a = [107, 148], b = pol(107, 148, len, deg); pline(sh, [a, b], f.x, f.y, f.k, { color: MODEL, width: 0.35, dash: [1.4, 1.2] }); }
  for (let i = 0; i < lower.length - 4; i += 4) {
    for (const s of [1, -1]) {
      const a = lower[i], b = lower[i + 4], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 5];
      const pts = [a, m, b].map(([u, v]) => [s > 0 ? u : 400 - u, v]);
      pline(sh, spline(pts, 6), f.x, f.y, f.k, { color: MODEL, width: 0.3 });
    }
  }
  for (const [u, v] of [[200, 184], [106, 157], [294, 157]]) sh.circle(f.x + u * f.k, f.y + v * f.k, 1.1, { fill: GREY });
  sh.text(MARGIN, bottom - 5, 'Gray dots: gem places (forehead and temple tips only). Dashed lines: feather shafts.', { size: 2.5, color: GREY });
  sh.text(MARGIN, bottom - 1, 'Red dotted ovals: eye area. The mask edge stays outside them; no gems or glitter near the lashes.', { size: 2.5, color: '#c0392b' });
});

// ---------------------------------------------------------------------------------
// 5. Dragon to trace (lesson 09.3, P10)
pages('fantasy-character', 'Project 10: fantasy character (dragon)', 'Trace the scale area, horns and crest, then paint the scales row by row from the bottom up. Lesson 09.3.', (sh, top, bottom) => {
  const f = fit(MARGIN, top + 2, sh.w - 2 * MARGIN, bottom - top - 22, 300, 380, 50, 50);
  face(sh, f.x, f.y, f.k);
  eyeZones(sh, f.x, f.y, f.k);
  sh.path(SCALE_REGION, f.x, f.y, f.k, { color: MODEL, width: 0.5 }); sh.path(flipD(SCALE_REGION), f.x, f.y, f.k, { color: MODEL, width: 0.5 });
  // a few rows of scale arcs inside the region, as a guide
  const poly = samplePath(SCALE_REGION, 2)[0].pts;
  const r = 7, dy = r * 0.62;
  for (let j = 0, y = 330; y > 150; j++, y -= dy * 1.5) {
    for (let x = 80 + (j % 2) * r; x < 180; x += r * 2) {
      if (!inPoly(poly, [x, y]) || !inPoly(poly, [x - r, y]) || !inPoly(poly, [x + r, y])) continue;
      const arc = []; for (let t = 0; t <= 8; t++) { const a = Math.PI * t / 8; arc.push([x - r * Math.cos(a), y + r * Math.sin(a)]); }
      pline(sh, arc, f.x, f.y, f.k, { color: '#c9ced6', width: 0.3 });
      pline(sh, arc.map(([u, v]) => [400 - u, v]), f.x, f.y, f.k, { color: '#c9ced6', width: 0.3 });
    }
  }
  // horns (center line and outline guides)
  const horn = [[174, 140], [168, 118], [156, 100], [138, 90], [122, 94]];
  pline(sh, spline(horn, 8), f.x, f.y, f.k, { color: MODEL, width: 0.5, dash: [1.4, 1.2] });
  pline(sh, spline(horn, 8).map(([u, v]) => [400 - u, v]), f.x, f.y, f.k, { color: MODEL, width: 0.5, dash: [1.4, 1.2] });
  for (const [u, v, s] of [[174, 140, 14], [122, 94, 2]]) { sh.path(circleD(u, v, s), f.x, f.y, f.k, { color: MODEL, width: 0.3 }); sh.path(circleD(400 - u, v, s), f.x, f.y, f.k, { color: MODEL, width: 0.3 }); }
  for (let i = 0; i < 4; i++) { const y = 106 + i * 18, s = 10 - i * 1.5; pline(sh, [[200 - s, y + s * 1.2], [200, y - s * 0.6], [200 + s, y + s * 1.2]], f.x, f.y, f.k, { color: MODEL, width: 0.45 }); }
  sh.circle(f.x + 200 * f.k, f.y + 180 * f.k, 1.1, { fill: GREY });
  sh.text(MARGIN, bottom - 5, 'Circles on the horn line: the wide base and the thin tip. Gray dot: gem place. Scales fade out at the edges.', { size: 2.5, color: GREY });
  sh.text(MARGIN, bottom - 1, 'Red dotted ovals: eye area. Only eye-safe liner there; scales, horns and gems stay outside.', { size: 2.5, color: '#c0392b' });
});

// ---------------------------------------------------------------------------------
// 6. Fairy and forest spirit to trace (lesson 09.3)
pages('fairy-and-spirit', 'Fairy and forest spirit', 'Two more characters to trace or to use as a start for your own. Lesson 09.3.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, cw = (w - 4) / 2;
  [['Fairy', fairy({ stage: 4, flat: true })], ['Forest spirit', spirit({ stage: 5, flat: true })]].forEach(([name, design], i) => {
    const x = MARGIN + i * (cw + 4);
    sh.rect(x, top, cw, bottom - top - 8, { stroke: '#e3e6eb', width: 0.25 });
    sh.text(x + 3, top + 6, name, { size: 3.4, color: INK, bold: true });
    const f = fit(x + 2, top + 8, cw - 4, bottom - top - 20, 300, 360, 50, 60);
    face(sh, f.x, f.y, f.k, { neck: false });
    eyeZones(sh, f.x, f.y, f.k);
    traceMarkup(sh, design, f.x, f.y, f.k, { ...MODEL_LINE, width: 0.3 });
  });
  sh.text(MARGIN, bottom - 1, 'Red dotted ovals: eye area. Wings, leaves and glitter stay outside; only eye-safe liner inside.', { size: 2.5, color: '#c0392b' });
});

// ---------------------------------------------------------------------------------
// 7. Portfolio page (lesson 09.4, P10-P12)
pages('portfolio-page', 'Portfolio page', 'One page per finished design. Glue or tape in your photos, or note the photo file names. Lesson 09.4.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN;
  field(sh, 'Design name:', MARGIN, top + 4, w * 0.6); field(sh, 'Date:', MARGIN + w * 0.64, top + 4, w * 0.36);
  field(sh, 'Time taken:', MARGIN, top + 11, w * 0.3); field(sh, 'Painted on:', MARGIN + w * 0.34, top + 11, w * 0.66);
  const py = top + 16, ph = (bottom - top) * 0.42;
  const pw1 = w * 0.48;
  sh.rect(MARGIN, py, pw1, ph, { stroke: GREY, width: 0.3 });
  sh.text(MARGIN + pw1 / 2, py + ph / 2, 'Front photo, about 1 m away', { size: 2.8, color: LIGHT, anchor: 'middle' });
  const pw2 = w - pw1 - 4, ph2 = (ph - 4) / 2;
  sh.rect(MARGIN + pw1 + 4, py, pw2, ph2, { stroke: GREY, width: 0.3 });
  sh.text(MARGIN + pw1 + 4 + pw2 / 2, py + ph2 / 2, 'Close-up of the best part', { size: 2.8, color: LIGHT, anchor: 'middle' });
  sh.rect(MARGIN + pw1 + 4, py + ph2 + 4, pw2, ph2, { stroke: GREY, width: 0.3 });
  sh.text(MARGIN + pw1 + 4 + pw2 / 2, py + ph2 + 4 + ph2 / 2, 'Thumbnail or earlier version', { size: 2.8, color: LIGHT, anchor: 'middle' });
  let y = py + ph + 8;
  field(sh, 'Brief:', MARGIN, y, w);
  y += 8;
  sh.text(MARGIN, y, 'Palette:', { size: 2.9, color: INK });
  for (let i = 0; i < 5; i++) ring(sh, MARGIN + 22 + i * 11, y - 1, 4, { color: LIGHT, width: 0.35 });
  field(sh, 'References used:', MARGIN + 82, y, w - 82);
  y += 9;
  field(sh, 'What worked:', MARGIN, y, w); field(sh, '', MARGIN, y + 6, w);
  y += 14;
  field(sh, 'Next time I will:', MARGIN, y, w); field(sh, '', MARGIN, y + 6, w);
  y += 14;
  sh.text(MARGIN, y, 'Self-check (templates/self-check.md)', { size: 3.4, color: INK, bold: true });
  const checks = ['Reads in one second from 1-3 m', 'Sits where I planned', 'Clear main color', 'Smooth lines, clean ends', 'Even base, soft blends', 'Eye area clear of glitter, gems, neon', 'Lasted as long as needed', 'Skin fine; came off easily'];
  checks.forEach((t, i) => { const cx = MARGIN + (i % 2) * (w / 2), yy = y + 6 + Math.floor(i / 2) * 5.4; box(sh, cx, yy); sh.text(cx + 5, yy, t, { size: 2.6, color: GREY }); });
  y += 6 + 4 * 5.4 + 3;
  if (y < bottom - 2) field(sh, 'My goal for next time:', MARGIN, y, w);
});

console.log('labs/module-09 sheets written');
