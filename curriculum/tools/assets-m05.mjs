// Module 5 diagrams (Festival Faces). Run: node curriculum/tools/assets-m05.mjs
import { plain, strip, faceLayer } from './lib/figure.mjs';
import { P, SOFT, INK, OK, BAD, label, arrow, badge, tick, cross, line, stroke, teardrop, petal, dot, dots, star, sparkle, sponge, glow, pol, spline, polyD } from './lib/art.mjs';
import { SKIN, L } from './lib/face.mjs';

const n1 = (v) => (Math.round(v * 10) / 10).toString();

// ---------- local helpers (not in the shared lib) ----------

// A face with paint below the features (eyes, brows, lips stay on top).
const face = (under, skin = 'medium', over = '', { eyes = 'open' } = {}) => faceLayer({ under, over, skin, eyes });

// Mirror across the face center line; paint one half and get both.
const mirror = (c) => `<g transform="translate(400 0) scale(-1 1)">${c}</g>`;
const both = (c) => c + mirror(c);

// Clip content to a path.
let kid = 0;
const clipTo = (d, content) => { const id = `m5c${kid++}`; return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id})">${content}</g>`; };

// A closed band between two splines (outer and inner edges, same direction).
const band = (outer, inner) => polyD([...spline(outer, 16), ...spline(inner, 16).reverse()], true);

// Pie wedge around (cx, cy) from angle a0 to a1 (degrees), radius r: used to cut a band into color blocks.
const wedge = (cx, cy, a0, a1, r = 400) => {
  const pts = [[cx, cy]];
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 6));
  for (let i = 0; i <= n; i++) pts.push(pol(cx, cy, r, a0 + ((a1 - a0) * i) / n));
  return polyD(pts, true);
};

// Embed any face-unit content in a plain canvas box (x, y, w, h) showing `view`.
const embed = (content, [vx, vy, vw, vh], x, y, w, h, { bg = '#fbf8f4', frame = true } = {}) =>
  (frame ? `<rect x="${x - 1}" y="${y - 1}" width="${w + 2}" height="${h + 2}" rx="8" fill="#fff" stroke="#e3ddd5"/>` : '')
  + `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${bg}"/>${content}</svg>`;

// Bright festival colors used across the module (saturated cake colors).
const C = {
  magenta: P.magenta, hotPink: '#ff2f8f', orange: '#ff7a12', yellow: '#ffd21f', lime: '#9be22e', teal: '#00b8a9',
  cyan: '#1fc7f2', blue: '#2563eb', purple: '#7b2fd0', violet: '#a96bf0', gold: '#e8b33a',
};
const BLACK = P.black, WHITE = P.white;

// ===================================================================================
// 05.1 Bold color for festivals
// ===================================================================================

// The color-block crescent: from above the inner brow, up and around the temple, down to the cheekbone.
const CRES_OUT = [[178, 168], [160, 150], [126, 144], [101, 166], [94, 210], [101, 250], [124, 276], [166, 280]];
const CRES_IN = [[178, 168], [156, 164], [130, 166], [116, 190], [113, 228], [122, 254], [142, 268], [166, 280]];
const CRES = band(CRES_OUT, CRES_IN);
const CC = [134, 222]; // center the color blocks fan out from
// Three blocks: forehead part, temple part, cheekbone part (angles around CC).
const BLOCKS = [[-40, -112], [-112, -196], [-196, -300]];

// Color-block crescent on one side. cols = 3 colors; opts control each layer.
function crescent(cols, { base = false, color = true, lines = true, shine = true, sheer = false, soft = false } = {}) {
  const o = [];
  if (base) o.push(`<path d="${CRES}" fill="${WHITE}"/>`);
  if (color) {
    const blocks = BLOCKS.map(([a0, a1], i) => clipTo(wedge(CC[0], CC[1], a0, a1), `<path d="${CRES}" fill="${cols[i]}"/>`)).join('');
    const f = soft ? `<defs><filter id="m5soft${kid}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>` : '';
    o.push(f + (sheer ? `<g opacity="0.5">${blocks}</g>` : soft ? `<g filter="url(#m5soft${kid++})">${blocks}</g>` : blocks));
  }
  if (lines) {
    // dividers between blocks, then the outline, thicker on the outside edge
    const div = BLOCKS.slice(1).map(([a0]) => { const a = pol(CC[0], CC[1], 0, a0), b = pol(CC[0], CC[1], 90, a0); return `<path d="M${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}" stroke="${BLACK}" stroke-width="3.4" stroke-linecap="round"/>`; }).join('');
    o.push(clipTo(CRES, div));
    o.push(line(CRES_IN, { w: 2.6, color: BLACK }), line(CRES_OUT, { w: 4, color: BLACK }));
      }
  if (shine) {
    o.push(line([[158, 158], [132, 155], [114, 168]], { w: 2.2, color: WHITE }), line([[104, 250], [114, 266]], { w: 2, color: WHITE }));
    o.push(dots([[186, 160], [168, 142], [144, 133], [118, 134]], 4, 2.4, 4.2, WHITE), dots([[176, 290], [152, 294], [126, 290]], 3, 2.4, 3.8, WHITE));
  }
  return o.join('');
}

// Third-eye diamond on the forehead center line.
function thirdEye(cols, { outline = true, shine = true } = {}) {
  const d = 'M200 112L214 138L200 164L186 138Z';
  return `<path d="${d}" fill="${cols[0]}"/>` + `<path d="M200 126L207 138L200 150L193 138Z" fill="${cols[2]}"/>`
    + (outline ? `<path d="${d}" fill="none" stroke="${BLACK}" stroke-width="2.8" stroke-linejoin="round"/>` : '')
    + (shine ? dot(200, 100, 3.2, WHITE) + dot(200, 90, 2.2, WHITE) + dot(200, 176, 2.8, WHITE) : '');
}

const SUNSET = [C.magenta, C.orange, C.yellow];
const ELECTRIC = [C.blue, C.teal, C.lime];

