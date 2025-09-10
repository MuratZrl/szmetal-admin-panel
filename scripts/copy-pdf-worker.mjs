// scripts/copy-pdf-worker.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

let pkgPath;
try {
  pkgPath = require.resolve('pdfjs-dist/package.json', { paths: [process.cwd()] });
} catch {
  try {
    const reactPdfPkg = require.resolve('react-pdf/package.json', { paths: [process.cwd()] });
    const reactPdfBase = path.dirname(reactPdfPkg);
    pkgPath = require.resolve('pdfjs-dist/package.json', { paths: [reactPdfBase] });
  } catch {
    console.warn('[copy-pdf-worker] pdfjs-dist not found. Skipping.');
    process.exit(0);
  }
}

const base = path.dirname(pkgPath);

// Önce modern .mjs, sonra diğerleri
const candidates = [
  'build/pdf.worker.min.mjs',
  'build/pdf.worker.mjs',
  'build/pdf.worker.min.js',
  'build/pdf.worker.js',
  'legacy/build/pdf.worker.min.js',
  'legacy/build/pdf.worker.js',
].map(p => path.join(base, p));

let src = candidates.find(p => fs.existsSync(p));

if (!src) {
  console.error('[copy-pdf-worker] Could not find pdf.worker under:', base);
  process.exit(1);
}

const destDir = path.join(process.cwd(), 'public');
fs.mkdirSync(destDir, { recursive: true });

// UZANTISINI KORU
const destName = path.basename(src); // ör: pdf.worker.min.mjs
const dest = path.join(destDir, destName);
fs.copyFileSync(src, dest);

// İsteğe bağlı: uyumluluk için alias yarat (mjs ise)
if (destName.endsWith('.mjs')) {
  const alias = path.join(destDir, 'pdf.worker.mjs');
  if (!fs.existsSync(alias)) fs.copyFileSync(src, alias);
}

console.log(`[copy-pdf-worker] Copied\n  ${src}\n→ ${dest}`);
