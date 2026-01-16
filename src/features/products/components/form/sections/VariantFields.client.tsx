// src/features/products/components/form/sections/VariantFields.client.tsx
'use client';

import * as React from 'react';

import { Grid, MenuItem, TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import type { ProductFormValues } from '@/features/products/components/form/forms/schema';
import { DEFAULT_VARIANT_KEY } from '@/features/products/components/form/forms/schema';

import { PRODUCT_FORM_VARIANT_ID } from '@/features/products/components/form/constants/constants';

type WithFileFields = { file: File | null };
type FormType = ProductFormValues & WithFileFields;

type Variant = {
  key: string;
  name: string;
};

type Props = {
  variants: Variant[];
};

export function VariantFields({ variants }: Props): React.JSX.Element {
  const { control } = useFormContext<FormType>();

  const variantLabel = React.useCallback(
    (k: string): string => {
      if (k === DEFAULT_VARIANT_KEY) return 'Yok';
      return variants.find((v) => v.key === k)?.name ?? k;
    },
    [variants],
  );

  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Controller
        name="variant"
        control={control}
        render={({ field }) => {
          const v =
            typeof field.value === 'string' && field.value.trim()
              ? field.value
              : DEFAULT_VARIANT_KEY;

          return (
            <TextField
              id={PRODUCT_FORM_VARIANT_ID}
              select
              fullWidth
              label="Varyant"
              size="small"
              {...field}
              value={v}
              InputLabelProps={{ shrink: true }}
              SelectProps={{
                renderValue: (val) => variantLabel(String(val)),
              }}
            >
              <MenuItem value={DEFAULT_VARIANT_KEY}>Yok</MenuItem>

              {variants
                .filter((x) => x.key !== DEFAULT_VARIANT_KEY)
                .map((x) => (
                  <MenuItem key={x.key} value={x.key}>
                    {x.name}
                  </MenuItem>
                ))}
            </TextField>
          );
        }}
      />
    </Grid>
  );
}
