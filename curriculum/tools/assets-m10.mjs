// Module 10 diagrams (Body Art, optional) and the P13 project images.
// Run: node curriculum/tools/assets-m10.mjs
// Local figures (not in the shared lib): a long hand-and-forearm (ARM extended to the elbow), a
// closed, filled upper body (BODY) with optional top, a shoulder-and-whole-arm figure, and a
// 3D forearm tube for "wraps around" diagrams. Exported for sheets-m10.mjs.
import { plain, strip, faceLayer, paperPanel } from './lib/figure.mjs';
import { P, SOFT, INK, OK, BAD, ACCENT, label, arrow, badge, tick, cross, line, stroke, teardrop, petal, dot, dots, sponge, glow, brush, curlPts, pol, spline, polyD, rng } from './lib/art.mjs';
import { SKIN, ARM, BODY } from './lib/face.mjs';

const K = P.black;
const n1 = (v) => (Math.round(v * 10) / 10).toString();
const OUTLINE = '#5b4636', SOFTLINE = '#8a7462';

// ---------- small helpers ----------
const MIR = (c, cx = 200) => `<g transform="translate(${2 * cx} 0) scale(-1 1)">${c}</g>`;
const sym = (c, cx = 200) => c + MIR(c, cx);
const op = (o, c) => `<g opacity="${o}">${c}</g>`;
let cid = 0;
const clipTo = (d, content) => { const id = `m10c${cid++}`; return `<defs><clipPath id="${id}">${[].concat(d).map((p) => `<path d="${p}"/>`).join('')}</clipPath></defs><g clip-path="url(#${id})">${content}</g>`; };
const outlineOnly = (svg, w = 2, c = K) => svg.replace(/fill="(#[0-9a-fA-F]{3,6})"/g, `fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round"`);
const skinOf = (s) => SKIN[s] ?? s;
// Darken a hex color by f (0..1).
const shade = (hex, f) => { const v = parseInt(hex.slice(1), 16); const c = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((x) => Math.round(x * (1 - f))); return `#${c.map((x) => x.toString(16).padStart(2, '0')).join('')}`; };
const bad = (p) => ({ ...p, labelColor: BAD });
const good = (p) => ({ ...p, labelColor: OK });

// Leaf painted in one pressure stroke: an almond shape from (x, y) pointing deg.
function leafD(x, y, deg, len, w, curve = 0.12) {
  const b = pol(x, y, len, deg), m = pol(...pol(x, y, len * 0.5, deg), curve * len, deg + 90);
  const c1 = pol(m[0], m[1], w, deg - 90), c2 = pol(m[0], m[1], w, deg + 90);
  return `M${n1(x)} ${n1(y)}Q${n1(c1[0])} ${n1(c1[1])} ${n1(b[0])} ${n1(b[1])}Q${n1(c2[0])} ${n1(c2[1])} ${n1(x)} ${n1(y)}Z`;
}
function leaf(x, y, deg, len, w, color = P.green, { curve = 0.12, vein = null } = {}) {
  const m = pol(...pol(x, y, len * 0.5, deg), curve * len * 0.9, deg + 90);
  return (color === 'none' ? '' : `<path d="${leafD(x, y, deg, len, w, curve)}" fill="${color}"/>`)
    + (vein ? stroke([pol(x, y, len * 0.12, deg), m, pol(x, y, len * 0.82, deg)], { w: Math.max(1.4, w * 0.13), color: vein }) : '');
}
// A vine that ends in a curl of radius r.
function vinePts(pts, r, dir = 1, turns = 0.95) {
  const [a, b] = [pts[pts.length - 2], pts[pts.length - 1]];
  const th = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
  const c = pol(b[0], b[1], r, th + dir * 90);
  const curl = curlPts(c[0], c[1], r, { turns, startDeg: th - dir * 90, dir, lead: 0, inner: 0.25 });
  return [...pts.slice(0, -1), ...curl];
}
// Point and direction at fraction t along a spline.
function along(pts, t) {
  const c = spline(pts, 20), acc = [0];
  for (let i = 1; i < c.length; i++) acc.push(acc[i - 1] + Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]));
  const target = acc[acc.length - 1] * t; let j = acc.findIndex((v) => v >= target); if (j < 1) j = 1;
  return { p: c[j], deg: Math.atan2(c[j][1] - c[j - 1][1], c[j][0] - c[j - 1][0]) * 180 / Math.PI };
}
const vineLeaves = (pts, ts, len, w, color = P.green, vein = null, flip = false) => ts.map((t, i) => {
  const { p, deg } = along(pts, t); const s = (i % 2 ? 1 : -1) * (flip ? -1 : 1);
  return leaf(p[0], p[1], deg + 50 * s, len, w, color, { curve: 0.1 * s, vein });
}).join('');
const vine = (pts, w = 5, color = P.green) => stroke(pts, { w, color });
const shine = (x, y, deg, len = 10, w = 3.2) => stroke([[x, y], pol(x, y, len * 0.5, deg), pol(...pol(x, y, len, deg), len * 0.2, deg + 90)], { w, color: P.white });

// Five-petal flower in layers (step strips add one layer at a time).
function flower(cx, cy, k, c, { n = 5, rot = -90, mid = P.yellow, ow = 1.8, line: lc = K } = {}) {
  const R = 22 * k, W = 25 * k, Ln = 21 * k;
  const ang = (i) => rot + (i * 360) / n;
  const pet = (i, col) => { const a = ang(i), h = pol(cx, cy, R, a); return teardrop(h[0], h[1], a + 180, Ln, W, col); };
  const petals = Array.from({ length: n }, (_, i) => pet(i, c)).join('');
  const center = dot(cx, cy, 7 * k, mid);
  const outline = outlineOnly(petals, ow, lc) + `<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(7 * k)}" fill="none" stroke="${lc}" stroke-width="${ow}"/>`;
  const hi = Array.from({ length: n }, (_, i) => {
    const a = ang(i);
    return stroke([-30, -20, -8].map((d) => pol(cx, cy, R + W * 0.22, a + d)), { w: Math.max(2, 2.6 * k), color: P.white });
  }).join('') + dot(cx - 2.2 * k, cy - 2.2 * k, Math.max(1.4, 2 * k), P.white);
  return { petals, center, outline, hi };
}
const flowerAll = (cx, cy, k, c, o = {}) => { const f = flower(cx, cy, k, c, o); return f.petals + f.center + (o.noOutline ? '' : f.outline) + f.hi; };

// ===================================================================================
// Figures
// ===================================================================================

