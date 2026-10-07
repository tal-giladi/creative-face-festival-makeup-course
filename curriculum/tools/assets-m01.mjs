// Module 1 diagrams. Run: node curriculum/tools/assets-m01.mjs
import { plain, strip, paperPanel, facePanel } from './lib/figure.mjs';
import { P, cake, brush, label, arrow, tick, cross, line, stroke, dot, dots, teardrop, petal, star, sparkle, spiral, glow, stipple, glitter, badge, pol, polyD, SOFT, INK } from './lib/art.mjs';
import { SKIN, circleD } from './lib/face.mjs';

// ---------- shared kit pictures ----------
const cup = (x, y, { clean = true } = {}) => `<path d="M${x - 26} ${y - 34}L${x - 20} ${y + 30}H${x + 20}L${x + 26} ${y - 34}Z" fill="#eef6fb" stroke="#9fb3c2" stroke-width="2"/>`
  + `<path d="M${x - 24} ${y - 14}L${x - 21} ${y + 28}H${x + 21}L${x + 24} ${y - 14}Z" fill="${clean ? '#cfe8f7' : '#b9b2c9'}" opacity="0.9"/>`;
const sponge = (x, y, color = '#f6e7d0') => `<path d="M${x - 34} ${y + 20}C${x - 36} ${y - 14} ${x - 10} ${y - 30} ${x + 18} ${y - 26}C${x + 36} ${y - 22} ${x + 38} ${y} ${x + 34} ${y + 20}Z" fill="${color}" stroke="#d2b48c" stroke-width="2"/>`
  + Array.from({ length: 14 }, (_, i) => `<circle cx="${x - 26 + (i * 37) % 56}" cy="${y - 10 + (i * 23) % 26}" r="1.6" fill="#d9c09a"/>`).join('');
const plate = (x, y, r = 46) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#c9cdd3" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${r - 10}" fill="none" stroke="#eceef1" stroke-width="2"/>`;
const wipes = (x, y) => `<rect x="${x - 40}" y="${y - 24}" width="80" height="48" rx="10" fill="#e7f5ec" stroke="#8cc5a0" stroke-width="2"/><rect x="${x - 18}" y="${y - 20}" width="36" height="12" rx="5" fill="#bfe3cc"/>`;
const palette = (x, y, colors) => `<rect x="${x - 10}" y="${y - 30}" width="${colors.length * 46 + 20}" height="60" rx="10" fill="#f1f3f5" stroke="#adb5bd" stroke-width="2"/>`
  + colors.map((c, i) => `<circle cx="${x + 23 + i * 46}" cy="${y}" r="18" fill="${c}" stroke="rgba(0,0,0,0.25)"/>`).join('');

// 01.1 the beginner kit
plain('m01-l01-kit', 'The beginner kit: a palette of face paints with white and black, a pointed round brush, a flat brush, makeup sponges, two cups of water, a white plate and baby wipes', 820, 380,
  palette(40, 80, [P.white, P.black, P.red, P.yellow, P.blue, P.green, P.pink, P.purple])
  + label(230, 140, '1  Face paint (cakes)', { size: 16, bold: true })
  + brush(780, 70, 0, 280, { color: '#2b6cb0', size: 1.3 }) + label(640, 104, '2  Round brush', { size: 16, bold: true })
  + brush(780, 150, 0, 280, { tip: 'flat', color: '#c05621', size: 1.3 }) + label(640, 190, '3  Flat brush', { size: 16, bold: true })
  + sponge(80, 280) + sponge(160, 290, '#fbe3e8') + label(120, 345, '4  Sponges', { size: 16, bold: true })
  + cup(290, 280) + cup(360, 280, { clean: false }) + label(325, 345, '5  Two cups', { size: 16, bold: true })
  + plate(500, 285) + label(500, 355, '6  White plate', { size: 16, bold: true })
  + wipes(680, 285) + label(680, 345, '7  Baby wipes', { size: 16, bold: true }));

// 01.1 ideal vs substitute pairs
const pair = (y, a, aLab, b, bLab) => a + label(170, y + 62, aLab, { size: 15 }) + arrow([[300, y], [380, y]], { color: '#adb5bd' }) + b + label(560, y + 62, bLab, { size: 15 });
plain('m01-l01-substitutes', 'Ideal items and cheaper substitutes: a face-painting sponge or a makeup wedge; a mixing palette or a white plate; a face-painting brush or a synthetic art brush with a sharp point', 720, 470,
  label(170, 34, 'Ideal', { size: 17, bold: true, color: INK }) + label(560, 34, 'Also works', { size: 17, bold: true, color: '#2f9e44' })
  + pair(100, sponge(170, 100, '#f6e7d0'), 'Face-painting sponge', `<path d="M520 120L560 70L600 120Z" fill="#fde2cf" stroke="#e0a982" stroke-width="2"/>`, 'Makeup wedge')
  + pair(240, palette(110, 240, [P.blue, P.white]) , 'Mixing palette', plate(560, 240, 40), 'White plate or lid')
  + pair(372, brush(260, 380, 0, 190, { color: '#2b6cb0' }), 'Face-painting brush', brush(650, 380, 0, 190, { color: '#7a5c3e' }), 'Synthetic art brush'));

// 01.1 brush point test: wet brush with a sharp point (good) vs a split, fluffy tip (bad)
const tipGood = `<path d="M90 60C70 110 76 160 90 200C104 160 110 110 90 60Z" fill="#3b2f2a"/><rect x="74" y="40" width="32" height="30" rx="4" fill="#b8bec6"/>`;
const tipBad = `<path d="M90 60C50 110 52 160 66 196L76 168L84 204L92 170L100 206L108 166L116 198C128 160 126 110 90 60Z" fill="#3b2f2a"/><rect x="74" y="40" width="32" height="30" rx="4" fill="#b8bec6"/>`;
strip('m01-l01-brush-test', 'Brush test: wet the brush and flick off the water. A good round brush springs back to one sharp point and paints a thin line. A brush whose tip splits into several points paints a ragged line.', [
  paperPanel(tipGood + tick(150, 120, 22), [0, 20, 200, 220], 'Good', 'One sharp point'),
  paperPanel(stroke([[20, 120], [100, 95], [180, 120]], { w: 6, color: P.blue }) + tick(100, 180, 18), [0, 20, 200, 220], 'Good', 'Clean thin line'),
  paperPanel(tipBad + cross(156, 120, 22), [0, 20, 200, 220], 'Avoid', 'Split tip'),
  paperPanel(line([[20, 118], [100, 93], [180, 118]], { w: 2, color: P.blue }) + line([[22, 126], [100, 101], [176, 128]], { w: 2, color: P.blue }) + line([[24, 112], [96, 88], [170, 110]], { w: 1.5, color: P.blue }) + cross(100, 180, 18), [0, 20, 200, 220], 'Avoid', 'Ragged line'),
], { arrows: false, pw: 180 });

