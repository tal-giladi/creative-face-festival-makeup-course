// Diagram canvases: save SVGs to assets/, single face figures and step-by-step strips.
// Every lesson diagram is made with these, so the course looks like one system.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { faceSVG, headClip, FW, FH } from './face.mjs';
import { label, arrow, badge, INK, SOFT } from './art.mjs';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
export const ASSETS = join(ROOT, 'assets');
const BG = '#fbf8f4';

let uid = 0;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function save(name, svg) {
  mkdirSync(ASSETS, { recursive: true });
  writeFileSync(join(ASSETS, `${name}.svg`), svg.endsWith('\n') ? svg : svg + '\n');
}

// Plain canvas w x h for any hand-made diagram.
export function plain(name, title, w, h, content, { bg = BG } = {}) {
  const id = `p${uid++}`;
  save(name, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="${id}t">
<title id="${id}t">${esc(title)}</title>
<rect width="${w}" height="${h}" fill="${bg}"/>
${content}
</svg>`);
}

// Face content: the base face plus design layers.
//  under: drawn after the skin but before eyes/brows/lips (most paint goes here, so eyes stay visible)
//  over:  drawn on top of everything (gems, glitter, labels)
//  clip:  clip `under` to the head shape (default true)
export function faceLayer({ under = '', over = '', skin = 'light', eyes = 'open', clip = true, centre = false, brows = true, lips = true, hair = true, template = false } = {}) {
  const id = `h${uid++}`;
  // Draw the skin + outline, then the paint, then the features again on top of the paint.
  const base = faceSVG({ skin, eyes, hair, template, parts: 'base' });
  const features = faceSVG({ skin, eyes, centre, brows, lips, template, parts: 'features' });
  return `<defs>${headClip(id)}</defs>${base}<g${clip ? ` clip-path="url(#${id})"` : ''}>${under}</g>${features}${over}`;
}

// One face figure, optionally cropped with view [x, y, w, h] (face units). scale = px per unit.
export function faceFig(name, title, opts = {}) {
  const [vx, vy, vw, vh] = opts.view ?? [40, 40, 320, 460];
  const s = opts.scale ?? 1.2;
  const id = `f${uid++}`;
  save(name, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${Math.round(vw * s)}" height="${Math.round(vh * s)}" role="img" aria-labelledby="${id}t">
<title id="${id}t">${esc(title)}</title>
<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${opts.bg ?? BG}"/>
${faceLayer(opts)}
${opts.labels ?? ''}
</svg>`);
}

/**
 * strip(name, title, panels, opts) — Step 1 -> Step 2 -> ... -> Finished.
 *  panels: [{ content, view: [x, y, w, h], label: '1' | 'Done', caption }]
 *    content is SVG in the panel's own units (e.g. faceLayer(...) for a face, or paper drawings).
 *  opts: cols (panels per row, default all), pw (panel width px, default 220), gap, arrows (default true)
 *  All panels in a strip should use the same view size so they line up.
 */
export function strip(name, title, panels, opts = {}) {
  const cols = opts.cols ?? panels.length;
  const pw = opts.pw ?? 220, gap = opts.gap ?? 44, pad = 14, capH = panels.some((p) => p.caption) ? 30 : 0;
  const [, , vw0, vh0] = panels[0].view;
  const ph = Math.round((pw * vh0) / vw0);
  const rowsN = Math.ceil(panels.length / cols);
  const W = pad * 2 + cols * pw + (cols - 1) * gap, H = pad * 2 + rowsN * (ph + capH + 26) + (rowsN - 1) * 18;
  const id = `s${uid++}`;
  const out = [];
  panels.forEach((p, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    const x = pad + c * (pw + gap), y = pad + 26 + r * (ph + capH + 26 + 18);
    const [vx, vy, vw, vh] = p.view;
    out.push(`<rect x="${x - 1}" y="${y - 1}" width="${pw + 2}" height="${ph + 2}" rx="8" fill="#fff" stroke="#e3ddd5"/>`);
    out.push(`<svg x="${x}" y="${y}" width="${pw}" height="${ph}" viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet">${p.bg === false ? '' : `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${p.bg ?? BG}"/>`}${p.content}</svg>`);
    const lab = p.label ?? String(i + 1);
    if (/^\d+$/.test(lab)) out.push(badge(x + 4, y - 12, lab, { r: 12 }));
    else out.push(label(x + 2, y - 7, lab, { size: 15, bold: true, anchor: 'start', color: p.labelColor ?? (/^(avoid|no|wrong|bad|not)/i.test(lab) ? '#e03131' : '#2f9e44'), halo: false }));
    if (p.caption) out.push(label(x + pw / 2, y + ph + 21, p.caption, { size: 14, color: SOFT, halo: false }));
    if ((opts.arrows ?? true) && i < panels.length - 1 && c < cols - 1) {
      const ay = y + ph / 2;
      out.push(arrow([[x + pw + 8, ay], [x + pw + gap - 8, ay]], { color: '#c2b8ab', width: 3 }));
    }
  });
  save(name, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${id}t">
<title id="${id}t">${esc(title)}</title>
<rect width="${W}" height="${H}" fill="${opts.bg ?? '#ffffff'}"/>
${out.join('\n')}
</svg>`);
}

// A face panel for strip(): same arguments as faceLayer, plus view (default whole face).
export const facePanel = (opts = {}, label = undefined, caption = undefined) => ({
  content: faceLayer(opts), view: opts.view ?? [40, 40, 320, 460], label, caption,
});

// A paper panel (practice on paper): plain content on a paper-coloured view.
export const paperPanel = (content, view = [0, 0, 300, 300], label = undefined, caption = undefined) => ({ content, view, label, caption, bg: '#ffffff' });

export { FW, FH, INK };
