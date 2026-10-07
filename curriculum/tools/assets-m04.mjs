// Module 4 diagrams (First Designs) and the project pictures P1-P5.
// Run: node curriculum/tools/assets-m04.mjs
import { plain, strip, paperPanel, faceLayer } from './lib/figure.mjs';
import { P, SOFT, OK, BAD, ACCENT, label, arrow, badge, tick, cross, line, stroke, teardrop, petal, dot, dots, star, sparkle, heart, sponge, glow, stipple, glitter, gem, brush, curlPts, pol, rng, spline, polyD } from './lib/art.mjs';
import { SKIN, L, FACE } from './lib/face.mjs';

const K = P.black;
const n1 = (v) => (Math.round(v * 10) / 10).toString();

// ---------- local helpers (not in the shared lib) ----------

// Mirror across the face center line (x = 200), and "draw one half, mirror it".
const MIR = (c) => `<g transform="translate(400 0) scale(-1 1)">${c}</g>`;
const sym = (c) => c + MIR(c);
// Move / scale a group.
const at = (x, y, k, c, r = 0) => `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${r}) scale(${k})">${c}</g>`;

// Turn filled shapes into black outlines (same path, no fill), or add an outline to a filled shape.
const outlineOnly = (svg, w = 2, c = K) => svg.replace(/fill="(#[0-9a-fA-F]{3,6}|url\([^)]+\))"/g, `fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round"`);
const withOutline = (svg, w = 2, c = K) => svg.replace(/fill="(#[0-9a-fA-F]{3,6})"/g, `fill="$1" stroke="${c}" stroke-width="${w}" stroke-linejoin="round"`);
const op = (o, c) => `<g opacity="${o}">${c}</g>`;

// A face panel / figure in this module: paint under the features, gems and stickers over them.
const FULL = [40, 40, 320, 460];
const FACEV = [70, 60, 260, 380];
const fpanel = (under, { skin = 'light', eyes = 'open', over = '', view = FACEV, brows = true } = {}, lab, cap) =>
  ({ content: faceLayer({ under, over, skin, eyes, brows }), view, label: lab, caption: cap });
const faceOnly = (name, title, under, { skin = 'light', eyes = 'open', over = '', view = FACEV, scale = 1.25, brows = true } = {}) => {
  const [vx, vy, vw, vh] = view;
  plain(name, title, Math.round(vw * scale), Math.round(vh * scale),
    `<svg width="${Math.round(vw * scale)}" height="${Math.round(vh * scale)}" viewBox="${vx} ${vy} ${vw} ${vh}"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#fbf8f4"/>${faceLayer({ under, over, skin, eyes, brows })}</svg>`);
};
const bad = (p) => ({ ...p, labelColor: BAD });
const good = (p) => ({ ...p, labelColor: OK });

// Leaf painted in one pressure stroke (touch, press, lift): an almond shape from (x, y) pointing deg.
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

// A vine: a thin stroke through pts that ends in a curl of radius r (dir 1 or -1).
function vinePts(pts, r, dir = 1, turns = 0.95) {
  const [a, b] = [pts[pts.length - 2], pts[pts.length - 1]];
  const th = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
  const c = pol(b[0], b[1], r, th + dir * 90);
  const curl = curlPts(c[0], c[1], r, { turns, startDeg: th - dir * 90, dir, lead: 0, inner: 0.25 });
  return [...pts.slice(0, -1), ...curl];
}
// Point and direction (deg) at fraction t along a spline through pts.
function along(pts, t) {
  const c = spline(pts, 20), acc = [0];
  for (let i = 1; i < c.length; i++) acc.push(acc[i - 1] + Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]));
  const target = acc[acc.length - 1] * t; let j = acc.findIndex((v) => v >= target); if (j < 1) j = 1;
  return { p: c[j], deg: Math.atan2(c[j][1] - c[j - 1][1], c[j][0] - c[j - 1][0]) * 180 / Math.PI };
}
// Leaves along a vine, alternating sides, pointing forward.
const vineLeaves = (pts, ts, len, w, color = P.green, vein = null) => ts.map((t, i) => { const { p, deg } = along(pts, t); return leaf(p[0], p[1], deg + (i % 2 ? 50 : -50), len, w, color, { curve: i % 2 ? -0.1 : 0.1, vein }); }).join('');

// Five-petal flower in layers (so step strips can add one layer at a time).
// k: size (1 = petals about 60 units across); c: petal color; hi: highlight color.
function flower(cx, cy, k, c, { n = 5, rot = -90, mid = P.yellow, ow = 1.8 } = {}) {
  const R = 22 * k, W = 25 * k, Ln = 21 * k;
  const ang = (i) => rot + (i * 360) / n;
  const pet = (i, col) => { const a = ang(i), h = pol(cx, cy, R, a); return teardrop(h[0], h[1], a + 180, Ln, W, col); };
  const petals = Array.from({ length: n }, (_, i) => pet(i, c)).join('');
  const center = dot(cx, cy, 7 * k, mid) + dot(cx, cy, 7 * k, 'none');
  const outline = outlineOnly(petals, ow) + `<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(7 * k)}" fill="none" stroke="${K}" stroke-width="${ow}"/>`;
  const hi = Array.from({ length: n }, (_, i) => {
    const a = ang(i);
    return stroke([-30, -20, -8].map((d) => pol(cx, cy, R + W * 0.22, a + d)), { w: Math.max(2, 2.6 * k), color: P.white });
  }).join('') + dot(cx - 2.2 * k, cy - 2.2 * k, Math.max(1.4, 2 * k), P.white);
  const lines = Array.from({ length: n }, (_, i) => { const a = ang(i); return line([pol(cx, cy, 8.5 * k, a), pol(cx, cy, 13 * k, a)], { w: Math.max(1, 1.3 * Math.min(k, 1.4)), color: K, opacity: 0.5 }); }).join('');
  return { petals, center, outline, hi, lines };
}
const flowerAll = (cx, cy, k, c, o = {}) => { const f = flower(cx, cy, k, c, o); return f.petals + f.center + f.lines + f.outline + f.hi; };

// Green vine: a curl stroke, thin.
const vine = (pts, w = 5, color = P.green) => stroke(pts, { w, color });

// Little white "shine" comma on a shape.
const shine = (x, y, deg, len = 10, w = 3.2) => stroke([[x, y], pol(x, y, len * 0.5, deg), pol(...pol(x, y, len, deg), len * 0.2, deg + 90)], { w, color: P.white });

// Dashed guide arrow.
const guide = (pts, { color = ACCENT, n = null } = {}) => arrow(pts, { color, width: 2, dash: '5 5', head: 9 }) + (n ? badge(pts[0][0], pts[0][1], n, { r: 10, color }) : '');

// ===================================================================================
// 04.1 Flowers and leaves (fair skin)
// ===================================================================================
const PV = [0, 0, 220, 170];

// Leaves and vines on paper
const vP = vinePts([[24, 138], [70, 116], [112, 120], [150, 96]], 22, -1);
const vL = (vein = null) => vineLeaves(vP, [0.2, 0.36, 0.52, 0.66], 30, 13, P.green, vein);
strip('m04-l01-leaf-vine', 'Leaves and a vine on paper. 1: a leaf is one pressure stroke: touch with the tip, press in the middle, lift to a point. 2: a thin light green line down the middle is the vein. 3: a vine is one long thin stroke that ends in a curl. 4: leaves along the vine, on alternate sides, pointing the same way. Done: dots to finish.', [
  paperPanel(leaf(40, 128, -35, 140, 46, P.green, { curve: 0.05 }) + guide([[34, 154], [150, 70]]), PV, '1', 'Touch, press, lift'),
  paperPanel(leaf(40, 128, -35, 140, 46, P.green, { curve: 0.05, vein: P.lime }), PV, '2', 'Add a vein'),
  paperPanel(vine(vP, 6), PV, '3', 'A vine with a curl'),
  paperPanel(vine(vP, 6) + vL(), PV, '4', 'Leaves on the vine'),
  paperPanel(vine(vP, 6) + vL(P.lime) + dots([[40, 156], [80, 150], [118, 144]], 4, 4, 2, P.green) + dots([[178, 140], [192, 120], [196, 100]], 3, 4, 2.4, P.pink), PV, 'Done', 'Dots to finish'),
], { pw: 190, gap: 36 });

// The flower made pretty: petals, center, outline, highlights
const FV = [0, 0, 160, 160];
const F1 = flower(80, 80, 2.2, P.pink);
strip('m04-l01-flower-pop', 'Make a flower look finished in four steps. 1: five pink teardrop petals, tails to the center. 2: a yellow center dot. 3: a thin black outline around the petals and short lines from the center. Done: a thin white curve on each petal and a white dot on the center.', [
  paperPanel(F1.petals, FV, '1', 'Petals'),
  paperPanel(F1.petals + F1.center, FV, '2', 'Center'),
  paperPanel(F1.petals + F1.center + F1.lines + F1.outline, FV, '3', 'Thin outline'),
  paperPanel(F1.petals + F1.center + F1.lines + F1.outline + F1.hi, FV, 'Done', 'White highlights'),
], { pw: 170, gap: 36 });

