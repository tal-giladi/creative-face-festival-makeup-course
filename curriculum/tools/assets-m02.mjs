// Module 2 diagrams (Brush Control). Run: node curriculum/tools/assets-m02.mjs
import { plain, strip, paperPanel } from './lib/figure.mjs';
import { P, SOFT, OK, BAD, ACCENT, label, arrow, badge, tick, cross, line, stroke, teardrop, petal, dot, dots, spiral, brush, cake, pol, rng, spline } from './lib/art.mjs';
import { SKIN, ARM, L, faceSVG, headClip } from './lib/face.mjs';

const OUTLINE = '#5b4636';

// ---------- local helpers (not in the shared lib) ----------

// Paint loaded on the front part of a round brush tip drawn with brush(x, y, deg, len, { size }).
function loadedTip(x, y, deg, color, frac = 0.55, size = 1) {
  const hl = 26 * size, w = 6 * size;
  const p = (r) => pol(x, y, r, deg + 180);
  const side = (r, k) => pol(...p(r), k, deg + 90);
  const pts = [p(0), side(hl * 0.45, w * 1.02), side(hl * frac, w * 0.98), side(hl * frac, -w * 0.98), side(hl * 0.45, -w * 1.02)];
  return `<path d="M${pts.map((q) => q.map((v) => v.toFixed(1)).join(' ')).join('L')}Z" fill="${color}"/>`;
}

// Pressure arrow above a point: small = light touch, big = press, up = lift.
const pressArrow = (x, y, kind) => {
  if (kind === 'up') return arrow([[x, y], [x, y - 30]], { color: ACCENT, width: 3 });
  const len = kind === 'press' ? 34 : 16, w = kind === 'press' ? 4.5 : 2.5;
  return arrow([[x, y - len], [x, y]], { color: ACCENT, width: w, head: kind === 'press' ? 12 : 8 });
};

// Dashed direction arrow, optionally with a numbered start badge.
const guide = (pts, n = '1', { color = ACCENT } = {}) => arrow(pts, { color, width: 2, dash: '5 5', head: 9 })
  + (n ? badge(pts[0][0], pts[0][1], n, { r: 10, color }) : '');

// Clip content to x <= x0 (a stroke painted "so far").
let kid = 0;
const upto = (x0, content) => { const id = `up${kid++}`; return `<defs><clipPath id="${id}"><rect x="-500" y="-500" width="${500 + x0}" height="1500"/></clipPath></defs><g clip-path="url(#${id})">${content}</g>`; };
const bad = (p) => ({ ...p, labelColor: BAD });
const good = (p) => ({ ...p, labelColor: OK });

// Cartoon finger: outline plus skin fill along a path.
const finger = (pts, w, skin) => line(pts, { w: w + 4, color: OUTLINE }) + line(pts, { w, color: skin });

// Wobbly version of a path (shaky line).
function wobble(pts, amp = 3, seed = 4) {
  const r = rng(seed), c = spline(pts, 14);
  return c.map(([x, y], i) => [x + (i % 2 ? 1 : -1) * r() * amp * 0.3, y + (r() - 0.5) * 2 * amp]);
}

// Back of the hand (ARM frame) filled with skin; content clipped to the hand.
let cid = 0;
function hand(content, skin = 'medium', { wrist = false } = {}) {
  const id = `hc${cid++}`;
  return `<defs><clipPath id="${id}"><path d="${ARM.outline}Z"/></clipPath></defs>`
    + `<path d="${ARM.outline}Z" fill="${SKIN[skin]}"/>`
    + `<g clip-path="url(#${id})">${content}</g>`
    + `<path d="${ARM.outline}" fill="none" stroke="${OUTLINE}" stroke-width="2.4" stroke-linejoin="round"/>`
    + ARM.knuckles.map(([x, y]) => `<path d="M${x - 7} ${y + 4}q7 -5 14 0" fill="none" stroke="#8a7462" stroke-width="1.4" stroke-linecap="round"/>`).join('')
    + (wrist ? `<path d="M150 385C180 392 220 392 246 385" fill="none" stroke="#8a7462" stroke-width="1.2" stroke-dasharray="4 5"/>` : '');
}

// Face with paint under the features.
let fid = 0;
function face(under, skin = 'deep', over = '') {
  const id = `fc${fid++}`;
  return `<defs>${headClip(id)}</defs>${faceSVG({ skin, parts: 'base' })}<g clip-path="url(#${id})">${under}</g>${faceSVG({ skin, parts: 'features' })}${over}`;
}

// ===================================================================================
// 02.1 Holding the brush and the pressure stroke
// ===================================================================================

// Hand holding a brush, side view. grip = distance from the tip to the fingers; rest = little finger on the paper.
function gripScene(grip, rest, skin = SKIN.fair) {
  const paperY = 222, tip = [92, paperY - 2], deg = 125; // brush points down-left
  const g = pol(tip[0], tip[1], grip, deg + 180);
  const o = [];
  o.push(`<rect x="10" y="${paperY}" width="280" height="26" fill="#f1ece4"/><path d="M10 ${paperY}H290" stroke="#d8cfc2" stroke-width="2"/>`);
  const hx = g[0] + 58, hy = g[1] - 4 + (rest ? 0 : -14);
  const pinkyTip = rest ? [hx - 4, paperY - 8] : [hx - 4, hy + 30];
  o.push(finger([[hx + 10, hy + 16], [hx + 2, hy + (rest ? 40 : 26)], pinkyTip], 15, skin));
  o.push(finger(rest ? [[hx - 6, hy + 14], [hx - 34, hy + 30], [hx - 46, hy + 22]] : [[hx - 6, hy + 14], [hx - 28, hy + 20]], 16, skin));
  o.push(`<ellipse cx="${hx + 8}" cy="${hy}" rx="40" ry="31" fill="${skin}" stroke="${OUTLINE}" stroke-width="2.5" transform="rotate(-20 ${hx + 8} ${hy})"/>`);
  o.push(brush(tip[0], tip[1], deg, 205, { color: '#2b6cb0', size: 1.25 }));
  o.push(loadedTip(tip[0], tip[1], deg, P.blue, 0.5, 1.25));
  o.push(finger([[hx - 14, hy + 20], [g[0] + 8, g[1] + 12]], 15, skin)); // thumb
  o.push(finger([[hx - 4, hy - 22], [hx - 30, hy - 18], [g[0] + 2, g[1] - 4]], 16, skin)); // index on top
  if (rest) o.push(`<circle cx="${pinkyTip[0]}" cy="${pinkyTip[1] + 7}" r="13" fill="none" stroke="${OK}" stroke-width="2.5" stroke-dasharray="4 3"/>`);
  return o.join('');
}

