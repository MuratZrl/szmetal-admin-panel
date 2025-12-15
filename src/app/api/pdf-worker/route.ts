// src/app/pdf.worker.min.mjs/route.ts
import fs from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';

async function readFirstExisting(paths: string[]): Promise<ArrayBuffer> {
  for (const p of paths) {
    try {
      const buf = await fs.readFile(p); // Node Buffer
      // Buffer -> ArrayBuffer (tam doğru slice)
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    } catch {
      // devam
    }
  }
  throw new Error('pdf worker not found in node_modules');
}

export async function GET(): Promise<Response> {
  const cwd = process.cwd();

  const candidates = [
    path.join(cwd, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs'),
    path.join(cwd, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.mjs'),
    path.join(cwd, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.js'),
    path.join(cwd, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.js'),
  ];

  const body = await readFirstExisting(candidates);

  return new Response(body, {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