// Cheek cluster on the face, step by step
const CV = [72, 220, 150, 150];
const cvA = vinePts([[118, 280], [108, 266], [104, 250]], 6, 1);
const cvB = vinePts([[150, 330], [156, 348], [150, 362]], 6, 1);
const cl = {
  base: glow(140, 304, 52, 48, P.pink, { opacity: 0.6 }) + glow(152, 318, 30, 28, P.violet, { opacity: 0.45 }),
  f: [flower(138, 302, 0.95, P.pink), flower(167, 272, 0.5, P.violet, { rot: -80 }), flower(124, 344, 0.45, P.violet, { rot: -60 })],
  leaves: leaf(160, 318, 40, 28, 11) + leaf(116, 300, 175, 24, 10) + leaf(150, 270, -110, 20, 8) + leaf(140, 344, 70, 18, 7) + leaf(178, 290, 40, 16, 7),
  vines: vine(cvA, 3.2) + vine(cvB, 3.2),
  veins: leaf(160, 318, 40, 28, 11, 'none', { vein: P.lime }) + leaf(116, 300, 175, 24, 10, 'none', { vein: P.lime }),
  dots: dots([[166, 344], [172, 356], [170, 368]], 3, 3, 1.8, P.white) + dots([[104, 322], [100, 312]], 2, 2.6, 1.8, P.white) + dot(178, 252, 2.4, P.white),
};
const fl = (key) => cl.f.map((f) => f[key]).join('');
const clusterStage = (s) => [cl.base, s >= 3 && cl.leaves + cl.vines, s >= 2 && fl('petals'), s >= 3 && fl('center'), s >= 4 && fl('lines') + fl('outline'), s >= 5 && cl.veins + fl('hi') + cl.dots].filter(Boolean).join('');
const CLU = { skin: 'fair', view: CV };
strip('m04-l01-cheek-steps', 'The cheek flower cluster in five steps, on fair skin. 1: dab a soft pink and lilac glow on the cheekbone with a sponge. 2: paint three flowers: one big pink, two small lilac. 3: yellow centers, green leaves tucked between the flowers, and two thin vines. 4: a thin black outline on the flowers. Done: white curves on the petals, light green veins and a few white dots.', [
  fpanel(clusterStage(1), CLU, '1', 'Sponge glow'),
  fpanel(clusterStage(2), CLU, '2', 'Three flowers'),
  fpanel(clusterStage(3), CLU, '3', 'Leaves and vines'),
  fpanel(clusterStage(4), CLU, '4', 'Thin outline'),
  fpanel(clusterStage(5), CLU, 'Done', 'Highlights and dots'),
], { pw: 180, gap: 34 });

faceOnly('m04-l01-cheek-done', 'Finished cheek flower cluster on fair skin: a big pink flower and two small lilac flowers with green leaves, two curling vines and white dots, on the cheekbone below one eye, with a soft pink glow behind.', clusterStage(5), { skin: 'fair' });

// Mistakes
const MV = [0, 0, 180, 150];
const goodLeaves = leaf(112, 92, -10, 50, 20) + leaf(58, 96, 190, 46, 18);
strip('m04-l01-mistakes', 'Three flower mistakes next to a good flower. Good: even petals, a center that covers the tails, leaves tucked behind. Avoid: leaves painted on top of the petals. Avoid: a thick, heavy outline that hides the petals. Avoid: wet paint smudged, petals running into each other.', [
  good(paperPanel(goodLeaves + flowerAll(84, 72, 1.6, P.pink) + tick(160, 136, 16), MV, 'Good', 'Leaves tucked behind')),
  bad(paperPanel(flowerAll(84, 72, 1.6, P.pink) + leaf(70, 80, -10, 64, 24) + leaf(96, 86, 200, 56, 22) + cross(160, 136, 16), MV, 'Avoid', 'Leaves on top')),
  bad(paperPanel((() => { const f = flower(84, 72, 1.6, P.pink, { ow: 6 }); return f.petals + f.center + f.outline; })() + cross(160, 136, 16), MV, 'Avoid', 'Thick, heavy outline')),
  bad(paperPanel(`<defs><filter id="blurM"><feGaussianBlur stdDeviation="3.2"/></filter></defs><g filter="url(#blurM)">${flower(84, 72, 1.6, P.pink).petals}${flower(84, 72, 1.6, P.yellow).center}</g>` + cross(160, 136, 16), MV, 'Avoid', 'Smudged, too wet')),
], { pw: 180, arrows: false });

// ===================================================================================
// 04.2 Stars, hearts and sparkles (brown skin)
// ===================================================================================
// Star from five teardrops: press at the center, pull out to the tip and lift.
const armStroke = (cx, cy, r, a, color) => { const h = pol(cx, cy, r * 0.2, a); return teardrop(h[0], h[1], a, r * 0.8, r * 0.5, color); };
const starArms = (cx, cy, r, color, n = 5, rot = -90) => Array.from({ length: n }, (_, i) => armStroke(cx, cy, r, rot + i * 72, color)).join('') + dot(cx, cy, r * 0.3, color);
const starTips = (cx, cy, r, color = P.grey) => Array.from({ length: 5 }, (_, i) => dot(...pol(cx, cy, r, -90 + i * 72), 3.5, color)).join('');
const starOutlinePath = (cx, cy, r, color, w = 3, o = {}) => outlineOnly(star(cx, cy, r, '#000000', o), w, color);
// Sparkle: a long vertical pressure stroke crossed by a shorter one.
const spark = (cx, cy, r, color = P.white) => stroke([[cx, cy - r], [cx, cy], [cx, cy + r]], { w: r * 0.36, color }) + stroke([[cx - r * 0.65, cy], [cx, cy], [cx + r * 0.65, cy]], { w: r * 0.3, color });
// Heart from two curved teardrops that meet at the bottom point (same outline as heart()).
function heartTD(cx, cy, w, color, side = 'both') {
  const half = 'M0 30C-10 10 -50 5 -50 -20C-50 -40 -32 -50 -18 -50C-6 -50 0 -40 0 -32C3 -12 3 10 0 30Z';
  const g = (sx) => `<path transform="translate(${n1(cx)} ${n1(cy)}) scale(${sx * w / 100} ${w / 100})" d="${half}" fill="${color}"/>`;
  return (side === 'right' ? '' : g(1)) + (side === 'left' ? '' : g(-1));
}
const SV = [0, 0, 170, 150];
strip('m04-l02-two-stars', 'Two ways to paint a star. Top row, outline and fill: 1 mark five tips with small dots, 2 join them into a star outline, then fill it in with a flat brush. Bottom row, five teardrops: 1 press near the center and pull out to the top tip while lifting, 2 the same toward two more tips, then all five arms and a dot to fill the middle.', [
  paperPanel(starTips(85, 80, 56), SV, '1', 'Mark five tips'),
  paperPanel(starTips(85, 80, 56) + starOutlinePath(85, 80, 56, P.gold, 3.5), SV, '2', 'Join the outline'),
  paperPanel(star(85, 80, 56, P.yellow) + starOutlinePath(85, 80, 56, P.gold, 3.5), SV, 'Done', 'Fill it in'),
  paperPanel(armStroke(85, 80, 56, -90, P.yellow) + guide([[110, 70], [110, 24]]), SV, '1', 'Center out to a tip'),
  paperPanel([0, 1, 4].map((i) => armStroke(85, 80, 56, -90 + i * 72, P.yellow)).join(''), SV, '2', 'Three arms'),
  paperPanel(starArms(85, 80, 56, P.yellow), SV, 'Done', 'All five arms'),
], { pw: 170, cols: 3, gap: 40 });

// Make a star pop + hearts + sparkles
const HV = [0, 0, 150, 140];
const popStar = (cx, cy, r, col = P.yellow, ow = 3) => star(cx, cy, r, col) + starOutlinePath(cx, cy, r, K, ow);
const starShine = (cx, cy, r) => stroke([pol(cx, cy, r * 0.38, -156), pol(cx, cy, r * 0.36, -128), pol(cx, cy, r * 0.4, -100)], { w: r * 0.1, color: P.white }) + dot(...pol(cx, cy, r * 0.6, -162), r * 0.06, P.white);
const NIGHT = '#4a5a8a';
strip('m04-l02-pop', 'Hearts, sparkles and a star that pops. Heart: 1 one curved teardrop from the top left down to the point, 2 a mirror teardrop from the top right, then a thin black outline and a white shine. Sparkle: 1 a long up-down pressure stroke, 2 a shorter side-to-side stroke across it. Done: a star with a black outline, a white shine and a sparkle cluster.', [
  paperPanel(heartTD(75, 74, 100, P.red, 'left'), HV, '1', 'Left teardrop'),
  paperPanel(heartTD(75, 74, 100, P.red), HV, '2', 'Mirror on the right'),
  paperPanel(heartTD(75, 74, 100, P.red) + outlineOnly(heart(75, 74, 100, P.red), 2.5) + shine(52, 50, -60, 16, 4), HV, 'Done', 'Outline and shine'),
  { ...paperPanel(stroke([[75, 20], [75, 70], [75, 120]], { w: 18, color: P.white }), HV, '1', 'Long stroke'), bg: NIGHT },
  { ...paperPanel(spark(75, 70, 50), HV, '2', 'Short stroke across'), bg: NIGHT },
  { ...paperPanel(popStar(68, 76, 44) + starShine(68, 76, 44) + spark(124, 30, 18) + spark(118, 118, 10) + dot(136, 92, 3, P.white) + dot(24, 26, 2.6, P.white), HV, 'Done', 'Star and sparkles'), bg: NIGHT },
], { pw: 160, cols: 3, gap: 40 });

