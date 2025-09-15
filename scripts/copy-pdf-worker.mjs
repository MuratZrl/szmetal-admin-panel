// scripts/copy-pdf-worker.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

function tryResolve(id) {
  try { return require.resolve(id); } catch { return null; }
}

// 1) Top-level arama (pdfjs-dist 4 ESM ve eski seçenekler)
let src =
  tryResolve('pdfjs-dist/build/pdf.worker.min.mjs') ||
  tryResolve('pdfjs-dist/legacy/build/pdf.worker.min.js') ||
  tryResolve('pdfjs-dist/build/pdf.worker.min.js') ||
  tryResolve('pdfjs-dist/build/pdf.worker.js');

// 2) react-pdf altına düşmüş olabilir, oradan ara
if (!src) {
  const rpPkg = tryResolve('react-pdf/package.json');
  if (rpPkg) {
    const rpDir = path.dirname(rpPkg);
    const candidates = [
      path.join(rpDir, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
      path.join(rpDir, 'node_modules/pdfjs-dist/legacy/build/pdf.worker.min.js'),
      path.join(rpDir, 'node_modules/pdfjs-dist/build/pdf.worker.min.js'),
      path.join(rpDir, 'node_modules/pdfjs-dist/build/pdf.worker.js'),
    ];
    src = candidates.find(p => fs.existsSync(p)) ?? null;
  }
}

if (!src) {
  console.error('[copy-pdf-worker] Worker bulunamadı. pdfjs-dist sürümünü kontrol et.');
  process.exit(1);
}

const isMjs = src.endsWith('.mjs');
const dest = path.join(process.cwd(), 'public', isMjs ? 'pdf.worker.mjs' : 'pdf.worker.js');

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
console.log('[copy-pdf-worker] Copied', src, '→', dest);
