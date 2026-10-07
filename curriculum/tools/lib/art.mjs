// Painting primitives for diagrams: brush strokes, teardrops, petals, dots, swirls, sponge
// blends, glitter and gems. Every function returns SVG markup in the caller's coordinates.
import { n1, ribbon, taper, spline, polyD, rng, pol, rad } from './geom.mjs';

// Face-paint colours (cake colours) used in all diagrams.
export const P = {
  white: '#ffffff', black: '#1d1d22', red: '#e0313b', orange: '#f58a1f', yellow: '#ffd23a',
  green: '#3cb44b', lime: '#a6e22e', teal: '#16b3a6', blue: '#2f6fe0', sky: '#62c3f5', navy: '#1f2f7a',
  purple: '#7b3fc4', violet: '#a77be0', pink: '#ff6fae', magenta: '#e4258e', brown: '#8a5a33',
  gold: '#e1b43c', silver: '#c8ccd4', grey: '#9aa1ab',
  // neon look-alikes for Level 2 "UV" diagrams
  neonPink: '#ff2fb4', neonGreen: '#39ff6a', neonYellow: '#f4ff3a', neonOrange: '#ff7a1a', neonBlue: '#25c8ff',
};

// Labels and arrows
export const INK = '#2b2f3a', SOFT = '#6b7280', ACCENT = '#d6336c', OK = '#2f9e44', BAD = '#e03131';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function label(x, y, text, { size = 14, color = INK, anchor = 'middle', bold = false, halo = true } = {}) {
  const t = esc(text);
  const base = `x="${n1(x)}" y="${n1(y)}" text-anchor="${anchor}" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="${size}"${bold ? ' font-weight="700"' : ''}`;
  return (halo ? `<text ${base} fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round" opacity="0.9">${t}</text>` : '') + `<text ${base} fill="${color}">${t}</text>`;
}

// Straight or curved arrow (pts: 2+ points), with head at the end.
export function arrow(pts, { color = ACCENT, width = 2.5, head = 10, dash = null } = {}) {
  const c = pts.length > 2 ? spline(pts, 12) : pts;
  const [a, b] = [c[c.length - 2], c[c.length - 1]];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const h1 = [b[0] - head * Math.cos(ang - 0.45), b[1] - head * Math.sin(ang - 0.45)];
  const h2 = [b[0] - head * Math.cos(ang + 0.45), b[1] - head * Math.sin(ang + 0.45)];
  return `<path d="${polyD(c)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`
    + `<path d="M${n1(h1[0])} ${n1(h1[1])}L${n1(b[0])} ${n1(b[1])}L${n1(h2[0])} ${n1(h2[1])}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// Numbered circle marker (step numbers, "start here" marks).
export function badge(x, y, text, { color = ACCENT, r = 11, fill = '#fff' } = {}) {
  return `<circle cx="${n1(x)}" cy="${n1(y)}" r="${r}" fill="${fill}" stroke="${color}" stroke-width="2"/>`
    + `<text x="${n1(x)}" y="${n1(y + r * 0.38)}" text-anchor="middle" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="${r * 1.1}" font-weight="700" fill="${color}">${esc(text)}</text>`;
}

// Tick / cross marks for good vs. bad examples.
export const tick = (x, y, s = 14) => `<path d="M${x - s * 0.6} ${y}l${s * 0.4} ${s * 0.45}l${s * 0.8} -${s}" fill="none" stroke="${OK}" stroke-width="${s / 4}" stroke-linecap="round" stroke-linejoin="round"/>`;
export const cross = (x, y, s = 14) => `<path d="M${x - s / 2} ${y - s / 2}l${s} ${s}M${x + s / 2} ${y - s / 2}l-${s} ${s}" stroke="${BAD}" stroke-width="${s / 4}" stroke-linecap="round"/>`;

// ---------- brush strokes ----------

// Pressure stroke through points: thin -> thick -> thin by default.
export function stroke(pts, { w = 10, color = P.black, kind = 'both', opacity = 1 } = {}) {
  return `<path d="${ribbon(pts, w, taper(kind))}" fill="${color}"${opacity < 1 ? ` opacity="${opacity}"` : ''}/>`;
}

// Even-width line (liner brush), round caps.
export function line(pts, { w = 3, color = P.black, dash = null, opacity = 1 } = {}) {
  const c = pts.length > 2 ? spline(pts, 14) : pts;
  return `<path d="${polyD(c)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''}${opacity < 1 ? ` opacity="${opacity}"` : ''}/>`;
}

