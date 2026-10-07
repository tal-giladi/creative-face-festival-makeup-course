// Check every relative link and image in learner markdown resolves, and flag disallowed HTML.
// Usage: node curriculum/tools/check-links.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { ROOT } from './lib/figure.mjs';

const files = [];
const walk = (p) => { for (const f of readdirSync(p)) { const q = join(p, f); if (statSync(q).isDirectory()) { if (!/^(\.git|curriculum|node_modules)$/.test(f)) walk(q); } else if (f.endsWith('.md') && !/^(BUILD_PROGRESS|TODO_FOR_TAL|PROGRESS)\.md$/.test(f)) files.push(q); } };
walk(ROOT);
let bad = 0;
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|#)/.test(url) || url === '/') continue;
    const p = resolve(dirname(f), url.split(/[?#]/)[0]);
    if (!existsSync(p)) { bad++; console.log(`${f.slice(ROOT.length + 1)}: missing ${url}`); }
  }
  for (const m of s.matchAll(/<\/?([a-zA-Z]+)[^>]*>/g)) {
    if (!/^(details|summary|kbd|sub|sup|br)$/i.test(m[1])) { bad++; console.log(`${f.slice(ROOT.length + 1)}: disallowed HTML <${m[1]}>`); }
  }
  if (/github\.io|github\.com\/tal-giladi\/creative-face/.test(s)) { bad++; console.log(`${f}: absolute link to own repo`); }
}
console.log(`${files.length} markdown files, ${bad} problems`);
