// Printable practice sheets: one drawing API that writes both SVG and PDF (no dependencies).
// Units are millimetres, origin top-left. A4 and US Letter.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { samplePath } from './geom.mjs';

export const PAPER = { a4: [210, 297], letter: [215.9, 279.4] };
export const GREY = '#9aa1ad', LIGHT = '#c9ced6', FAINT = '#e3e6eb', INK = '#1f2a44', MODEL = '#b4b9c2';
const PT = 72 / 25.4;

// Helvetica average glyph widths (per 1000 em) for rough text measuring
const narrow = 'iljtf.,;:\'!|I ', wide = 'mwMW@';
const textWidth = (s, size) => [...s].reduce((a, ch) => a + (narrow.includes(ch) ? 0.28 : wide.includes(ch) ? 0.85 : /[A-Z0-9]/.test(ch) ? 0.66 : 0.53), 0) * size;

const hex = (c) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => (v / 255).toFixed(3)).join(' '); };
const n2 = (v) => (Math.round(v * 100) / 100).toString();
const escX = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escP = (s) => String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/[^\x20-\x7e]/g, (ch) => WIN[ch] ?? '-');
// WinAnsi octal codes for the few non-ASCII characters sheets use
const WIN = { '°': '\\260', '·': '\\267', '—': '\\227', '–': '\\226', '’': '\\222', '“': '\\223', '”': '\\224' };

export class Sheet {
  constructor(paper = 'a4', title = 'Practice sheet') {
    this.paper = paper; [this.w, this.h] = PAPER[paper]; this.title = title; this.ops = [];
  }
  line(x1, y1, x2, y2, { color = LIGHT, width = 0.25, dash = null } = {}) { this.ops.push({ t: 'line', x1, y1, x2, y2, color, width, dash }); return this; }
  rect(x, y, w, h, { stroke = null, fill = null, width = 0.25 } = {}) { this.ops.push({ t: 'rect', x, y, w, h, stroke, fill, width }); return this; }
  text(x, y, s, { size = 3, color = GREY, anchor = 'start', bold = false } = {}) { this.ops.push({ t: 'text', x, y, s, size, color, anchor, bold }); return this; }
  poly(pts, { fill = MODEL } = {}) { this.ops.push({ t: 'poly', pts, fill }); return this; }
  circle(cx, cy, r, { fill = MODEL } = {}) { this.ops.push({ t: 'circle', cx, cy, r, fill }); return this; }
  pline(pts, { color = GREY, width = 0.35, dash = null, closed = false, fill = null } = {}) { this.ops.push({ t: 'pline', pts, color, width, dash, closed, fill }); return this; }

  // Draw SVG path data d (any frame) placed at (x, y) with scale k (mm per unit).
  path(d, x, y, k, opts = {}) {
    for (const p of samplePath(d, 1.5)) this.pline(p.pts.map(([u, v]) => [x + u * k, y + v * k]), { ...opts, closed: p.closed });
    return this;
  }