// Teardrop: round head at (x, y), tail pointing `deg` (0 = right, 90 = down), length len, head width w.
export function teardrop(x, y, deg, len, w, color = P.black, { curve = 0 } = {}) {
  const r = w / 2;
  const tip = pol(x, y, len, deg);
  const mid = pol(x, y, len * 0.55, deg);
  const bend = pol(mid[0], mid[1], curve * len * 0.25, deg + 90);
  const a = pol(x, y, r, deg - 90), b = pol(x, y, r, deg + 90);
  const back = pol(x, y, r * 1.35, deg + 180);
  const ca = pol(a[0], a[1], r * 0.75, deg + 180), cb = pol(b[0], b[1], r * 0.75, deg + 180);
  return `<path d="M${n1(a[0])} ${n1(a[1])}Q${n1(bend[0] + (a[0] - x) * 0.5)} ${n1(bend[1] + (a[1] - y) * 0.5)} ${n1(tip[0])} ${n1(tip[1])}`
    + `Q${n1(bend[0] + (b[0] - x) * 0.5)} ${n1(bend[1] + (b[1] - y) * 0.5)} ${n1(b[0])} ${n1(b[1])}`
    + `C${n1(cb[0])} ${n1(cb[1])} ${n1(back[0] + (b[0] - x) * 0.55)} ${n1(back[1] + (b[1] - y) * 0.55)} ${n1(back[0])} ${n1(back[1])}`
    + `C${n1(back[0] + (a[0] - x) * 0.55)} ${n1(back[1] + (a[1] - y) * 0.55)} ${n1(ca[0])} ${n1(ca[1])} ${n1(a[0])} ${n1(a[1])}Z" fill="${color}"/>`;
}

// Petal / leaf: from base (x, y) pointing `deg`, length len, width w. Pointed tip, narrow base.
export function petal(x, y, deg, len, w, color = P.pink, { round = false, stroke: st = null } = {}) {
  const tip = pol(x, y, len, deg);
  const m = pol(x, y, len * (round ? 0.6 : 0.5), deg);
  const a = pol(m[0], m[1], w / 2 * (round ? 1.25 : 1.15), deg - 90), b = pol(m[0], m[1], w / 2 * (round ? 1.25 : 1.15), deg + 90);
  const t1 = pol(tip[0], tip[1], round ? w * 0.35 : 0, deg - 90), t2 = pol(tip[0], tip[1], round ? w * 0.35 : 0, deg + 90);
  return `<path d="M${n1(x)} ${n1(y)}Q${n1(a[0])} ${n1(a[1])} ${n1(t1[0])} ${n1(t1[1])}${round ? `Q${n1(tip[0] + (tip[0] - m[0]) * 0.25)} ${n1(tip[1] + (tip[1] - m[1]) * 0.25)} ${n1(t2[0])} ${n1(t2[1])}` : ''}Q${n1(b[0])} ${n1(b[1])} ${n1(x)} ${n1(y)}Z" fill="${color}"${st ? ` stroke="${st}" stroke-width="2"` : ''}/>`;
}

export const dot = (x, y, r, color = P.white) => `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r)}" fill="${color}"/>`;

// Dots along a spline, sizes from rStart to rEnd (a "dot trail").
export function dots(pts, n, rStart, rEnd = rStart, color = P.white) {
  const c = spline(pts, 30);
  const acc = [0];
  for (let i = 1; i < c.length; i++) acc.push(acc[i - 1] + Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]));
  const total = acc[acc.length - 1], out = [];
  for (let k = 0; k < n; k++) {
    const target = n === 1 ? 0 : (total * k) / (n - 1);
    let j = acc.findIndex((v) => v >= target); if (j < 0) j = c.length - 1;
    out.push(dot(c[j][0], c[j][1], rStart + (rEnd - rStart) * (n === 1 ? 0 : k / (n - 1)), color));
  }
  return out.join('');
}

// Spiral / curl centred at (cx, cy) starting at radius r going inward `turns` times.
export function spiral(cx, cy, r, turns = 1.5, { w = 8, color = P.black, startDeg = 0, dir = 1, kind = 'end' } = {}) {
  const pts = [];
  const n = Math.ceil(turns * 16);
  for (let i = 0; i <= n; i++) {
    const t = i / n, ang = startDeg + dir * t * turns * 360, rr = r * (1 - t * 0.85);
    pts.push(pol(cx, cy, rr, ang));
  }
  return stroke(pts, { w, color, kind });
}

// Star: n points, outer radius r, inner radius ri.
export function star(cx, cy, r, color = P.yellow, { n = 5, ri = r * 0.45, rot = -90, outline = null, ow = 2 } = {}) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) pts.push(pol(cx, cy, i % 2 ? ri : r, rot + (i * 180) / n));
  return `<path d="${polyD(pts, true)}" fill="${color}"${outline ? ` stroke="${outline}" stroke-width="${ow}" stroke-linejoin="round"` : ''}/>`;
}

