// src/features/auth/LoginForm.client.tsx
'use client';

import * as React from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  TextField,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Grid,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  object as yupObject,
  string as yupString,
  type InferType as YupInferType,
} from 'yup';

import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';
import { glassTextFieldProps } from '../constants/formstyles';

/* ---------------------------------- Schema --------------------------------- */

const schema = yupObject({
  email: yupString()
    .trim()
    .required('E-posta gerekli')
    .email('Geçerli bir e-posta girin'),
  password: yupString()
    .required('Şifre gerekli')
    .min(6, 'En az 6 karakter olmalı'),
});

type LoginValues = YupInferType<typeof schema>;

/* ---------------------------------- View ----------------------------------- */

export default function LoginForm() {
  const router = useRouter();
  const { show } = useSnackbar();

  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<LoginValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email.toLowerCase(),
          password: values.password,
        }),
      });

      // YENİ
      if (res.status === 403) {
        let key = 'forbidden';
        try {
          const data: { error?: string } = await res.json();
          key = data?.error ?? key;
        } catch { /* yut gitsin */ }

        if (key === 'banned') {
          show('Hesabınız engellenmiş. Lütfen yönetici ile iletişime geçin.', 'error');
        } else if (key === 'email_not_confirmed') {
          show('E-posta doğrulanmamış. Lütfen e-postanı doğrula.', 'error');
        } else {
          show('Erişim reddedildi.', 'error');
        }
        return;
      }

      if (res.status === 409) {
        show('E-posta doğrulanmamış. Lütfen e-postanı doğrula.', 'error');
        return;
      }

      if (res.status === 401) {
        show('E-posta veya şifre hatalı.', 'error');
        return;
      }
      
      if (!res.ok) {
        let reason = '';
        try {
          const data: { error?: string } = await res.json();
          reason = data?.error ?? '';
        } catch {
          /* swallow */
        }
        show(`Giriş başarısız (${res.status})${reason ? `: ${reason}` : ''}`, 'error');
        return;
      }

      show('Giriş başarılı, yönlendiriliyorsunuz...', 'success');
      router.replace('/account');
    } catch (err) {
      console.error('Girişte beklenmeyen hata:', err);
      show('Beklenmeyen bir hata oluştu.', 'error');
    }
  };

  const emailFieldError = errors.email?.message ?? '';
  const passwordFieldError = errors.password?.message ?? '';
  const disabled = isSubmitting || !isDirty || !isValid;

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>

        {/* E-posta */}
        <Grid size={{ xs: 12, sm: 12, md: 12 }}>
          <TextField
            {...register('email')}
            label="E-posta"
            name="email"
            type="email"
            autoComplete="email"
            helperText={emailFieldError}
            required
            {...glassTextFieldProps}
          />
        </Grid>

        {/* Şifre */}
        <Grid size={{ xs: 12, sm: 12, md: 12 }}>
          <TextField
            {...register('password')}
            label="Şifre"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            helperText={passwordFieldError}
            required
            {...glassTextFieldProps}
            InputProps={{
              ...(glassTextFieldProps.InputProps ?? {}),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    tabIndex={0}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Giriş butonu */}
        <Grid size={{ xs: 12, sm: 12, md: 12 }}>
          <Button
            type="submit"
            variant="outlined"
            color="primary"
            fullWidth
            disabled={disabled}
            startIcon={isSubmitting ? <CircularProgress size={18} /> : undefined}
            sx={(t) => ({
              py: 1.25,
              textTransform: 'capitalize',
              borderRadius: 1.15,
              borderColor: t.palette.text.primary,
              color: t.palette.text.primary,
            })}
          >
            {isSubmitting ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </Button>
        </Grid>

        {/* Alt bağlantılar */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography >
            <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
              <Typography
                component="span"
                sx={{
                  color: 'text.primary',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Şifremi unuttum
              </Typography>
            </Link>
          </Typography>
        </Grid>

      </Grid>
    </Box>
  );
}
