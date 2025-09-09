'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TextField, Box, Button, IconButton, InputAdornment, Grid, Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { supabase } from '@/lib/supabase/supabaseClient';
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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (signInError) {
        const msg = signInError.message?.toLowerCase() ?? '';
        if (msg.includes('email not confirmed')) {
          await supabase.auth.resend({ type: 'signup', email: form.email.trim().toLowerCase() });
          show('E-posta doğrulanmamış. Yeni doğrulama maili gönderildi.', 'error');
          return;
        }
        show(`Giriş başarısız: ${signInError.message}`, 'error');
        return;
      }

      show('Giriş başarılı, yönlendiriliyorsunuz...', 'success');
      router.refresh();
      router.push('/create_request');
    } catch (err) {
      console.error('Girişte beklenmeyen hata:', err);
      show('Beklenmeyen bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
      
      <Grid container spacing={2}>
      
        <Grid size={{ xs: 12, sm: 12, md: 12 }}>
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
                // alan bazlı küçük ekler gerekiyorsa buraya
              }),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 12 }} >
          <Button
            type="submit"
            variant="outlined"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ py: 1.25, textTransform: 'capitalize', borderRadius: 7, borderColor: 'white', color: 'white' }}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }} >
          <Typography>
            <Link href="/forgot-password">
              <Typography
                component="span"
                color="white"
                fontStyle="italic"
                fontWeight={500}
                sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Şifremi unuttum
              </Typography>
            </Link>
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}  sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Typography color="lightblue">
            Hesabınız yoksa{' '}
            <Link href="/register">
              <Typography
                component="span"
                color="white"
                fontStyle="italic"
                fontWeight={500}
                sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
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
