import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['apps', 'packages', 'scripts', 'docs'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.json', '.md', '.yml', '.yaml']);
const violations = [];
const decoder = new TextDecoder('utf-8', { fatal: true });

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'dist' || entry.name === 'node_modules') continue;
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(filePath);
      continue;
    }
    if (!EXTENSIONS.has(path.extname(entry.name))) continue;
    const bytes = fs.readFileSync(filePath);
    try {
      decoder.decode(bytes);
    } catch {
      violations.push(`${filePath}: invalid UTF-8`);
      continue;
    }
    if (bytes.includes(13)) violations.push(`${filePath}: CRLF is not allowed`);
    if (!bytes.length || bytes.at(-1) !== 10) violations.push(`${filePath}: missing final LF`);
  }
}

for (const root of ROOTS) {
  if (fs.existsSync(root)) visit(root);
}

if (violations.length) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Encoding check passed: UTF-8, LF and final newline.');
}
