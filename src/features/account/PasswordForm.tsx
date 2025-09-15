// src/features/account/PasswordForm.tsx
'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Box, Grid, TextField, Button, InputAdornment, IconButton, Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Asserts } from 'yup';

import { passwordSchema } from '@/constants/account/form-validations/passwordSchemas';
import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';
import { supabase } from '@/lib/supabase/supabaseClient';

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

  const onSubmit = async (data: PasswordFormValues) => {
    const { currentPassword, newPassword } = data;

    try {
      // 1) oturumdan e-posta al
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        show('Oturum bulunamadı. Lütfen tekrar giriş yapın.', 'error');
        return;
      }

      // 2) mevcut şifreyi doğrula
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword ?? '',
      });

      if (signInError) {
        show('Mevcut şifreniz hatalı. Lütfen kontrol edip tekrar deneyin.', 'error');
        return;
      }

      // 3) yeni şifreyi güncelle
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword ?? '',
      });

      if (updateError) {
        const msg = updateError.message ?? '';
        if (msg.includes('Password should contain') || msg.includes('contains')) {
          show('Yeni şifre: en az bir büyük harf, bir küçük harf, bir sayı ve bir özel karakter içermelidir.', 'error');
        } else if (msg.includes('minimum')) {
          show('Yeni şifre çok kısa. Daha güçlü bir şifre deneyin.', 'error');
        } else {
          show('Şifre güncellenemedi. Lütfen tekrar deneyin.', 'error');
        }
        return;
      }

      show('Şifreniz başarıyla güncellendi.', 'success');
      reset();
    } catch (err) {
      console.error('Şifre değiştirme hatası:', err);
      show('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.', 'error');
    }
  };

  return (
    <Box
      sx={(t) => ({
        mt: 4,
        // İstersen şık bir kart hissi:
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
                    <IconButton
                      onClick={() => setShowCurrent((s) => !s)}
                      edge="end"
                      aria-label="Mevcut şifreyi göster/gizle"
                    >
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
                    <IconButton
                      onClick={() => setShowNew((s) => !s)}
                      edge="end"
                      aria-label="Yeni şifreyi göster/gizle"
                    >
                      {showNew ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button
            type="submit"
            variant="contained"          // outlined da olur; keyfi değil, tema kararı
            color="primary"              // sabit orangered YOK
            disabled={!isDirty || !isValid || isSubmitting}
            disableElevation
            sx={(t) => ({
              px: 3,
              py: 1,
              borderRadius: t.shape.borderRadius,
              textTransform: 'capitalize',
            })}
          >
            {isSubmitting ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