{
  // Four bold festival palettes, each with a test tile on a different skin tone.
  const pals = [
    ['Sunset', 'neighbors, warm', SUNSET, 'deep'],
    ['Electric', 'neighbors, cool', ELECTRIC, 'light'],
    ['Pop', 'opposites', [C.purple, C.violet, C.yellow], 'brown'],
    ['Neon look', 'brightest + black', [C.hotPink, C.cyan, C.lime], 'tan'],
  ];
  const W = 205, o = [];
  pals.forEach(([name, kind, cols, skin], i) => {
    const x = 20 + i * (W + 14), y = 18;
    o.push(`<rect x="${x}" y="${y}" width="${W}" height="330" rx="12" fill="#fff" stroke="#e3ddd5" stroke-width="2"/>`);
    o.push(label(x + W / 2, y + 32, name, { size: 19, bold: true, halo: false }));
    o.push(label(x + W / 2, y + 54, kind, { size: 14, color: SOFT, halo: false }));
    cols.forEach((c, j) => o.push(`<circle cx="${x + 40 + j * 62}" cy="${y + 96}" r="24" fill="${c}" stroke="rgba(0,0,0,0.2)" stroke-width="1.5"/>`));
    o.push(`<circle cx="${x + 70}" cy="${y + 146}" r="12" fill="${BLACK}"/><circle cx="${x + 134}" cy="${y + 146}" r="12" fill="${WHITE}" stroke="#adb5bd" stroke-width="1.5"/>`);
    o.push(label(x + W / 2, y + 151, '+', { size: 18, color: SOFT, halo: false }));
    // test tile: skin, three diagonal blocks, black lines, white dots
    const tx = x + 16, ty = y + 178, tw = W - 32, th = 128;
    const tile = `M${tx} ${ty}H${tx + tw}V${ty + th}H${tx}Z`;
    const b = (k) => `M${tx + 30 + k * 46} ${ty + th}L${tx + 70 + k * 46} ${ty}H${tx + 116 + k * 46}L${tx + 76 + k * 46} ${ty + th}Z`;
    let t = `<path d="${tile}" fill="${SKIN[skin]}"/>`;
    if (skin === 'deep' || skin === 'brown') t += [0, 1, 2].map((k) => `<path d="${b(k - 0.5)}" fill="${WHITE}"/>`).join('');
    t += [0, 1, 2].map((k) => `<path d="${b(k - 0.5)}" fill="${cols[k]}"/>`).join('');
    t += [0, 1, 2, 3].map((k) => `<path d="M${tx + 7 + k * 46} ${ty + th}L${tx + 47 + k * 46} ${ty}" stroke="${BLACK}" stroke-width="5" stroke-linecap="round"/>`).join('');
    t += [0, 1, 2].map((k) => dot(tx + 52 + k * 46, ty + 30, 4, WHITE) + dot(tx + 44 + k * 46, ty + 48, 2.6, WHITE)).join('');
    o.push(clipTo(`M${tx + 8} ${ty}H${tx + tw - 8}Q${tx + tw} ${ty} ${tx + tw} ${ty + 8}V${ty + th - 8}Q${tx + tw} ${ty + th} ${tx + tw - 8} ${ty + th}H${tx + 8}Q${tx} ${ty + th} ${tx} ${ty + th - 8}V${ty + 8}Q${tx} ${ty} ${tx + 8} ${ty}Z`, t));
    o.push(label(x + W / 2, y + 322, `on ${skin} skin`, { size: 13, color: SOFT, halo: false }));
  });
  plain('m05-l01-palettes', 'Four bold festival palettes, each with black and white and a test tile on skin. Sunset: magenta, orange and yellow, warm neighbors, on deep skin with white painted under the colors. Electric: blue, teal and lime, cool neighbors, on light skin. Pop: purple and violet with yellow, opposites, on brown skin. Neon look: hot pink, cyan and lime, the brightest cake colors, on tan skin. Every tile has black lines between the colors and white dots.', 900, 366, o.join(''));
}

{
  // Color blocking step by step on deep skin, mirrored.
  const view = [70, 90, 260, 230];
  const F = (under, over = '') => ({ content: face(under, 'deep', over), view });
  const sketch = line(CRES_OUT, { w: 1.6, color: '#f1e3c6' }) + line(CRES_IN, { w: 1.6, color: '#f1e3c6' });
  strip('m05-l01-blocking', 'A color-block festival design on deep skin in five pictures. 1: sketch a crescent with a light line from above the inner brow, around the temple, down to the cheekbone, on both sides. 2: fill the crescents with white and let them dry, because bright colors look thin on deep skin. 3: paint three blocks of color on top: magenta at the forehead end, orange at the temple, yellow on the cheekbone, on both sides. 4: black lines between the blocks and around the outside, thicker on the outer edge. Done: white dots along the outer edge, a white line in the top block, and a magenta and yellow diamond on the forehead center with a black outline.', [
    { ...F(both(sketch)), label: '1', caption: 'Sketch lightly' },
    { ...F(both(crescent(SUNSET, { base: true, color: false, lines: false, shine: false }))), label: '2', caption: 'White base, dry' },
    { ...F(both(crescent(SUNSET, { base: true, lines: false, shine: false }))), label: '3', caption: 'Color blocks' },
    { ...F(both(crescent(SUNSET, { base: true, shine: false }))), label: '4', caption: 'Black lines' },
    { ...F(both(crescent(SUNSET, { base: true })) + thirdEye(SUNSET)), label: 'Done', caption: 'White dots, center' },
  ], { pw: 190, gap: 30 });
}

{
  // Black linework makes color sing: same blocks, three finishes, on brown skin.
  const view = [70, 120, 140, 190];
  const F = (under) => face(under, 'brown');
  const pal = [C.hotPink, C.cyan, C.lime];
  strip('m05-l01-linework', 'The same color blocks on brown skin, finished three ways. Avoid: color only, no lines, so the edges look soft and the blocks melt into the skin. Better: thin black lines between the blocks and around the outside, so each color is clear. Best: black lines plus white dots and a white line, so the colors look bright, almost glowing, with no UV paint.', [
    { content: F(crescent(pal, { lines: false, shine: false, soft: true })), view, label: 'Avoid', caption: 'Color only' },
    { content: F(crescent(pal, { base: true, shine: false })), view, label: 'Better', caption: '+ black lines' },
    { content: F(crescent(pal, { base: true })), view, label: 'Best', caption: '+ white details' },
  ], { pw: 200, arrows: false });
}