// =====================================================================
// 01.2 - 01.5 (local helpers first)
// =====================================================================
const LINE = '#5b4636';
const OKC = '#2f9e44', BADC = '#e03131', EYEC = '#1c7ed6';

// Small product pictures, drawn around (x, y) as their center.
const tube = (x, y, color) => `<path d="M${x - 40} ${y - 14}H${x + 22}L${x + 34} ${y - 8}V${y + 8}L${x + 22} ${y + 14}H${x - 40}Z" fill="#f1f3f5" stroke="#868e96" stroke-width="2"/>`
  + `<rect x="${x - 50}" y="${y - 16}" width="10" height="32" rx="2" fill="#ced4da" stroke="#868e96" stroke-width="1.5"/>`
  + `<rect x="${x + 34}" y="${y - 7}" width="14" height="14" rx="3" fill="${color}" stroke="rgba(0,0,0,0.3)"/>`
  + `<rect x="${x - 26}" y="${y - 8}" width="36" height="16" rx="3" fill="${color}"/>`;
const marker = (x, y, color) => `<rect x="${x - 50}" y="${y - 9}" width="70" height="18" rx="5" fill="#f8f9fa" stroke="#868e96" stroke-width="2"/>`
  + `<rect x="${x + 20}" y="${y - 11}" width="30" height="22" rx="6" fill="${color}"/><rect x="${x - 40}" y="${y - 4}" width="40" height="8" rx="2" fill="${color}" opacity="0.5"/>`;
const jar = (x, y, colors, seed = 3) => `<rect x="${x - 26}" y="${y - 22}" width="52" height="46" rx="8" fill="#eef2f6" stroke="#9aa1ab" stroke-width="2"/>`
  + glitter(`M${x - 22} ${y - 8}H${x + 22}V${y + 20}H${x - 22}Z`, [x - 22, y - 8, 44, 28], { colors, n: 70, seed, size: [1.5, 3.4] })
  + `<rect x="${x - 29}" y="${y - 34}" width="58" height="14" rx="4" fill="#495057"/>`;
const glueBottle = (x, y) => `<path d="M${x - 20} ${y + 28}V${y - 10}Q${x - 20} ${y - 18} ${x - 10} ${y - 20}H${x + 10}Q${x + 20} ${y - 18} ${x + 20} ${y - 10}V${y + 28}Z" fill="#ffffff" stroke="#9aa1ab" stroke-width="2"/>`
  + `<path d="M${x - 8} ${y - 20}L${x - 4} ${y - 40}H${x + 4}L${x + 8} ${y - 20}Z" fill="#f08c00"/><rect x="${x - 14}" y="${y - 2}" width="28" height="14" rx="3" fill="#ffe066"/>`;
const henna = (x, y) => `<path d="M${x - 40} ${y - 14}L${x + 34} ${y}L${x - 40} ${y + 14}Z" fill="#2b2b2b" stroke="#000" stroke-width="1"/>`
  + `<path d="M${x - 40} ${y - 14}L${x - 18} ${y - 10}V${y + 10}L${x - 40} ${y + 14}Z" fill="#d9480f"/>`;
const pencil = (x, y, color) => `<rect x="${x - 50}" y="${y - 7}" width="72" height="14" fill="${color}" stroke="rgba(0,0,0,0.25)"/>`
  + `<path d="M${x + 22} ${y - 7}L${x + 46} ${y}L${x + 22} ${y + 7}Z" fill="#f3d9b1"/><path d="M${x + 38} ${y - 2.3}L${x + 46} ${y}L${x + 38} ${y + 2.3}Z" fill="${color}"/>`;
const eyeIcon = (x, y, s = 1) => `<path d="M${x - 14 * s} ${y}Q${x} ${y - 12 * s} ${x + 14 * s} ${y}Q${x} ${y + 12 * s} ${x - 14 * s} ${y}Z" fill="#fff" stroke="${EYEC}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${4 * s}" fill="${EYEC}"/>`;
const miniPalette = (x, y, colors) => `<rect x="${x - colors.length * 17 - 6}" y="${y - 20}" width="${colors.length * 34 + 12}" height="40" rx="8" fill="#f1f3f5" stroke="#adb5bd" stroke-width="2"/>`
  + colors.map((c, i) => `<circle cx="${x - colors.length * 17 + 17 + i * 34}" cy="${y}" r="12" fill="${c}" stroke="rgba(0,0,0,0.25)"/>`).join('');
const bottle = (x, y, body, cap, { h = 80, w = 40, pump = false } = {}) => `<rect x="${x - w / 2}" y="${y - h / 2 + 12}" width="${w}" height="${h - 12}" rx="${w / 4}" fill="${body}" stroke="rgba(0,0,0,0.3)" stroke-width="1.5"/>`
  + (pump ? `<rect x="${x - 6}" y="${y - h / 2 - 6}" width="12" height="20" fill="${cap}"/><rect x="${x - 6}" y="${y - h / 2 - 12}" width="26" height="8" rx="3" fill="${cap}"/>`
    : `<rect x="${x - w / 4}" y="${y - h / 2}" width="${w / 2}" height="14" rx="3" fill="${cap}"/>`)
  + `<rect x="${x - w / 2 + 5}" y="${y - 2}" width="${w - 10}" height="${h / 3}" rx="3" fill="#ffffff" opacity="0.85"/>`;
