'use client';
// src/app/(auth)/reset-password/ResetPassword.client.tsx

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
  Alert,
  Stack,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { supabase } from '@/lib/supabase/supabaseClient';
import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';
import { glassTextFieldProps /* veya glassTextFieldPropsFlat */ } from '../constants/formstyles';

type FormState = { password: string; confirmPassword: string };
type LinkState = 'checking' | 'ok' | 'invalid';

export default function ResetPasswordForm() {
  const router = useRouter();
  const { show } = useSnackbar();

  const [linkState, setLinkState] = React.useState<LinkState>('checking');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState<FormState>({ password: '', confirmPassword: '' });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const isPasswordValid = (password: string) =>
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*]/.test(password);

  React.useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const search = new URLSearchParams(window.location.search);
        const code = search.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (active) setLinkState('ok');
          return;
        }

        if (window.location.hash) {
          const hash = new URLSearchParams(window.location.hash.slice(1));
          const access_token = hash.get('access_token');
          const refresh_token = hash.get('refresh_token');

          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) throw error;
            if (active) setLinkState('ok');
            return;
          }
        }

        if (active) setLinkState('invalid');
        show('Bağlantı geçersiz veya eksik.', 'error');
      } catch {
        if (active) setLinkState('invalid');
        show('Bağlantı süresi dolmuş veya geçersiz.', 'error');
      }
    };
    void run();
    return () => { active = false; };
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

  if (linkState === 'checking') {
    return <Typography color="text.secondary">Bağlantı doğrulanıyor...</Typography>;
  }

  if (linkState === 'invalid') {
    return (
      <Stack spacing={2}>
        <Alert severity="error">
          Bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir sıfırlama bağlantısı isteyin.
        </Alert>
        <Button
          component={Link}
          href="/forgot-password"
          variant="outlined"
          sx={(t) => ({
            py: 1.1,
            textTransform: 'capitalize',
            borderRadius: 7,
            borderColor: t.palette.divider,
            color: t.palette.text.primary,
            alignSelf: 'flex-start',
          })}
        >
          Sıfırlama Bağlantısı İste
        </Button>
      </Stack>
    );
  }

  const passwordAdornment = (shown: boolean, toggle: () => void) => (
    <InputAdornment position="end">
      <IconButton onMouseDown={(e) => e.preventDefault()} onClick={toggle} edge="end">
        {shown ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={onSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Şifre"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={onChange}
            required
            {...glassTextFieldProps /* düz köşe istiyorsan: glassTextFieldPropsFlat */}
            InputProps={{
              ...(glassTextFieldProps.InputProps ?? {}),
              endAdornment: passwordAdornment(showPassword, () => setShowPassword(s => !s)),
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
            {...glassTextFieldProps /* düz köşe istiyorsan: glassTextFieldPropsFlat */}
            InputProps={{
              ...(glassTextFieldProps.InputProps ?? {}),
              endAdornment: passwordAdornment(
                showConfirmPassword,
                () => setShowConfirmPassword(s => !s)
              ),
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

        <Grid size={{ xs: 12 }} sx={{ display: 'flex' }}>
          <Typography color="text.secondary">
            Hesabınız yoksa{' '}
            <Link href="/register" style={{ textDecoration: 'none' }}>
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
                kayıt olun
              </Typography>
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