// Cheek design: sponged swoosh, stars, heart, outline, sparkles (brown skin)
const swooshD = 'M168 346C140 344 110 322 100 292C95 278 93 262 97 244C104 262 113 278 126 290C140 306 154 324 168 346Z';
const SW = {
  base: sponge(swooshD, [P.pink, P.purple, P.blue], { deg: -60, soft: 2 }),
  shapes: star(144, 304, 25, P.yellow, { rot: -84 }) + star(106, 258, 10, P.yellow, { rot: -80 }) + star(120, 280, 7, P.yellow, { rot: -100 }) + heart(176, 330, 18, P.pink, { rot: 18 }),
  outline: starOutlinePath(144, 304, 25, K, 2.2, { rot: -84 }) + starOutlinePath(106, 258, 10, K, 1.6, { rot: -80 }) + starOutlinePath(120, 280, 7, K, 1.4, { rot: -100 }) + outlineOnly(heart(176, 330, 18, P.pink, { rot: 18 }), 1.6),
  shine: starShine(144, 304, 25) + shine(169, 324, -70, 6, 2.2) + spark(172, 280, 9) + spark(130, 256, 6) + spark(152, 340, 5) + dots([[106, 304], [112, 318], [122, 332]], 3, 2.6, 1.6, P.white) + dot(96, 238, 2, P.white),
};
const swStage = (s) => [SW.base, s >= 2 && SW.shapes, s >= 3 && SW.outline, s >= 4 && SW.shine].filter(Boolean).join('');
const SWV = { skin: 'brown', view: [80, 200, 140, 170] };
strip('m04-l02-cheek-steps', 'The star-and-sparkle cheek design in four steps, on brown skin. 1: sponge a curved swoosh from the cheek up toward the ear, pink at the bottom, then purple, then blue at the top, staying well below the eye. 2: a big yellow star on the cheek, two small stars higher up and a pink heart. 3: thin black outlines. Done: white shine lines, sparkles and dots.', [
  fpanel(swStage(1), SWV, '1', 'Sponge a swoosh'),
  fpanel(swStage(2), SWV, '2', 'Stars and a heart'),
  fpanel(swStage(3), SWV, '3', 'Thin outlines'),
  fpanel(swStage(4), SWV, 'Done', 'Shine and sparkles'),
], { pw: 170, gap: 36 });
faceOnly('m04-l02-cheek-done', 'Finished star-and-sparkle design on brown skin: a pink-purple-blue sponged swoosh curving from the cheek up toward the ear, a big outlined yellow star on the cheek, two small stars, a pink heart, white sparkles and dots.', swStage(4), { skin: 'brown' });

// Star mistakes
const XV = [0, 0, 170, 150];
strip('m04-l02-mistakes', 'A good star and three common mistakes. Good: five even arms and sharp tips. Avoid: one arm too long, so the star looks lopsided. Avoid: round, blunt tips from pressing too hard at the start. Avoid: a black outline painted while the yellow was still wet, so it turned muddy.', [
  good(paperPanel(popStar(80, 78, 52) + starShine(80, 78, 52) + tick(150, 138, 16), XV, 'Good', 'Even arms, sharp tips')),
  bad(paperPanel(`<path d="${polyD([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => pol(80, 82, i % 2 ? 22 : (i === 2 ? 72 : 50), -90 + i * 36)), true)}" fill="${P.yellow}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>` + cross(150, 138, 16), XV, 'Avoid', 'Lopsided arms')),
  bad(paperPanel(star(80, 78, 46, P.yellow, { ri: 26 }) + Array.from({ length: 5 }, (_, i) => dot(...pol(80, 78, 42, -90 + i * 72), 11, P.yellow)).join('') + cross(150, 138, 16), XV, 'Avoid', 'Blunt, blobby tips')),
  bad(paperPanel(star(80, 78, 52, P.yellow) + `<defs><filter id="mud"><feGaussianBlur stdDeviation="2.4"/></filter></defs><g filter="url(#mud)" opacity="0.8">${starOutlinePath(80, 78, 52, '#6f6a55', 7)}</g>` + cross(150, 138, 16), XV, 'Avoid', 'Muddy outline')),
], { pw: 170, arrows: false });

// ===================================================================================
// 04.3 The butterfly (light skin, eyes closed)
// ===================================================================================
// Left half of the butterfly (viewer's left); the right half is the mirror image.
const BF = {
  upper: 'M194 214C190 186 178 150 150 128C128 112 104 116 96 140C90 162 92 196 98 222C102 232 112 238 124 236C140 234 160 236 178 232C188 228 193 222 194 214Z',
  lower: 'M190 252C186 274 174 300 152 316C132 330 108 324 102 300C98 282 104 262 118 250C134 244 160 244 176 246C184 247 189 249 190 252Z',
  // Black outline: the outer edges only (the inner edge along the eye and the body stays soft)
  edgeU: [[194, 212], [190, 186], [178, 152], [152, 128], [124, 114], [100, 132], [92, 164], [94, 198], [100, 226], [112, 236]],
  edgeL: [[188, 254], [182, 280], [168, 302], [148, 318], [124, 326], [104, 310], [100, 284], [108, 262], [120, 250]],
  veins: [[[190, 206], [160, 170], [128, 142]], [[188, 214], [150, 196], [108, 186]], [[186, 256], [160, 276], [128, 300]], [[186, 252], [150, 262], [112, 270]]],
  drops: [[124, 128, 50], [104, 150, 15], [100, 184, 0], [106, 214, -20], [114, 300, -30], [128, 314, -70], [108, 276, 10]],
  dots: [[[164, 152], [176, 172], [182, 194]], [[150, 296], [164, 286], [174, 272]]],
};
const bfBody = stroke([[200, 186], [200, 230], [200, 288]], { w: 13, color: K, kind: 'end' }) + `<ellipse cx="200" cy="198" rx="7.5" ry="16" fill="${K}"/>` + dot(200, 176, 8, K);
const bfAnt = sym(stroke(vinePts([[198, 170], [192, 146], [180, 124], [170, 112]], 6, 1, 0.8), { w: 3.6, color: K, kind: 'start' }));
const bfHalf = (cU, cL, stage) => [
  stage >= 1 && sponge(BF.upper, cU, { deg: 200, soft: 2.5 }),
  stage >= 2 && sponge(BF.lower, cL, { deg: 160, soft: 2.5 }),
  stage >= 4 && BF.veins.map((v) => stroke(v, { w: 3.2, color: K, kind: 'start' })).join('') + stroke(BF.edgeU, { w: 4.6, color: K }) + stroke(BF.edgeL, { w: 4.2, color: K }),
  stage >= 5 && BF.drops.map(([x, y, a]) => teardrop(x + 8 * Math.cos(a * Math.PI / 180), y + 8 * Math.sin(a * Math.PI / 180), a, 16, 9, P.white)).join('') + BF.dots.map((d) => dots(d, 3, 3.2, 2, P.white)).join(''),
].filter(Boolean).join('');
const bfUnder = (cU, cL, stage) => sym(bfHalf(cU, cL, stage)) + (stage >= 3 ? bfBody + bfAnt : '') + (stage >= 5 ? dot(197, 172, 2.2, P.white) + dot(200, 200, 2, P.grey) : '');
const UPC = [P.sky, P.blue, P.purple], LOC = [P.violet, P.magenta];
const BV = [56, 70, 288, 290];
const BFO = { skin: 'light', eyes: 'closed', view: BV, brows: false };
strip('m04-l03-face-steps', 'The butterfly face in five steps, on light skin, with the eyes closed. 1: sponge the upper wings over the brows and closed eyelids, light blue near the nose to purple at the temples. 2: sponge the lower wings on the cheeks, lilac to pink, starting below the lower lashes. 3: a black body down the nose bridge and two antennae on the forehead. 4: black outlines on the outer edges and a few vein strokes from the body outward. Done: white teardrops along the wing edges and white dots.', [
  fpanel(bfUnder(UPC, LOC, 1), BFO, '1', 'Upper wings'),
  fpanel(bfUnder(UPC, LOC, 2), BFO, '2', 'Lower wings'),
  fpanel(bfUnder(UPC, LOC, 3), BFO, '3', 'Body and antennae'),
  fpanel(bfUnder(UPC, LOC, 4), BFO, '4', 'Outlines and veins'),
  fpanel(bfUnder(UPC, LOC, 5), BFO, 'Done', 'White teardrops, dots'),
], { pw: 210, cols: 5, gap: 30 });
faceOnly('m04-l03-face-done', 'Finished butterfly face on light skin with the eyes closed: blue-to-purple upper wings over the brows and eyelids, lilac-to-pink lower wings on the cheeks, a black body down the nose bridge, curled antennae on the forehead, black outlines and white teardrops.', bfUnder(UPC, LOC, 5), { skin: 'light', eyes: 'closed', brows: false });

// Where the butterfly goes: face map
const mapLines = `<path d="M200 70V440" stroke="#7a8794" stroke-width="2" stroke-dasharray="6 6"/>` + `<path d="M84 128H316" stroke="#7a8794" stroke-width="1.6" stroke-dasharray="4 6"/>`;
plain('m04-l03-face-map', 'Where the butterfly goes. The body sits on the center line, down the nose bridge. The upper wings cover the brows and the closed eyelids, with their tips at the same height on both sides. The lower wings sit on the cheeks, below the lower lashes. The two halves are mirror images.', 600, 400,
  `<svg x="0" y="0" width="360" height="400" viewBox="50 60 300 340"><rect x="50" y="60" width="300" height="340" fill="#fbf8f4"/>${faceLayer({ skin: 'light', eyes: 'closed', under: sym(outlineOnly(`<path d="${BF.upper}" fill="#000000"/><path d="${BF.lower}" fill="#000000"/>`, 2.4, '#7b3fc4')) + bfBody + bfAnt, over: mapLines })}</svg>`
  + label(370, 72, 'Wing tips level', { size: 15, anchor: 'start', bold: true }) + arrow([[366, 74], [334, 82]], { color: SOFT, width: 2 })
  + label(370, 152, 'Upper wings: brows', { size: 15, anchor: 'start', bold: true }) + label(370, 172, 'and closed eyelids', { size: 15, anchor: 'start' }) + arrow([[366, 158], [300, 140]], { color: SOFT, width: 2 })
  + label(370, 232, 'Body on the', { size: 15, anchor: 'start', bold: true }) + label(370, 252, 'center line', { size: 15, anchor: 'start', bold: true }) + arrow([[366, 238], [192, 222]], { color: SOFT, width: 2 })
  + label(370, 312, 'Lower wings: cheeks,', { size: 15, anchor: 'start', bold: true }) + label(370, 332, 'below the lashes', { size: 15, anchor: 'start' }) + arrow([[366, 318], [300, 300]], { color: SOFT, width: 2 }));

