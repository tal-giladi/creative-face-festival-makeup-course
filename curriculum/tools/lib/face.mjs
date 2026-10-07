// The course's practice face, hand/arm and upper body, as SVG path data.
// One coordinate frame for every face diagram and every printable face template:
//   face frame 400 x 500, centre line x = 200, y down.
// Landmarks (L) are the anchor points module scripts use to place designs, so every design
// lands in the same place on every diagram and on the printed templates.

export const FW = 400, FH = 500, CX = 200;

// Mirror a path/point across the centre line.
export const mx = (x) => 2 * CX - x;

// Circle as cubic curves (works in both SVG and the PDF sheet sampler, which has no arcs).
export const circleD = (cx, cy, r) => { const k = 0.5523 * r; return `M${cx + r} ${cy}C${cx + r} ${cy + k} ${cx + k} ${cy + r} ${cx} ${cy + r}C${cx - k} ${cy + r} ${cx - r} ${cy + k} ${cx - r} ${cy}C${cx - r} ${cy - k} ${cx - k} ${cy - r} ${cx} ${cy - r}C${cx + k} ${cy - r} ${cx + r} ${cy - k} ${cx + r} ${cy}Z`; };

export const L = {
  forehead: [200, 125], foreheadTop: [200, 85], browCenter: [200, 192],
  templeL: [112, 175], templeR: [288, 175],
  browL: [150, 190], browR: [250, 190], browInL: [181, 192], browInR: [219, 192], browOutL: [119, 199], browOutR: [281, 199],
  eyeL: [150, 226], eyeR: [250, 226], eyeInL: [178, 227], eyeInR: [222, 227], eyeOutL: [121, 225], eyeOutR: [279, 225],
  lidL: [150, 212], lidR: [250, 212],
  underEyeL: [148, 258], underEyeR: [252, 258],
  cheekboneL: [117, 252], cheekboneR: [283, 252],
  cheekL: [135, 300], cheekR: [265, 300],
  noseBridge: [200, 232], noseTip: [200, 300],
  mouth: [200, 352], mouthL: [167, 350], mouthR: [233, 350],
  chin: [200, 405], jawL: [128, 365], jawR: [272, 365],
  earL: [80, 245], earR: [320, 245],
  neck: [200, 470],
};

// Path data, left side drawn and mirrored where it is symmetric.
const head = 'M200 68C268 68 307 113 309 183C311 245 304 290 290 330C272 382 240 424 200 426C160 424 128 382 110 330C96 290 89 245 91 183C93 113 132 68 200 68Z';
const earL = 'M93 212C74 200 63 222 66 248C69 274 80 292 99 292';
const earR = 'M307 212C326 200 337 222 334 248C331 274 320 292 301 292';
const neck = 'M158 404C161 440 156 470 146 500M242 404C239 440 244 470 254 500';
const hair = 'M108 150C122 102 160 88 200 88C240 88 278 102 292 150';
const browL = 'M118 202C130 186 160 180 182 192';
const browR = 'M282 202C270 186 240 180 218 192';
const eyeL = 'M120 226C132 210 166 209 180 227C166 240 134 241 120 226Z';
const eyeR = 'M280 226C268 210 234 209 220 227C234 240 266 241 280 226Z';
const lidL = 'M122 220C134 202 166 201 179 219';
const lidR = 'M278 220C266 202 234 201 221 219';
const closedL = 'M120 226C134 238 166 238 180 227';
const closedR = 'M280 226C266 238 234 238 220 227';
const nose = 'M193 236C192 262 186 284 184 296M184 300C190 311 210 311 216 300M207 236C208 262 214 284 216 296';
const lipUp = 'M166 350C178 341 191 338 200 344C209 338 222 341 234 350C215 355 185 355 166 350Z';
const lipLo = 'M166 350C185 355 215 355 234 350C224 371 176 371 166 350Z';
const centre = `M200 60V440`;

export const FACE = { head, earL, earR, neck, hair, browL, browR, eyeL, eyeR, lidL, lidR, closedL, closedR, nose, lipUp, lipLo, centre };

// Skin tones for diagrams. Rotate them across lessons so the course shows many skin tones.
export const SKIN = {
  light: '#f3d9c4', fair: '#efcfb2', medium: '#d9a77f', tan: '#c08a5e', brown: '#9a6542', deep: '#6e4529',
  paper: '#ffffff',
};

// Line colours that read on every skin tone.
const LINE = '#5b4636', LINE_SOFT = '#8a7462';

/**
 * faceSVG(opts) -> SVG markup (face frame units) for the base face.
 *  skin: SKIN key or colour; eyes: 'open' | 'closed'; hair: show hairline; brows: show brows;
 *  lips: show coloured lips; line: outline colour; centre: show dashed centre line;
 *  template: true -> outline-only drawing for printing (no fills).
 */