{
  // Readable from a distance: fine pastel detail vs bold blocks, close up and far away.
  const pastel = both(
    line([[178, 178], [150, 166], [120, 170], [104, 196], [104, 232]], { w: 2, color: '#c9a8ec' })
    + line([[172, 184], [148, 174], [124, 180], [112, 204]], { w: 1.8, color: '#f3b3cf' })
    + dots([[160, 160], [130, 156], [104, 170], [94, 200], [96, 236]], 9, 1.4, 1.4, '#c9a8ec')
    + dots([[156, 270], [134, 268], [114, 256]], 4, 1.6, 1.2, '#d9c2f0'))
    + dots([[200, 130], [200, 150]], 3, 1.6, 1.6, '#d9c2f0');
  const bold = both(crescent(ELECTRIC, { base: false })) + thirdEye(ELECTRIC);
  const near = [70, 90, 260, 230], far = [-190, -140, 780, 690];
  strip('m05-l01-distance', 'Readable from a distance, on light skin. Close up, a design of thin pale lilac and pink lines with tiny dots looks delicate; from far away it disappears into the skin. A bold design of blue, teal and lime blocks with black lines and white dots looks strong close up and is still clear from far away.', [
    { content: face(pastel, 'light'), view: near, label: 'Fine and pale', labelColor: INK, caption: 'Close up' },
    { content: face(pastel, 'light'), view: far, label: 'Avoid', caption: 'From far away' },
    { content: face(bold, 'light'), view: near, label: 'Bold blocks', labelColor: INK, caption: 'Close up' },
    { content: face(bold, 'light'), view: far, label: 'Good', caption: 'From far away' },
  ], { pw: 190, arrows: false, gap: 30 });
}

// ===================================================================================
// 05.2 Paint plus makeup: skin prep and setting
// ===================================================================================

// Upper lash line of the left eye (face path eyeL: M120 226 C132 210 166 209 180 227), t = 0 outer .. 1 inner.
const bez = (p0, p1, p2, p3, t) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]); };
const lashPt = (t) => bez([120, 226], [132, 210], [166, 209], [180, 227], t);
const lowPt = (t) => bez([120, 226], [134, 241], [166, 240], [180, 227], t); // lower lash line

// Eye-safe liner along the upper lash line with a wing (left eye; mirror for the right).
// wing: [x, y] tip; w: thickness.
function liner({ wing = [100, 208], w = 6, color = BLACK } = {}) {
  // thin-to-thick line along the lash line, then a filled wedge from the outer lash line to the tip
  const pts = [0.97, 0.8, 0.6, 0.4, 0.22, 0.08].map((t) => { const p = lashPt(t); return [p[0], p[1] - w * 0.25]; });
  const top = lashPt(0.2), low = lashPt(0.04);
  const wedgeD = polyD([[top[0], top[1] - w * 0.35], wing, [119.5, 226.5], low, lashPt(0.15)], true);
  return stroke(pts, { w, color, kind: 'start' }) + `<path d="${wedgeD}" fill="${color}" stroke="${color}" stroke-width="1" stroke-linejoin="round"/>`;
}
// Mascara: short lash strokes along the upper lash line.
const lashes = () => [0.12, 0.26, 0.4, 0.54, 0.68, 0.82].map((t) => { const p = lashPt(t); const a = -100 - (1 - t) * 50; const q = pol(p[0], p[1], 9, a); return line([p, q], { w: 1.6, color: BLACK }); }).join('');

// The "temple swoosh": a thick-thin arc from above the brow round the temple to the cheekbone,
// a thinner second arc inside it, and a dot trail. Used in 05.2 and as layout A in 05.3.
function swoosh(c1 = C.purple, c2 = C.teal, { dotsC = WHITE, outline = true } = {}) {
  const arc = [[176, 170], [150, 152], [118, 154], [100, 182], [100, 226], [112, 258], [136, 274]];
  const arc2 = [[166, 178], [142, 168], [120, 176], [110, 202], [112, 236], [124, 256]];
  return (outline ? stroke(arc, { w: 19, color: BLACK }) : '') + stroke(arc, { w: 14, color: c1 })
    + stroke(arc2, { w: 8, color: c2 })
    + dots([[184, 150], [160, 136], [130, 134], [104, 146]], 4, 2.2, 3.8, dotsC)
    + dots([[150, 280], [162, 290]], 2, 3.2, 2.2, dotsC);
}
const lips = (c = '#a3214f') => `<path d="M166 350C178 341 191 338 200 344C209 338 222 341 234 350C215 355 185 355 166 350Z" fill="${c}"/><path d="M166 350C185 355 215 355 234 350C224 371 176 371 166 350Z" fill="${c}"/><path d="M188 359C196 362 204 362 212 359" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.5"/>`;

// Small icons
const clock = (x, y, r = 22) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M${x} ${y - r * 0.6}V${y}L${x + r * 0.45} ${y + r * 0.3}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
const sprayBottle = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-14" y="-6" width="28" height="44" rx="6" fill="#dbe9f6" stroke="#5c7c99" stroke-width="2"/><rect x="-7" y="-18" width="14" height="13" fill="#5c7c99"/><path d="M7 -15H16" stroke="#5c7c99" stroke-width="4"/></g>`;
const mist = (x, y, dir = -1, n = 22, seed = 3) => { let o = '', s = seed; for (let i = 0; i < n; i++) { s = (s * 9301 + 49297) % 233280; const r = s / 233280; s = (s * 9301 + 49297) % 233280; const q = s / 233280; o += dot(x + dir * (8 + r * 60), y - 10 + (q - 0.5) * (14 + r * 50), 1.4 + q * 1.4, '#9cc3e6'); } return o; };
const bubbles = (pts) => pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" fill-opacity="0.55" stroke="#9cc3e6" stroke-width="1.5"/>`).join('');
const sheen = (x, y) => glow(x, y, 26, 14, '#ffffff', { opacity: 0.75 });

{
  // The order of layers on the face, medium skin.
  const view = [60, 90, 280, 300];
  const F = (under, over = '', eyes = 'open') => ({ content: face(under, 'medium', over, { eyes }), view });
  const design = both(swoosh());
  strip('m05-l02-order', 'The order of layers on the face, medium skin, in five pictures. 1: wash the face and pat it dry, then put on a thin layer of light moisturizer. 2: wait until the moisturizer has soaked in and the skin feels dry, not shiny or slippery. 3: paint the face paint design: a purple and teal swoosh from above the brows round the temples to the cheekbones, with white dots. 4: add regular makeup that is made for the eyes and lips: eyeliner, mascara and lipstick. Done: close your eyes and mouth and set everything with setting spray or a light dusting of translucent powder.', [
    { ...F(sheen(140, 280) + mirror(sheen(140, 280)) + sheen(200, 130), bubbles([[86, 300, 6], [96, 318, 4], [310, 296, 5]])), label: '1', caption: 'Clean, moisturize' },
    { ...F('', clock(296, 128)), label: '2', caption: 'Wait until dry' },
    { ...F(design), label: '3', caption: 'Face paint' },
    { ...F(design, both(liner() + lashes()) + lips()), label: '4', caption: 'Eye makeup, lips' },
    { ...F(design, lips() + sprayBottle(318, 300, 1.1) + mist(300, 296), 'closed'), label: 'Done', caption: 'Set, eyes closed' },
  ], { pw: 180, gap: 30 });
}