plain('m02-l01-grip', 'How to hold the brush. Avoid: fingers right next to the metal part and the hand floating in the air. Good: fingers further back on the handle and the little finger resting on the paper to steady the hand.', 640, 330,
  label(160, 30, 'Avoid', { size: 18, bold: true, color: BAD }) + label(480, 30, 'Good', { size: 18, bold: true, color: OK })
  + `<g transform="translate(10 40)">${gripScene(34, false)}</g>` + cross(70, 120, 24)
  + `<g transform="translate(330 40)">${gripScene(78, true)}</g>` + tick(390, 120, 24)
  + label(160, 310, 'Fingers on the metal, hand floating', { size: 14, color: SOFT })
  + label(480, 310, 'Further back, little finger resting', { size: 14, color: SOFT }));

// Loading the brush: wet -> roll -> point -> loaded to the tip
const V = [0, 0, 220, 180];
const cupMini = (x, y) => `<path d="M${x - 22} ${y - 26}L${x - 17} ${y + 26}H${x + 17}L${x + 22} ${y - 26}Z" fill="#eef6fb" stroke="#9fb3c2" stroke-width="2"/><path d="M${x - 20} ${y - 8}L${x - 18} ${y + 24}H${x + 18}L${x + 20} ${y - 8}Z" fill="#cfe8f7"/>`;
const drop = (x, y) => `<path d="M${x} ${y - 8}C${x + 6} ${y} ${x + 6} ${y + 6} ${x} ${y + 6}C${x - 6} ${y + 6} ${x - 6} ${y} ${x} ${y - 8}Z" fill="#7cc4f0"/>`;
strip('m02-l01-loading', 'Loading the brush in four steps. 1: dip the brush in clean water and drip a few drops on the paint cake. 2: roll the tip around in the wet paint. 3: roll the brush on the edge of the palette so it comes to a sharp point. Done: paint on the front half of the hairs only, the metal part stays clean.', [
  paperPanel(cake(80, 120, 42, P.blue) + cupMini(170, 110) + drop(80, 60) + drop(98, 76) + brush(110, 40, 160, 120, { color: '#2b6cb0' }), V, '1', 'Wet the cake'),
  paperPanel(cake(110, 110, 50, P.blue) + `<ellipse cx="110" cy="110" rx="34" ry="22" fill="#1f56c4" opacity="0.6"/>` + brush(112, 106, 110, 150, { color: '#2b6cb0' }) + loadedTip(112, 106, 110, P.blue, 0.5)
    + arrow([[70, 140], [110, 152], [150, 138], [158, 112]], { width: 2.5 }), V, '2', 'Roll the tip in paint'),
  paperPanel(`<rect x="20" y="118" width="180" height="40" rx="8" fill="#fff" stroke="#c9cdd3" stroke-width="2"/>` + line([[60, 122], [140, 122]], { w: 4, color: P.blue, opacity: 0.5 })
    + brush(140, 112, 165, 150, { color: '#2b6cb0' }) + loadedTip(140, 112, 165, P.blue, 0.55)
    + arrow([[150, 92], [100, 92]], { width: 2.5 }) + `<path d="M176 56a12 12 0 1 1 -8 22" fill="none" stroke="${ACCENT}" stroke-width="2.5" stroke-linecap="round"/>`
    + arrow([[172, 77], [166, 77]], { width: 2.5, head: 8 }), V, '3', 'Twist to a point'),
  paperPanel(brush(60, 140, 125, 190, { color: '#2b6cb0', size: 1.5 }) + loadedTip(60, 140, 125, P.blue, 0.55, 1.5)
    + tick(180, 150, 20) + label(160, 132, 'paint here', { size: 14, color: SOFT }) + arrow([[122, 128], [82, 130]], { color: SOFT, width: 1.8, head: 7 }), V, 'Done', 'Paint on the front half'),
], { pw: 200 });

// Too wet / just right / too dry
const sArc = [[30, 95], [110, 72], [190, 95]];
const streaky = (pts) => stroke(pts, { w: 22, color: P.blue, opacity: 0.55 })
  + [-6, -2, 2, 6].map((k, i) => line(pts.map(([x, y]) => [x + (i % 2 ? 8 : -4), y + k]), { w: 2.6, color: '#ffffff', dash: i % 2 ? '18 7' : '11 9' })).join('');
strip('m02-l01-paint-check', 'Check the paint on paper before skin. Too wet: a puddle at the start and a drip. Just right: a smooth stroke with a sharp start and end. Too dry: a pale, streaky stroke with gaps.', [
  bad(paperPanel(stroke(sArc, { w: 22, color: P.blue }) + `<ellipse cx="44" cy="94" rx="20" ry="17" fill="${P.blue}"/>` + `<path d="M46 108C46 128 50 138 46 146C42 138 44 128 44 108Z" fill="${P.blue}"/>` + cross(170, 145, 18), V, 'Too wet', 'Puddle and drips')),
  good(paperPanel(stroke(sArc, { w: 22, color: P.blue }) + tick(170, 145, 18), V, 'Just right', 'Smooth, sharp ends')),
  bad(paperPanel(streaky(sArc) + cross(170, 145, 18), V, 'Too dry', 'Streaky with gaps')),
], { pw: 200, arrows: false });

