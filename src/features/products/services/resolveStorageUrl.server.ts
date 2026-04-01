// src/features/products/utils/resolveStorageUrl.server.ts
'use server';
import 'server-only';

import { createSupabaseAdminClient } from '@/lib/supabase/supabaseAdmin';

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET || 'product-media';
const EXPIRES = 60 * 60; // 1 saat

function isHttp(u?: string | null) {
  return !!u && /^https?:\/\//i.test(u);
}

// Supabase public/sign URL → { bucket, path } çıkar
function extractPathFromSupabaseUrl(u: string): { bucket: string; path: string } | null {
  try {
    const url = new URL(u); 
    // /storage/v1/object/{public|sign}/{bucket}/{...path}
    const i = url.pathname.indexOf('/object/');
    if (i === -1) return null;
    const after = url.pathname.slice(i + '/object/'.length); // "{public|sign}/{bucket}/rest/of/path"
    const parts = after.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const bucket = decodeURIComponent(parts[1]!);
    const path = decodeURIComponent(parts.slice(2).join('/'));
    return { bucket, path };
  } catch {
    return null;
  }
}

/**
 * path veya mutlak Supabase URL → imzalı URL
 * Supabase dışı mutlak URL ise aynen döner.
 */
export async function resolveStorageUrl(input?: string | null): Promise<string | null> {
  if (!input) return null;

  // Supabase dışı mutlak URL'leri dokunmadan bırak
  if (isHttp(input)) {
    const parsed = extractPathFromSupabaseUrl(input);
    if (!parsed) return input; // ör. harici CDN/S3
    // Supabase public URL'yi de private'a çevirmek için path'e düşürüp imzalıyoruz
    if (parsed.bucket !== BUCKET) return null; // başka bucket ise kullanmıyoruz
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(parsed.path, EXPIRES);
    if (error) return null;
    return data?.signedUrl ?? null;
  }

  // Zaten path ise direkt imzala
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(input, EXPIRES);
  if (error) return null;
  return data?.signedUrl ?? null;
}
