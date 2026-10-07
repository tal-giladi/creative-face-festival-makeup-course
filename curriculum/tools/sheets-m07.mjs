// Module 7 printables -> labs/module-07/ (A4 and Letter, PDF + SVG).
// Run: node curriculum/tools/sheets-m07.mjs
// The design shapes come from assets-m07.mjs (importing it also rebuilds the module's diagrams).
import { join } from 'node:path';
import { Sheet, frame, MARGIN, GREY, LIGHT, INK, MODEL } from './lib/sheet.mjs';
import { FACE, circleD } from './lib/face.mjs';
import { ROOT } from './lib/figure.mjs';
import { pol, spline } from './lib/art.mjs';
import { mandala, PAL_PAPER, geoDesign, festivalEye, trance, EYE_ZONE, GEO, WAVE_SHEET } from './assets-m07.mjs';

const OUT = join(ROOT, 'labs', 'module-07');
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

// Outline every shape in an SVG markup string (paths and circles) at (x, y), k mm per unit.
// Paths inside <defs> (clip paths, gradients) and mirrored groups are skipped; use flip for the mirror.
function outlines(sh, markup, x, y, k, opts = MODEL_LINE, { flip = false } = {}) {
  const m0 = markup.replace(/<defs>[\s\S]*?<\/defs>/g, '').replace(/<g transform="translate\(400 0\) scale\(-1 1\)">[\s\S]*?<\/g>/g, '');
  for (const m of m0.matchAll(/<path d="([^"]+)"/g)) { sh.path(m[1], x, y, k, opts); if (flip) sh.path(flipD(m[1]), x, y, k, opts); }
  for (const m of m0.matchAll(/<circle cx="([\d.-]+)" cy="([\d.-]+)" r="([\d.-]+)"/g)) {
    sh.path(circleD(+m[1], +m[2], +m[3]), x, y, k, opts);
    if (flip) sh.path(circleD(400 - +m[1], +m[2], +m[3]), x, y, k, opts);
  }
}
const ring = (sh, cx, cy, r, opts = { color: LIGHT, width: 0.35 }) => sh.path(circleD(cx, cy, r), 0, 0, 1, opts);
// Mirror absolute path data (M L C Q S T only) across the face center line x = 200.
const flipD = (d) => { let i = 0; return d.replace(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g, (t) => { if (/[A-Za-z]/.test(t)) { i = 0; return t; } return (i++ % 2 === 0) ? (400 - +t).toFixed(1) : t; }); };

// Outline face (frame 400 x 500) at (x, y), k mm per unit.
function face(sh, x, y, k, { eyes = 'open', centre = true, neck = true } = {}) {
  const F = FACE;
  if (neck) sh.path('M158 404C160 420 159 432 156 444M242 404C240 420 241 432 244 444', x, y, k, FACE_LINE);
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
const eyeZones = (sh, x, y, k) => { sh.path(EYE_ZONE, x, y, k, EYEZ); sh.path(flipD(EYE_ZONE), x, y, k, EYEZ); };
// Biggest face that fits a box -> { x, y, k } (shows face units ox..ox+fw, oy..oy+fh)
const fit = (x, y, w, h, fw = 320, fh = 380, ox = 40, oy = 60) => {
  const k = Math.min(w / fw, h / fh);
  return { x: x + (w - fw * k) / 2 - ox * k, y: y + (h - fh * k) / 2 - oy * k, k };
};

// ---------------------------------------------------------------------------------
// 1. Dot mandala grids (lesson 07.1)
pages('dot-mandala-grids', 'Dot mandala grids', 'Trace the gray model first, then build your own on the grids. Dip again before every dot. Lesson 07.1.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, gap = 5, cw = (w - gap) / 2;
  const arcH = 38, gh = (bottom - top - arcH - 2 * gap) / 2;
  const cells = [['Model: trace it', 8, true], ['8 spokes', 8, false], ['12 spokes', 12, false], ['16 spokes', 16, false]];
  cells.forEach(([name, n, model], i) => {
    const x = MARGIN + (i % 2) * (cw + gap), y = top + Math.floor(i / 2) * (gh + gap);
    sh.rect(x, y, cw, gh, { stroke: '#e3e6eb', width: 0.25 });
    sh.text(x + 3, y + 5.5, name, { size: 3.2, color: INK, bold: true });
    const cx = x + cw / 2, cy = y + gh / 2 + 2.5, R = Math.min(cw, gh - 8) / 2 - 3;
    if (model) {
      const k = R / 108;
      outlines(sh, mandala(0, 0, 1, PAL_PAPER, { stage: 5 }), cx, cy, k, { color: MODEL, width: 0.35 });
      return;
    }
    for (const f of [0.2, 0.42, 0.64, 0.84, 1]) ring(sh, cx, cy, R * f, { color: f === 1 ? LIGHT : '#dde1e6', width: 0.3 });
    for (let s = 0; s < n; s++) {
      const [a, b] = pol(cx, cy, R * 0.1, -90 + (s * 360) / n), [c, d] = pol(cx, cy, R, -90 + (s * 360) / n);
      sh.line(a, b, c, d, { color: '#dde1e6', width: 0.3, dash: [1.2, 1.2] });
    }
    sh.circle(cx, cy, 0.8, { fill: GREY });
  });
  // cheekbone arc practice: three curves to dot along, big to small
  const y0 = top + 2 * gh + 2 * gap;
  sh.rect(MARGIN, y0, w, arcH, { stroke: '#e3e6eb', width: 0.25 });
  sh.text(MARGIN + 3, y0 + 5.5, 'Dot arcs: big dots at the gray start mark, smaller toward the end', { size: 3, color: INK, bold: true });
  for (let i = 0; i < 3; i++) {
    const x0 = MARGIN + 8 + i * (w / 3), pts = spline([[x0, y0 + 14], [x0 + 16, y0 + 30], [x0 + 38, y0 + 31], [x0 + 52, y0 + 18]], 12);
    sh.pline(pts, { color: '#dde1e6', width: 0.35, dash: [1.2, 1.2] });
    sh.circle(x0, y0 + 14, 1.6, { fill: MODEL });
  }
});