// Forearm, inner side, wrist left (frame 300 x 200).
const ARMD = 'M-10 62C70 56 170 50 310 42V172C170 166 70 158 -10 154Z';
const forearm = (skin) => `<path d="${ARMD}" fill="${SKIN[skin]}"/><path d="M-10 62C70 56 170 50 310 42M-10 154C70 158 170 166 310 172" fill="none" stroke="#5b4636" stroke-width="2.4"/>`;
const onArm = (skin, content) => forearm(skin) + clipTo(ARMD, content);

{
  // What happens under the paint: oily skin, wet cream, soaked-in cream (fair skin).
  const view = [0, 20, 300, 170];
  const stripe = [[40, 128], [100, 92], [170, 100], [240, 78]];
  const beads = () => {
    let o = '', s = 11;
    const c = spline(stripe, 30);
    for (let i = 0; i < c.length; i += 2) {
      for (let k = 0; k < 2; k++) {
        s = (s * 9301 + 49297) % 233280; const r = s / 233280;
        s = (s * 9301 + 49297) % 233280; const q = s / 233280;
        const [x, y] = c[i]; const rr = 2.4 + r * 4.6;
        o += `<ellipse cx="${n1(x + (q - 0.5) * 6)}" cy="${n1(y + (r - 0.5) * 20)}" rx="${n1(rr)}" ry="${n1(rr * 0.8)}" fill="${C.purple}"/>`;
        if (r > 0.5) o += dot(x + (q - 0.5) * 6 - rr * 0.3, y + (r - 0.5) * 20 - rr * 0.3, rr * 0.3, '#ffffff');
      }
    }
    return o;
  };
  const shine = glow(140, 108, 120, 30, '#ffffff', { opacity: 0.55 });
  const patchy = stroke(stripe, { w: 30, color: C.purple, kind: 'none' }) + [-9, -3, 4, 10].map((dy, k) => line(stripe.map(([x, y], j) => [x + (j ? 0 : 14) + k * 6, y + dy + (j % 2 ? 2 : -2)]), { w: 2 + (k % 2) * 1.5, color: SKIN.fair, opacity: 0.8 })).join('') + glow(150, 100, 120, 30, '#ffffff', { opacity: 0.45 });
  strip('m05-l02-beading', 'The same purple stripe painted on three forearms with fair skin. Avoid: oily skin that was not cleaned: the paint goes on patchy and slides. Avoid: heavy cream that is still wet: the water-based paint pulls into little beads with bare skin between them. Good: a light moisturizer that has soaked in until the skin feels dry: the stripe is smooth and even.', [
    { content: onArm('fair', patchy), view, label: 'Avoid', caption: 'Oily, not cleaned' },
    { content: onArm('fair', shine + beads()), view, label: 'Avoid', caption: 'Wet cream: beads' },
    { content: onArm('fair', stroke(stripe, { w: 30, color: C.purple, kind: 'none' }) + dots([[70, 140], [120, 128], [180, 124], [236, 112]], 4, 3, 3, WHITE)), view, label: 'Good', caption: 'Soaked in, dry' },
  ], { pw: 230, arrows: false });
}

{
  // The rub test on the forearm (brown skin).
  const view = [0, 0, 300, 200];
  const patch = stroke([[60, 120], [120, 96], [190, 104], [250, 84]], { w: 36, color: C.cyan, kind: 'none' })
    + stroke([[70, 118], [130, 96], [196, 102], [244, 86]], { w: 10, color: C.hotPink, kind: 'both' })
    + dots([[80, 140], [140, 124], [200, 128], [246, 112]], 4, 3.2, 3.2, WHITE);
  const tissue = (x, y, stain = false) => `<g transform="rotate(-8 ${x} ${y})"><rect x="${x - 36}" y="${y - 26}" width="72" height="52" rx="4" fill="#ffffff" stroke="#adb5bd" stroke-width="1.6"/>`
    + (stain ? `<path d="M${x - 22} ${y + 4}C${x - 8} ${y - 6} ${x + 8} ${y - 2} ${x + 22} ${y - 10}" stroke="${C.cyan}" stroke-width="9" stroke-linecap="round" opacity="0.75"/><path d="M${x - 14} ${y + 2}C${x} ${y - 4} ${x + 10} ${y - 4} ${x + 18} ${y - 8}" stroke="${C.hotPink}" stroke-width="3" opacity="0.8"/>` : '') + '</g>';
  const finger = (x, y) => `<path d="M${x} ${y}c-14 0 -20 14 -18 30l4 40h30l4 -40c2 -16 -4 -30 -20 -30Z" fill="${SKIN.medium}" stroke="#5b4636" stroke-width="2"/><path d="M${x - 9} ${y + 6}c4 -4 14 -4 18 0" fill="none" stroke="#5b4636" stroke-width="1.4"/>`;
  const smear = `<g opacity="0.7">${stroke([[60, 132], [124, 110], [194, 118], [256, 98]], { w: 40, color: C.cyan, kind: 'none' })}</g>` + stroke([[70, 122], [130, 102], [196, 108], [244, 92]], { w: 12, color: '#f487bf', kind: 'both' });
  strip('m05-l02-rub-test', 'The rub test on a forearm with brown skin, in five pictures. 1: paint a small patch, here a cyan stripe with a pink line and white dots, and let it dry. 2: set it with a mist of setting spray or a dusting of translucent powder and wait 10 minutes. 3: press a clean tissue on it, then rub it gently with a fingertip five times. Good: the tissue stays almost clean and the edges stay sharp. Avoid: color comes off on the tissue and the patch smears; prep and set more carefully next time.', [
    { content: onArm('brown', patch), view, label: '1', caption: 'Paint, let dry' },
    { content: onArm('brown', patch) + sprayBottle(266, 34, 0.9) + mist(250, 52, -1, 26, 5), view, label: '2', caption: 'Set, wait 10 min' },
    { content: onArm('brown', patch) + finger(150, 70) + arrow([[118, 160], [182, 160]], { width: 3 }) + arrow([[182, 176], [118, 176]], { width: 3 }), view, label: '3', caption: 'Tissue, then rub' },
    { content: onArm('brown', patch) + tissue(70, 38), view, label: 'Good', caption: 'Tissue clean' },
    { content: onArm('brown', smear) + tissue(70, 38, true), view, label: 'Avoid', caption: 'Color comes off' },
  ], { pw: 180, gap: 30 });
}