// The pressure stroke: touch -> press -> lift
const pPts = [[24, 112], [62, 96], [110, 88], [158, 96], [196, 112]];
const PV = [0, 0, 240, 170];
const tipBrush = (x, y, color = P.blue) => brush(x, y, 115, 100, { color: '#2b6cb0' }) + loadedTip(x, y, 115, color, 0.5);
const under = () => guide([[24, 142], [196, 142]], null);
strip('m02-l01-pressure', 'The pressure stroke in three moves. 1 Touch: only the very tip touches the paper and makes a thin start. 2 Press: push down as you pull, the hairs spread and the line gets wide. 3 Lift: lift slowly as you keep pulling, the line gets thin again. Done: thin, thick, thin.', [
  paperPanel(upto(32, stroke(pPts, { w: 22, color: P.blue })) + tipBrush(30, 109) + pressArrow(14, 80, 'touch') + under(), PV, '1', 'Touch: tip only'),
  paperPanel(upto(108, stroke(pPts, { w: 22, color: P.blue })) + tipBrush(108, 92) + pressArrow(84, 48, 'press') + under(), PV, '2', 'Press: line gets wide'),
  paperPanel(stroke(pPts, { w: 22, color: P.blue }) + tipBrush(196, 110) + pressArrow(172, 74, 'up') + under(), PV, '3', 'Lift: line gets thin'),
  paperPanel(stroke(pPts, { w: 22, color: P.blue }) + label(32, 145, 'thin', { size: 14, color: SOFT }) + label(110, 145, 'thick', { size: 14, color: SOFT, bold: true }) + label(192, 145, 'thin', { size: 14, color: SOFT })
    + arrow([[28, 130], [26, 118]], { color: SOFT, width: 1.5, head: 6 }) + arrow([[110, 128], [110, 106]], { color: SOFT, width: 1.5, head: 6 }) + arrow([[192, 130], [194, 118]], { color: SOFT, width: 1.5, head: 6 }), PV, 'Done', 'Thin, thick, thin'),
], { pw: 210 });

// Good vs bad pressure strokes
strip('m02-l01-mistakes', 'Three common mistakes next to a good stroke. Good: thin start, wide middle, thin end. Blobby start: the brush pressed down before it moved. Shaky line: painted slowly with the fingers only. Same width: no change in pressure.', [
  paperPanel(stroke(pPts, { w: 22, color: P.purple }) + tick(110, 148, 18), PV, 'Good', 'Thin, thick, thin'),
  paperPanel(stroke(pPts, { w: 16, color: P.purple, kind: 'end' }) + `<circle cx="30" cy="110" r="15" fill="${P.purple}"/>` + cross(110, 148, 18), PV, 'Avoid', 'Blobby start'),
  paperPanel(line(wobble(pPts, 3.2, 9), { w: 7, color: P.purple }) + cross(110, 148, 18), PV, 'Avoid', 'Shaky line'),
  paperPanel(line(pPts, { w: 11, color: P.purple }) + cross(110, 148, 18), PV, 'Avoid', 'Same width all along'),
], { pw: 200, arrows: false });

// ===================================================================================
// 02.2 Teardrops and petals
// ===================================================================================
const TV = [0, 0, 220, 170];
// Teardrop being built: head at (60, 90), tail to the right.
strip('m02-l02-teardrop', 'The teardrop in three moves. 1 Touch: the tip touches where the round head will be. 2 Press: press down and the hairs spread into a round head. 3 Lift and pull: pull away while lifting slowly, the line thins to a sharp tail. Done: teardrops pointing in many directions.', [
  paperPanel(dot(60, 92, 3, P.red) + brush(60, 90, 115, 100, { color: '#c0392b' }) + loadedTip(60, 90, 115, P.red, 0.5) + pressArrow(36, 50, 'touch'), TV, '1', 'Touch'),
  paperPanel(dot(60, 92, 15, P.red) + brush(62, 92, 115, 100, { color: '#c0392b' }) + pressArrow(28, 40, 'press'), TV, '2', 'Press: round head'),
  paperPanel(teardrop(60, 92, 0, 120, 30, P.red) + brush(180, 92, 115, 100, { color: '#c0392b' }) + pressArrow(166, 60, 'up')
    + guide([[60, 136], [180, 136]], null), TV, '3', 'Lift and pull'),
  paperPanel(teardrop(40, 50, 0, 70, 20, P.red) + teardrop(130, 40, 30, 70, 20, P.orange) + teardrop(40, 110, -20, 70, 20, P.purple, { curve: 1 })
    + teardrop(170, 90, 90, 64, 20, P.blue) + teardrop(120, 140, 200, 60, 18, P.green, { curve: -1 }), TV, 'Done', 'Any direction'),
], { pw: 200 });

// Petals: round brush (teardrop, head outward) and flat brush (press the flat side, lift toward the center)
const flatBrush = (x, y, deg) => brush(x, y, deg, 100, { tip: 'flat', color: '#c05621' });
const cen = [40, 130];
strip('m02-l02-petals', 'Two ways to paint a petal. Top row, round brush: press for a round head away from the center, then lift and pull toward the center. Bottom row, flat brush: press the whole flat edge down, then lift as you pull toward the center so the petal narrows to a point.', [
  paperPanel(dot(cen[0], cen[1], 4, P.grey) + dot(150, 60, 18, P.pink) + brush(150, 60, 115, 60, { color: '#c0392b' }) + pressArrow(118, 30, 'press'), TV, '1', 'Round: press'),
  paperPanel(dot(cen[0], cen[1], 4, P.grey) + teardrop(150, 60, 147, 108, 36, P.pink) + guide([[132, 92], [70, 128]], null), TV, '2', 'Pull to the center'),
  paperPanel(dot(cen[0], cen[1], 4, P.grey) + teardrop(150, 60, 147, 108, 36, P.pink) + tick(180, 140, 18), TV, 'Done', 'Round-brush petal'),
  paperPanel(dot(cen[0], cen[1], 4, P.grey) + `<rect x="128" y="44" width="16" height="36" rx="5" fill="${P.violet}" transform="rotate(-33 136 62)"/>` + flatBrush(140, 56, 115) + pressArrow(110, 30, 'press'), TV, '1', 'Flat: press the edge'),
  paperPanel(dot(cen[0], cen[1], 4, P.grey) + petal(cen[0] + 14, cen[1] - 8, -33, 118, 40, P.violet, { round: true }) + guide([[124, 96], [72, 122]], null), TV, '2', 'Lift, pull to center'),
  paperPanel(dot(cen[0], cen[1], 4, P.grey) + petal(cen[0] + 14, cen[1] - 8, -33, 118, 40, P.violet, { round: true }) + tick(180, 140, 18), TV, 'Done', 'Flat-brush petal'),
], { pw: 200, cols: 3 });

