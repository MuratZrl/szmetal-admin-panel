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

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

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

    // Şifre kuralı kontrolü
    if (!isPasswordValid(form.password)) {
      showSnackbar(
        'Şifreniz en az 8 karakter, büyük harf, küçük harf, rakam ve sembol içermelidir.',
        'error'
      );
      return;
    }

    // Şifre tekrar kontrolü
    if (form.password !== form.confirmPassword) {
      showSnackbar('Şifreler uyuşmuyor.', 'error');
      return;
    }

    setLoading(true);

    // Supabase signup
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/login` // 👈 Doğrulama sonrası buraya gider
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('User already registered')) {
        showSnackbar('Bu e-posta adresi zaten kullanılıyor.', 'error');
      } else {
        showSnackbar(signUpError.message, 'error');
      }
      setLoading(false);
      return;
    }

    const user = data.user;

    if (!user) {
      showSnackbar("Kayıt başarılı, ancak kullanıcı bilgisi alınamadı. Lütfen e-postanızı doğrulayın.", "success");
      setLoading(false);
      return;
    }

    if (user) {
      const { error: insertError } = await supabase.from('users').insert({
        id: user.id,
        email: form.email,
        username: form.username,
        role: 'user',
        image: null,         // opsiyonel, ama tabloya uygun olmalı
        status: 'active',    // default olabilir ama yazmak iyi olur
      });

      if (insertError) {
        showSnackbar('Kullanıcı oluşturuldu ancak profil verisi eklenemedi.', 'error');
      } else {
        showSnackbar('Kayıt başarılı! Lütfen e-posta adresinizi onaylayın.', 'success');
        router.push('/login');
      }
    }

    setLoading(false);
  };

{/* **************************************************************************************************************************************************************** */}

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      sx={{
        display: 'flex',
        flexDirection: 'column',

        width: '70%',

        mx: 'auto',
      }}
    >

      <Card sx={{ width: '100%', p: 3, borderRadius: 0 }}>

        {/* ******************************************************************************** */}

        <Typography variant='h5' fontWeight={600} mb={3} >
          Hemen Kayıt Olun
        </Typography>

        {/* ******************************************************************************** */}

        <Box display="flex" flexDirection="column" width='100%' gap={2}>

          <TextField
            label="Kullanıcı adı"
            type='text'
            name="username"

            value={form.username}
            onChange={handleChange}

            variant='outlined'
            fullWidth
            required
          />
                    
          <TextField
            label="E-posta"
            type="email"
            name='email'

            value={form.email}
            onChange={handleChange}

            variant="outlined"
            fullWidth
            required
          />

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
            inputProps={{
              onPaste: (e) => e.preventDefault(), // Yapıştırmayı engeller
              onCopy: (e) => e.preventDefault(),  // Kopyalamayı da engellemek istersen
              onCut: (e) => e.preventDefault(), // Kesme işlemi de engellenebilir
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
            inputProps={{
              onPaste: (e) => e.preventDefault(), // Yapıştırmayı engeller
              onCopy: (e) => e.preventDefault(),  // Kopyalamayı da engellemek istersen
              onCut: (e) => e.preventDefault(), // Kesme işlemi de engellenebilir
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
            {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
          </Button>
          
        </Box>
        
        {/* ******************************************************************************** */}

        <Box display={'flex'} justifyContent={'end'} alignItems={'center'}>

          <Typography textAlign="right" mt={3}>
            Hesabınız varsa{' '}
            <Link href="/login" passHref>
              <Typography component="span" color="primary" fontStyle='italic' fontWeight={500}                 
                sx={{
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Giriş yapın
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
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </Box>
  );
}