// Four-point sparkle (highlight star).
export function sparkle(cx, cy, r, color = P.white) {
  return star(cx, cy, r, color, { n: 4, ri: r * 0.22, rot: -90 });
}

// Heart centred at (cx, cy), width w.
export function heart(cx, cy, w, color = P.red, { outline = null, ow = 2, rot = 0 } = {}) {
  const s = w / 100;
  const d = `M0 30C-10 10 -50 5 -50 -20C-50 -40 -32 -50 -18 -50C-6 -50 0 -40 0 -32C0 -40 6 -50 18 -50C32 -50 50 -40 50 -20C50 5 10 10 0 30Z`;
  return `<path transform="translate(${n1(cx)} ${n1(cy)}) rotate(${rot}) scale(${s})" d="${d}" fill="${color}"${outline ? ` stroke="${outline}" stroke-width="${ow / s}"` : ''}/>`;
}

// ---------- sponge blends ----------
let gid = 0;
// Fill a path with a soft linear blend of colours (sponge or split-cake look).
// colors: ['#a', '#b', ...]; deg: direction of the blend; soft: blur of the edge (0 = crisp).
export function sponge(d, colors, { deg = 0, soft = 3, opacity = 1, id = null } = {}) {
  const g = id ?? `sg${gid++}`;
  const [x1, y1] = pol(0.5, 0.5, 0.5, deg + 180), [x2, y2] = pol(0.5, 0.5, 0.5, deg);
  const stops = colors.map((c, i) => `<stop offset="${colors.length === 1 ? 0 : (i / (colors.length - 1)).toFixed(3)}" stop-color="${c}"/>`).join('');
  return `<defs><linearGradient id="${g}" x1="${x1.toFixed(3)}" y1="${y1.toFixed(3)}" x2="${x2.toFixed(3)}" y2="${y2.toFixed(3)}">${stops}</linearGradient>`
    + (soft ? `<filter id="${g}f" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${soft}"/></filter>` : '')
    + `</defs><path d="${d}" fill="url(#${g})"${soft ? ` filter="url(#${g}f)"` : ''}${opacity < 1 ? ` opacity="${opacity}"` : ''}/>`;
}

// Radial soft blush (cheek colour, glow).
export function glow(cx, cy, rx, ry, color, { opacity = 0.6 } = {}) {
  const g = `rg${gid++}`;
  return `<defs><radialGradient id="${g}"><stop offset="0" stop-color="${color}" stop-opacity="${opacity}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs>`
    + `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="url(#${g})"/>`;
}

// Stippled sponge texture (shows "dabbing" instead of wiping).
export function stipple(d, color, { seed = 3, n = 260, bbox = [0, 0, 400, 500], r = [1, 2.6], opacity = 0.75 } = {}) {
  const g = `cp${gid++}`, rnd = rng(seed), out = [];
  for (let i = 0; i < n; i++) out.push(dot(bbox[0] + rnd() * bbox[2], bbox[1] + rnd() * bbox[3], r[0] + rnd() * (r[1] - r[0]), color));
  return `<defs><clipPath id="${g}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${g})" opacity="${opacity}">${out.join('')}</g>`;
}

// ---------- glitter and gems ----------

// Glitter scattered inside path d. colors: list; dens: flakes per 1000 square units of bbox.
export function glitter(d, bbox, { colors = [P.gold, P.silver, '#fff3b0'], n = 160, seed = 7, size = [1.2, 3] } = {}) {
  const g = `gl${gid++}`, rnd = rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const x = bbox[0] + rnd() * bbox[2], y = bbox[1] + rnd() * bbox[3], s = size[0] + rnd() * (size[1] - size[0]);
    const c = colors[Math.floor(rnd() * colors.length)];
    out.push(rnd() < 0.18 ? sparkle(x, y, s * 2.2, '#ffffff') : `<rect x="${n1(x - s / 2)}" y="${n1(y - s / 2)}" width="${n1(s)}" height="${n1(s)}" fill="${c}" transform="rotate(${Math.round(rnd() * 90)} ${n1(x)} ${n1(y)})"/>`);
  }
  return `<defs><clipPath id="${g}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${g})">${out.join('')}</g>`;
}

