// features/products/components/form/useProductUpload.ts
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
import {
  removeUploaded,
  type UploadRef,
} from '@/features/products/services/storage.client';
import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';

type FileKind = 'pdf' | 'image';

const ACCEPTED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/webp',
  'image/jpeg',
]);
const MAX_BYTES: Record<FileKind, number> = {
  pdf: 10 * 1024 * 1024,
  image: 8 * 1024 * 1024,
};

type WithFileFields = {
  code: string;
  image: string;
  file: File | null;
};

function env() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY eksik.');
  }
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET || 'product-media';
  return { url, anon, bucket };
}

let __sb__: SupabaseClient<Database> | null = null;
function getSB(): SupabaseClient<Database> {
  if (!__sb__) {
    const { url, anon } = env();
    __sb__ = createClient<Database>(url, anon, {
      auth: {
        detectSessionInUrl: false,
        persistSession: false,
        autoRefreshToken: true,
      },
    });
  }
  return __sb__;
}

async function getSignedUpload(filename: string): Promise<{ path: string; token: string }> {
  const res = await fetch('/api/storage/products/signed-upload', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ filename }),
  });

  if (res.status === 401) throw new Error('Oturum Bulunamadı, Giriş Yapın');
  if (!res.ok) {
    let msg = `Upload URL alınamadı (${res.status})`;
    try {
      const j = (await res.json()) as { error?: string };
      if (j?.error) msg = j.error;
    } catch {}
    throw new Error(msg);
  }

  const j = (await res.json()) as { path: string; token: string };
  return j;
}

async function uploadWithSignedUrl(file: File): Promise<{
  bucket: string; path: string; publicUrl: string; kind: FileKind;
}> {
  const { bucket } = env();
  const { path, token } = await getSignedUpload(file.name);

  const sb = getSB();
  const { error } = await sb.storage.from(bucket).uploadToSignedUrl(path, token, file);
  if (error) throw new Error(error.message);

  // Bucket private ise burada publicUrl yerine path sakla, görüntülemede server’dan signed URL üret.
  const pub = sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;

  const kind: FileKind = file.type === 'application/pdf' ? 'pdf' : 'image';
  return { bucket, path, publicUrl: pub, kind };
}

export function useProductUpload<T extends WithFileFields & FieldValues>(
  methods: UseFormReturn<T>
) {
  const { setValue } = methods;
  const { show } = useSnackbar();

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
      setValue(
        'image' as FieldPath<T>,
        val as unknown as PathValue<T, FieldPath<T>>,
        { shouldDirty: true, shouldValidate: validate }
      );
    },
    [setValue]
  );

  const setFile = React.useCallback(
    (val: File | null) => {
      setValue(
        'file' as FieldPath<T>,
        val as unknown as PathValue<T, FieldPath<T>>,
        { shouldDirty: true }
      );
    },
    [setValue]
  );

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
          try { await removeUploaded(uploadedRef); } catch {}
          setUploadedRef(null);
        }

        const { bucket, path, kind: resolvedKind } = await uploadWithSignedUrl(file);

        setImage(path, true);
        setFile(file);

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
    [classify, uploadedRef, setImage, setFile, show]
  );

  const confirmDelete = React.useCallback(async () => {
    try {
      if (uploadedRef) await removeUploaded(uploadedRef);
      setUploadedRef(null);
      setFileMeta(null);
      setFile(null);
      setImage('', true);
      show('Dosya silindi.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      show(`Silinemedi: ${msg}`, 'error');
    } finally {
      setConfirmOpen(false);
    }
  }, [uploadedRef, setFile, setImage, show]);

  return {
    uploading,
    fileMeta,
    uploadedRef,
    confirmOpen,
    pick,
    openDelete: () => setConfirmOpen(true),
    closeDelete: () => setConfirmOpen(false),
    confirmDelete,
  };
}
