// src/features/products/components/form/ProductCreateForm.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { Paper, Box, Stack, Button, Grid } from '@mui/material';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';

import type { ProductDicts } from '@/features/products/services/dicts.server';
import { createProduct } from '@/features/products/services/products.client';

import {
  productSchema,
  type ProductFormValues,
  newProductDefaults,
  customerMoldToBoolean,
} from '@/features/products/forms/schema';

import ProductFormFields from '@/features/products/components/form/ProductFormFields.client';
import NotesField from '@/features/products/components/form/NotesField.client';

type Props = { dicts: ProductDicts };
type CreateValues = ProductFormValues & { file: File | null };

// Güvenli, tekrar kullanılabilir geçici klasör ismi
function makeDraftDir(): string {
  try {
    return `draft-${crypto.randomUUID()}`;
  } catch {
    const ts = Date.now().toString(36);
    const rnd = Math.random().toString(36).slice(2, 10);
    return `draft-${ts}-${rnd}`;
  }
}

export default function ProductCreateForm({ dicts }: Props) {
  const router = useRouter();
  const { show } = useSnackbar();

  const draftDirRef = React.useRef<string>(makeDraftDir());

  const methods = useForm<CreateValues>({
    resolver: yupResolver(productSchema) as unknown as Resolver<CreateValues>,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { ...newProductDefaults, file: null },
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isDirty, isValid },
  } = methods;

  async function onSubmit(v: CreateValues): Promise<void> {
    try {
      // kg/m öncelik; geriye uyumluluk için g/m’yi de ver
      const payload = {
        name: v.name,
        code: v.code,
        variant: v.variant,
        category: v.category,
        subCategory: v.subCategory,

        unitWeightKg: v.unitWeightKg,
        unitWeightG:
          v.unitWeightKg == null ? null : Math.round(Number(v.unitWeightKg) * 1000),

        date: v.date,
        drawer: v.drawer || undefined,
        control: v.control || undefined,
        scale: v.scale || undefined,
        outerSizeMm: v.outerSizeMm ?? undefined,
        sectionMm2: v.sectionMm2 ?? undefined,
        tempCode: v.tempCode ?? null,
        manufacturerCode: v.manufacturerCode ?? null,
        image: v.image || null,
        hasCustomerMold: customerMoldToBoolean(v.customerMold),
        availability: v.availability ?? true,
        file: v.file ?? null,
        description: v.description || null,
      } as unknown as Parameters<typeof createProduct>[0];

      await createProduct(payload);

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
      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2} alignItems="stretch">
            <Grid size={{ xs: 12, md: 9 }}>
              <ProductFormFields
                methods={methods}
                dicts={dicts}
                showFileSection
                dir={draftDirRef.current}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex' }}>
              <NotesField />
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