{
  // The touch-up kit for a long day.
  const o = [];
  const cell = (i, art, name) => {
    const x = 20 + (i % 4) * 200, y = 20 + Math.floor(i / 4) * 175;
    o.push(`<rect x="${x}" y="${y}" width="186" height="160" rx="12" fill="#fff" stroke="#e3ddd5" stroke-width="2"/>`);
    o.push(art(x + 93, y + 66));
    o.push(label(x + 93, y + 140, name, { size: 15, bold: true, halo: false }));
  };
  cell(0, (x, y) => `<circle cx="${x}" cy="${y}" r="40" fill="#dfe7ee" stroke="#868e96" stroke-width="4"/><path d="M${x - 18} ${y - 16}L${x - 4} ${y - 28}M${x - 20} ${y - 2}L${x + 6} ${y - 26}" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>`, 'Small mirror');
  cell(1, (x, y) => `<rect x="${x - 60}" y="${y - 22}" width="120" height="44" rx="10" fill="#f1f3f5" stroke="#adb5bd" stroke-width="2"/>` + [C.purple, C.teal, BLACK, WHITE].map((c, k) => `<circle cx="${x - 42 + k * 28}" cy="${y}" r="11" fill="${c}" stroke="rgba(0,0,0,0.25)"/>`).join(''), 'Mini palette: your colors');
  cell(2, (x, y) => `<g transform="rotate(-35 ${x} ${y})"><rect x="${x - 60}" y="${y - 5}" width="80" height="10" rx="4" fill="#2b6cb0"/><rect x="${x + 20}" y="${y - 6}" width="16" height="12" fill="#b8bec6"/><path d="M${x + 36} ${y - 6}L${x + 58} ${y}L${x + 36} ${y + 6}Z" fill="#3b2f2a"/></g>`, 'Small round brush');
  cell(3, (x, y) => [-24, 0, 24].map((dx) => `<g transform="rotate(${dx} ${x} ${y + 30})"><rect x="${x - 3}" y="${y - 36}" width="6" height="66" rx="3" fill="#e9ecef" stroke="#adb5bd"/><ellipse cx="${x}" cy="${y - 38}" rx="7" ry="10" fill="#fff" stroke="#adb5bd"/></g>`).join(''), 'Cotton buds');
  cell(4, (x, y) => `<rect x="${x - 46}" y="${y - 28}" width="92" height="56" rx="12" fill="#e7f5ec" stroke="#8cc5a0" stroke-width="2"/><rect x="${x - 20}" y="${y - 22}" width="40" height="12" rx="5" fill="#bfe3cc"/>`, 'Fragrance-free wipes');
  cell(5, (x, y) => `<ellipse cx="${x}" cy="${y + 14}" rx="44" ry="16" fill="#e9ecef" stroke="#adb5bd" stroke-width="2"/><ellipse cx="${x}" cy="${y + 8}" rx="40" ry="12" fill="#f3e9df"/><ellipse cx="${x + 6}" cy="${y - 10}" rx="30" ry="12" fill="#f8c9d6" stroke="#d6a2b2" stroke-width="2"/>`, 'Translucent powder');
  cell(6, (x, y) => sprayBottle(x - 10, y - 10, 1.4) + mist(x + 18, y - 32, 1, 18, 9), 'Setting spray (small)');
  cell(7, (x, y) => `<path d="M${x - 50} ${y - 34}H${x + 50}V${y + 36}H${x - 50}Z" fill="#eef6fb" stroke="#9fb3c2" stroke-width="2"/><path d="M${x - 50} ${y - 24}H${x + 50}" stroke="#4dabf7" stroke-width="4"/><rect x="${x - 36}" y="${y - 10}" width="30" height="34" rx="4" fill="#f8c9d6" opacity="0.8"/><circle cx="${x + 20}" cy="${y + 8}" r="14" fill="#dfe7ee"/>`, 'Zip bag to keep it all');
  plain('m05-l02-kit', 'A small touch-up kit for a long day, eight items: a small mirror; a mini palette with your design colors plus black and white; a small round brush; cotton buds; fragrance-free wipes; translucent powder with a puff; a small setting spray; and a zip bag to keep it all together.', 820, 370, o.join(''));
}

// ===================================================================================
// 05.3 The festival face map: symmetrical layouts
// ===================================================================================

// Zones of the festival face map (left side where it is one-sided; mirror for the right).
const ZONE = {
  arc: band([[180, 172], [152, 150], [116, 150], [98, 178], [100, 214]], [[178, 182], [150, 168], [124, 172], [112, 192], [112, 214]]),
  cheek: band([[166, 262], [140, 266], [114, 254], [98, 228]], [[164, 276], [138, 282], [108, 270], [92, 238]]),
  hair: band([[110, 156], [124, 108], [160, 92], [200, 90], [240, 92], [276, 108], [290, 156]], [[122, 160], [136, 122], [166, 108], [200, 106], [234, 108], [264, 122], [278, 160]]),
};
const ZC = { arc: C.purple, cheek: C.teal, third: C.hotPink, hair: '#f5b700', chin: C.orange };

// Layout A: temple arcs (the swoosh) + third-eye drop.
const thirdDrop = (c = C.hotPink, c2 = WHITE) => teardrop(200, 168, 90, 0.1, 1, c) + `<path d="M200 140C210 152 212 162 200 172C188 162 190 152 200 140Z" fill="${c}" stroke="${BLACK}" stroke-width="2.4"/>` + dot(200, 160, 3.4, c2) + dots([[200, 130], [200, 116]], 2, 2.6, 2, c2);
const layoutA = (c1 = C.purple, c2 = C.teal, c3 = C.hotPink) => both(swoosh(c1, c2)) + thirdDrop(c3);

