// src/features/products/components/form/GeneralProductForm.client.tsx
'use client';

import { Box, Grid } from '@mui/material';

import { FormProvider, type UseFormReturn } from 'react-hook-form';

import type { ProductDicts } from '@/features/products/services/dicts.server';
import type { ProductFormValues } from '@/features/products/forms/schema';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/tr';

// ✅ Section Form Fields:
import { CategoryFields } from './sections/CategoryFields.client';
import { FileUploadField } from '@/features/products/components/form/sections/FileUploadField.client';
import { GeneralInfoFields } from './sections/GeneralInfoFields.client';
import { VariantFields } from './sections/VariantFields.client';
import { SpecsFields } from './sections/SpecsFields.client';
import { DatesFields } from './sections/DatesFields.client';
import { DrawingFields } from '@/features/products/components/form/sections/DrawingFields.client';
import { CodeFields } from '@/features/products/components/form/sections/CodeFields.client';

type WithFileFields = { file: File | null };
type FormType = ProductFormValues & WithFileFields;

type Props = {
  methods: UseFormReturn<FormType>;
  dicts: ProductDicts;
  showFileSection?: boolean;
  dir: string;
};

export default function GeneralProductForm({
  methods,
  dicts,
  showFileSection = true,
  dir,
}: Props) {
  return (
    <FormProvider {...methods}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
        <Box sx={{ mt: 0 }}>
          <Grid container spacing={2}>

            {/* 1) Code, Name, Custome Mold, Availability */}
            <GeneralInfoFields />

            {/* 2) Categories Inputs */}
            <CategoryFields dicts={dicts} />

            {/* 3) Variant Input */}
            <VariantFields variants={dicts?.variants ?? []} />

            {/* 4) Birim Ağırlığı, Et Kalınlığı, Kesit ve Dış Çevre Ölçüleri */}
            <SpecsFields />

            {/* 5) Çizim ve Revizyon Tarihleri */}
            <DatesFields />

            {/* 6) Çizen / Kontrol / Ölçek */}
            <DrawingFields />

            {/* 7) Manufacturer and Temporary Code Inputs */}
            <CodeFields />

            {/* 7) File Upload */}
            {showFileSection && <FileUploadField dir={dir} />}

          </Grid>
        </Box>
      </LocalizationProvider>
    </FormProvider>
  );
}
