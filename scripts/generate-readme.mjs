#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const templatePath = path.join(root, 'README.template.md');
const outputPath = path.join(root, 'README.md');

if (!existsSync(templatePath)) {
  throw new Error(
    `Template not found at ${templatePath} — is this script still at scripts/generate-readme.mjs?`,
  );
}

const version = JSON.parse(
  readFileSync(path.join(root, 'packages', 'core', 'package.json'), 'utf8'),
).version;

const rendered = readFileSync(templatePath, 'utf8').replaceAll('{{VERSION}}', version);

const leaked = rendered.match(/\{\{[^}\s]+\}\}/);
if (leaked) {
  throw new Error(`README.template.md contains an unresolved placeholder: ${leaked[0]}`);
}

if (process.argv.includes('--check')) {
  const current = existsSync(outputPath) ? readFileSync(outputPath, 'utf8') : null;
  if (current !== rendered) {
    console.error('README.md is out of date with README.template.md.');
    console.error("Run 'pnpm run readme' and commit the result.");
    process.exit(1);
  }
  process.exit(0);
}

writeFileSync(outputPath, rendered);
