'use client';

import * as React from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  TextField,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Grid,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { useForm } from 'react-hook-form';

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { supabase } from '@/lib/supabase/supabaseClient';

import { glassTextFieldProps } from '../constants/formstyles';

import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';

const passwordRules =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

const schema = yup.object({
  username: yup
    .string()
    .min(3, 'En az 3 karakter')
    .required('Kullanıcı adı zorunludur'),
  email: yup
    .string()
    .email('Geçerli bir e-posta girin')
    .required('E-posta zorunludur'),
  password: yup
    .string()
    .matches(
      passwordRules,
      'En az 8 karakter, büyük/küçük harf, rakam ve sembol içermeli'
    )
    .required('Şifre zorunludur'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Şifreler uyuşmuyor')
    .required('Şifre tekrar zorunludur'),
});

type FormValues = yup.InferType<typeof schema>;

export default function RegisterForm() {
  const router = useRouter();
  const { show } = useSnackbar();

  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        options: {
          // auth metadata: profil tablosu yerine metadata’yı da doldurabilirsiniz
          data: { username: values.username, role: 'User' },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/login`,
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          show('Bu e-posta adresi zaten kullanılıyor.', 'error');
        } else {
          show(error.message, 'error');
        }
        return;
      }

      // Not: E-posta doğrulaması açıksa session genelde null olur.
      // Profil satırını otomatik açmak için en sağlıklısı: auth.users trigger → public.users insert.
      // Aksi halde RLS nedeniyle client’tan insert patlayabilir.
      show('Kayıt başarılı! Lütfen e-posta adresinizi onaylayın.', 'success');
      router.push('/login');
    } catch {
      show('Beklenmeyen bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 12, md: 12 }} >
          <TextField
            label="Kullanıcı adı"
            fullWidth
            required
            {...glassTextFieldProps}
            {...register('username')}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 12 }} >
          <TextField
            label="E-posta"
            type="email"
            fullWidth
            required
            {...glassTextFieldProps}
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 12 }} >
          <TextField
            label="Şifre"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            {...glassTextFieldProps}
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              ...glassTextFieldProps.InputProps,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                    sx={{ color: 'white' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            inputProps={{
              onPaste: (e) => e.preventDefault(),
              onCopy: (e) => e.preventDefault(),
              onCut: (e) => e.preventDefault(),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 12 }} >
          <TextField
            label="Şifre Tekrar"
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            required
            {...glassTextFieldProps}
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            InputProps={{
              ...glassTextFieldProps.InputProps,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    edge="end"
                    sx={{ color: 'white' }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            inputProps={{
              onPaste: (e) => e.preventDefault(),
              onCopy: (e) => e.preventDefault(),
              onCut: (e) => e.preventDefault(),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 12 }} >
          <Button
            type="submit"
            variant="outlined"
            color="primary"
            fullWidth
            disabled={loading || isSubmitting || !isValid}
            sx={{
              py: 1.25,
              textTransform: 'capitalize',
              borderRadius: 7,
              borderColor: 'white',
              color: 'white',
            }}
          >
            {loading || isSubmitting ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
          </Button>
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 12 }}  sx={{ display: 'flex', justifyContent: 'end' }}>
          <Typography color="lightblue" mt={1}>
            Hesabınız varsa{' '}
            <Link href="/login">
              <Typography
                component="span"
                color="white"
                fontStyle="italic"
                fontWeight={500}
                sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Giriş yapın
              </Typography>
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
