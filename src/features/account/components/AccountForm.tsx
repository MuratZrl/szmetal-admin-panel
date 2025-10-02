// src/features/account/AccountForm.tsx
'use client';

import React, { useEffect } from 'react';
import { Box, Grid, TextField, Button, FormControl, MenuItem, Typography } from '@mui/material';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Asserts } from 'yup';
import { accountSchema } from '@/constants/account/form-validations/accountSchemas';
import { countries } from '@/constants/data/countries';
import type { UserData } from '../hooks/useAccount';
import { useAccount } from '../hooks/useAccount';

type FormValues = Asserts<typeof accountSchema>;

export default function AccountForm({
  userData,
  setUserData,
  onEmailChange,
}: {
  userData: UserData;
  setUserData: (u: UserData) => void;
  onEmailChange?: (email: string) => Promise<void>;
}) {
  const { updateProfile, changeEmail } = useAccount(); // ← hook API
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<FormValues>({
    resolver: yupResolver(accountSchema) as unknown as Resolver<FormValues>,
    mode: 'onChange',
    defaultValues: {
      username: userData?.username ?? '',
      phone: userData?.phone ?? '',
      company: userData?.company ?? '',
      country: userData?.country ?? '',
    },
  });

  useEffect(() => {
    reset({
      username: userData?.username ?? '',
      phone: userData?.phone ?? '',
      company: userData?.company ?? '',
      country: userData?.country ?? '',
    });
  }, [userData, reset]);

  const onSubmit = async (data: FormValues) => {
    const res = await updateProfile({
      username: data.username,
      phone: data.phone ?? null,
      company: data.company ?? null,
      country: data.country ?? null,
    });
    // local state senkronizasyonuna devam etmek istiyorsan:
    if (res.ok) {
      setUserData({
        ...userData,
        username: data.username,
        phone: data.phone ?? null,
        company: data.company ?? null,
        country: data.country ?? null,
      });
    }
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit(onSubmit)} 
      sx={(t) => ({ 
        mt: 2, 
        p: 2, 
        borderRadius: 2, 
        border: `1px solid ${t.palette.divider}`, 
        bgcolor: 'background.paper' })}
      >
      <Typography fontSize={14} fontWeight={600} pb={2} gutterBottom color="text.secondary">
        Kişisel Bilgiler
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            required
            fullWidth
            label="Kullanıcı Adı"
            variant="outlined"
            {...register('username')}
            helperText={errors.username?.message}
            error={!!errors.username}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch' }}>
            <TextField
              required
              fullWidth
              size="small"
              label="E-Posta"
              value={userData?.email ?? ''}
              disabled
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => (onEmailChange ? onEmailChange(userData.email ?? '') : changeEmail(userData.email ?? ''))}
              sx={{ 
                px: 2,
                borderRadius: 1, 
                whiteSpace: 'nowrap', 
                alignSelf: 'stretch', 
                textTransform: 'capitalize' 
              }}
            >
              Email Değiştir
            </Button>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Telefon"
            variant="outlined"
            {...register('phone')}
            helperText={errors.phone?.message}
            error={!!errors.phone}
            inputProps={{ maxLength: 11 }}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Şirket"
            variant="outlined"
            {...register('company')}
            helperText={errors.company?.message}
            error={!!errors.company}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <TextField
              select
              label="Ülke Seçimi"
              variant="outlined"
              value={watch('country') || ''}
              {...register('country')}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">
                <em>Ülke Seçimi</em>
              </MenuItem>
              {countries.map((c) => (
                <MenuItem key={c.code} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        </Grid>
      </Grid>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button type="submit" variant="contained" color="primary" disabled={!isDirty || !isValid} disableElevation sx={(t) => ({ py: 1, px: 3.25, borderRadius: t.shape.borderRadius })}>
          Kaydet
        </Button>
      </Box>
    </Box>
  );
}