// ---------------------------------------------------------------------------------
// 2. Geometric guides on the face (lesson 07.2)
pages('geometric-guides', 'Geometric design: anchor dots and guides', 'Left half: trace the gray design. Right half: only the anchor dots; join them with short strokes to mirror it. Lesson 07.2.', (sh, top, bottom) => {
  const f = fit(MARGIN, top + 2, sh.w - 2 * MARGIN, bottom - top - 16, 300, 370, 50, 60);
  face(sh, f.x, f.y, f.k, { neck: false });
  eyeZones(sh, f.x, f.y, f.k);
  // light horizontal guides: hairline band, brow line, cheekbone line
  for (const v of [128, 150, 172, 270]) sh.path(`M96 ${v}H304`, f.x, f.y, f.k, { color: '#e3e6eb', width: 0.25, dash: [1, 1.5] });
  // left half of the design (diamond on the center line too)
  const design = geoDesign(undefined, { stage: 4 });
  outlines(sh, design, f.x, f.y, f.k, { color: MODEL, width: 0.4 });
  // anchor dots on both sides
  const anchors = [...GEO.dia, ...GEO.brow, ...GEO.brow2, ...[0, 1, 2].map((k2) => pol(...GEO.chev.base, k2 * GEO.chev.gap, GEO.chev.deg))];
  for (const [u, v] of anchors) {
    sh.circle(f.x + u * f.k, f.y + v * f.k, 0.9, { fill: GREY });
    sh.circle(f.x + (400 - u) * f.k, f.y + v * f.k, 0.9, { fill: GREY });
  }
  sh.text(MARGIN, bottom - 6, 'Gray dots: anchor points. Dashed lines: level guides. Red dotted ovals: the eye area, keep lines and color out of it.', { size: 2.6, color: GREY });
  sh.text(MARGIN, bottom - 1.5, 'Join dot to dot with short strokes, each about a third of a side. Turn the page so you always pull toward yourself.', { size: 2.6, color: GREY });
});