// Layout B: cheekbone line (dot line under the eye, a stroke under it, teardrops up at the temple), center dots, chin dots.
function layoutB(c1 = C.blue, c2 = C.cyan, c3 = C.hotPink) {
  const sweep = [[178, 284], [152, 288], [128, 278], [111, 254], [104, 220]];
  const side = stroke(sweep, { w: 13, color: BLACK, kind: 'start' }) + stroke(sweep, { w: 9.5, color: c1, kind: 'start' })
    + dots([[166, 268], [148, 270], [132, 264], [120, 250], [114, 234]], 5, 2.2, 4.4, c2)
    + teardrop(116, 206, -100, 30, 10, c3) + teardrop(130, 202, -70, 22, 8, c2) + teardrop(106, 220, -135, 20, 7.5, c2)
    + dot(116, 206, 2, WHITE);
  return both(side) + dots([[200, 186], [200, 170], [200, 156]], 3, 4, 2.4, c2) + dot(200, 186, 1.4, WHITE)
    + dots([[200, 384], [200, 396], [200, 408]], 3, 2.2, 3.6, c3) + dot(200, 408, 1.2, WHITE);
}

// Layout C: crown along the hairline (rays of teardrops), a sun on the forehead center, temple dots, chin dot.
function layoutC(c1 = C.orange, c2 = C.yellow, c3 = C.magenta, { base = false } = {}) {
  const o = [];
  for (let a = -158; a <= -22; a += 17) {
    const [x, y] = pol(200, 200, 84, a), k = Math.abs(a + 90) / 68;
    const len = 30 - k * 10, w = 11 - k * 3, col = Math.round((a + 158) / 17) % 2 ? c2 : c1;
    if (base) o.push(teardrop(x, y, a, len + 2, w + 3, WHITE));
    o.push(teardrop(x, y, a, len, w, col));
  }
  const sun = (base ? `<circle cx="200" cy="150" r="17" fill="${WHITE}"/>` : '') + `<circle cx="200" cy="150" r="15" fill="${c3}" stroke="${BLACK}" stroke-width="2.6"/>` + `<circle cx="200" cy="150" r="6.5" fill="${c2}"/>` + dot(195, 145, 2.2, WHITE);
  const side = dots([[118, 196], [108, 214], [104, 234]], 3, 4.4, 2.6, c2) + dots([[164, 170], [150, 166]], 2, 2.4, 2, WHITE);
  return o.join('') + sun + both(side) + dot(200, 400, 5, c3) + dot(198, 398, 1.6, WHITE)
    + dots([[200, 186], [200, 176]], 2, 2.4, 2.4, WHITE);
}

{
  // The festival face map: five zones on tan skin, with a key.
  const T = (c) => `<g transform="translate(140 -40)">${c}</g>`;
  const zone = (d, c) => `<path d="${d}" fill="${c}" fill-opacity="0.45" stroke="${c}" stroke-width="2" stroke-dasharray="5 4"/>`;
  const under = both(zone(ZONE.arc, ZC.arc) + zone(ZONE.cheek, ZC.cheek)) + zone(ZONE.hair, ZC.hair)
    + `<circle cx="200" cy="152" r="16" fill="${ZC.third}" fill-opacity="0.45" stroke="${ZC.third}" stroke-width="2" stroke-dasharray="5 4"/>`
    + `<ellipse cx="200" cy="398" rx="22" ry="14" fill="${ZC.chin}" fill-opacity="0.45" stroke="${ZC.chin}" stroke-width="2" stroke-dasharray="5 4"/>`;
  const eyes = both(`<path d="M114 226C128 200 170 198 186 226C170 248 128 250 114 226Z" fill="none" stroke="${BAD}" stroke-width="2" stroke-dasharray="3 4"/>`);
  const marks = [[[118, 162], '1'], [[124, 272], '2'], [[200, 152], '3'], [[200, 96], '4'], [[200, 398], '5']];
  let o = T(face(under, 'tan') + eyes + marks.map(([[x, y], n]) => badge(x, y, n, { r: 10, color: INK })).join(''));
  const key = [['1', 'Brow-to-temple arc', ZC.arc], ['2', 'Cheekbone line', ZC.cheek], ['3', 'Third eye (forehead center)', ZC.third], ['4', 'Hairline', ZC.hair], ['5', 'Chin', ZC.chin]];
  key.forEach(([n, t, c], i) => { o += `<rect x="560" y="${86 + i * 52}" width="26" height="26" rx="6" fill="${c}" fill-opacity="0.6" stroke="${c}" stroke-width="2"/>` + badge(610, 99 + i * 52, n, { r: 11, color: INK }) + label(630, 105 + i * 52, t, { size: 15, anchor: 'start', halo: false }); });
  o += `<path d="M560 ${86 + 5 * 52 + 13}h26" stroke="${BAD}" stroke-width="2.4" stroke-dasharray="3 4"/>` + label(600, 105 + 5 * 52, 'Eye area: see lesson 05.4', { size: 15, anchor: 'start', color: BAD, halo: false });
  plain('m05-l03-zones', 'The festival face map on tan skin, with five zones. 1, purple: an arc from above the inner brow, over the brow, to the temple. 2, teal: a line along the cheekbone, from under the eye out and up toward the temple. 3, pink: the third eye, a small spot on the forehead center line just above the brows. 4, yellow: a band along the hairline. 5, orange: the chin, on the center line. Red dashed ovals mark the eye area around each eye, covered in lesson 05.4.', 880, 440, o);
}

{
  // Placement that lifts the face vs placement that drags it down (light skin).
  const view = [60, 120, 280, 280];
  const up = (c) => teardrop(162, 268, 200, 18, 7, c) + teardrop(140, 262, 210, 22, 8, c) + teardrop(120, 248, 225, 26, 9.5, c) + teardrop(106, 228, 245, 30, 11, c);
  const down = (c) => teardrop(150, 286, 160, 18, 7, c) + teardrop(140, 304, 140, 22, 8, c) + teardrop(132, 326, 120, 26, 9.5, c) + teardrop(128, 350, 105, 30, 11, c);
  const guide = `<path d="M170 356L104 178" stroke="#868e96" stroke-width="2" stroke-dasharray="6 5"/>`;
  const good = both(up(C.violet) + dots([[176, 284], [156, 284], [136, 278], [116, 266]], 4, 2, 3.2, C.purple))
    + both(guide);
  const badD = both(down(C.violet) + dots([[166, 300], [154, 318], [148, 340], [146, 362]], 4, 2, 3.2, C.purple))
    + both(guide);
  strip('m05-l03-lift', 'Placement that lifts the face and placement that drags it down, on light skin. Good: teardrops and dots start under the outer eye, follow the cheekbone and sweep up and out toward the temples, so the face looks lifted and awake. Avoid: the same teardrops and dots placed low on the cheeks and pointing down toward the jaw, so the face looks tired and droopy.', [
    { content: face(good, 'light'), view, label: 'Good', caption: 'Up and out, on the cheekbone' },
    { content: face(badD, 'light'), view, label: 'Avoid', caption: 'Low and pointing down' },
  ], { pw: 260, arrows: false, gap: 50 });
}

