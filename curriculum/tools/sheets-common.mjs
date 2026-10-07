// Shared printable practice templates -> labs/common/ (A4 and Letter, PDF + SVG).
// Run: node curriculum/tools/sheets-common.mjs
import { join } from 'node:path';
import { Sheet, frame, MARGIN, GREY, LIGHT, INK } from './lib/sheet.mjs';
import { FACE, ARM, BODY, circleD } from './lib/face.mjs';
import { ROOT } from './lib/figure.mjs';

const OUT = join(ROOT, 'labs', 'common');
const FACE_LINE = { color: '#8d939c', width: 0.45 };
const SOFT = { color: '#b8bdc4', width: 0.3 };
const DASH = { color: '#c9ced6', width: 0.25, dash: [1.5, 1.5] };

// Outline face (frame 400 x 500 units) at (x, y), k mm per unit. clipX: only draw x <= clipX (half faces).
function face(sh, x, y, k, { eyes = 'open', centre = false, zones = false } = {}) {
  const F = FACE;
  sh.path(F.neck, x, y, k, FACE_LINE);
  sh.path(F.earL, x, y, k, FACE_LINE); sh.path(F.earR, x, y, k, FACE_LINE);
  sh.path(F.head, x, y, k, { ...FACE_LINE, width: 0.55 });
  sh.path(F.hair, x, y, k, { ...SOFT, dash: [1.2, 1.6] });
  sh.path(F.browL, x, y, k, SOFT); sh.path(F.browR, x, y, k, SOFT);
  if (eyes === 'closed') { sh.path(F.closedL, x, y, k, FACE_LINE); sh.path(F.closedR, x, y, k, FACE_LINE); }
  else {
    sh.path(F.eyeL, x, y, k, FACE_LINE); sh.path(F.eyeR, x, y, k, FACE_LINE);
    sh.path(circleD(150, 225, 9), x, y, k, SOFT);
    sh.path(circleD(250, 225, 9), x, y, k, SOFT);
    sh.path(F.lidL, x, y, k, SOFT); sh.path(F.lidR, x, y, k, SOFT);
  }
  sh.path(F.nose, x, y, k, SOFT);
  sh.path(F.lipUp, x, y, k, FACE_LINE); sh.path(F.lipLo, x, y, k, FACE_LINE);
  if (centre) sh.path('M200 62V432', x, y, k, DASH);
  if (zones) {
    sh.path('M95 160H305', x, y, k, DASH);   // brow band top
    sh.path('M92 226H308', x, y, k, DASH);   // eye line
    sh.path('M100 300H300', x, y, k, DASH);  // cheek / nose base line
    const t = (u, v, s) => sh.text(x + u * k, y + v * k, s, { size: 2.6, color: GREY, anchor: 'middle' });
    t(200, 130, 'forehead'); t(118, 182, 'temple'); t(282, 182, 'temple');
    t(140, 275, 'cheek'); t(260, 275, 'cheek'); t(200, 395, 'chin');
  }
}

function pages(base, title, sub, draw) {
  for (const paper of ['a4', 'letter']) {
    const sh = new Sheet(paper, title);
    const { top, bottom } = frame(sh, title, sub);
    draw(sh, top, bottom);
    sh.save(join(OUT, `${base}`));
  }
}

// Biggest face that fits a box (w x h mm) -> { x, y, k }
const fit = (x, y, w, h, fw = 400, fh = 470, ox = 0, oy = 50) => {
  const k = Math.min(w / fw, h / fh);
  return { x: x + (w - fw * k) / 2 - ox * k, y: y + (h - fh * k) / 2 - oy * k, k };
};

// 1. One big front face
pages('face-front', 'Practice face — front', 'Paint on the printed sheet, or slide it into a clear sheet protector and paint on the plastic.', (sh, top, bottom) => {
  const f = fit(MARGIN, top + 2, sh.w - 2 * MARGIN, bottom - top - 4, 320, 470, 40, 40);
  face(sh, f.x, f.y, f.k, { eyes: 'closed' });
});

// 2. Front face with open eyes (designs that frame open eyes)
pages('face-front-open-eyes', 'Practice face — eyes open', 'Use this one for masks, eye designs and anything that frames the eyes.', (sh, top, bottom) => {
  const f = fit(MARGIN, top + 2, sh.w - 2 * MARGIN, bottom - top - 4, 320, 470, 40, 40);
  face(sh, f.x, f.y, f.k, { eyes: 'open' });
});

// 3. Two faces on one page (quick tries, compare two color ideas)
pages('face-front-2up', 'Two practice faces', 'Try two versions of the same idea side by side.', (sh, top, bottom) => {
  const w = (sh.w - 2 * MARGIN - 8) / 2;
  for (const i of [0, 1]) {
    const f = fit(MARGIN + i * (w + 8), top + 20, w, bottom - top - 40, 320, 470, 40, 40);
    face(sh, f.x, f.y, f.k, { eyes: 'closed' });
  }
});

// 4. Face map with centre line and zones
pages('face-map', 'Face map', 'Center line, eye line and the main zones. Plan where each part of a design goes.', (sh, top, bottom) => {
  const f = fit(MARGIN, top + 2, sh.w - 2 * MARGIN, bottom - top - 4, 320, 470, 40, 40);
  face(sh, f.x, f.y, f.k, { eyes: 'closed', centre: true, zones: true });
});