// Faceted gem. shape: 'round' | 'drop' | 'star' | 'square'; deg rotates drop/star.
export function gem(cx, cy, r, color = '#6fd3ff', { shape = 'round', deg = -90 } = {}) {
  const hi = '#ffffff', edge = 'rgba(0,0,0,0.35)';
  let outline;
  if (shape === 'drop') {
    const tip = pol(cx, cy, r * 1.9, deg), a = pol(cx, cy, r, deg - 90), b = pol(cx, cy, r, deg + 90), bk = pol(cx, cy, r, deg + 180);
    outline = `M${n1(tip[0])} ${n1(tip[1])}Q${n1(a[0] + (tip[0] - cx) * 0.35)} ${n1(a[1] + (tip[1] - cy) * 0.35)} ${n1(a[0])} ${n1(a[1])}A${r} ${r} 0 0 0 ${n1(bk[0])} ${n1(bk[1])}A${r} ${r} 0 0 0 ${n1(b[0])} ${n1(b[1])}Q${n1(b[0] + (tip[0] - cx) * 0.35)} ${n1(b[1] + (tip[1] - cy) * 0.35)} ${n1(tip[0])} ${n1(tip[1])}Z`;
  } else if (shape === 'star') {
    const pts = []; for (let i = 0; i < 10; i++) pts.push(pol(cx, cy, i % 2 ? r * 0.5 : r * 1.2, deg + i * 36));
    outline = polyD(pts, true);
  } else if (shape === 'square') {
    outline = polyD([0, 90, 180, 270].map((a) => pol(cx, cy, r * 1.15, a + 45 + (deg + 90))), true);
  } else {
    outline = polyD(Array.from({ length: 8 }, (_, i) => pol(cx, cy, r, i * 45 + 22.5)), true);
  }
  const table = polyD(Array.from({ length: 8 }, (_, i) => pol(cx, cy, r * 0.5, i * 45 + 22.5)), true);
  return `<path d="${outline}" fill="${color}" stroke="${edge}" stroke-width="1"/>`
    + (shape === 'round' ? `<path d="${table}" fill="#ffffff" opacity="0.28"/>` : '')
    + `<path d="M${n1(cx - r * 0.45)} ${n1(cy - r * 0.15)}L${n1(cx - r * 0.1)} ${n1(cy - r * 0.5)}" stroke="${hi}" stroke-width="${n1(Math.max(1, r * 0.18))}" stroke-linecap="round" opacity="0.9"/>`;
}

// ---------- paper swatches and palettes ----------

// Round paint cake (a pot of face paint seen from above).
export function cake(cx, cy, r, color, { name = null } = {}) {
  return `<circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="#e9ecef" stroke="#adb5bd" stroke-width="1.5"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="rgba(0,0,0,0.2)"/>`
    + (name ? label(cx, cy + r + 22, name, { size: 13, color: SOFT }) : '');
}

// Simple round brush seen from the side: tip at (x, y), pointing `deg`, length len.
export function brush(x, y, deg = -60, len = 150, { tip = 'round', color = '#c0392b', size = 1 } = {}) {
  const s = size;
  const p = (r, a = 0) => pol(x, y, r, deg + 180 + a);
  const hairLen = 26 * s, ferrule = 22 * s, w = 6 * s;
  const side = (r, k) => pol(...p(r), k, deg + 90);
  const hair = tip === 'flat'
    ? polyD([side(0, -w), side(0, w), side(hairLen, w), side(hairLen, -w)], true)
    : polyD([p(0), side(hairLen * 0.45, w), side(hairLen, w * 0.8), side(hairLen, -w * 0.8), side(hairLen * 0.45, -w)], true);
  const fer = polyD([side(hairLen, w * 0.85), side(hairLen + ferrule, w * 0.85), side(hairLen + ferrule, -w * 0.85), side(hairLen, -w * 0.85)], true);
  const handle = polyD([side(hairLen + ferrule, w * 0.8), side(len, w * 0.45), side(len, -w * 0.45), side(hairLen + ferrule, -w * 0.8)], true);
  return `<path d="${handle}" fill="${color}"/><path d="${fer}" fill="#b8bec6" stroke="#868e96" stroke-width="1"/><path d="${hair}" fill="#3b2f2a"/>`;
}

export { rad, pol, spline, polyD, rng };

// Points of a curl: a lead-in, then a spiral from radius r toward the center (use with stroke()).
export function curlPts(cx, cy, r, { turns = 1, startDeg = 180, dir = 1, lead = 40, inner = 0.2 } = {}) {
  const pts = [], n = Math.ceil(turns * 18);
  for (let i = 0; i <= n; i++) { const t = i / n; pts.push(pol(cx, cy, r * (1 - t * (1 - inner)), startDeg + dir * t * turns * 360)); }
  const back = startDeg - dir * 90;
  return lead ? [pol(pts[0][0], pts[0][1], lead, back), ...pts] : pts;
}
