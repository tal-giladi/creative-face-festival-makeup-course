// Module 6 diagrams (Glitter, Gems and Neon) and the project pictures P7-P8.
// Run: node curriculum/tools/assets-m06.mjs
import { plain, strip, paperPanel, faceLayer } from './lib/figure.mjs';
import { P, SOFT, INK, OK, BAD, label, arrow, badge, tick, cross, line, stroke, teardrop, dot, dots, star, sparkle, sponge, glow, glitter, gem, pol, spline, polyD, rng } from './lib/art.mjs';
import { SKIN, BODY } from './lib/face.mjs';

const K = P.black, W = P.white;
const n1 = (v) => (Math.round(v * 10) / 10).toString();

// ---------- local helpers (not in the shared lib) ----------
const MIR = (c) => `<g transform="translate(400 0) scale(-1 1)">${c}</g>`;
const sym = (c) => c + MIR(c);
const bad = (p) => ({ ...p, labelColor: BAD });
const good = (p) => ({ ...p, labelColor: OK });
let uid = 0;
const clipTo = (d, content) => { const id = `m6c${uid++}`; return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id})">${content}</g>`; };
const ell = (cx, cy, rx, ry) => { const k = 0.5523; return `M${cx + rx} ${cy}C${cx + rx} ${n1(cy + ry * k)} ${n1(cx + rx * k)} ${cy + ry} ${cx} ${cy + ry}C${n1(cx - rx * k)} ${cy + ry} ${cx - rx} ${n1(cy + ry * k)} ${cx - rx} ${cy}C${cx - rx} ${n1(cy - ry * k)} ${n1(cx - rx * k)} ${cy - ry} ${cx} ${cy - ry}C${n1(cx + rx * k)} ${cy - ry} ${cx + rx} ${n1(cy - ry * k)} ${cx + rx} ${cy}Z`; };
// A closed band between two splines (outer and inner edge, same direction).
const band = (a, b) => polyD([...spline(a, 14), ...spline(b, 14).reverse()], true);

// Face panel / figure: paint under the features, gems and glitter over them.
const FACEV = [70, 60, 260, 380];
const fpanel = (under, { skin = 'light', eyes = 'open', over = '', view = FACEV, brows = true } = {}, lab, cap) =>
  ({ content: faceLayer({ under, over, skin, eyes, brows }), view, label: lab, caption: cap });
const embed = (content, [vx, vy, vw, vh], x, y, w, h, { bg = '#fbf8f4', frame = true } = {}) =>
  (frame ? `<rect x="${x - 1}" y="${y - 1}" width="${w + 2}" height="${h + 2}" rx="8" fill="#fff" stroke="#e3ddd5"/>` : '')
  + `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${bg}"/>${content}</svg>`;
const faceOnly = (name, title, under, { skin = 'light', eyes = 'open', over = '', view = FACEV, scale = 1.25, brows = true, bg = '#fbf8f4' } = {}) => {
  const [vx, vy, vw, vh] = view;
  plain(name, title, Math.round(vw * scale), Math.round(vh * scale),
    `<svg width="${Math.round(vw * scale)}" height="${Math.round(vh * scale)}" viewBox="${vx} ${vy} ${vw} ${vh}"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${bg}"/>${faceLayer({ under, over, skin, eyes, brows })}</svg>`);
};

// Hatched "no-go" zone (red stripes on a pale red wash, dashed edge).
const hatchDef = (id, color = BAD) => `<defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="9" height="9" patternTransform="rotate(45)"><rect width="9" height="9" fill="${color}" opacity="0.12"/><line x1="0" y1="0" x2="0" y2="9" stroke="${color}" stroke-width="3" opacity="0.55"/></pattern></defs>`;
const noGo = (d, color = BAD) => { const id = `hz${uid++}`; return hatchDef(id, color) + `<path d="${d}" fill="url(#${id})" stroke="${color}" stroke-width="2" stroke-dasharray="5 4"/>`; };
// Green "yes" zone.
const yesZone = (d, color = OK) => `<path d="${d}" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="2" stroke-dasharray="5 4"/>`;

// Eye zones. Small: lid, lash line and the skin right under the eye (glitter and gems stay off).
// Large: the whole eye area, brows to under-eye (neon, UV and glow stay off).
const EYE_S = ell(150, 224, 40, 26) + ell(250, 224, 40, 26);
const EYE_L = ell(150, 226, 46, 42) + ell(250, 226, 46, 42);
const LIPS = ell(200, 354, 40, 20);

// Glitter base gel: a clear, shiny layer.
const gel = (d) => `<path d="${d}" fill="#ffffff" fill-opacity="0.38" stroke="#ffffff" stroke-opacity="0.9" stroke-width="1.6"/>`;
// Dense glitter fill clipped to d. bbox from the path's rough extent.
const GL = {
  gold: [P.gold, '#f7d774', '#fff3b0', '#c9962a'],
  silver: ['#e9ecef', P.silver, '#ffffff', '#a5b4c8'],
  holo: ['#b197fc', '#74c0fc', '#ffffff', '#f783ac', '#c0eb75'],
  pink: ['#f783ac', '#ffc9e0', '#ffffff', P.magenta],
  blue: ['#74c0fc', '#4dabf7', '#ffffff', '#b197fc'],
};
const glit = (d, bbox, colors, n = 260, seed = 7, size = [1.2, 2.8]) => glitter(d, bbox, { colors, n, seed, size });