// 1. Long hand and forearm: ARM (back of the left hand, fingers up) extended down to the elbow.
//    Frame 400 x 720; wrist at y about 388, forearm from y 400 to 720.
export const LONG = `M146 720C148 640 150 560 150 500${ARM.outline.slice(8)}C254 560 258 640 262 720`;
export const WRIST = 'M150 388C180 396 220 396 247 388';
function longHand(content = '', skin = 'medium', { wrist = false, palm = false } = {}) {
  const id = `lh${cid++}`;
  const fill = skinOf(skin);
  const knuckles = palm ? '' : ARM.knuckles.map(([x, y]) => `<path d="M${x - 7} ${y + 4}q7 -5 14 0" fill="none" stroke="${SOFTLINE}" stroke-width="1.4" stroke-linecap="round"/>`).join('');
  const creases = palm ? `<path d="M140 250C170 244 210 246 246 236M146 282C180 276 214 280 240 290M176 360C168 330 150 300 132 262" fill="none" stroke="${SOFTLINE}" stroke-width="1.6" stroke-linecap="round"/>` : '';
  const g = `<defs><clipPath id="${id}"><path d="${LONG}Z"/></clipPath></defs>`
    + `<path d="${LONG}Z" fill="${fill}"/>`
    + `<g clip-path="url(#${id})">${content}</g>`
    + `<path d="${LONG}" fill="none" stroke="${OUTLINE}" stroke-width="2.4" stroke-linejoin="round"/>`
    + knuckles + creases
    + (wrist ? `<path d="${WRIST}" fill="none" stroke="${SOFTLINE}" stroke-width="1.2" stroke-dasharray="4 5"/>` : '');
  // palm view = the back view mirrored (thumb on the other side)
  return palm ? `<g transform="translate(400 0) scale(-1 1)">${g}</g>` : g;
}

// 2. Upper body, front (BODY frame 400 x 300), closed and filled, with optional tank top.
export const TORSO = 'M160 40C158 80 160 110 168 130C130 140 80 150 50 175C30 192 22 240 20 300C19 340 18 400 18 440L382 440C382 400 381 340 380 300C378 240 370 192 350 175C320 150 270 140 232 130C240 110 242 80 240 40Z';
const BODY_EXT = 'M20 300C19 340 18 400 18 440M380 300C381 340 382 400 382 440';
const TOP = 'M84 440L88 300C92 268 96 250 110 236C140 252 170 258 200 258C230 258 260 252 290 236C304 250 308 268 312 300L316 440Z';
const STRAPS = 'M110 236L122 142L138 138L128 246ZM290 236L278 142L262 138L272 246Z';
const ARMLINES = 'M74 440C74 380 75 330 76 300C78 272 82 248 90 230M326 440C326 380 325 330 324 300C322 272 318 248 310 230';
export const BACKLINES = 'M200 120V440M120 205C136 196 156 200 166 214C160 240 150 262 132 270M280 205C264 196 244 200 234 214C240 240 250 262 268 270';
function upperBody(content = '', skin = 'medium', { top = false, topColor = '#8fa3b8', center = false, back = false, over = '' } = {}) {
  const fill = skinOf(skin);
  return `<path d="${TORSO}" fill="${fill}"/>`
    + clipTo(TORSO, content)
    + `<path d="${BODY.outline}${BODY_EXT}" fill="none" stroke="${OUTLINE}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`
    + `<path d="${ARMLINES}" fill="none" stroke="${SOFTLINE}" stroke-width="1.6" stroke-linecap="round"/>`
    + (back ? `<path d="${BACKLINES}" fill="none" stroke="${SOFTLINE}" stroke-width="1.5" stroke-linecap="round"/>`
      : `<path d="${BODY.collarbones}" fill="none" stroke="${SOFTLINE}" stroke-width="1.8" stroke-linecap="round"/>`)
    + (center ? `<path d="M200 135V440" stroke="#9aa3ad" stroke-width="1.4" stroke-dasharray="5 5"/>` : '')
    + (top ? `<path d="${TOP}" fill="${topColor}" stroke="${shade(topColor, 0.35)}" stroke-width="1.6"/><path d="${STRAPS}" fill="${topColor}" stroke="${shade(topColor, 0.35)}" stroke-width="1.6" stroke-linejoin="round"/>` : '')
    + over;
}

// 3. Shoulder and whole arm, front view (frame 400 x 800). The person's right arm hangs on the
//    viewer's left; the body center line is x = 330.
export const AF = {
  torsoSkin: 'M262 0C262 40 260 80 254 108C210 122 150 132 118 150C88 166 74 196 72 230L150 300C200 318 260 328 420 318L420 0Z',
  torsoLine: 'M262 0C262 40 260 80 254 108C210 122 150 132 118 150C88 166 74 196 72 230',
  neckR: 'M398 0C398 40 400 80 406 108',
  arm: 'M118 150C88 166 74 196 72 230C66 290 64 350 66 400C68 480 76 560 86 636C84 676 86 716 96 750C102 768 120 772 126 754C130 736 132 718 134 704C140 710 148 708 150 698C152 686 146 668 134 650L130 636C136 560 144 480 140 400C138 360 144 320 150 300Z',
  armOuter: 'M72 230C66 290 64 350 66 400C68 480 76 560 86 636C84 676 86 716 96 750C102 768 120 772 126 754C130 736 132 718 134 704C140 710 148 708 150 698C152 686 146 668 134 650L130 636C136 560 144 480 140 400C138 360 144 320 150 300',
  top: 'M150 300C200 318 260 328 420 318L420 800L160 800C158 600 156 420 150 300Z',
  collar: 'M136 170C190 160 252 168 322 192',
  elbow: [104, 400], wrist: [108, 636], shoulder: [100, 205], notch: [330, 194],
};
function armFig(content = '', skin = 'medium', { top = true, topColor = '#8fa3b8', center = false, over = '' } = {}) {
  const fill = skinOf(skin);
  return `<path d="${AF.torsoSkin}" fill="${fill}"/>`
    + (top ? `<path d="${AF.top}" fill="${topColor}" stroke="${shade(topColor, 0.35)}" stroke-width="1.8"/>` : `<path d="${AF.top}" fill="${fill}"/>`)
    + `<path d="${AF.arm}" fill="${fill}"/>`
    + clipTo([AF.arm, AF.torsoSkin], content)
    + `<path d="${AF.torsoLine}" fill="none" stroke="${OUTLINE}" stroke-width="2.4" stroke-linecap="round"/>`
    + `<path d="${AF.neckR}" fill="none" stroke="${OUTLINE}" stroke-width="2.4" stroke-linecap="round"/>`
    + `<path d="${AF.armOuter}" fill="none" stroke="${OUTLINE}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`
    + `<path d="${AF.collar}" fill="none" stroke="${SOFTLINE}" stroke-width="1.8" stroke-linecap="round"/>`
    + `<path d="M92 404q12 6 26 2" fill="none" stroke="${SOFTLINE}" stroke-width="1.4" stroke-linecap="round"/>`
    + (center ? `<path d="M330 150V330" stroke="#9aa3ad" stroke-width="1.4" stroke-dasharray="5 5"/>` : '')
    + over;
}

export { longHand, upperBody, armFig };


// ===================================================================================
// Designs (shared by lessons, project and printables)
// ===================================================================================

