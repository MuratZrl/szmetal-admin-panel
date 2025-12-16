// src/features/products/components/form/sections/SpecsFields.client.tsx
'use client';

import * as React from 'react';

import { Grid } from '@mui/material';
import { useFormContext } from 'react-hook-form';

import NumberField from '@/features/products/components/form/NumberField.client';
import type { ProductFormValues } from '@/features/products/forms/schema';

type WithFileFields = { file: File | null };
type FormType = ProductFormValues & WithFileFields;

export function SpecsFields() {
  // FormProvider içinde olduğun için burada context'ten alıyoruz
  useFormContext<FormType>(); // sadece type güvenliği ve provider garantisi için

  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <NumberField<FormType, 'unitWeightG'>
          name="unitWeightG"
          label="Birim Ağırlık (gr/m)"
          required
          endAdornmentText="gr/m"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <NumberField<FormType, 'wallThicknessMm'>
          name="wallThicknessMm"
          label="Et Kalınlığı (mm)"
          endAdornmentText="mm"
          placeholder='3'
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <NumberField<FormType, 'sectionMm2'>
          name="sectionMm2"
          label="Kesit (mm²)"
          endAdornmentText="mm²"
          placeholder='537'
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <NumberField<FormType, 'outerSizeMm'>
          name="outerSizeMm"
          label="Dış Çevre (mm)"
          endAdornmentText="mm"
          placeholder='670'
        />
      </Grid>
    </>
  );
}