const soapBar = (x, y) => `<rect x="${x - 34}" y="${y - 18}" width="68" height="36" rx="16" fill="#d0ebff" stroke="#74c0fc" stroke-width="2"/><circle cx="${x + 34}" cy="${y - 20}" r="7" fill="#fff" stroke="#a5d8ff"/><circle cx="${x + 44}" cy="${y - 30}" r="4" fill="#fff" stroke="#a5d8ff"/>`;
const pad = (x, y, r = 22) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" stroke="#adb5bd" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${r - 6}" fill="none" stroke="#e9ecef" stroke-width="2" stroke-dasharray="3 4"/>`;
const drop = (x, y, s = 1, color = '#74c0fc') => `<path d="M${x} ${y - 9 * s}C${x + 6 * s} ${y - 1 * s} ${x + 6 * s} ${y + 6 * s} ${x} ${y + 6 * s}C${x - 6 * s} ${y + 6 * s} ${x - 6 * s} ${y - 1 * s} ${x} ${y - 9 * s}Z" fill="${color}"/>`;
const bubbles = (pts) => pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" fill-opacity="0.85" stroke="#a5d8ff" stroke-width="1.5"/>`).join('');
const clock = (x, y, r, text) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#495057" stroke-width="3"/>`
  + `<path d="M${x} ${y}V${y - r * 0.65}M${x} ${y}L${x + r * 0.45} ${y + r * 0.15}" stroke="#495057" stroke-width="3" stroke-linecap="round"/>`
  + (text ? label(x, y + r + 26, text, { size: 22, bold: true, halo: false }) : '');
const circArrow = (cx, cy, r) => arrow(Array.from({ length: 9 }, (_, i) => pol(cx, cy, r, -200 + i * 32)), { width: 3 });
const towel = (x, y, w, h, color = '#d3f9d8') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${color}" stroke="#8ce99a" stroke-width="2"/>`
  + Array.from({ length: Math.floor(w / 14) }, (_, i) => `<line x1="${x + 7 + i * 14}" y1="${y + h - 10}" x2="${x + 7 + i * 14}" y2="${y + h}" stroke="#8ce99a" stroke-width="2"/>`).join('');

// Inner forearm, wrist on the left, elbow on the right (frame 300 x 200).
const forearm = (skin = 'fair') => {
  const f = SKIN[skin];
  return `<path d="M-10 62C70 56 170 50 310 42V172C170 166 70 158 -10 154Z" fill="${f}"/>`
    + `<path d="M-10 62C70 56 170 50 310 42M-10 154C70 158 170 166 310 172" fill="none" stroke="${LINE}" stroke-width="2.4"/>`
    + `<path d="M22 66C17 90 17 124 22 152M32 66C28 90 28 124 32 152" fill="none" stroke="${LINE}" stroke-width="1.2" opacity="0.35"/>`
    + `<path d="M276 46C266 80 266 130 276 170" fill="none" stroke="${LINE}" stroke-width="1.4" opacity="0.4"/>`
    + `<path d="M40 112C100 104 170 112 260 98M60 128C120 132 180 126 250 132" fill="none" stroke="#7d8fb3" stroke-width="2" opacity="0.25"/>`;
};
const SPOT = [150, 106];
const rash = (x, y, s = 1) => glow(x, y, 46 * s, 36 * s, '#e8590c', { opacity: 0.55 }) + glow(x + 8 * s, y - 4 * s, 28 * s, 22 * s, '#e03131', { opacity: 0.5 })
  + Array.from({ length: 16 }, (_, i) => { const [px, py] = pol(x, y, 6 + ((i * 37) % 30) * s, i * 67); return `<circle cx="${n1(px)}" cy="${n1(py)}" r="${n1((2 + (i % 3)) * s)}" fill="#c92a2a" opacity="0.7"/>`; }).join('');
const n1 = (v) => (Math.round(v * 10) / 10).toString();

// A brush with paint on the tip (same geometry as art.brush).
const paintTip = (x, y, deg, s, paint, frac = 0.6) => {
  const hairLen = 26 * s, w = 6 * s;
  const p = (r) => pol(x, y, r, deg + 180);
  const side = (r, k) => pol(...p(r), k, deg + 90);
  return `<path d="${polyD([p(0), side(hairLen * 0.45, w * 1.02), side(hairLen * frac, w * 0.95), side(hairLen * frac, -w * 0.95), side(hairLen * 0.45, -w * 1.02)], true)}" fill="${paint}"/>`;
};
const loaded = (x, y, deg, len, paint, { s = 1.6, frac = 0.6, color = '#2b6cb0' } = {}) => brush(x, y, deg, len, { color, size: s }) + paintTip(x, y, deg, s, paint, frac);

