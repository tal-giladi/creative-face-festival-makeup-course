// Check every *.quiz.yaml under the given folders against guidelines §5.
// Usage: node curriculum/tools/check-quiz.mjs lessons/module-04 assessments
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire('C:/Users/TalGiladi/OneDrive/repos/tals-academy/package.json');
const yaml = require('js-yaml');
const files = [];
const walk = (p) => { for (const f of readdirSync(p)) { const q = join(p, f); if (statSync(q).isDirectory()) walk(q); else if (f.endsWith('.quiz.yaml')) files.push(q); } };
for (const a of process.argv.slice(2)) statSync(a).isDirectory() ? walk(a) : files.push(a);

let problems = 0;
const bad = (f, m) => { problems++; console.log(`${f}: ${m}`); };
for (const f of files) {
  let qs;
  try { qs = yaml.load(readFileSync(f, 'utf8')); } catch (e) { bad(f, `YAML error ${e.message}`); continue; }
  if (!Array.isArray(qs)) { bad(f, 'not a list'); continue; }
  const module = f.includes('assessments');
  const [lo, hi] = module ? [8, 10] : [3, 5];
  if (qs.length < lo || qs.length > hi) bad(f, `${qs.length} questions (want ${lo}-${hi})`);
  const ids = new Set(), pos = [0, 0, 0, 0];
  let longest = 0;
  for (const q of qs) {
    const t = `${q.id}`;
    if (!q.id || ids.has(q.id)) bad(f, `${t}: missing or duplicate id`); ids.add(q.id);
    if (!q.question) bad(f, `${t}: no question`);
    if (!Array.isArray(q.options) || q.options.length !== 4) { bad(f, `${t}: needs exactly 4 options`); continue; }
    if (q.options.some((o) => typeof o !== 'string') || typeof q.question !== 'string' || typeof q.explanation !== 'string') bad(f, `${t}: question, options and explanation must be plain strings (quote or use >- for text with a colon)`);
    if (new Set(q.options.map(String)).size !== 4) bad(f, `${t}: options not distinct`);
    if (![0, 1, 2, 3].includes(q.correct)) { bad(f, `${t}: correct must be 0-3`); continue; }
    if (!q.explanation) bad(f, `${t}: no explanation`);
    if ('source' in q) bad(f, `${t}: source field not allowed`);
    if (q.options.some((o) => /\b(all|none) of the above\b/i.test(String(o)))) bad(f, `${t}: all/none of the above`);
    pos[q.correct]++;
    const lens = q.options.map((o) => String(o).length), c = lens[q.correct], maxOther = Math.max(...lens.filter((_, i) => i !== q.correct));
    if (c > maxOther * 1.25 && c - maxOther > 15) bad(f, `${t}: correct option noticeably longer (${c} vs ${maxOther})`);
    if (c === Math.max(...lens) && c > maxOther) longest++;
  }
  if (qs.length >= 4 && Math.max(...pos) > Math.ceil(qs.length / 2)) bad(f, `correct positions bunched ${JSON.stringify(pos)}`);
  if (qs.length >= 4 && longest > qs.length / 2) bad(f, `correct option is the longest in ${longest}/${qs.length} questions`);
}
console.log(`${files.length} quiz files, ${problems} problems`);
process.exitCode = problems ? 1 : 0;
