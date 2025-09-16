// src/features/products/utils/media.ts
export type MediaKind = 'pdf' | 'image' | 'unknown';

export function extFrom(url?: string | null): string {
  if (!url) return '';
  const clean = url.split('?')[0];
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : '';
}

export function detectMediaKind(opts: {
  url?: string | null;
  mime?: string | null;
  extHint?: string | null;
}): MediaKind {
  const url = (opts.url ?? '').trim();
  const mime = (opts.mime ?? '').toLowerCase();
  const hint = (opts.extHint ?? '').toLowerCase();
  const ext = extFrom(url);

  // 1) data URL
  if (url.startsWith('data:application/pdf')) return 'pdf';
  if (url.startsWith('data:image/')) return 'image';

  // 2) MIME
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('image/')) return 'image';

  // 3) URL uzantısı
  if (ext === 'pdf') return 'pdf';
  if (/^(png|jpe?g|webp|avif|gif)$/.test(ext)) return 'image';

  // 4) DB hint
  if (hint === 'pdf') return 'pdf';
  if (/^(png|jpe?g|webp|avif|gif)$/.test(hint)) return 'image';

  return 'unknown';
}
