'use client';
// src/features/products/components/form/sections/SpecsFields.client.tsx

import * as React from 'react';

import { Grid } from '@mui/material';
import { useFormContext } from 'react-hook-form';

import NumberField from '@/features/products/components/form/NumberField.client';
import type { ProductFormValues } from '@/features/products/components/form/forms/schema';

import {
  PRODUCT_FORM_UNIT_WEIGHT_G_ID,
  PRODUCT_FORM_WALL_THICKNESS_MM_ID,
  PRODUCT_FORM_SECTION_MM2_ID,
  PRODUCT_FORM_OUTER_SIZE_MM_ID,
} from '@/features/products/components/form/constants/constants';

type WithFileFields = { file: File | null };
type FormType = ProductFormValues & WithFileFields;

export function SpecsFields(): React.JSX.Element {
  // Provider garantisi (runtime'da bir şey yapmıyor)
  useFormContext<FormType>();

  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <NumberField<FormType, 'unitWeightG'>
          id={PRODUCT_FORM_UNIT_WEIGHT_G_ID}
          name="unitWeightG"
          label="Birim Ağırlık (gr/m)"
          required
          endAdornmentText="gr/m"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <NumberField<FormType, 'wallThicknessMm'>
          id={PRODUCT_FORM_WALL_THICKNESS_MM_ID}
          name="wallThicknessMm"
          label="Et Kalınlığı (mm)"
          endAdornmentText="mm"
          placeholder="3"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <NumberField<FormType, 'sectionMm2'>
          id={PRODUCT_FORM_SECTION_MM2_ID}
          name="sectionMm2"
          label="Kesit (mm²)"
          endAdornmentText="mm²"
          placeholder="537"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <NumberField<FormType, 'outerSizeMm'>
          id={PRODUCT_FORM_OUTER_SIZE_MM_ID}
          name="outerSizeMm"
          label="Dış Çevre (mm)"
          endAdornmentText="mm"
          placeholder="670"
        />
      </Grid>
    </>
  );
}
