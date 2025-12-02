// src/features/products/hooks/useUploadProduct.client.ts
'use client';

import * as React from 'react';
import {
  type UseFormReturn,
  type FieldValues,
  type FieldPath,
  type PathValue,
} from 'react-hook-form';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';

import { removeUploaded, type UploadRef } from '@/features/products/services/storage.client';

/* ----------------------------------------------------------------------------
 * Tipler
 * --------------------------------------------------------------------------*/

type FileKind = 'pdf' | 'image';

type WithFileFields = {
  code: string;         // formunda varsa
  image: string;        // DB’ye yazacağın storage path
  file: File | null;    // seçilen dosya

  // metadata alanları
  fileBucket?: string | null;
  filePath?: string | null;
  fileName?: string | null;
  fileMime?: string | null;
  fileSize?: number | null;
};

type SignedUploadRes = {
  bucket: string;
  path: string;
  token: string;
};

/* ----------------------------------------------------------------------------
 * Sabitler
 * --------------------------------------------------------------------------*/

const ACCEPTED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/webp',
  'image/jpeg',
]);

const MAX_BYTES: Record<FileKind, number> = {
  pdf: 10 * 1024 * 1024,  // 10MB
  image: 8 * 1024 * 1024, // 8MB
};

/* ----------------------------------------------------------------------------
 * Supabase browser client (anon)
 * --------------------------------------------------------------------------*/

let __sb__: SupabaseClient<Database> | null = null;

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY eksik.');
  }
  return { url, anon };
}

function getSB(): SupabaseClient<Database> {
  if (!__sb__) {
    const { url, anon } = getEnv();
    __sb__ = createClient<Database>(url, anon, {
      auth: {
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return __sb__;
}

/* ----------------------------------------------------------------------------
 * Server: signed upload URL iste
 * --------------------------------------------------------------------------*/

async function getSignedUpload(filename: string, dir: string): Promise<SignedUploadRes> {
  const res = await fetch('/api/products/signed-upload', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ filename, dir }),
  });

  if (res.status === 401) throw new Error('Oturum bulunamadı. Lütfen giriş yapın.');
  if (res.status === 403) throw new Error('Bu işlemi yapmaya yetkiniz yok.');
  if (!res.ok) {
    let msg = `Upload URL alınamadı (${res.status})`;
    try {
      const j = (await res.json()) as { error?: string };
      if (j?.error) msg = j.error;
    } catch {}
    throw new Error(msg);
  }

  return (await res.json()) as SignedUploadRes;
}

/* ----------------------------------------------------------------------------
 * İmzalı URL ile yükleme
 * --------------------------------------------------------------------------*/

async function uploadWithSignedUrl(file: File, dir: string): Promise<{
  bucket: string;
  path: string;
  kind: FileKind;
}> {
  const { bucket, path, token } = await getSignedUpload(file.name, dir);

  const sb = getSB();
  const { error } = await sb.storage.from(bucket).uploadToSignedUrl(path, token, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: true,
  });
  if (error) throw new Error(error.message);

  const kind: FileKind = file.type === 'application/pdf' ? 'pdf' : 'image';
  return { bucket, path, kind };
}

/* ----------------------------------------------------------------------------
 * Hook
 * --------------------------------------------------------------------------*/

export function useProductUpload<T extends WithFileFields & FieldValues>(
  methods: UseFormReturn<T>,
  dir: string
) {
  const { show } = useSnackbar();
  const { setValue } = methods;

  const [uploading, setUploading] = React.useState(false);
  const [fileMeta, setFileMeta] = React.useState<{ name: string; kind: FileKind } | null>(null);
  const [uploadedRef, setUploadedRef] = React.useState<UploadRef | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const classify = React.useCallback((file: File): FileKind | null => {
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.startsWith('image/') && ACCEPTED_MIME.has(file.type)) return 'image';
    return null;
  }, []);

  const setImage = React.useCallback(
    (val: string, validate = true) => {
      setValue('image' as FieldPath<T>, val as unknown as PathValue<T, FieldPath<T>>, {
        shouldDirty: true,
        shouldValidate: validate,
      });
    },
    [setValue],
  );

  const setFile = React.useCallback(
    (val: File | null) => {
      setValue('file' as FieldPath<T>, val as unknown as PathValue<T, FieldPath<T>>, {
        shouldDirty: true,
      });
    },
    [setValue],
  );

  const clearMeta = React.useCallback(() => {
    setValue('fileBucket' as FieldPath<T>, null as any, { shouldDirty: true });
    setValue('filePath' as FieldPath<T>, null as any, { shouldDirty: true });
    setValue('fileName' as FieldPath<T>, null as any, { shouldDirty: true });
    setValue('fileMime' as FieldPath<T>, null as any, { shouldDirty: true });
    setValue('fileSize' as FieldPath<T>, null as any, { shouldDirty: true });
  }, [setValue]);

  const pick = React.useCallback(
    async (file?: File | null) => {
      if (!file) return;

      const kind = classify(file);
      if (!kind) {
        show('Sadece PDF, PNG, WEBP, JPEG kabul ediyorum.', 'error');
        return;
      }

      const limit = MAX_BYTES[kind];
      if (file.size > limit) {
        const mb = (limit / (1024 * 1024)).toFixed(0);
        show(`${kind.toUpperCase()} ${mb} MB sınırını aşıyor.`, 'error');
        return;
      }

      setUploading(true);
      try {
        if (uploadedRef) {
          try {
            await removeUploaded(uploadedRef);
          } catch {}
          setUploadedRef(null);
        }

        const { bucket, path, kind: resolvedKind } = await uploadWithSignedUrl(file, dir);

        setImage(path, true);
        setFile(file);

        setValue('fileBucket' as FieldPath<T>, bucket as any, { shouldDirty: true });
        setValue('filePath' as FieldPath<T>, path as any, { shouldDirty: true });
        setValue('fileName' as FieldPath<T>, file.name as any, { shouldDirty: true });
        setValue('fileMime' as FieldPath<T>, (file.type || null) as any, { shouldDirty: true });
        setValue('fileSize' as FieldPath<T>, (file.size ?? null) as any, { shouldDirty: true });

        setFileMeta({ name: file.name, kind: resolvedKind });
        setUploadedRef({ bucket, path });

        show(`${file.name} yüklendi.`, 'success');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        show(`Dosya yüklenemedi: ${msg}`, 'error');
      } finally {
        setUploading(false);
      }
    },
    [classify, uploadedRef, setImage, setFile, setValue, show, dir],
  );

  const openDelete = React.useCallback(() => setConfirmOpen(true), []);
  const closeDelete = React.useCallback(() => setConfirmOpen(false), []);

  const confirmDelete = React.useCallback(async () => {
    try {
      if (uploadedRef) await removeUploaded(uploadedRef);
      setUploadedRef(null);
      setFileMeta(null);
      setFile(null);
      clearMeta();
      setImage('', true);
      show('Dosya silindi.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      show(`Silinemedi: ${msg}`, 'error');
    } finally {
      setConfirmOpen(false);
    }
  }, [uploadedRef, setFile, clearMeta, setImage, show]);

  return {
    uploading,
    fileMeta,
    uploadedRef,
    confirmOpen,
    pick,
    openDelete,
    closeDelete,
    confirmDelete,
  };
}

export default useProductUpload;
