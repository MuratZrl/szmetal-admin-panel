// src/features/products/components/form/ProductCreateForm.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { Paper, Box, Stack, Button } from '@mui/material';
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

// DİKKAT: doğru yol components/form
import ProductFormFields from '@/features/products/forms/ProductFormFields.client';

type Props = { dicts: ProductDicts };

// file alanını forma ekliyoruz; upload’u ProductFormFields setValue ile dolduruyor
type CreateValues = ProductFormValues & { file: File | null };

export default function ProductCreateForm({ dicts }: Props) {
  const router = useRouter();
  const { show } = useSnackbar();

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
      await createProduct({
        name: v.name,
        code: v.code,
        variant: v.variant,
        category: v.category,
        subCategory: v.subCategory,
        unitWeightG: v.unitWeightG,
        date: v.date,
        drawer: v.drawer || undefined,
        control: v.control || undefined,
        scale: v.scale || undefined,
        outerSizeMm: v.outerSizeMm ?? undefined,
        sectionMm2: v.sectionMm2 ?? undefined,
        tempCode: v.tempCode ?? null,
        profileCode: v.profileCode ?? null,
        manufacturerCode: v.manufacturerCode ?? null,
        image: v.image || null,
        hasCustomerMold: customerMoldToBoolean(v.customerMold),
        file: v.file ?? null,
      });

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
          {/* Tüm form alanları + dosya yükleme bölümü burada */}
          <ProductFormFields methods={methods} dicts={dicts} showFileSection />

          {/* Aksiyonlar */}
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => router.back()} disabled={isSubmitting}>
              İptal
            </Button>
            <Button type="submit" variant="contained" disabled={!isDirty || !isValid || isSubmitting}>
              Kaydet
            </Button>
          </Stack>
        </Box>
      </FormProvider>
    </Paper>
  );
}