// A. Vine bracelet on the long hand: a leafy vine around the wrist, a flower on the back of the
//    hand, and a vine that spirals down the forearm (it leaves one edge and comes back on the other).
const VB = {
  bracelet: [[136, 398], [170, 409], [200, 412], [230, 409], [264, 398]],
  hand: [[198, 410], [210, 384], [206, 356], [196, 334]],
  arm1: [[232, 410], [236, 440], [244, 472], [264, 502]],
  arm2: [[126, 530], [160, 550], [200, 584], [238, 620], [282, 650]],
  arm3: [[128, 668], [158, 686], [190, 708], [214, 724]],
  flower: [194, 298, 1.2],
};
const vbCurl = vinePts([[200, 584], [186, 608], [182, 626]], 10, -1);
export function vineBracelet(pal, stage = 9) {
  const { stem, leafC, vein, petal: pc, mid, dotC, hi = P.white, lineC = K } = pal;
  const o = [];
  const all = [VB.bracelet, VB.hand, VB.arm1, VB.arm2, VB.arm3];
  if (stage === 1) return all.map((p) => line(p, { w: 2.2, color: hi, opacity: 0.75 })).join('') + `<circle cx="${VB.flower[0]}" cy="${VB.flower[1]}" r="30" fill="none" stroke="${hi}" stroke-width="2" stroke-dasharray="4 4" opacity="0.75"/>` + line(vbCurl, { w: 2, color: hi, opacity: 0.75 });
  o.push(...all.map((p) => vine(p, 7, stem)), vine(vbCurl, 5, stem));
  if (stage >= 3) {
    o.push(vineLeaves(VB.bracelet, [0.1, 0.27, 0.73, 0.9], 28, 11, leafC, stage >= 5 ? vein : null));
    o.push(vineLeaves(VB.hand, [0.3, 0.62], 30, 12, leafC, stage >= 5 ? vein : null));
    o.push(vineLeaves(VB.arm1, [0.3, 0.72], 34, 13, leafC, stage >= 5 ? vein : null, true));
    o.push(vineLeaves(VB.arm2, [0.12, 0.3, 0.48, 0.66, 0.84], 36, 14, leafC, stage >= 5 ? vein : null));
    o.push(vineLeaves(VB.arm3, [0.35, 0.75], 34, 13, leafC, stage >= 5 ? vein : null));
  }
  if (stage >= 4) {
    const [fx, fy, fk] = VB.flower;
    const f = flower(fx, fy, fk, pc, { mid, line: lineC });
    o.push(f.petals, f.center, f.outline, stage >= 5 ? f.hi : '');
    const b = flower(200, 412, 0.42, pc, { mid, line: lineC, ow: 1.3 });
    o.push(b.petals, b.center, b.outline);
  }
  if (stage >= 5) {
    o.push(dots([[148, 424], [200, 430], [252, 424]], 9, 2.6, 2.6, dotC));
    o.push(dots([[240, 300], [248, 276], [244, 250]], 4, 4, 2, dotC), dots([[146, 320], [140, 344], [146, 366]], 4, 4, 2, dotC));
    o.push(dots([[214, 530], [232, 556], [250, 576]], 4, 3.6, 2, dotC), dots([[170, 640], [196, 660]], 3, 3.4, 2, dotC));
    o.push(dot(200, 412, 2, hi));
  }
  return o.join('');
}
const MONO = { stem: '#000', leafC: '#000', vein: null, petal: '#000', petal2: '#000', mid: '#000', dotC: '#000', chain: '#000', drop: '#000', wingA: '#000', wingB: '#000', pendant: '#000' };

// B. Collarbone necklace with shoulder wings on the upper body (one half, mirrored).
const NECK = [[116, 170], [140, 182], [168, 200], [200, 210]];
function necklaceHalf(pal, stage) {
  const { chain, drop, wingA, wingB, dotC } = pal;
  const o = [];
  if (stage === 1) {
    o.push(dot(116, 170, 3.5, P.white), dot(200, 210, 3.5, P.white), dot(58, 182, 3.5, P.white));
    o.push(line(NECK, { w: 1.6, color: P.white, dash: '3 5', opacity: 0.9 }));
    return o.join('');
  }
  o.push(line(NECK, { w: 3, color: chain }));
  o.push(dots(NECK, 8, 3.2, 3.2, chain));
  [[0.3, 10], [0.5, 14], [0.7, 18], [0.88, 22]].forEach(([t, len]) => { const { p } = along(NECK, t); o.push(teardrop(p[0], p[1] + len, -90, len, 7, drop)); });
  if (stage >= 4) {
    const root = [118, 176];
    [[150, 56, 14, wingB], [162, 70, 16, wingA], [175, 74, 16, wingB], [188, 66, 15, wingA], [200, 52, 13, wingB]].forEach(([deg, len, w, c]) => {
      const h = pol(root[0], root[1], len, deg);
      o.push(teardrop(h[0], h[1], deg + 180, len - 6, w, c, { curve: 0.15 }));
    });
  }
  if (stage >= 5) {
    [[162, 70], [175, 74], [188, 66]].forEach(([deg, len]) => { const h = pol(118, 176, len - 3, deg); o.push(stroke([h, pol(118, 176, len * 0.45, deg)], { w: 2.4, color: P.white })); });
    o.push(dots([[40, 240], [36, 262], [36, 282]], 3, 3.4, 2, dotC), dots([[126, 194], [150, 214], [174, 228]], 3, 2.6, 1.6, dotC));
  }
  return o.join('');
}
export function necklace(pal, stage = 5) {
  const o = [sym(necklaceHalf(pal, stage))];
  if (stage === 1) return o.join('') + dot(200, 238, 3.5, P.white) + line([[200, 140], [200, 250]], { w: 1.4, color: P.white, dash: '4 5', opacity: 0.8 });
  if (stage >= 3) {
    o.push(teardrop(200, 246, -90, 30, 24, pal.chain), teardrop(200, 245, -90, 26, 18, pal.pendant), dot(200, 212, 4.5, pal.chain));
    if (stage >= 5) o.push(shine(193, 244, -100, 10, 3), dot(200, 212, 1.8, P.white), dots([[200, 258], [200, 272]], 2, 3, 2, pal.dotC));
  }
  return o.join('');
}

