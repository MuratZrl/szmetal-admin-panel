// src/features/products/components/form/sections/meta/CodeFields.client.tsx
'use client';

import { Grid, TextField } from '@mui/material';
import { useFormContext } from 'react-hook-form';

import type { ProductFormValues } from '@/features/products/forms/schema';

type WithFileFields = { file: File | null };
type FormType = ProductFormValues & WithFileFields;

function toHelper(m: unknown): string | undefined {
  return typeof m === 'string' ? m : undefined;
}

export function CodeFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormType>();

  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="Üretici Kodu"
          placeholder="Örn: Ü-512"
          {...register('manufacturerCode')}
          error={!!errors.manufacturerCode}
          helperText={toHelper(errors.manufacturerCode?.message)}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
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