  svg() {
    const o = this.ops.map((p) => {
      if (p.t === 'line') return `<line x1="${n2(p.x1)}" y1="${n2(p.y1)}" x2="${n2(p.x2)}" y2="${n2(p.y2)}" stroke="${p.color}" stroke-width="${p.width}"${p.dash ? ` stroke-dasharray="${p.dash.join(' ')}"` : ''}/>`;
      if (p.t === 'rect') return `<rect x="${n2(p.x)}" y="${n2(p.y)}" width="${n2(p.w)}" height="${n2(p.h)}" fill="${p.fill ?? 'none'}"${p.stroke ? ` stroke="${p.stroke}" stroke-width="${p.width}"` : ''}/>`;
      if (p.t === 'text') return `<text x="${n2(p.x)}" y="${n2(p.y)}" font-family="Helvetica,Arial,sans-serif" font-size="${p.size}" fill="${p.color}" text-anchor="${p.anchor}"${p.bold ? ' font-weight="700"' : ''}>${escX(p.s)}</text>`;
      if (p.t === 'poly') return `<path d="M${p.pts.map((q) => `${n2(q[0])} ${n2(q[1])}`).join('L')}Z" fill="${p.fill}"/>`;
      if (p.t === 'pline') return `<path d="M${p.pts.map((q) => `${n2(q[0])} ${n2(q[1])}`).join('L')}${p.closed ? 'Z' : ''}" fill="${p.fill ?? 'none'}" stroke="${p.color}" stroke-width="${p.width}" stroke-linecap="round" stroke-linejoin="round"${p.dash ? ` stroke-dasharray="${p.dash.join(' ')}"` : ''}/>`;
      if (p.t === 'circle') return `<circle cx="${n2(p.cx)}" cy="${n2(p.cy)}" r="${n2(p.r)}" fill="${p.fill}"/>`;
      return '';
    }).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${this.w}mm" height="${this.h}mm" viewBox="0 0 ${this.w} ${this.h}">
<title>${escX(this.title)}</title>
<rect width="${this.w}" height="${this.h}" fill="#fff"/>
${o}
</svg>
`;
  }

  pdf() {
    const H = this.h;
    const X = (v) => n2(v * PT), Y = (v) => n2((H - v) * PT);
    const c = [];
    for (const p of this.ops) {
      if (p.t === 'line') c.push(`${hex(p.color)} RG ${n2(p.width * PT)} w ${p.dash ? `[${p.dash.map((d) => n2(d * PT)).join(' ')}] 0 d` : '[] 0 d'} ${X(p.x1)} ${Y(p.y1)} m ${X(p.x2)} ${Y(p.y2)} l S`);
      if (p.t === 'rect') {
        const r = `${X(p.x)} ${Y(p.y + p.h)} ${n2(p.w * PT)} ${n2(p.h * PT)} re`;
        if (p.fill) c.push(`${hex(p.fill)} rg ${r} f`);
        if (p.stroke) c.push(`${hex(p.stroke)} RG ${n2(p.width * PT)} w [] 0 d ${r} S`);
      }
      if (p.t === 'poly') c.push(`${hex(p.fill)} rg ${p.pts.map((q, i) => `${X(q[0])} ${Y(q[1])} ${i ? 'l' : 'm'}`).join(' ')} h f`);
      if (p.t === 'pline') {
        const d = p.pts.map((q, i) => `${X(q[0])} ${Y(q[1])} ${i ? 'l' : 'm'}`).join(' ') + (p.closed ? ' h' : '');
        if (p.fill) c.push(`${hex(p.fill)} rg ${d} f`);
        c.push(`${hex(p.color)} RG ${n2(p.width * PT)} w 1 J 1 j ${p.dash ? `[${p.dash.map((v) => n2(v * PT)).join(' ')}] 0 d` : '[] 0 d'} ${d} S`);
      }
      if (p.t === 'circle') {
        const k = 0.5523 * p.r, { cx, cy, r } = p;
        c.push(`${hex(p.fill)} rg ${X(cx + r)} ${Y(cy)} m `
          + `${X(cx + r)} ${Y(cy - k)} ${X(cx + k)} ${Y(cy - r)} ${X(cx)} ${Y(cy - r)} c `
          + `${X(cx - k)} ${Y(cy - r)} ${X(cx - r)} ${Y(cy - k)} ${X(cx - r)} ${Y(cy)} c `
          + `${X(cx - r)} ${Y(cy + k)} ${X(cx - k)} ${Y(cy + r)} ${X(cx)} ${Y(cy + r)} c `
          + `${X(cx + k)} ${Y(cy + r)} ${X(cx + r)} ${Y(cy + k)} ${X(cx + r)} ${Y(cy)} c f`);
      }
      if (p.t === 'text') {
        const wdt = textWidth(p.s, p.size);
        const x0 = p.anchor === 'middle' ? p.x - wdt / 2 : p.anchor === 'end' ? p.x - wdt : p.x;
        c.push(`${hex(p.color)} rg BT /${p.bold ? 'F2' : 'F1'} ${n2(p.size * PT)} Tf ${X(x0)} ${Y(p.y)} Td (${escP(p.s)}) Tj ET`);
      }
    }
    const stream = c.join('\n');
    const objs = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n2(this.w * PT)} ${n2(this.h * PT)}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`,
      `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
      `<< /Title (${escP(this.title)}) /Creator (Creative Face & Festival Makeup course) >>`,
    ];
    let out = '%PDF-1.4\n';
    const offs = [];
    objs.forEach((o, i) => { offs.push(Buffer.byteLength(out, 'latin1')); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = Buffer.byteLength(out, 'latin1');
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offs.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
    out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R /Info 7 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    return Buffer.from(out, 'latin1');
  }

  // Writes <base>-a4.pdf/.svg or <base>-letter.pdf/.svg
  save(base) {
    mkdirSync(dirname(base), { recursive: true });
    writeFileSync(`${base}-${this.paper}.svg`, this.svg());
    writeFileSync(`${base}-${this.paper}.pdf`, this.pdf());
  }
}

export const MARGIN = 12;

// Header, footer and the 10 cm print-scale check line.
export function frame(sh, heading, sub = '') {
  sh.text(MARGIN, MARGIN + 4, heading, { size: 4.6, color: INK, bold: true });
  if (sub) sh.text(MARGIN, MARGIN + 9.5, sub, { size: 3, color: GREY });
  sh.text(sh.w - MARGIN - 52, MARGIN + 4, 'Name:', { size: 3, color: GREY, anchor: 'end' });
  sh.line(sh.w - MARGIN - 50, MARGIN + 4.6, sh.w - MARGIN, MARGIN + 4.6, { color: LIGHT });
  const y = sh.h - MARGIN + 2;
  sh.line(MARGIN, y, MARGIN + 100, y, { color: GREY, width: 0.35 });
  for (let i = 0; i <= 10; i++) sh.line(MARGIN + i * 10, y - (i % 5 ? 1.2 : 2.2), MARGIN + i * 10, y, { color: GREY, width: 0.3 });
  sh.text(MARGIN + 103, y + 0.8, 'Must measure 10 cm. If not, print at 100% ("Actual size").', { size: 2.5, color: GREY });
  return { top: MARGIN + (sub ? 15 : 11), bottom: sh.h - MARGIN - 6 };
}