// Easy version: a small butterfly on the cheek
const cbf = (cx, cy, k, c1, c2, stage) => {
  const W = (s, pts, c) => `<path d="M${n1(cx)} ${n1(cy)}${pts.map((q, i) => (i % 3 === 0 ? 'C' : ' ') + n1(cx + s * q[0] * k) + ' ' + n1(cy + q[1] * k)).join('')}Z" fill="${c}"/>`;
  const wing = (s) => [
    stage >= 1 && W(s, [[4, -22], [26, -36], [37, -27], [47, -18], [36, -2], [0, 0]], c1),
    stage >= 2 && W(s, [[22, 2], [31, 14], [27, 25], [22, 33], [7, 28], [0, 0]], c2),
  ].filter(Boolean).join('');
  return wing(-1) + wing(1)
    + (stage >= 3 ? stroke([[cx, cy - 16 * k], [cx, cy], [cx, cy + 20 * k]], { w: 6 * k, color: K, kind: 'end' }) + dot(cx, cy - 18 * k, 4 * k, K)
      + stroke([[cx - 1, cy - 20 * k], [cx - 6 * k, cy - 32 * k], [cx - 12 * k, cy - 38 * k]], { w: 2.2, color: K, kind: 'none' }) + stroke([[cx + 1, cy - 20 * k], [cx + 6 * k, cy - 32 * k], [cx + 12 * k, cy - 38 * k]], { w: 2.2, color: K, kind: 'none' })
      + dot(cx - 12 * k, cy - 38 * k, 2.6 * k, K) + dot(cx + 12 * k, cy - 38 * k, 2.6 * k, K) : '')
    + (stage >= 4 ? [-1, 1].map((s) => dot(cx + s * 33 * k, cy - 22 * k, 3.6 * k, P.white) + dot(cx + s * 24 * k, cy - 10 * k, 2.4 * k, P.white) + dot(cx + s * 20 * k, cy + 18 * k, 2.6 * k, P.white)
      + dot(cx + s * 22 * k, cy + 24 * k, 1.8 * k, P.white)).join('') : '');
};
const CBV = { skin: 'light', eyes: 'closed', view: [86, 238, 110, 110] };
const cbfFull = (s) => cbf(140, 300, 1, P.sky, P.violet, s);
strip('m04-l03-cheek-steps', 'Easy version: a small cheek butterfly in four steps. 1: two big teardrops for the upper wings, heads out and up, tails meeting in the middle. 2: two smaller teardrops for the lower wings. 3: a thin black body down the middle and two antennae. Done: white dots and a white curve on each wing.', [
  fpanel(cbfFull(1), CBV, '1', 'Upper wings'),
  fpanel(cbfFull(2), CBV, '2', 'Lower wings'),
  fpanel(cbfFull(3), CBV, '3', 'Body, antennae'),
  fpanel(cbfFull(4), CBV, 'Done', 'White dots'),
], { pw: 170, gap: 36 });

// Mistakes
const BMV = [80, 80, 240, 270];
const bfTiny = (shift = 0, tilt = 0, lash = false) => sym(`<g transform="rotate(${tilt} 200 230)">${bfHalf(UPC, LOC, 4)}</g>`) + `<g transform="translate(${shift} 0)">${bfBody}</g>`
  + (lash ? sym(`<path d="M120 232C134 246 166 246 180 234L180 240C166 252 134 252 120 240Z" fill="${P.violet}"/>`) : '');
strip('m04-l03-mistakes', 'A good butterfly and three mistakes. Good: the body on the center line and both wings the same height. Avoid: the body off center, painted beside the nose. Avoid: one wing tilted higher than the other. Avoid: paint on the lash line and the inner eye: keep lower wings below the lashes.', [
  good(fpanel(bfTiny(), { skin: 'light', eyes: 'closed', view: BMV, brows: false }, 'Good', 'Body on the center')),
  bad(fpanel(bfTiny(24), { skin: 'light', eyes: 'closed', view: BMV, brows: false }, 'Avoid', 'Body off center')),
  bad(fpanel(sym(bfHalf(UPC, LOC, 4)).replace('<g transform="translate(400 0) scale(-1 1)">', '<g transform="translate(400 0) scale(-1 1) rotate(-12 200 230)">') + bfBody, { skin: 'light', eyes: 'closed', view: BMV, brows: false }, 'Avoid', 'Wings not level')),
  bad(fpanel(bfTiny(0, 0, true), { skin: 'light', eyes: 'closed', view: BMV, brows: false }, 'Avoid', 'Paint on the lashes')),
], { pw: 180, arrows: false });

// ===================================================================================
// 04.4 Rainbows and clouds (tan skin)
// ===================================================================================
const RB = [P.red, P.orange, P.yellow, P.green, P.blue, P.purple];
// Arc points around (cx, cy), radius r, from a0 to a1 degrees (rotated by rot).
const arcPts = (cx, cy, r, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, i) => pol(cx, cy, r, a0 + (a1 - a0) * i / n));
// Rainbow: bands from the outside (red) in; count = how many bands so far.
const rainbow = (cx, cy, rOut, bw, a0, a1, count = 6, colors = RB) => colors.slice(0, count).map((c, i) => line(arcPts(cx, cy, rOut - bw / 2 - i * bw, a0, a1), { w: bw + 0.6, color: c })).join('');
// Cloud: overlapping round puffs with a flatter bottom.
const cloudD = (cx, cy0, w) => { const s = w / 60, cy = cy0 + 7 * s; return `M${n1(cx - 30 * s)} ${n1(cy + 8 * s)}C${n1(cx - 40 * s)} ${n1(cy + 8 * s)} ${n1(cx - 40 * s)} ${n1(cy - 8 * s)} ${n1(cx - 26 * s)} ${n1(cy - 6 * s)}C${n1(cx - 26 * s)} ${n1(cy - 20 * s)} ${n1(cx - 8 * s)} ${n1(cy - 22 * s)} ${n1(cx - 4 * s)} ${n1(cy - 12 * s)}C${n1(cx)} ${n1(cy - 26 * s)} ${n1(cx + 22 * s)} ${n1(cy - 24 * s)} ${n1(cx + 20 * s)} ${n1(cy - 8 * s)}C${n1(cx + 34 * s)} ${n1(cy - 12 * s)} ${n1(cx + 40 * s)} ${n1(cy + 8 * s)} ${n1(cx + 28 * s)} ${n1(cy + 8 * s)}Z`; };
const cloud = (cx, cy, w, { shade = true, outline = false, soft = 1.2 } = {}) => {
  const d = cloudD(cx, cy, w);
  return sponge(d, [P.white, P.white], { soft })
    + (shade ? `<defs><clipPath id="cl${Math.round(cx * 7 + cy)}"><path d="${d}"/></clipPath></defs><g clip-path="url(#cl${Math.round(cx * 7 + cy)})">${glow(cx, cy + w * 0.2, w * 0.55, w * 0.16, P.sky, { opacity: 0.75 })}</g>` : '')
    + (outline ? `<path d="${d}" fill="none" stroke="${K}" stroke-width="${Math.max(1.4, w / 40)}" stroke-linejoin="round"/>` : '');
};
const puffs = (cx, cy, w, n) => [[-14, 2, 12], [2, -6, 15], [16, 2, 11], [0, 5, 13]].slice(0, n).map(([x, y, r]) => `<circle cx="${n1(cx + x * w / 60)}" cy="${n1(cy + y * w / 60)}" r="${n1(r * w / 60)}" fill="${P.white}" opacity="0.92"/>`).join('');

const RV = [0, 0, 200, 140];
strip('m04-l04-two-rainbows', 'Two ways to paint a rainbow. Top row, stripes: 1 a red arc with the round brush, 2 orange and yellow arcs right inside it, touching, 3 green, blue and purple. Bottom row, one stroke (optional upgrade): 1 rub a flat brush across a rainbow cake so each color sits on one part of the brush, 2 paint one curved stroke, 3 all six colors in one go.', [
  paperPanel(rainbow(100, 120, 84, 9, 190, 350, 1), RV, '1', 'Red arc'),
  paperPanel(rainbow(100, 120, 84, 9, 190, 350, 3), RV, '2', 'Orange, yellow'),
  paperPanel(rainbow(100, 120, 84, 9, 190, 350, 6), RV, '3', 'All six'),
  paperPanel(RB.map((c, i) => `<rect x="${40 + i * 20}" y="70" width="20" height="50" fill="${c}"/>`).join('') + `<rect x="38" y="68" width="124" height="54" rx="6" fill="none" stroke="#adb5bd" stroke-width="3"/>` + brush(100, 66, 90, 70, { tip: 'flat', color: '#c05621', size: 1.6 }) + arrow([[60, 40], [140, 40]], { width: 2.5 }), RV, '1', 'Load across the cake'),
  paperPanel(`<g opacity="0.95">${rainbow(100, 120, 84, 9, 190, 260, 6)}</g>` + brush(...pol(100, 120, 61, 262), 0, 70, { tip: 'flat', color: '#c05621', size: 1.5 }), RV, '2', 'One curved stroke'),
  paperPanel(rainbow(100, 120, 84, 9, 190, 350, 6), RV, 'Done', 'Six colors at once'),
], { pw: 180, cols: 3, gap: 38 });

