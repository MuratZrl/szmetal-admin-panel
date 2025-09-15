// src/features/auth/LoginForm.client.tsx
'use client';

import * as React from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  TextField, Box, Button, IconButton, InputAdornment, Grid, Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';

import { glassTextFieldProps } from '../constants/formstyles';

export default function LoginForm() {
  const router = useRouter();
  const { show } = useSnackbar();

  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [form, setForm] = React.useState<{ email: string; password: string }>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      show('E-posta ve şifre gerekli.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      if (res.status === 403) {
        // Banned
        router.replace('/unauthorized');
        return;
      }
      if (res.status === 409) {
        // E-posta doğrulanmamış
        show('E-posta doğrulanmamış. Lütfen e-postanı doğrula.', 'error');
        return;
      }
      if (res.status === 401) {
        show('E-posta veya şifre hatalı.', 'error');
        return;
      }
      if (!res.ok) {
        const msg = (await res.json().catch(() => null))?.error ?? 'Giriş başarısız.';
        show(String(msg), 'error');
        return;
      }

      show('Giriş başarılı, yönlendiriliyorsunuz...', 'success');
      router.replace('/account');
    } catch (err) {
      console.error('Girişte beklenmeyen hata:', err);
      show('Beklenmeyen bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
      <Grid container spacing={2} >
        <Grid size={{ xs: 12, sm: 12, md: 12 }} >
          <TextField
            label="E-posta"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            {...glassTextFieldProps}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 12 }}>
          <TextField
            label="Şifre"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
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
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: (theme) => ({
                ...(typeof glassTextFieldProps.InputProps?.sx === 'function'
                  ? glassTextFieldProps.InputProps.sx(theme)
                  : (glassTextFieldProps.InputProps?.sx ?? {})),
              }),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 12 }}>
          <Button
            type="submit"
            variant="outlined"
            color="primary"
            fullWidth
            disabled={loading}
            sx={(t) => ({
              py: 1.25,
              textTransform: 'capitalize',
              borderRadius: 7,
              borderColor: t.palette.divider,
              color: t.palette.text.primary,
            })}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography color="text.secondary">
            <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
              <Typography
                component="span"
                sx={{
                  color: 'primary.main',
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

        <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Typography color="text.secondary">
            Hesabınız yoksa{' '}
            <Link href="/register" style={{ textDecoration: 'none' }}>
              <Typography
                component="span"
                sx={{
                  color: 'primary.main',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                kayıt olun
              </Typography>
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
