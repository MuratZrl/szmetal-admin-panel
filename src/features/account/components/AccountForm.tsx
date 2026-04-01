'use client';
// src/features/account/AccountForm.tsx

import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputAdornment,
  MenuItem,
  Typography,
} from '@mui/material';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
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
  const { updateProfile, changeEmail } = useAccount();

  const {
    register,
    handleSubmit,
    reset,
    control,
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

  const countryValue = useWatch({
    control,
    name: 'country',
    defaultValue: userData?.country ?? '',
  });

  const onSubmit = async (data: FormValues) => {
    const res = await updateProfile({
      username: data.username,
      phone: data.phone ?? null,
      company: data.company ?? null,
      country: data.country ?? null,
    });

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
        mt: 1.5,
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        border: `1px solid ${t.palette.divider}`,
        bgcolor: 'background.paper',
      })}
    >
      <Typography
        fontSize={13}
        fontWeight={600}
        mb={2}
        color="text.secondary"
      >
        Kişisel Bilgiler
      </Typography>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            id="account-username"
            required
            fullWidth
            size="small"
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
              id="account-email"
              required
              fullWidth
              size="small"
              label="E-Posta"
              value={userData?.email ?? ''}
              disabled
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="text"
              size="small"
              onClick={() =>
                onEmailChange
                  ? onEmailChange(userData.email ?? '')
                  : changeEmail(userData.email ?? '')
              }
              sx={{
                px: 2,
                whiteSpace: 'nowrap',
                alignSelf: 'stretch',
                textTransform: 'capitalize',
              }}
            >
              Email Değiştir
            </Button>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            id="account-phone"
            fullWidth
            size="small"
            label="Telefon"
            variant="outlined"
            {...register('phone')}
            helperText={errors.phone?.message}
            error={!!errors.phone}
            inputProps={{ maxLength: 10 }}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 0.5 }}>
                  <Box
                    sx={(t) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      borderRight: `1px solid ${t.palette.divider}`,
                      mr: 0.25,
                    })}
                  >
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', lineHeight: 1 }}>
                      +90
                    </Typography>
                  </Box>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            id="account-company"
            fullWidth
            size="small"
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
              id="account-country"
              select
              size="small"
              label="Ülke Seçimi"
              variant="outlined"
              value={countryValue}
              {...register('country')}
              InputLabelProps={{ shrink: true }}
              // ↓↓↓ Menü her zaman alta açılsın:
              SelectProps={{
                MenuProps: {
                  // menüyü select'in altına bağla
                  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                  transformOrigin: { vertical: 'top', horizontal: 'left' },
                  // bazen Grow geçişi merkezden başlatır; köşeden başlatmaya zorla
                  TransitionProps: {
                    onEnter: (elem: HTMLElement) => {
                      elem.style.transformOrigin = 'top left';
                    },
                  },
                  // küçük bir aşağı boşluk, kesişmesin
                  PaperProps: { sx: { mt: 0.5 } },
                  // pencere yeniden konumlandırmalarında titremeyi azaltır
                  marginThreshold: 0,
                },
              }}
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

      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="small"
          disabled={!isDirty || !isValid}
          disableElevation
          sx={(t) => ({ py: 0.75, px: 2.5, borderRadius: t.shape.borderRadius, fontSize: 13 })}
        >
          Kaydet
        </Button>
      </Box>
    </Box>
  );
}