// 5. Left and right halves (paint one side, mirror it on the other)
for (const side of ['left', 'right']) {
  const isL = side === 'left';
  pages(`half-face-${side}`, `Half face — ${side} side`, `Paint the ${side} half here, then copy it onto the other half of a full face.`, (sh, top, bottom) => {
    // the face is drawn large and only the half (plus a little past the centre line) is kept on the page
    const k = (bottom - top - 6) / 400;
    const cxmm = sh.w / 2 + (isL ? 1 : -1) * 200 * k * 0.42;
    const x = cxmm - 200 * k, y = top + 2 - 55 * k;
    const half = new Sheet(sh.paper);
    face(half, x, y, k, { eyes: 'closed', centre: true });
    const keep = (px) => (isL ? px <= cxmm + 6 : px >= cxmm - 6);
    for (const op of half.ops) {
      if (op.t !== 'pline') { sh.ops.push(op); continue; }
      let run = [];
      for (const p of op.pts) {
        if (keep(p[0]) && p[0] > MARGIN && p[0] < sh.w - MARGIN && p[1] < bottom) run.push(p);
        else { if (run.length > 1) sh.pline(run, { ...op, closed: false }); run = []; }
      }
      if (run.length > 1) sh.pline(run, { ...op, closed: false });
    }
  });
}

// 6. Eye area, two per page
pages('eye-area', 'Eye area', 'Both eyes and brows, life size and bigger. For eye designs, liner and gems.', (sh, top, bottom) => {
  const h = (bottom - top - 10) / 2;
  for (const i of [0, 1]) {
    const k = (sh.w - 2 * MARGIN) / 230;
    const x = MARGIN - 85 * k, y = top + 4 + i * (h + 6) + (h - 120 * k) / 2 - 165 * k;
    const F = FACE;
    for (const d of [F.browL, F.browR]) sh.path(d, x, y, k, SOFT);
    if (i === 0) { sh.path(F.eyeL, x, y, k, FACE_LINE); sh.path(F.eyeR, x, y, k, FACE_LINE); sh.path(F.lidL, x, y, k, SOFT); sh.path(F.lidR, x, y, k, SOFT);
      sh.path(circleD(150, 225, 9), x, y, k, SOFT); sh.path(circleD(250, 225, 9), x, y, k, SOFT); }
    else { sh.path(F.closedL, x, y, k, FACE_LINE); sh.path(F.closedR, x, y, k, FACE_LINE); }
    sh.path('M193 236C192 262 186 284 184 296M207 236C208 262 214 284 216 296', x, y, k, SOFT);
    sh.path('M200 160V250', x, y, k, DASH);
    sh.text(MARGIN, y + 150 * k, i === 0 ? 'eyes open' : 'eyes closed', { size: 3, color: GREY });
  }
});

// 7. Hand and forearm (Level 4)
pages('hand-arm', 'Hand and forearm', 'Back of the hand, fingers up. For bracelets, sleeves and vines.', (sh, top, bottom) => {
  const f = fit(MARGIN, top + 2, sh.w - 2 * MARGIN, bottom - top - 4, 220, 450, 70, 50);
  sh.path(ARM.outline, f.x, f.y, f.k, { ...FACE_LINE, width: 0.55 });
  sh.path('M150 385C180 392 220 392 246 385', f.x, f.y, f.k, DASH); // wrist line
});

// 8. Shoulders and upper body (Level 4)
pages('upper-body', 'Shoulders and upper body', 'Front view. Collarbones and the center line help you place a design.', (sh, top, bottom) => {
  const f = fit(MARGIN, top + 20, sh.w - 2 * MARGIN, bottom - top - 40, 400, 280, 0, 30);
  sh.path(BODY.outline, f.x, f.y, f.k, { ...FACE_LINE, width: 0.55 });
  sh.path(BODY.collarbones, f.x, f.y, f.k, SOFT);
  sh.path('M200 140V300', f.x, f.y, f.k, DASH);
});

// 9. Swatch and stroke card (used from Module 1 on)
pages('swatch-card', 'Swatch and stroke card', 'One box per color: write the name, paint a swatch, a line and a dot. Note how much water it needed.', (sh, top, bottom) => {
  const cols = 3, rowsN = 6, gw = (sh.w - 2 * MARGIN - (cols - 1) * 5) / cols, gh = (bottom - top - 4 - (rowsN - 1) * 5) / rowsN;
  for (let r = 0; r < rowsN; r++) for (let c = 0; c < cols; c++) {
    const x = MARGIN + c * (gw + 5), y = top + 2 + r * (gh + 5);
    sh.rect(x, y, gw, gh, { stroke: LIGHT, width: 0.3 });
    sh.text(x + 2, y + 4.5, 'Color:', { size: 2.6, color: GREY });
    sh.rect(x + 3, y + 8, gw * 0.42, gh - 18, { stroke: '#dde1e6', width: 0.2 });
    sh.text(x + 3 + gw * 0.21, y + gh - 6.5, 'swatch', { size: 2.2, color: LIGHT, anchor: 'middle' });
    sh.line(x + gw * 0.52, y + 12, x + gw - 4, y + 12, { color: '#e3e6eb', width: 0.2 });
    sh.text(x + gw * 0.52, y + 10.5, 'line', { size: 2.2, color: LIGHT });
    sh.text(x + gw * 0.52, y + gh * 0.55, 'dot', { size: 2.2, color: LIGHT });
    sh.text(x + 2, y + gh - 2, 'Water: little / some / lots', { size: 2.3, color: GREY });
  }
});

console.log('labs/common sheets written');
void INK;
