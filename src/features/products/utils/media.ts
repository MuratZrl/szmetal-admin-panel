// src/features/products/utils/media.ts

export type MediaKind = 'pdf' | 'image' | 'unknown';

type DetectArgs = {
  url?: string | null;
  mime?: string | null;
  extHint?: string | null;
};

const IMAGE_EXTS = new Set([
  'png',
  'jpg',
  'jpeg',
  'webp',
  'avif',
  'gif',
  'bmp',
  'svg',
]);

function extractExtFromPathLike(value: string): string | null {
  const last = (value.split('/').pop() ?? value).toLowerCase();
  const m = last.match(/\.([a-z0-9]+)$/i);
  return m ? m[1] : null;
}

/**
 * URL (absolute ya da relative) içinden uzantıyı bulur.
 * - Pathname’den dener
 * - Olmazsa query içindeki muhtemel anahtarları (path, file, key, src, url, object, name) tarar
 * - Parse edilemezse kaba regex fallback kullanır
 */
function extFromMaybeRelativeUrl(u: string): string | null {
  if (!u) return null;

  try {
    // Relative URL’ler için local base ile parse
    const url = new URL(u, 'http://local');

    // 1) pathname
    const pExt = extractExtFromPathLike(url.pathname);
    if (pExt) return pExt;

    // 2) query param’larında olası anahtarlar
    const probableKeys = ['path', 'file', 'key', 'src', 'url', 'object', 'name'] as const;
    for (const k of probableKeys) {
      const v = url.searchParams.get(k);
      if (v) {
        const qExt = extractExtFromPathLike(v);
        if (qExt) return qExt;
      }
    }

    return null;
  } catch {
    // 3) Fallback: kaba regex ile son uzantıyı çek
    const m = u.toLowerCase().match(/\.([a-z0-9]+)(?:[#?].*)?$/i);
    return m ? m[1] : null;
  }
}

/**
 * Eski API ile uyumluluk: uzantı yoksa boş string döner.
 */
export function extFrom(url?: string | null): string {
  const ext = extFromMaybeRelativeUrl(url ?? '');
  return ext ?? '';
}

/**
 * URL, MIME ve optional ipucu uzantıya göre medyayı sınıflandırır.
 * - data URL’ler ve MIME tespitleri kesin konuşur
 * - Olmazsa, önce extHint sonra URL’den türetilen uzantı kullanılır
 */
export function detectMediaKind({ url, mime, extHint }: DetectArgs): MediaKind {
  const u = (url ?? '').trim();

  // 1) data URL
  if (u.startsWith('data:application/pdf')) return 'pdf';
  if (u.startsWith('data:image/')) return 'image';

  // 2) MIME kesin konuşur
  const m = (mime ?? '').toLowerCase().trim();
  if (m.includes('pdf')) return 'pdf';
  if (m.startsWith('image/')) return 'image';

  // 3) Uzantı: önce ipucu, sonra URL
  const rawExt = (extHint ?? '').trim().toLowerCase() || extFromMaybeRelativeUrl(u) || '';

  if (rawExt === 'pdf') return 'pdf';
  if (IMAGE_EXTS.has(rawExt)) return 'image';

  return 'unknown';
}
