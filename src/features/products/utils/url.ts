// src/features/products/utils/url.ts
import type { Database } from '@/types/supabase';
import type { Product } from '@/features/products/types';

type ProductsRow = Database['public']['Tables']['products']['Row'];

/** En küçük ortak giriş tipi */
type CanonicalInput =
  | { id: number; code?: string | null; profileCode?: string | null }
  | (Pick<ProductsRow, 'code'> & Partial<Pick<ProductsRow, 'code'>>)
  | (Pick<Product, 'code' >);

export function withVersion(url?: string | null, v?: string | null): string | null {
  if (!url) return url ?? null;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${encodeURIComponent(v ?? '')}`;
}

export function productCanonicalPath(p: CanonicalInput): `/products/${string}` {
  const profileCode =
    (('code' in p ? p.code : undefined) ??
      ('code' in p ? (p as { code?: string | null }).code : undefined) ??
      null);

  const code =
    ('code' in p ? (p as { code?: string | null }).code : null) ?? null;

  const key = (profileCode && profileCode.trim()) || (code && code.trim());
  if (key) return `/products/${encodeURIComponent(key)}`;
  return `/products/${String((p as { id: number }).id)}`;
}

export function productEditPath(p: CanonicalInput): `/products/${string}/edit` {
  return `${productCanonicalPath(p)}/edit` as `/products/${string}/edit`;
}
