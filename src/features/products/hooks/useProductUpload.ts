// features/products/components/form/useProductUpload.ts
'use client';

import * as React from 'react';
import {
  type UseFormReturn,
  type FieldValues,
  type FieldPath,
  type PathValue,
} from 'react-hook-form';
import { supabase } from '@/lib/supabase/supabaseClient';
import {
  uploadProductPdfAndGetUrl,
  uploadProductImageAndGetUrl,
  removeUploaded,
  type UploadRef,
  type UploadResult,
} from '@/features/products/services/storage.client';
import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';

type FileKind = 'pdf' | 'image';

// Kabul edilen MIME türleri ve limitler
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

// Formunda bu alanlar olmalı:
type WithFileFields = {
  code: string;
  image: string;
  file: File | null;
};

/**
 * Ürün yükleme hook'u
 * - T: RHF form değerleri (code, image, file alanlarını içermeli)
 */
export function useProductUpload<T extends WithFileFields & FieldValues>(
  methods: UseFormReturn<T>
) {
  const { getValues, setValue } = methods;
  const { show } = useSnackbar();

  const [uploading, setUploading] = React.useState(false);
  const [fileMeta, setFileMeta] = React.useState<{ name: string; kind: FileKind } | null>(null);
  const [uploadedRef, setUploadedRef] = React.useState<UploadRef | null>(null);

  // Silme diyaloğu için basit state — dialog'u sen render edersin
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const classify = React.useCallback((file: File): FileKind | null => {
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.startsWith('image/') && ACCEPTED_MIME.has(file.type)) return 'image';
    return null;
  }, []);

  // RHF setValue için güvenli sarmalayıcılar (any yok, bilinçli unknown cast)
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

  const getCode = React.useCallback((): string => {
    const raw = getValues('code' as FieldPath<T>) as unknown as string | undefined;
    const s = (raw ?? '').trim();
    return s.length ? s : `product-${Date.now()}`;
  }, [getValues]);

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

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        show('Oturum bulunamadı. Giriş yapın.', 'error');
        return;
      }

      setUploading(true);
      try {
        // Bu oturumda daha önce yüklediysen, yenilemeden önce eskisini sil
        if (uploadedRef) {
          try {
            await removeUploaded(uploadedRef);
          } catch {
            // sessiz geç
          }
          setUploadedRef(null);
        }

        const code = getCode();
        const res: UploadResult =
          kind === 'pdf'
            ? await uploadProductPdfAndGetUrl(code, file)
            : await uploadProductImageAndGetUrl(code, file);

        // Form alanlarını güncelle
        setImage(res.publicUrl, true);
        setFile(file);

        setFileMeta({ name: file.name, kind });
        setUploadedRef({ bucket: res.bucket, path: res.path });

        show(`${file.name} yüklendi.`, 'success');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        show(`Dosya yüklenemedi: ${msg}`, 'error');
      } finally {
        setUploading(false);
      }
    },
    [classify, uploadedRef, setImage, setFile, getCode, show]
  );

  const confirmDelete = React.useCallback(async () => {
    try {
      if (uploadedRef) {
        await removeUploaded(uploadedRef); // sadece bu oturumda yüklenen dosyayı siler
      }
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
    // state
    uploading,
    fileMeta,
    uploadedRef,   // sadece bu oturumda yüklenen dosya
    confirmOpen,

    // actions
    pick,                      // input onChange -> pick(e.target.files?.[0])
    openDelete: () => setConfirmOpen(true),
    closeDelete: () => setConfirmOpen(false),
    confirmDelete,
  };
}