// Five-petal flower, step by step
const FV = [0, 0, 200, 200], FC = [100, 104];
const petalAt = (i, color = P.pink, k = 1) => { const a = -90 + i * 72; const h = pol(FC[0], FC[1], 58 * k, a); return teardrop(h[0], h[1], a + 180, 50 * k, 36 * k, color); };
const markAt = (i) => { const a = -90 + i * 72; const h = pol(FC[0], FC[1], 58, a); return `<circle cx="${h[0].toFixed(1)}" cy="${h[1].toFixed(1)}" r="4" fill="none" stroke="${P.grey}" stroke-width="1.5"/>`; };
const flowerMarks = dot(FC[0], FC[1], 3, P.grey) + [0, 1, 2, 3, 4].map(markAt).join('');
const flowerDone = (k = 1, c = P.pink) => [0, 1, 2, 3, 4].map((i) => petalAt(i, c, k)).join('')
  + dot(FC[0], FC[1], 15 * k, P.yellow) + dot(FC[0] - 4 * k, FC[1] - 4 * k, 4 * k, P.white)
  + [0, 1, 2, 3, 4].map((i) => { const a = -90 + i * 72; const h = pol(FC[0], FC[1], 62 * k, a); return dot(h[0], h[1], 3.4 * k, P.white); }).join('');
strip('m02-l02-flower', 'A five-petal flower in five steps. 1: mark the center and five light points around it like a star. 2: paint the top petal as a teardrop, round head out, tail to the center. 3: add the next two petals. 4: finish all five. Done: a yellow center dot and small white dots on the petal heads.', [
  paperPanel(flowerMarks, FV, '1', 'Mark 5 points'),
  paperPanel(flowerMarks + petalAt(0) + guide([[100, 20], [100, 78]], null), FV, '2', 'Top petal first'),
  paperPanel(flowerMarks + petalAt(0) + petalAt(1) + petalAt(4) + badge(168, 66, '2', { r: 10 }) + badge(32, 66, '3', { r: 10 }), FV, '3', 'Then left and right'),
  paperPanel(flowerMarks + [0, 1, 2, 3, 4].map((i) => petalAt(i)).join(''), FV, '4', 'All five petals'),
  paperPanel(flowerDone(), FV, 'Done', 'Center and dots'),
], { pw: 170, gap: 36 });

// Teardrop mistakes
strip('m02-l02-mistakes', 'A good teardrop and three mistakes. Good: round head and a long, sharp tail. Avoid: a blob with no tail, because the brush stopped before lifting. Avoid: a hooked tail, because the brush was flicked sideways. Avoid: petals of different sizes with big gaps.', [
  paperPanel(teardrop(60, 80, 0, 120, 34, P.red) + tick(110, 140, 18), TV, 'Good', 'Round head, sharp tail'),
  paperPanel(dot(70, 80, 18, P.red) + stroke([[80, 80], [100, 80]], { w: 14, color: P.red, kind: 'end' }) + cross(110, 140, 18), TV, 'Avoid', 'Blob, no tail'),
  paperPanel(teardrop(60, 80, 0, 90, 34, P.red) + stroke([[140, 80], [160, 74], [168, 58]], { w: 8, color: P.red, kind: 'end' }) + cross(110, 140, 18), TV, 'Avoid', 'Hooked tail'),
  paperPanel(`<g transform="translate(10 -12) scale(0.8)">${[0, 1, 2, 3, 4].map((i) => { const a = -90 + i * 72 + (i === 2 ? 14 : 0); const s = [1, 0.7, 1.15, 0.8, 1][i]; const h = pol(FC[0], FC[1], 58 * s, a); return teardrop(h[0], h[1], a + 180, 50 * s, 36 * s, P.pink); }).join('')}${dot(FC[0], FC[1], 14, P.yellow)}</g>` + cross(180, 140, 18), TV, 'Avoid', 'Uneven petals'),
], { pw: 190, arrows: false });

// Mini-project on the back of the hand
plain('m02-l02-hand-flower', 'Mini-project: a pink five-petal flower with a yellow center and white dots on the back of the hand, with two green teardrop leaves', 300, 330,
  `<svg x="0" y="0" width="300" height="330" viewBox="100 180 200 220">${hand(`<g transform="translate(143 238) scale(0.55)">${flowerDone(1)}</g>`
    + stroke([[198, 316], [196, 340], [200, 368]], { w: 5, color: P.green, kind: 'end' }) + teardrop(184, 352, 200, 30, 15, P.green, { curve: -1 }) + teardrop(212, 344, -20, 30, 15, P.green, { curve: 1 }), 'medium')}</svg>`);

// ===================================================================================
// 02.3 Swirls, curls and spirals
// ===================================================================================
// Points of a curl: a lead-in, then a spiral from radius r to the center.
function curlPts(cx, cy, r, { turns = 1, startDeg = 180, dir = 1, lead = 40, inner = 0.2 } = {}) {
  const pts = [], n = Math.ceil(turns * 18);
  for (let i = 0; i <= n; i++) { const t = i / n; pts.push(pol(cx, cy, r * (1 - t * (1 - inner)), startDeg + dir * t * turns * 360)); }
  const back = startDeg - dir * 90; // tangent pointing backwards from the start
  return lead ? [pol(pts[0][0], pts[0][1], lead, back), ...pts] : pts;
}
const SV = [0, 0, 220, 180];
const shaky = (pts, seed) => line(wobble(pts, 2.6, seed), { w: 5, color: P.teal });

// Fingers only vs whole arm
strip('m02-l03-arm', 'Move the whole arm for swirls. Avoid: moving only the fingers gives a small, cramped, shaky swirl. Good: moving from the elbow and shoulder, with the little finger gliding on the paper, gives a big, smooth swirl.', [
  bad(paperPanel(shaky(curlPts(110, 92, 26, { turns: 1.2, lead: 20 }), 3) + cross(190, 150, 18), SV, 'Fingers only', 'Small and shaky')),
  good(paperPanel(stroke(curlPts(120, 90, 54, { turns: 1.2, lead: 60 }), { w: 20, color: P.teal })
    + arrow([[40, 160], [110, 168], [190, 140], [204, 80]], { color: ACCENT, width: 2.5, dash: '6 5' }) + tick(30, 30, 18), SV, 'Whole arm', 'Big and smooth')),
], { pw: 230, arrows: false });

