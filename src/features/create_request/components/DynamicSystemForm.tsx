// src/features/create_request/components/DynamicSystemForm.client.tsx
'use client';

import * as React from 'react';
import { Grid, TextField, Button, MenuItem, Stack, FormHelperText } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import type { SystemFormConfig, FormFieldConfig } from '@/features/create_request/types/step2Form';

type Props = { slug: string; config: SystemFormConfig };

function toYupField(f: FormFieldConfig) {
  if (f.type === 'number') {
    let s = yup
      .number()
      .transform((v, o) => (o === '' || Number.isNaN(v) ? undefined : v))
      .typeError('Sayı giriniz');
    if (typeof f.min === 'number') s = s.min(f.min, `${f.min} veya daha büyük olmalı`);
    if (typeof f.max === 'number') s = s.max(f.max, `${f.max} veya daha küçük olmalı`);
    if (f.required) s = s.required('Zorunlu alan');
    return s;
  }
  // string/select default
  let s = yup.string();
  if (f.required) s = s.required('Zorunlu alan');
  if (typeof f.min === 'number') s = s.min(f.min, `${f.min} karakter veya daha uzun olmalı`);
  if (typeof f.max === 'number') s = s.max(f.max, `${f.max} karakter veya daha kısa olmalı`);
  return s;
}

function makeSchema(cfg: SystemFormConfig) {
  const shape: Record<string, yup.AnySchema> = {};
  for (const f of cfg.fields) shape[f.name] = toYupField(f);
  return yup.object(shape);
}

export default function DynamicSystemForm({ config }: Props) {
  const schema = React.useMemo(() => makeSchema(config), [config]);
  const { control, handleSubmit, formState } = useForm<Record<string, unknown>>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = (values: Record<string, unknown>) => {
    // Burada talep oluşturma akışına bağla (Supabase insert vs.)
    // console.log({ slug, values });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        {config.fields.map((f) => (
          <Grid key={f.name} size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name={f.name}
              control={control}
              render={({ field, fieldState }) => {
                if (f.type === 'select' && f.options?.length) {
                  return (
                    <>
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label={f.label}
                        placeholder={f.placeholder}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message || f.helperText}
                      >
                        {f.options.map(opt => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                      </TextField>
                    </>
                  );
                }

                return (
                  <TextField
                    {...field}
                    type={f.type === 'number' ? 'number' : 'text'}
                    fullWidth
                    label={f.label}
                    placeholder={f.placeholder}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message || f.helperText}
                    inputProps={{
                      min: f.min,
                      max: f.max,
                    }}
                  />
                );
              }}
            />
          </Grid>
        ))}
      </Grid>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
        <Button type="submit" variant="contained" disabled={!formState.isValid}>
          Talebi Oluştur
        </Button>
        <FormHelperText sx={{ ml: { sm: 1 } }}>
          Tüm zorunlu alanları doldur.
        </FormHelperText>
      </Stack>
    </form>
  );
}
