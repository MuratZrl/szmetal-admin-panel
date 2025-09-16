// src/features/products/utils/url.ts
export function withVersion(url?: string | null, v?: string | null) {
  if (!url) return url ?? null;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${encodeURIComponent(v ?? '')}`;
}