// The curl: touch, press along the curve, lift into the center
const cP = curlPts(130, 86, 50, { turns: 1.1, lead: 70 });
const cut = (k) => cP.slice(0, Math.round(cP.length * k));
strip('m02-l03-curl', 'A curl in three moves. 1: touch and start pulling along the curve. 2: press as the curve turns, the line gets wide. 3: keep turning and lift slowly into the center, the line ends in a thin point. Done: curls and S-swirls facing different ways.', [
  paperPanel(stroke(cut(0.3), { w: 18, color: P.teal, kind: 'start' }) + arrow(cP.slice(Math.round(cP.length * 0.32), Math.round(cP.length * 0.75)).filter((_, i) => i % 3 === 0).map(([x, y]) => [x + (x - 130) * 0.35, y + (y - 86) * 0.35]), { color: ACCENT, width: 2, dash: '5 4', head: 9 }), SV, '1', 'Touch and pull'),
  paperPanel(stroke(cut(0.7), { w: 18, color: P.teal, kind: 'start' }) + pressArrow(128, 16, 'press'), SV, '2', 'Press around the curve'),
  paperPanel(stroke(cP, { w: 18, color: P.teal }) + `<circle cx="134" cy="88" r="14" fill="none" stroke="${ACCENT}" stroke-width="2" stroke-dasharray="4 3"/>`, SV, '3', 'Lift into the center'),
  paperPanel(stroke(curlPts(60, 60, 30, { turns: 1, lead: 30 }), { w: 12, color: P.teal })
    + stroke(curlPts(170, 60, 30, { turns: 1, startDeg: 0, dir: -1, lead: 30 }), { w: 12, color: P.purple })
    + stroke([...curlPts(70, 130, 26, { turns: 0.9, startDeg: 0, dir: -1, lead: 0 }).reverse(), ...curlPts(150, 130, 26, { turns: 0.9, startDeg: 180, dir: -1, lead: 0 }).slice(1)], { w: 12, color: P.blue }), SV, 'Done', 'Curls and S-swirls'),
], { pw: 200 });

// Turn the paper: always pull toward yourself
const sheetR = (deg, content) => `<g transform="rotate(${deg} 110 90)"><rect x="40" y="22" width="140" height="136" rx="4" fill="#fffdf8" stroke="#d8cfc2" stroke-width="2"/>${content}</g>`;
const sA = curlPts(86, 60, 24, { turns: 0.95, startDeg: 0, dir: -1, lead: 30 });
const halfS = stroke(sA, { w: 13, color: P.purple });
const halfGuide = arrow(sA.slice(0, 14).map(([x, y]) => [x + 20, y + 4]), { color: ACCENT, width: 2, dash: '5 4', head: 8 });
const rot = (c) => `<g transform="rotate(180 110 90)">${c}</g>`;
strip('m02-l03-turn-paper', 'Turn the paper instead of twisting your wrist. 1: paint the first half of an S swirl from the middle up into a curl. 2: turn the paper half a turn, so the painted half is now at the bottom right. 3: paint the same move again from the middle into a curl. Done: a smooth S swirl.', [
  paperPanel(sheetR(0, halfS + halfGuide), SV, '1', 'First half'),
  paperPanel(sheetR(180, halfS) + `<path d="M200 52A80 80 0 0 1 200 128" fill="none" stroke="${ACCENT}" stroke-width="3"/>` + arrow([[202, 118], [198, 130]], { width: 3 }), SV, '2', 'Turn the paper'),
  paperPanel(sheetR(180, halfS) + halfS + halfGuide, SV, '3', 'Same move again'),
  paperPanel(sheetR(0, halfS + rot(halfS)), SV, 'Done', 'Smooth S swirl'),
], { pw: 200 });

// Swirl border, step by step
const BV = [0, 0, 260, 140];
const wave = [[10, 70], [50, 50], [90, 70], [130, 90], [170, 70], [210, 50], [250, 70]];
const waveStrokes = [wave.slice(0, 3), wave.slice(2, 5), wave.slice(4, 7)].map((p) => stroke(p, { w: 12, color: P.blue })).join('');
const curlUp = (x, y, k, c) => stroke(curlPts(x - 11 * k, y - 16 * k, 11 * k, { turns: 1, startDeg: 0, dir: -1, lead: 14 * k }), { w: 7 * k, color: c });
const curlDown = (x, y, k, c) => stroke(curlPts(x + 11 * k, y + 16 * k, 11 * k, { turns: 1, startDeg: 180, dir: -1, lead: 14 * k }), { w: 7 * k, color: c });
const curls = curlUp(50, 52, 1, P.blue) + curlDown(130, 88, 1, P.blue) + curlUp(210, 52, 1, P.blue);
const borderDrops = teardrop(90, 46, 270, 22, 10, P.sky) + teardrop(90, 94, 90, 22, 10, P.sky) + teardrop(170, 94, 90, 22, 10, P.sky) + teardrop(170, 46, 270, 22, 10, P.sky);
const borderDots = [[30, 92], [70, 96], [110, 46], [150, 44], [190, 96], [230, 92]].map(([x, y]) => dot(x, y, 3.5, P.navy)).join('');
strip('m02-l03-border', 'A swirl border in four steps. 1: a wave made of three pressure strokes. 2: a small curl on each top and bottom of the wave. 3: light blue teardrops next to the curls. Done: small dark blue dots to finish.', [
  paperPanel(waveStrokes, BV, '1', 'A wave'),
  paperPanel(waveStrokes + curls, BV, '2', 'Curls on the wave'),
  paperPanel(waveStrokes + curls + borderDrops, BV, '3', 'Teardrops'),
  paperPanel(waveStrokes + curls + borderDrops + borderDots, BV, 'Done', 'Dots to finish'),
], { pw: 220, gap: 36 });

// Spiral mistakes
strip('m02-l03-mistakes', 'A good spiral and three mistakes. Good: an even, round spiral that ends in a thin point at the center. Avoid: a squashed, egg-shaped spiral. Avoid: a swirl made of short pieces with bumps where you stopped and started. Avoid: a blob at the end of a curl.', [
  paperPanel(spiral(110, 90, 62, 1.8, { w: 14, color: P.teal, startDeg: 180 }) + tick(196, 160, 16), SV, 'Good', 'Round, thin center'),
  paperPanel(`<g transform="translate(110 90) scale(1 0.5) translate(-110 -90)">${spiral(110, 90, 70, 1.8, { w: 14, color: P.teal, startDeg: 180 })}</g>` + cross(196, 160, 16), SV, 'Avoid', 'Squashed'),
  paperPanel([[0, 0.35], [0.3, 0.68], [0.62, 1]].map(([a, b], i) => { const pts = curlPts(110, 90, 62, { turns: 1.6, lead: 0 }); return stroke(pts.slice(Math.round(a * pts.length), Math.round(b * pts.length)), { w: 12, color: P.teal, kind: i % 2 ? 'none' : 'both' }); }).join('') + cross(196, 160, 16), SV, 'Avoid', 'Stop-and-start bumps'),
  paperPanel(stroke(curlPts(110, 90, 50, { turns: 1, lead: 50 }), { w: 16, color: P.teal, kind: 'start' }) + dot(118, 92, 13, P.teal) + cross(196, 160, 16), SV, 'Avoid', 'Blob at the end'),
], { pw: 200, arrows: false });

