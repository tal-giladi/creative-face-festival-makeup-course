// Writes _sidebar.md from the master lesson list (curriculum/outline.md is the human copy).
// Run: node curriculum/tools/sidebar.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib/figure.mjs';

export const LEVELS = [
  ['Level 1 — Creative Face Painting', [
    ['Tools, Materials and Safety', ['Your face painting kit', 'Skin-safe or not? Reading the label', 'Patch test and clean hands', 'Water, paint and your first swatches', 'Taking it off and cleaning up']],
    ['Brush Control', ['Holding the brush and the pressure stroke', 'Teardrops and petals', 'Swirls, curls and spirals', 'Dots, dot trails and dot flowers', 'Painting on skin: hand, arm, then face']],
    ['Color and Symmetry', ['Mixing many colors from a few', 'Your first sponge gradient', 'Light and dark: white highlights and black outlines', 'Symmetry and the face map', 'Color combinations that always work']],
    ['First Designs', ['Flowers and leaves', 'Stars, hearts and sparkles', 'The butterfly', 'Rainbows and clouds', 'Simple animals: cat and tiger', 'Hero masks and fantasy crowns']],
  ]],
  ['Level 2 — Festival & Trance Makeup', [
    ['Festival Faces', ['Bold color for festivals', 'Paint plus makeup: skin prep and setting', 'The festival face map: symmetrical layouts', 'Bold eye designs, safely']],
    ['Glitter, Gems and Neon', ['Cosmetic glitter, craft glitter and bio glitter', 'Applying glitter that stays put', 'Face gems and skin-safe adhesives', "Neon and UV: what's allowed where"]],
    ['Patterns and Complete Looks', ['Dotwork and mandalas', 'Geometric lines', 'Psychedelic waves and swirls', 'Planning and building a complete festival look']],
  ]],
  ['Level 3 — Fantasy & Artistic Makeup', [
    ['Advanced Color and Illusion', ['Three-color blends and split cakes', 'Making shapes look 3D', 'Scales, lace and stencils', 'Simple illusions']],
    ['Fantasy Characters and Masks', ['From idea to face design', 'Decorative masks', 'Fantasy characters', 'Designing your own artistic look']],
  ]],
  ['Optional Level 4 — Body Art', [
    ['Body Art (Optional)', ['From face to body', 'Hands and arms', 'Shoulders and upper body']],
  ]],
];

const pad = (n) => String(n).padStart(2, '0');
const out = ['- [Home](/)', '- [Glossary](glossary.md)', '- [Templates](templates/README.md)',
  '- [Materials and substitutes](references/materials.md)', '- [Safety guide](references/safety.md)',
  '- [Fix-it guide](references/troubleshooting.md)', '- [Sources](references/sources.md)', ''];
let m = 0, n = 0;
for (const [level, mods] of LEVELS) {
  out.push(`- ${level}`);
  for (const [title, lessons] of mods) {
    m += 1;
    out.push(`- **Module ${m} — ${title}**`);
    lessons.forEach((t, i) => { n += 1; out.push(`  - [${pad(n)} · ${t}](lessons/module-${pad(m)}/lesson-${pad(i + 1)}.md)`); });
    out.push(`  - [Module ${m} quiz](assessments/module-${pad(m)}-quiz.md)`);
  }
  out.push('');
}
writeFileSync(join(ROOT, '_sidebar.md'), out.join('\n').trimEnd() + '\n');
console.log(`_sidebar.md: ${m} modules, ${n} lessons`);
