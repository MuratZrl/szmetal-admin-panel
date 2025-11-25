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
    revisionDate?: string | null;
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
    name: initial.name ?? '',
    code: initial.code ?? '',
    variant: initial.variant ?? '',
    category: initial.category ?? '',
    subCategory: initial.subCategory ?? '',

    unitWeightG:
      typeof initial.unitWeightG === 'number'
        ? Number(initial.unitWeightG)   // gr/m'yi direkt yaz
        : 0,

    customerMold:
      (initial.customerMold as CustomerMoldSelect | undefined) ??
      fromBoolToSelect(initial.hasCustomerMold ?? null),

    availability: initial.availability ?? true,

    date: initial.date ?? new Date().toISOString().slice(0, 10),
    revisionDate: initial.revisionDate ?? '',

    drawer: initial.drawer ?? '',
    control: initial.control ?? '',
    scale: initial.scale ?? '',
    outerSizeMm: initial.outerSizeMm ?? null,
    sectionMm2: initial.sectionMm2 ?? null,

    wallThicknessMm: initial.wallThicknessMm ?? null,

    tempCode: initial.tempCode ?? null,
    manufacturerCode: initial.manufacturerCode ?? null,
    image: initial.image ?? '',
    description: initial.description ?? '',
    file: null,

    // metadata defaultları; edit’te eski değerleri korumak için
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
      const nextImagePath =
        typeof v.image === 'string' && v.image.trim().length > 0
          ? v.image.trim()
          : null;

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
        wallThicknessMm: v.wallThicknessMm ?? null,
        tempCode: v.tempCode ?? null,
        manufacturerCode: v.manufacturerCode ?? null,
        image: nextImagePath,
        hasCustomerMold: customerMoldToBoolean(v.customerMold),
        availability: v.availability,
        description: v.description || null,
        revisionDate: v.revisionDate ?? '',

        // metadata: sadece kullanıcı yeni dosya yüklediyse dolmuş olacak
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
            <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex' }}>
              <NotesField disabled={methods.formState.isSubmitting} />
            </Grid>
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
