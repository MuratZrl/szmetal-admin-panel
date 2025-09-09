'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Stack,
  CircularProgress,
} from '@mui/material';

import { FormConfig } from '@/features/create_request/types/step2Form';

// ✨ EKLE
import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';

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

  // 1) Boş form şablonu
  const emptyForm = React.useMemo<DraftData>(() => {
    return Object.fromEntries(formConfig.fields.map(f => [f.name, ''])) as DraftData;
  }, [formConfig.fields]);

  // 2) İlk state (draft varsa doldur)
  const initialState = React.useMemo<DraftData>(() => {

    if (!initialDraft) return emptyForm;
    
    const normalized: DraftData = { ...emptyForm };
    
    for (const key of Object.keys(emptyForm)) {
      const v = (initialDraft as Record<string, unknown>)[key];
      normalized[key] = v == null ? '' : String(v);
    }
    
    return normalized;
  
  }, [emptyForm, initialDraft]);

  const [form, setForm] = React.useState<DraftData>(initialState);
  const [, setFormKey] = React.useState<number>(0);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // 3) initialDraft veya fields değişince formu resetle + remount
  React.useEffect(() => {
    setForm(initialState);
    setFormKey(k => k + 1);
  }, [initialState]);

  // 4) Basit doğrulama
  const isValid = React.useMemo<boolean>(() => {
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

  const handleChange = (name: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [name]: e.target.value }));
    };

  const handleNext = async () => {
    if (!isValid) {
      show('Form doğrulaması başarısız. Lütfen alanları kontrol edin.', 'error');
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
        const body = await res.json().catch(() => ({} as Record<string, unknown>));
        throw new Error((body as { error?: string }).error ?? `Sunucudan beklenmeyen cevap: ${res.status}`);
      }
      show('Taslak kaydedildi. Yönlendiriliyorsunuz.', 'success');
      router.push(`/create_request/${slug}/step3`);
    } catch (err) {
      show((err as Error).message ?? 'Kayıt sırasında hata oluştu', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5) Tam sıfırlama (DB + local)
  const resetLocal = React.useCallback(() => {
    setForm(emptyForm);
    setFormKey(k => k + 1);
  }, [emptyForm]);    

  const handleResetAll = async () => {
    try {
      const res = await fetch('/api/systems/draft', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({} as Record<string, unknown>));
        throw new Error((body as { error?: string }).error ?? 'Taslak silinemedi');
      }
      resetLocal();
      show('Taslak temizlendi.', 'success');
    } catch (err) {
      show((err as Error).message, 'error');
    }
  };

  // 6) Geri gelince bfcache'ten yeniden mount olduğunda temizle
  React.useEffect(() => {
    const handler = (e: Event) => {
      if ((e as { persisted?: boolean }).persisted) {
        resetLocal();
      }
    };
    window.addEventListener('pageshow', handler as EventListener);
    return () => window.removeEventListener('pageshow', handler as EventListener);
  }, [resetLocal]);

  return (
    <Box 
      component="section" 
      sx={{ width: '100%', maxWidth: 750, mx: 'auto', py: { xs: 1.25, md: 3 } }}
    >
      
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
                  autoComplete='off'
                  minRows={3}
                  {...commonProps}
                />
              );
            }

            return (
              <TextField
                key={f.name}
                autoComplete='off'
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
              variant="text"
              color="inherit"
              onClick={handleResetAll}
              disabled={isSubmitting}
              sx={{ mr: { sm: 'auto' } }}
            >
              Formu Temizle
            </Button>

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
