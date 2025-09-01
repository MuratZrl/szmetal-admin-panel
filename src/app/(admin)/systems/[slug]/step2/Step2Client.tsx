'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';

type FieldType = 'text' | 'number' | 'textarea' | 'date';

export type FormField = {
  name: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  helperText?: string;
};

export type FormConfig = {
  fields: FormField[];
};

export type DraftData = Record<string, string>;

/** Props tipi — hiçbir yerde `any` yok */
type Step2ClientProps = {
  formConfig: FormConfig;
  initialDraft?: DraftData | null;
  slug: string;
};

export default function Step2Client({ formConfig, initialDraft = null, slug }: Step2ClientProps) {
  const router = useRouter();

  // Başlangıç form state'ini güvenli tiplerle hazırla
  const initialState: DraftData = useMemo(() => {
    if (initialDraft) return initialDraft;
    const entries = formConfig.fields.map((f) => [f.name, ''] as [string, string]);
    return Object.fromEntries(entries);
  }, [formConfig.fields, initialDraft]);

  const [form, setForm] = useState<DraftData>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({
    open: false,
    severity: 'success',
    message: '',
  });

  // Basit doğrulama: required ve sayısal min/max kontrolleri
  const isValid = useMemo(() => {
    for (const field of formConfig.fields) {
      const value = form[field.name] ?? '';

      if (field.required && value.trim() === '') return false;

      if (field.type === 'number' && value !== '') {
        const num = Number(value);
        if (Number.isNaN(num)) return false;
        if (field.min !== undefined && num < field.min) return false;
        if (field.max !== undefined && num > field.max) return false;
      }
    }
    return true;
  }, [form, formConfig.fields]);

  const handleChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const handleNext = async () => {
    if (!isValid) {
      setSnackbar({ open: true, severity: 'error', message: 'Form doğrulaması başarısız. Lütfen alanları kontrol edin.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/systems/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, form }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Sunucudan beklenmeyen cevap: ${res.status}`);
      }

      setSnackbar({ open: true, severity: 'success', message: 'Taslak kaydedildi. İleriye yönlendiriliyorsunuz.' });
      setTimeout(() => router.push(`/systems/${slug}/step3`), 500);
    } catch (err) {
      console.error('draft save error', err);
      setSnackbar({ open: true, severity: 'error', message: (err as Error).message ?? 'Kayıt sırasında hata oluştu' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="section" sx={{ width: '100%', maxWidth: 900, mx: 'auto', py: { xs: 1, md: 3 } }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleNext();
        }}
        noValidate
      >
        <Stack spacing={2}>

          {formConfig.fields.map((f) => {
            const value = form[f.name] ?? '';
            const isNumber = f.type === 'number';

            const commonProps = {
              label: f.label,
              name: f.name,
              value,
              placeholder: f.placeholder ?? '',
              onChange: handleChange(f.name),
              required: !!f.required,
              helperText: f.helperText ?? undefined,
              fullWidth: true,
            };

            if (f.type === 'textarea') {
              return (
                <TextField
                  key={f.name}
                  multiline
                  minRows={3}
                  {...commonProps}
                />
              );
            }

            return (
              <TextField
                key={f.name}
                {...commonProps}
                type={isNumber ? 'number' : (f.type ?? 'text')}
                inputProps={
                  isNumber
                    ? {
                        inputMode: 'numeric',
                        min: f.min,
                        max: f.max,
                      }
                    : undefined
                }
              />
            );
          })}


          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => router.push('/systems')}
              disabled={isSubmitting}
              sx={{ flex: { xs: '1 1 auto', sm: '0 0 auto' } }}
            >
              Geri
            </Button>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting || !isValid}
              sx={{ flex: { xs: '1 1 auto', sm: '0 0 auto' } }}
            >
              {isSubmitting ? <CircularProgress size={20} /> : 'İleri'}
            </Button>
          </Box>
        </Stack>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
