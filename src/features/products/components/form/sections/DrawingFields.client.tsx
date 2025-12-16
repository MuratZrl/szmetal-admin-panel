// src/features/products/components/form/sections/meta/DrawingFields.client.tsx
'use client';

import { Grid, TextField } from '@mui/material';
import { useFormContext } from 'react-hook-form';

import type { ProductFormValues } from '@/features/products/forms/schema';

type WithFileFields = { file: File | null };
type FormType = ProductFormValues & WithFileFields;

function toHelper(m: unknown): string | undefined {
  return typeof m === 'string' ? m : undefined;
}

export function DrawingFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormType>();

  return (
    <>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="Çizen"
          placeholder="Örn: Sacit Zorlu"
          {...register('drawer')}
          error={!!errors.drawer}
          helperText={toHelper(errors.drawer?.message)}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="Kontrol"
          placeholder="Örn: Eyüp Güzel"
          {...register('control')}
          error={!!errors.control}
          helperText={toHelper(errors.control?.message)}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="Ölçek"
          placeholder="Örn: 2/1"
          {...register('scale')}
          error={!!errors.scale}
          helperText={toHelper(errors.scale?.message)}
        />
      </Grid>
      
    </>
  );
}
