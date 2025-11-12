// src/features/products/components/form/ProductEditForm.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Paper, Box, Stack, Button, Grid } from '@mui/material';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';
import type { ProductDicts } from '@/features/products/services/dicts.server';
import { updateProduct, type UpdateProductInput } from '@/features/products/services/products.client';

import {
  productSchema,
  type ProductFormValues,
  type CustomerMoldSelect,
  customerMoldToBoolean,
} from '@/features/products/forms/schema';

import ProductFormFields from '@/features/products/components/form/ProductFormFields.client';
import NotesField from '@/features/products/components/form/NotesField.client';

import type { Database } from '@/types/supabase';

/* -------------------------------------------------------------------------- */
/* Tipler                                                                      */
/* -------------------------------------------------------------------------- */

// id formda değil; file var.
type EditValues = ProductFormValues & { file: File | null };

type Props = {
  dicts: ProductDicts;
  initial: {
    id: string;
    name: string | null;
    code: string | null;
    variant: string | null;
    category: string | null;
    subCategory: string | null;
    unitWeightG: number | null;
    date: string | null;

    hasCustomerMold?: boolean | null;
    customerMold?: CustomerMoldSelect;

    availability: boolean | null;

    drawer?: string | null;
    control?: string | null;
    scale?: string | null;
    outerSizeMm?: number | null;
    sectionMm2?: number | null;
    tempCode?: string | null;
    profileCode?: string | null;
    manufacturerCode?: string | null;
    image?: string | null;

    description?: string | null;
  };
};

// boolean|null|undefined → '' | 'Evet' | 'Hayır'
function fromBoolToSelect(v: boolean | null | undefined): CustomerMoldSelect {
  if (v === true) return 'Evet';
  if (v === false) return 'Hayır';
  return '';
}

/* -------------------------------------------------------------------------- */
/* Upload helper: server'dan signed upload URL al ve yükle                     */
/* -------------------------------------------------------------------------- */

async function uploadProductFile(
  productId: string,
  file: File,
  supabase: SupabaseClient<Database>
): Promise<string> {
  // 1) Server'dan imzalı upload URL iste
  const extHint = file.name.split('.').pop()?.toLowerCase() ?? '';
  const res = await fetch('/api/products/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dir: productId, originalName: file.name, extHint }),
  });

  if (!res.ok) {
    const msg = (await res.json().catch(() => null))?.error ?? 'Upload URL alınamadı';
    throw new Error(msg);
  }

  const { bucket, path, token } = (await res.json()) as { bucket: string; path: string; token: string };

  // 2) İmzalı URL ile Storage'a yükle (RLS umrumuzda değil)
  const { error } = await supabase.storage
    .from(bucket)
    .uploadToSignedUrl(path, token, file, { contentType: file.type, upsert: true });

  if (error) throw new Error(error.message);

  // 3) DB'ye yazacağın şey sadece path (bucket adı yok)
  return path; // ör: "6580.../1759...pdf"
}

/* -------------------------------------------------------------------------- */

export default function ProductEditForm({ dicts, initial }: Props) {
  const router = useRouter();
  const { show } = useSnackbar();

  // Client Supabase (anon) — sadece uploadToSignedUrl için
  const supabase = React.useMemo(
    () => createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ),
    []
  );

  const defaultValues: EditValues = {
    name: initial.name ?? '',
    code: initial.code ?? '',
    variant: initial.variant ?? '',
    category: initial.category ?? '',
    subCategory: initial.subCategory ?? '',
    unitWeightG: typeof initial.unitWeightG === 'number' ? Math.round(initial.unitWeightG) : 0,
    customerMold:
      (initial.customerMold as CustomerMoldSelect | undefined) ??
      fromBoolToSelect(initial.hasCustomerMold ?? null),
    availability: initial.availability ?? true,

    date: initial.date ?? new Date().toISOString().slice(0, 10),
    // ← EKLENDİ: tip güvenli okuma (Props.initial'da alan tanımlı değilse '')
    revisionDate: (initial as unknown as { revisionDate?: string | null }).revisionDate ?? '',

    drawer: initial.drawer ?? '',
    control: initial.control ?? '',
    scale: initial.scale ?? '',
    outerSizeMm: initial.outerSizeMm ?? null,
    sectionMm2: initial.sectionMm2 ?? null,
    tempCode: initial.tempCode ?? null,
    manufacturerCode: initial.manufacturerCode ?? null,
    image: initial.image ?? '',
    description: initial.description ?? '',
    file: null,
  };

  const methods = useForm<EditValues>({
    resolver: yupResolver(productSchema) as unknown as Resolver<EditValues>,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isDirty, isValid },
    reset,
  } = methods;

  React.useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  async function onSubmit(v: EditValues): Promise<void> {
    try {
      // 1) Dosya seçilmiş ise önce yükle, path'i al
      let nextImagePath: string | null =
        typeof v.image === 'string' && v.image.trim().length > 0 ? v.image.trim() : null;

      if (v.file instanceof File) {
        nextImagePath = await uploadProductFile(initial.id, v.file, supabase);
      }

      // 2) Update payload
      const payload: UpdateProductInput = {
        name: v.name,
        code: v.code,
        variant: v.variant,
        category: v.category,
        subCategory: v.subCategory,
        unitWeightG: v.unitWeightG,
        date: v.date,
        drawer: v.drawer || null,
        control: v.control || null,
        scale: v.scale || null,
        outerSizeMm: v.outerSizeMm ?? null,
        sectionMm2: v.sectionMm2 ?? null,
        tempCode: v.tempCode ?? null,
        manufacturerCode: v.manufacturerCode ?? null,
        image: nextImagePath, // ← DB'ye sadece path
        hasCustomerMold: customerMoldToBoolean(v.customerMold),
        availability: v.availability,
        description: v.description || null,
      };

      // 3) Ürünü güncelle
      await updateProduct(Number(initial.id), payload);

      show('Ürün güncellendi.', 'success');
      router.push('/products');
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Bilinmeyen hata';
      show(`Güncelleme başarısız: ${msg}`, 'error');
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2} alignItems="stretch">
            <Grid size={{ xs: 12, md: 9 }}>
              {/* ProductFormFields içinde "file" alanını set eden bölüm olduğundan emin ol. showFileSection bunu görünür yapıyor. */}
              {/* Dosya seçildiğinde useProductUpload hemen yükler ve image path'ini yazar */}
              <ProductFormFields methods={methods} dicts={dicts} showFileSection dir={initial.id} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex' }}>
              <NotesField disabled={methods.formState.isSubmitting} />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} justifyContent="start" sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="contrast"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              İptal
            </Button>

            <Button
              type="submit"
              variant="contained"
              color="contrast"
              disabled={!isDirty || !isValid || isSubmitting}
            >
              Kaydet
            </Button>
          </Stack>

        </Box>
      </FormProvider>
    </Paper>
  );
}
