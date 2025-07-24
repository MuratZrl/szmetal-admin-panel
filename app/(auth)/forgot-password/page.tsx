'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  TextField,
  Typography,
  Box,
  Card,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';

import { supabase } from '../../lib/supabase/supabaseClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleResetPassword = async () => {
    setLoading(true);
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showSnackbar('Lütfen geçerli bir e-posta adresi girin.', 'error');
      setLoading(false);
      return;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${siteUrl}/reset-password`,
    });

    if (error) {
      showSnackbar(error.message, 'error');
    } else {
      showSnackbar(
        'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
        'success'
      );
    }

    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleResetPassword()
  }

  return (
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
        <Typography variant='h5' fontWeight={600} mb={1}>
          Kendi E-posta Adresinizi Giriniz
        </Typography>

        <Typography mb={3}>
          E-posta adresinize sıfırlama linki gönderebilmek için lütfen e-posta bilginizi giriniz.
        </Typography>

        <Box display="flex" flexDirection="column" width='100%' gap={2}>
          <TextField
            label="E-posta"
            type="email"
            variant="outlined"
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleResetPassword}
            sx={{ py: 1.25, textTransform: 'capitalize', borderRadius: 0, backgroundColor: 'orangered' }}
          >
            {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
          </Button>
        </Box>

        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <Typography textAlign="right" mt={3}>
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

          <Typography textAlign="right" mt={3}>
            Hesabınız yoksa{' '}
            <Link href="/register" passHref>
              <Typography component="span" color="primary" fontStyle='italic' fontWeight={500}
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
        <Alert severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