// C. Arm-and-shoulder piece (P13) on armFig: flower on the shoulder cap, a vine along the collarbone,
//    a vine that spirals down the arm, and a leaf bracelet at the wrist.
const AS = {
  flower: [110, 222, 1.45],
  collar: vinePts([[154, 200], [190, 180], [240, 176], [292, 186]], 10, 1),
  arm1: [[112, 258], [98, 296], [96, 336], [112, 376], [138, 404], [160, 418]],
  arm2: [[50, 470], [80, 500], [108, 540], [130, 578], [156, 600]],
  bracelet: [[78, 620], [96, 630], [114, 634], [134, 628], [146, 622]],
  bud1: [96, 336, 0.55], bud2: [110, 545, 0.5],
};
export function armPiece(pal, stage = 5, { glowOn = true } = {}) {
  const { stem, leafC, vein, petal: pc, petal2, mid, dotC, lineC = K } = pal;
  const o = [];
  const paths = [AS.collar, AS.arm1, AS.arm2, AS.bracelet];
  if (stage === 1) return paths.map((p) => line(p, { w: 2.4, color: P.white, opacity: 0.8 })).join('') + `<circle cx="${AS.flower[0]}" cy="${AS.flower[1]}" r="40" fill="none" stroke="${P.white}" stroke-width="2.2" stroke-dasharray="4 4" opacity="0.8"/>`;
  const [fx, fy, fk] = AS.flower;
  const f = flower(fx, fy, fk, pc, { mid, line: lineC, rot: -70 });
  o.push(glowOn ? glow(fx, fy, 70, 66, pc, { opacity: 0.45 }) : '', f.petals, f.center);
  if (stage >= 3) {
    o.push(...paths.map((p) => vine(p, 7, stem)));
    o.push(vineLeaves(AS.collar, [0.1, 0.26, 0.42, 0.58], 30, 12, leafC, stage >= 5 ? vein : null, true));
    o.push(vineLeaves(AS.arm1, [0.16, 0.42, 0.62, 0.82], 32, 12, leafC, stage >= 5 ? vein : null));
    o.push(vineLeaves(AS.arm2, [0.2, 0.45, 0.7], 30, 12, leafC, stage >= 5 ? vein : null));
  }
  if (stage >= 4) {
    o.push(vineLeaves(AS.bracelet, [0.12, 0.3, 0.5, 0.7, 0.88], 20, 8, leafC, stage >= 5 ? vein : null));
    for (const [x, y, k] of [AS.bud1, AS.bud2]) { const b = flower(x, y, k, petal2, { mid, line: lineC, ow: 1.4 }); o.push(b.petals, b.center, stage >= 5 ? b.outline : ''); }
  }
  if (stage >= 5) {
    o.push(f.outline, f.hi);
    o.push(dots([[160, 240], [184, 222], [210, 210]], 4, 4, 2, dotC), dots([[74, 268], [70, 296], [72, 320]], 3, 3.6, 2, dotC));
    o.push(dots([[124, 440], [118, 460], [116, 480]], 3, 3.4, 2, dotC), dots([[82, 646], [110, 652], [136, 646]], 5, 2.4, 2.4, dotC));
    o.push(dot(AS.bud1[0] - 1, AS.bud1[1] - 1, 1.4, P.white), dot(AS.bud2[0] - 1, AS.bud2[1] - 1, 1.4, P.white));
  }
  return o.join('');
}

// Line art for the printables (shapes only; the sheets draw their outlines in light gray).
export const LINEART = {
  vine: vineBracelet(MONO, 4) + dots([[148, 424], [200, 430], [252, 424]], 9, 2.6, 2.6, '#000'),
  necklace: necklace(MONO, 4),
  armPiece: armPiece(MONO, 4, { glowOn: false }) + flower(...AS.flower, '#000', { rot: -70 }).outline,
};


// ===================================================================================
// Palettes and shared views
// ===================================================================================
const PAL = {
  deep: { stem: P.lime, leafC: '#3fc35a', vein: '#d8f59a', petal: P.pink, mid: P.yellow, dotC: P.white },
  tanPurple: { stem: '#138a72', leafC: P.teal, vein: '#b8f1e8', petal: P.violet, mid: P.yellow, dotC: P.white },
  fairBlue: { stem: '#1d7a4a', leafC: P.green, vein: P.lime, petal: P.blue, mid: P.yellow, dotC: P.white },
  neck: { chain: P.gold, drop: P.gold, wingA: P.teal, wingB: P.purple, pendant: P.teal, dotC: P.white },
  p13: { stem: '#1f8f4a', leafC: P.green, vein: P.lime, petal: P.purple, petal2: P.magenta, mid: P.yellow, dotC: P.white },
};
const HANDV = [40, 50, 320, 640];           // long hand: whole hand to mid forearm
const BODYV = [0, 30, 400, 270];            // upper body
const ARMV = [30, 0, 380, 800];             // shoulder and whole arm
const AMB = '#e8890c';

// Put any content in a box of a plain canvas.
const embed = (content, [vx, vy, vw, vh], x, y, w, h, { bg = '#fbf8f4', frame = true } = {}) =>
  (frame ? `<rect x="${x - 1}" y="${y - 1}" width="${w + 2}" height="${h + 2}" rx="8" fill="#fff" stroke="#e3ddd5"/>` : '')
  + `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${bg}"/>${content}</svg>`;

// ===================================================================================
// 10.1 From face to body
// ===================================================================================

// Same motifs, new flow line: face -> arm -> shoulder (tan skin, purple flowers, teal leaves)
const tp = PAL.tanPurple;
const faceVine = [[124, 268], [106, 246], [100, 222], [106, 204]];
const faceDesign = glow(130, 294, 46, 42, P.violet, { opacity: 0.45 })
  + vine(faceVine, 3.6, tp.stem) + vineLeaves(faceVine, [0.3, 0.68], 20, 8, tp.leafC, tp.vein)
  + flowerAll(128, 292, 0.9, tp.petal) + flowerAll(110, 192, 0.42, tp.petal, { ow: 1.3 })
  + dots([[152, 328], [160, 342], [164, 356]], 3, 3, 1.8, P.white);
const shVine = vinePts([[92, 182], [124, 172], [154, 176], [178, 190]], 8, 1);
const shArm = [[52, 220], [44, 254], [42, 290]];
const shoulderDesign = glow(66, 198, 50, 46, P.violet, { opacity: 0.45 })
  + vine(shVine, 5, tp.stem) + vineLeaves(shVine, [0.15, 0.35, 0.55], 24, 10, tp.leafC, tp.vein, true)
  + vine(shArm, 5, tp.stem) + vineLeaves(shArm, [0.35, 0.75], 24, 10, tp.leafC, tp.vein)
  + flowerAll(68, 196, 1.0, tp.petal) + dots([[96, 214], [112, 228], [124, 240]], 3, 3.4, 2, P.white);
strip('m10-l01-replan', 'One design re-planned from the face to the body, on tan skin. Face: a purple flower on the cheek with a teal vine curling up past the eye to a small flower at the temple. Arm: the same flower on the back of the hand, the vine turned into a bracelet around the wrist and a vine that spirals down the forearm. Shoulder: the same flower on the shoulder cap, with the vine following the collarbone and a short vine down the upper arm.', [
  { content: faceLayer({ under: faceDesign, skin: 'tan' }), view: [40, 40, 320, 460], label: '1', caption: 'Face: flower + vine' },
  { content: longHand(vineBracelet(tp), 'tan'), view: [30, 50, 340, 660], label: '2', caption: 'Arm: wraps the wrist' },
  { content: upperBody(shoulderDesign, 'tan'), view: [0, 40, 260, 373], label: '3', caption: 'Shoulder: along the bone' },
], { pw: 230, gap: 40 });