// Clouds: dab, build, shade
const CLV = [0, 0, 180, 120];
strip('m04-l04-clouds', 'A sponged cloud in four steps. 1: dab white with a sponge corner in one round puff. 2: dab two or three more puffs next to it, overlapping, with a flatter bottom. 3: optional: dab a little light blue along the bottom for shadow. Done: optional thin outline and a few white dots.', [
  { ...paperPanel(puffs(90, 62, 120, 1), CLV, '1', 'One puff'), bg: '#bfe3f6' },
  { ...paperPanel(puffs(90, 62, 120, 4), CLV, '2', 'More puffs'), bg: '#bfe3f6' },
  { ...paperPanel(cloud(90, 66, 120, { shade: true }), CLV, '3', 'Blue shadow'), bg: '#bfe3f6' },
  { ...paperPanel(cloud(90, 66, 120, { shade: true, outline: true }) + dot(150, 28, 3, P.white) + dot(160, 40, 2, P.white) + dot(30, 30, 2.5, P.white), CLV, 'Done', 'Outline and dots'), bg: '#bfe3f6' },
], { pw: 180, gap: 36 });

// Cheek rainbow on the face (tan skin)
const RC = { cx: 140, cy: 318, r: 41, bw: 4.8, a0: 206, a1: 334 };
const rbFace = (count) => `<g transform="rotate(8 ${RC.cx} ${RC.cy})">${rainbow(RC.cx, RC.cy, RC.r, RC.bw, RC.a0, RC.a1, count)}</g>`;
const ends = (() => { const m = RC.r - RC.bw * 3; const rot = (p) => { const a = 8 * Math.PI / 180, x = p[0] - RC.cx, y = p[1] - RC.cy; return [RC.cx + x * Math.cos(a) - y * Math.sin(a), RC.cy + x * Math.sin(a) + y * Math.cos(a)]; }; return [rot(pol(RC.cx, RC.cy, m, RC.a0 + 2)), rot(pol(RC.cx, RC.cy, m, RC.a1 - 2))]; })();
const rbClouds = (o = {}) => cloud(ends[0][0] + 1, ends[0][1] + 1, 36, { soft: 0.5, ...o }) + cloud(ends[1][0] + 1, ends[1][1] + 1, 34, { soft: 0.5, ...o });
const rbShine = `<g transform="rotate(8 ${RC.cx} ${RC.cy})">${stroke(arcPts(RC.cx, RC.cy, RC.r - 2, 236, 282, 10), { w: 2.2, color: P.white })}</g>`;
const rbExtras = rbShine + sparkle(168, 270, 7) + sparkle(116, 262, 5) + sparkle(98, 312, 4.5) + dot(140, 264, 2, P.white) + dot(178, 284, 2, P.white) + dot(106, 326, 1.8, P.white);
const rbStage = (s) => [s >= 1 && rbFace(s === 1 ? 1 : s === 2 ? 3 : 6), s >= 4 && rbClouds({ shade: s >= 5 }), s >= 5 && rbExtras].filter(Boolean).join('');
const RBV = { skin: 'tan', view: [86, 236, 120, 120] };
strip('m04-l04-cheek-steps', 'The rainbow cheek in five steps, on tan skin. 1: a red arc across the cheekbone. 2: orange and yellow arcs inside it, touching. 3: green, blue and purple. 4: sponge a white cloud over each end of the rainbow. Done: light blue shadow under the clouds, a thin white shine on the red arc, white sparkles and dots.', [
  fpanel(rbStage(1), RBV, '1', 'Red arc'),
  fpanel(rbStage(2), RBV, '2', 'Orange, yellow'),
  fpanel(rbStage(3), RBV, '3', 'Green, blue, purple'),
  fpanel(rbStage(4), RBV, '4', 'Clouds on the ends'),
  fpanel(rbStage(5), RBV, 'Done', 'Shadow and sparkles'),
], { pw: 170, gap: 32 });
faceOnly('m04-l04-cheek-done', 'Finished rainbow cheek on tan skin: a six-color rainbow arching over the cheekbone, a white sponged cloud at each end with light blue shadow, a white shine line and small white sparkles.', rbStage(5), { skin: 'tan' });

// Mistakes
const RMV = [0, 0, 180, 130];
const rbP = (c = 6) => rainbow(90, 118, 74, 9, 192, 348, c);
strip('m04-l04-mistakes', 'A good rainbow and three mistakes. Good: even stripes that touch, clouds hiding the ends. Avoid: gaps of bare paper or skin between the stripes. Avoid: each stripe painted while the one next to it was wet, so the colors ran together into mud. Avoid: a cloud wiped on instead of dabbed, so it is streaky and flat.', [
  good({ ...paperPanel(rbP() + cloud(30, 106, 52) + cloud(150, 106, 52) + tick(165, 30, 14), RMV, 'Good', 'Stripes touch'), bg: SKIN.tan }),
  bad({ ...paperPanel(RB.map((c, i) => line(arcPts(90, 118, 70 - i * 12.5, 192, 348), { w: 6, color: c })).join('') + cross(165, 30, 14), RMV, 'Avoid', 'Gaps between stripes'), bg: SKIN.tan }),
  bad({ ...paperPanel(`<defs><filter id="rbmud"><feGaussianBlur stdDeviation="4"/></filter></defs><g filter="url(#rbmud)">${rainbow(90, 118, 74, 9, 192, 348, 6, [P.red, '#b8742a', '#a58d36', '#6c8a4a', '#5b6a8f', '#6d4f8f'])}</g>` + cross(165, 30, 14), RMV, 'Avoid', 'Muddy, ran together'), bg: SKIN.tan }),
  bad({ ...paperPanel(rbP() + [0, 1, 2, 3].map((i) => line([[8, 104 + i * 5], [50, 100 + i * 5]], { w: 3, color: P.white, opacity: 0.8 })).join('') + [0, 1, 2, 3].map((i) => line([[130, 104 + i * 5], [172, 100 + i * 5]], { w: 3, color: P.white, opacity: 0.8 })).join('') + cross(165, 30, 14), RMV, 'Avoid', 'Wiped, streaky cloud'), bg: SKIN.tan }),
], { pw: 180, arrows: false });

// ===================================================================================
// 04.5 Simple animals: cat and tiger (cat on medium skin, tiger on deep skin)
// ===================================================================================
const muzzle = (rx = 21, ry = 17, y = 322) => sym(`<ellipse cx="${200 - rx * 0.78}" cy="${y}" rx="${rx}" ry="${ry}" fill="${P.white}"/>`);
const catNose = `<path d="M188 292C192 288 208 288 212 292C214 296 206 306 200 308C194 306 186 296 188 292Z" fill="${K}"/>`;
const philtrum = stroke([[200, 304], [200, 324], [200, 343]], { w: 3.6, color: K, kind: 'none' });
const whiskerDots = sym([[176, 316], [184, 324], [174, 328], [186, 334], [178, 338]].map(([x, y]) => dot(x, y, 2, K)).join(''));
const whiskers = (c = K) => sym(stroke([[170, 318], [146, 310], [116, 304]], { w: 3.4, color: c }) + stroke([[168, 326], [142, 326], [112, 330]], { w: 3.4, color: c }) + stroke([[170, 334], [146, 342], [120, 356]], { w: 3.4, color: c }));
const catBrows = sym([[128, 186, -130], [142, 180, -115], [156, 179, -100]].map(([x, y, a]) => stroke([[x, y], pol(x, y, 8, a), pol(x, y, 16, a - 8)], { w: 3, color: K })).join(''));
const catStage = (s) => [s >= 1 && glow(200, 322, 52, 34, P.white, { opacity: 0.0 }) + muzzle(), s >= 2 && catNose + philtrum, s >= 3 && whiskerDots + whiskers(), s >= 4 && catBrows + dot(195, 294, 2.4, P.white) + sym(glow(128, 290, 22, 16, P.pink, { opacity: 0.55 }))].filter(Boolean).join('');
const CATV = { skin: 'medium', view: [96, 168, 208, 210] };
strip('m04-l05-cat-steps', 'Cat face in four steps, on medium skin. 1: dab two round white puffs on the upper lip, one each side of the center. 2: a black nose on the tip of the nose and a line down the middle to the lip. 3: small black dots on the puffs and three whiskers on each side, painted as pressure strokes flicked outward. Done: little fur flicks above the brows, a white shine on the nose and pink cheeks.', [
  fpanel(catStage(1), CATV, '1', 'White muzzle'),
  fpanel(catStage(2), CATV, '2', 'Nose and line'),
  fpanel(catStage(3), CATV, '3', 'Dots and whiskers'),
  fpanel(catStage(4), CATV, 'Done', 'Brows and pink cheeks'),
], { pw: 180, gap: 34 });

