// src/features/products/components/form/sections/GeneralInfoFields.client.tsx
'use client';

import * as React from 'react';

import { Grid, MenuItem, TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import type { ProductFormValues } from '@/features/products/forms/schema';

type WithFileFields = { file: File | null };
type FormType = ProductFormValues & WithFileFields;

function toHelper(m: unknown): string | undefined {
  return typeof m === 'string' ? m : undefined;
}

export function GeneralInfoFields() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<FormType>();

  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="Kod"
          fullWidth
          required
          placeholder="Örn: T.3152"
          {...register('code')}
          error={!!errors.code}
          helperText={toHelper(errors.code?.message)}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="Ad"
          fullWidth
          required
          placeholder="Örn: Motor Kutusu Profili"
          {...register('name')}
          error={!!errors.name}
          helperText={toHelper(errors.name?.message)}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="customerMold"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Müşteri Kalıbı"
              fullWidth
              required
              size="small"
              InputLabelProps={{ shrink: true }}
              error={!!errors.customerMold}
              helperText={toHelper(errors.customerMold?.message)}
            >
              <MenuItem value="Evet">Evet</MenuItem>
              <MenuItem value="Hayır">Hayır</MenuItem>
            </TextField>
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="availability"
          control={control}
          render={({ field }) => (
            <TextField
              select
              fullWidth
              required
              size="small"
              label="Kullanılabilirlik Durumu"
              value={String(field.value)}
              onChange={(e) => field.onChange(e.target.value === 'true')}
              InputLabelProps={{ shrink: true }}
              SelectProps={{
                renderValue: (v) => (v === 'true' ? 'Kullanılabilir' : 'Kullanılamaz'),
              }}
              error={!!errors.availability}
              helperText={toHelper(errors.availability?.message)}
            >
              <MenuItem value="true">Kullanılabilir</MenuItem>
              <MenuItem value="false">Kullanılamaz</MenuItem>
            </TextField>
          )}
        />
      </Grid>
    </>
  );
}