export function faceSVG(opts = {}) {
  const { skin = 'light', eyes = 'open', hair = true, brows = true, lips = true, centre = false, template = false, parts = 'all' } = opts;
  const fill = template ? 'none' : (SKIN[skin] ?? skin);
  const line = opts.line ?? (template ? '#8d939c' : LINE);
  const soft = template ? '#b8bdc4' : LINE_SOFT;
  const s = (d, w = 2, c = line, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
  const o = [];
  const base = parts !== 'features', feat = parts !== 'base';
  if (base) {
  o.push(`<path d="${neck}" fill="none" stroke="${line}" stroke-width="2.2" stroke-linecap="round"/>`);
  if (!template) o.push(`<path d="M158 404C161 440 156 470 146 500H254C244 470 239 440 242 404Z" fill="${fill}"/>`);
  o.push(`<path d="${earL}" fill="${fill}" stroke="${line}" stroke-width="2.2"/>`, `<path d="${earR}" fill="${fill}" stroke="${line}" stroke-width="2.2"/>`);
  o.push(`<path d="${head}" fill="${fill}" stroke="${line}" stroke-width="2.4"/>`);
  if (hair) o.push(s(hair, 1.6, soft, ' stroke-dasharray="5 6"'));
  }
  if (!feat) return o.join('');
  if (brows) o.push(s(browL, template ? 2.2 : 4.5, template ? soft : '#6b4c35'), s(browR, template ? 2.2 : 4.5, template ? soft : '#6b4c35'));
  if (eyes === 'closed') {
    o.push(s(closedL, 2.2), s(closedR, 2.2));
    for (const side of [-1, 1]) for (let k = 0; k < 5; k++) {
      const t = 0.15 + k * 0.17, x = side < 0 ? 120 + 60 * t : 280 - 60 * t, y = 226 + 10 * Math.sin(Math.PI * t);
      o.push(s(`M${x.toFixed(1)} ${y.toFixed(1)}l${(side * (k - 2) * 1.5).toFixed(1)} 7`, 1.4));
    }
  } else {
    o.push(`<path d="${eyeL}" fill="#fff" stroke="${line}" stroke-width="2"/>`, `<path d="${eyeR}" fill="#fff" stroke="${line}" stroke-width="2"/>`);
    if (!template) o.push(`<circle cx="150" cy="225" r="9" fill="#5a4030"/><circle cx="250" cy="225" r="9" fill="#5a4030"/><circle cx="153" cy="222" r="2.4" fill="#fff"/><circle cx="253" cy="222" r="2.4" fill="#fff"/>`);
    else o.push(`<circle cx="150" cy="225" r="9" fill="none" stroke="${soft}" stroke-width="1.4"/><circle cx="250" cy="225" r="9" fill="none" stroke="${soft}" stroke-width="1.4"/>`);
    o.push(s(lidL, 1.3, soft), s(lidR, 1.3, soft));
  }
  o.push(s(nose, 1.8, soft));
  if (lips && !template) o.push(`<path d="${lipUp}" fill="#c9787a" stroke="${line}" stroke-width="1.4"/><path d="${lipLo}" fill="#d98b8c" stroke="${line}" stroke-width="1.4"/>`);
  else o.push(`<path d="${lipUp}" fill="none" stroke="${line}" stroke-width="1.6"/><path d="${lipLo}" fill="none" stroke="${line}" stroke-width="1.6"/>`);
  if (centre) o.push(s(centre, 1.2, '#9aa3ad', ' stroke-dasharray="4 5"'));
  return o.join('');
}

// Clip path id helper: designs that must stay on the skin can be clipped to the head shape.
export const headClip = (id) => `<clipPath id="${id}"><path d="${head}"/></clipPath>`;

// ---------- Hand and forearm (back of the left hand, fingers up), frame 400 x 500 ----------
export const ARM = {
  outline: 'M150 500C152 440 150 390 146 352C140 320 120 300 104 268C94 248 84 232 82 214C80 200 94 194 104 204C114 214 124 232 136 246C134 210 128 160 126 120C125 104 142 100 146 116C150 140 154 180 160 214C160 170 160 110 162 72C163 56 182 56 183 72C186 112 188 170 190 212C194 170 198 118 204 84C207 68 225 70 224 86C222 122 220 172 220 216C226 182 234 146 242 122C247 108 264 112 261 128C254 166 248 210 246 252C244 300 246 340 246 380C246 420 248 460 252 500',
  knuckles: [[148, 238], [174, 222], [202, 222], [228, 232]],
  back: [196, 300], wrist: [198, 380], forearm: [198, 450],
};

// ---------- Shoulders and upper body (front), frame 400 x 500 ----------
export const BODY = {
  outline: 'M160 40C158 80 160 110 168 130C130 140 80 150 50 175C30 192 22 240 20 300M240 40C242 80 240 110 232 130C270 140 320 150 350 175C370 192 378 240 380 300',
  collarbones: 'M120 175C150 168 175 172 195 182M280 175C250 168 225 172 205 182',
  sternum: [200, 230], shoulderL: [80, 180], shoulderR: [320, 180], collarL: [140, 172], collarR: [260, 172],
};

// Back of the hand and forearm (ARM frame, 400 x 500) filled with skin; content is clipped to it.
let handId = 0;
export function handSVG(content = '', skin = 'medium', { wrist = false } = {}) {
  const id = `hd${handId++}`;
  return `<defs><clipPath id="${id}"><path d="${ARM.outline}Z"/></clipPath></defs>`
    + `<path d="${ARM.outline}Z" fill="${SKIN[skin] ?? skin}"/>`
    + `<g clip-path="url(#${id})">${content}</g>`
    + `<path d="${ARM.outline}" fill="none" stroke="#5b4636" stroke-width="2.4" stroke-linejoin="round"/>`
    + ARM.knuckles.map(([x, y]) => `<path d="M${x - 7} ${y + 4}q7 -5 14 0" fill="none" stroke="#8a7462" stroke-width="1.4" stroke-linecap="round"/>`).join('')
    + (wrist ? `<path d="M150 385C180 392 220 392 246 385" fill="none" stroke="#8a7462" stroke-width="1.2" stroke-dasharray="4 5"/>` : '');
}
