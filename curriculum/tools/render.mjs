// Render SVG files to PNG for visual checking.
// Usage: node curriculum/tools/render.mjs <out-dir> <file.svg> [more.svg ...]
// Uses sharp from the Academy repo's node_modules (no install needed here).
import { createRequire } from 'node:module';
import { basename, join } from 'node:path';
import { mkdirSync, readFileSync } from 'node:fs';

const require = createRequire('C:/Users/TalGiladi/OneDrive/repos/tals-academy/package.json');
const sharp = require('sharp');
const [out, ...files] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
for (const f of files) {
  const dest = join(out, basename(f).replace(/\.svg$/, '.png'));
  await sharp(readFileSync(f), { density: 96 }).flatten({ background: '#ffffff' }).png().toFile(dest);
  console.log(dest);
}