// Neon glow filter (under black light).
const glowDef = (id, s = 3) => `<defs><filter id="${id}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="${s}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
const glowing = (content, s = 3) => { const id = `ng${uid++}`; return glowDef(id, s) + `<g filter="url(#${id})">${content}</g>`; };
const UVBG = '#140c2b', UVSKIN = '#2c2342';
// A face under black light: skin and lips go dark, eye whites glow a little, neon glows.
const uvLayer = (neon, dark = '') => faceLayer({ under: dark + glowing(neon), skin: UVSKIN, eyes: 'open' })
  .replace(/#c9787a/g, '#3e2a45').replace(/#d98b8c/g, '#46304d').replace(/fill="#fff"/g, 'fill="#cfc8ff"').replace(/#5b4636/g, '#4b3f66').replace(/#6b4c35/g, '#241c33');

// Little white shine comma.
const shine = (x, y, deg, len = 10, w = 3) => stroke([[x, y], pol(x, y, len * 0.5, deg), pol(...pol(x, y, len, deg), len * 0.2, deg + 90)], { w, color: W });

// Text block helper for cards (lines of text, top-left anchored).
const textLines = (x, y, lines, { size = 14, gap = 19, color = INK, bold = false } = {}) => lines.map((t, i) => label(x, y + i * gap, t, { size, color, anchor: 'start', halo: false, bold: bold && i === 0 })).join('');

// ===================================================================================
// 06.1 Cosmetic glitter, craft glitter and bio glitter (medium skin)
// ===================================================================================

// A jar of glitter: body, lid, glitter inside, a front label.
function jar(x, y, colors, { title = [], seed = 3, size = [2, 3.8], n = 1500, lid = '#495057', chunky = false } = {}) {
  const w = 120, h = 130;
  const body = `M${x} ${y + 26}Q${x} ${y + 18} ${x + 8} ${y + 18}H${x + w - 8}Q${x + w} ${y + 18} ${x + w} ${y + 26}V${y + h - 10}Q${x + w} ${y + h} ${x + w - 10} ${y + h}H${x + 10}Q${x} ${y + h} ${x} ${y + h - 10}Z`;
  const fillD = `M${x + 2} ${y + 40}H${x + w - 2}V${y + h - 2}H${x + 2}Z`;
  const flakes = chunky
    ? (() => { const r = rng(seed); let o = ''; for (let i = 0; i < 70; i++) { const cx = x + 6 + r() * (w - 12), cy = y + 44 + r() * (h - 50), s = 4 + r() * 4; o += `<path d="${polyD(Array.from({ length: 6 }, (_, k) => pol(cx, cy, s, k * 60 + r() * 30)), true)}" fill="${colors[Math.floor(r() * colors.length)]}" stroke="rgba(0,0,0,0.25)" stroke-width="0.6"/>`; } return clipTo(fillD, o); })()
    : glit(fillD, [x, y + 38, w, h - 38], colors, n, seed, size);
  return `<path d="${body}" fill="#f1f3f5" stroke="#868e96" stroke-width="2"/>` + flakes
    + `<rect x="${x + 6}" y="${y}" width="${w - 12}" height="20" rx="4" fill="${lid}"/>`
    + `<rect x="${x + 12}" y="${y + 58}" width="${w - 24}" height="${16 + title.length * 15}" rx="4" fill="#ffffff" stroke="#ced4da"/>`
    + title.map((t, i) => label(x + w / 2, y + 74 + i * 15, t, { size: 13, halo: false, bold: i === 0 })).join('')
    + `<path d="M${x + 8} ${y + 30}V${y + h - 16}" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.6"/>`;
}
// Magnified flakes in a circle.
function magnifier(cx, cy, r, kind, seed = 5) {
  const rr = rng(seed); let o = '';
  if (kind === 'fine') for (let i = 0; i < 46; i++) { const x = cx - r + rr() * 2 * r, y = cy - r + rr() * 2 * r, s = 3 + rr() * 3; o += `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(s)}" fill="${['#f7d774', '#ffffff', '#c9962a', '#b197fc'][Math.floor(rr() * 4)]}" stroke="rgba(0,0,0,0.2)"/>`; }
  else if (kind === 'cellulose') for (let i = 0; i < 40; i++) { const x = cx - r + rr() * 2 * r, y = cy - r + rr() * 2 * r, s = 4 + rr() * 3; o += `<path d="${polyD(Array.from({ length: 7 }, (_, k) => pol(x, y, s * (0.8 + rr() * 0.4), k * 51)), true)}" fill="${['#f783ac', '#ffc9e0', '#fcc2d7', '#e599f7'][Math.floor(rr() * 4)]}" stroke="rgba(0,0,0,0.2)"/>`; }
  else for (let i = 0; i < 14; i++) { const x = cx - r + rr() * 2 * r, y = cy - r + rr() * 2 * r, s = 9 + rr() * 6; o += `<path d="${polyD(Array.from({ length: 6 }, (_, k) => pol(x, y, s, k * 60 + 15)), true)}" fill="${['#adb5bd', '#ced4da', '#74c0fc', '#e9ecef'][Math.floor(rr() * 4)]}" stroke="#495057" stroke-width="1.2"/>`; }
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff"/>` + clipTo(ell(cx, cy, r, r), o)
    + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#495057" stroke-width="4"/>`
    + `<path d="M${n1(cx + r * 0.72)} ${n1(cy + r * 0.72)}l20 20" stroke="#495057" stroke-width="8" stroke-linecap="round"/>`;
}
plain('m06-l01-three-glitters', 'Three kinds of glitter. Cosmetic glitter, sold for face and body, with fine, smooth flakes: yes for skin, away from the eyes. Plant-cellulose bio glitter sold as a cosmetic, with soft plant-based flakes: yes for skin and lower-impact, but not harmless to nature. Craft glitter, sold for crafts with no ingredient list, with bigger, hard, sharp-edged flakes: never on skin.', 720, 400,
  jar(40, 40, GL.holo, { title: ['Cosmetic', 'glitter'], seed: 11 }) + magnifier(100, 262, 46, 'fine')
  + jar(300, 40, GL.pink, { title: ['Bio glitter', '(cellulose)'], seed: 12, lid: '#2f9e44' }) + magnifier(360, 262, 46, 'cellulose')
  + jar(560, 40, ['#adb5bd', '#74c0fc', '#ced4da', '#e9ecef'], { title: ['Craft', 'glitter'], chunky: true, seed: 13, lid: '#868e96' }) + magnifier(620, 262, 46, 'craft')
  + tick(100, 352, 18) + label(100, 384, 'Skin: yes', { size: 15, bold: true, color: OK })
  + tick(360, 352, 18) + label(360, 384, 'Skin: yes, lower-impact', { size: 15, bold: true, color: OK })
  + cross(620, 352, 18) + label(620, 384, 'Never on skin', { size: 15, bold: true, color: BAD }));

// How to read a glitter label: a back label with numbered checks.
function card(x, y, w, h, lines, { head = null, headColor = '#495057', border = '#ced4da' } = {}) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#ffffff" stroke="${border}" stroke-width="2"/>`
    + (head ? `<path d="M${x} ${y + 10}Q${x} ${y} ${x + 10} ${y}H${x + w - 10}Q${x + w} ${y} ${x + w} ${y + 10}V${y + 34}H${x}Z" fill="${headColor}"/>` + label(x + w / 2, y + 23, head, { size: 15, color: '#fff', bold: true, halo: false }) : '')
    + lines;
}
const LBL_X = 40, LBL_Y = 30;
plain('m06-l01-label', 'Reading a glitter label in four checks. 1: it says cosmetic glitter for face and body. 2: it has an ingredient list. 3: the flakes are made of cellulose, a plant material, with mica and color CI numbers; a plastic glitter would say polyethylene terephthalate or PET. 4: the warning says avoid the eye area.', 720, 420,
  card(LBL_X, LBL_Y, 400, 360,
    textLines(LBL_X + 22, LBL_Y + 62, ['Cosmetic glitter', 'for face and body'], { size: 17, bold: true, gap: 22 })
    + textLines(LBL_X + 22, LBL_Y + 130, ['Ingredients:', 'Cellulose, Mica (CI 77019),', 'Titanium dioxide (CI 77891),', 'Iron oxides (CI 77491)'], { size: 14, gap: 20 })
    + textLines(LBL_X + 22, LBL_Y + 236, ['Warning: avoid the eye area.', 'Patch test before use.', 'Keep away from small children.'], { size: 14, gap: 20 })
    + textLines(LBL_X + 22, LBL_Y + 320, ['Made in the EU · 5 g'], { size: 13, color: SOFT }),
    { head: 'BACK OF THE JAR' })
  + badge(LBL_X + 376, LBL_Y + 66, '1', { r: 14 }) + badge(LBL_X + 376, LBL_Y + 114, '2', { r: 14 }) + badge(LBL_X + 376, LBL_Y + 148, '3', { r: 14 }) + badge(LBL_X + 376, LBL_Y + 232, '4', { r: 14 })
  + `<rect x="${LBL_X + 16}" y="${LBL_Y + 135}" width="${74}" height="22" rx="4" fill="none" stroke="#d6336c" stroke-width="2"/>`
  + `<rect x="${LBL_X + 16}" y="${LBL_Y + 217}" width="${206}" height="22" rx="4" fill="none" stroke="#d6336c" stroke-width="2"/>`
  + textLines(480, 70, ['1  Sold for skin?', '   "Cosmetic", "face and body"'], { size: 15, gap: 20, bold: true })
  + textLines(480, 140, ['2  Ingredient list?', '   No list: not for skin'], { size: 15, gap: 20, bold: true })
  + textLines(480, 210, ['3  What are the flakes?', '   Cellulose: plant-based', '   PET / polyester: plastic'], { size: 15, gap: 20, bold: true })
  + textLines(480, 300, ['4  Where may it go?', '   Read every warning'], { size: 15, gap: 20, bold: true }));