// ---------------------------------------------------------------------------------
// 3. Wave and nested-line drill (lesson 07.3)
pages('wave-drill', 'Waves and nested lines', 'Paint over each gray lead line, then nest 3 to 5 lines beside it at the same gap (the dotted line shows the first gap). Lesson 07.3.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, rows = 4, rh = (bottom - top - 50) / rows;
  for (let r = 0; r < rows; r++) {
    const y = top + r * rh;
    sh.rect(MARGIN, y + 1, w, rh - 2, { stroke: '#e3e6eb', width: 0.25 });
    const amp = [7, 6, 5, 6][r], per = [70, 60, 95, 55][r];
    const lead = [], gap = [];
    for (let x = 0; x <= w - 20; x += 2) {
      const yy = y + rh * 0.38 + amp * Math.sin((x / per) * 2 * Math.PI + r);
      lead.push([MARGIN + 10 + x, yy]);
    }
    // first gap guide: offset by 5 mm along the normal
    for (let i = 0; i < lead.length; i++) {
      const a = lead[Math.max(0, i - 1)], b = lead[Math.min(lead.length - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      gap.push([lead[i][0] - dy * -5, lead[i][1] + dx * 5]);
    }
    sh.pline(lead, { color: MODEL, width: 0.6 });
    sh.pline(gap, { color: '#d5d9df', width: 0.3, dash: [1, 1.2] });
  }
  // swirl lead on a half face
  const y0 = top + rows * rh + 2;
  sh.text(MARGIN, y0 + 4, 'Swirl: paint the gray lead line, then nest bands on the outside of the curl.', { size: 3, color: INK, bold: true });
  const k = 0.33, x0 = MARGIN + 6 - 92 * k, yy = y0 + 9 - 128 * k;
  sh.path(FACE.browL, x0, yy, k, SOFTL);
  sh.path(FACE.eyeL, x0, yy, k, SOFTL);
  sh.path('M200 128V236', x0, yy, k, DASH);
  outlines(sh, `<path d="M${WAVE_SHEET.map(([u, v]) => `${u} ${v}`).join('L')}"/>`, x0, yy, k, { color: MODEL, width: 0.6 });
  sh.text(MARGIN + 75, y0 + 14, '1. Lead line in one slow stroke.', { size: 2.8, color: GREY });
  sh.text(MARGIN + 75, y0 + 20, '2. Second line at the same gap, then the next.', { size: 2.8, color: GREY });
  sh.text(MARGIN + 75, y0 + 26, '3. Fill the lanes with color, then black lines again.', { size: 2.8, color: GREY });
  sh.text(MARGIN + 75, y0 + 32, '4. Thin white highlight in the lightest band.', { size: 2.8, color: GREY });
});

// ---------------------------------------------------------------------------------
// 4. Festival look plan (lesson 07.4)
pages('festival-look-plan', 'Festival look plan', 'Plan the whole look before you paint: sketch, palette, order, timing and checks. Lesson 07.4.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, fw = w * 0.52;
  const f = fit(MARGIN, top + 2, fw, (bottom - top) * 0.72, 300, 380, 50, 50);
  face(sh, f.x, f.y, f.k);
  eyeZones(sh, f.x, f.y, f.k);
  sh.text(MARGIN, top + (bottom - top) * 0.72 + 6, 'Red dotted ovals: eye area (eye-safe only, no neon, no glitter or gems).', { size: 2.5, color: '#c0392b' });
  // brief under the face
  let y = top + (bottom - top) * 0.72 + 13;
  const field = (lab, yy, x = MARGIN, ww = fw) => { sh.text(x, yy, lab, { size: 2.9, color: INK }); sh.line(x + 34, yy + 0.6, x + ww, yy + 0.6, { color: LIGHT }); };
  sh.text(MARGIN, y, 'Brief', { size: 3.6, color: INK, bold: true });
  field('Event / place:', y + 7); field('Hours it must last:', y + 14); field('Heat, sweat, dancing?', y + 21); field('UV lights there?', y + 28);
  // right column
  const rx = MARGIN + fw + 6, rw = w - fw - 6;
  y = top + 4;
  sh.text(rx, y, 'Palette', { size: 3.6, color: INK, bold: true });
  ['main', 'second', 'accent', 'black', 'white'].forEach((l, i) => {
    const cx = rx + 6 + i * (rw - 6) / 5;
    ring(sh, cx, y + 9, 4.2, { color: i === 3 ? GREY : LIGHT, width: 0.35 });
    sh.text(cx, y + 17, l, { size: 2.3, color: GREY, anchor: 'middle' });
  });
  y += 26;
  sh.text(rx, y, 'Parts (star zone first)', { size: 3.6, color: INK, bold: true });
  for (let i = 1; i <= 4; i++) { sh.text(rx, y + 2 + i * 6.5, `${i}.`, { size: 2.9, color: INK }); sh.line(rx + 5, y + 2.6 + i * 6.5, rx + rw, y + 2.6 + i * 6.5, { color: LIGHT }); }
  y += 38;
  sh.text(rx, y, 'Order of work', { size: 3.6, color: INK, bold: true });
  const steps = ['Prep skin, patch-tested products', 'Light sketch, check both sides', 'Big color shapes and bands', 'Black linework', 'Dots and white details', 'Eye makeup (eye-safe only)', 'Set: eyes and mouth closed', 'Glitter and gems last', 'Photos: daylight, 3 m, UV'];
  steps.forEach((s, i) => { const yy = y + 6 + i * 6.2; sh.rect(rx, yy - 2.8, 3.2, 3.2, { stroke: GREY, width: 0.3 }); sh.text(rx + 5, yy, s, { size: 2.7, color: GREY }); sh.text(rx + rw, yy, '___ min', { size: 2.5, color: LIGHT, anchor: 'end' }); });
  y += 6 + steps.length * 6.2 + 4;
  sh.text(rx, y, 'Touch-up kit', { size: 3.6, color: INK, bold: true });
  ['mirror, mini palette, small brush', 'cotton buds, wipes, tissues', 'powder or setting spray', 'spare gems + skin adhesive'].forEach((s, i) => { const yy = y + 6 + i * 5.6; sh.rect(rx, yy - 2.8, 3.2, 3.2, { stroke: GREY, width: 0.3 }); sh.text(rx + 5, yy, s, { size: 2.6, color: GREY }); });
  y += 6 + 4 * 5.6 + 4;
  sh.text(rx, y, 'Removal tonight', { size: 3.6, color: INK, bold: true });
  ['gems off from the edge', 'glitter: tape, then wash', 'eyes: eye-safe remover'].forEach((s, i) => { const yy = y + 6 + i * 5.6; sh.rect(rx, yy - 2.8, 3.2, 3.2, { stroke: GREY, width: 0.3 }); sh.text(rx + 5, yy, s, { size: 2.6, color: GREY }); });
});

