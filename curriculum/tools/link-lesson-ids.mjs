// Turn plain "lesson NN.M" mentions in lessons/ and projects/ into links (skips front-matter,
// image lines, existing links, and the lesson's own id). Run: node curriculum/tools/link-lesson-ids.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib/figure.mjs';

let n = 0;
const targets = [];
for (const d of readdirSync(join(ROOT, 'lessons'))) for (const f of readdirSync(join(ROOT, 'lessons', d))) if (f.endsWith('.md')) targets.push([join(ROOT, 'lessons', d, f), '../']);
for (const f of readdirSync(join(ROOT, 'projects'))) if (f.endsWith('.md')) targets.push([join(ROOT, 'projects', f), '../lessons/']);
for (const [file, base] of targets) {
  const own = (readFileSync(file, 'utf8').match(/^id: "(\d{2}\.\d)"/m) || [])[1];
  let fm = 0;
  const out = readFileSync(file, 'utf8').split('\n').map((line) => {
    if (line.trim() === '---' && fm < 2) { fm++; return line; }
    if (fm === 1 || line.includes('![') || line.startsWith('#')) return line;
    return line.replace(/(?<![[\w/])lesson (\d{2})\.(\d)\b(?![^[]*\]\()/g, (m, a, b) => {
      if (`${a}.${b}` === own) return m;
      const rel = base === '../' ? `../module-${a}/lesson-0${b}.md` : `../lessons/module-${a}/lesson-0${b}.md`;
      if (!existsSync(join(ROOT, 'lessons', `module-${a}`, `lesson-0${b}.md`))) return m;
      n++; return `[lesson ${a}.${b}](${rel})`;
    });
  });
  writeFileSync(file, out.join('\n'));
}
console.log(`${n} links added`);
