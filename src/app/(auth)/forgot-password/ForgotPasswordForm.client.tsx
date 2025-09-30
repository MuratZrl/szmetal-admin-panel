'use client';

import * as React from 'react';

import Link from 'next/link';

import {
  Box,
  Grid,
  Button,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import { MailOutline } from '@mui/icons-material';

import { supabase } from '@/lib/supabase/supabaseClient';

import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';

import { glassTextFieldProps } from '../constants/formstyles';
import type { SxProps, Theme } from '@mui/material/styles';
import { mergeSx } from '@/utils/mergeSx';

export default function ForgotPasswordForm() {
  const { show } = useSnackbar();
  const [email, setEmail] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      show('Lütfen geçerli bir e-posta adresi girin.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Client ortamında site URL’i almak için env yoksa origin’e düş
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ??
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: `${siteUrl}/reset-password`,
      });

      if (error) {
        show(error.message, 'error');
        return;
      }

      show('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.', 'success');
    } catch {
      show('Beklenmeyen bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Var olan sx’i güvenle genişlet
  const baseSx = glassTextFieldProps.InputProps?.sx as SxProps<Theme> | undefined;
  const extendedSx: SxProps<Theme> = mergeSx(baseSx, { borderRadius: 5 });

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="E-posta"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            {...glassTextFieldProps}
            InputProps={{
              ...(glassTextFieldProps.InputProps ?? {}),
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutline />
                </InputAdornment>
              ),
              sx: extendedSx, // ← tek satır, tertemiz
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
            {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
          </Button>
        </Grid>

        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'space-between' }} >
          <Typography>
            <Link href="/login" style={{ textDecoration: 'none' }} >
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
                Giriş yapın
              </Typography>
            </Link>
          </Typography>

          <Typography >
            Hesabınız yoksa{' '}
            <Link href="/register" style={{ textDecoration: 'none' }} >
              <Typography
                component="span"
                fontStyle="italic"
                fontWeight={500}
                sx={{ color: 'primary.main', cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
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
