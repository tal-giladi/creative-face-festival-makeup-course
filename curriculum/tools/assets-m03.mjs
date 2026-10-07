// Module 3 diagrams (Color and Symmetry). Run: node curriculum/tools/assets-m03.mjs
import { plain, strip, paperPanel } from './lib/figure.mjs';
import { P, SOFT, INK, OK, BAD, ACCENT, label, arrow, badge, tick, cross, line, stroke, teardrop, petal, dot, dots, spiral, star, sparkle, heart, sponge as spongeFill, stipple, brush, pol, rng, spline, polyD } from './lib/art.mjs';
import { SKIN, L, ARM, faceSVG, headClip } from './lib/face.mjs';

const OUTLINE = '#5b4636';
const n1 = (v) => (Math.round(v * 10) / 10).toString();

// ---------- local helpers (not in the shared lib) ----------

// Mixed colors used in the diagrams (what the mixes really look like).
const MIX = {
  orange: '#f7902a', green: '#3daa4a', purple: '#7d45c2', dullPurple: '#6b3552', mud: '#7c6a52',
  pink: '#f59ab0', lightBlue: '#9cc3f5', mint: '#a6dcae', darkRed: '#8f1d26', navy: '#1f3c86', darkGreen: '#1f6b2c', brown: '#8a5a33', grey: '#9aa1ab',
};

// Mix two hex colors (t = share of b). Used for tint/shade ladders.
const hx = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (a) => '#' + a.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = hx(a), B = hx(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };

// Ring sector (for color wheels).
function sector(cx, cy, r1, r2, a0, a1, fill, { strokeC = '#ffffff', sw = 3 } = {}) {
  const p = (r, a) => pol(cx, cy, r, a).map(n1).join(' ');
  const large = a1 - a0 > 180 ? 1 : 0;
  return `<path d="M${p(r2, a0)}A${r2} ${r2} 0 ${large} 1 ${p(r2, a1)}L${p(r1, a1)}A${r1} ${r1} 0 ${large} 0 ${p(r1, a0)}Z" fill="${fill}" stroke="${strokeC}" stroke-width="${sw}"/>`;
}

// Six-color wheel: red at the top, clockwise red, orange, yellow, green, blue, purple.
const WHEEL = [P.red, MIX.orange, P.yellow, MIX.green, P.blue, MIX.purple];
const wheelAng = (i) => -90 + i * 60;
function wheel(cx, cy, r, { dim = null, r1 = r * 0.45 } = {}) {
  return WHEEL.map((c, i) => sector(cx, cy, r1, r, wheelAng(i) - 30, wheelAng(i) + 30, c)
    + (dim && !dim.includes(i) ? sector(cx, cy, r1, r, wheelAng(i) - 30, wheelAng(i) + 30, 'rgba(255,255,255,0.78)', { sw: 3 }) : '')).join('');
}

// Irregular paint blob (paint on a palette).
function blob(cx, cy, r, color, seed = 1, { outline = 'rgba(0,0,0,0.18)' } = {}) {
  const rnd = rng(seed), pts = [];
  for (let i = 0; i < 9; i++) pts.push(pol(cx, cy, r * (0.82 + rnd() * 0.3), i * 40));
  return `<path d="${polyD(spline([...pts, pts[0], pts[1], pts[2]], 10).slice(10, 101), true)}" fill="${color}" stroke="${outline}" stroke-width="1.2"/>`;
}

// White mixing plate seen from above.
const plate = (cx, cy, r = 120) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" stroke="#c9cdd3" stroke-width="2.5"/><circle cx="${cx}" cy="${cy}" r="${r - 16}" fill="none" stroke="#eef0f3" stroke-width="3"/>`;

// Paint on the tip of a round brush drawn with brush(x, y, deg, len, { size }).
function loadedTip(x, y, deg, color, frac = 0.55, size = 1) {
  const hl = 26 * size, w = 6 * size;
  const p = (r) => pol(x, y, r, deg + 180);
  const side = (r, k) => pol(...p(r), k, deg + 90);
  return `<path d="${polyD([p(0), side(hl * 0.45, w * 1.02), side(hl * frac, w * 0.98), side(hl * frac, -w * 0.98), side(hl * 0.45, -w * 1.02)], true)}" fill="${color}"/>`;
}
const loaded = (x, y, deg, color, { len = 150, size = 1.2, handle = '#2b6cb0' } = {}) => brush(x, y, deg, len, { color: handle, size }) + loadedTip(x, y, deg, color, 0.55, size);

// Plus and equals signs.
const plus = (x, y, s = 12, c = '#868e96') => `<path d="M${x - s} ${y}H${x + s}M${x} ${y - s}V${y + s}" stroke="${c}" stroke-width="${s / 3}" stroke-linecap="round"/>`;
const equals = (x, y, s = 12, c = '#868e96') => `<path d="M${x - s} ${y - s / 2.5}H${x + s}M${x - s} ${y + s / 2.5}H${x + s}" stroke="${c}" stroke-width="${s / 3}" stroke-linecap="round"/>`;

// A face with paint below the features.
let fid = 0;
function face(under, skin = 'medium', over = '', { eyes = 'open', centre = false } = {}) {
  const id = `fc${fid++}`;
  return `<defs>${headClip(id)}</defs>${faceSVG({ skin, eyes, parts: 'base' })}<g clip-path="url(#${id})">${under}</g>${faceSVG({ skin, eyes, centre, parts: 'features' })}${over}`;
}

// Mirror content across the face centre line.
const mirror = (content) => `<g transform="translate(400 0) scale(-1 1)">${content}</g>`;
const both = (content) => content + mirror(content);

// Forearm seen from the inner side, wrist left, elbow right (frame 300 x 200).
const forearm = (skin = 'tan') => `<path d="M-10 62C70 56 170 50 310 42V172C170 166 70 158 -10 154Z" fill="${SKIN[skin]}"/>`
  + `<path d="M-10 62C70 56 170 50 310 42M-10 154C70 158 170 166 310 172" fill="none" stroke="${OUTLINE}" stroke-width="2.4"/>`
  + `<path d="M22 66C17 90 17 124 22 152M32 66C28 90 28 124 32 152" fill="none" stroke="${OUTLINE}" stroke-width="1.2" opacity="0.35"/>`;
const ARMCLIP = 'M-10 62C70 56 170 50 310 42V172C170 166 70 158 -10 154Z';

// Clip helper.
let kid = 0;
const clipTo = (d, content) => { const id = `cl${kid++}`; return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id})">${content}</g>`; };

const good = (p) => ({ ...p, labelColor: OK });
const bad = (p) => ({ ...p, labelColor: BAD });