// ---------- 01.2 Reading the label ----------
{
  const col = (x, w, title, color, body) => `<rect x="${x}" y="20" width="${w}" height="430" rx="14" fill="#ffffff" stroke="${color}" stroke-width="2.5"/>`
    + `<path d="M${x} 34Q${x} 20 ${x + 14} 20H${x + w - 14}Q${x + w} 20 ${x + w} 34V66H${x}Z" fill="${color}"/>`
    + label(x + w / 2, 51, title, { size: 18, bold: true, color: '#ffffff', halo: false }) + body;
  const item = (x, y, pic, text, sub = '') => pic + label(x, y + 44, text, { size: 14, bold: true, halo: false }) + (sub ? label(x, y + 62, sub, { size: 13, color: SOFT, halo: false }) : '');
  plain('m01-l02-sort', 'Three groups. Skin: yes — face paint, cosmetic glitter gel, neon face paint (not near the eyes). Eye area: yes — products whose label allows eye use, such as an eye-safe pencil. Not for skin — acrylic craft paint, markers, craft glitter, glue and black henna.', 940, 470,
    col(20, 280, 'Skin: yes', OKC,
      item(160, 110, miniPalette(160, 110, [P.white, P.black, P.red, P.blue]), 'Face and body paint')
      + item(160, 230, tube(160, 230, P.violet), 'Cosmetic glitter gel')
      + item(160, 350, cake(160, 350, 22, P.neonPink) + cake(210, 350, 22, P.neonGreen) + cake(110, 350, 22, P.neonYellow), 'Neon face paint', 'cheeks and body only'))
    + col(330, 280, 'Eye area: yes', EYEC,
      item(470, 120, pencil(470, 120, '#8a5a33') + eyeIcon(445, 92, 0.9), 'Eye-safe pencil', 'label says eyes OK')
      + item(470, 260, cake(450, 260, 24, P.white) + cake(505, 260, 24, P.black) + eyeIcon(560, 236, 0.9), 'Face paint labeled', 'safe for the eye area')
      + label(470, 400, 'Only if the label', { size: 15, color: EYEC, bold: true, halo: false }) + label(470, 420, 'allows the eye area', { size: 15, color: EYEC, bold: true, halo: false }))
    + col(640, 280, 'Not for skin', BADC,
      item(715, 110, tube(715, 110, P.blue), 'Acrylic paint') + item(850, 110, marker(850, 110, P.red), 'Markers')
      + item(715, 230, jar(715, 230, [P.gold, P.pink, P.silver, P.sky]), 'Craft glitter') + item(850, 230, glueBottle(850, 230), 'Glue')
      + item(780, 345, henna(780, 345), '"Black henna"', 'can burn and scar')));
}
{
  const L0 = 60, T0 = 40;
  const t = (y, s, o = {}) => label(L0 + 26, y, s, { anchor: 'start', halo: false, ...o });
  const pack = `<rect x="${L0}" y="${T0}" width="380" height="380" rx="12" fill="#ffffff" stroke="#adb5bd" stroke-width="2"/>`
    + `<rect x="${L0}" y="${T0}" width="380" height="64" rx="12" fill="#7b3fc4"/><rect x="${L0}" y="${T0 + 40}" width="380" height="24" fill="#7b3fc4"/>`
    + label(L0 + 190, T0 + 41, 'FACE & BODY PAINT', { size: 24, bold: true, color: '#fff', halo: false })
    + t(T0 + 96, 'Water-activated  ·  cosmetic  ·  30 g', { size: 15, color: SOFT })
    + t(T0 + 140, 'Ingredients:', { size: 15, bold: true })
    + t(T0 + 164, 'Aqua, Glycerin, Talc, Kaolin,', { size: 15 })
    + `<rect x="${L0 + 22}" y="${T0 + 172}" width="176" height="24" rx="4" fill="#fff3bf"/>`
    + t(T0 + 189, 'CI 77891, CI 77491', { size: 15, bold: true })
    + `<rect x="${L0 + 18}" y="${T0 + 222}" width="344" height="92" rx="8" fill="#fff5f5" stroke="${BADC}" stroke-width="1.5"/>`
    + t(T0 + 248, 'Warning:', { size: 15, bold: true, color: BADC })
    + t(T0 + 272, 'Not for use near the eyes.', { size: 15 })
    + t(T0 + 296, 'Patch test before use.', { size: 15 })
    + t(T0 + 350, 'Wash off with soap and water.', { size: 15, color: SOFT });
  const call = (n, y, ty, a, b, tx = L0 + 372) => badge(500, y, n, { r: 15 }) + arrow([[484, y], [tx, ty]], { color: '#c2b8ab', width: 2, head: 8 })
    + label(526, y - 3, a, { size: 17, bold: true, anchor: 'start', halo: false }) + label(526, y + 19, b, { size: 15, anchor: 'start', color: SOFT, halo: false });
  plain('m01-l02-label', 'An example face paint label with four things to check: 1 it says face and body paint, a cosmetic; 2 it has an ingredient list; 3 the colors are listed as CI numbers such as CI 77891 and CI 77491; 4 the warning says where it may not go, here not near the eyes.', 840, 460,
    pack
    + call('1', 80, T0 + 32, 'Face or body paint?', 'sold as a cosmetic')
    + call('2', 170, T0 + 140, 'Ingredient list?', 'no list: not on skin', L0 + 150)
    + call('3', 250, T0 + 184, 'Colors as CI numbers', 'look them up in CosIng', L0 + 204)
    + call('4', 340, T0 + 262, 'Where may it go?', 'believe "not near eyes"'));
}
{
  // keep-out ring around each eye, drawn on top
  const ring = (cx) => `<ellipse cx="${cx}" cy="222" rx="48" ry="42" fill="none" stroke="${BADC}" stroke-width="3" stroke-dasharray="7 6"/>`;
  const half = stroke([[100, 296], [132, 284], [168, 292]], { w: 12, color: P.neonPink }) + stroke([[110, 318], [136, 309], [160, 316]], { w: 9, color: P.neonGreen }) + dot(178, 296, 5, P.neonYellow);
  const good = half + `<g transform="translate(400 0) scale(-1 1)">${half}</g>`
    + star(200, 128, 24, P.neonYellow) + dot(160, 140, 6, P.neonBlue) + dot(240, 140, 6, P.neonBlue) + dot(142, 150, 4, P.neonPink) + dot(258, 150, 4, P.neonPink);
  const wing = stroke([[176, 244], [148, 252], [120, 238], [98, 210], [92, 176]], { w: 14, color: P.neonPink }) + stroke([[124, 212], [104, 186], [104, 160]], { w: 9, color: P.neonGreen });
  const bad = wing + `<g transform="translate(400 0) scale(-1 1)">${wing}</g>`;
  strip('m01-l02-neon', 'Neon and glow-in-the-dark paint. Good: neon lines on the cheeks and a star on the forehead, with a dashed ring around each eye that stays free of neon. Avoid: neon wings painted around the eyes.', [
    { ...facePanel({ skin: 'tan', under: good, over: ring(150) + ring(250) }), label: 'Good', caption: 'Cheeks and forehead only' },
    { ...facePanel({ skin: 'tan', under: bad, over: cross(330, 110, 30) }), label: 'Avoid', caption: 'Neon around the eyes' },
  ], { pw: 260, gap: 50, arrows: false });
}