// Mini-project: swirl bracelet around the wrist
const wristWave = [[150, 392], [166, 384], [182, 392], [198, 400], [214, 392], [230, 384], [246, 392]];
const bracelet = [wristWave.slice(0, 3), wristWave.slice(2, 5), wristWave.slice(4, 7)].map((p) => stroke(p, { w: 6, color: P.white })).join('')
  + curlUp(166, 385, 0.45, P.white) + curlDown(198, 399, 0.45, P.white) + curlUp(230, 385, 0.45, P.white)
  + teardrop(182, 380, 270, 11, 5, P.sky) + teardrop(214, 380, 270, 11, 5, P.sky) + teardrop(182, 404, 90, 11, 5, P.sky) + teardrop(214, 404, 90, 11, 5, P.sky)
  + [[158, 404], [174, 406], [222, 406], [238, 404], [198, 376]].map(([x, y]) => dot(x, y, 1.8, P.white)).join('');
plain('m02-l03-wrist-border', 'Mini-project: a swirl border painted across the wrist like a bracelet: a white wave with small white curls, light blue teardrops and white dots, on brown skin', 300, 300,
  `<svg x="0" y="0" width="300" height="300" viewBox="120 300 160 160">${hand(bracelet, 'brown')}</svg>`);

// ===================================================================================
// 02.4 Dots, dot trails and dot flowers
// ===================================================================================
// Dotting tools seen from the side, working end at (x, y) pointing down.
const handleEnd = (x, y, c = '#2b6cb0') => brush(x, y - 150, -90, 150, { color: c }) + `<rect x="${x - 3.6}" y="${y - 14}" width="7.2" height="14" rx="3.6" fill="${c}"/>`;
const dotter = (x, y) => `<path d="M${x} ${y - 6}V${y - 130}" stroke="#868e96" stroke-width="5" stroke-linecap="round"/><rect x="${x - 6}" y="${y - 100}" width="12" height="50" rx="5" fill="#e64980"/>`
  + `<circle cx="${x}" cy="${y - 4}" r="4.5" fill="#adb5bd"/><circle cx="${x}" cy="${y - 134}" r="2.6" fill="#adb5bd"/>`;
const swab = (x, y) => `<path d="M${x} ${y - 10}V${y - 120}" stroke="#dee2e6" stroke-width="5"/><path d="M${x} ${y - 10}V${y - 120}" stroke="#ced4da" stroke-width="5" stroke-dasharray="0" opacity="0.4"/>`
  + `<ellipse cx="${x}" cy="${y - 10}" rx="7" ry="11" fill="#fff" stroke="#ced4da" stroke-width="1.5"/><ellipse cx="${x}" cy="${y - 122}" rx="7" ry="11" fill="#fff" stroke="#ced4da" stroke-width="1.5"/>`;
const tipDown = (x, y) => brush(x, y, 90, 140, { color: '#c0392b' }) + loadedTip(x, y, 90, P.red, 0.5);
const toolCol = (x, tool, name, sizes, c) => tool + sizes.map((r, i) => dot(x, 210 + i * 30 - (i ? 0 : 0), r, c)).join('') + label(x, 310, name, { size: 15, bold: true });
plain('m02-l04-tools', 'Four dotting tools and the dots they make. The tip of a round brush: tiny dots. A dotting tool: small and medium dots. The end of a brush handle: medium dots. A cotton swab: big, soft dots.', 700, 330,
  toolCol(100, tipDown(100, 180), 'Brush tip', [2, 3, 4], P.red)
  + toolCol(270, dotter(270, 180), 'Dotting tool', [4, 6, 8], P.purple)
  + toolCol(440, handleEnd(440, 180, '#2b6cb0'), 'Brush handle', [6, 7.5, 9], P.blue)
  + toolCol(610, swab(610, 180), 'Cotton swab', [9, 11, 12], P.pink));

// One dot: dip, touch straight down, lift straight up
const DV = [0, 0, 200, 180];
const puddle = `<ellipse cx="100" cy="150" rx="60" ry="16" fill="#e9ecef"/><ellipse cx="100" cy="150" rx="34" ry="9" fill="${P.blue}"/>`;
strip('m02-l04-one-dot', 'One clean dot in four pictures. 1: dip the handle end straight into a small pool of wet paint. 2: touch it straight down on the paper. 3: lift it straight up, without sliding. Done: a round dot.', [
  paperPanel(puddle + handleEnd(100, 150) + pressArrow(140, 110, 'touch'), DV, '1', 'Dip straight in'),
  paperPanel(`<path d="M30 150H170" stroke="#d8cfc2" stroke-width="2"/>` + dot(100, 150, 9, P.blue) + handleEnd(100, 146) + pressArrow(140, 110, 'touch'), DV, '2', 'Touch straight down'),
  paperPanel(`<path d="M30 150H170" stroke="#d8cfc2" stroke-width="2"/>` + `<ellipse cx="100" cy="150" rx="9" ry="3" fill="${P.blue}"/>` + handleEnd(100, 120) + pressArrow(140, 100, 'up'), DV, '3', 'Lift straight up'),
  paperPanel(dot(100, 100, 18, P.blue) + tick(160, 150, 18), DV, 'Done', 'A round dot'),
], { pw: 180 });

// Dot trail: dip once, dots get smaller
const trailPts = [[30, 120], [70, 80], [120, 66], [170, 76], [200, 100]];
const trail = (n) => { const all = dots(trailPts, 7, 12, 3, P.purple); return all.split('/>').slice(0, n).map((x) => x + '/>').join(''); };
const TRV = [0, 0, 230, 170];
strip('m02-l04-trail', 'A dot trail in four pictures. 1: dip the handle end once. 2: the first dot is the biggest. 3: keep dotting along the line without dipping again, each dot is a little smaller. Done: seven dots in a curve, from big to tiny.', [
  paperPanel(`<ellipse cx="115" cy="140" rx="70" ry="18" fill="#e9ecef"/><ellipse cx="115" cy="140" rx="38" ry="10" fill="${P.purple}"/>` + handleEnd(115, 140, '#7b3fc4') + label(170, 60, 'dip once', { size: 15, color: SOFT }), TRV, '1', 'Dip once'),
  paperPanel(trail(1) + [...trail(1).matchAll(/cx="([\d.]+)" cy="([\d.]+)"/g)].map((m) => badge(+m[1], +m[2] + 28, '1', { r: 9 })).join(''), TRV, '2', 'Biggest dot first'),
  paperPanel(trail(4) + [...trail(4).matchAll(/cx="([\d.]+)" cy="([\d.]+)"/g)].map((m, i) => badge(+m[1], +m[2] + 28, String(i + 1), { r: 9 })).join('') + arrow([[150, 40], [196, 60]], { width: 2.5, dash: '5 4' }), TRV, '3', 'No new paint'),
  paperPanel(trail(7), TRV, 'Done', 'Big to tiny'),
], { pw: 200 });