// EU timeline
const TX = (yr) => 70 + (yr - 2023) * 50;
const tl = [
  [2023, 'Oct 2023', ['Loose plastic', 'craft glitter', 'banned from sale'], BAD],
  [2027, 'Oct 2027', ['Last date: plastic', 'glitter in rinse-off', 'cosmetics'], '#f08c00'],
  [2029, 'Oct 2029', ['Last date:', 'leave-on', 'cosmetics'], '#f08c00'],
  [2031, 'Oct 2031', ['Make-up must say', '"contains', 'microplastics"'], '#1c7ed6'],
  [2035, 'Oct 2035', ['Last date: make-up,', 'lip and nail', 'products'], '#f08c00'],
];
const TLY = 196;
plain('m06-l01-eu-timeline', 'EU microplastics restriction 2023/2055 and glitter. October 2023: loose plastic glitter for crafts, toys and similar uses banned from sale. Cosmetics with plastic glitter get longer: rinse-off products until 16 October 2027, leave-on products until 16 October 2029, make-up, lip and nail products until 16 October 2035, labeled as containing microplastics from 17 October 2031. Not covered: glitter that is biodegradable, water-soluble, natural, or inorganic such as glass, metal or mica.', 760, 440,
  label(380, 34, 'EU rules on plastic glitter (Regulation 2023/2055)', { size: 17, bold: true })
  + `<path d="M40 ${TLY}H730" stroke="#adb5bd" stroke-width="6" stroke-linecap="round"/>`
  + tl.map(([yr, t, lines, c], i) => {
    const x = TX(yr) + 10;
    const up = i % 2 === 0;
    const ty = up ? TLY - 30 - 17 * lines.length - 18 : TLY + 58;
    return `<circle cx="${x}" cy="${TLY}" r="11" fill="${c}"/>` + `<path d="M${x} ${up ? TLY - 12 : TLY + 12}V${up ? TLY - 24 : TLY + 24}" stroke="${c}" stroke-width="2"/>`
      + label(x, up ? TLY - 30 : TLY + 42, t, { size: 15, bold: true, color: c })
      + lines.map((s, k) => label(x, ty + k * 17, s, { size: 13.5, halo: false })).join('');
  }).join('')
  + `<rect x="40" y="340" width="680" height="78" rx="10" fill="#ebfbee" stroke="#2f9e44" stroke-width="2"/>`
  + label(380, 368, 'Not covered: glitter that is biodegradable, water-soluble,', { size: 15, halo: false })
  + label(380, 392, 'natural, or inorganic (glass, metal, mica)', { size: 15, halo: false }));

// Arm patch test with glitter base and glitter (medium skin, inner forearm)
const ARMV = [0, 0, 220, 130];
const forearm = (content, skin = 'medium') => {
  const d = 'M-10 30C60 22 150 22 230 34V104C150 116 60 112 -10 104Z';
  return `<path d="${d}" fill="${SKIN[skin]}" stroke="#5b4636" stroke-width="2"/>` + clipTo(d, content) + `<path d="M30 68C70 62 120 64 170 70" stroke="#8a7462" stroke-width="1.2" fill="none" opacity="0.5"/>`;
};
const spotA = ell(70, 68, 24, 18), spotB = ell(150, 68, 24, 18);
strip('m06-l01-arm-test', 'Patch test for glitter on the inner forearm, medium skin. 1: dab a coin-sized spot of glitter base, and a second spot for a second product. 2: pat cosmetic glitter onto each spot with a fingertip. 3: wear it as long as you would wear a design, then wash it off. Done: check the skin over 24 to 48 hours; no redness, itching or swelling means that product passed.', [
  paperPanel(forearm(gel(spotA) + gel(spotB)), ARMV, '1', 'Base spots'),
  paperPanel(forearm(gel(spotA) + glit(spotA, [44, 48, 52, 40], GL.holo, 120, 4) + gel(spotB) + glit(spotB, [124, 48, 52, 40], GL.pink, 120, 5)), ARMV, '2', 'Pat on glitter'),
  paperPanel(forearm(glow(70, 68, 22, 16, '#ffffff', { opacity: 0.25 }) + glow(150, 68, 22, 16, '#ffffff', { opacity: 0.25 })) + label(110, 22, 'wash off', { size: 14, color: SOFT, halo: false }), ARMV, '3', 'Wear, then wash'),
  good(paperPanel(forearm('') + tick(70, 72, 18) + tick(150, 72, 18) + label(110, 22, '24-48 hours', { size: 14, color: SOFT, halo: false }), ARMV, 'Done', 'No reaction: OK')),
], { pw: 190, gap: 32 });

// ===================================================================================
// 06.2 Applying glitter that stays put (deep skin)
// ===================================================================================
// Cheekbone crescent (left side of the picture): from the temple down along the cheekbone.
const CRESC_OUT = [[116, 150], [101, 178], [96, 210], [99, 242], [112, 268], [138, 286], [174, 292]];
const CRESC_IN = [[116, 150], [110, 180], [107, 210], [110, 240], [124, 260], [148, 270], [174, 292]];
const CRESC = band(CRESC_OUT, CRESC_IN);
const CRESC_BB = [88, 150, 90, 140];
// Dense glitter: a tint of the glitter color under many flakes, so it reads as solid sparkle.
const glitFill = (d, bbox, colors, n, seed, tint = colors[0]) => `<path d="${d}" fill="${tint}" fill-opacity="0.55"/>` + glit(d, bbox, colors, n, seed, [1.6, 3.4]);
const crescGlitter = (colors, seed = 21, n = 2200) => glitFill(CRESC, CRESC_BB, colors, n, seed);
// Chunky accent glitter along the outer edge.
const chunky = (pts, colors, seed = 2, n = 16) => { const r = rng(seed), c = spline(pts, 8); let o = ''; for (let i = 0; i < n; i++) { const p = c[Math.floor(r() * c.length)], s = 2.4 + r() * 2.6; o += `<path d="${polyD(Array.from({ length: 6 }, (_, k) => pol(p[0] + (r() - 0.5) * 6, p[1] + (r() - 0.5) * 6, s, k * 60 + r() * 30)), true)}" fill="${colors[Math.floor(r() * colors.length)]}" stroke="rgba(0,0,0,0.25)" stroke-width="0.5"/>`; } return o; };
const CHV = { skin: 'deep', view: [76, 140, 130, 160] };
const g2Stage = (s) => [
  s >= 1 && gel(CRESC),
  s >= 2 && crescGlitter(GL.silver),
  s >= 4 && chunky(CRESC_OUT.slice(1, 6), ['#b197fc', '#74c0fc', '#ffffff'], 4, 18),
  s >= 5 && sparkle(104, 170, 7) + sparkle(160, 296, 5),
].filter(Boolean).join('');
// Clean fluffy brush tapping (head at x, y, handle going out to the left).
const fluffy = (x, y, deg = 200) => `<g transform="translate(${x} ${y}) rotate(${deg})"><rect x="14" y="-3.5" width="60" height="7" rx="3" fill="#343a40"/><rect x="8" y="-6" width="10" height="12" fill="#adb5bd"/><path d="M9 -7C-4 -16 -16 -8 -16 0C-16 8 -4 16 9 7Z" fill="#f1f3f5" stroke="#868e96" stroke-width="1.2"/></g>`;
const tap = (x, y) => fluffy(x, y);
const fingertip = (x, y, deg = -40) => `<g transform="translate(${x} ${y}) rotate(${deg}) scale(0.75)"><path d="M-9 0C-9 -12 9 -12 9 0V60H-9Z" fill="#d9a77f" stroke="#5b4636" stroke-width="1.6"/><path d="M-6 -2C-6 -8 6 -8 6 -2" fill="#f1d3c2" stroke="#8a7462" stroke-width="1"/></g>`;
strip('m06-l02-cheek-steps', 'Glitter on the cheekbone in five steps, deep skin. 1: brush a thin crescent of glitter gel or base from the temple down along the cheekbone, well away from the eye. 2: pat silver cosmetic glitter onto the base with a fingertip or a flat brush; press, don\'t rub. 3: tap off the loose flakes with a clean fluffy brush, eyes closed. 4: press a few bigger flakes along the outer edge. Done: the glitter stays inside the base, nothing near the eye.', [
  fpanel(g2Stage(1), CHV, '1', 'Thin base'),
  fpanel(g2Stage(2) , { ...CHV, over: fingertip(150, 268, -50) }, '2', 'Pat glitter on'),
  fpanel(g2Stage(2), { ...CHV, eyes: 'closed', over: tap(104, 236) }, '3', 'Tap off, eyes closed'),
  fpanel(g2Stage(4), CHV, '4', 'Bigger flakes'),
  fpanel(g2Stage(5), CHV, 'Done', 'Stays put'),
], { pw: 170, gap: 30 });

