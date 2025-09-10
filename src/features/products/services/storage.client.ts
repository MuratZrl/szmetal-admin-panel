// src/features/products/services/storage.client.ts
'use client';

import { supabase } from '@/lib/supabase/supabaseClient';

export const STORAGE_BUCKET = 'product-media' as const;

type ImageMime = 'image/png' | 'image/webp' | 'image/jpeg';
export type UploadKind = 'pdf' | 'image';

export type UploadResult = {
  publicUrl: string;
  path: string;                   // bucket içi dosya yolu
  kind: UploadKind;
  bucket: typeof STORAGE_BUCKET;  // → literal type
};

export type UploadRef = Pick<UploadResult, 'bucket' | 'path'>;

function throwMsg(msg?: string): never {
  throw new Error(msg || 'Bilinmeyen upload hatası');
}

function normalizeExt(mime: ImageMime): 'png' | 'webp' | 'jpg' {
  return mime === 'image/jpeg' ? 'jpg' : (mime.split('/')[1] as 'png' | 'webp');
}

/** Görsel upload: PNG, WEBP, JPEG */
export async function uploadProductImageAndGetUrl(code: string, file: File): Promise<UploadResult> {
  const allowed: ReadonlySet<string> = new Set(['image/png', 'image/webp', 'image/jpeg']);
  if (!allowed.has(file.type)) throwMsg('Yalnızca PNG, WEBP, JPEG yükleyin.');

  const ext = normalizeExt(file.type as ImageMime);
  // Not: main.ext ile overwrite; benzersiz isterse random ekle.
  const path = `images/${code}/main.${ext}`;

  const { error } = await supabase
    .storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throwMsg(error.message);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl, path, kind: 'image', bucket: STORAGE_BUCKET };
}

/** PDF upload */
export async function uploadProductPdfAndGetUrl(codeOrFallback: string, file: File): Promise<UploadResult> {
  if (file.type !== 'application/pdf') throwMsg('Sadece PDF yükleyin.');

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

  if (error) throwMsg(error.message);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl, path, kind: 'pdf', bucket: STORAGE_BUCKET };
}

/** Storage'tan silme (tek dosya) */
export async function removeUploaded(ref: UploadRef): Promise<void> {
  const { error } = await supabase.storage.from(ref.bucket).remove([ref.path]);
  if (error) throwMsg(error.message);
}
