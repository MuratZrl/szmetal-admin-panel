'use client';

import * as React from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Box,
  Grid,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import AuthCard from '../components/layout/AuthCard';
import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';
import { glassTextFieldProps } from '../constants/formstyles';
import type { SxProps, Theme } from '@mui/material/styles';
import { mergeSx } from '@/utils/mergeSx';

import { supabase } from '@/lib/supabase/supabaseClient';

type FormState = { password: string; confirmPassword: string };

export default function ResetPasswordClient() {
  const router = useRouter();
  const { show } = useSnackbar();

  const [sessionValid, setSessionValid] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [form, setForm] = React.useState<FormState>({ password: '', confirmPassword: '' });

  // Şifre kuralları
  const isPasswordValid = (password: string) => {
    const minLength = 8;
    return (
      password.length >= minLength &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*]/.test(password)
    );
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // Supabase callback senaryoları: ?code=... veya #access_token=...&refresh_token=...
  React.useEffect(() => {
    const run = async () => {
      try {
        const search = new URLSearchParams(window.location.search);
        const code = search.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setSessionValid(true);
          return;
        }

        if (window.location.hash) {
          const hash = new URLSearchParams(window.location.hash.slice(1));
          const access_token = hash.get('access_token');
          const refresh_token = hash.get('refresh_token');

          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) throw error;
            setSessionValid(true);
            return;
          }
        }

        show('Bağlantı geçersiz veya eksik.', 'error');
      } catch {
        show('Bağlantı süresi dolmuş veya geçersiz.', 'error');
      }
    };
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid(form.password)) {
      show('Şifreniz en az 8 karakter, büyük/küçük harf, rakam ve sembol içermelidir.', 'error');
      return;
    }
    if (form.password !== form.confirmPassword) {
      show('Şifreler uyuşmuyor.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: form.password });
      if (error) throw error;

      show('Şifre güncellendi. Giriş sayfasına yönlendiriliyorsunuz...', 'success');
      router.replace('/login');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
      show(`Şifre sıfırlama başarısız: ${message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Varsayılan textfield cam efektini yumuşakça genişlet
  const baseSx = glassTextFieldProps.InputProps?.sx as SxProps<Theme> | undefined;
  const extendedSx: SxProps<Theme> = mergeSx(baseSx, { borderRadius: 5 });

  if (!sessionValid) {
    // Tema dostu 404 bloğu
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="80dvh"
        textAlign="center"
        px={2}
      >
        <Typography variant="h1" fontWeight={800} fontSize={{ xs: 60, sm: 100 }}>
          404
        </Typography>
        <Typography variant="h5" fontWeight={600} mb={1}>
          Bağlantı geçersiz veya süresi dolmuş.
        </Typography>
        <Typography variant="subtitle1" mb={3} color="text.secondary">
          Şifre sıfırlama bağlantınız geçersiz olabilir, süresi dolmuş olabilir ya da eksik parametre içeriyor olabilir.
        </Typography>
        <Button
          href="/"
          variant="outlined"
          sx={(t) => ({
            px: 3.25,
            py: 1.25,
            textTransform: 'capitalize',
            borderRadius: 7,
            borderColor: t.palette.divider,
            color: t.palette.text.primary,
          })}
        >
          Ana Sayfa
        </Button>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      onSubmit={onSubmit}
      sx={{ display: 'flex', flexDirection: 'column', width: '75%', mx: 'auto' }}
    >
      <AuthCard>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Şifrenizi Sıfırlayın
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Şifre"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={onChange}
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
                sx: extendedSx,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label="Şifre Tekrar"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={onChange}
              required
              {...glassTextFieldProps}
              InputProps={{
                ...(glassTextFieldProps.InputProps ?? {}),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: extendedSx,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
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
              {loading ? 'Kaydediliyor...' : 'Sıfırla'}
            </Button>
          </Grid>

          <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="text.secondary">
              <Link href="/login" style={{ textDecoration: 'none' }}>
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
                  Şifremi hatırladım
                </Typography>
              </Link>
            </Typography>

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
      </AuthCard>
    </Box>
  );
}