// Placement map: where glitter goes and the no-go zones.
const hairD = 'M92 196C80 130 116 46 200 44C284 46 320 130 308 196C304 172 298 158 292 150C278 102 240 88 200 88C160 88 122 102 108 150C102 158 96 172 92 196Z';
const partLine = [[200, 46], [198, 60], [201, 74], [199, 88]];
const HAIRLINE = band([[110, 150], [124, 110], [160, 90], [200, 86]], [[118, 154], [132, 118], [164, 100], [200, 96]]);
const FORE = ell(200, 132, 12, 12);
const zonesGlitter = sym(yesZone(CRESC) + yesZone(HAIRLINE)) + yesZone(FORE);
const BODYD = 'M160 40C158 80 160 110 168 130C130 140 80 150 50 175C30 192 22 240 20 300L380 300C378 240 370 192 350 175C320 150 270 140 232 130C240 110 242 80 240 40Z';
const COLLAR = band([[104, 164], [138, 154], [170, 158], [196, 172]], [[106, 186], [140, 178], [168, 182], [192, 194]]);
plain('m06-l02-placement-map', 'Where glitter goes. Green zones: a crescent along each cheekbone up to the temple, the hairline, a small spot in the center of the forehead, and the collarbones. Red hatched no-go zones: the eyelids, the lash line and the skin just under the eyes, and the lips.', 760, 480,
  embed(faceLayer({ skin: 'deep', over: zonesGlitter + noGo(EYE_S) + noGo(LIPS) + badge(124, 304, '1', { r: 12 }) + badge(150, 90, '2', { r: 12 }) + badge(228, 132, '3', { r: 12 }) }), [60, 60, 280, 380], 20, 20, 300, 410)
  + embed(`<path d="${BODYD}" fill="${SKIN.deep}" stroke="#5b4636" stroke-width="2.4"/>` + sym(yesZone(COLLAR)) + `<path d="${BODY.collarbones}" fill="none" stroke="#8a7462" stroke-width="1.6"/>` + badge(200, 230, '4', { r: 16 }), [0, 30, 400, 270], 350, 240, 300, 203)
  + label(500, 466, 'Collarbones and shoulders', { size: 15, bold: true })
  + `<rect x="566" y="40" width="22" height="22" rx="4" fill="${OK}" fill-opacity="0.25" stroke="${OK}" stroke-width="2" stroke-dasharray="5 4"/>` + label(600, 57, 'Glitter yes', { size: 15, anchor: 'start', bold: true })
  + `${hatchDef('hzkey')}<rect x="566" y="80" width="22" height="22" rx="4" fill="url(#hzkey)" stroke="${BAD}" stroke-width="2" stroke-dasharray="5 4"/>` + label(600, 97, 'No glitter', { size: 15, anchor: 'start', bold: true })
  + textLines(340, 60, ['1  Cheekbones to temples', '2  Hairline and parting', '3  Forehead center', '4  Collarbones and shoulders'], { size: 15, gap: 26 }).replace(/x="340"/g, 'x="350"')
  + textLines(350, 180, ['Not on eyelids, lash line,', 'under the eyes or lips'], { size: 15, gap: 22, color: BAD }));

// Glitter roots: hair with a center parting, glitter along the parting.
const ROOTV = [70, 30, 260, 150];
const rootGlit = (s) => { const d = band([[195, 46], [193, 60], [196, 76], [194, 92]], [[205, 46], [203, 60], [206, 76], [204, 92]]); return [s >= 1 && gel(d), s >= 2 && glit(d, [186, 40, 28, 56], GL.holo, 160, 31), s >= 3 && glit(band([[160, 96], [182, 92], [192, 92]], [[160, 102], [182, 100], [192, 98]]), [156, 88, 40, 16], GL.holo, 30, 9) + MIR(glit(band([[160, 96], [182, 92], [192, 92]], [[160, 102], [182, 100], [192, 98]]), [156, 88, 40, 16], GL.holo, 30, 10)) + sparkle(214, 58, 6) + sparkle(186, 80, 4)].filter(Boolean).join(''); };
const hairOver = (s) => `<path d="${hairD}" fill="#2b1d16"/>` + line(partLine, { w: 2.4, color: SKIN.brown }) + rootGlit(s);
strip('m06-l02-roots', 'Glitter roots in three steps. 1: part the hair and brush a thin line of glitter gel along the parting, on the hair roots and scalp line, not the forehead skin near the eyes. 2: pat holographic glitter onto the gel. Done: a little glitter where the parting meets the hairline and two sparkles.', [
  fpanel('', { skin: 'brown', over: hairOver(1), view: ROOTV }, '1', 'Gel on the parting'),
  fpanel('', { skin: 'brown', over: hairOver(2), view: ROOTV }, '2', 'Pat on glitter'),
  fpanel('', { skin: 'brown', over: hairOver(3), view: ROOTV }, 'Done', 'Roots that sparkle'),
], { pw: 210, gap: 34 });

// Pat vs rub, base vs no base, safe vs too close.
const MV = { skin: 'deep', view: [76, 160, 130, 140] };
const scatter = (seed, n = 70, box = [96, 180, 100, 110]) => { const r = rng(seed); let o = ''; for (let i = 0; i < n; i++) { const x = box[0] + r() * box[2], y = box[1] + r() * box[3], s = 1 + r() * 1.6; o += `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(s)}" height="${n1(s)}" fill="${GL.silver[i % 4]}"/>`; } return o; };
strip('m06-l02-mistakes', 'A good glitter cheekbone and three mistakes. Good: base first, glitter patted on, a crisp edge, nothing near the eye. Avoid: rubbing the glitter, so it smears thin and flakes spread over the cheek. Avoid: no base, so only a few flakes stick and the rest fall. Avoid: glitter on the eyelid and under the lashes.', [
  good(fpanel(g2Stage(4), MV, 'Good', 'Base, then pat')),
  bad(fpanel(`<g opacity="0.55">${crescGlitter(GL.silver, 22, 160)}</g>` + scatter(3, 90), MV, 'Avoid', 'Rubbed in')),
  bad(fpanel(glit(CRESC, CRESC_BB, GL.silver, 50, 23) + scatter(5, 26, [100, 270, 90, 30]), MV, 'Avoid', 'No base')),
  bad(fpanel(g2Stage(2), { ...MV, over: glit(ell(150, 208, 28, 7), [118, 198, 64, 20], GL.silver, 140, 7) + glit(ell(150, 241, 24, 4), [120, 234, 60, 14], GL.silver, 60, 8) }, 'Avoid', 'On the eyelid')),
], { pw: 170, arrows: false });

