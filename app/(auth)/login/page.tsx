'use client';

import Link from 'next/link';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

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

import { supabase } from '../../lib/supabase/supabaseClient';

export default function LoginPage() {

  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState< 'success' | 'error' >('success');

  // ******************************************************************************************

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // ******************************************************************************************

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ******************************************************************************************

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      showSnackbar('E-posta ve şifre gerekli.', 'error');
      return;
    }

    setLoading(true);

    try {
      // 🔐 Giriş yap
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (signInError) {
        if (signInError.message === 'Email not confirmed') {
          // ❗E-posta onaylanmamış: tekrar onay e-postası gönderelim
          await supabase.auth.signUp({
            email: form.email.trim().toLowerCase(),
            password: form.password,
          });

          showSnackbar(
            'E-posta adresiniz henüz doğrulanmamış. Yeni bir onay maili gönderildi.',
            'error'
          );
          return;
        }

        showSnackbar(`Giriş başarısız: ${signInError.message}`, 'error');
        return;
      }

      // 🧪 Kullanıcı bilgisi alınıyor
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        showSnackbar('Kullanıcı bilgisi alınamadı.', 'error');
        return;
      }

      showSnackbar('Giriş başarılı, yönlendiriliyorsunuz...', 'success');

      setTimeout(() => {
        router.refresh();
        router.push('/systems');
      }, 500);

    } catch (err) {
      console.error('Girişte beklenmeyen hata:', err);
      showSnackbar('Beklenmeyen bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ******************************************************************************************

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit} // 👈 ekledik
      sx={{
        display: 'flex',
        flexDirection: 'column',

        width: '70%',

        mx: 'auto',
      }}
    >

      <Card sx={{ width: '100%', p: 3, borderRadius: 0, boxShadow: 10 }}>

        {/* ******************************************************************************** */}

        <Typography variant='h5' fontWeight={600} mb={3} >
          Hemen Giriş Yapın
        </Typography>

        {/* ******************************************************************************** */}

        <Box display="flex" flexDirection="column" width='100%' gap={2}>

          <TextField
            label="E-posta"
            name="email" // 👈 Gerekli
            type="email"
            variant="outlined"

            value={form.email}
            onChange={handleChange}

            fullWidth
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
          />

          <TextField
            label="Şifre"
            name="password"
            type={showPassword ? 'text' : 'password'} // 👈 toggle
            variant="outlined"
            value={form.password}
            onChange={handleChange}
            fullWidth
            required
            InputProps={{
              sx: { borderRadius: 0 }, // 👈 buraya eklendi
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
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
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </Box>
        
        {/* ******************************************************************************** */}

        <Box display="flex" justifyContent="space-between" alignItems="center">

          <Typography textAlign="right" mt={3}>
            <Link href="/forgot-password" passHref>
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
                Şifremi unuttum
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
  );
}
