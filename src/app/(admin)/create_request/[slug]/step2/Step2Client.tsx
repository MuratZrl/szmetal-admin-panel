'use client';
// app/(admin)/create_request/[slug]/step2/Step2Client.tsx

import * as React from 'react';
import { Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';
import type { FormConfig, FormField } from '@/features/create_request/types/step2Form';
import { submitStep2Action } from './actions';

type Step2ClientProps = {
  slug: string;
  formConfig: FormConfig;
  initialDraft: Record<string, unknown> | null;
};

function toInputValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

function fieldGridSize(field: FormField) {
  if (field.type === 'textarea') return { xs: 12 } as const;
  return { xs: 12, sm: 6 } as const;
}

function fieldInputProps(field: FormField) {
  if (field.type !== 'number') return undefined;
  return {
    ...(field.min !== undefined ? { min: field.min } : {}),
    ...(field.max !== undefined ? { max: field.max } : {}),
  };
}

export default function Step2Client({ slug, formConfig, initialDraft }: Step2ClientProps) {
  const submitAction = React.useMemo(() => submitStep2Action.bind(null, slug), [slug]);

  if (!formConfig.fields.length) {
    return (
      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Form alanı bulunamadı.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Sistem Bilgileri
      </Typography>

      <Box component="form" action={submitAction} noValidate>
        <Grid container spacing={2}>
          {formConfig.fields.map((field) => {
            const isTextarea = field.type === 'textarea';
            const inputType =
              field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text';

            return (
              <Grid key={field.name} size={fieldGridSize(field)}>
                <TextField
                  fullWidth
                  name={field.name}
                  label={field.label}
                  placeholder={field.placeholder}
                  required={field.required}
                  type={inputType}
                  multiline={isTextarea}
                  minRows={isTextarea ? 4 : undefined}
                  defaultValue={toInputValue(initialDraft?.[field.name])}
                  helperText={field.helperText}
                  InputLabelProps={{ shrink: true }}
                  inputProps={fieldInputProps(field)}
                />
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button type="submit" variant="contained">
            Kaydet ve Devam Et
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
