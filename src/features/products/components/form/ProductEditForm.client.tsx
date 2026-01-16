// src/features/products/components/form/ProductEditForm.client.tsx
'use client';

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
  type CustomerMoldSelect,
  DEFAULT_VARIANT_KEY,
} from '@/features/products/components/form/forms/schema';

import ProductFormFields from '@/features/products/components/form/GeneralProductForm.client';

import { toUpdatePayload, type ProductUpdateInput } from '@/features/products/components/form/forms/mappers';

import { buildFileMeta, type FileMetaSource } from '@/features/products/components/form/forms/fileMeta';

import { updateProductDb } from '@/features/products/services/products.client';

type EditValues = ProductFormValues & {
  file: File | null;
  fileBucket?: string | null;
  filePath?: string | null;
  fileName?: string | null;
  fileMime?: string | null;
  fileSize?: number | null;
};

type Props = {
  dicts: ProductDicts;
  initial: {
    id: string;

    name: string | null;
    code: string | null;
    variant: string | null;

    // IMPORTANT: artık subSubCategory de geliyor (edit page category_id'den türetiyor)
    category: string | null;
    subCategory: string | null;
    subSubCategory?: string | null;

    unitWeightG: number | null;

    date: string | null;
    revisionDate?: string | null;

    hasCustomerMold?: boolean | null;
    customerMold?: CustomerMoldSelect;

    availability: boolean | null;

    drawer?: string | null;
    control?: string | null;
    scale?: string | null;
    outerSizeMm?: number | null;
    sectionMm2?: number | null;

    wallThicknessMm?: number | null;

    tempCode?: string | null;
    profileCode?: string | null;
    manufacturerCode?: string | null;

    image?: string | null;
    description?: string | null;
  };
  title?: string;
};

function fromBoolToSelect(v: boolean | null | undefined): CustomerMoldSelect {
  if (v === true) return 'Evet';
  if (v === false) return 'Hayır';
  return '';
}

function pickLeafCategoryId(
  dicts: ProductDicts,
  v: Pick<ProductFormValues, 'category' | 'subCategory' | 'subSubCategory'>,
): string | null {
  const slugToId = dicts.categoryIdBySlug || {};
  const chosenSlug = v.subSubCategory || v.subCategory || v.category || null;
  return chosenSlug && slugToId[chosenSlug] ? slugToId[chosenSlug] : null;
}

function fileMetaSourceFromValues(v: EditValues): FileMetaSource {
  return {
    fileBucket: v.fileBucket ?? null,
    filePath: v.filePath ?? null,
    fileName: v.fileName ?? null,
    fileMime: v.fileMime ?? null,
    fileSize: typeof v.fileSize === 'number' ? v.fileSize : null,
  };
}

export default function ProductEditForm({ dicts, initial, title }: Props): React.JSX.Element {
  const router = useRouter();
  const { show } = useSnackbar();

  const computedTitle = title ?? `${initial.code ?? ''} — Düzenle`;

  const defaultValues = React.useMemo<EditValues>(() => {
    const today = new Date().toISOString().slice(0, 10);

    return {
      name: initial.name ?? '',
      code: initial.code ?? '',

      customerMold:
        (initial.customerMold as CustomerMoldSelect | undefined) ??
        fromBoolToSelect(initial.hasCustomerMold ?? null),

      availability: initial.availability ?? true,

      category: initial.category ?? '',
      subCategory: initial.subCategory ?? '',
      subSubCategory: initial.subSubCategory ?? '',

      // DB null/'' gelirse schema zaten "yok" yapıyor, ama edit'te de defaultu net verelim
      variant: (initial.variant ?? DEFAULT_VARIANT_KEY) || DEFAULT_VARIANT_KEY,

      unitWeightG: typeof initial.unitWeightG === 'number' ? Number(initial.unitWeightG) : 0,

      wallThicknessMm: initial.wallThicknessMm ?? null,
      outerSizeMm: initial.outerSizeMm ?? null,
      sectionMm2: initial.sectionMm2 ?? null,

      date: initial.date ?? today,
      revisionDate: initial.revisionDate ?? '',

      drawer: initial.drawer ?? '',
      control: initial.control ?? '',
      scale: initial.scale ?? '',

      tempCode: initial.tempCode ?? null,
      manufacturerCode: initial.manufacturerCode ?? null,

      description: initial.description ?? '',
      image: initial.image ?? '',

      file: null,
      fileBucket: null,
      filePath: null,
      fileName: null,
      fileMime: null,
      fileSize: null,
    };
  }, [initial]);

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
    // initial değişirse (route değişimi vs) formu sıfırla
    reset(defaultValues);
  }, [reset, defaultValues]);

  async function onSubmit(v: EditValues): Promise<void> {
    try {
      const categoryId = pickLeafCategoryId(dicts, v);
      const fileMeta = buildFileMeta(fileMetaSourceFromValues(v));

      const mapperInput: ProductUpdateInput = {
        name: v.name,
        code: v.code,

        customerMold: v.customerMold,
        availability: v.availability,

        variant: v.variant,

        unitWeightG: v.unitWeightG ?? null,
        wallThicknessMm: v.wallThicknessMm ?? null,
        outerSizeMm: v.outerSizeMm ?? null,
        sectionMm2: v.sectionMm2 ?? null,

        date: v.date,
        revisionDate: v.revisionDate ?? '',

        drawer: v.drawer ?? '',
        control: v.control ?? '',
        scale: v.scale ?? '',

        tempCode: v.tempCode ?? null,
        manufacturerCode: v.manufacturerCode ?? null,

        description: v.description ?? '',
        image: v.image ?? '',

        categoryId,
        fileMeta,
      };

      const dbPatch = toUpdatePayload(mapperInput);

      await updateProductDb(initial.id, dbPatch);

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
      <Typography variant="h5" sx={{ mb: 1 }}>
        {computedTitle}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2} alignItems="stretch">
            <Grid size={{ xs: 12, md: 9 }}>
              <ProductFormFields methods={methods} dicts={dicts} showFileSection dir={initial.id} />
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