// Tiger stripe technique on paper
const TV = [0, 0, 200, 120];
const ORANGE_PAPER = sponge('M0 0H200V120H0Z', [P.orange, P.yellow], { deg: 0, soft: 0 });
strip('m04-l05-stripe', 'A tiger stripe in three moves. 1: press the brush down hard at the edge, so the stroke starts wide. 2: pull inward and lift slowly, so it narrows to a sharp point. 3: for a forked stripe, start a second shorter stroke from the middle of the first. Done: stripes of different lengths, never all the same.', [
  { ...paperPanel(ORANGE_PAPER + dot(30, 60, 9, K) + brush(30, 60, 120, 90, { color: '#2b2b2b' }), TV, '1', 'Press at the edge'), bg: P.orange },
  { ...paperPanel(ORANGE_PAPER + stroke([[24, 60], [80, 52], [150, 64]], { w: 20, color: K, kind: 'end' }) + guide([[30, 94], [150, 94]]), TV, '2', 'Pull and lift'), bg: P.orange },
  { ...paperPanel(ORANGE_PAPER + stroke([[24, 60], [80, 52], [150, 64]], { w: 20, color: K, kind: 'end' }) + stroke([[70, 56], [100, 70], [130, 92]], { w: 11, color: K, kind: 'end' }), TV, '3', 'Fork it'), bg: P.orange },
  { ...paperPanel(ORANGE_PAPER + stroke([[10, 20], [60, 26], [120, 20]], { w: 16, color: K, kind: 'end' }) + stroke([[10, 60], [70, 56], [150, 66]], { w: 20, color: K, kind: 'end' }) + stroke([[60, 58], [90, 72], [112, 90]], { w: 9, color: K, kind: 'end' }) + stroke([[10, 100], [50, 98], [86, 104]], { w: 14, color: K, kind: 'end' }), TV, 'Done', 'Different lengths'), bg: P.orange },
], { pw: 190, gap: 34 });

// White fur patch above the left eye: smooth along the brow, spiky (flicked) along the top.
function furPatch() {
  const top = spline([[108, 194], [116, 176], [136, 164], [160, 166], [178, 182], [186, 204]], 6);
  const pts = top.map((p, i) => { if (i % 3 !== 1 || i < 2 || i > top.length - 3) return p; const q = top[i + 1], a = Math.atan2(q[1] - p[1], q[0] - p[0]) - Math.PI / 2; return [p[0] + 7 * Math.cos(a), p[1] + 7 * Math.sin(a)]; });
  return `${polyD(pts)}C176 208 150 206 108 194Z`;
}

// Tiger face
const TG = {
  base: `<path d="${FACE.head}" fill="${P.orange}"/>` + glow(200, 262, 96, 128, P.yellow, { opacity: 0.95 }),
  white: sym(`<path d="${furPatch()}" fill="${P.white}"/>`)
    + muzzle(24, 19, 324) + `<ellipse cx="200" cy="394" rx="30" ry="18" fill="${P.white}"/>` + `<path d="M178 350C190 364 210 364 222 350L222 344H178Z" fill="${P.white}"/>`,
  nose: `<path d="M184 290C190 284 210 284 216 290C218 296 208 308 200 310C192 308 182 296 184 290Z" fill="${K}"/>` + philtrum,
  stripes: stroke([[200, 72], [200, 96], [200, 124]], { w: 14, color: K, kind: 'end' })
    + sym([
      [[160, 74], [166, 100], [180, 128]], [[124, 96], [138, 116], [156, 138]], [[96, 140], [118, 146], [140, 158]],
      [[92, 180], [104, 182], [116, 188]], [[94, 228], [106, 232], [116, 240]],
      [[96, 268], [118, 270], [144, 280]], [[102, 300], [124, 302], [150, 312]], [[114, 336], [132, 340], [150, 352]], [[140, 392], [152, 380], [166, 374]],
    ].map((p, i) => stroke(p, { w: [14, 13, 12, 10, 9, 12, 12, 10, 9][i], color: K, kind: 'end' })).join('')
      ),
  details: whiskerDots + dot(194, 293, 2.6, P.white) + sym(stroke([[180, 360], [186, 368], [194, 372]], { w: 2.4, color: K, kind: 'none' })),

};
const tgStage = (s) => [TG.base, s >= 2 && TG.white, s >= 3 && TG.nose, s >= 4 && TG.stripes, s >= 5 && TG.details].filter(Boolean).join('');
const TGO = { skin: 'deep', view: [70, 60, 260, 360], brows: false };
strip('m04-l05-tiger-steps', 'Tiger face in five steps, on deep skin. 1: sponge orange over the whole face, then yellow in the middle, keeping clear of the eyes. 2: sponge white above each eye over the brows, flicking the top edge into fur, a white muzzle on the upper lip and a white patch on the chin. 3: a black nose on the nose tip and a line down to the lip. 4: black stripes with pressure strokes, wide at the edge of the face and pointed toward the middle, mirrored on both sides. Done: whisker dots, a white shine on the nose and mouth corners.', [
  fpanel(tgStage(1), TGO, '1', 'Orange and yellow'),
  fpanel(tgStage(2), TGO, '2', 'White areas'),
  fpanel(tgStage(3), TGO, '3', 'Nose'),
  fpanel(tgStage(4), TGO, '4', 'Stripes'),
  fpanel(tgStage(5), TGO, 'Done', 'Whisker dots'),
], { pw: 190, gap: 30 });
faceOnly('m04-l05-tiger-done', 'Finished tiger face on deep skin: an orange face with a yellow center, white over the brows, a white muzzle and chin, a black nose and mouth line, black pressure-stroke stripes from the edges of the face inward, and whisker dots.', tgStage(5), { skin: 'deep', brows: false, view: [60, 50, 280, 400] });

// Mistakes
const TMV = { skin: 'deep', view: [80, 150, 240, 230], brows: false };
const symBad = (half, other) => half + other;
strip('m04-l05-mistakes', 'A good tiger and three mistakes. Good: stripes start wide at the edge and taper to a point, mirrored on both sides. Avoid: stripes the same width all along, like straight bars. Avoid: stripes that do not match left and right. Avoid: black painted on wet orange, so it smudged and spread.', [
  good(fpanel(tgStage(4), TMV, 'Good', 'Tapered, mirrored')),
  bad(fpanel(TG.base + TG.white + TG.nose + sym([[[96, 268], [144, 280]], [[102, 300], [150, 312]], [[114, 336], [150, 352]], [[92, 180], [116, 188]], [[96, 140], [140, 158]]].map((p) => line(p, { w: 10, color: K })).join('')), TMV, 'Avoid', 'Straight bars')),
  bad(fpanel(TG.base + TG.white + TG.nose + symBad(TG.stripes.split('<g transform="translate(400 0) scale(-1 1)">')[0], `<g transform="translate(400 0) scale(-1 1) translate(0 34) rotate(-8 140 300)">${[[[96, 268], [118, 270], [144, 280]], [[110, 330], [124, 318], [140, 300]]].map((p) => stroke(p, { w: 12, color: K, kind: 'end' })).join('')}</g>`), TMV, 'Avoid', 'Sides do not match')),
  bad(fpanel(TG.base + TG.white + TG.nose + `<defs><filter id="tgb"><feGaussianBlur stdDeviation="3"/></filter></defs><g filter="url(#tgb)" opacity="0.85">${TG.stripes}</g>`, TMV, 'Avoid', 'Smudged on wet paint')),
], { pw: 180, arrows: false });

// ===================================================================================
// 04.6 Hero masks and fantasy crowns (fair skin)
// ===================================================================================
// Hero eye mask: left half outline points (top center -> outer tip -> bottom center), mirrored.
const maskLeft = [[200, 200], [184, 188], [156, 178], [128, 180], [104, 170], [90, 160], [96, 186], [100, 212], [108, 238], [126, 254], [152, 260], [176, 254], [190, 246], [200, 244]];
function maskD(scaleHole = 1) {
  const left = spline(maskLeft, 8);
  const right = left.slice().reverse().map(([x, y]) => [400 - x, y]);
  const outer = polyD([...left, ...right], true);
  const hole = (cx) => { const rx = 37 * scaleHole, ry = 21 * scaleHole; return `M${cx - rx} 226C${cx - rx} ${226 - ry * 1.35} ${cx + rx} ${226 - ry * 1.35} ${cx + rx} 226C${cx + rx} ${226 + ry * 1.25} ${cx - rx} ${226 + ry * 1.25} ${cx - rx} 226Z`; };
  return { outer, holes: hole(150) + hole(250), all: outer + hole(150) + hole(250) };
}
const MK = maskD();
const maskFill = (cols) => sponge(MK.all, cols, { deg: 90, soft: 1.2 }).replace('<path ', '<path fill-rule="evenodd" ');
const maskSketch = `<path d="${MK.all}" fill="none" stroke="#e8838a" stroke-width="2.2" stroke-dasharray="5 4"/>` + sym(dot(90, 160, 3.2, P.red)) + dot(200, 200, 3, P.red);
const maskLine = `<path d="${MK.outer}" fill="none" stroke="${K}" stroke-width="3.2" stroke-linejoin="round"/><path d="${MK.holes}" fill="none" stroke="${K}" stroke-width="2.4"/>`;
const maskShine = sym(stroke([[112, 186], [128, 186], [150, 184]], { w: 3.2, color: P.white }) + stroke([[110, 228], [112, 240], [120, 248]], { w: 2.6, color: P.white }) + dot(98, 176, 2.2, P.white));
const bolt = (cx, cy, k, c = P.yellow) => `<path transform="translate(${cx} ${cy}) scale(${k})" d="M4 -22L-12 4H0L-6 22L12 -6H0Z" fill="${c}" stroke="${K}" stroke-width="${2 / k}" stroke-linejoin="round"/>`;
const maskStage = (s, cols = [P.red, '#a61e2a']) => [s === 1 && maskSketch, s >= 2 && maskFill(cols), s >= 3 && maskLine, s >= 4 && maskShine + bolt(200, 128, 1.15)].filter(Boolean).join('');
const MKV = { skin: 'fair', view: [70, 92, 260, 190], brows: false };
strip('m04-l06-mask-steps', 'Hero eye mask in four steps, on fair skin, with eye-safe face paint. 1: mark the outer tips and the center with dots and sketch the mask with a thin, light line of the fill color, leaving a wide gap around each eye. 2: fill the mask with red, darker at the bottom, keeping off the lashes. 3: a black outline around the outside and around the eye holes. Done: white shine lines on the mask and a yellow lightning bolt on the forehead.', [
  fpanel(maskStage(1), MKV, '1', 'Sketch the shape'),
  fpanel(maskStage(2), MKV, '2', 'Fill, eye-safe paint'),
  fpanel(maskStage(3), MKV, '3', 'Black outline'),
  fpanel(maskStage(4), MKV, 'Done', 'Shine and emblem'),
], { pw: 220, gap: 34 });

