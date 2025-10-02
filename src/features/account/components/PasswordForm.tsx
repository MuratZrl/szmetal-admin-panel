// src/features/account/PasswordForm.tsx
'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Box, Grid, TextField, Button, InputAdornment, IconButton, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Asserts } from 'yup';

import { passwordSchema } from '@/constants/account/form-validations/passwordSchemas';
import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';
import { changePasswordAction } from '@/features/account/actions';

type PasswordFormValues = Asserts<typeof passwordSchema>;

export default function PasswordForm() {
  const { show } = useSnackbar();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: yupResolver(passwordSchema) as unknown as Resolver<PasswordFormValues>,
    mode: 'onChange',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Hesabı kapat diyaloğu state
  const [closeOpen, setCloseOpen] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);
  const [confirmText, setConfirmText] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const confirmEnabled = confirmText.trim().toUpperCase() === 'SİL' && confirmPassword.length >= 1;

  const onSubmit = async (data: PasswordFormValues) => {
    const { currentPassword, newPassword } = data;
    const res = await changePasswordAction({
      currentPassword: currentPassword ?? '',
      newPassword: newPassword ?? '',
    });

    if (!res.ok) {
      // Sunucu mesajı ayrıntılı gelir
      show(res.message ?? 'Şifre güncellenemedi. Lütfen tekrar deneyin.', 'error');
      return;
    }

    show(res.message ?? 'Şifreniz başarıyla güncellendi.', 'success');
    reset();
  };

  // Kalıcı silme çağrısı (API’n zaten server’da)
  const handleCloseAccount = async () => {
    setCloseLoading(true);
    try {
      const res = await fetch('/api/account/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: confirmPassword, confirm: confirmText }),
      });

      if (res.ok) {
        show('Hesabınız kalıcı olarak kapatıldı.', 'success');
        // Cookie’yi server’da temizleyip login’e yönlendir
        window.location.assign('/api/logout?redirect=/login');
        return;
      }

      const payload = await res.json().catch(() => ({} as { error?: string }));
      const reason = payload?.error ?? 'unknown';
      if (res.status === 401 && reason === 'invalid_password') {
        show('Parola doğrulaması başarısız. Tekrar deneyin.', 'error');
      } else if (res.status === 400 && reason === 'confirm_required') {
        show('Onay alanına SİL yazmanız gerekiyor.', 'error');
      } else {
        show(`Hesap kapatma başarısız: ${String(reason)}`, 'error');
      }
    } catch (e) {
      console.error('close account error', e);
      show('Beklenmeyen bir hata oluştu.', 'error');
    } finally {
      setCloseLoading(false);
    }
  };

  return (
    <Box
      sx={(t) => ({
        mt: 4,
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: `1px solid ${t.palette.divider}`,
      })}
    >
      <Typography fontSize={14} fontWeight={600} pb={2} gutterBottom color="text.secondary">
        Şifreyi Güncelle
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type={showCurrent ? 'text' : 'password'}
              label="Mevcut Şifre"
              autoComplete="current-password"
              {...register('currentPassword')}
              helperText={errors.currentPassword?.message}
              error={!!errors.currentPassword}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrent((s) => !s)} edge="end" aria-label="Mevcut şifreyi göster/gizle">
                      {showCurrent ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type={showNew ? 'text' : 'password'}
              label="Yeni Şifre"
              autoComplete="new-password"
              {...register('newPassword')}
              helperText={errors.newPassword?.message}
              error={!!errors.newPassword}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNew((s) => !s)} edge="end" aria-label="Yeni şifreyi göster/gizle">
                      {showNew ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        <Box mt={3} display="flex" justifyContent="space-between" gap={2}>
          <Button
            type="button"
            variant="outlined"
            color="error"
            onClick={() => setCloseOpen(true)}
            sx={{ textTransform: 'capitalize' }}
          >
            Hesabı Kapat
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!isDirty || !isValid || isSubmitting}
            disableElevation
            sx={(t) => ({ px: 3, py: 1, borderRadius: t.shape.borderRadius, textTransform: 'capitalize' })}
          >
            {isSubmitting ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
          </Button>
        </Box>
      </form>

      <Dialog open={closeOpen} onClose={() => !closeLoading && setCloseOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Hesabı Kapat</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Bu işlem geri alınamaz. Devam etmek için aşağıya <b>SİL</b> yazın ve parolanızı girin.
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Onay"
                placeholder="SİL"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="password"
                label="Parola"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="current-password"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCloseOpen(false)} disabled={closeLoading} sx={{ textTransform: 'capitalize' }}>
            Vazgeç
          </Button>
          <Button
            onClick={handleCloseAccount}
            disabled={!confirmEnabled || closeLoading}
            variant="contained"
            color="error"
            sx={{ textTransform: 'capitalize' }}
          >
            {closeLoading ? 'Kapatılıyor...' : 'Kalıcı Olarak Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