{
  // Sketch with light color, then paint, element by element (deep skin).
  const view = [70, 80, 260, 260];
  const F = (under) => ({ content: face(under, 'deep'), view });
  const SK = '#f3e6c4';
  const pts = both([L.browInL, L.browOutL, L.eyeOutL, L.cheekboneL, L.templeL].map(([x, y]) => `<circle cx="${x}" cy="${y - (y === 192 ? 12 : 0)}" r="2.6" fill="${SK}"/>`).join('')) + `<circle cx="200" cy="155" r="2.6" fill="${SK}"/>`;
  const sk = line([[176, 170], [150, 152], [118, 154], [100, 182], [100, 226], [112, 258], [136, 274]], { w: 1.6, color: SK });
  const c1 = C.magenta, c2 = C.gold;
  strip('m05-l03-sketch', 'Sketching with light color, then painting, on deep skin, in five pictures. 1: tiny dots of a light color at the landmarks: inner and outer brow, outer eye corner, cheekbone, temple and forehead center, on both sides. 2: join the dots with a thin, light sketch line on one side, then the other, and check from a distance. 3: paint the main arc in magenta over the sketch on one side. 4: paint the same arc on the other side straight away, then the gold inner arcs on both sides. Done: white dots on both sides and a pink drop with white dots on the forehead center.', [
    { ...F(pts), label: '1', caption: 'Dot the landmarks' },
    { ...F(pts + both(sk)), label: '2', caption: 'Sketch, then check' },
    { ...F(mirror(sk) + stroke([[176, 170], [150, 152], [118, 154], [100, 182], [100, 226], [112, 258], [136, 274]], { w: 19, color: BLACK }) + stroke([[176, 170], [150, 152], [118, 154], [100, 182], [100, 226], [112, 258], [136, 274]], { w: 14, color: c1 })), label: '3', caption: 'Main arc, one side' },
    { ...F(both(swoosh(c1, c2, { dotsC: 'none' }))), label: '4', caption: 'Other side, inner arcs' },
    { ...F(both(swoosh(c1, c2)) + thirdDrop(C.hotPink)), label: 'Done', caption: 'Dots and center' },
  ], { pw: 190, gap: 30 });
}

{
  // Three layouts on three skin tones.
  const view = [60, 70, 280, 360];
  strip('m05-l03-layouts', 'Three festival layouts on the face map. A, temple arcs, on tan skin: a purple swoosh with a teal inner arc from above each brow round the temple to the cheekbone, white dots, and a pink drop on the forehead center. B, cheekbone line, on light skin: a blue stroke and a cyan dot line along each cheekbone sweeping up to pink and cyan teardrops at the temple, cyan dots between the brows and pink dots on the chin. C, crown, on deep skin: orange and yellow teardrops in a ray pattern along the hairline, painted over white, a magenta sun on the forehead center, yellow dots at the temples and a magenta dot on the chin.', [
    { content: face(layoutA(), 'tan'), view, label: 'A  Temple arcs', labelColor: INK },
    { content: face(layoutB(), 'light'), view, label: 'B  Cheekbone line', labelColor: INK },
    { content: face(layoutC(C.orange, C.yellow, C.magenta, { base: true }), 'deep'), view, label: 'C  Crown', labelColor: INK },
  ], { pw: 240, arrows: false, gap: 30 });
}

// ===================================================================================
// 05.4 Bold eye designs, safely
// ===================================================================================

const EYES = [84, 160, 232, 108];  // both eyes and brows
const crease = (c = C.magenta, w = 4.5) => stroke([[176, 209], [160, 200], [140, 197.5], [122, 200], [102, 198]], { w, color: c, kind: 'start' });
const browDots = (c1 = WHITE, c2 = C.gold) => [[175, 197, 1.6], [164, 193.5, 2], [151, 192.5, 2.3], [138, 194, 2.4], [127, 197.5, 2.2], [118, 202, 1.8]].map(([x, y, r], i) => dot(x, y, r, i % 2 ? c2 : c1)).join('');
const BONE = 'M178 207C166 200 140 197 122 203C112 207 102 205 92 199C96 193 108 191 120 194C140 189 166 190 182 199Z';
const browBone = (c1 = C.magenta, c2 = C.orange) => sponge(BONE, [c2, c1], { deg: 0, soft: 2.4 });
const lidD = 'M122 214C134 200 166 199 179 213L180 227C166 238 134 238 120 226Z';
const lidOpenD = 'M122 220C134 202 166 201 179 219L180 227C166 209 132 210 120 226Z';
const lidArt = (d) => sponge(d, [C.teal, C.purple], { deg: 0, soft: 0 }) + clipTo(d, dots([[176, 222], [160, 218], [144, 218], [128, 222]], 4, 2.4, 2.4, WHITE) + dots([[168, 212], [150, 209], [134, 212]], 3, 1.6, 1.6, C.lime));

