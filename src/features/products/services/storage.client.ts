// src/features/products/services/storage.client.ts
'use client';

import { supabase } from '@/lib/supabase/supabaseClient';

export const STORAGE_BUCKET = 'product-media' as const;

type ImageMime = 'image/png' | 'image/webp' | 'image/jpeg';

function normalizeExt(mime: ImageMime): 'png' | 'webp' | 'jpg' {
  return mime === 'image/jpeg' ? 'jpg' : (mime.split('/')[1] as 'png' | 'webp');
}

/** Görsel upload: PNG, WEBP, JPEG */
export async function uploadProductImageAndGetUrl(code: string, file: File): Promise<string> {
  const allowed: ReadonlySet<string> = new Set(['image/png', 'image/webp', 'image/jpeg']);
  if (!allowed.has(file.type)) throw new Error('Yalnızca PNG, WEBP, JPEG yükleyin.');

  const ext = normalizeExt(file.type as ImageMime);
  const path = `images/${code}/main.${ext}`;

  const { error } = await supabase
    .storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** PDF upload */
export async function uploadProductPdfAndGetUrl(codeOrFallback: string, file: File): Promise<string> {
  if (file.type !== 'application/pdf') throw new Error('Sadece PDF yükleyin.');

  const base = codeOrFallback || `product-${Date.now()}`;
  const fileName = `${Date.now()}-${crypto.randomUUID()}.pdf`;
  const path = `pdf/${base}/${fileName}`;

  const { error } = await supabase
    .storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      contentType: 'application/pdf',
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
