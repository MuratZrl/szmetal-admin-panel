'use client';
// src/features/products/components/form/sections/meta/CodeFields.client.tsx

import * as React from 'react';

import { Grid, TextField } from '@mui/material';
import { useFormContext } from 'react-hook-form';

import type { ProductFormValues } from '@/features/products/components/form/forms/schema';

import {
  PRODUCT_FORM_MANUFACTURER_CODE_ID,
  PRODUCT_FORM_TEMP_CODE_ID,
} from '@/features/products/components/form/constants/constants';

type WithFileFields = { file: File | null };
type FormType = ProductFormValues & WithFileFields;

function toHelper(m: unknown): string | undefined {
  return typeof m === 'string' ? m : undefined;
}

export function CodeFields(): React.JSX.Element {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormType>();

  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          id={PRODUCT_FORM_MANUFACTURER_CODE_ID}
          label="Üretici Kodu"
          placeholder="Örn: Ü-512"
          {...register('manufacturerCode')}
          error={!!errors.manufacturerCode}
          helperText={toHelper(errors.manufacturerCode?.message)}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          id={PRODUCT_FORM_TEMP_CODE_ID}
          label="Geçici Kod"
          placeholder="Örn: GÇE-001"
          {...register('tempCode')}
          error={!!errors.tempCode}
          helperText={toHelper(errors.tempCode?.message)}
        />
      </Grid>
    </>
  );
}