// Scale up: face tools and sizes vs body tools and sizes
{
  const col = (x, title, sub, k, brushes, sponge) => {
    const o = [label(x + 170, 34, title, { size: 20, bold: true })];
    o.push(brushes);
    o.push(sponge);
    const fx = x + 270, fy = 160;
    o.push(leaf(fx - 10 * k, fy + 20 * k, 150, 34 * k, 13 * k, P.teal, { vein: '#b8f1e8' }), leaf(fx + 14 * k, fy + 22 * k, 40, 30 * k, 12 * k, P.teal, { vein: '#b8f1e8' }));
    o.push(flowerAll(fx, fy, k, P.violet, { ow: 1.4 + 0.4 * k }));
    o.push(label(x + 170, 316, sub, { size: 14, color: SOFT, halo: false }));
    return o.join('');
  };
  const spongeShape = (x, y, w, h, half = false) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${half ? 6 : h / 2.4}" fill="#f6d6a8" stroke="#c9a46e" stroke-width="2"/>` + `<g fill="#d9b27a">${[0.2, 0.45, 0.7, 0.35, 0.6, 0.85].map((u, i) => `<circle cx="${n1(x + w * u)}" cy="${n1(y + h * (i < 3 ? 0.35 : 0.68))}" r="2"/>`).join('')}</g>`;
  const face = col(10, 'Face', 'Small round brush · half sponge', 0.7,
    brush(70, 250, 90, 130, { color: '#c0392b', size: 0.75 }), spongeShape(104, 214, 46, 34, true));
  const body = col(390, 'Body', 'Bigger round or flat brush · whole sponge', 1.45,
    brush(430, 270, 90, 180, { color: '#2f6fe0', size: 1.25 }) + brush(470, 270, 90, 180, { color: '#2f6fe0', size: 1.25, tip: 'flat' }), spongeShape(500, 214, 84, 56));
  plain('m10-l01-scale', 'Scale up for the body. Face: a small round brush, half a sponge and a flower about the size of a coin. Body: a bigger round or flat brush, a whole sponge, and the same flower and leaves about twice as big, so they read on a bigger area.', 760, 340,
    `<rect x="10" y="10" width="360" height="320" rx="10" fill="#fff" stroke="#e3ddd5"/><rect x="390" y="10" width="360" height="320" rx="10" fill="#fff" stroke="#e3ddd5"/>` + face + body
    + arrow([[352, 170], [410, 170]], { color: '#c2b8ab', width: 3 }));
}

// Follow the arm vs fight it vs too small (fair skin)
{
  const fb = PAL.fairBlue;
  const stiff = [0, 1, 2].map((i) => `<rect x="162" y="${470 + i * 40}" width="76" height="14" rx="2" fill="${P.blue}"/>`).join('')
    + `<rect x="166" y="262" width="64" height="64" fill="none" stroke="${P.blue}" stroke-width="8"/>` + dot(198, 294, 8, P.yellow);
  const tiny = flowerAll(200, 560, 0.32, P.blue, { ow: 1 }) + leaf(194, 566, 150, 10, 4, P.green) + dots([[214, 552], [218, 546]], 2, 1.4, 1, P.white);
  strip('m10-l01-flow', 'Good and avoid on the arm, on fair skin. Good: a blue flower on the back of the hand and a leafy vine that spirals around the wrist and down the forearm, following the arm. Avoid: straight blue bars across the forearm and a square on the hand, which fight the round shape of the arm. Avoid: a face-sized tiny flower in the middle of the forearm, which is lost on the big area.', [
    good({ content: longHand(vineBracelet(fb), 'fair'), view: HANDV, label: 'Good', caption: 'Follows the arm' }),
    bad({ content: longHand(stiff, 'fair'), view: HANDV, label: 'Avoid', caption: 'Fights the arm' }),
    bad({ content: longHand(tiny, 'fair'), view: HANDV, label: 'Avoid', caption: 'Too small to read' }),
  ], { pw: 210, gap: 40, arrows: false });
}

// Body zones: easy places and places that need care (light skin)
{
  const zone = (cx, cy, rx, ry, c) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}" opacity="0.22" stroke="${c}" stroke-width="2" stroke-dasharray="5 4"/>`;
  const zones = zone(100, 212, 40, 44, OK) + zone(86, 320, 22, 50, OK) + zone(228, 182, 70, 18, OK) + zone(98, 540, 22, 64, OK)
    + zone(126, 404, 14, 18, AMB) + zone(148, 290, 14, 18, AMB) + zone(116, 722, 22, 36, AMB);
  const tag = (x, y, n, c, text, tx, ty) => line([[x + 12, y], [tx - 6, ty - 5]], { w: 1.2, color: '#7b8794' }) + badge(x, y, n, { color: c, r: 12 }) + label(tx, ty, text, { size: 16, anchor: 'start', color: INK });
  const tags = tag(100, 212, '1', OK, 'shoulder cap', 196, 236) + tag(148, 286, '6', AMB, 'armpit: sweat', 196, 282)
    + tag(86, 330, '2', OK, 'outer upper arm', 196, 330)
    + tag(250, 172, '3', OK, 'collarbone', 270, 152) + tag(330, 323, '8', AMB, 'edge of clothes: rubs', 250, 378)
    + tag(126, 404, '5', AMB, 'inside of elbow: bends', 196, 430) + tag(98, 540, '4', OK, 'outer forearm', 196, 540)
    + tag(116, 722, '7', AMB, 'palm, fingers: rub off', 196, 722);
  const fig = armFig(zones, 'light', { over: tags });
  plain('m10-l01-zones', 'Body map on light skin. Green, easy places: 1 the shoulder cap, 2 the outer upper arm, 3 the collarbone, 4 the outer forearm and back of the hand. Orange, places that need care: 5 the inside of the elbow, which bends and cracks paint, 6 the armpit, which sweats, 7 the palm and the inner sides of the fingers, which rub off, 8 the edge of clothing, which rubs and can stain.', 456, 760,
    embed(fig, [30, 100, 440, 720], 8, 8, 440, 744, { frame: false }));
}

// ===================================================================================
// 10.2 Hands and arms
// ===================================================================================

// Step strip: vine bracelet on deep skin
strip('m10-l02-steps', 'A vine bracelet on the back of the hand and forearm, on deep skin, in five steps. 1: thin light lead lines: a curve around the wrist, a line up to a circle on the back of the hand, and a vine that spirals down the forearm, leaving one edge and coming back on the other. 2: lime green vine stems over the lines. 3: green leaves along the vines, on alternate sides. 4: a pink five-petal flower on the back of the hand and a small one on the wrist, with thin black outlines. Done: light veins in the leaves, white highlights on the petals, and white dot trails along the bracelet and the vines.', [
  { content: longHand(vineBracelet(PAL.deep, 1), 'deep'), view: HANDV, label: '1', caption: 'Lead lines' },
  { content: longHand(vineBracelet(PAL.deep, 2), 'deep'), view: HANDV, label: '2', caption: 'Vines' },
  { content: longHand(vineBracelet(PAL.deep, 3), 'deep'), view: HANDV, label: '3', caption: 'Leaves' },
  { content: longHand(vineBracelet(PAL.deep, 4), 'deep'), view: HANDV, label: '4', caption: 'Flowers' },
  { content: longHand(vineBracelet(PAL.deep, 5), 'deep'), view: HANDV, label: 'Done', caption: 'Veins, dots' },
], { pw: 160, gap: 30 });