// ===================================================================================
// 03.1 Mixing many colors from a few
// ===================================================================================
{
  // The mixing wheel: three primaries in big circles, secondaries between them.
  const cx = 300, cy = 250, R = 150;
  const prim = [[P.red, 'red', -90], [P.yellow, 'yellow', 30], [P.blue, 'blue', 150]];
  const sec = [[MIX.orange, 'orange', -30], [MIX.green, 'green', 90], [MIX.purple, 'purple', 210]];
  let o = '';
  // connecting ring
  o += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#e3ddd5" stroke-width="6"/>`;
  for (const [c, name, a] of prim) {
    const [x, y] = pol(cx, cy, R, a);
    o += `<circle cx="${n1(x)}" cy="${n1(y)}" r="52" fill="${c}" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>`;
    o += label(x, y + 6, name, { size: 18, bold: true, color: c === P.yellow ? INK : '#ffffff', halo: false });
  }
  for (const [c, name, a] of sec) {
    const [x, y] = pol(cx, cy, R, a);
    o += `<circle cx="${n1(x)}" cy="${n1(y)}" r="36" fill="${c}" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>`;
    const [lx, ly] = pol(cx, cy, R + 62, a);
    o += label(lx, ly + 6, name, { size: 16, bold: true });
  }
  // white and black on the side
  o += `<circle cx="620" cy="190" r="40" fill="#ffffff" stroke="#adb5bd" stroke-width="2"/>` + label(620, 196, 'white', { size: 16, bold: true, halo: false });
  o += `<circle cx="620" cy="320" r="40" fill="${P.black}"/>` + label(620, 326, 'black', { size: 16, bold: true, color: '#ffffff', halo: false });
  o += label(620, 115, 'lighter', { size: 15, color: SOFT }) + label(620, 395, 'darker', { size: 15, color: SOFT });
  o += label(cx, 36, 'Big circles: your 3 starting colors. Small: what two of them make.', { size: 15, color: SOFT });
  plain('m03-l01-wheel', 'The mixing wheel. Red, yellow and blue are the three starting colors. Between each pair is the color they make: red and yellow make orange, yellow and blue make green, blue and red make purple. White makes any color lighter, black makes it darker.', 720, 480, o);
}

{
  // Recipe cards: A + B = C, three rows.
  const row = (y, a, b, c, an, bn, cn, note = '') => blob(70, y, 34, a, 3) + label(70, y + 56, an, { size: 14, halo: false })
    + plus(140, y) + blob(210, y, 34, b, 5) + label(210, y + 56, bn, { size: 14, halo: false })
    + equals(285, y) + blob(365, y, 38, c, 7) + label(365, y + 60, cn, { size: 15, bold: true, halo: false })
    + (note ? label(430, y + 6, note, { size: 14, color: SOFT, anchor: 'start', halo: false }) : '');
  plain('m03-l01-recipes', 'Mixing recipes. Yellow plus a little blue makes green. Yellow plus a little red makes orange. Pink plus blue makes a bright purple, while an orange-red plus blue makes a dull, brownish purple. White plus a little red makes pink. Orange plus a tiny bit of blue makes brown.', 720, 790,
    row(60, P.yellow, P.blue, MIX.green, 'yellow', 'a little blue', 'green', 'start with the light color')
    + row(185, P.yellow, P.red, MIX.orange, 'yellow', 'a little red', 'orange')
    + row(310, P.pink, P.blue, MIX.purple, 'pink', 'blue', 'bright purple', 'pink-red mixes clean')
    + row(435, '#e8452a', P.blue, MIX.dullPurple, 'orange-red', 'blue', 'dull purple', 'orange-red turns dull')
    + row(560, P.white, P.red, MIX.pink, 'white', 'a little red', 'pink', 'light color first again')
    + row(685, MIX.orange, P.blue, MIX.brown, 'orange', 'a tiny bit of blue', 'brown'));
}

{
  // Tint and shade ladders.
  const ladders = [[P.red, 'red'], [P.blue, 'blue'], [MIX.green, 'green']];
  let o = label(60, 40, '+ white', { size: 16, bold: true, color: SOFT, anchor: 'start' }) + label(660, 40, '+ black', { size: 16, bold: true, color: SOFT, anchor: 'end' });
  o += arrow([[290, 34], [130, 34]], { color: '#c2b8ab', width: 3 }) + arrow([[430, 34], [590, 34]], { color: '#c2b8ab', width: 3 });
  ladders.forEach(([c, name], r) => {
    const y = 70 + r * 110;
    const steps = [mix(c, '#ffffff', 0.75), mix(c, '#ffffff', 0.5), mix(c, '#ffffff', 0.25), c, mix(c, '#000000', 0.25), mix(c, '#000000', 0.5)];
    steps.forEach((s, i) => {
      const x = 60 + i * 100;
      o += `<rect x="${x}" y="${y}" width="84" height="70" rx="10" fill="${s}" stroke="${i === 3 ? INK : 'rgba(0,0,0,0.15)'}" stroke-width="${i === 3 ? 3 : 1.5}"/>`;
    });
    o += label(60 + 3 * 100 + 42, y + 92, name, { size: 14, bold: true, halo: false });
  });
  o += label(160, 412, 'tints (pastels)', { size: 15, color: SOFT, halo: false }) + label(560, 412, 'shades', { size: 15, color: SOFT, halo: false });
  plain('m03-l01-tints-shades', 'Tints and shades of red, blue and green. Going left, more and more white makes softer, lighter tints, like pink and baby blue. Going right, a little black makes darker shades. The pure color is in the middle, outlined.', 720, 430, o);
}

{
  // Step strip: mixing green on the plate.
  const V = [0, 0, 300, 260];
  const base = (extra) => plate(150, 130, 112) + extra;
  strip('m03-l01-mix-steps', 'Mixing on the plate in five pictures. 1: put a pool of the light color, yellow, on the plate. 2: put a small dot of the dark color, blue, beside it, not on top. 3: pull a little blue into the yellow with the brush and stir. 4: paint a test swatch on paper and compare. Done: a clean green, with yellow and blue still separate at the side.', [
    paperPanel(base(blob(130, 130, 40, P.yellow, 11) + loaded(178, 150, -40, P.yellow)), V, '1', 'Light color first'),
    paperPanel(base(blob(130, 130, 40, P.yellow, 11) + blob(205, 90, 12, P.blue, 4) + arrow([[250, 40], [216, 74]], { width: 2.5 })), V, '2', 'Dark dot beside it'),
    paperPanel(base(blob(130, 130, 40, P.yellow, 11) + blob(205, 90, 12, P.blue, 4) + blob(150, 140, 26, MIX.green, 9) + arrow([[200, 98], [168, 126]], { width: 2.5 }) + loaded(160, 150, -50, MIX.green)), V, '3', 'Pull in a little'),
    paperPanel(`<rect x="20" y="40" width="260" height="180" rx="6" fill="#ffffff" stroke="#e3ddd5"/>` + `<rect x="50" y="80" width="90" height="70" rx="6" fill="${MIX.green}"/>` + `<rect x="160" y="80" width="90" height="70" rx="6" fill="${P.yellow}"/>` + label(95, 190, 'mix', { size: 22, halo: false }) + label(205, 190, 'yellow', { size: 22, halo: false }), V, '4', 'Test on paper'),
    paperPanel(base(blob(110, 110, 30, P.yellow, 11) + blob(205, 90, 10, P.blue, 4) + blob(150, 170, 34, MIX.green, 9)) + tick(250, 220, 20), V, 'Done', 'Clean green'),
  ], { pw: 190 });
}

