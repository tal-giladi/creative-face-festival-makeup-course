// Module 4 printable design sheets -> labs/module-04/ (A4 and Letter, PDF + SVG).
// Each sheet is the practice face with one design drawn in light gray lines to trace or paint over.
// The design line art comes from assets-m04.mjs (LINEART), so the sheets match the lesson pictures.
// Run: node curriculum/tools/sheets-m04.mjs
import { join } from 'node:path';
import { Sheet, frame, MARGIN, GREY } from './lib/sheet.mjs';
import { FACE, circleD } from './lib/face.mjs';
import { ROOT } from './lib/figure.mjs';
import { samplePath } from './lib/geom.mjs';
import { LINEART } from './assets-m04.mjs';

const OUT = join(ROOT, 'labs', 'module-04');
const FACE_LINE = { color: '#8d939c', width: 0.45 };
const SOFT = { color: '#b8bdc4', width: 0.3 };
const DESIGN = { color: '#b3b9c2', width: 0.3 };

// Practice face outline (same drawing as labs/common) at (x, y), k mm per face unit.
function face(sh, x, y, k, { eyes = 'open' } = {}) {
  const F = FACE;
  sh.path(F.neck, x, y, k, FACE_LINE);
  sh.path(F.earL, x, y, k, FACE_LINE); sh.path(F.earR, x, y, k, FACE_LINE);
  sh.path(F.head, x, y, k, { ...FACE_LINE, width: 0.55 });
  sh.path(F.browL, x, y, k, SOFT); sh.path(F.browR, x, y, k, SOFT);
  if (eyes === 'closed') { sh.path(F.closedL, x, y, k, FACE_LINE); sh.path(F.closedR, x, y, k, FACE_LINE); }
  else {
    sh.path(F.eyeL, x, y, k, FACE_LINE); sh.path(F.eyeR, x, y, k, FACE_LINE);
    sh.path(circleD(150, 225, 9), x, y, k, SOFT); sh.path(circleD(250, 225, 9), x, y, k, SOFT);
  }
  sh.path(F.nose, x, y, k, SOFT);
  sh.path(F.lipUp, x, y, k, FACE_LINE); sh.path(F.lipLo, x, y, k, FACE_LINE);
}

// ---- tiny SVG fragment flattener: paths, circles and ellipses with nested <g transform> ----
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
    else if (t.startsWith('<ellipse')) { const cx = +attr('cx'), cy = +attr('cy'), rx = +attr('rx'), ry = +attr('ry'); d = circleD(0, 0, 1); for (const p of samplePath(d, 0.05)) out.push({ pts: p.pts.map(([x, y]) => ap(m, [cx + x * rx, cy + y * ry])), closed: true }); continue; }
    if (!d) continue;
    for (const p of samplePath(d, 1)) out.push({ pts: p.pts.map((q) => ap(m, q)), closed: p.closed });
  }
  return out;
}

function designSheet(base, title, sub, art, { eyes = 'open', note = '' } = {}) {
  const lines = flatten(art);
  for (const paper of ['a4', 'letter']) {
    const sh = new Sheet(paper, title);
    const { top, bottom } = frame(sh, title, sub);
    const h = bottom - top - (note ? 10 : 4), w = sh.w - 2 * MARGIN;
    const k = Math.min(w / 320, h / 450);
    const x = MARGIN + (w - 320 * k) / 2 - 40 * k, y = top + 2 - 50 * k;
    face(sh, x, y, k, { eyes });
    for (const p of lines) sh.pline(p.pts.map(([u, v]) => [x + u * k, y + v * k]), { ...DESIGN, closed: p.closed });
    if (note) sh.text(MARGIN, bottom - 1, note, { size: 2.8, color: GREY });
    sh.save(join(OUT, base));
  }
}

designSheet('design-1-flowers', 'Design sheet · Flower crown, vine and cheek cluster',
  'Trace the gray outlines: a flower crown with a vine (left) and a cheek cluster (right). Lessons 04.1 and project 3.', LINEART.flowers,
  { note: 'Order: sponge glow, petals, leaves and vines, centers, thin outline, white highlights.' });
designSheet('design-2-rainbow-stars', 'Design sheet · Rainbow cheek and star swoosh',
  'Left cheek: rainbow with clouds (lesson 04.4, project 1). Right cheek: star swoosh (lesson 04.2).', LINEART.rainbow,
  { note: 'Paint each rainbow stripe along one gray line. Clouds go on last, over the ends.' });
designSheet('design-3-butterfly', 'Design sheet · Butterfly face',
  'Eyes closed. Body on the center line, upper wings over the brows and lids, lower wings on the cheeks. Lesson 04.3, project 2.', LINEART.butterfly,
  { eyes: 'closed', note: 'On a real face: eye-safe paint only on the lids, and keep the lower wings below the lashes.' });
designSheet('design-4-tiger', 'Design sheet · Tiger face',
  'Sponge orange first, then the white areas, the nose, and the stripes from the edge inward. Lesson 04.5, project 4.', LINEART.tiger,
  { note: 'Stripes: press at the edge of the face, pull inward and lift to a point.' });
designSheet('design-5-hero', 'Design sheet · Hero mask and crown',
  'Eyes open. The mask leaves a gap around each eye; the crown sits on the forehead. Lesson 04.6, project 5.', LINEART.hero,
  { note: 'On a real face: eye-safe paint for the mask, no glitter or gems near the lashes.' });

console.log('labs/module-04 sheets written');
