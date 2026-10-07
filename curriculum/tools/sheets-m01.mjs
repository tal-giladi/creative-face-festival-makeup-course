// Module 1 printables -> labs/module-01/ (A4 and Letter, PDF + SVG).
// Run: node curriculum/tools/sheets-m01.mjs
import { join } from 'node:path';
import { Sheet, frame, MARGIN, GREY, LIGHT, INK } from './lib/sheet.mjs';
import { ROOT } from './lib/figure.mjs';

const OUT = join(ROOT, 'labs', 'module-01');

function pages(base, title, sub, draw) {
  for (const paper of ['a4', 'letter']) {
    const sh = new Sheet(paper, title);
    const { top, bottom } = frame(sh, title, sub);
    draw(sh, top, bottom);
    sh.save(join(OUT, base));
  }
}

// A simple table: column titles and widths (fractions), n empty rows.
function table(sh, x, y, w, h, cols, n, { head = 9 } = {}) {
  const rowH = (h - head) / n;
  sh.rect(x, y, w, head, { fill: '#f1f3f5' });
  let cx = x;
  for (const [t, f] of cols) {
    sh.text(cx + 2, y + 6, t, { size: 2.9, color: INK, bold: true });
    cx += f * w;
    if (cx < x + w - 0.1) sh.line(cx, y, cx, y + h, { color: LIGHT, width: 0.25 });
  }
  for (let r = 0; r <= n; r++) sh.line(x, y + head + r * rowH, x + w, y + head + r * rowH, { color: LIGHT, width: 0.25 });
  sh.line(x, y, x + w, y, { color: LIGHT, width: 0.25 });
  sh.line(x, y, x, y + h, { color: LIGHT, width: 0.25 }); sh.line(x + w, y, x + w, y + h, { color: LIGHT, width: 0.25 });
  return rowH;
}

// 1. Label sort (lesson 01.2)
pages('label-sort', 'Label check: skin, eyes or not for skin?', 'One row per product you find at home. Read the label, then tick one box. Lesson 01.2.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN;
  table(sh, MARGIN, top + 2, w, bottom - top - 36, [
    ['Product', 0.3], ['Face paint?', 0.15], ['Ingredients?', 0.15], ['Skin', 0.1], ['Eye area', 0.12], ['Not for skin', 0.18],
  ], 12);
  const y = bottom - 28;
  sh.text(MARGIN, y, 'Not for skin, always: acrylic or craft paint, markers, craft glitter, any glue not sold for skin, "black henna", kohl.', { size: 2.8, color: INK });
  sh.text(MARGIN, y + 6, 'Eye area only if the label allows it. Neon / fluorescent and glow-in-the-dark: never near the eyes.', { size: 2.8, color: INK });
  sh.text(MARGIN, y + 12, 'No ingredient list, or not sold as a cosmetic? Then it stays off skin.', { size: 2.8, color: GREY });
});

// 2. Consistency test (lesson 01.4)
pages('consistency-test', 'Paint consistency test', 'For each color paint three short lines: too wet, just right, too dry. Lesson 01.4.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN, rows = 7, head = 9;
  const rowH = table(sh, MARGIN, top + 2, w, bottom - top - 16, [
    ['Color', 0.16], ['Too wet', 0.24], ['Just right', 0.24], ['Too dry', 0.24], ['Drops', 0.12],
  ], rows, { head });
  for (let r = 0; r < rows; r++) {
    const y = top + 2 + head + r * rowH + rowH / 2;
    for (const [a, b] of [[0.18, 0.38], [0.42, 0.62], [0.66, 0.86]]) sh.line(MARGIN + w * a, y, MARGIN + w * b, y, { color: '#e3e6eb', width: 0.2, dash: [1.2, 1.2] });
  }
  sh.text(MARGIN, bottom - 8, 'Just right = like melted ice cream: the line is solid, smooth and dries in a minute without cracking.', { size: 2.8, color: INK });
});

// 3. Clean-up record (lesson 01.5, module practical)
pages('clean-up-record', 'Module 1 practical: paint, remove, clean', 'Record your arm patch from start to finish. Lesson 01.5.', (sh, top, bottom) => {
  const w = sh.w - 2 * MARGIN;
  let y = top + 4;
  const field = (lab, lines = 1) => {
    sh.text(MARGIN, y, lab, { size: 3, color: INK, bold: true });
    for (let i = 0; i < lines; i++) sh.line(MARGIN + 52, y + 0.6 + i * 8, MARGIN + w, y + 0.6 + i * 8, { color: LIGHT });
    y += 8 * lines + 3;
  };
  field('Date');
  field('Paint and colors used');
  field('Patch-tested? (date)');
  field('Water: little / some / lots');
  field('Time worn (minutes)');
  field('Removed with');
  field('Color left after wiping?');
  field('Skin afterwards', 2);
  y += 2;
  sh.text(MARGIN, y, 'Clean-up checklist', { size: 3.4, color: INK, bold: true }); y += 7;
  for (const t of ['Arm clean, no color left, patted dry', 'Brushes rinsed, soaped, rinsed clear, tips reshaped', 'Brushes drying flat on a towel',
    'Sponges washed, squeezed, drying in open air', 'Plate, cups and table wiped', 'Paint cakes air-dried, then lids closed', 'Hands washed']) {
    sh.rect(MARGIN, y - 3.4, 4, 4, { stroke: GREY, width: 0.3 });
    sh.text(MARGIN + 7, y, t, { size: 3, color: INK }); y += 8;
  }
  y += 2;
  field('What I will do differently next time', 2);
  void bottom;
});

console.log('labs/module-01 sheets written');