{
  // Clean vs muddy.
  const V = [0, 0, 300, 240];
  const pool = (cs, result, seeds) => plate(150, 120, 105) + cs.map((c, i) => blob(80 + i * 70, 70, 16, c, seeds + i)).join('') + blob(150, 150, 40, result, seeds + 9);
  strip('m03-l01-muddy', 'Clean mixes versus muddy ones. Good: two neighbor colors, yellow and blue, make a clean green. Good: mixing on the plate where you can see the true color. Avoid: three colors stirred together turn brown and dull. Avoid: mixing on the skin rubs the paint into a patchy, muddy smear.', [
    good(paperPanel(pool([P.yellow, P.blue], MIX.green, 20) + tick(255, 210, 18), V, 'Good', 'Two colors: clean')),
    good(paperPanel(plate(150, 120, 105) + blob(115, 105, 30, MIX.purple, 31) + blob(185, 130, 22, MIX.pink, 33) + loaded(240, 70, -35, MIX.purple) + tick(255, 210, 18), V, 'Good', 'Mix on the plate')),
    bad(paperPanel(pool([P.red, P.yellow, P.blue], MIX.mud, 40) + cross(255, 210, 18), V, 'Avoid', 'Three colors: mud')),
    bad(paperPanel(forearm('fair') + clipTo(ARMCLIP, spongeFill('M70 80C120 70 190 76 230 92C236 120 220 150 170 150C120 154 80 144 66 128C60 110 62 92 70 80Z', [P.blue, MIX.mud, P.yellow, MIX.mud], { deg: 20, soft: 4 })
      + stipple('M70 80C120 70 190 76 230 92C236 120 220 150 170 150C120 154 80 144 66 128C60 110 62 92 70 80Z', SKIN.fair, { n: 120, seed: 9, bbox: [60, 70, 180, 90], r: [2, 5], opacity: 0.6 })) + cross(255, 210, 18), [0, 20, 300, 220], 'Avoid', 'Mixed on skin: patchy')),
  ], { pw: 200, arrows: false });
}

// ===================================================================================
// 03.2 Your first sponge gradient
// ===================================================================================

