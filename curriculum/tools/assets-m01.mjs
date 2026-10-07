// Module 1 diagrams. Run: node curriculum/tools/assets-m01.mjs
import { plain, strip, paperPanel, facePanel } from './lib/figure.mjs';
import { P, cake, brush, label, arrow, tick, cross, line, stroke, dot, teardrop, SOFT, INK } from './lib/art.mjs';

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

void SOFT; void dot; void teardrop; void facePanel;
console.log('m01 assets written');
