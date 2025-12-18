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
} from '@/features/products/forms/schema';

import ProductFormFields from '@/features/products/components/form/GeneralProductForm.client';

// ✅ Mapper’lar
import {
  toUpdatePayload,
  type ProductUpdateInput,
} from '@/features/products/forms/mappers';

// ✅ fileMeta helper (refactor)
import { buildFileMeta, type FileMetaSource } from '@/features/products/forms/fileMeta';

// ✅ DB patch ile update
import { updateProductDb } from '@/features/products/services/products.client';

/* -------------------------------------------------------------------------- */

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

    category: string | null;
    subCategory: string | null;

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

/* -------------------------------------------------------------------------- */

export default function ProductEditForm({ dicts, initial, title }: Props) {

  const router = useRouter();
  const { show } = useSnackbar();

  const computedTitle = title ?? `${initial.code ?? ''} — Düzenle`;

  const defaultValues = React.useMemo<EditValues>(() => {
    return {
      name: initial.name ?? '',
      code: initial.code ?? '',

      customerMold:
        (initial.customerMold as CustomerMoldSelect | undefined) ??
        fromBoolToSelect(initial.hasCustomerMold ?? null),

      availability: initial.availability ?? true,

      category: initial.category ?? '',
      subCategory: initial.subCategory ?? '',
      subSubCategory: '',

      variant: initial.variant ?? '',

      unitWeightG:
        typeof initial.unitWeightG === 'number'
          ? Number(initial.unitWeightG)
          : 0,

      wallThicknessMm: initial.wallThicknessMm ?? null,
      outerSizeMm: initial.outerSizeMm ?? null,
      sectionMm2: initial.sectionMm2 ?? null,

      date: initial.date ?? new Date().toISOString().slice(0, 10),
      revisionDate: initial.revisionDate ?? '',

      drawer: initial.drawer ?? '',
      control: initial.control ?? '',
      scale: initial.scale ?? '',

      tempCode: initial.tempCode ?? null,
      manufacturerCode: initial.manufacturerCode ?? null,

      description: initial.description ?? '',
      image: initial.image ?? '',

      file: null,
      fileBucket: undefined,
      filePath: undefined,
      fileName: undefined,
      fileMime: undefined,
      fileSize: undefined,
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
      {/* ✅ Başlık artık burada */}
      <Typography variant="h5" sx={{ mb: 1 }}>
        {computedTitle}
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
                dir={initial.id}
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