// ---------------------------------------------------------------------------------
// 5. Project 6: festival eye to trace
pages('festival-eye', 'Project 6: festival eye', 'Top: trace the gray design on both eyes. Bottom: paint it yourself from the gray start dots. Eye-safe products only inside the red dotted line.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, rh = (bottom - top - 6) / 2;
  const f = festivalEye({ stage: 6 });
  const design = f.under + f.over.replace(/<path d="[^"]*" fill="#c9a6ff"[^>]*>|<path d="[^"]*" fill="#6fd3ff"[^>]*>/g, '');
  const k = Math.min((w - 4) / 260, (rh - 10) / 150);
  [true, false].forEach((model, i) => {
    const y = top + i * (rh + 3);
    sh.rect(MARGIN, y, w, rh, { stroke: '#e3e6eb', width: 0.25 });
    sh.text(MARGIN + 3, y + 5.5, model ? 'Trace' : 'Your turn', { size: 3.2, color: INK, bold: true });
    const x0 = MARGIN + (w - 260 * k) / 2 - 70 * k, y0 = y + 8 + (rh - 10 - 150 * k) / 2 - 135 * k;
    const F = FACE;
    for (const p of [F.browL, F.browR]) sh.path(p, x0, y0, k, SOFTL);
    sh.path(F.eyeL, x0, y0, k, FACE_LINE); sh.path(F.eyeR, x0, y0, k, FACE_LINE);
    sh.path(F.lidL, x0, y0, k, SOFTL); sh.path(F.lidR, x0, y0, k, SOFTL);
    sh.path(circleD(150, 225, 9), x0, y0, k, SOFTL); sh.path(circleD(250, 225, 9), x0, y0, k, SOFTL);
    sh.path('M193 236C192 252 190 262 189 266M207 236C208 252 210 262 211 266', x0, y0, k, SOFTL);
    sh.path('M94 140C92 180 96 240 108 280M306 140C308 180 304 240 292 280', x0, y0, k, FACE_LINE);
    eyeZones(sh, x0, y0, k);
    if (model) outlines(sh, design, x0, y0, k, MODEL_LINE, { flip: true });
    else for (const [u, v] of [[100, 208], [124, 170], [176, 209], [103, 216]]) { sh.circle(x0 + u * k, y0 + v * k, 0.8, { fill: GREY }); sh.circle(x0 + (400 - u) * k, y0 + v * k, 0.8, { fill: GREY }); }
  });
  sh.text(MARGIN, bottom - 1, 'Liner, crease, brow-bone color and dots: eye-safe products. Chevrons, dot trails and gems: outside the eye area only.', { size: 2.5, color: '#c0392b' });
});

// ---------------------------------------------------------------------------------
// 6. Project 9: symmetrical trance face to trace
pages('trance-face', 'Project 9: symmetrical trance face', 'Trace the gray design, or paint it in your palette. Mandala and swirls first, then chevrons and dots. Gems last, outside the eye area.', (sh, top, bottom) => {
  const f = fit(MARGIN, top + 2, sh.w - 2 * MARGIN, bottom - top - 8, 300, 380, 50, 60);
  face(sh, f.x, f.y, f.k);
  eyeZones(sh, f.x, f.y, f.k);
  outlines(sh, trance({ stage: 6 }).under, f.x, f.y, f.k, { color: MODEL, width: 0.35 }, { flip: true });
  sh.text(MARGIN, bottom - 1, 'Red dotted ovals: eye area. Only eye-safe liner and mascara there; no neon, glitter or gems.', { size: 2.5, color: '#c0392b' });
});

console.log('labs/module-07 sheets written');