// Wraps around: a vine on a forearm tube, painted in three turns of the arm (tan skin)
{
  const skin = SKIN.tan, X0 = 80, X1 = 520, CY = 110;
  const r = (x) => 28 + ((x - X0) / (X1 - X0)) * 16;
  const a0 = (s) => -40 + s * 1.5 * 360;
  const xs = (s) => 104 + s * 396;
  const vis = (a) => Math.cos((a * Math.PI) / 180);
  const gid = `tb${cid++}`;
  const grad = `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(skin, 0.22)}"/><stop offset="0.3" stop-color="${skin}"/><stop offset="0.62" stop-color="${skin}"/><stop offset="1" stop-color="${shade(skin, 0.28)}"/></linearGradient></defs>`;
  const top = [], bot = [];
  for (let i = 0; i <= 20; i++) { const x = X0 + (i / 20) * (X1 - X0); top.push([x, CY - r(x)]); bot.push([x, CY + r(x)]); }
  const tubeD = polyD([...top, ...bot.reverse()], true);
  const hands = {
    0: { d: 'M86 84C60 80 34 82 16 90C6 96 4 124 16 130C34 138 60 140 86 136Z', thumb: 'M72 134C60 148 42 154 34 150C28 144 40 136 54 130', lines: 'M24 100H60M24 112H62M24 122H60' },
    120: { d: 'M86 90C60 92 34 96 18 102C8 106 8 120 18 122C34 126 60 128 86 130Z', thumb: 'M74 92C64 78 50 70 44 74C40 80 50 90 62 96', lines: 'M24 112H62' },
    240: { d: 'M86 84C60 80 34 82 16 90C6 96 4 124 16 130C34 138 60 140 86 136Z', thumb: 'M72 86C60 72 42 66 34 70C28 76 40 84 54 90', lines: 'M40 104C52 112 66 114 78 108M36 122C50 124 64 122 76 118' },
  };
  const tube = (R, painted, { leaves = true, arrowOn = false } = {}) => {
    const h = hands[R];
    const o = [grad];
    o.push(`<path d="${h.thumb}" fill="${skin}" stroke="${OUTLINE}" stroke-width="2.2"/>`);
    o.push(`<path d="${h.d}" fill="url(#${gid})" stroke="${OUTLINE}" stroke-width="2.4"/>`, `<path d="${h.lines}" stroke="${SOFTLINE}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`);
    if (R === 240) o.push(`<path d="${h.thumb}" fill="${skin}" stroke="${OUTLINE}" stroke-width="2.2"/>`);
    o.push(`<path d="${tubeD}" fill="url(#${gid})" stroke="${OUTLINE}" stroke-width="2.4"/>`);
    o.push(`<ellipse cx="${X1}" cy="${CY}" rx="9" ry="${r(X1)}" fill="${shade(skin, 0.12)}" stroke="${OUTLINE}" stroke-width="2"/>`);
    // vine
    const N = 360, runs = [];
    let cur = null;
    for (let i = 0; i <= N; i++) {
      const s = i / N, x = xs(s), a = a0(s);
      const isP = painted.some((Rj) => vis(a + Rj) > 0.15);
      const v = vis(a + R) > 0;
      const state = !isP ? null : v ? 'front' : 'back';
      const pt = [x, CY + r(x) * Math.sin(((a + R) * Math.PI) / 180) * 0.92];
      if (!cur || cur.state !== state) { if (cur && cur.state) runs.push(cur); cur = { state, pts: cur ? [cur.pts[cur.pts.length - 1], pt] : [pt] }; } else cur.pts.push(pt);
    }
    if (cur && cur.state) runs.push(cur);
    for (const run of runs.filter((q) => q.state === 'back')) o.push(`<path d="${polyD(run.pts)}" fill="none" stroke="${shade(skin, 0.45)}" stroke-width="2" stroke-dasharray="5 5" stroke-linecap="round"/>`);
    for (const run of runs.filter((q) => q.state === 'front')) o.push(`<path d="${polyD(run.pts)}" fill="none" stroke="#138a72" stroke-width="5.5" stroke-linecap="round"/>`);
    if (leaves) for (let k = 0; k < 14; k++) {
      const s = 0.03 + k * 0.07, x = xs(s), a = a0(s), c = vis(a + R);
      if (c < 0.2 || !painted.some((Rj) => vis(a + Rj) > 0.15)) continue;
      const y = CY + r(x) * Math.sin(((a + R) * Math.PI) / 180) * 0.92;
      const s2 = s + 0.004, y2 = CY + r(xs(s2)) * Math.sin(((a0(s2) + R) * Math.PI) / 180) * 0.92;
      const deg = Math.atan2(y2 - y, xs(s2) - x) * 180 / Math.PI;
      o.push(leaf(x, y, deg + (k % 2 ? 55 : -55), 22, 9 * Math.max(0.45, c), P.teal, { curve: k % 2 ? 0.1 : -0.1 }));
    }
    if (arrowOn) o.push(arrow([[X1 + 18, CY + r(X1) + 4], [X1 + 34, CY], [X1 + 18, CY - r(X1) - 6]], { color: ACCENT, width: 2.6 }));
    return o.join('');
  };
  const V = [-4, 40, 576, 140];
  strip('m10-l02-wrap', 'Painting a vine that wraps all the way around the forearm, by turning the arm, on tan skin. 1: palm down, paint the part of the vine you can see on top. 2: turn the arm thumb up and continue the vine on the side; the part painted first has moved round and shows as a dashed line behind. 3: turn the arm palm up and finish the vine on the inner side. Done: turn back to palm down; the vine runs all the way round, solid in front and dashed where it goes behind.', [
    { content: tube(0, [0]), view: V, label: '1', caption: 'Palm down: paint the top' },
    { content: tube(120, [0, 120], { arrowOn: true }), view: V, label: '2', caption: 'Thumb up: turn, paint on' },
    { content: tube(240, [0, 120, 240], { arrowOn: true }), view: V, label: '3', caption: 'Palm up: finish the inside' },
    { content: tube(0, [0, 120, 240]), view: V, label: 'Done', caption: 'It goes all the way round' },
  ], { cols: 2, pw: 360, gap: 44 });
}