// A rectangular sponge seen from below (the face that touches the skin), centre (x, y).
// colors: null (clean), one color, or [left, right] loaded side by side.
let sid = 0;
function spongeBottom(x, y, w, h, colors = null, { soft = 0.18 } = {}) {
  const id = `sb${sid++}`;
  const d = `M${x - w / 2 + 12} ${y - h / 2}H${x + w / 2 - 12}Q${x + w / 2} ${y - h / 2} ${x + w / 2} ${y - h / 2 + 12}V${y + h / 2 - 12}Q${x + w / 2} ${y + h / 2} ${x + w / 2 - 12} ${y + h / 2}H${x - w / 2 + 12}Q${x - w / 2} ${y + h / 2} ${x - w / 2} ${y + h / 2 - 12}V${y - h / 2 + 12}Q${x - w / 2} ${y - h / 2} ${x - w / 2 + 12} ${y - h / 2}Z`;
  let fill = '#f6e7d0';
  let defs = '';
  if (Array.isArray(colors)) {
    defs = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${colors[0]}"/><stop offset="${0.5 - soft}" stop-color="${colors[0]}"/><stop offset="${0.5 + soft}" stop-color="${colors[1]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient></defs>`;
    fill = `url(#${id})`;
  } else if (colors) fill = colors;
  const pores = Array.from({ length: 22 }, (_, i) => `<circle cx="${n1(x - w / 2 + 10 + ((i * 37) % (w - 20)))}" cy="${n1(y - h / 2 + 8 + ((i * 23) % (h - 16)))}" r="1.6" fill="rgba(90,60,30,0.25)"/>`).join('');
  return defs + `<path d="${d}" fill="${fill}" stroke="#c8a67a" stroke-width="2.5"/>` + pores;
}

// A paint cake seen from above.
const cakeTop = (x, y, r, color) => `<circle cx="${x}" cy="${y}" r="${r + 5}" fill="#e9ecef" stroke="#adb5bd" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="rgba(0,0,0,0.2)"/>`;

// Soft two-color gradient patch with a sponge texture, inside path d (bbox [x, y, w, h]).
function gradPatch(d, bbox, colors, { seed = 5, deg = 0, soft = 3, texture = true } = {}) {
  return spongeFill(d, colors, { deg, soft })
    + (texture ? stipple(d, '#ffffff', { seed, n: Math.round(bbox[2] * bbox[3] / 60), bbox, r: [0.6, 1.6], opacity: 0.35 }) : '');
}

// Rounded patch outline helper (blobby rectangle).
// Fade content out toward the edges of bbox (paint faded into the skin).
let mid = 0;
function faded(content, [x, y, w, h], inner = 0.5) {
  const id = `fm${mid++}`;
  return `<defs><radialGradient id="${id}g" cx="0.5" cy="0.5" r="0.5"><stop offset="${inner}" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`
    + `<mask id="${id}" maskUnits="userSpaceOnUse" x="${x - 20}" y="${y - 20}" width="${w + 40}" height="${h + 40}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}g)"/></mask></defs><g mask="url(#${id})">${content}</g>`;
}

const patchD = (x, y, w, h) => `M${x + 10} ${y + 4}C${x + w * 0.4} ${y - 4} ${x + w * 0.7} ${y + 6} ${x + w - 8} ${y + 2}C${x + w + 4} ${y + h * 0.4} ${x + w - 2} ${y + h * 0.7} ${x + w - 6} ${y + h - 4}C${x + w * 0.6} ${y + h + 4} ${x + w * 0.3} ${y + h - 4} ${x + 6} ${y + h}C${x - 4} ${y + h * 0.6} ${x + 2} ${y + h * 0.3} ${x + 10} ${y + 4}Z`;

{
  const V = [0, 0, 300, 240];
  const A = P.yellow, B = P.magenta;
  const drop = (x, y) => `<path d="M${x} ${y}C${x + 6} ${y + 10} ${x + 6} ${y + 18} ${x} ${y + 18}C${x - 6} ${y + 18} ${x - 6} ${y + 10} ${x} ${y}Z" fill="#74c0fc"/>`;
  strip('m03-l02-load', 'Loading a sponge with two colors, in five pictures. 1: wet the sponge and squeeze it until it is only damp. 2: rub the left half of the sponge on yellow and the right half on pink, side by side. 3: dab it on the plate a few times so the colors meet softly in the middle. 4: dab it on the paper, then dab a little left and right over the middle. Done: a smooth blend from yellow to pink with a soft overlap zone.', [
    paperPanel(spongeBottom(150, 100, 150, 80) + arrow([[40, 100], [70, 100]], { width: 3 }) + arrow([[260, 100], [230, 100]], { width: 3 }) + drop(140, 170) + drop(165, 192), V, '1', 'Damp, not wet'),
    paperPanel(cakeTop(95, 170, 42, A) + cakeTop(205, 170, 42, B) + spongeBottom(150, 70, 150, 70, [A, B], { soft: 0.02 }), V, '2', 'Two colors, side by side'),
    paperPanel(plate(150, 120, 108) + gradPatch(patchD(70, 85, 160, 70), [70, 85, 160, 70], [A, A, B, B], { seed: 3 }) + arrow([[150, 30], [150, 70]], { width: 3 }), V, '3', 'Dab on the plate'),
    paperPanel(`<rect x="20" y="30" width="260" height="190" rx="6" fill="#fff" stroke="#e3ddd5"/>` + gradPatch(patchD(45, 70, 210, 100), [45, 70, 210, 100], [A, A, B, B], { seed: 4 })
      + arrow([[130, 200], [105, 200]], { width: 3, head: 8 }) + arrow([[170, 200], [195, 200]], { width: 3, head: 8 }) + label(150, 56, 'dab, dab, dab', { size: 18, color: ACCENT }), V, '4', 'Dab, then blend the middle'),
    paperPanel(`<rect x="20" y="30" width="260" height="190" rx="6" fill="#fff" stroke="#e3ddd5"/>` + gradPatch(patchD(45, 70, 210, 100), [45, 70, 210, 100], [A, A, B, B], { seed: 4 })
      + `<path d="M118 186V194H182V186" fill="none" stroke="${INK}" stroke-width="2"/>` + label(150, 214, 'overlap zone', { size: 17, halo: false }), V, 'Done', 'Smooth blend'),
  ], { pw: 190 });
}

{
  // Gradient zones and fading into the skin, on a tan forearm.
  const A = P.sky, B = P.purple;
  const arm = forearm('tan');
  const zones = clipTo(ARMCLIP, gradPatch(patchD(48, 68, 214, 92), [48, 68, 214, 92], [A, A, B, B], { seed: 8, soft: 3 }));
  const fadeD = 'M30 108C30 60 120 52 160 54C230 56 280 70 282 106C284 150 220 162 160 160C90 160 30 156 30 108Z';
  const fade = clipTo(ARMCLIP, `<defs><radialGradient id="fadeR" cx="0.5" cy="0.5" r="0.5"><stop offset="0.45" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><mask id="fadeM" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="200"><rect x="30" y="52" width="254" height="110" fill="url(#fadeR)"/></mask></defs>`
    + `<g mask="url(#fadeM)">${gradPatch(fadeD, [30, 52, 254, 110], [A, A, B, B], { seed: 9, soft: 2 })}</g>`);
  strip('m03-l02-zones', 'Two gradients on a tan forearm. Left, the three zones of a gradient: pure blue on one end, pure purple on the other, and a soft overlap zone in the middle where they mix. Right, the same blend with edges faded into the skin: the sponge is pressed more lightly and with less paint toward the outside, so there is no hard border.', [
    paperPanel(arm + zones + `<path d="M58 176V186H128V176M136 176V186H178V176M186 176V186H254V176" fill="none" stroke="${INK}" stroke-width="2"/>`
      + label(93, 206, 'blue', { size: 16, halo: false }) + label(157, 206, 'overlap', { size: 16, bold: true, halo: false }) + label(220, 206, 'purple', { size: 16, halo: false }), [0, 20, 300, 200], '1', 'Three zones'),
    paperPanel(arm + fade + arrow([[150, 30], [80, 30]], { width: 2.5, head: 8 }) + arrow([[160, 30], [240, 30]], { width: 2.5, head: 8 }) + label(155, 206, 'lighter at the edges', { size: 16, halo: false }), [0, 20, 300, 200], '2', 'Edges fade into skin'),
  ], { pw: 330, arrows: false });
}

{
  // Good vs common problems.
  const V = [0, 0, 300, 200];
  const A = P.yellow, B = P.magenta;
  const box = (inner) => `<rect x="20" y="20" width="260" height="160" rx="6" fill="#fff"/>` + inner;
  const R = [40, 50, 220, 100], D = patchD(...R);
  const streaks = Array.from({ length: 9 }, (_, i) => `<path d="M42 ${58 + i * 10}C110 ${54 + i * 10} 190 ${62 + i * 10} 258 ${56 + i * 10}" stroke="${i % 2 ? '#ffffff' : 'rgba(0,0,0,0.12)'}" stroke-width="${i % 3 ? 2 : 4}" opacity="0.7" fill="none"/>`).join('');
  const rnd = rng(12);
  const gaps = Array.from({ length: 34 }, () => dot(45 + rnd() * 210, 55 + rnd() * 90, 3 + rnd() * 6, '#ffffff')).join('');
  strip('m03-l02-problems', 'A good gradient and four common problems. Good: a smooth blend, dabbed, with a soft overlap. Streaks: lines left by wiping the sponge instead of dabbing. Hard line: the two colors meet in a sharp edge because they were not overlapped. Patchy: white gaps from a dry sponge or too few dabs. Muddy: yellow and purple, opposite colors, turn brownish where they overlap.', [
    good(paperPanel(box(gradPatch(D, R, [A, A, B, B], { seed: 21 })) + tick(150, 172, 16), V, 'Good', 'Dabbed, soft')),
    bad(paperPanel(box(clipTo(D, spongeFill(D, [A, A, B, B], { soft: 0 }) + streaks)) + cross(150, 172, 16), V, 'Streaks', 'Wiped')),
    bad(paperPanel(box(clipTo(D, `<rect x="30" y="40" width="120" height="120" fill="${A}"/><rect x="150" y="40" width="120" height="120" fill="${B}"/>`)) + cross(150, 172, 16), V, 'Hard line', 'No overlap')),
    bad(paperPanel(box(clipTo(D, spongeFill(D, [A, A, B, B], { soft: 2 }) + gaps)) + cross(150, 172, 16), V, 'Patchy', 'Gaps')),
    bad(paperPanel(box(gradPatch(D, R, [A, MIX.mud, P.purple], { seed: 22 })) + cross(150, 172, 16), V, 'Muddy', 'Opposite colors')),
  ], { pw: 170, gap: 22, arrows: false });
}

{
  // On the arm, step by step (tan skin).
  const A = P.yellow, B = P.orange, C = P.red;
  const V = [0, 20, 300, 180];
  const arm = forearm('tan');
  const D = patchD(60, 70, 190, 84), R = [60, 70, 190, 84];
  strip('m03-l02-arm', 'A sunset gradient on the inner forearm in four pictures. 1: dab the light color, yellow, over the whole patch. 2: load orange and red side by side and dab them over the right half, overlapping the yellow. 3: dab the overlap with the cleaner edge of the sponge until it is smooth. Done: yellow fading to orange and red, with the outer edges dabbed lightly so they fade into the skin.', [
    paperPanel(arm + clipTo(ARMCLIP, gradPatch(D, R, [A, A], { seed: 30 })), V, '1', 'Light color first'),
    paperPanel(arm + clipTo(ARMCLIP, gradPatch(D, R, [A, A], { seed: 30 }) + gradPatch(patchD(150, 72, 100, 80), [150, 72, 100, 80], [B, C], { seed: 31 })), V, '2', 'Dark colors over it'),
    paperPanel(arm + clipTo(ARMCLIP, gradPatch(D, R, [A, A, B, C], { seed: 32 })) + spongeBottom(160, 40, 70, 34, A) + arrow([[160, 62], [160, 80]], { width: 2.5, head: 8 }), V, '3', 'Dab the middle'),
    paperPanel(arm + clipTo(ARMCLIP, faded(gradPatch(patchD(40, 56, 230, 110), [40, 56, 230, 110], [A, A, B, C], { seed: 33 }), [40, 56, 230, 110])), V, 'Done', 'Soft edges'),
  ], { pw: 220 });
}

// ===================================================================================
// 03.3 Light and dark: white highlights and black outlines
// ===================================================================================

// Heart curve points around (cx, cy), scale s (about 32 * s wide). t from t0 to t1 (0 = top dip, PI = bottom tip).
function heartPts(cx, cy, s, t0 = 0, t1 = 2 * Math.PI, n = 40, shrink = 1) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + (t1 - t0) * (i / n);
    const x = 16 * Math.sin(t) ** 3, y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    out.push([cx + x * s * shrink, cy + (y + 2) * s * shrink]);
  }
  return out;
}
const heartFill = (cx, cy, s, color) => `<path d="${polyD(heartPts(cx, cy, s, 0, 2 * Math.PI, 90), true)}" fill="${color}"/>`;
// Thin-thick outline: thicker on the shadow side (right and bottom), thinner on the light side.
const heartOutline = (cx, cy, s, { thin = 2.2, thick = 6, color = P.black, even = false } = {}) => even
  ? `<path d="${polyD(heartPts(cx, cy, s, 0, 2 * Math.PI, 90), true)}" fill="none" stroke="${color}" stroke-width="${thick * 1.6}" stroke-linejoin="round"/>`
  : stroke(heartPts(cx, cy, s, 0.05, Math.PI, 24), { w: thick, color }) + stroke(heartPts(cx, cy, s, Math.PI, 2 * Math.PI - 0.05, 24), { w: thin, color });