{
  // The eye area: what may go where (brown skin), close up of one eye with labels.
  const view = [88, 166, 118, 104];
  const zoneD = 'M186 200C186 176 150 168 120 176C96 184 86 212 92 236C98 262 128 274 156 270C178 266 192 248 190 228Z';
  const wl = line([0.9, 0.75, 0.5, 0.25, 0.1].map((t) => { const p = lowPt(t); return [p[0], p[1] - 2.2]; }), { w: 1.8, color: BAD });
  const ll = line([0.97, 0.8, 0.6, 0.4, 0.2, 0.03].map((t) => { const p = lashPt(t); return [p[0], p[1] - 1.6]; }), { w: 2.2, color: '#1c7ed6' });
  const content = face(`<path d="${zoneD}" fill="#ffd43b" fill-opacity="0.28"/>`, 'brown', `<path d="${zoneD}" fill="none" stroke="#f08c00" stroke-width="1.4" stroke-dasharray="3 2.5"/>` + ll + wl);
  const X = 20, Y = 20, Wd = 460, Hd = 405;
  let o = embed(content, view, X, Y, Wd, Hd);
  const px = (x, y) => [X + ((x - view[0]) / view[2]) * Wd, Y + ((y - view[1]) / view[3]) * Hd];
  const call = ([x, y], tx, ty, color) => { const [a, b] = px(x, y); return `<circle cx="${n1(a)}" cy="${n1(b)}" r="5" fill="${color}"/>` + `<path d="M${n1(a)} ${n1(b)}L${tx - 8} ${ty - 5}" stroke="${color}" stroke-width="2"/>`; };
  const rows = [
    [[170, 184], 70, '#f08c00', 'Eye area (yellow): only products', 'labeled safe for the eyes'],
    [[150, 211], 170, '#1c7ed6', 'Lash line (blue): eye-safe liner', 'outside the lashes only'],
    [[150, 236], 270, BAD, 'Waterline (red): nothing goes here', 'not paint, not liner'],
    [[96, 262], 370, INK, 'Outside the dashed line: face paint,', 'neon and glitter stay out here'],
  ];
  for (const [p, ty, c, t1, t2] of rows) o += call(p, 530, ty, c) + label(530, ty, t1, { size: 16, anchor: 'start', color: c === INK ? INK : c, halo: false, bold: true }) + label(530, ty + 22, t2, { size: 15, anchor: 'start', color: SOFT, halo: false });
  plain('m05-l04-zones', 'Close up of an eye on brown skin, showing what may go where. A yellow dashed zone from the brow down to the top of the cheekbone is the eye area: only products whose label says they are safe for the eyes go here. The blue lash line along the top of the eye: eye-safe liner, outside the lashes only. The red waterline, the wet inner rim of the lower lid: nothing goes here. Outside the dashed line: face paint, neon colors and glitter stay out there.', 880, 445, o);
}

{
  // Four bold eye designs on deep skin.
  const F = (under, over = '') => face(under, 'deep', over);
  const wing2 = both(liner({ wing: [96, 204], w: 6.5 }) + stroke([[136, 206], [120, 208], [104, 200], [92, 190]], { w: 3.2, color: C.cyan, kind: 'start' }) + dot(88, 186, 2.6, C.cyan));
  strip('m05-l04-designs', 'Four bold eye designs on deep skin. Graphic wing: an eye-safe black liner along the upper lash line with a long, sharp wing, and a thin cyan line parallel above it ending in a dot. Floating crease: a magenta line that floats above the natural crease and ends in a point toward the brow tail, with a thin black liner. Dots under the brow: a row of white and gold dots following the curve just under each brow. Brow-bone color: a soft orange to magenta blend on the brow bone, sweeping out toward the temple.', [
    { content: F('', wing2), view: EYES, label: 'Graphic wing', labelColor: INK },
    { content: F('', both(crease() + liner({ wing: [108, 214], w: 4 }))), view: EYES, label: 'Floating crease', labelColor: INK },
    { content: F(both(browDots())), view: EYES, label: 'Dots under the brow', labelColor: INK },
    { content: F(both(browBone()), both(liner({ wing: [106, 212], w: 4 }))), view: EYES, label: 'Brow-bone color', labelColor: INK },
  ], { pw: 330, cols: 2, arrows: false, gap: 30 });
}

{
  // A graphic eye design step by step, eyes open, medium skin.
  const F = (under, over = '') => ({ content: face(under, 'medium', over), view: EYES });
  const guide = both(`<path d="M146 238L120 227L96 205" fill="none" stroke="#868e96" stroke-width="1.6" stroke-dasharray="4 3"/>` + dot(96, 205, 2.2, '#868e96'));
  const L1 = both(liner({ wing: [96, 205], w: 6 }));
  const CR = both(crease(C.purple, 4.2));
  strip('m05-l04-steps', 'A graphic eye design with the eyes open, on medium skin, in five pictures. 1: look straight into the mirror and imagine the lower lash line continuing up toward the end of the brow; mark the wing tip with a tiny dot. 2: draw eye-safe liner along the upper lash line, outside the lashes, and pull the wing out to the dot, on both eyes. 3: paint a purple floating crease line above the natural crease, joining the wing. 4: sponge soft pink and violet color on the brow bone above the crease line. Done: a row of white dots under each brow. Then close your eyes and check both sides in the mirror.', [
    { ...F('', guide), label: '1', caption: 'Find the angle' },
    { ...F('', L1), label: '2', caption: 'Liner and wing' },
    { ...F('', L1 + CR), label: '3', caption: 'Floating crease' },
    { ...F(both(browBone(C.hotPink, C.violet)), L1 + CR), label: '4', caption: 'Brow-bone color' },
    { ...F(both(browBone(C.hotPink, C.violet)), L1 + CR + both(browDots(WHITE, WHITE))), label: 'Done', caption: 'Dots, then check' },
  ], { pw: 200, gap: 28 });
}

{
  // Open-eye and closed-eye designs, light skin.
  const openD = both(crease(C.blue, 4.2) + liner({ wing: [100, 206], w: 5 }));
  const openDC = both(crease(C.blue, 4.2) + stroke([[178, 228], [160, 234], [140, 234], [122, 227], [100, 206]].map(([x, y]) => [x, y + 1]), { w: 4, color: BLACK, kind: 'start' }));
  strip('m05-l04-open-closed', 'Open-eye and closed-eye designs on light skin, each seen with the eyes open and closed. An open-eye design, a blue floating crease line and a black wing, shows with the eyes open and still reads with them closed. A closed-eye design, teal and purple color with dots painted on the moving lid, almost disappears when the eyes are open and only shows when they close, for photos.', [
    { content: face('', 'light', openD), view: EYES, label: 'Open-eye design', labelColor: INK, caption: 'Eyes open: clear' },
    { content: face('', 'light', openDC, { eyes: 'closed' }), view: EYES, label: ' ', labelColor: INK, caption: 'Eyes closed: still clear' },
    { content: face('', 'light', both(clipTo(lidOpenD, lidArt(lidOpenD)))), view: EYES, label: 'Closed-eye design', labelColor: INK, caption: 'Eyes open: mostly hidden' },
    { content: face(both(lidArt(lidD)), 'light', '', { eyes: 'closed' }), view: EYES, label: ' ', labelColor: INK, caption: 'Eyes closed: shows' },
  ], { pw: 330, cols: 2, arrows: false, gap: 30 });
}

console.log('m05 diagrams written');
export { layoutA, layoutB, layoutC, swoosh, crease, browDots, liner, BONE, ZONE, thirdEye, crescent, CRES };
