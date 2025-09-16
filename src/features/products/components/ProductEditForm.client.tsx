// src/features/products/components/form/ProductEditForm.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Paper, Box, Stack, Button } from '@mui/material';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';
import type { ProductDicts } from '@/features/products/services/dicts.server';
import { updateProduct, type UpdateProductInput } from '@/features/products/services/products.client';

import {
  productSchema,
  type ProductFormValues,
  type CustomerMoldSelect,
  customerMoldToBoolean,
} from '@/features/products/forms/schema';

// DİKKAT: Doğru yol components/form
import ProductFormFields from '@/features/products/forms/ProductFormFields.client';

// -----------------------------------------------------------------------------
// Tipler
// -----------------------------------------------------------------------------

// id’yi formdan çıkar. Form sadece düzenlenen alanları tutsun.
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

    drawer?: string | null;
    control?: string | null;
    scale?: string | null;
    outerSizeMm?: number | null;
    sectionMm2?: number | null;
    tempCode?: string | null;
    profileCode?: string | null;
    manufacturerCode?: string | null;
    image?: string | null;
  };
};

// boolean|null|undefined → '' | 'Evet' | 'Hayır'
function fromBoolToSelect(v: boolean | null | undefined): CustomerMoldSelect {
  if (v === true) return 'Evet';
  if (v === false) return 'Hayır';
  return '';
}

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
      typeof initial.unitWeightG === 'number' ? Math.round(initial.unitWeightG) : 0,
    
    customerMold:
      (initial.customerMold as CustomerMoldSelect | undefined) ??
      fromBoolToSelect(initial.hasCustomerMold ?? null),
    
    date: initial.date ?? new Date().toISOString().slice(0, 10),
    drawer: initial.drawer ?? '',
    control: initial.control ?? '',
    scale: initial.scale ?? '',
    outerSizeMm: initial.outerSizeMm ?? null,
    sectionMm2: initial.sectionMm2 ?? null,
    tempCode: initial.tempCode ?? null,
    profileCode: initial.profileCode ?? null,
    manufacturerCode: initial.manufacturerCode ?? null,
    image: initial.image ?? '',
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
    // initial değişmiyorsa dependency ile uğraşma
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  async function onSubmit(v: EditValues): Promise<void> {
    try {
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
        profileCode: v.profileCode ?? null,
        manufacturerCode: v.manufacturerCode ?? null,
        image: v.image || null,
        hasCustomerMold: customerMoldToBoolean(v.customerMold),
      };

      // id artık formda değil, props.initial.id’den al
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
          {/* Tüm alanlar + dosya yükleme */}
          <ProductFormFields methods={methods} dicts={dicts} showFileSection />

          {/* Aksiyonlar */}
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => router.back()} disabled={isSubmitting}>
              İptal
            </Button>
            <Button
              type="submit"
              variant="contained"
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