// Highlight on the upper-left lobe (light from the top left), or anywhere with deg.
const heartShine = (cx, cy, s, { side = 'left' } = {}) => {
  const k = side === 'left' ? 1 : -1;
  const pts = heartPts(cx, cy, s, Math.PI * 1.5, Math.PI * 1.82, 8, 0.72).map(([x, y]) => [cx + (x - cx) * k, y - s * 1.2]);
  return stroke(pts, { w: 4.5 * s / 3, color: P.white }) + dot(pts[0][0] + k * 4 * s / 3 - (side === 'left' ? 2 : -2), pts[0][1] + 9 * s / 3, 2.2 * s / 3, P.white);
};

// Sun icon (light direction).
const sun = (x, y, r = 16) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffd43b" stroke="#f59f00" stroke-width="2"/>`
  + Array.from({ length: 8 }, (_, i) => { const [a, b] = [pol(x, y, r + 5, i * 45), pol(x, y, r + 13, i * 45)]; return `<path d="M${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}" stroke="#f59f00" stroke-width="3" stroke-linecap="round"/>`; }).join('');

// Ball with a highlight at angle deg (225 = top left).
const ball = (cx, cy, r, color, deg = 225, outline = true) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`
  + (outline ? stroke(Array.from({ length: 13 }, (_, i) => pol(cx, cy, r, deg + 20 + i * 26.7)), { w: 5, color: P.black }) : '')
  + stroke(Array.from({ length: 5 }, (_, i) => pol(cx, cy, r * 0.68, deg - 30 + i * 15)), { w: 5, color: P.white }) + dot(...pol(cx, cy, r * 0.62, deg + 42), 2.6, P.white);

// Star with highlight on the side facing deg.
const shinyStar = (cx, cy, r, color, deg = 225) => star(cx, cy, r, color, { outline: P.black, ow: 3.5 })
  + stroke([pol(cx, cy, r * 0.3, deg - 32), pol(cx, cy, r * 0.27, deg), pol(cx, cy, r * 0.3, deg + 32)], { w: 4, color: P.white });

{
  const V = [0, 0, 260, 240];
  const H = (extra) => heartFill(130, 120, 4.4, P.pink) + extra;
  strip('m03-l03-pop', 'Making a plain heart pop in four pictures. 1: a flat pink heart. 2: a thin black outline that is thicker on the right and bottom. 3: a white curved highlight and a dot on the upper left. Done: the same heart with a few white dots and a sparkle around it, now bright and easy to see.', [
    paperPanel(H(''), V, '1', 'Flat shape'),
    paperPanel(H(heartOutline(130, 120, 4.4)), V, '2', 'Thin-thick outline'),
    paperPanel(H(heartOutline(130, 120, 4.4) + heartShine(130, 120, 4.4)) + sun(30, 30, 12), V, '3', 'Highlight, top left'),
    paperPanel(H(heartOutline(130, 120, 4.4) + heartShine(130, 120, 4.4))
      + `<g stroke="#868e96" stroke-width="1.6">${sparkle(222, 46, 18, P.white)}${dots([[34, 120], [44, 180], [80, 214]], 4, 6, 3, P.white)}</g>`, V, 'Done', 'It pops'),
  ], { pw: 200 });
}

{
  const V = [0, 0, 420, 200];
  const row = (deg) => ball(80, 110, 46, P.sky, deg[0]) + heartFill(210, 110, 3.3, P.red) + heartOutline(210, 110, 3.3, { thick: 4.5, thin: 1.8 }) + heartShine(210, 110, 3.3, { side: deg[1] }) + shinyStar(340, 112, 56, P.yellow, deg[2]);
  strip('m03-l03-light', 'One light direction. Good: the sun is at the top left, and the ball, the heart and the star all have their white highlight on the top left, so they look like one picture. Avoid: the highlights are on different sides, so the shapes look flat and confusing.', [
    good(paperPanel(row([225, 'left', 225]) + sun(28, 28, 13) + tick(400, 182, 16), V, 'Good', 'All lit from the top left')),
    bad(paperPanel(row([20, 'right', 110]) + cross(400, 182, 16), V, 'Avoid', 'Light from everywhere')),
  ], { pw: 340, arrows: false });
}

{
  // Outlines: where they help.
  const V = [0, 0, 260, 230];
  const leaf = (x, y, deg, len, w) => petal(x, y, deg, len, w, P.green);
  const flower = (o) => [0, 72, 144, 216, 288].map((a) => petal(130, 112, a - 90, 70, 46, P.violet)).join('') + dot(130, 112, 16, P.yellow) + o;
  // Outline along the real petal edges: thin on one side, thicker on the other.
  const edge = (deg, k) => { const base = [130, 112], tip = pol(130, 112, 70, deg), m = pol(130, 112, 35, deg), a = pol(m[0], m[1], 46 / 2 * 1.15, deg + k * 90);
    return Array.from({ length: 9 }, (_, i) => { const t = 0.12 + 0.88 * i / 8, u = 1 - t; return [u * u * base[0] + 2 * u * t * a[0] + t * t * tip[0], u * u * base[1] + 2 * u * t * a[1] + t * t * tip[1]]; }); };
  const petOut = [0, 72, 144, 216, 288].map((a) => stroke(edge(a - 90, -1), { w: 2.6, kind: 'end' }) + stroke(edge(a - 90, 1), { w: 5.5, kind: 'end' })).join('');
  const petShine = [0, 72, 144, 216, 288].map((a) => stroke([pol(130, 112, 30, a - 98), pol(130, 112, 42, a - 100), pol(130, 112, 52, a - 97)], { w: 3.5, color: P.white })).join('');
  const evenOut = [0, 72, 144, 216, 288].map((a) => `<path d="${petal(130, 112, a - 90, 70, 46, 'none').match(/d="([^"]+)"/)[1]}" fill="none" stroke="${P.black}" stroke-width="9" stroke-linejoin="round"/>`).join('');
  strip('m03-l03-outline', 'Outlines that help and outlines that hurt. Good: thin black lines that are thicker on one side, only around the outside of the flower, with white highlights. Avoid: a thick, even black line around every petal, which swallows the color and looks heavy. Avoid: no outline at all on a pale flower, so the shape gets lost.', [
    good(paperPanel(leaf(80, 190, 200, 70, 30) + flower(petOut + petShine + dot(130, 112, 16, P.yellow) + dot(125, 107, 4, P.white)) + tick(234, 210, 16), V, 'Good', 'Thin-thick, only outside')),
    bad(paperPanel(leaf(80, 190, 200, 70, 30) + flower(evenOut + dot(130, 112, 16, P.yellow)) + cross(234, 210, 16), V, 'Avoid', 'Thick everywhere')),
    bad(paperPanel(petal(80, 190, 200, 70, 30, MIX.mint) + [0, 72, 144, 216, 288].map((a) => petal(130, 112, a - 90, 70, 46, '#e6dcf7')).join('') + dot(130, 112, 16, '#fff3bf') + cross(234, 210, 16), V, 'Avoid', 'Pale, no outline')),
  ], { pw: 200, arrows: false });
}

