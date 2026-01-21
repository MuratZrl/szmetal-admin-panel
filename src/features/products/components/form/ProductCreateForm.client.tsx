'use client';
// src/features/products/components/form/ProductCreateForm.client.tsx

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { Paper, Box, Stack, Button, Grid, Typography, Divider } from '@mui/material';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';

import type { ProductDicts } from '@/features/products/services/dicts.server';

import {
  productSchema,
  type ProductFormValues,
  newProductDefaults,
} from '@/features/products/components/form/forms/schema';

import ProductFormFields from '@/features/products/components/form/GeneralProductForm.client';

// ✅ Mapper’lar
import {
  toInsertPayload,
  type ProductFormValuesWithRelations,
} from '@/features/products/components/form/forms/mappers';

// ✅ File meta builder (refactor)
import { buildFileMeta, type FileMetaSource } from '@/features/products/components/form/forms/fileMeta';

// ✅ DB insert
import { createProductDb } from '@/features/products/services/products.client';

type Props = {
  dicts: ProductDicts;
  title?: string;
};

type CreateValues = ProductFormValues & {
  file: File | null;
  fileBucket?: string | null;
  filePath?: string | null;
  fileName?: string | null;
  fileMime?: string | null;
  fileSize?: number | null;
};

function makeDraftDir(): string {
  try {
    return `draft-${crypto.randomUUID()}`;
  } catch {
    const ts = Date.now().toString(36);
    const rnd = Math.random().toString(36).slice(2, 10);
    return `draft-${ts}-${rnd}`;
  }
}

function pickLeafCategoryId(
  dicts: ProductDicts,
  v: Pick<ProductFormValues, 'category' | 'subCategory' | 'subSubCategory'>,
): string | null {
  const slugToId = dicts.categoryIdBySlug || {};
  const chosenSlug = v.subSubCategory || v.subCategory || v.category || null;
  return chosenSlug && slugToId[chosenSlug] ? slugToId[chosenSlug] : null;
}

function fileMetaSourceFromValues(v: CreateValues): FileMetaSource {
  return {
    fileBucket: v.fileBucket ?? null,
    filePath: v.filePath ?? null,
    fileName: v.fileName ?? null,
    fileMime: v.fileMime ?? null,
    fileSize: typeof v.fileSize === 'number' ? v.fileSize : null,
  };
}

export default function ProductCreateForm({ dicts, title = 'Yeni Profil Ekle' }: Props) {
  const router = useRouter();
  const { show } = useSnackbar();

  const [draftDir] = React.useState<string>(() => makeDraftDir());

  const methods = useForm<CreateValues>({
    resolver: yupResolver(productSchema) as unknown as Resolver<CreateValues>,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      ...newProductDefaults,
      file: null,
      fileBucket: null,
      filePath: null,
      fileName: null,
      fileMime: null,
      fileSize: null,
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isDirty, isValid },
  } = methods;

  async function onSubmit(v: CreateValues): Promise<void> {
    try {
      const categoryId = pickLeafCategoryId(dicts, v);

      const fileMeta = buildFileMeta(fileMetaSourceFromValues(v));

      const mapperInput: ProductFormValuesWithRelations = {
        // 1) Temel metinler
        name: v.name,
        code: v.code,

        // 2) Müşteri kalıbı + availability
        customerMold: v.customerMold,
        availability: v.availability ?? true,

        // 3) Kategori alanları (UI slug’lar)
        category: v.category ?? '',
        subCategory: v.subCategory ?? '',
        subSubCategory: v.subSubCategory ?? '',

        // 4) Varyant
        variant: v.variant,

        // 5) Ölçüler
        unitWeightG: v.unitWeightG ?? null,
        wallThicknessMm: v.wallThicknessMm ?? null,
        outerSizeMm: v.outerSizeMm ?? null,
        sectionMm2: v.sectionMm2 ?? null,

        // 6) Tarihler
        date: v.date,
        revisionDate: v.revisionDate ?? '',

        // 7) Teknik / çizim
        drawer: v.drawer ?? '',
        control: v.control ?? '',
        scale: v.scale ?? '',

        // 8) Kod alanları
        tempCode: v.tempCode ?? null,
        manufacturerCode: v.manufacturerCode ?? null,

        // 9) Açıklama + görsel
        description: v.description ?? '',
        image: v.image ?? '',

        // 10) DB relation
        categoryId,
      };

      const insertPayload = toInsertPayload(mapperInput, fileMeta);

      await createProductDb(insertPayload);

      show('Ürün oluşturuldu.', 'success');
      router.push('/products');
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Bilinmeyen hata';
      show(`Kayıt başarısız: ${msg}`, 'error');
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      {/* ✅ Başlık artık burada */}
      <Typography variant="h5" sx={{ mb: 1 }}>
        {title}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2} alignItems="stretch">
            <Grid size={{ xs: 12, md: 9 }}>
              <ProductFormFields
                methods={methods}
                dicts={dicts}
                showFileSection
                dir={draftDir}
              />
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