// Dot flower
const DFV = [0, 0, 200, 200], DC = [100, 100];
const ring = (r, n, rad, c, off = -90) => Array.from({ length: n }, (_, i) => { const p = pol(DC[0], DC[1], r, off + (i * 360) / n); return dot(p[0], p[1], rad, c); }).join('');
const dotFlower = ring(30, 6, 15, P.pink) + dot(DC[0], DC[1], 14, P.yellow);
const dotFlowerDone = dotFlower + ring(54, 6, 5, P.pink, -60) + ring(66, 6, 3, P.pink, -60) + dot(DC[0] - 4, DC[1] - 4, 3.5, P.white);
strip('m02-l04-flower', 'A dot flower in four pictures. 1: six big pink dots in a ring, like a clock at 12, 2, 4, 6, 8 and 10. 2: a yellow dot in the middle. 3: a smaller pink dot in each gap, a little further out. Done: a tiny dot outside each small dot and a white highlight on the center.', [
  paperPanel(ring(30, 6, 15, P.pink) + badge(100, 50, '1', { r: 9 }), DFV, '1', 'Six dots in a ring'),
  paperPanel(dotFlower, DFV, '2', 'Center dot'),
  paperPanel(dotFlower + ring(54, 6, 5, P.pink, -60), DFV, '3', 'Small dots in the gaps'),
  paperPanel(dotFlowerDone, DFV, 'Done', 'Tiny dots to finish'),
], { pw: 180 });

// Dot mistakes
const MV = [0, 0, 220, 140];
const row = (f) => [0, 1, 2, 3, 4].map((i) => f(30 + i * 40, 66, i)).join('');
strip('m02-l04-mistakes', 'Good dots and three mistakes. Good: round dots of the same size, evenly spaced. Avoid: dots with little tails, because the tool slid while lifting. Avoid: dots of random sizes, because some were dipped again and some were not. Avoid: dots that run together, because they are too wet and too close.', [
  paperPanel(row((x, y) => dot(x, y, 10, P.blue)) + tick(110, 116, 16), MV, 'Good', 'Round, even'),
  paperPanel(row((x, y, i) => teardrop(x - 4, y, 25, 24, 19, P.blue)) + cross(110, 116, 16), MV, 'Avoid', 'Tails'),
  paperPanel(row((x, y, i) => dot(x, y + [0, -4, 3, -2, 2][i], [10, 5, 13, 7, 11][i], P.blue)) + cross(110, 116, 16), MV, 'Avoid', 'Random sizes'),
  paperPanel([0, 1, 2, 3, 4, 5].map((i) => dot(40 + i * 27, 66, 14, P.blue)).join('') + `<ellipse cx="110" cy="80" rx="40" ry="6" fill="${P.blue}"/>` + cross(110, 116, 16), MV, 'Avoid', 'Running together'),
], { pw: 190, arrows: false });

// Mini-project on the back of the hand
plain('m02-l04-hand-dots', 'Mini-project: a dot flower on the back of the hand with two dot trails curving away from it, getting smaller, on fair skin', 300, 330,
  `<svg x="0" y="0" width="300" height="330" viewBox="100 180 200 220">${hand(`<g transform="translate(134 218) scale(0.62)">${dotFlowerDone}</g>`
    + dots([[226, 318], [236, 340], [232, 364], [220, 380]], 6, 5, 1.8, P.purple) + dots([[166, 318], [158, 340], [162, 364], [174, 380]], 6, 5, 1.8, P.purple), 'fair')}</svg>`);

// ===================================================================================
// 02.5 Painting on skin: hand, arm, then face
// ===================================================================================
// A small motif (fan of teardrops plus a dot trail), centered at (x, y), scale k.
const motif = (x, y, k = 1, c1 = P.pink, c2 = P.white) => `<g transform="translate(${x} ${y}) scale(${k})">`
  + [-50, -90, -130].map((a) => { const h = pol(0, 0, 34, a); return teardrop(h[0], h[1], a + 180, 30, 20, c1); }).join('')
  + dot(0, 4, 8, P.yellow) + dots([[14, 12], [34, 22], [52, 18], [64, 4]], 5, 5, 2, c2) + '</g>';
const OV = [0, 0, 200, 200];
const view = (vb, content) => `<svg x="0" y="0" width="200" height="200" viewBox="${vb}">${content}</svg>`;
strip('m02-l05-order', 'Practice in this order. 1: on paper. 2: on the back of your hand. 3: on your inner forearm. 4: on your face in a mirror, on the cheek. The same small design of three teardrops, a center dot and a dot trail is shown on each.', [
  paperPanel(motif(100, 110, 1.2, P.pink, P.purple), OV, '1', 'Paper'),
  paperPanel(view('110 220 180 180', hand(motif(196, 310, 0.9), 'tan')), OV, '2', 'Back of the hand'),
  { ...paperPanel(view('110 330 180 180', hand(motif(198, 430, 0.9), 'tan')), OV, '3', 'Inner forearm'), bg: '#fbf8f4' },
  { ...paperPanel(view('50 170 200 200', face(motif(132, 296, 0.75), 'tan')), OV, '4', 'Cheek, in a mirror'), bg: '#fbf8f4' },
], { pw: 180, gap: 36 });