{
  // On a deep skin tone: flat versus outlined and highlighted (cheek close-up).
  const view = [60, 180, 230, 200];
  const design = (finish) => {
    const s = 2.1, hx0 = 142, hy0 = 314;
    let o = heartFill(hx0, hy0, s, P.pink) + star(110, 262, 17, P.yellow) + star(166, 262, 10, P.sky);
    if (finish) o += heartOutline(hx0, hy0, s, { thick: 4.2, thin: 1.8 }) + heartShine(hx0, hy0, s)
      + star(110, 262, 17, 'none', { outline: P.black, ow: 2.4 }) + stroke([[106, 258], [104, 262], [106, 266]], { w: 2.6, color: P.white })
      + star(166, 262, 10, 'none', { outline: P.black, ow: 2 }) + dots([[134, 286], [148, 280], [162, 284]], 3, 2.8, 2.8, P.white) + sparkle(182, 296, 8, P.white);
    return o;
  };
  strip('m03-l03-skin', 'The same small cheek design on deep skin, before and after. Before: a flat pink heart and two stars, which look soft and a little lost on the dark skin. After: the same shapes with thin black outlines, white highlights on the upper left and a few white dots, so the design stands out clearly.', [
    { content: face(design(false), 'deep'), view, label: 'Before', labelColor: SOFT, caption: 'Flat colors' },
    { content: face(design(true), 'deep'), view, label: 'After', labelColor: OK, caption: 'Outline + highlight' },
  ], { pw: 300 });
}

// ===================================================================================
// 03.4 Symmetry and the face map
// ===================================================================================

