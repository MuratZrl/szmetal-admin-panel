// src/features/products/components/form/sections/FileUploadField.client.tsx
'use client';

import * as React from 'react';

import { Box, Button, FormHelperText, Grid, Stack } from '@mui/material';

import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { useFormContext } from 'react-hook-form';

import type { ProductFormValues } from '@/features/products/forms/schema';
import { useProductUpload } from '@/features/products/hooks/useProductUpload.client';
import ConfirmDialog from '@/components/ui/dialogs/ConfirmDialog';

type WithFileFields = { file: File | null };
type FormType = ProductFormValues & WithFileFields;

function toHelper(m: unknown): string | undefined {
  return typeof m === 'string' ? m : undefined;
}

export function FileUploadField({ dir }: { dir: string }) {
  const methods = useFormContext<FormType>();
  const {
    watch,
    formState: { errors, isSubmitting },
  } = methods;

  const up = useProductUpload(methods, dir);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const openPicker = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  };

  const [pickerKey, bumpPickerKey] = React.useReducer((n) => (n + 1) % 999_999, 0);

  const handleConfirmDelete = async () => {
    await up.confirmDelete();
    if (fileInputRef.current) fileInputRef.current.value = '';
    bumpPickerKey();
  };

  const hasExistingFile = Boolean(up.uploadedRef) || Boolean(watch('image'));

  return (
    <Grid size={{ xs: 12 }}>
      <input
        key={pickerKey}
        ref={fileInputRef}
        type="file"
        accept="application/pdf, image/png, image/webp, image/jpeg"
        style={{ display: 'none' }}
        onChange={(e) => up.pick(e.target.files?.[0] ?? null)}
      />

      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="outlined"
          color="contrast"
          startIcon={up.fileMeta?.kind === 'pdf' ? <PictureAsPdfIcon /> : <ImageIcon />}
          onClick={openPicker}
          disabled={up.uploading || isSubmitting}
          sx={{ textTransform: 'capitalize' }}
        >
          {up.uploading ? 'Yükleniyor…' : 'Dosya Seç ve Yükle'}
        </Button>

        <Button
          variant="outlined"
          color="contrast"
          startIcon={<DeleteOutlineIcon />}
          disabled={!hasExistingFile || up.uploading || isSubmitting}
          onClick={up.openDelete}
          sx={{ textTransform: 'capitalize' }}
        >
          Sil
        </Button>

        <Box sx={{ opacity: 0.8, fontSize: 13 }}>
          {up.fileMeta
            ? `${up.fileMeta.name} (${up.fileMeta.kind.toUpperCase()})`
            : watch('image')
            ? 'Dosya yüklü'
            : 'Henüz dosya seçilmedi'}
        </Box>
      </Stack>

      {errors.image && <FormHelperText error>{toHelper(errors.image.message)}</FormHelperText>}

      <ConfirmDialog
        open={up.confirmOpen}
        title="Dosyayı sil"
        description="Yüklediğiniz dosyayı kaldırmak istiyor musunuz?"
        confirmText="Evet"
        cancelText="Vazgeç"
        onClose={up.closeDelete}
        onConfirm={handleConfirmDelete}
      />
    </Grid>
  );
}
