// Small geometry helpers shared by the diagram and sheet libraries (no dependencies).
// Coordinates are SVG-style: x right, y down.

export const n1 = (v) => (Math.round(v * 10) / 10).toString();
export const n2 = (v) => (Math.round(v * 100) / 100).toString();

// Seeded random numbers, so every build of a diagram is identical.
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export const rad = (deg) => (deg * Math.PI) / 180;
export const pol = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];

// Catmull-Rom spline through points -> dense polyline.
export function spline(pts, perSeg = 16) {
  if (pts.length < 3) {
    const out = [];
    const [a, b] = [pts[0], pts[pts.length - 1]];
    for (let i = 0; i <= perSeg; i++) { const t = i / perSeg; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    return out;
  }
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  const out = [];
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    for (let j = 0; j < perSeg; j++) {
      const t = j / perSeg, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((k) => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t
        + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

export const polyD = (pts, close = false) => `M${pts.map((p) => `${n1(p[0])} ${n1(p[1])}`).join('L')}${close ? 'Z' : ''}`;

// Parse an absolute SVG path (M L H V C S Q T Z, also lower-case relative) and sample it into
// polylines: returns [{ pts, closed }]. Used to put the same face drawings on PDF practice sheets.
export function samplePath(d, step = 2) {
  const toks = d.match(/[MLHVCSQTZmlhvcsqtz]|-?\d*\.?\d+(?:e-?\d+)?/g);
  const out = [];
  let i = 0, cmd = '', cx = 0, cy = 0, sx = 0, sy = 0, cur = null, lc = null;
  const num = () => parseFloat(toks[i++]);
  const push = (x, y) => cur.pts.push([x, y]);
  const bez = (p0, p1, p2, p3) => {
    const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) + Math.hypot(p3[0] - p2[0], p3[1] - p2[1]);
    const n = Math.max(4, Math.ceil(len / step));
    for (let k = 1; k <= n; k++) {
      const t = k / n, u = 1 - t;
      push(u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]);
    }
  };
  while (i < toks.length) {
    if (/[A-Za-z]/.test(toks[i])) cmd = toks[i++];
    const rel = cmd === cmd.toLowerCase() && cmd !== 'z' && cmd !== 'Z';
    const ox = rel ? cx : 0, oy = rel ? cy : 0;
    switch (cmd.toUpperCase()) {
      case 'M': { cx = num() + ox; cy = num() + oy; sx = cx; sy = cy; cur = { pts: [[cx, cy]], closed: false }; out.push(cur); cmd = rel ? 'l' : 'L'; lc = null; break; }
      case 'L': { cx = num() + ox; cy = num() + oy; push(cx, cy); lc = null; break; }
      case 'H': { cx = num() + (rel ? cx : 0); push(cx, cy); lc = null; break; }
      case 'V': { cy = num() + (rel ? cy : 0); push(cx, cy); lc = null; break; }
      case 'C': {
        const p1 = [num() + ox, num() + oy], p2 = [num() + ox, num() + oy], p3 = [num() + ox, num() + oy];
        bez([cx, cy], p1, p2, p3); [cx, cy] = p3; lc = p2; break;
      }
      case 'S': {
        const p1 = lc ? [2 * cx - lc[0], 2 * cy - lc[1]] : [cx, cy];
        const p2 = [num() + ox, num() + oy], p3 = [num() + ox, num() + oy];
        bez([cx, cy], p1, p2, p3); [cx, cy] = p3; lc = p2; break;
      }
      case 'Q': {
        const q = [num() + ox, num() + oy], p3 = [num() + ox, num() + oy];
        const p1 = [cx + 2 / 3 * (q[0] - cx), cy + 2 / 3 * (q[1] - cy)], p2 = [p3[0] + 2 / 3 * (q[0] - p3[0]), p3[1] + 2 / 3 * (q[1] - p3[1])];
        bez([cx, cy], p1, p2, p3); [cx, cy] = p3; lc = null; break;
      }
      case 'Z': { push(sx, sy); cur.closed = true; cx = sx; cy = sy; lc = null; break; }
      default: i++;
    }
  }
  return out;
}

// Variable-width brush stroke along a spline through `pts`.
// profile(t) -> 0..1 width multiplier. Returns a closed path d string.
export function ribbon(pts, width, profile = taper('both')) {
  const c = spline(pts, 20);
  const L = [], R = [];
  let total = 0;
  const acc = [0];
  for (let i = 1; i < c.length; i++) { total += Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]); acc.push(total); }
  for (let i = 0; i < c.length; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const w = (width / 2) * profile(total ? acc[i] / total : 0);
    L.push([c[i][0] - dy * w, c[i][1] + dx * w]);
    R.push([c[i][0] + dy * w, c[i][1] - dx * w]);
  }
  return polyD([...L, ...R.reverse()], true);
}

// Width profiles. 'both' = thin-thick-thin (pressure stroke), 'end' = thick start, pointed end,
// 'start' = pointed start, thick end, 'none' = even line with soft round-ish ends.
export function taper(kind = 'both', min = 0.08) {
  const f = {
    both: (t) => Math.sin(Math.PI * t) ** 0.7,
    end: (t) => Math.min(1, (1 - t) * 1.6) ** 0.8 * (t < 0.06 ? 0.6 + t / 0.15 : 1),
    start: (t) => Math.min(1, t * 1.6) ** 0.8 * (t > 0.94 ? 0.6 + (1 - t) / 0.15 : 1),
    none: (t) => (t < 0.04 ? 0.7 + t * 7 : t > 0.96 ? 0.7 + (1 - t) * 7 : 1),
  }[kind];
  return (t) => Math.max(min, Math.min(1, f(t)));
}