// The design used in this lesson, one element at a time (left side; mirror for the right).
const SYM = {
  swirl: () => stroke([[178, 172], [152, 160], [126, 165], [110, 182], [116, 198], [130, 194]], { w: 10, color: P.purple, kind: 'end' }),
  drops: () => teardrop(146, 140, 80, 26, 11, P.teal) + teardrop(122, 150, 60, 22, 9, P.teal) + teardrop(170, 142, 100, 22, 9, P.teal),
  dots: () => dots([[122, 264], [136, 276], [154, 282]], 4, 5.5, 2.6, P.magenta),
  centre: () => dot(200, 166, 9, P.sky) + `<circle cx="200" cy="166" r="9" fill="none" stroke="${P.black}" stroke-width="1.6"/>` + dot(197, 163, 2.6, P.white),
};
const marks = (side = 'both', color = '#e03131') => {
  const pts = [L.browOutL, L.eyeOutL, L.cheekboneL, L.browInL];
  const one = pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="none" stroke="${color}" stroke-width="2"/>`).join('');
  return (side !== 'right' ? one : '') + (side !== 'left' ? mirror(one) : '');
};
const cLine = `<path d="M200 70V430" stroke="#e03131" stroke-width="1.6" stroke-dasharray="6 6"/>`;

{
  // The face map with lines and landmarks (medium skin), labels at the sides.
  const lines = [
    [190, 'brow line'], [226, 'eye line'], [300, 'under-nose line'], [352, 'mouth line'],
  ];
  const LC = '#1c7ed6';
  let o = `<g transform="translate(150 -30)">` + face('', 'medium', '', { eyes: 'open' });
  o += `<path d="M200 70V440" stroke="#e03131" stroke-width="2" stroke-dasharray="7 6"/>`;
  for (const [y] of lines) o += `<path d="M84 ${y}H316" stroke="${LC}" stroke-width="1.6" stroke-dasharray="5 5"/>`;
  const lm = [[L.browOutL, '1'], [L.eyeOutL, '2'], [L.cheekboneL, '3'], [L.mouthL, '4'], [L.chin, '5']];
  for (const [[x, y], n] of lm) o += badge(x, y, n, { color: '#e03131', r: 9 });
  for (const [[x, y]] of lm.slice(0, 4)) o += `<circle cx="${400 - x}" cy="${y}" r="6" fill="#ffffff" stroke="#e03131" stroke-width="2.5"/>`;
  o += `</g>`;
  for (const [y, t] of lines) o += label(222, y - 25, t, { size: 15, color: LC, anchor: 'end' });
  o += label(350, 30, 'center line', { size: 16, bold: true, color: '#e03131' });
  const key = [['1', 'end of the brow'], ['2', 'outer eye corner'], ['3', 'cheekbone'], ['4', 'mouth corner'], ['5', 'chin (on the center line)']];
  key.forEach(([n, t], i) => { o += badge(500, 150 + i * 46, n, { color: '#e03131', r: 12 }) + label(522, 156 + i * 46, t, { size: 15, anchor: 'start' }); });
  o += label(500, 395, 'Measure from these points,', { size: 14, color: SOFT, anchor: 'start' }) + label(500, 415, 'not from the hairline.', { size: 14, color: SOFT, anchor: 'start' });
  // number labels on the left side landmarks
  plain('m03-l04-map', 'The face map on a medium skin tone. A red dashed center line runs down the middle of the forehead, nose, lips and chin. Blue dashed lines cross the face at the brows, the eyes, under the nose and at the mouth. Red circles mark the landmarks on both sides: 1 the end of the brow, 2 the outer eye corner, 3 the cheekbone, 4 the mouth corner, and 5 the chin on the center line.', 720, 470,
    o);
}

{
  // Paper first: paint one half on the half-face template, then mirror it onto a full face.
  const V = [40, 60, 320, 380];
  const tmpl = (content, half = false) => {
    const f = faceSVG({ template: true, eyes: 'closed', parts: 'all', centre: true });
    return (half ? clipTo('M-10 0H206V600H-10Z', f + content) : f + content);
  };
  const leftDesign = SYM.swirl() + SYM.drops() + SYM.dots() + clipTo('M0 0H200V500H0Z', SYM.centre());
  strip('m03-l04-paper', 'Planning on paper in three pictures. 1: paint the left half of the design on the half-face template: a purple swirl over the brow, teal teardrops above it, pink dots on the cheekbone and half of a blue center dot. 2: copy each part onto the other half of a full face template, as if in a mirror, measuring from the same landmarks. Done: the whole design, the same on both sides.', [
    paperPanel(tmpl(leftDesign, true), V, '1', 'Paint one half'),
    paperPanel(tmpl(leftDesign + `<g opacity="0.35">${mirror(SYM.swirl() + SYM.drops() + SYM.dots())}</g>` + SYM.centre()) + arrow([[150, 110], [200, 92], [250, 110]], { width: 2.5 }), V, '2', 'Mirror it across'),
    paperPanel(tmpl(both(SYM.swirl() + SYM.drops() + SYM.dots()) + SYM.centre()), V, 'Done', 'Both halves match'),
  ], { pw: 220 });
}

{
  // On the face: element by element, switching sides (light skin).
  const view = [60, 100, 280, 230];
  const F = (under, over = '') => ({ content: face(under, 'light', over, { eyes: 'closed' }), view });
  strip('m03-l04-steps', 'Painting a symmetrical design on the face, element by element, in five pictures. 1: mark the center line and small dots at the landmarks with a light color. 2: paint the purple swirl over the left brow. 3: paint the same swirl over the right brow right away, checking the landmarks. 4: add the teardrops on one side, then the other, then the pink cheekbone dots the same way. Done: add the blue center dot on the center line and check in a mirror.', [
    { ...F('', cLine + marks()), label: '1', caption: 'Center line, landmarks' },
    { ...F(SYM.swirl(), marks('right')), label: '2', caption: 'One element, one side' },
    { ...F(both(SYM.swirl())), label: '3', caption: 'Same element, other side' },
    { ...F(both(SYM.swirl() + SYM.drops() + SYM.dots())), label: '4', caption: 'Next element, both sides' },
    { ...F(both(SYM.swirl() + SYM.drops() + SYM.dots()) + SYM.centre()), label: 'Done', caption: 'Center dot, then check' },
  ], { pw: 190, gap: 34 });
}

{
  // Good vs avoid.
  const view = [60, 100, 280, 230];
  const F = (under) => face(under, 'medium', '', { eyes: 'closed' });
  const right = (dy, k = 1) => `<g transform="translate(400 0) scale(-1 1)"><g transform="translate(150 ${170 + dy}) scale(${k}) translate(-150 -170)">${SYM.swirl() + SYM.drops()}</g></g>`;
  strip('m03-l04-check', 'Checking symmetry. Good: the swirls and teardrops sit at the same height and size on both sides. Avoid: the right side sits higher than the left. Avoid: the right side is bigger than the left. Both mistakes are easy to see in a mirror from about a meter away or in a photo.', [
    { content: F(SYM.swirl() + SYM.drops() + right(0)) + tick(320, 312, 16), view, label: 'Good', labelColor: OK, caption: 'Same height, same size' },
    { content: F(SYM.swirl() + SYM.drops() + right(-18)) + `<path d="M84 165H316" stroke="#e03131" stroke-width="1.6" stroke-dasharray="5 5"/>` + cross(320, 312, 16), view, label: 'Avoid', caption: 'One side higher' },
    { content: F(SYM.swirl() + SYM.drops() + right(0, 1.3)) + cross(320, 312, 16), view, label: 'Avoid', caption: 'One side bigger' },
  ], { pw: 220, arrows: false });
}

// ===================================================================================
// 03.5 Color combinations that always work
// ===================================================================================

// The small practice design (flower, two leaves, a swirl, dots) in any palette.
// pal: { petal, centre, leaf, swirl, dots }
function motif(cx, cy, s, pal, { outline = true, shine = true } = {}) {
  const o = [];
  o.push(stroke([[cx + 20 * s, cy + 6 * s], [cx + 60 * s, cy + 20 * s], [cx + 80 * s, cy - 6 * s], [cx + 66 * s, cy - 26 * s], [cx + 52 * s, cy - 16 * s]], { w: 8 * s, color: pal.swirl, kind: 'end' }));
  o.push(petal(cx - 10 * s, cy + 22 * s, 150, 50 * s, 24 * s, pal.leaf), petal(cx + 8 * s, cy + 26 * s, 60, 46 * s, 22 * s, pal.leaf));
  for (const a of [0, 72, 144, 216, 288]) o.push(petal(cx, cy, a - 90, 40 * s, 30 * s, pal.petal));
  if (outline) for (const a of [0, 72, 144, 216, 288]) {
    const tip = pol(cx, cy, 40 * s, a - 90), m = pol(cx, cy, 20 * s, a - 90), side = pol(m[0], m[1], 15 * 1.15 * s, a);
    o.push(stroke(Array.from({ length: 8 }, (_, i) => { const t = 0.3 + 0.7 * i / 7, u = 1 - t; return [u * u * cx + 2 * u * t * side[0] + t * t * tip[0], u * u * cy + 2 * u * t * side[1] + t * t * tip[1]]; }), { w: 3 * s, kind: 'end' }));
  }
  o.push(dot(cx, cy, 10 * s, pal.centre));
  if (shine) for (const a of [0, 72, 144, 216, 288]) o.push(stroke([pol(cx, cy, 18 * s, a - 100), pol(cx, cy, 28 * s, a - 101)], { w: 2.6 * s, color: P.white }));
  o.push(dots([[cx - 44 * s, cy - 20 * s], [cx - 50 * s, cy + 2 * s], [cx - 40 * s, cy + 22 * s]], 3, 5 * s, 3 * s, pal.dots));
  if (shine) o.push(dot(cx - 3 * s, cy - 3 * s, 2.6 * s, P.white));
  return o.join('');
}

const PALS = {
  analogous: { name: 'Analogous', petal: P.magenta, centre: '#ffc2dc', leaf: P.purple, swirl: P.violet, dots: P.pink },
  complementary: { name: 'Complementary', petal: P.blue, centre: MIX.orange, leaf: P.navy, swirl: P.sky, dots: MIX.orange },
  mono: { name: 'Monochrome + accent', petal: P.green, centre: P.yellow, leaf: MIX.darkGreen, swirl: P.lime, dots: P.yellow },
};
const chips = (x, y, cols, r = 13) => cols.map((c, i) => `<circle cx="${x + i * (r * 2 + 8)}" cy="${y}" r="${r}" fill="${c}" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/>`).join('');

{
  // Four kinds of combination on the wheel, each with its swatch row.
  const V = [0, 0, 260, 290];
  const panel = (sel, sw, extra = '') => wheel(130, 118, 92, { dim: sel }) + `<circle cx="130" cy="118" r="38" fill="#fff"/>` + extra + chips(130 - (sw.length - 1) * 17, 254, sw, 13);
  const conn = (i, j) => { const a = pol(130, 118, 66, wheelAng(i)), b = pol(130, 118, 66, wheelAng(j)); return `<path d="M${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}" stroke="${INK}" stroke-width="3" stroke-dasharray="6 5"/>`; };
  strip('m03-l05-schemes', 'Four kinds of color combination on the color wheel. Analogous: three neighbors, here red, orange and yellow. Complementary: two opposites, here blue and orange. Monochrome plus accent: light, middle and dark purple with one small yellow accent. Warm and cool: the warm half of the wheel is red, orange and yellow; the cool half is green, blue and purple.', [
    paperPanel(panel([0, 1, 2], [P.red, MIX.orange, P.yellow]), V, '1', 'Analogous: neighbors'),
    paperPanel(panel([1, 4], [P.blue, MIX.orange]) + conn(1, 4), V, '2', 'Complementary: opposites'),
    paperPanel(panel([5], [mix(MIX.purple, '#ffffff', 0.55), MIX.purple, mix(MIX.purple, '#000000', 0.45), P.yellow]) + `<circle cx="130" cy="118" r="15" fill="${P.yellow}" stroke="${INK}" stroke-width="2"/>`, V, '3', 'Monochrome + accent'),
    paperPanel(wheel(130, 118, 92) + `<circle cx="130" cy="118" r="38" fill="#fff"/><path d="M${n1(pol(130, 118, 104, 0)[0])} ${n1(pol(130, 118, 104, 0)[1])}L${n1(pol(130, 118, 104, 180)[0])} ${n1(pol(130, 118, 104, 180)[1])}" stroke="${INK}" stroke-width="3"/>`
      + label(130, 100, 'warm', { size: 18, bold: true, color: '#d9480f' }) + label(130, 150, 'cool', { size: 18, bold: true, color: '#1c7ed6' }) + chips(130 - 5 * 17, 254, [P.red, MIX.orange, P.yellow, MIX.green, P.blue, MIX.purple], 13), V, '4', 'Warm and cool'),
  ], { pw: 200, gap: 24, arrows: false });
}

{
  // One design, three palettes (the mini-project).
  const V = [0, 0, 260, 250];
  const card = (pal) => motif(120, 106, 1.25, pal) + ((cs) => chips(130 - (cs.length - 1) * 15, 224, cs, 11))([pal.petal, pal.leaf, pal.swirl, pal.centre, pal.dots].filter((c, i, a) => a.indexOf(c) === i));
  strip('m03-l05-three', 'The same small design, a flower with two leaves, a swirl and three dots, painted in three palettes. Analogous: magenta petals, purple leaves, violet swirl, pink dots and a pale pink center. Complementary: blue petals, navy leaves, sky-blue swirl and orange center and dots. Monochrome plus accent: green petals, dark green leaves, lime swirl and a yellow center and dots as the accent.', [
    paperPanel(card(PALS.analogous), V, 'A', 'Analogous'),
    paperPanel(card(PALS.complementary), V, 'B', 'Complementary'),
    paperPanel(card(PALS.mono), V, 'C', 'Monochrome + accent'),
  ].map((p) => ({ ...p, labelColor: INK })), { pw: 220, arrows: false });
}

{
  // 60-30-10 on a cheek (brown skin).
  const D = 'M100 270C122 248 168 252 182 280C196 308 190 348 164 366C136 382 106 372 98 344C90 320 88 290 100 270Z';
  const base = gradPatch(D, [88, 248, 106, 134], [P.sky, P.blue], { seed: 50, deg: 90 });
  const petals = [0, 60, 120, 180, 240, 300].map((a) => petal(140, 312, a - 90, 34, 24, P.purple)).join('')
    + [0, 60, 120, 180, 240, 300].map((a) => { const tip = pol(140, 312, 34, a - 90), m = pol(140, 312, 17, a - 90), sd = pol(m[0], m[1], 14, a); return stroke(Array.from({ length: 8 }, (_, i) => { const t = 0.3 + 0.7 * i / 7, u = 1 - t; return [u * u * 140 + 2 * u * t * sd[0] + t * t * tip[0], u * u * 312 + 2 * u * t * sd[1] + t * t * tip[1]]; }), { w: 2.6, kind: 'end' }); }).join('');
  const accent = dot(140, 312, 8, P.yellow) + dots([[112, 278], [126, 270], [142, 268]], 3, 3, 4, P.yellow) + sparkle(172, 282, 9, P.yellow);
  const design = face(faded(base, [84, 244, 114, 142], 0.55) + petals + accent, 'brown', '', { eyes: 'open' });
  const bar = (x, y) => {
    const w = 300, segs = [[0.6, P.blue, 'main 60%'], [0.3, P.purple, 'second 30%'], [0.1, P.yellow, 'accent 10%']];
    let cx = x, o = '';
    segs.forEach(([f, c]) => { o += `<rect x="${cx}" y="${y}" width="${w * f}" height="44" fill="${c}"/>`; cx += w * f; });
    o += `<rect x="${x}" y="${y}" width="${w}" height="44" fill="none" stroke="${INK}" stroke-width="2"/>`;
    o += label(x + w * 0.3, y + 74, 'main 60%', { size: 16, bold: true }) + label(x + w * 0.75, y + 74, '30%', { size: 16, bold: true }) + label(x + w * 0.95, y - 14, '10%', { size: 16, bold: true });
    o += label(x + w * 0.3, y + 96, 'blue gradient', { size: 14, color: SOFT }) + label(x + w * 0.75, y + 96, 'purple petals', { size: 14, color: SOFT }) + label(x + w * 0.95, y - 34, 'yellow dots', { size: 14, color: SOFT });
    return o;
  };
  plain('m03-l05-60-30-10', 'The 60-30-10 rule on a cheek design on brown skin. About 60 percent of the painted area is the main color, a blue sponge gradient. About 30 percent is the second color, purple petals with thin black outlines. About 10 percent is the accent, small yellow dots, a yellow flower center and a sparkle. A bar beside the face shows the three shares.', 760, 460,
    `<svg x="10" y="10" width="330" height="440" viewBox="50 60 300 400">${design}</svg>` + bar(400, 200));
}

{
  // The same palette on different skin tones.
  const view = [70, 200, 150, 150];
  const small = (white) => (white ? star(140, 278, 30, '#ffffff') + dot(110, 248, 9, '#ffffff') + dot(172, 316, 7, '#ffffff') : '')
    + star(140, 278, 30, P.yellow) + dot(110, 248, 9, MIX.orange) + dot(172, 316, 7, P.pink);
  const sheer = (c) => `<g opacity="0.55">${c}</g>`;
  const outl = star(140, 278, 30, 'none', { outline: P.black, ow: 2.4 }) + stroke([[132, 266], [128, 274], [131, 282]], { w: 2.6, color: P.white });
  strip('m03-l05-skin', 'The same yellow star with orange and pink dots on three skin tones. Light skin: the colors show clearly. Deep skin, painted straight on: the yellow and orange look thin and see-through. Deep skin with a thin layer of white painted underneath first and left to dry: the same colors are bright and solid. All three have a thin black outline and a white highlight.', [
    { content: face(small(false) + outl, 'light'), view, label: 'Light skin', labelColor: OK, caption: 'Colors show well' },
    { content: face(sheer(small(false)) + outl, 'deep'), view, label: 'Deep skin', labelColor: BAD, caption: 'Yellow looks thin' },
    { content: face(small(true) + outl, 'deep'), view, label: 'Deep skin', labelColor: OK, caption: 'White underneath first' },
  ], { pw: 220, arrows: false });
}
