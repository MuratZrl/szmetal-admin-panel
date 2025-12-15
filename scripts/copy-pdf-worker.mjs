// scripts/copy-pdf-worker.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const LOG = '[copy-pdf-worker]';
const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');

function canRead(p) {
  try {
    fs.accessSync(p, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function resolvePdfjsRoot() {
  const pkgJsonPath = require.resolve('pdfjs-dist/package.json');
  return path.dirname(pkgJsonPath);
}

function pickWorker(pdfjsRoot) {
  const candidates = [
    // pdfjs-dist v4+ (ESM)
    path.join(pdfjsRoot, 'build', 'pdf.worker.min.mjs'),
    path.join(pdfjsRoot, 'build', 'pdf.worker.mjs'),

    // older / alternate builds
    path.join(pdfjsRoot, 'build', 'pdf.worker.min.js'),
    path.join(pdfjsRoot, 'build', 'pdf.worker.js'),

    // legacy fallback
    path.join(pdfjsRoot, 'legacy', 'build', 'pdf.worker.min.mjs'),
    path.join(pdfjsRoot, 'legacy', 'build', 'pdf.worker.mjs'),
    path.join(pdfjsRoot, 'legacy', 'build', 'pdf.worker.min.js'),
    path.join(pdfjsRoot, 'legacy', 'build', 'pdf.worker.js'),
  ];

  for (const p of candidates) {
    if (canRead(p)) return p;
  }
  return null;
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function main() {
  const pdfjsRoot = resolvePdfjsRoot();
  const workerSrc = pickWorker(pdfjsRoot);

  if (!workerSrc) {
    const hint = [
      `${LOG} Worker bulunamadı.`,
      `${LOG} pdfjs-dist root: ${pdfjsRoot}`,
      `${LOG} Beklenen örnek: build/pdf.worker.min.mjs`,
    ].join('\n');
    console.error(hint);
    process.exitCode = 1;
    return;
  }

  const ext = path.extname(workerSrc); // .mjs | .js
  const outName = `pdf.worker.min${ext}`;
  const outPath = path.join(PUBLIC_DIR, outName);

  copyFile(workerSrc, outPath);

  // sourcemap opsiyonel
  const mapSrc = `${workerSrc}.map`;
  if (canRead(mapSrc)) {
    copyFile(mapSrc, `${outPath}.map`);
  }

  console.log(`${LOG} OK: ${path.relative(ROOT, workerSrc)} -> ${path.relative(ROOT, outPath)}`);
}

main();