// Three bracelet ideas at the wrist (medium skin)
{
  const WV = [100, 300, 200, 200];
  const wr = [[136, 396], [170, 408], [200, 411], [230, 408], [264, 396]];
  const leafy = vine(wr, 6, '#1d7a4a') + vineLeaves(wr, [0.08, 0.22, 0.36, 0.5, 0.64, 0.78, 0.92], 24, 9, P.green, P.lime) + dots([[146, 430], [200, 438], [254, 430]], 9, 2.6, 2.6, P.yellow);
  const dropRow = [0.1, 0.24, 0.38, 0.62, 0.76, 0.9].map((t) => { const { p } = along(wr, t); return teardrop(p[0], p[1] - 4, 90, 22, 11, P.white); }).join('')
    + dots(wr.map(([x, y]) => [x, y - 14]), 11, 3, 3, P.sky) + teardrop(200, 404, 90, 30, 16, P.pink) + dot(200, 404, 3, P.white)
    + dots([[150, 440], [200, 448], [250, 440]], 7, 2.6, 2.6, P.white);
  const bandTop = [[130, 372], [200, 384], [270, 372]], bandBot = [[130, 430], [200, 442], [270, 430]];
  const band = polyD([...spline(bandTop, 12), ...spline(bandBot, 12).reverse()], true);
  const cuff = sponge(band, [P.purple, P.magenta, P.orange], { deg: 0, soft: 2 })
    + [150, 200, 250].map((x, i) => stroke(curlPts(x, 410, 14, { turns: 1.1, startDeg: 200, dir: i % 2 ? -1 : 1, lead: 10 }), { w: 5, color: K, kind: 'end' })).join('')
    + line(bandTop, { w: 2.4, color: K }) + line(bandBot, { w: 2.4, color: K }) + dots([[140, 452], [200, 464], [260, 452]], 9, 2.4, 2.4, P.white)
    + [175, 225].map((x) => dot(x, 398, 3, P.white)).join('');
  strip('m10-l02-bracelets', 'Three bracelets around the wrist, on medium skin. 1: a leaf bracelet: a green vine across the wrist with leaves on both sides and a row of yellow dots. 2: a drop bracelet: white teardrops hanging from a line of light blue dots, a pink center drop and white dots. 3: a swirl cuff: a sponged band of purple, magenta and orange with black edges, black curls and white dots.', [
    { content: longHand(leafy, 'medium', { wrist: false }), view: WV, label: '1', caption: 'Leaf bracelet' },
    { content: longHand(dropRow, 'medium'), view: WV, label: '2', caption: 'Drop bracelet' },
    { content: longHand(cuff, 'medium'), view: WV, label: '3', caption: 'Swirl cuff' },
  ], { pw: 210, gap: 40, arrows: false });
}

// Mistakes on the hand (brown skin)
{
  const smear = (cx, cy) => `<defs><filter id="sm${cid}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter></defs><path d="M${cx - 30} ${cy - 10}C${cx} ${cy - 30} ${cx + 40} ${cy + 10} ${cx + 30} ${cy + 50}C${cx} ${cy + 40} ${cx - 30} ${cy + 20} ${cx - 30} ${cy - 10}Z" fill="${P.pink}" opacity="0.55" filter="url(#sm${cid++})"/>`;
  const palmDesign = op(0.7, flowerAll(196, 300, 1.0, P.pink)) + smear(200, 300) + op(0.5, leaf(170, 330, 140, 26, 10, P.green) + leaf(222, 334, 40, 26, 10, P.green));
  const cracks = (() => {
    const bt = [[148, 372], [200, 382], [250, 372]], bb = [[148, 410], [200, 420], [250, 410]];
    const band = polyD([...spline(bt, 12), ...spline(bb, 12).reverse()], true);
    let c = `<path d="${band}" fill="${P.blue}"/>`;
    const rnd = rng(5);
    for (let i = 0; i < 9; i++) { const x = 156 + i * 11 + rnd() * 4; c += `<path d="M${n1(x)} ${n1(378 + rnd() * 4)}l${n1(rnd() * 6 - 3)} 10l${n1(rnd() * 6 - 3)} 9l${n1(rnd() * 6 - 3)} 10" fill="none" stroke="${SKIN.brown}" stroke-width="2.2" stroke-linecap="round"/>`; }
    return c + `<path d="${WRIST}" fill="none" stroke="${shade(SKIN.brown, 0.4)}" stroke-width="2"/>`;
  })();
  const goodHand = vineBracelet({ ...PAL.fairBlue, petal: P.pink, leafC: P.green }, 5);
  strip('m10-l02-mistakes', 'Two mistakes and the fix, on brown skin. Avoid: a flower painted on the palm, smeared and half rubbed off, because the palm touches everything. Avoid: a thick blue band painted wet over the wrist bend, cracked where the wrist bends. Good: thin layers on the back of the hand and forearm, which stay neat.', [
    bad({ content: longHand(palmDesign, 'brown', { palm: true }), view: HANDV, label: 'Avoid', caption: 'Palm: rubs off' }),
    bad({ content: longHand(cracks, 'brown'), view: HANDV, label: 'Avoid', caption: 'Thick at a bend: cracks' }),
    good({ content: longHand(goodHand, 'brown'), view: HANDV, label: 'Good', caption: 'Back of hand, thin layers' }),
  ], { pw: 210, gap: 40, arrows: false });
}

// ===================================================================================
// 10.3 Shoulders and upper body
// ===================================================================================

// Placement map (fair skin)
{
  const guides = `<path d="${BODY.collarbones}" fill="none" stroke="${ACCENT}" stroke-width="3" stroke-dasharray="6 5" stroke-linecap="round"/>`
    + `<ellipse cx="60" cy="196" rx="34" ry="30" fill="${OK}" opacity="0.18" stroke="${OK}" stroke-width="2" stroke-dasharray="5 4"/>`
    + `<ellipse cx="340" cy="196" rx="34" ry="30" fill="${OK}" opacity="0.18" stroke="${OK}" stroke-width="2" stroke-dasharray="5 4"/>`
    + dot(200, 186, 5, ACCENT)
    + `<path d="M96 246C140 262 170 266 200 266C230 266 260 262 304 246" fill="none" stroke="#7b8794" stroke-width="2.2" stroke-dasharray="3 5"/>`;
  const tags = badge(200, 142, '1', { r: 12 }) + label(214, 147, 'center line', { size: 15, anchor: 'start' })
    + badge(150, 156, '2', { r: 12 }) + label(150, 136, 'collarbones', { size: 15 })
    + badge(222, 194, '3', { r: 12 }) + label(236, 199, 'notch', { size: 15, anchor: 'start' })
    + badge(60, 196, '4', { r: 12, color: OK }) + label(60, 240, 'shoulder cap', { size: 15 })
    + badge(300, 262, '5', { r: 12, color: '#5c6670' }) + label(296, 290, 'neckline', { size: 15, anchor: 'end' });
  plain('m10-l03-placement', 'Placement guides on the upper body, on fair skin. 1: the center line runs down from the middle of the neck. 2: the collarbones, marked with a dashed line. 3: the notch between the collarbones, on the center line. 4: the shoulder caps, the round top of each shoulder, shaded green. 5: the neckline, a dotted line where clothes usually start.', 520, 360,
    embed(upperBody(guides, 'fair', { center: true, over: tags }), [0, 30, 400, 270], 10, 10, 500, 340, { frame: false }));
}

// Step strip: collarbone necklace with shoulder wings (brown skin)
strip('m10-l03-steps', 'A collarbone necklace with shoulder wings, on brown skin, in five steps. 1: white guide dots at both ends of the collarbones, on the center line and on the shoulder caps, and a dotted curve between them. 2: a gold chain of dots along the curve with gold drops hanging from it, longer toward the center. 3: a teal teardrop pendant with a gold rim on the center line. 4: wings of teal and purple feathers fanning out from the chain over each shoulder cap. Done: white lines on the feathers, white highlight on the pendant and white dot trails.', [
  { content: upperBody(necklace(PAL.neck, 1), 'brown'), view: BODYV, label: '1', caption: 'Guide dots' },
  { content: upperBody(necklace(PAL.neck, 2), 'brown'), view: BODYV, label: '2', caption: 'Chain and drops' },
  { content: upperBody(necklace(PAL.neck, 3), 'brown'), view: BODYV, label: '3', caption: 'Pendant' },
  { content: upperBody(necklace(PAL.neck, 4), 'brown'), view: BODYV, label: '4', caption: 'Shoulder wings' },
  { content: upperBody(necklace(PAL.neck, 5), 'brown'), view: BODYV, label: 'Done', caption: 'Highlights, dots' },
], { pw: 200, gap: 34 });

