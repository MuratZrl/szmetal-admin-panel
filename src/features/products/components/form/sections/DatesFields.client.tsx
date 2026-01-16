// src/features/products/components/form/sections/DatesFields.client.tsx
'use client';

import * as React from 'react';

import { Grid } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';

import type { ProductFormValues } from '@/features/products/components/form/forms/schema';

type WithFileFields = { file: File | null };
type FormType = ProductFormValues & WithFileFields;

function toHelper(m: unknown): string | undefined {
  return typeof m === 'string' ? m : undefined;
}

const toDayjs = (v: string | undefined | null): Dayjs | null => {
  if (!v) return null;
  const d = dayjs(v);
  return d.isValid() ? d : null;
};

const toIso = (d: Dayjs | null): string => (d ? d.format('YYYY-MM-DD') : '');

export function DatesFields(): React.JSX.Element {
  const {
    control,
    formState: { errors },
  } = useFormContext<FormType>();

  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Çizildiği Tarih"
              format="DD/MM/YY"
              value={toDayjs(field.value)}
              onChange={(v) => field.onChange(toIso(v))}
              slotProps={{
                textField: {
                  id: 'product-form-date',
                  required: true,
                  fullWidth: true,
                  size: 'small',
                  InputLabelProps: { shrink: true },
                  error: !!errors.date,
                  helperText: toHelper(errors.date?.message),
                  placeholder: 'YYYY-MM-DD',
                },
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="revisionDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Revizyon Tarihi"
              format="DD/MM/YY"
              value={toDayjs(field.value)}
              onChange={(v) => field.onChange(toIso(v))}
              slotProps={{
                textField: {
                  id: 'product-form-revision-date',
                  fullWidth: true,
                  size: 'small',
                  InputLabelProps: { shrink: true },
                  error: !!errors.revisionDate,
                  helperText: toHelper(errors.revisionDate?.message),
                  placeholder: 'YYYY-MM-DD',
                },
              }}
            />
          )}
        />
      </Grid>
    </>
  );
}
