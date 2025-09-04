'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Stack,
  CircularProgress,
} from '@mui/material';

// ✨ EKLE
import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';

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
  initialDraft?: Record<string, unknown> | null;  // ← gevşet
  slug: string;
};

export default function Step2Client({ formConfig, initialDraft = null, slug }: Step2ClientProps) {
  const router = useRouter();
  const { show } = useSnackbar(); // ✨ buradan bildirim atacağız

  // Başlangıç form state'ini güvenli tiplerle hazırla
  const initialState: DraftData = useMemo(() => {
    const base = Object.fromEntries(formConfig.fields.map(f => [f.name, ''])) as DraftData;
    if (!initialDraft) return base;

    const normalized: DraftData = { ...base };
    for (const key of Object.keys(base)) {
      const v = (initialDraft as Record<string, unknown>)[key];
      normalized[key] = v == null ? '' : String(v);
    }
    return normalized;
  }, [formConfig.fields, initialDraft]);

  const [form, setForm] = useState<DraftData>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basit doğrulama: required ve sayısal min/max kontrolleri
  const isValid = useMemo(() => {
    for (const field of formConfig.fields) {
      const value = form[field.name] ?? '';
      const t = field.type ?? 'text';

      if (field.required && value.trim() === '') return false;

      if (t === 'number' && value !== '') {
        const num = Number(value);
        if (Number.isNaN(num)) return false;
        if (field.min !== undefined && num < field.min) return false;
        if (field.max !== undefined && num > field.max) return false;
      }

      if ((t === 'text' || t === 'textarea' || t === 'date') && value !== '') {
        if (field.min !== undefined && value.length < field.min) return false;
        if (field.max !== undefined && value.length > field.max) return false;
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
      show('Form doğrulaması başarısız. Lütfen alanları kontrol edin.', 'error'); // ✨
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

      show('Taslak kaydedildi. Yönlendiriliyorsunuz.', 'success'); // ✨
      router.push(`/create_request/${slug}/step3`);
    } catch (err) {
      console.error('draft save error', err);
      show((err as Error).message ?? 'Kayıt sırasında hata oluştu', 'error'); // ✨
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="section" sx={{ width: '100%', maxWidth: 1200, mx: 'auto', py: { xs: 1.25, md: 3 } }}>
      
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

          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: { md: 'space-between' },
              gap: 2, 
              mt: 2, 
              flexDirection: { xs: 'column', sm: 'row' },
              width: { md: '100%', lg: '100%' }
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => router.push('/create_request')}
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

    </Box>
  );
}
