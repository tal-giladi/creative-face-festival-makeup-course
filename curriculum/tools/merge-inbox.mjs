// Rebuilds glossary.md and references/troubleshooting.md from curriculum/inbox/*.md.
// glossary-NN.md:        - **term** — definition (lesson NN.M)
// troubleshooting-NN.md: - symptom | cause | fix | lesson id(s)
// Run: node curriculum/tools/merge-inbox.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib/figure.mjs';

const INBOX = join(ROOT, 'curriculum', 'inbox');
const files = (prefix) => readdirSync(INBOX).filter((f) => f.startsWith(prefix) && f.endsWith('.md')).sort();
const lessonPath = (id) => {
  const [m, l] = id.split('.');
  return `lessons/module-${m.padStart(2, '0')}/lesson-${l.padStart(2, '0')}.md`;
};
const idKey = (id) => { const [m, l] = (id || '99.99').split('.').map(Number); return m * 100 + l; };
const MODULES = ['', 'Tools, Materials and Safety', 'Brush Control', 'Color and Symmetry', 'First Designs', 'Festival Faces',
  'Glitter, Gems and Neon', 'Patterns and Complete Looks', 'Advanced Color and Illusion', 'Fantasy Characters and Masks',
  'Body Art (Optional)'];

// ---- glossary ----
const terms = new Map();
for (const f of files('glossary-')) {
  for (const line of readFileSync(join(INBOX, f), 'utf8').split('\n')) {
    const m = line.match(/^- \*\*(.+?)\*\* — (.+?)\s*\((\d{2}\.\d+)\)\s*$/s);
    if (!m) continue;
    const [, term, def, id] = m;
    const key = term.toLowerCase();
    const old = terms.get(key);
    if (!old || idKey(id) < idKey(old.id)) terms.set(key, { term, def: def.trim(), id });
  }
}
const gl = [...terms.values()].sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));
writeFileSync(join(ROOT, 'glossary.md'), `# Glossary

Words used in this course, in plain language. The lesson in brackets is where the word first comes up.

${gl.map((t) => `- **${t.term}** — ${t.def} (${t.id})`).join('\n')}
`);

// ---- troubleshooting ----
const rows = [];
for (const f of files('troubleshooting-')) {
  for (const line of readFileSync(join(INBOX, f), 'utf8').split('\n')) {
    if (!line.startsWith('- ')) continue;
    const parts = line.slice(2).split('|').map((s) => s.trim());
    if (parts.length < 4) continue;
    const ids = parts[3].match(/\d{2}\.\d+/g) || [];
    rows.push({ symptom: parts[0], cause: parts[1], fix: parts[2], ids });
  }
}
// same symptom twice: keep the first wording, collect every lesson id
const seen = new Map();
for (const r of rows) {
  const k = r.symptom.toLowerCase();
  if (seen.has(k)) { const o = seen.get(k); for (const id of r.ids) if (!o.ids.includes(id)) o.ids.push(id); continue; }
  seen.set(k, r);
}
const byModule = new Map();
for (const r of seen.values()) {
  const m = Number((r.ids[0] || '99').split('.')[0]);
  if (!byModule.has(m)) byModule.set(m, []);
  byModule.get(m).push(r);
}
const link = (id) => (existsSync(join(ROOT, lessonPath(id))) ? `[${id}](../${lessonPath(id)})` : id);
const sections = [...byModule.keys()].sort((a, b) => a - b).map((m) => {
  const list = byModule.get(m).sort((a, b) => idKey(a.ids[0]) - idKey(b.ids[0]));
  return `## Module ${m}: ${MODULES[m] ?? ''}

| What you see | Likely cause | Try this | Lesson |
|---|---|---|---|
${list.map((r) => `| ${r.symptom} | ${r.cause} | ${r.fix} | ${r.ids.map(link).join(', ')} |`).join('\n')}`;
});
writeFileSync(join(ROOT, 'references', 'troubleshooting.md'), `# Fix-it guide

Find what you see in the left column, then try the fix. The lesson link explains it fully. If skin
stings, itches, swells or turns red, stop and take the paint off first: see the
[safety guide](safety.md). Problems are grouped by the module where the fix is taught.

${sections.join('\n\n')}
`);
console.log(`glossary: ${gl.length} terms; troubleshooting: ${seen.size} entries`);
