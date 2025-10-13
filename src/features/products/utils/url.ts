// src/features/products/utils/url.ts
import type { Product } from '@/features/products/types';
import type { Database } from '@/types/supabase';

type ProductsRow = Database['public']['Tables']['products']['Row'];

/** Mevcut URL’ye sürüm paramı ekler; cache-busting için. */
export function withVersion(url?: string | null, v?: string | null): string | null {
  if (!url) return url ?? null;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${encodeURIComponent(v ?? '')}`;
}

/**
 * Ürün için kanonik detay linki:
 *  - profileCode varsa: /products/{profileCode}
 *  - yoksa code varsa:  /products/{code}
 *  - en son çare:       /products/{id}
 */
export function productCanonicalPath(
  p:
    | Pick<Product, 'id' | 'profileCode' | 'code'>
    | (Pick<ProductsRow, 'id' | 'code'> & Partial<Pick<ProductsRow, 'profile_code'>>)
): `/products/${string}` {
  const profileCode =
    (('profileCode' in p ? p.profileCode : undefined) ??
      ('profile_code' in p ? p.profile_code : undefined) ??
      null);

  const code = ('code' in p ? (p as { code?: string | null }).code : null) ?? null;

  const key = (profileCode && profileCode.trim()) || (code && code.trim());
  if (key) return `/products/${encodeURIComponent(key)}`;
  return `/products/${String(p.id)}`;
}

export function productEditPath(
  p:
    | Pick<Product, 'id' | 'profileCode' | 'code'>
    | (Pick<ProductsRow, 'id' | 'code'> & Partial<Pick<ProductsRow, 'profile_code'>>)
): `/products/${string}/edit` {
  return `${productCanonicalPath(p)}/edit` as `/products/${string}/edit`;
}