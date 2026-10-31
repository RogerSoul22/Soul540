import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['apps', 'packages'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.scss']);
const MAX_LINES = 170;
const violations = [];

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'dist' || entry.name === 'node_modules') continue;
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(filePath);
      continue;
    }
    if (!EXTENSIONS.has(path.extname(entry.name))) continue;
    const lineCount = fs.readFileSync(filePath, 'utf8').split('\n').length;
    if (lineCount > MAX_LINES) violations.push(`${filePath}: ${lineCount} lines (max ${MAX_LINES})`);
  }
}

for (const root of ROOTS) visit(root);

if (violations.length) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`File-size check passed: max ${MAX_LINES} lines.`);
}