// Removal
const RV = { skin: 'deep', eyes: 'closed', view: [76, 160, 130, 140] };
const tape = (x, y, deg) => `<g transform="translate(${x} ${y}) rotate(${deg})"><rect x="-26" y="-9" width="52" height="18" rx="2" fill="#fff9db" fill-opacity="0.85" stroke="#adb5bd"/><path d="M-26 -9l4 4-4 4 4 4-4 5M26 -9l-4 4 4 4-4 4 4 5" fill="none" stroke="#adb5bd"/></g>`;
const pad = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="17" ry="14" fill="#ffffff" stroke="#ced4da" stroke-width="1.6"/>`;
strip('m06-l02-removal', 'Taking glitter off in four steps, eyes closed. 1: press sticky tape on the glitter and lift it, again and again, to pick up most flakes. 2: press a cotton pad with an oil-based cleanser on the rest and hold it for a few seconds. 3: wipe outward, away from the eye, toward the ear. Done: wash with warm water and mild soap; the skin is clean.', [
  fpanel(g2Stage(4), { ...RV, over: tape(118, 236, -60) }, '1', 'Tape lifts flakes'),
  fpanel(`<g opacity="0.35">${crescGlitter(GL.silver, 21, 200)}</g>`, { ...RV, over: pad(112, 236) }, '2', 'Oil on a pad'),
  fpanel(`<g opacity="0.2">${crescGlitter(GL.silver, 21, 120)}</g>`, { ...RV, over: arrow([[150, 280], [118, 262], [96, 236]], { width: 3 }) }, '3', 'Wipe away from eye'),
  good(fpanel('', RV, 'Done', 'Wash and dry')),
], { pw: 170, gap: 30 });

// ===================================================================================
// 06.3 Face gems and skin-safe adhesives (light skin)
// ===================================================================================
// Product drawings
const bottle = (x, y, color, { tube = false } = {}) => tube
  ? `<path d="M${x - 16} ${y}H${x + 16}L${x + 12} ${y + 80}H${x - 12}Z" fill="${color}" stroke="#495057" stroke-width="1.6"/><rect x="${x - 6}" y="${y - 20}" width="12" height="20" fill="#495057"/><path d="M${x - 2} ${y - 30}L${x} ${y - 36}L${x + 2} ${y - 30}V${y - 20}H${x - 2}Z" fill="#495057"/>`
  : `<rect x="${x - 20}" y="${y + 10}" width="40" height="70" rx="6" fill="${color}" stroke="#495057" stroke-width="1.6"/><rect x="${x - 10}" y="${y - 12}" width="20" height="22" rx="3" fill="#495057"/>`;
const sheetOfGems = (x, y) => `<rect x="${x - 34}" y="${y}" width="68" height="80" rx="6" fill="#f8f9fa" stroke="#868e96" stroke-width="1.6"/>`
  + [[-18, 16, '#4dabf7'], [0, 16, '#e64980'], [18, 16, '#51cf66'], [-18, 36, '#ffffff'], [0, 36, '#be4bdb'], [18, 36, '#ffd43b']].map(([dx, dy, c]) => gem(x + dx, y + dy, 6.5, c)).join('')
  + gem(x, y + 62, 9, '#74c0fc', { shape: 'drop', deg: 0 });
const col = (x, title, sub, art, ok, note) => art + (ok ? tick(x, 222, 16) : cross(x, 222, 16))
  + label(x, 254, title, { size: 15, bold: true, color: ok ? INK : BAD }) + textLines(x - 74, 276, sub, { size: 13.5, gap: 18 }) + (note ?? '');
const flame = (x, y) => `<path d="M${x} ${y}c-8 -8 -6 -16 0 -24c1 7 6 8 6 14c2 -3 2 -6 1 -9c6 6 6 15 -1 19c-2 1 -4 1 -6 0Z" fill="#f76707" stroke="#c92a2a" stroke-width="1"/>`;
plain('m06-l03-adhesives', 'Which glue for which gem. Self-adhesive face gems need no glue. Latex-free eyelash glue holds small loose gems. Spirit gum or a prosthetic adhesive such as Pros-Aide holds bigger pieces on the face and body but never near the eyes; spirit gum and its remover are flammable. Never superglue, nail glue, craft glue or school glue on skin.', 760, 380,
  col(95, 'Self-adhesive gems', ['No glue needed.', 'Best for beginners.'], sheetOfGems(95, 90), true)
  + col(280, 'Latex-free lash glue', ['A tiny dot holds', 'small loose gems.'], bottle(280, 100, '#e7f5ff', { tube: true }) + gem(320, 160, 7, '#e64980'), true)
  + col(465, 'Spirit gum, Pros-Aide', ['Bigger pieces, face and', 'body. Not near the eyes.'], bottle(445, 100, '#fff4e6') + bottle(495, 100, '#f8f9fa') + flame(445, 96), true)
  + col(655, 'Superglue, nail, craft glue', ['Never on skin.', 'Not even "just a dot".'], bottle(625, 100, '#fff5f5', { tube: true }) + bottle(680, 100, '#fff9db'), false));

// Gem placement map: lines and no-go zones.
const BROW_LINE = [[186, 172], [168, 162], [146, 158], [124, 162], [108, 176], [102, 196]];
const TEMPLE_LINE = [[102, 196], [100, 214]];
const gemLine = (pts, sizes, colors, shape = 'round') => { const c = spline(pts, 30); return sizes.map((r, i) => { const p = c[Math.round((i / (sizes.length - 1)) * (c.length - 1))]; return shape === 'dot' ? dot(p[0], p[1], r, colors[0]) : gem(p[0], p[1], r, colors[i % colors.length], { shape }); }).join(''); };
const dottedGuide = (pts, color = '#7048e8') => line(pts, { w: 2.4, color, dash: '2 7' });
plain('m06-l03-gem-map', 'Where face gems go. Purple guide lines: an arch just above each brow, along the brow bone, that curves down the temple; a line or cluster in the center of the forehead; a curve along the top of the cheekbone. Red hatched no-go zones: the eyelids and lash line, the skin just under the eyes, and the lips. Keep gems away from small children.', 720, 470,
  embed(faceLayer({ skin: 'light', over: noGo(EYE_S) + noGo(LIPS)
    + sym(dottedGuide([...BROW_LINE, ...TEMPLE_LINE.slice(1)]) + dottedGuide([[112, 262], [126, 276], [148, 284]]))
    + dottedGuide([[200, 104], [200, 160]]) + badge(86, 160, '1', { r: 12 }) + badge(226, 112, '2', { r: 12 }) + badge(98, 290, '3', { r: 12 }) + sym(gem(102, 196, 6, '#be4bdb') + gem(146, 158, 4, '#be4bdb') + gem(118, 270, 4, '#be4bdb')) + gem(200, 132, 7, '#be4bdb', { shape: 'drop', deg: 90 }) }), [60, 60, 280, 380], 20, 20, 300, 410)

  + textLines(350, 70, ['1  Above the brows, along', '    the brow bone, to the temple', '2  Center of the forehead', '3  Top of the cheekbone'], { size: 15, gap: 24 })
  + `${hatchDef('hzkey2')}<rect x="350" y="200" width="22" height="22" rx="4" fill="url(#hzkey2)" stroke="${BAD}" stroke-width="2" stroke-dasharray="5 4"/>` + label(384, 217, 'No gems: eyelids, lash line,', { size: 15, anchor: 'start', color: BAD }) + label(384, 239, 'under the eyes, lips', { size: 15, anchor: 'start', color: BAD })
  + textLines(350, 290, ['Plan the line with dots first.', 'Big gem at the end or center,', 'smaller gems toward the edges.'], { size: 15, gap: 22, color: SOFT }));

// Brow-bone gem line, step by step (light skin)
const GV = { skin: 'light', view: [80, 130, 140, 130] };
const BCOL = ['#be4bdb', '#4dabf7', '#ffffff'];
const browGems = (s) => [
  s === 1 && BROW_LINE.concat(TEMPLE_LINE.slice(1)).map(([x, y]) => dot(x, y, 2.2, '#9c36b5')).join(''),
  s >= 2 && gem(102, 198, 7.5, '#be4bdb', { shape: 'drop', deg: 100 }),
  s >= 3 && gemLine(BROW_LINE.slice(0, 5), [3, 3.6, 4.2, 4.8, 5.4], ['#4dabf7', '#be4bdb']),
  s >= 4 && gem(99, 217, 3.4, '#4dabf7') + [[160, 150], [134, 152], [116, 162]].map(([x, y]) => gem(x, y, 2.2, '#ffffff')).join(''),
  s >= 5 && sparkle(92, 180, 6) + sparkle(176, 150, 4) + sparkle(126, 146, 3.5) + [[150, 150], [118, 172], [93, 206]].map(([x, y]) => gem(x, y, 1.8, '#ffffff')).join(''),
].filter(Boolean).join('');
const tweezers = (x, y) => `<g transform="translate(${x} ${y}) rotate(-35)"><path d="M0 0L-4 -70M2 0L6 -70" stroke="#868e96" stroke-width="3" stroke-linecap="round"/></g>`;
strip('m06-l03-brow-steps', 'A gem line above the brow in five steps, light skin, eyes open. 1: mark the line with small dots of eye-safe paint or pencil, above the brow and down the temple. 2: place the biggest gem at the outer end. 3: gems along the line, getting smaller toward the inner brow. 4: one more gem just below the big one and tiny clear gems between the colored ones. Done: a few tiny clear gems and white sparkles. Nothing on the eyelid.', [
  fpanel('', { ...GV, over: browGems(1) }, '1', 'Dot the line'),
  fpanel('', { ...GV, over: browGems(2) + tweezers(110, 200) }, '2', 'Biggest gem'),
  fpanel('', { ...GV, over: browGems(3) }, '3', 'Smaller and smaller'),
  fpanel('', { ...GV, over: browGems(4) }, '4', 'Temple and fillers'),
  fpanel('', { ...GV, over: browGems(5) }, 'Done', 'Tiny gems, sparkles'),
], { pw: 170, gap: 30 });

// Sticking a loose gem: tiny dot of glue, wait until tacky, press.
const PV = [0, 0, 170, 130];
const gemSide = (x, y) => `<path d="M${x - 16} ${y}H${x + 16}L${x + 10} ${y - 12}H${x - 10}Z" fill="#74c0fc" stroke="#1c7ed6" stroke-width="1.4"/>`;
strip('m06-l03-apply', 'Sticking a loose gem in four steps. 1: put a tiny dot of latex-free lash glue on the flat back of the gem, not on the face. 2: wait about 30 seconds until the glue turns clear or tacky. 3: press the gem on clean, dry skin with tweezers or a clean fingertip and hold for 10 seconds. Removal: hold the skin, lift the gem from one edge after softening it with an oil cleanser; never pull hard.', [
  paperPanel(gemSide(85, 70) + `<ellipse cx="85" cy="75" rx="5" ry="3" fill="#ffffff" stroke="#868e96"/>` + arrow([[120, 110], [92, 80]], { width: 2 }) + label(128, 120, 'tiny dot', { size: 14, color: SOFT, halo: false }), PV, '1', 'Dot on the gem'),
  paperPanel(gemSide(85, 70) + `<ellipse cx="85" cy="75" rx="5" ry="3" fill="#e9ecef" fill-opacity="0.4" stroke="#868e96"/>` + label(85, 112, '30 seconds', { size: 15, color: SOFT, halo: false }), PV, '2', 'Wait: tacky'),
  paperPanel(`<path d="M0 100Q85 92 170 100V130H0Z" fill="${SKIN.light}" stroke="#5b4636" stroke-width="1.6"/>` + gem(85, 92, 9, '#74c0fc') + tweezers(92, 82) + label(30, 30, '10 s', { size: 15, color: SOFT, halo: false }), PV, '3', 'Press and hold'),
  paperPanel(`<path d="M0 100Q85 92 170 100V130H0Z" fill="${SKIN.light}" stroke="#5b4636" stroke-width="1.6"/>` + `<g transform="rotate(-25 76 96)">${gem(85, 92, 9, '#74c0fc')}</g>` + arrow([[100, 92], [118, 64]], { width: 2 }) + label(128, 52, 'oil, then lift', { size: 14, color: SOFT, halo: false }), PV, 'Off', 'Lift from the edge'),
], { pw: 170, gap: 32 });

// Mistakes
const GMV = { skin: 'light', view: [80, 130, 140, 130] };
strip('m06-l03-mistakes', 'A good gem line and three mistakes. Good: gems above the brow, graded in size, ending at the temple. Avoid: gems on the eyelid and lash line, where they can fall into the eye. Avoid: a crooked line placed without dots. Avoid: superglue or craft glue from the drawer.', [
  good(fpanel('', { ...GMV, over: browGems(4) }, 'Good', 'Above the brow')),
  bad(fpanel('', { ...GMV, over: gemLine([[126, 216], [140, 208], [156, 207], [172, 212]], [3, 3.5, 3.5, 3], ['#4dabf7', '#be4bdb']) + gem(118, 222, 4, '#ffffff') }, 'Avoid', 'On the eyelid')),
  bad(fpanel('', { ...GMV, over: [[186, 170], [166, 152], [148, 166], [126, 150], [112, 178], [104, 192]].map(([x, y], i) => gem(x, y, 3 + (i % 3), ['#4dabf7', '#be4bdb'][i % 2])).join('') }, 'Avoid', 'No plan, crooked')),
  bad({ ...paperPanel(bottle(70, 30, '#fff5f5', { tube: true }) + label(70, 128, 'SUPER GLUE', { size: 13, bold: true, color: BAD, halo: false }) + cross(124, 60, 26), [0, 0, 160, 140]), label: 'Avoid', caption: 'Glue from the drawer' }),
], { pw: 170, arrows: false });

// ===================================================================================
// 06.4 Neon and UV: what's allowed where (tan skin)
// ===================================================================================
const NEON = { pink: P.neonPink, green: P.neonGreen, yellow: P.neonYellow, orange: P.neonOrange, blue: P.neonBlue };
// Where neon may go.
const CHEEK_NEON = ell(136, 304, 34, 22);
const TEMPLE_NEON = band([[104, 150], [94, 176], [92, 200]], [[116, 150], [104, 176], [100, 200]]);
const FORE_NEON = ell(200, 128, 74, 34);
plain('m06-l04-where-neon', 'Where neon may go. Green zones: the forehead above the brows, the temples outside the eye area, the cheeks below the eye area, the jaw and the body. Red hatched zone: the whole eye area, from the brows to the skin under the eyes, where no fluorescent, UV or glow-in-the-dark paint goes. Near the eyes use only ordinary, non-fluorescent paint whose label allows the eye area.', 760, 470,
  embed(faceLayer({ skin: 'tan', over: sym(yesZone(CHEEK_NEON) + yesZone(TEMPLE_NEON)) + yesZone(FORE_NEON) + yesZone(ell(200, 398, 30, 13)) + noGo(EYE_L) }), [60, 60, 280, 380], 20, 20, 300, 410)
  + `<rect x="350" y="50" width="22" height="22" rx="4" fill="${OK}" fill-opacity="0.25" stroke="${OK}" stroke-width="2" stroke-dasharray="5 4"/>` + label(384, 67, 'Neon / UV face paint: yes', { size: 15, anchor: 'start', bold: true })
  + textLines(384, 92, ['forehead, temples, cheeks,', 'jaw, body (if the label allows)'], { size: 14.5, gap: 20 })
  + `${hatchDef('hzkey3')}<rect x="350" y="150" width="22" height="22" rx="4" fill="url(#hzkey3)" stroke="${BAD}" stroke-width="2" stroke-dasharray="5 4"/>` + label(384, 167, 'Eye area: no neon, no UV,', { size: 15, anchor: 'start', bold: true, color: BAD })
  + textLines(384, 192, ['no glow-in-the-dark', 'brows, eyelids, under the eyes'], { size: 14.5, gap: 20, color: BAD })
  + `<rect x="350" y="250" width="22" height="22" rx="4" fill="#9775fa"/>` + label(384, 267, 'Near the eyes:', { size: 15, anchor: 'start', bold: true })
  + textLines(384, 292, ['ordinary eye-safe colors', '(not fluorescent) only'], { size: 14.5, gap: 20 })
  + textLines(350, 360, ['US FDA: no fluorescent colors are', 'allowed near the eyes.'], { size: 14, gap: 20, color: SOFT }));

// The demo neon design (tan skin): cheek swooshes, temple dots, forehead chevron.
const NEON_L = {
  swoosh: [[178, 300], [150, 304], [124, 296], [106, 276], [96, 252]],
  swoosh2: [[168, 318], [140, 322], [114, 312], [98, 290]],
  dots: [[94, 236], [94, 218], [98, 200], [104, 184], [112, 168]],
};
const neonDesign = (s = 9, { safe = true } = {}) => [
  s >= 1 && sym(stroke(NEON_L.swoosh, { w: 11, color: NEON.pink }) + stroke(NEON_L.swoosh2, { w: 8, color: NEON.orange })),
  s >= 2 && stroke([[150, 150], [176, 128], [200, 104], [224, 128], [250, 150]], { w: 9, color: NEON.green }) + stroke([[166, 156], [184, 140], [200, 124], [216, 140], [234, 156]], { w: 6, color: NEON.yellow }),
  s >= 3 && sym(dots(NEON_L.dots, 5, 2.6, 4.6, NEON.yellow) + dot(160, 290, 2.6, NEON.green) + dot(130, 284, 2.2, NEON.green)) + dot(200, 146, 5, NEON.blue),
].filter(Boolean).join('');
// Ordinary (non-fluorescent) eye-safe purple near the eyes.
const safeEyes = sym(clipTo(ell(150, 210, 38, 18), glow(150, 214, 40, 18, '#7048e8', { opacity: 0.55 })) + line([[124, 236], [150, 244], [178, 236]], { w: 1, color: '#5f3dc4', opacity: 0 }));
plain('m06-l04-day-uv', 'The same neon design in daylight and under a black light, tan skin. In daylight: neon pink and orange swooshes on the cheeks, a neon green and yellow chevron on the forehead, neon yellow dots down the temples, a blue dot, and ordinary eye-safe purple on the eyelids. Under the black light the room and skin go dark, the neon parts glow brightly, and the ordinary purple near the eyes goes dark, so the glow stays away from the eyes.', 760, 470,
  embed(faceLayer({ skin: 'tan', under: safeEyes + neonDesign() }), [60, 60, 280, 380], 20, 40, 330, 410)
  + embed(uvLayer(neonDesign(), clipTo(ell(150, 210, 38, 18), '') ), [60, 60, 280, 380], 410, 40, 330, 410, { bg: UVBG })
  + label(185, 28, 'Daylight', { size: 17, bold: true }) + label(575, 28, 'Under a black light (UV)', { size: 17, bold: true }));

// Three labels: UV face paint, UV body paint, craft / SFX UV paint.
plain('m06-l04-labels', 'Three neon labels. UV face and body paint, a cosmetic with an ingredient list, labeled do not use in the eye area: face away from the eyes, and body. UV body paint, a cosmetic labeled for body use only, not for the face: body only. Craft UV paint or a Special FX neon labeled not a cosmetic, for paper, fabric or props: never on skin.', 780, 320,
  card(20, 20, 236, 230, textLines(36, 84, ['Neon UV face', '& body paint'], { size: 16, bold: true, gap: 21 }) + textLines(36, 140, ['Cosmetic.', 'Ingredients: ...', 'Do not use in', 'the eye area.'], { size: 14, gap: 20 }), { head: 'LABEL A', headColor: '#d6336c' })
  + card(272, 20, 236, 230, textLines(288, 84, ['UV body paint'], { size: 16, bold: true }) + textLines(288, 120, ['Cosmetic.', 'Ingredients: ...', 'For body use only.', 'Not for the face.'], { size: 14, gap: 20 }), { head: 'LABEL B', headColor: '#f08c00' })
  + card(524, 20, 236, 230, textLines(540, 84, ['UV neon paint', 'Special FX'], { size: 16, bold: true, gap: 21 }) + textLines(540, 140, ['Not a cosmetic.', 'For paper, fabric,', 'props.', 'No ingredient list.'], { size: 14, gap: 20 }), { head: 'LABEL C', headColor: '#495057' })
  + tick(46, 284, 16) + label(66, 290, 'Face, not eyes', { size: 15, bold: true, anchor: 'start', color: OK })
  + tick(298, 284, 16) + label(318, 290, 'Body only', { size: 15, bold: true, anchor: 'start', color: '#e67700' })
  + cross(550, 284, 16) + label(570, 290, 'Never on skin', { size: 15, bold: true, anchor: 'start', color: BAD }));

// Neon design step by step (tan skin)
const NV = { skin: 'tan', view: [70, 80, 260, 270] };
strip('m06-l04-steps', 'Neon design in four steps, tan skin, eyes open. 1: neon pink and orange swooshes on each cheek, starting below the eye area and curving up toward the ear. 2: a neon green and yellow chevron on the forehead, above the brows. 3: neon yellow dots down the temples outside the eye area, green dots on the cheeks, a blue dot on the forehead. Done: near the eyes only ordinary eye-safe purple, no neon.', [
  fpanel(neonDesign(1), NV, '1', 'Cheek swooshes'),
  fpanel(neonDesign(2), NV, '2', 'Forehead chevron'),
  fpanel(neonDesign(3), NV, '3', 'Dots'),
  fpanel(safeEyes + neonDesign(3), NV, 'Done', 'Eye-safe near eyes'),
], { pw: 190, gap: 32 });

// UV torch: point at the design from the side, never at eyes.
const torch = (x, y, deg) => `<g transform="translate(${x} ${y}) rotate(${deg})"><rect x="-60" y="-11" width="60" height="22" rx="4" fill="#343a40"/><path d="M0 -14H14V14H0Z" fill="#495057"/><rect x="14" y="-12" width="3" height="24" fill="#9775fa"/></g>`;
const beam = (x, y, deg, len = 70, spread = 18) => { const a = pol(x, y, len, deg - spread), b = pol(x, y, len, deg + spread); return `<path d="M${x} ${y}L${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}Z" fill="#9775fa" opacity="0.35"/>`; };
const TV = [40, 80, 320, 300];
strip('m06-l04-torch', 'Using a UV torch safely. Good: in a dim room, shine the torch from the side or from below at the cheek or forehead design, about an arm\'s length away, for a quick look or a photo. Avoid: shining it into anyone\'s eyes, including your own in the mirror.', [
  good({ content: uvLayer(neonDesign()) + beam(332, 330, 200, 120, 14) + torch(352, 338, 200), view: TV, label: 'Good', caption: 'From the side, at the design', bg: UVBG }),
  bad({ content: uvLayer(neonDesign()) + beam(330, 230, 180, 170, 10) + torch(352, 230, 180) + cross(310, 120, 22), view: TV, label: 'Avoid', caption: 'Never into the eyes', bg: UVBG }),
], { pw: 260, arrows: false, gap: 40 });

// ===================================================================================
// Projects P7 (neon glow, brown skin) and P8 (glitter and gems, fair skin)
// ===================================================================================
const FULLV = [60, 50, 280, 400];
// P7: neon ribbons on the cheeks, a neon sun-burst on the forehead, dot trails, eye-safe purple near the eyes.
const P7 = {
  ribbons: sym(stroke([[184, 296], [154, 302], [126, 294], [106, 274], [96, 246], [96, 220]], { w: 12, color: NEON.pink })
    + stroke([[176, 314], [146, 320], [118, 310], [100, 290], [90, 262]], { w: 9, color: NEON.blue })
    + stroke([[166, 332], [140, 336], [116, 326], [100, 308]], { w: 6, color: NEON.green })),
  burst: Array.from({ length: 7 }, (_, i) => { const a = -170 + i * 26.6; return teardrop(...pol(200, 156, 22, a), a, 30, 9, i % 2 ? NEON.yellow : NEON.orange); }).join('') + dot(200, 156, 13, NEON.pink) + dot(200, 156, 6, NEON.yellow),
  dots: sym(dots([[96, 204], [100, 186], [108, 170], [120, 156], [134, 146]], 5, 2.4, 4.4, NEON.yellow) + dots([[150, 346], [128, 342], [110, 330]], 3, 3.6, 2.2, NEON.pink)) + dots([[170, 116], [200, 104], [230, 116]], 5, 2.6, 2.6, NEON.green),
  safe: safeEyes,
  lines: sym(line([[106, 274], [92, 296], [88, 318]], { w: 1.6, color: K, opacity: 0 })),
};
const p7Stage = (s) => [s >= 4 && P7.safe, s >= 1 && P7.ribbons, s >= 2 && P7.burst, s >= 3 && P7.dots].filter(Boolean).join('');
faceOnly('p07-neon-glow', 'Project 7 finished look in daylight, brown skin, eyes open: neon pink, blue and green ribbons sweeping from the cheeks up toward the ears below the eye area, a neon sun-burst of yellow and orange rays on the forehead with a pink center, neon yellow dot trails at the temples, green dots above the burst, pink dots on the cheeks, and ordinary eye-safe purple on the eyelids.', p7Stage(4), { skin: 'brown', view: FULLV });
plain('p07-neon-glow-uv', 'Project 7 under a black light: the face and room go dark, the neon ribbons, sun-burst and dots glow brightly, and the eye area stays dark because only ordinary eye-safe purple was used there.', 350, 500,
  embed(uvLayer(p7Stage(3)), FULLV, 0, 0, 350, 500, { bg: UVBG, frame: false }));
strip('p07-neon-glow-steps', 'Neon glow design in four steps, brown skin. 1: three neon ribbons on each cheek, pink, blue and green, starting below the eye area and sweeping up toward the ear. 2: a sun-burst on the forehead: a pink center dot and yellow and orange teardrop rays. 3: neon yellow dot trails up the temples outside the eye area, green dots above the burst, pink dots on the cheeks. Done: ordinary eye-safe purple on the lids, then check under the black light.', [
  fpanel(p7Stage(1), { skin: 'brown', view: FULLV }, '1', 'Cheek ribbons'),
  fpanel(p7Stage(2), { skin: 'brown', view: FULLV }, '2', 'Sun-burst'),
  fpanel(p7Stage(3), { skin: 'brown', view: FULLV }, '3', 'Dot trails'),
  fpanel(p7Stage(4), { skin: 'brown', view: FULLV }, 'Done', 'Eye-safe lids'),
  { content: uvLayer(p7Stage(3)), view: FULLV, label: 'UV', labelColor: '#7048e8', caption: 'Under black light', bg: UVBG },
], { pw: 170, gap: 28 });

// P8: glitter cheekbones, a gem arch above each brow, a forehead jewel, glitter roots at the hairline.
const P8C = ['#e64980', '#f783ac', '#ffffff'];
const P8 = {
  base: sym(gel(CRESC)),
  glitter: sym(crescGlitter(GL.gold, 41)),
  hair: `<path d="${hairD}" fill="#6b3f22"/>` + line(partLine, { w: 2.4, color: SKIN.fair }),
  part: band([[195, 46], [193, 60], [196, 76], [194, 92]], [[205, 46], [203, 60], [206, 76], [204, 92]]),
  big: gem(200, 132, 9, '#e64980', { shape: 'drop', deg: 90 }) + sym(gem(102, 198, 7, '#e64980', { shape: 'drop', deg: 100 })),
  line: sym(gemLine(BROW_LINE.slice(0, 5), [3, 3.6, 4.2, 4.8, 5.4], ['#f783ac', '#ffffff']) + gem(110, 160, 3, '#ffffff') + gem(104, 176, 2.6, '#f783ac')),
  fill: [[188, 132], [212, 132], [200, 116]].map(([x, y]) => gem(x, y, 3, '#ffffff')).join('') + sym(chunky(CRESC_OUT.slice(1, 6), ['#f783ac', '#ffffff', P.gold], 8, 16)) + sparkle(214, 70, 6) + sym(sparkle(92, 172, 6) + sparkle(170, 302, 5)),
};
const p8Stage = (s) => [s >= 1 && P8.base, s >= 2 && P8.glitter].filter(Boolean).join('');
const p8Over = (s) => [P8.hair, s >= 1 && gel(P8.part), s >= 2 && glitFill(P8.part, [190, 44, 20, 50], GL.gold, 300, 42), s >= 3 && P8.big, s >= 4 && P8.line, s >= 5 && P8.fill].filter(Boolean).join('');
faceOnly('p08-glitter-gems', 'Project 8 finished look on fair skin, eyes open: gold cosmetic glitter in a crescent along each cheekbone up to the temple with bigger pink and white flakes on the edge, a pink drop gem in the center of the forehead with three small clear gems, a line of pink and clear gems arching above each brow and down the temple, ending in a pink drop gem at the temple, gold glitter along the hair parting, and sparkles. Nothing on the eyelids.', p8Stage(2), { skin: 'fair', view: FULLV, over: p8Over(5) });
strip('p08-glitter-gems-steps', 'Glitter and gems in five steps, fair skin. 1: a thin crescent of glitter base on each cheekbone up to the temple, and a thin line along the hair parting. 2: pat gold cosmetic glitter onto the base and tap off the loose flakes. 3: the biggest gems: a pink drop in the center of the forehead and one at each temple. 4: a line of smaller gems arching above each brow, getting smaller toward the nose. Done: tiny clear gems, bigger flakes on the glitter edge and sparkles.', [
  fpanel(p8Stage(1), { skin: 'fair', view: FULLV, over: p8Over(1) }, '1', 'Glitter base'),
  fpanel(p8Stage(2), { skin: 'fair', view: FULLV, over: p8Over(2) }, '2', 'Pat on glitter'),
  fpanel(p8Stage(2), { skin: 'fair', view: FULLV, over: p8Over(3) }, '3', 'Big gems'),
  fpanel(p8Stage(2), { skin: 'fair', view: FULLV, over: p8Over(4) }, '4', 'Gem lines'),
  fpanel(p8Stage(2), { skin: 'fair', view: FULLV, over: p8Over(5) }, 'Done', 'Details'),
], { pw: 170, gap: 28 });

// ===================================================================================
// Line art and zones for the printable sheets (sheets-m06.mjs)
// ===================================================================================
export const ZONES = { EYE_S, EYE_L, LIPS, CRESC, HAIRLINE, FORE, CHEEK_NEON, TEMPLE_NEON, FORE_NEON, BROW_LINE, TEMPLE_LINE };
export const LINEART = {
  p07: P7.ribbons + P7.burst + P7.dots,
  p08: sym(`<path d="${CRESC}" fill="#000"/>` + gemLine(BROW_LINE.slice(0, 5), [3, 3.6, 4.2, 4.8, 5.4], ['#000'], 'dot') + dot(110, 160, 3, '#000') + dot(104, 176, 2.6, '#000') + teardrop(102, 194, 100, 13, 12, '#000'))
    + teardrop(200, 128, 90, 16, 16, '#000') + [[188, 132], [212, 132], [200, 116]].map(([x, y]) => dot(x, y, 3, '#000')).join(''),
};

console.log('m06 assets written');
void [P, star, teardrop, badge, sponge, SOFT];