// ---------- 01.3 Patch test and clean hands ----------
{
  const V = [0, 0, 300, 200];
  const A = (inner) => forearm('fair') + inner;
  const spot = (op = 1) => `<circle cx="${SPOT[0]}" cy="${SPOT[1]}" r="20" fill="${P.purple}" opacity="${op}"/>`;
  strip('m01-l03-patch', 'Patch test on the inner forearm in five steps: 1 wash and dry a small patch; 2 paint a coin-sized spot of the new product; 3 wear it as long as a design, then wash it off; 4 check the spot after 24 and 48 hours; done: no redness, itching or swelling, so the product is OK to use.', [
    paperPanel(A(drop(120, 92, 1.4) + drop(150, 120, 1.4) + drop(180, 96, 1.4) + bubbles([[205, 118, 8], [218, 104, 5], [96, 120, 6]])), V, '1', 'Wash and dry'),
    paperPanel(A(spot() + `<circle cx="225" cy="${SPOT[1]}" r="20" fill="#e9c46a" stroke="#b08900" stroke-width="2"/>` + `<circle cx="225" cy="${SPOT[1]}" r="14" fill="none" stroke="#b08900" stroke-width="1.5"/>` + loaded(110, 92, -130, 120, P.purple, { s: 1.3 })), V, '2', 'A coin-sized spot'),
    paperPanel(A(spot(0.35) + bubbles([[136, 96, 7], [160, 112, 6], [146, 122, 5]])) + clock(255, 30, 20), V, '3', 'Wear it, wash it off'),
    paperPanel(A('') + clock(95, 30, 20) + clock(205, 30, 20) + label(95, 186, '24 h', { size: 22, bold: true, halo: false }) + label(205, 186, '48 h', { size: 22, bold: true, halo: false }), V, '4', 'Check 24 h and 48 h'),
    paperPanel(A(tick(SPOT[0], SPOT[1] + 6, 40)), V, 'Done', 'No reaction: OK'),
  ], { pw: 200, gap: 36 });
}
{
  const V = [0, 0, 300, 200];
  strip('m01-l03-reaction', 'Reading the patch test. OK: the skin looks the same as the rest of the arm, so you can use the product. Stop: a red, raised, itchy or swollen patch, so wash it off and do not use that product.', [
    { ...paperPanel(forearm('medium') + tick(SPOT[0], SPOT[1] + 8, 44), V, 'OK: use it', 'Skin looks the same'), labelColor: OKC },
    { ...paperPanel(forearm('medium') + rash(SPOT[0], SPOT[1], 1.2) + cross(250, 90, 30), V, 'Stop: don\'t use it', 'Red, itchy, swollen'), labelColor: BADC },
  ], { pw: 280, gap: 50, arrows: false });
}
{
  const V = [0, 0, 200, 200];
  const sk = (c = SKIN.medium) => `<rect x="0" y="0" width="200" height="200" fill="${c}"/>`;
  const cut = sk() + glow(100, 100, 70, 22, '#e03131', { opacity: 0.35 }) + line([[40, 116], [100, 96], [160, 84]], { w: 5, color: '#a61e1e' }) + line([[60, 112], [110, 96]], { w: 2, color: '#e8590c' });
  const eczema = sk() + rash(100, 100, 1.4) + Array.from({ length: 10 }, (_, i) => `<path d="M${60 + (i * 29) % 80} ${70 + (i * 41) % 60}l8 3" stroke="#fff" stroke-width="2" opacity="0.6"/>`).join('');
  const sunburn = sk() + glow(100, 100, 150, 150, '#f03e3e', { opacity: 0.55 }) + Array.from({ length: 7 }, (_, i) => `<path d="M${40 + (i * 23) % 120} ${50 + (i * 37) % 110}q6 -4 12 0q-6 6 -12 0Z" fill="#fff" opacity="0.8"/>`).join('');
  const sore = sk() + `<path d="M30 110C70 88 110 88 130 100C150 88 170 92 190 104C150 140 70 140 30 110Z" fill="#c9787a" stroke="${LINE}" stroke-width="2"/>`
    + glow(150, 82, 30, 22, '#e03131', { opacity: 0.5 }) + [[142, 80], [154, 76], [160, 86], [148, 88], [137, 89]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff4d6" stroke="#e03131" stroke-width="1.5"/>`).join('');
  const eye = sk() + glow(100, 104, 70, 34, '#e03131', { opacity: 0.4 }) + `<path d="M30 104C60 64 140 64 170 104C140 140 60 140 30 104Z" fill="#ffd8d8" stroke="${LINE}" stroke-width="2.5"/>`
    + `<path d="M50 100Q70 92 80 104M150 98Q132 92 122 106" stroke="#e03131" stroke-width="2" fill="none"/><circle cx="100" cy="102" r="20" fill="#5a4030"/><circle cx="106" cy="96" r="5" fill="#fff"/>` + drop(64, 146, 1.3);
  strip('m01-l03-no-paint', 'Never paint over: a cut or scrape, a rash or eczema, sunburn, a cold sore, or a red, sore eye. Leave that person or that area unpainted.', [
    paperPanel(cut, V, 'No', 'Cut or scrape'), paperPanel(eczema, V, 'No', 'Rash or eczema'), paperPanel(sunburn, V, 'No', 'Sunburn'),
    paperPanel(sore, V, 'No', 'Cold sore'), paperPanel(eye, V, 'No', 'Red, sore eye'),
  ], { pw: 160, gap: 22, arrows: false });
}
{
  const it = (n, x, y, text) => badge(x, y, n, { r: 13 }) + label(x + 20, y + 5, text, { size: 15, bold: true, anchor: 'start', halo: false });
  plain('m01-l03-setup', 'A clean painting space seen from above: a clean towel under the kit, soap for washing hands, paints and a white plate, clean brushes, a stack of fresh sponges, a bowl for used sponges, two cups of clean water, wipes, a bag for rubbish and a mirror.', 900, 470,
    `<rect x="20" y="20" width="860" height="430" rx="18" fill="#f4ede3" stroke="#d9cbb8" stroke-width="2"/>`
    + towel(50, 50, 560, 300)
    + palette(80, 120, [P.white, P.black, P.red, P.yellow, P.blue, P.green]) + plate(460, 120, 40)
    + brush(300, 205, 180, 200, { color: '#2b6cb0', size: 1.2 }) + brush(300, 240, 180, 200, { tip: 'flat', color: '#c05621', size: 1.2 })
    + sponge(110, 300, '#f6e7d0') + sponge(116, 288, '#f6e7d0') + sponge(122, 276, '#fbe3e8')
    + `<ellipse cx="280" cy="300" rx="56" ry="34" fill="#e9ecef" stroke="#adb5bd" stroke-width="2"/>` + sponge(280, 304, '#e8c9a8')
    + cup(420, 300) + cup(500, 300)
    + soapBar(760, 90) + wipes(760, 200)
    + `<rect x="660" y="270" width="120" height="150" rx="60" fill="#dbe4ee" stroke="#868e96" stroke-width="3"/><ellipse cx="720" cy="335" rx="44" ry="58" fill="#eef4fa"/>`
    + `<path d="M820 300L860 300L852 400H828Z" fill="#ced4da" stroke="#868e96" stroke-width="2"/>`
    + it('1', 60, 40, 'Clean towel') + it('2', 70, 175, 'Paint + plate') + it('3', 524, 222, 'Clean brushes')
    + it('4', 70, 380, 'Fresh sponges') + it('5', 230, 380, 'Used sponges') + it('6', 400, 380, 'Clean water')
    + it('7', 700, 140, 'Hand soap') + it('8', 700, 250, 'Wipes') + it('9', 680, 440, 'Mirror') + it('10', 790, 290, 'Bin'));
}

// ---------- 01.4 Water, paint and swatches ----------
{
  const V = [0, 0, 240, 240];
  const C = P.blue;
  strip('m01-l04-activate', 'Waking up a paint cake: 1 put a few drops of clean water on the cake; 2 wait about 20 seconds; 3 swirl the brush on the cake until the top turns creamy; 4 roll the brush on the plate to a point; done: paint a test line on paper, smooth and solid.', [
    paperPanel(cake(120, 140, 70, C) + drop(100, 50, 1.6) + drop(140, 36, 1.6) + drop(120, 92, 1.4) + `<ellipse cx="128" cy="150" rx="22" ry="12" fill="#ffffff" opacity="0.35"/>`, V, '1', 'A few drops of water'),
    paperPanel(cake(80, 140, 52, C) + `<ellipse cx="80" cy="140" rx="30" ry="18" fill="#ffffff" opacity="0.3"/>` + clock(178, 104, 34, '20 s'), V, '2', 'Wait 20 seconds'),
    paperPanel(cake(120, 140, 70, C) + `<ellipse cx="120" cy="140" rx="46" ry="38" fill="#4f86ea"/>` + circArrow(120, 140, 54) + brush(124, 136, -60, 150, { color: '#2b6cb0', size: 1.5 }) + paintTip(124, 136, -60, 1.5, C, 0.5), V, '3', 'Swirl until creamy'),
    paperPanel(plate(120, 140, 84) + line([[60, 112], [100, 104], [146, 118]], { w: 10, color: C, opacity: 0.45 }) + loaded(160, 124, -20, 170, C, { s: 1.6, frac: 0.75 }) + circArrow(96, 170, 22), V, '4', 'Roll to a point'),
    paperPanel(stroke([[30, 150], [90, 108], [150, 126], [212, 90]], { w: 22, color: C }) + tick(120, 200, 30), V, 'Done', 'Smooth test line'),
  ], { pw: 190, gap: 34 });
}
{
  const V = [0, 0, 240, 300];
  const C = P.red;
  const wet = cake(120, 90, 60, C) + `<ellipse cx="115" cy="92" rx="52" ry="46" fill="#ffb3b8" opacity="0.75"/><ellipse cx="100" cy="76" rx="16" ry="8" fill="#fff" opacity="0.8"/>` + drop(150, 140, 1.4, '#ff8a92')
    + stroke([[24, 220], [80, 206], [140, 222], [206, 204]], { w: 26, color: C, opacity: 0.35 }) + stroke([[30, 222], [90, 210], [150, 222]], { w: 14, color: C, opacity: 0.3 })
    + teardrop(204, 214, 90, 46, 18, C) + `<ellipse cx="204" cy="262" rx="14" ry="6" fill="${C}" opacity="0.4"/>`;
  const good = cake(120, 90, 60, C) + `<ellipse cx="120" cy="90" rx="44" ry="36" fill="#ea4a53"/>` + spiral(120, 90, 32, 1.4, { w: 5, color: '#ff8a90' })
    + stroke([[24, 222], [80, 204], [140, 222], [212, 202]], { w: 24, color: C });
  const dry = cake(120, 90, 60, C) + `<path d="M84 74l18 10M118 60l-6 22M140 98l18 -6M100 110l20 4M136 70l10 12" stroke="#a61e1e" stroke-width="3" stroke-linecap="round"/>`
    + [[0, 0], [2, 7], [-1, 13], [3, -7]].map(([dx, dy], i) => line([[24 + dx, 222 + dy], [80, 206 + dy], [140, 222 + dy], [212 - i * 8, 204 + dy]], { w: 3 - (i % 2), color: C, dash: `${18 + i * 7} ${6 + i * 3}` })).join('');
  strip('m01-l04-consistency', 'Three paint consistencies side by side. Too wet: a shiny puddle on the cake and a pale, see-through line that drips. Just right: a creamy top like melted ice cream and a smooth, solid line. Too dry: a dry, cracked cake and a scratchy, broken line.', [
    { ...paperPanel(wet + cross(210, 30, 24), V, 'Too wet', 'Runny, see-through'), labelColor: BADC },
    { ...paperPanel(good + tick(210, 30, 26), V, 'Just right', 'Like melted ice cream'), labelColor: OKC },
    { ...paperPanel(dry + cross(210, 30, 24), V, 'Too dry', 'Scratchy, broken line'), labelColor: BADC },
  ], { pw: 230, gap: 34, arrows: false });
}
{
  const V = [0, 0, 300, 220];
  const C = P.sky;
  const patchD = 'M90 84C130 70 190 70 220 80C232 104 232 136 220 156C180 162 130 162 90 150C80 128 80 104 90 84Z';
  const arm = (inner) => `<g transform="translate(0 10)">${forearm('brown')}${inner}</g>`;
  strip('m01-l04-sponge', 'Loading and using a sponge: 1 wet the sponge and squeeze it almost dry; 2 rub it on the paint cake; 3 dab off the extra paint on the plate; 4 dab, don’t wipe, on the arm; done: an even, soft patch of color.', [
    paperPanel(sponge(150, 100, '#f6e7d0') + drop(130, 150, 1.4) + drop(160, 168, 1.2) + drop(146, 194, 1) + arrow([[60, 96], [100, 96]], { width: 3 }) + arrow([[240, 96], [200, 96]], { width: 3 }), V, '1', 'Damp, not wet'),
    paperPanel(cake(150, 140, 62, C) + sponge(150, 80, '#f6e7d0') + arrow([[90, 40], [150, 24], [210, 40]], { width: 3 }), V, '2', 'Rub on the cake'),
    paperPanel(plate(150, 120, 86) + stipple(circleD(130, 130, 40), C, { bbox: [80, 80, 100, 100], n: 140, r: [1.5, 3] }) + sponge(196, 92, '#d3eefb'), V, '3', 'Dab off the extra'),
    paperPanel(arm(stipple(patchD, C, { bbox: [80, 60, 160, 110], n: 170, r: [2, 3.6], opacity: 0.9 }) + sponge(236, 52, '#d3eefb')), V, '4', 'Dab, don\'t wipe'),
    paperPanel(arm(`<path d="${patchD}" fill="${C}" opacity="0.9"/>` + stipple(patchD, '#8fd3f8', { bbox: [80, 60, 160, 110], n: 120, r: [1.5, 3] })) + tick(150, 200, 22), V, 'Done', 'Even, soft patch'),
  ], { pw: 190, gap: 30 });
}
{
  const box = (x, y, color, name, water) => `<rect x="${x}" y="${y}" width="270" height="150" rx="8" fill="#fffdf8" stroke="#d6cfc4" stroke-width="2"/>`
    + label(x + 12, y + 26, `Color: ${name}`, { size: 15, bold: true, anchor: 'start', halo: false })
    + `<rect x="${x + 14}" y="${y + 40}" width="104" height="72" rx="4" fill="#efe7da"/><rect x="${x + 20}" y="${y + 46}" width="92" height="60" rx="10" fill="${color}"${color === P.white ? ` stroke="#ced4da"` : ''}/>`
    + (color === P.white ? stroke([[x + 137, y + 62], [x + 180, y + 50], [x + 253, y + 60]], { w: 13, color: '#ced4da' }) : '')
    + stroke([[x + 138, y + 62], [x + 180, y + 50], [x + 252, y + 60]], { w: 10, color })
    + dot(x + 195, y + 94, 9, color) + (color === P.white ? `<circle cx="${x + 195}" cy="${y + 94}" r="9" fill="none" stroke="#ced4da"/>` : '')
    + label(x + 12, y + 138, `Water: ${water}`, { size: 14, color: SOFT, anchor: 'start', halo: false });
  plain('m01-l04-swatch-card', 'A filled-in swatch card: six boxes for white, black, red, yellow, blue and green. Each has a swatch, a line and a dot, and a note of how much water the color needed.', 900, 360,
    box(20, 20, P.white, 'white', 'little') + box(315, 20, P.black, 'black', 'some') + box(610, 20, P.red, 'red', 'some')
    + box(20, 190, P.yellow, 'yellow', 'little, 2 layers') + box(315, 190, P.blue, 'blue', 'some') + box(610, 190, P.green, 'green', 'some'));
}

// ---------- 01.5 Removal and cleaning ----------
{
  const flower = (op = 1) => `<g opacity="${op}">${[0, 72, 144, 216, 288].map((a) => petal(130, 300, a - 90, 34, 22, P.pink)).join('')}${dot(130, 300, 8, P.yellow)}${dots([[160, 262], [178, 280], [184, 304]], 4, 4, 2, P.white)}</g>`;
  const V = [60, 160, 280, 260];
  const fp = (under, over, lab, cap) => ({ ...facePanel({ skin: 'deep', under, over, view: V }), label: lab, caption: cap });
  strip('m01-l05-remove', 'Taking face paint off: 1 wet the painted area with warm water; 2 rub in mild soap with small circles; 3 rinse or wipe the paint away; 4 wipe leftover color with a baby wipe or micellar water on a cotton pad; done: clean skin, patted dry.', [
    fp(flower(), drop(96, 254, 1.6) + drop(176, 336, 1.6) + drop(104, 346, 1.4), '1', 'Warm water'),
    fp(flower(0.7), bubbles([[112, 284, 9], [140, 318, 8], [150, 280, 6], [120, 326, 6], [100, 304, 5]]) + circArrow(130, 300, 46), '2', 'Soap, small circles'),
    fp(flower(0.22), arrow([[150, 270], [150, 330]], { width: 3 }) + drop(110, 300, 1.6) + drop(126, 330, 1.4), '3', 'Rinse or wipe'),
    fp(flower(0.08), pad(146, 312, 24) + arrow([[118, 290], [140, 300]], { width: 3 }), '4', 'Wipe leftovers'),
    fp('', '', 'Done', 'Pat dry'),
  ], { pw: 190, gap: 30 });
}
{
  const V = [72, 160, 170, 130];
  const swoosh = (op = 1) => `<g opacity="${op}">${stroke([[180, 210], [150, 196], [118, 206], [100, 186]], { w: 14, color: P.sky })}${stroke([[176, 244], [148, 250], [116, 238]], { w: 6, color: P.violet })}</g>`;
  const fp = (under, over, lab, cap) => ({ ...facePanel({ skin: 'deep', eyes: 'closed', under, over, view: V }), label: lab, caption: cap });
  strip('m01-l05-eye', 'Around the eyes, with eyes closed: 1 press a soaked cotton pad on the closed eye and hold it while you count to ten; 2 wipe gently outward, from the nose side toward the ear, once; done: the paint is gone with no rubbing.', [
    fp(swoosh(), pad(146, 222, 24) + clock(212, 268, 12) , '1', 'Press, count to 10'),
    fp(swoosh(0.3), pad(104, 222, 18) + arrow([[184, 252], [150, 258], [100, 248]], { width: 3.5 }), '2', 'Wipe outward, once'),
    fp('', tick(150, 262, 18), 'Done', 'No rubbing'),
  ], { pw: 220, gap: 40 });
}
{
  const row = (y, items, mark) => items.map(([x, pic, a, b]) => pic + label(x, y + 76, a, { size: 15, bold: true, halo: false }) + (b ? label(x, y + 96, b, { size: 13, color: SOFT, halo: false }) : '') + mark(x + 62, y - 34)).join('');
  plain('m01-l05-removers', 'What to take paint off with. Use: soap and warm water, micellar water, a gentle oil cleanser, fragrance-free baby wipes. Never on the face: rubbing alcohol, acetone or nail polish remover, solvent removers such as spirit gum remover.', 920, 450,
    label(30, 44, 'Use', { size: 20, bold: true, color: OKC, anchor: 'start', halo: false })
    + row(110, [
      [120, soapBar(120, 110) + drop(90, 70, 1.3) + drop(150, 66, 1.1), 'Soap + warm water', 'water-based paint'],
      [330, bottle(310, 106, '#e7f5ff', '#74c0fc') + pad(358, 130, 18), 'Micellar water', 'strong colors'],
      [560, bottle(560, 106, '#fff4e6', '#f08c00', { pump: true }), 'Oil cleanser', 'cream paint, eye area'],
      [780, wipes(780, 110), 'Baby wipes', 'fragrance-free'],
    ], (x, y) => tick(x, y, 20))
    + `<line x1="20" y1="232" x2="900" y2="232" stroke="#e3ddd5" stroke-width="2"/>`
    + label(30, 270, 'Never on the face', { size: 20, bold: true, color: BADC, anchor: 'start', halo: false })
    + row(320, [
      [330, bottle(330, 316, '#f8f9fa', '#1971c2', { h: 96, w: 42 }), 'Rubbing alcohol', ''],
      [580, bottle(580, 316, '#fff0f6', '#c2255c', { h: 84, w: 46 }), 'Acetone, nail polish', 'remover'],
      [820, bottle(820, 316, '#f4fce3', '#5c940d', { h: 90, w: 40 }), 'Solvent removers', 'like spirit gum remover'],
    ], (x, y) => cross(x, y, 22)));
}
{
  const V = [0, 0, 240, 220];
  const bigCup = (x, y, clean = true) => `<g transform="translate(${x} ${y}) scale(1.6) translate(${-x} ${-y})">${cup(x, y, { clean })}</g>`;
  const palm = `<ellipse cx="120" cy="140" rx="86" ry="54" fill="${SKIN.light}" stroke="${LINE}" stroke-width="2"/><path d="M60 128Q100 150 160 120" fill="none" stroke="${LINE}" stroke-width="1.2" opacity="0.4"/>`;
  const tap = `<path d="M240 26H148V44H152V60H172V44H240Z" fill="#adb5bd" stroke="#868e96" stroke-width="2"/>`;
  strip('m01-l05-clean-tools', 'Cleaning brushes (1 to 4): rinse in water; swirl the tip on soap in your palm; rinse until the water runs clear; reshape the tip to a point. Cleaning sponges (5 to 8): rinse; soap and squeeze; rinse until clear; squeeze in a towel and let it air-dry.', [
    paperPanel(bigCup(120, 140, false) + brush(120, 150, 90, 190, { color: '#2b6cb0', size: 1.5 }), V, '1', 'Rinse brush'),
    paperPanel(palm + bubbles([[100, 132, 8], [130, 150, 7], [150, 126, 6], [86, 152, 5]]) + brush(122, 140, 70, 160, { color: '#2b6cb0', size: 1.5 }) + circArrow(122, 140, 30), V, '2', 'Soap in your palm'),
    paperPanel(tap + drop(162, 78, 1.2) + drop(162, 100, 1.2) + brush(162, 136, 60, 140, { color: '#2b6cb0', size: 1.5 }) + drop(168, 178, 1, '#cfe8f7') + drop(184, 196, 1, '#cfe8f7'), V, '3', 'Until water is clear'),
    paperPanel(brush(40, 110, 180, 180, { color: '#2b6cb0', size: 1.8 }) + sparkle(30, 92, 10, P.yellow) + arrow([[60, 70], [50, 96]], { width: 3 }) + arrow([[60, 150], [50, 124]], { width: 3 }), V, '4', 'Shape the tip'),
    paperPanel(bigCup(120, 140, false) + sponge(120, 120, '#e8c9a8'), V, '5', 'Rinse sponge'),
    paperPanel(sponge(120, 110, '#f6e7d0') + bubbles([[96, 96, 8], [130, 90, 7], [148, 108, 6], [104, 116, 5]]) + arrow([[30, 104], [70, 104]], { width: 3 }) + arrow([[210, 104], [170, 104]], { width: 3 }), V, '6', 'Soap and squeeze'),
    paperPanel(tap + sponge(160, 150, '#f6e7d0') + drop(162, 84, 1.2) + drop(162, 108, 1.2) + drop(142, 196, 1, '#cfe8f7') + drop(182, 200, 1, '#cfe8f7'), V, '7', 'Until water is clear'),
    paperPanel(towel(30, 120, 180, 70) + sponge(90, 140, '#f6e7d0') + sponge(160, 140, '#fbe3e8') + arrow([[60, 40], [70, 90]], { width: 2.5, color: '#adb5bd', dash: '6 6' }) + arrow([[180, 40], [170, 90]], { width: 2.5, color: '#adb5bd', dash: '6 6' }), V, '8', 'Air-dry'),
  ], { cols: 4, pw: 200, gap: 34 });
}
{
  const V = [0, 0, 240, 220];
  const bag = `<path d="M50 70H190V190Q120 206 50 190Z" fill="#e7f5ff" fill-opacity="0.7" stroke="#74c0fc" stroke-width="2.5"/><path d="M50 82H190" stroke="#4dabf7" stroke-width="5"/>`;
  strip('m01-l05-drying', 'Drying the tools. Good: brushes lying flat on a towel. Avoid: brushes left standing tip-down in the water cup, which bends the tip. Good: sponges drying in the open air. Avoid: wet sponges shut in a bag or box.', [
    paperPanel(towel(20, 120, 200, 60) + brush(40, 130, 180, 180, { color: '#2b6cb0', size: 1.3 }) + brush(40, 160, 180, 180, { tip: 'flat', color: '#c05621', size: 1.3 }) + tick(200, 60, 26), V, 'Good', 'Flat on a towel'),
    paperPanel(`<g transform="translate(120 140) scale(1.6) translate(-120 -140)">${cup(120, 140, { clean: false })}</g>` + `<path d="M98 186Q112 184 122 194L100 150" fill="none"/>` + brush(110, 184, 70, 190, { color: '#2b6cb0', size: 1.4 }) + `<path d="M110 184Q126 186 138 178" stroke="#3b2f2a" stroke-width="7" stroke-linecap="round" fill="none"/>` + cross(200, 60, 26), V, 'Avoid', 'Tip down in water'),
    paperPanel(towel(20, 140, 200, 50) + sponge(80, 150, '#f6e7d0') + sponge(160, 150, '#fbe3e8') + tick(200, 60, 26), V, 'Good', 'Sponges in open air'),
    paperPanel(bag + sponge(100, 160, '#e8c9a8') + sponge(150, 166, '#d9c2a5') + drop(90, 120, 1, '#74c0fc') + drop(150, 112, 1, '#74c0fc') + cross(206, 40, 26), V, 'Avoid', 'Wet, shut in a bag'),
  ], { pw: 200, gap: 30, arrows: false });
}

void SOFT; void dot; void teardrop; void facePanel;
console.log('m01 assets written');
