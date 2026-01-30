'use client';
// src/features/products/services/storage.client.ts

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/** Bucket adı: .env.local → NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET=product-media */
const BUCKET: string = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET ?? 'product-media';

// Tekil browser client
let __sb__: SupabaseClient<Database> | null = null;
function getSB(): SupabaseClient<Database> {
  if (!__sb__) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) throw new Error('[supabase] URL/ANON env eksik');
    __sb__ = createClient<Database>(url, anon, {
      auth: {
        detectSessionInUrl: false,
        persistSession: true,   // ← JWT taşı, RLS görsün
        autoRefreshToken: true,
      },
    });
  }
  return __sb__;
}

type ImageMime = 'image/png' | 'image/webp' | 'image/jpeg';
export type UploadKind = 'pdf' | 'image';

export type UploadResult = {
  path: string;        // bucket içi yol (örn: <uid>/1234-uuid.png)
  kind: UploadKind;
  bucket: string;
  publicUrl?: string | null; // private bucket’ta kullanılmaz
};

export type UploadRef = { bucket: string; path: string };

function boom(msg?: string): never {
  throw new Error(msg || 'Bilinmeyen upload hatası');
}

function isImage(m: string): m is ImageMime {
  return m === 'image/png' || m === 'image/webp' || m === 'image/jpeg';
}

/* -------------------------------------------------------------------------- */
/* İmzalı upload endpoint’in varsa (opsiyonel)                                */
/* -------------------------------------------------------------------------- */
// async function getSignedUpload(filename: string): Promise<{ path: string; token: string }> {
//   const res = await fetch('/api/storage/products/signed-upload', {
//     method: 'POST',
//     headers: { 'content-type': 'application/json' },
//     cache: 'no-store',
//     body: JSON.stringify({ filename }),
//   });
//   if (res.status === 401) boom('Oturum Bulunamadı, Giriş Yapın');
//   if (!res.ok) {
//     let msg = `Upload URL alınamadı (${res.status})`;
//     try {
//       const j = (await res.json()) as { error?: string };
//       if (j?.error) msg = j.error;
//     } catch {}
//     boom(msg);
//   }
//   return (await res.json()) as { path: string; token: string };
// }

/* -------------------------------------------------------------------------- */
/* Önerilen: JWT ile doğrudan upload (RLS: name like '<uid>/%')               */
/* -------------------------------------------------------------------------- */
export async function directUpload(file: File): Promise<UploadResult> {
  const sb = getSB();

  const { data: { user }, error: uerr } = await sb.auth.getUser();
  if (uerr || !user) boom('Oturum bulunamadı.');

  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'bin';
  const key = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error } = await sb.storage.from(BUCKET).upload(key, file, {
    cacheControl: '3600',
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (error) boom(error.message);

  const kind: UploadKind = file.type === 'application/pdf' ? 'pdf' : 'image';
  return { path: key, kind, bucket: BUCKET, publicUrl: null };
}

/* -------------------------------------------------------------------------- */
/* Private bucket okuma: imzalı URL üretme                                    */
/* -------------------------------------------------------------------------- */
export async function getSignedUrl(path: string, expires = 300): Promise<string> {
  const sb = getSB();
  const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(path, expires);
  if (error) boom(error.message);
  return data.signedUrl;
}

/* -------------------------------------------------------------------------- */
/* Dışa açık helper’lar                                                       */
/* -------------------------------------------------------------------------- */
export async function uploadProductImageAndGetUrl(_code: string, file: File): Promise<UploadResult> {
  if (!isImage(file.type)) boom('Yalnızca PNG, WEBP, JPEG yükleyin.');
  // İstersen signedUpload kullan; öneri: directUpload
  return await directUpload(file);
}

export async function uploadProductPdfAndGetUrl(_code: string, file: File): Promise<UploadResult> {
  if (file.type !== 'application/pdf') boom('Sadece PDF yükleyin.');
  return await directUpload(file);
}

export async function removeUploaded(ref: UploadRef): Promise<void> {
  const sb = getSB();
  const { error } = await sb.storage.from(ref.bucket).remove([ref.path]);
  if (error) boom(error.message);
}
