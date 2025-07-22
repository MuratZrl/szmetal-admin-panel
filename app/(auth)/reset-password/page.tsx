'use client';

import Link from 'next/link';

import { useState, useEffect } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  TextField,
  Typography,
  Box,
  Card,
  Button,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { supabase } from '../../lib/supabaseClient';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const accessToken = searchParams.get('access_token');

  const [sessionValid, setSessionValid] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const isPasswordValid = (password: string) => {
    const minLength = 8;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*]/.test(password);
    return (
      password.length >= minLength &&
      hasLower &&
      hasUpper &&
      hasDigit &&
      hasSymbol
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid(form.password)) {
      showSnackbar(
        'Şifreniz en az 8 karakter, büyük harf, küçük harf, rakam ve sembol içermelidir.',
        'error'
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      showSnackbar('Şifreler uyuşmuyor.', 'error');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: form.password });

    if (error) {
      showSnackbar('Şifre sıfırlama başarısız: ' + error.message, 'error');
    } else {
      showSnackbar('Şifre başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...', 'success');
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    }

    setLoading(false);
  };

  useEffect(() => {
    const verifyTokenAndStartSession = async () => {
      if (!accessToken) {
        showSnackbar('Bağlantı geçersiz veya eksik.', 'error');
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(accessToken);

      if (error) {
        showSnackbar('Bağlantı süresi dolmuş veya geçersiz.', 'error');
      } else {
        setSessionValid(true);
      }
    };

    verifyTokenAndStartSession();
  }, [accessToken]);

  return (
    <>

      {sessionValid ? (

        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '70%',
            mx: 'auto',
          }}
        >
          <Card sx={{ width: '100%', p: 3, borderRadius: 0 }}>
            <Typography variant='h5' fontWeight={600} mb={3}>
              Şifrenizi Sıfırlayın
            </Typography>

            <Box display="flex" flexDirection="column" width='100%' gap={2}>
              <TextField
                label="Şifre"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Şifre Tekrar"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowConfirmPassword} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ py: 1.25, textTransform: 'capitalize', borderRadius: 0, backgroundColor: 'orangered' }}
              >
                {loading ? 'Kaydet...' : 'Sıfırla'}
              </Button>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography textAlign="right" mt={3}>
                <Link href="/login" passHref>
                  <Typography
                    component="span"
                    color="primary"
                    fontStyle="italic"
                    fontWeight={500}
                    sx={{
                      cursor: 'pointer',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Şifremi hatırladım
                  </Typography>
                </Link>
              </Typography>

              <Typography textAlign="right" mt={3}>
                Hesabınız yoksa{' '}
                <Link href="/register" passHref>
                  <Typography
                    component="span"
                    color="primary"
                    fontStyle="italic"
                    fontWeight={500}
                    sx={{
                      cursor: 'pointer',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    kayıt olun
                  </Typography>
                </Link>
              </Typography>
            </Box>
          </Card>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity={snackbarSeverity}
              sx={{ width: '100%' }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>

      ) : (

        // TOKEN YOKSA veya SESSION BAŞLATILAMAZSA
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height="80vh"
          textAlign="center"
          px={2}
        >
          <Typography variant="h1" fontWeight="bold" color="error" fontSize={{ xs: 60, sm: 100 }}>
            404
          </Typography>

          <Typography variant="h5" fontWeight={600} mb={1}>
            Bağlantı geçersiz veya süresi dolmuş.
          </Typography>

          <Typography variant="body1" color="text.primary" mb={3}>
            Şifre sıfırlama bağlantınız geçersiz olabilir, süresi dolmuş olabilir ya da eksik parametre içeriyor olabilir.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            href="/forgot-password"
            sx={{ textTransform: 'capitalize', backgroundColor: 'orangered', borderRadius: 0, px: 4, py: 1.5 }}
          >
            Yeni bağlantı iste
          </Button>
        </Box>
      
      )}
    </>
  );
}