// Crown on the forehead
const crownD = 'M130 168C150 160 176 157 200 157C224 157 250 160 270 168L276 128L250 146L236 108L218 140L200 86L182 140L164 108L150 146L124 128Z';
const crownGems = (stick = false) => (stick
  ? gem(200, 112, 7, '#e64980', { shape: 'drop', deg: -90 }) + gem(164, 134, 5, '#4dabf7') + gem(236, 134, 5, '#4dabf7') + gem(200, 150, 4, '#51cf66') + [150, 176, 224, 250].map((x) => gem(x, x === 150 || x === 250 ? 158 : 154, 3.4, '#ffffff')).join('')
  : `<ellipse cx="200" cy="120" rx="7" ry="10" fill="${P.magenta}" stroke="${K}" stroke-width="1.6"/>` + [164, 236].map((x) => `<circle cx="${x}" cy="136" r="6" fill="${P.blue}" stroke="${K}" stroke-width="1.6"/>`).join('')
    + dot(198, 115, 2.4, P.white) + dot(162, 133, 1.8, P.white) + dot(234, 133, 1.8, P.white));
const crownStage = (s, stick = false) => [
  s === 1 && `<path d="M130 168C150 160 176 157 200 157C224 157 250 160 270 168" fill="none" stroke="${P.gold}" stroke-width="2.2" stroke-dasharray="5 4"/>` + [[124, 128], [164, 108], [200, 86], [236, 108], [276, 128]].map(([x, y]) => dot(x, y, 3.4, P.gold)).join(''),
  s >= 2 && sponge(crownD, [P.yellow, P.gold, P.orange], { deg: 90, soft: 0.8 }),
  s >= 3 && `<path d="${crownD}" fill="none" stroke="${K}" stroke-width="2.6" stroke-linejoin="round"/>` + `<path d="M132 160C152 152 176 150 200 150C224 150 248 152 268 160" fill="none" stroke="${K}" stroke-width="1.6"/>`,
  s >= 4 && crownGems(stick),
  s >= 5 && stroke([[140, 150], [150, 146], [160, 145]], { w: 2.6, color: P.white }) + stroke([[203, 100], [206, 110], [206, 124]], { w: 2.2, color: P.white }) + dots([[134, 172], [160, 178], [200, 180], [240, 178], [266, 172]], 9, 2.2, 2.2, P.gold) + sparkle(112, 116, 8, P.gold) + sparkle(290, 118, 7, P.gold),
].filter(Boolean).join('');
const CRV = { skin: 'fair', view: [92, 66, 216, 140] };
strip('m04-l06-crown-steps', 'Crown on the forehead in five steps, on fair skin. 1: sketch the base curve above the brows and dot the five tips, the middle one highest. 2: fill the crown with yellow, gold and a little orange at the bottom. 3: a black outline and a line along the band. 4: paint round jewels, or press on gem stickers. Done: white shine lines, a row of gold dots under the crown and two sparkles.', [
  fpanel(crownStage(1), CRV, '1', 'Base and tips'),
  fpanel(crownStage(2), CRV, '2', 'Fill with gold'),
  fpanel(crownStage(3), CRV, '3', 'Outline'),
  fpanel(crownStage(4), CRV, '4', 'Jewels'),
  fpanel(crownStage(5), CRV, 'Done', 'Shine and dots'),
], { pw: 190, gap: 30 });
faceOnly('m04-l06-hero-done', 'Two finished looks on fair skin, shown together: a red hero eye mask with a black outline around open eyes, white shine lines and a yellow lightning bolt, and the gold crown option on the forehead with jewels.', maskStage(4).replace(bolt(200, 128, 1.15), '') + crownStage(5), { skin: 'fair', brows: false });

// Painted gems or stickers, and eye safety
const GEV = [0, 0, 150, 110];
strip('m04-l06-gems', 'Two ways to add jewels. Painted: 1 a round dot of color, 2 a thin black outline, Done a white dot and a white curve for the shine. Gem stickers: self-adhesive face gems pressed on with a clean finger, on the forehead or cheekbone only, never on the eyelid or near the lashes.', [
  paperPanel(dot(75, 56, 26, P.blue), GEV, '1', 'Color dot'),
  paperPanel(dot(75, 56, 26, P.blue) + `<circle cx="75" cy="56" r="26" fill="none" stroke="${K}" stroke-width="3"/>`, GEV, '2', 'Thin outline'),
  paperPanel(dot(75, 56, 26, P.blue) + `<circle cx="75" cy="56" r="26" fill="none" stroke="${K}" stroke-width="3"/>` + dot(66, 46, 5, P.white) + stroke([[92, 50], [94, 60], [88, 72]], { w: 3.5, color: P.white }), GEV, 'Done', 'White shine'),
  { ...paperPanel(gem(40, 56, 14, '#4dabf7') + gem(80, 50, 10, '#e64980', { shape: 'drop' }) + gem(112, 60, 12, '#51cf66', { shape: 'star' }) + gem(66, 86, 7, '#ffffff'), GEV, 'Or', 'Gem stickers'), labelColor: '#2f9e44' },
], { pw: 170, gap: 34 });

const EYV = { skin: 'fair', view: [96, 180, 120, 80], brows: false };
const eyeHole = (rx, ry) => `<path fill-rule="evenodd" d="M96 170H216V270H96Z M${150 - rx} 226C${150 - rx} ${226 - ry * 1.35} ${150 + rx} ${226 - ry * 1.35} ${150 + rx} 226C${150 + rx} ${226 + ry * 1.25} ${150 - rx} ${226 + ry * 1.25} ${150 - rx} 226Z" fill="${P.red}"/>`;
strip('m04-l06-mistakes', 'Eye-area mistakes next to a safe mask. Good: a clear gap of bare skin between the paint and the lashes. Avoid: paint right on the lash line and in the inner corner of the eye. Avoid: a gem or glitter on the eyelid near the lashes. Avoid: one side of the mask higher than the other.', [
  good(fpanel(eyeHole(37, 21) + `<path fill-rule="evenodd" d="M${150 - 37} 226C${150 - 37} ${226 - 28} ${150 + 37} ${226 - 28} ${150 + 37} 226C${150 + 37} ${226 + 26} ${150 - 37} ${226 + 26} ${150 - 37} 226Z" fill="none" stroke="${K}" stroke-width="2.4"/>`, EYV, 'Good', 'Gap around the eye')),
  bad(fpanel(eyeHole(31, 12), EYV, 'Avoid', 'Paint on the lashes')),
  bad(fpanel(eyeHole(37, 21), { ...EYV, over: gem(150, 206, 5, '#4dabf7') + gem(166, 210, 3.5, '#ffffff') + glitter('M120 214C134 200 166 200 180 216L180 222C166 210 134 210 120 222Z', [118, 198, 64, 26], { n: 50 }) }, 'Avoid', 'Gems near the lashes')),
  bad({ ...fpanel(`<g transform="rotate(-8 200 220)">${maskFill([P.red, '#a61e2a'])}${maskLine}</g>`, { skin: 'fair', view: [70, 140, 260, 173], brows: false }), label: 'Avoid', caption: 'Lopsided mask' }),
], { pw: 190, arrows: false });

// ===================================================================================
// Projects P1-P5: finished reference pictures and step strips
// ===================================================================================
const FULLV = [60, 50, 280, 400];
const project = (base, refTitle, stripTitle, stage, n, caps, opts, stripOpts = {}) => {
  faceOnly(`${base}`, refTitle, stage(n), { ...opts, view: FULLV });
  strip(`${base}-steps`, stripTitle, caps.map((c, i) => fpanel(stage(i + 1), { ...opts, view: stripOpts.view ?? FULLV }, i === caps.length - 1 ? 'Done' : String(i + 1), c)), { pw: stripOpts.pw ?? 170, gap: 30, cols: stripOpts.cols });
};

// P1 Rainbow cheek (medium skin)
const raindrops = teardrop(118, 336, -90, 9, 6, P.sky) + teardrop(128, 346, -90, 8, 5.4, P.sky) + teardrop(172, 330, -90, 8, 5.4, P.sky) + teardrop(162, 340, -90, 9, 6, P.sky);
const p1Hearts = heart(176, 282, 12, P.pink, { rot: 14 }) + heart(102, 296, 9, P.pink, { rot: -14 });
const p1Stage = (s) => [
  s >= 1 && rbFace(s === 1 ? 3 : 6),
  s >= 3 && rbClouds({ shade: true }),
  s >= 4 && raindrops + p1Hearts,
  s >= 5 && outlineOnly(p1Hearts, 1.2) + rbExtras + dots([[184, 304], [188, 318], [186, 332]], 3, 2.4, 1.4, P.white),
].filter(Boolean).join('');
project('p01-rainbow-cheek', 'Project 1 finished look on medium skin: a six-color rainbow arching over one cheekbone, a white cloud with light blue shadow at each end, light blue raindrops under the clouds, two small pink hearts, white sparkles and dots.',
  'Rainbow cheek in five steps. 1: red, orange and yellow arcs over the cheekbone. 2: green, blue and purple inside them. 3: a sponged white cloud over each end, with a little light blue shadow. 4: light blue teardrop raindrops under the clouds and two small pink hearts. Done: thin outlines on the hearts, a white shine line, sparkles and dots.',
  p1Stage, 5, ['Warm arcs', 'Cool arcs', 'Clouds', 'Rain and hearts', 'Sparkles'], { skin: 'medium' }, { view: [84, 230, 124, 124], pw: 170 });

