'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  TextField,
  Typography,
  Box,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';

import AuthCard from '../components/layout/AuthCard';

import { commonTextFieldProps } from '../_constants_/formstyles';

import { supabase } from '../../../lib/supabase/supabaseClient';

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
        width: '75%',
        mx: 'auto',
      }}
    >
      <AuthCard>

        <Typography 
          variant='h5' 

          color='white'
          fontWeight={600} 
          mb={1}
        >
          Kendi E-posta Adresinizi Giriniz
        </Typography>

        <Typography 
          variant='subtitle1'
        
          color='white'
          mb={3}
        >
          E-posta adresinize sıfırlama linki gönderebilmek için lütfen e-posta bilginizi giriniz.
        </Typography>

        <Box display="flex" flexDirection="column" width='100%' gap={2}>
          <TextField
            fullWidth
            label="E-posta"
            type="email"
            variant="outlined"
            onChange={(e) => setEmail(e.target.value)}
            required

            {...commonTextFieldProps}
            InputProps={{
              ...commonTextFieldProps.InputProps,
              sx: {
                ...commonTextFieldProps.InputProps?.sx,
                borderRadius: 5, // özel stilinle birleştirildi
              },
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="outlined"
            color="primary"

            onClick={handleResetPassword}
            sx={{ py: 1.25, textTransform: 'capitalize', borderRadius: 7, borderColor: 'white', color: 'white' }}
          >
            {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
          </Button>
        </Box>

        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <Typography textAlign="right" mt={3}>
            <Link href="/login" passHref>
              <Typography component="span" color="white" fontStyle='italic' fontWeight={500}
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

          <Typography 
            textAlign="right" 

            color='lightblue'
            mt={3}
          >
            Hesabınız yoksa{' '}

            <Link href="/register" passHref>
              <Typography component="span" color="white" fontStyle='italic' fontWeight={500}
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

      </AuthCard>

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