// What you can reach yourself (light skin)
{
  const zone = (d, c) => `<path d="${d}" fill="${c}" opacity="0.22" stroke="${c}" stroke-width="2" stroke-dasharray="5 4"/>`;
  const front = zone('M50 175C80 152 140 140 168 134C176 160 190 176 200 182C210 176 224 160 232 134C260 140 320 152 350 175C362 200 368 226 370 250L230 262H170L30 250C32 226 38 200 50 175Z', OK)
    + arrow([[44, 290], [120, 268], [250, 230], [320, 190]], { color: ACCENT, width: 3 });
  const back = zone('M40 190C60 160 120 146 166 136C170 180 180 220 190 280H40Z', AMB) + zone('M360 190C340 160 280 146 234 136C230 180 220 220 210 280H360Z', AMB);
  strip('m10-l03-reach', 'What you can paint on yourself, on light skin. Front: the collarbones, the upper chest and the front of both shoulders, shaded green, are easy to reach in a mirror; reach across the body with your painting hand to the opposite shoulder. Back: the back of the shoulders and the shoulder blades, shaded orange, need a willing helper, or skip them.', [
    good({ content: upperBody(front, 'light'), view: BODYV, label: 'Front: you, in a mirror', caption: 'Reach across to the other shoulder' }),
    { content: upperBody(back, 'light', { back: true }), view: BODYV, label: 'Back: helper or skip', labelColor: AMB, caption: 'Optional, with a willing helper' },
  ], { pw: 320, gap: 40, arrows: false });
}

// Clothing contact (medium skin, tank top)
{
  const under = sym(`<path d="M116 150C112 180 108 210 108 236" stroke="${P.magenta}" stroke-width="10" fill="none" stroke-linecap="round"/>` + teardrop(122, 196, 160, 26, 12, P.magenta) + teardrop(100, 214, 20, 24, 11, P.magenta));
  const strapStain = `<path d="M118 150L124 150L118 236L112 236Z" fill="${P.magenta}" opacity="0.55"/><path d="M282 150L276 150L282 236L288 236Z" fill="${P.magenta}" opacity="0.55"/>`;
  const wetEdge = necklace(PAL.neck, 3).replace(/<\/?g[^>]*>/g, (m) => m) + `<path d="M140 256C170 262 200 262 230 258L230 270C200 272 170 272 140 266Z" fill="${P.gold}" opacity="0.5"/>`;
  const lowDesign = sym(teardrop(150, 240, 60, 26, 14, P.gold) + teardrop(170, 248, 80, 26, 14, P.teal)) + teardrop(200, 250, 90, 30, 16, P.teal);
  const stainTop = `<path d="M150 262C180 270 220 270 250 262L246 276C220 282 180 282 154 276Z" fill="${P.teal}" opacity="0.5"/>`;
  const wing = (rx, ry) => [[150, 46, 12, P.purple], [164, 56, 14, P.magenta], [178, 58, 14, P.purple], [192, 50, 12, P.magenta]].map(([deg, len, w, c]) => {
    const h = pol(rx, ry, len, deg); return teardrop(h[0], h[1], deg + 180, len - 6, w, c, { curve: 0.15 }) + stroke([pol(rx, ry, len - 4, deg), pol(rx, ry, len * 0.5, deg)], { w: 2, color: P.white });
  }).join('');
  const goodD = `<g transform="translate(200 200) scale(0.62) translate(-200 -200)">${necklace({ ...PAL.neck, pendant: P.magenta }, 3)}</g>`
    + sym(wing(100, 182) + dots([[40, 236], [38, 256]], 2, 3, 2, P.white)) + dot(200, 215, 1.6, P.white);
  void wetEdge;
  strip('m10-l03-clothing', 'Clothes and body paint, on medium skin with a gray-blue tank top. Avoid: paint under a strap, which rubs off and stains the strap pink. Avoid: a design that runs into the neckline, so the edge of the top rubs it and gets stained. Good: a necklace with wings on the collarbones and shoulder caps, between the straps and above the neckline, left to dry before dressing.', [
    bad({ content: upperBody(under, 'medium', { top: true, over: strapStain }), view: BODYV, label: 'Avoid', caption: 'Under a strap' }),
    bad({ content: upperBody(lowDesign, 'medium', { top: true, over: stainTop }), view: BODYV, label: 'Avoid', caption: 'Into the neckline' }),
    good({ content: upperBody(goodD, 'medium', { top: true }), view: BODYV, label: 'Good', caption: 'Between straps, dry first' }),
  ], { pw: 250, gap: 40, arrows: false });
}

// ===================================================================================
// Project 13: arm-and-shoulder piece (tan skin)
// ===================================================================================
plain('p13-arm-shoulder', 'Project 13 finished, on tan skin: a big purple flower on the shoulder cap with a soft purple glow, a green vine with leaves along the collarbone that ends in a curl before the center line, a second vine that spirals down the upper arm and forearm, leaving one edge and coming back on the other, two small magenta flowers on the vine, a leaf bracelet at the wrist, thin black outlines, white highlights and white dot trails. A gray-blue top covers the chest.', 380, 640,
  embed(armFig(armPiece(PAL.p13, 5), 'tan'), [30, 90, 380, 610], 0, 0, 380, 640, { frame: false }));
strip('p13-arm-shoulder-steps', 'Project 13 in five steps, on tan skin. 1: thin white lead lines: a circle on the shoulder cap, a line along the collarbone, a vine down the arm and a curve around the wrist. 2: the purple flower on the shoulder cap over a soft purple glow. 3: green vines with leaves along the collarbone and down the arm. 4: the leaf bracelet at the wrist and two small magenta flowers on the arm vine. Done: thin black outlines on the flowers, light green veins, white highlights and white dot trails.', [
  { content: armFig(armPiece(PAL.p13, 1), 'tan'), view: [30, 90, 380, 610], label: '1', caption: 'Lead lines' },
  { content: armFig(armPiece(PAL.p13, 2), 'tan'), view: [30, 90, 380, 610], label: '2', caption: 'Shoulder flower' },
  { content: armFig(armPiece(PAL.p13, 3), 'tan'), view: [30, 90, 380, 610], label: '3', caption: 'Vines and leaves' },
  { content: armFig(armPiece(PAL.p13, 4), 'tan'), view: [30, 90, 380, 610], label: '4', caption: 'Bracelet, buds' },
  { content: armFig(armPiece(PAL.p13, 5), 'tan'), view: [30, 90, 380, 610], label: 'Done', caption: 'Outlines, dots' },
], { pw: 170, gap: 34 });

console.log('m10 diagrams written');
