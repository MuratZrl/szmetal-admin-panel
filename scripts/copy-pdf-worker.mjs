// scripts/copy-pdf-worker.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

function tryResolve(id) {
  try { return require.resolve(id); } catch { return null; }
}

// Legacy JS worker'ı ÖNCELE (daha stabil)
const src =
  tryResolve('pdfjs-dist/legacy/build/pdf.worker.min.js') ||
  tryResolve('pdfjs-dist/build/pdf.worker.min.js') ||
  tryResolve('pdfjs-dist/build/pdf.worker.js');

if (!src) {
  console.error('[copy-pdf-worker] Worker bulunamadı. pdfjs-dist sürümünü kontrol et.');
  process.exit(1);
}

// Hep aynı isim: public/pdf.worker.min.js
const dest = path.join(process.cwd(), 'public', 'pdf.worker.min.js');

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
console.log('[copy-pdf-worker] Copied', src, '→', dest);