// P2 Butterfly face (deep skin), warm palette
const P2U = [P.yellow, P.orange, P.magenta], P2L = [P.pink, P.purple];
project('p02-butterfly-face', 'Project 2 finished look on deep skin with the eyes closed: yellow-to-orange-to-magenta upper wings over the brows and eyelids, pink-to-purple lower wings on the cheeks, a black body down the nose bridge, curled antennae, black outlines and veins, white teardrops and dots.',
  'Butterfly face in five steps, eyes closed. 1: sponge the upper wings, yellow near the nose, orange, then magenta at the temples. 2: sponge the lower wings on the cheeks, pink to purple, below the lashes. 3: the black body down the nose bridge and two curled antennae. 4: black outlines on the outer edges and vein strokes. Done: white teardrops along the edges and white dots.',
  (s) => bfUnder(P2U, P2L, s), 5, ['Upper wings', 'Lower wings', 'Body', 'Outlines', 'White details'], { skin: 'deep', eyes: 'closed', brows: false });

// P3 Flower crown and vine (brown skin)
const crownFlowers = [[124, 150, 0.62, P.pink], [154, 128, 0.72, P.violet], [200, 118, 0.9, P.pink], [246, 128, 0.72, P.violet], [276, 150, 0.62, P.pink], [102, 196, 0.45, P.yellow], [110, 262, 0.5, P.pink]];
const p3F = crownFlowers.map(([x, y, k, c], i) => flower(x, y, k, c, { rot: -90 + i * 11, mid: c === P.yellow ? P.orange : P.yellow }));
const p3Vine = vinePts([[178, 148], [140, 160], [112, 178], [100, 216], [104, 244], [114, 280], [128, 304]], 8, -1);
const p3Leaves = leaf(178, 124, -60, 22, 9) + leaf(222, 124, -120, 22, 9) + leaf(136, 144, -150, 20, 8) + leaf(264, 144, -30, 20, 8) + leaf(176, 146, 150, 18, 7) + leaf(224, 146, 30, 18, 7) + leaf(290, 160, 30, 16, 7)
  + vineLeaves(p3Vine, [0.32, 0.46, 0.62, 0.74, 0.86], 18, 8);
const p3fl = (key) => p3F.map((f) => f[key]).join('');
const p3Stage = (s) => [
  s >= 1 && glow(200, 140, 110, 34, P.pink, { opacity: 0.45 }) + glow(110, 236, 26, 70, P.violet, { opacity: 0.35 }),
  s >= 3 && vine(p3Vine, 3.6) + p3Leaves,
  s >= 2 && p3fl('petals'),
  s >= 3 && p3fl('center'),
  s >= 4 && p3fl('lines') + p3fl('outline'),
  s >= 5 && p3fl('hi') + dots([[160, 168], [200, 176], [240, 168]], 7, 2.6, 2.6, P.white) + dots([[126, 316], [134, 330], [138, 344]], 3, 2.6, 1.6, P.white) + sparkle(200, 78, 6),
].filter(Boolean).join('');
project('p03-flower-crown', 'Project 3 finished look on brown skin: a crown of five pink and lilac flowers with leaves across the forehead, and a green vine with small flowers running down one temple to the cheek, with white highlights and dots.',
  'Flower crown and vine in five steps. 1: sponge a soft pink glow across the forehead and a lilac glow down one temple. 2: paint five flowers in an arc above the brows, the biggest in the middle, and two small flowers on the temple and cheek. 3: yellow centers, a thin green vine from the crown down the temple, and leaves tucked between the flowers. 4: thin black outlines on the flowers. Done: white curves on the petals and white dot rows.',
  p3Stage, 5, ['Sponge glow', 'Flowers', 'Leaves and vine', 'Outlines', 'Highlights'], { skin: 'brown' });

// P4 Tiger face (light skin)
project('p04-tiger-face', 'Project 4 finished look on light skin: an orange face with a yellow center, white over the brows with a furry top edge, a white muzzle and chin, a black nose and mouth line, tapered black stripes mirrored on both sides, and whisker dots.',
  'Tiger face in five steps. 1: sponge orange over the face and yellow in the middle, clear of the eyes. 2: white over the brows, on the muzzle and on the chin. 3: a black nose and a line to the lip. 4: black pressure-stroke stripes from the edges inward, mirrored. Done: whisker dots, a white shine on the nose and mouth corners.',
  tgStage, 5, ['Base', 'White areas', 'Nose', 'Stripes', 'Details'], { skin: 'light', brows: false });

// P5 Starry hero mask (tan skin)
const P5C = [P.sky, P.blue, P.navy];
const p5Stars = popStar(200, 120, 20) + starShine(200, 120, 20) + sym(popStar(150, 140, 9, P.yellow, 2) + popStar(112, 284, 11, P.yellow, 2) + star(132, 304, 5, P.yellow));
const p5Stage = (s) => [
  s === 1 && maskSketch,
  s >= 2 && maskFill(P5C),
  s >= 3 && maskLine,
  s >= 4 && sym(star(118, 200, 7, P.yellow) + star(170, 196, 5, P.yellow) + star(140, 250, 5, P.yellow)) + p5Stars,
  s >= 5 && maskShine + sym(spark(132, 106, 7) + spark(96, 248, 6) + spark(140, 326, 5) + dots([[90, 200], [94, 214], [98, 228]], 3, 2.2, 1.4, P.white)) + spark(232, 98, 5),
].filter(Boolean).join('');
project('p05-starry-hero', 'Project 5 finished look on tan skin with open eyes: a blue hero eye mask, light blue at the top to navy at the bottom, outlined in black with a clear gap around each eye, small yellow stars on the mask, a big outlined yellow star on the forehead, stars on both cheeks and white sparkles.',
  'Starry hero mask in five steps, eyes open, eye-safe paint only. 1: dot the tips and sketch the mask with a thin light line, leaving a gap around each eye. 2: sponge it light blue at the top to navy at the bottom. 3: a black outline outside and around the eye holes. 4: small yellow stars on the mask, a big star on the forehead and stars on the cheeks. Done: white shine lines, sparkles and dots.',
  p5Stage, 5, ['Sketch', 'Blue fill', 'Outline', 'Stars', 'Sparkles'], { skin: 'tan', brows: false });

// ===================================================================================
// Line art for the printable design sheets (sheets-m04.mjs draws these as light gray outlines)
// ===================================================================================
const lineOf = (pts) => line(pts, { w: 1 });
export const LINEART = {
  butterfly: sym(`<path d="${BF.upper}" fill="#000"/><path d="${BF.lower}" fill="#000"/>` + BF.veins.map(lineOf).join('')
    + BF.drops.map(([x, y, a]) => teardrop(x + 8 * Math.cos(a * Math.PI / 180), y + 8 * Math.sin(a * Math.PI / 180), a, 16, 9, '#000')).join('')
    + lineOf(vinePts([[198, 170], [192, 146], [180, 124], [170, 112]], 6, 1, 0.8)))
    + `<path d="M200 182C206 182 207 210 206 230C205 260 202 280 200 288C198 280 195 260 194 230C193 210 194 182 200 182Z" fill="#000"/>` + dot(200, 176, 8, '#000'),
  flowers: vine(p3Vine, 1) + p3Leaves + p3fl('petals') + p3fl('center')
    + MIR(cl.leaves + vine(cvA, 1) + vine(cvB, 1) + fl('petals') + fl('center')),
  rainbow: `<g transform="rotate(8 ${RC.cx} ${RC.cy})">${RB.map((c, i) => lineOf(arcPts(RC.cx, RC.cy, RC.r - RC.bw / 2 - i * RC.bw, RC.a0, RC.a1))).join('')}</g>`
    + `<path d="${cloudD(ends[0][0] + 1, ends[0][1] + 1, 36)}" fill="#000"/><path d="${cloudD(ends[1][0] + 1, ends[1][1] + 1, 34)}" fill="#000"/>` + raindrops + p1Hearts
    + MIR(`<path d="${swooshD}" fill="#000"/>` + star(144, 304, 25, '#000', { rot: -84 }) + star(106, 258, 10, '#000', { rot: -80 }) + star(120, 280, 7, '#000', { rot: -100 }) + heart(176, 330, 18, '#000', { rot: 18 })),
  tiger: TG.white + TG.nose + TG.stripes + whiskerDots,
  hero: `<path d="${MK.all}" fill="#000"/><path d="${crownD}" fill="#000"/>` + `<ellipse cx="200" cy="120" rx="7" ry="10" fill="#000"/>` + [164, 236].map((x) => `<circle cx="${x}" cy="136" r="6" fill="#000"/>`).join(''),
};

console.log('m04 assets written');
void [SOFT, label, petal, star, sparkle, heart, sponge, stipple, gem, brush, rng, spline, polyD, L, FACE, SKIN, FULL, shine, sym, at, op, withOutline];