// Skin is not paper: one long stroke over the knuckles vs short strokes that follow the shape
const KV = '120 190 160 140';
const longStroke = stroke([[134, 262], [170, 250], [210, 248], [246, 258]], { w: 12, color: P.white });
const gaps = `<g fill="${SKIN.medium}">${ARM.knuckles.slice(0, 3).map(([x, y]) => `<ellipse cx="${x + 12}" cy="${y + 28}" rx="5" ry="9" transform="rotate(15 ${x + 12} ${y + 28})"/>`).join('')}</g>`;
strip('m02-l05-short-strokes', 'Skin is not flat like paper. Avoid: one long stroke across the knuckles skips and breaks where the skin bends. Good: several short strokes, each on a flat part, joined at their thin ends.', [
  bad(paperPanel(view(KV, hand(longStroke + gaps, 'medium')) + cross(178, 176, 16), OV, 'Avoid', 'One long stroke breaks')),
  good(paperPanel(view(KV, hand(stroke([[134, 264], [152, 254], [172, 252]], { w: 12, color: P.white }) + stroke([[172, 252], [190, 248], [210, 250]], { w: 12, color: P.white }) + stroke([[210, 250], [228, 252], [246, 260]], { w: 12, color: P.white }), 'medium')) + tick(178, 176, 16), OV, 'Good', 'Short strokes joined')),
], { pw: 230, arrows: false });

// How to hold the skin still: hand flat, arm resting, little finger resting on the face
const restRing = (x, y) => `<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="${OK}" stroke-width="2.5" stroke-dasharray="4 3"/>`;
const table = (y) => `<rect x="0" y="${y}" width="400" height="200" fill="#e9e1d6"/>`;
strip('m02-l05-steady', 'Keep the skin still and your hand steady. 1: lay the hand flat on the table with the fingers a little apart, so the skin on the back of the hand is smooth. 2: rest the forearm on the table, inner side up. 3: on the face, rest your little finger on the jaw or chin while you paint the cheek.', [
  { ...paperPanel(view('90 40 220 220', table(0) + hand('', 'brown')
    + arrow([[140, 120], [118, 112]], { width: 2.5 }) + arrow([[250, 140], [272, 132]], { width: 2.5 })), OV, '1', 'Hand flat, fingers apart'), bg: '#e9e1d6' },
  { ...paperPanel(view('90 300 220 220', table(0) + hand(stroke([[184, 430], [198, 422], [214, 430]], { w: 8, color: P.yellow }), 'brown')), OV, '2', 'Arm resting'), bg: '#e9e1d6' },
  { ...paperPanel(view('50 190 220 220', face(stroke([[112, 300], [130, 290], [150, 296]], { w: 9, color: P.yellow }), 'brown') + restRing(176, 392) + label(176, 420, 'rest', { size: 15, color: OK, bold: true })), OV, '3', 'Little finger resting'), bg: '#fbf8f4' },
], { pw: 190 });

// The stroke sampler on the back of the hand, step by step (deep skin, light colors)
const SH = '122 236 145 145';
const sRow1 = [0, 1, 2].map((i) => stroke([[150 + i * 32, 262], [162 + i * 32, 256], [176 + i * 32, 262]], { w: 8, color: P.white })).join('');
const sRow2 = [0, 1, 2, 3].map((i) => teardrop(154 + i * 24, 292, 60, 22, 11, P.yellow)).join('');
const sRow3 = stroke(curlPts(166, 326, 10, { turns: 1, startDeg: 0, dir: -1, lead: 14 }), { w: 6, color: P.sky })
  + stroke(curlPts(226, 326, 10, { turns: 1, startDeg: 180, dir: 1, lead: 14 }), { w: 6, color: P.sky });
const sRow4 = dots([[150, 356], [180, 352], [210, 356], [244, 352]], 7, 5, 1.6, P.pink);
const sFlower = `<g transform="translate(166 296) scale(0.3)">${dotFlowerDone}</g>`;
strip('m02-l05-sampler', 'The stroke sampler on the back of the hand in five steps. 1: three white pressure strokes near the knuckles. 2: a row of yellow teardrops. 3: two light blue curls facing each other. 4: a pink dot trail. Done: a small dot flower between the two curls.', [
  { ...paperPanel(view(SH, hand(sRow1, 'deep')), OV, '1', 'Pressure strokes'), bg: '#fbf8f4' },
  { ...paperPanel(view(SH, hand(sRow1 + sRow2, 'deep')), OV, '2', 'Teardrops'), bg: '#fbf8f4' },
  { ...paperPanel(view(SH, hand(sRow1 + sRow2 + sRow3, 'deep')), OV, '3', 'Curls'), bg: '#fbf8f4' },
  { ...paperPanel(view(SH, hand(sRow1 + sRow2 + sRow3 + sRow4, 'deep')), OV, '4', 'Dot trail'), bg: '#fbf8f4' },
  { ...paperPanel(view(SH, hand(sRow1 + sRow2 + sRow3 + sRow4 + sFlower, 'deep')), OV, 'Done', 'Dot flower'), bg: '#fbf8f4' },
], { pw: 170, gap: 36 });

// Where to start on the face
const zone = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#ffffff" opacity="0.14"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#69db7c" stroke-width="3.2" stroke-dasharray="7 5"/>`;
const eyeRing = (cx) => `<ellipse cx="${cx}" cy="222" rx="40" ry="26" fill="none" stroke="#ff6b6b" stroke-width="3" stroke-dasharray="6 4"/>`;
plain('m02-l05-face-zones', 'Where to paint first on your face. Green: the cheeks and the forehead are flatter and easy to start on. Red: the eye area needs eye-safe products and a steady hand, so leave it for later.', 520, 470,
  `<svg x="20" y="10" width="340" height="440" viewBox="40 40 320 460">${face(zone(200, 120, 70, 34) + zone(132, 300, 36, 42) + zone(268, 300, 36, 42), 'deep', eyeRing(150) + eyeRing(250))}</svg>`
  + `<rect x="370" y="150" width="18" height="18" rx="4" fill="none" stroke="#69db7c" stroke-width="3" stroke-dasharray="5 3"/>` + label(396, 164, 'Start here', { size: 16, anchor: 'start', bold: true, color: OK })
  + label(396, 186, 'cheeks, forehead', { size: 14, anchor: 'start', color: SOFT })
  + `<rect x="370" y="236" width="18" height="18" rx="4" fill="none" stroke="${BAD}" stroke-width="2" stroke-dasharray="4 3"/>` + label(396, 250, 'Later', { size: 16, anchor: 'start', bold: true, color: BAD })
  + label(396, 272, 'eye area', { size: 14, anchor: 'start', color: SOFT }));

void teardrop; void petal; void dot; void dots; void spiral; void L; void hand; void face; void good;
console.log('m02 assets written');
