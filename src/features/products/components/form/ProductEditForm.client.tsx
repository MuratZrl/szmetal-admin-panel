// src/features/products/components/form/ProductEditForm.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { Paper, Box, Stack, Button, Grid } from '@mui/material';

import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';
import {
  updateProduct,
  type UpdateProductInput,
} from '@/features/products/services/products.client';

import type { ProductDicts } from '@/features/products/services/dicts.server';

import {
  productSchema,
  type ProductFormValues,
  type CustomerMoldSelect,
  customerMoldToBoolean,
} from '@/features/products/forms/schema';

import ProductFormFields from '@/features/products/components/form/GeneralProductForm.client';
import NotesField from '@/features/products/components/form/NotesField.client';

/* -------------------------------------------------------------------------- */
/* Tipler                                                                      */
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
};

function fromBoolToSelect(v: boolean | null | undefined): CustomerMoldSelect {
  if (v === true) return 'Evet';
  if (v === false) return 'Hayır';
  return '';
}

/* -------------------------------------------------------------------------- */

export default function ProductEditForm({ dicts, initial }: Props) {
  const router = useRouter();
  const { show } = useSnackbar();

  const defaultValues: EditValues = {
    // 1) Temel metinler
    name: initial.name ?? '',
    code: initial.code ?? '',

    // 2) Müşteri kalıbı + availability
    customerMold:
      (initial.customerMold as CustomerMoldSelect | undefined) ??
      fromBoolToSelect(initial.hasCustomerMold ?? null),
    availability: initial.availability ?? true,

    // 3) Kategori alanları (UI slug’lar)
    category: initial.category ?? '',
    subCategory: initial.subCategory ?? '',
    subSubCategory: '',

    // 4) Varyant
    variant: initial.variant ?? '',

    // 5) Ağırlık / ölçü
    unitWeightG:
      typeof initial.unitWeightG === 'number'
        ? Number(initial.unitWeightG)
        : 0,
    wallThicknessMm: initial.wallThicknessMm ?? null,
    outerSizeMm: initial.outerSizeMm ?? null,
    sectionMm2: initial.sectionMm2 ?? null,

    // 6) Tarihler
    date: initial.date ?? new Date().toISOString().slice(0, 10),
    revisionDate: initial.revisionDate ?? '',

    // 7) Teknik / çizim
    drawer: initial.drawer ?? '',
    control: initial.control ?? '',
    scale: initial.scale ?? '',

    // 8) Kod alanları
    tempCode: initial.tempCode ?? null,
    manufacturerCode: initial.manufacturerCode ?? null,

    // 9) Açıklama
    description: initial.description ?? '',

    // 10) Görsel
    image: initial.image ?? '',

    // 11) Dosya alanı + metadata
    file: null,
    fileBucket: undefined,
    filePath: undefined,
    fileName: undefined,
    fileMime: undefined,
    fileSize: undefined,
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
      const slugToId = dicts.categoryIdBySlug || {};

      const chosenSlug =
        v.subSubCategory ||
        v.subCategory ||
        v.category ||
        null;

      const categoryId =
        chosenSlug && slugToId[chosenSlug]
          ? slugToId[chosenSlug]
          : null;

      const nextImagePath =
        typeof v.image === 'string' && v.image.trim().length > 0
          ? v.image.trim()
          : null;

      const payload: UpdateProductInput = {
        // 1) Temel metinler
        name: v.name,
        code: v.code,

        // 2) Müşteri kalıbı + availability
        hasCustomerMold: customerMoldToBoolean(v.customerMold),
        availability: v.availability,

        // 3) Kategori ilişkisi (UI category/subCategory/SubSubCategory’yi göndermiyoruz)
        categoryId,

        // 4) Varyant
        variant: v.variant,

        // 5) Ağırlık / ölçü
        unitWeightG: v.unitWeightG,
        wallThicknessMm: v.wallThicknessMm ?? null,
        outerSizeMm: v.outerSizeMm ?? null,
        sectionMm2: v.sectionMm2 ?? null,

        // 6) Tarihler
        date: v.date,
        revisionDate: v.revisionDate ?? '',

        // 7) Teknik / çizim
        drawer: v.drawer || null,
        control: v.control || null,
        scale: v.scale || null,

        // 8) Kod alanları
        tempCode: v.tempCode ?? null,
        manufacturerCode: v.manufacturerCode ?? null,

        // 9) Açıklama
        description: v.description || null,

        // 10) Görsel
        image: nextImagePath,

        // 11) Dosya metadata
        fileBucket: v.fileBucket,
        filePath: v.filePath,
        fileName: v.fileName,
        fileMime: v.fileMime,
        fileSize: v.fileSize,
      };

      await updateProduct(initial.id, payload);

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
              <ProductFormFields
                methods={methods}
                dicts={dicts}
                showFileSection
                dir={initial.id}
              />
            </Grid>

            {/* <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex' }}>
              <NotesField disabled={methods.formState.isSubmitting} />
            </Grid> */}
            
          </Grid>

          <Stack
            direction="row"
            spacing={1}
            justifyContent="start"
            sx={{ mt: 2 }}
          >
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
