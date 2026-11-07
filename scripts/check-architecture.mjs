import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const sourceExtensions = new Set(['.ts', '.tsx', '.scss']);
const architectureRoots = ['apps', 'packages', 'scripts'];
const prohibitedName = /^(part[-_]?\d+|common|helpers|utils)$/i;
const runtimeConfigurationFiles = [
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'apps/main/vite.config.ts',
  'apps/factory/vite.config.ts',
  'apps/campinas/vite.config.ts',
  'apps/itu/vite.config.ts',
  'apps/api/tsconfig.json',
  'apps/api/src/app.ts',
];
const legacyRuntimeRoots = ['server', 'src/frontend', 'src/backend', 'factory/src', 'franchise/src'];
const transitionLegacyReferences = new Set();

function normalizePath(file) {
  return file.replaceAll('\\', '/');
}

function listFiles(rootDir, directory) {
  const fullPath = join(rootDir, directory);
  if (!existsSync(fullPath)) return [];

  return readdirSync(fullPath).flatMap((entry) => {
    const relativePath = join(directory, entry);
    const entryPath = join(rootDir, relativePath);

    return statSync(entryPath).isDirectory() ? listFiles(rootDir, relativePath) : [normalizePath(relativePath)];
  });
}

function usesProhibitedName(file) {
  return normalizePath(file)
    .split('/')
    .some((segment) => prohibitedName.test(segment.replace(extname(segment), '')));
}

function isSourceFile(file) {
  return sourceExtensions.has(extname(file));
}

function referencesLegacyRuntimeRoot(line, legacyRoot) {
  const escapedRoot = legacyRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rootPattern = new RegExp(`(?:^|[\\s'"\\[(]|(?:\\.\\.\\/)+)${escapedRoot}(?=$|[/'"\\],)])`);
  const commandPattern = new RegExp(`pnpm ${escapedRoot}(?=\\\\")`);

  return rootPattern.test(line) || commandPattern.test(line);
}

export function checkLegacyRuntimeReferences({ rootDir = process.cwd(), files }) {
  const errors = [];

  for (const file of [...files].sort()) {
    const fullPath = join(rootDir, file);
    if (!existsSync(fullPath)) continue;

    const lines = readFileSync(fullPath, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const legacyRoot of legacyRuntimeRoots) {
        if (!referencesLegacyRuntimeRoot(line, legacyRoot)) continue;
        const prefix = `${normalizePath(file)}: references legacy runtime root`;
        errors.push(`${prefix} "${legacyRoot}" on line ${index + 1}`);
      }
    });
  }

  return errors;
}

function getStagedFiles(rootDir) {
  const output = execFileSync('git', ['diff', '--cached', '--name-only'], {
    cwd: rootDir,
    encoding: 'utf8',
  });

  return output.split(/\r?\n/).filter(Boolean);
}

function getRuntimeFiles(files) {
  if (!files) return runtimeConfigurationFiles;
  return files.map(normalizePath).filter((file) => runtimeConfigurationFiles.includes(file));
}

function isArchitectureFile(file) {
  const normalizedFile = normalizePath(file);
  return architectureRoots.some((root) => normalizedFile === root || normalizedFile.startsWith(`${root}/`));
}

export function checkArchitecture({ rootDir = process.cwd(), files } = {}) {
  const candidateFiles = files
    ? files.map(normalizePath).filter(isArchitectureFile)
    : architectureRoots.flatMap((root) => listFiles(rootDir, root));
  const sourceFiles = candidateFiles.map(normalizePath).filter(isSourceFile);

  if (!files) sourceFiles.sort();
  const errors = [];

  for (const file of sourceFiles) {
    const fullPath = join(rootDir, file);
    if (!existsSync(fullPath)) continue;

    const lines = readFileSync(fullPath, 'utf8').split(/\r?\n/);

    if (lines.length > 200) errors.push(`${file}: exceeds 200 lines`);
    if (usesProhibitedName(file)) errors.push(`${file}: uses a prohibited name`);

    lines.forEach((line, index) => {
      if (line.length > 120) {
        errors.push(`${file}: exceeds 120 characters on line ${index + 1}`);
      }
    });
  }

  const legacyErrors = checkLegacyRuntimeReferences({ rootDir, files: getRuntimeFiles(files) });
  errors.push(...legacyErrors.filter((error) => !transitionLegacyReferences.has(error)));

  return { errors, files: sourceFiles };
}

function runCli() {
  const rootDir = process.cwd();
  const files = process.argv.includes('--staged') ? getStagedFiles(rootDir) : undefined;
  const { errors } = checkArchitecture({ rootDir, files });

  if (errors.length === 0) return;

  console.error('Architecture check failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
}

if (process.argv[1] && normalizePath(process.argv[1]) === normalizePath(import.meta.filename)) {
  runCli();
}
