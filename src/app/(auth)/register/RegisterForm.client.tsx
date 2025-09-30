// src/features/auth/components/RegisterForm.tsx
'use client';

/**
 * Kayıt formu (profesyonel sürüm)
 *
 * Neler var:
 * - Yup ile güçlü doğrulama (e-posta, şifre kuralları, eşleşme)
 * - Şifre görünür/gizli toggles (erişilebilirlik etiketleri ile)
 * - Şifre gücü göstergesi (basit ama işe yarar skor)
 * - Stabil env/siteURL çözümü ve e-posta yönlendirme
 * - Supabase hatalarını kullanıcı dostu mesajlara çevirme
 * - Trim/normalize (email, kullanıcı adı)
 * - Gereksiz yeniden-render azaltımı, temiz TypeScript tipleri (any yok)
 * - MUI Grid size={{ xs, sm, md }} kullanımına tam uyum
 */

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
  LinearProgress,
  Stack,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { useForm } from 'react-hook-form';

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { glassTextFieldProps } from '../constants/formstyles';
import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';
import { supabase } from '@/lib/supabase/supabaseClient';

/** Şifre kuralı: 8+ karakter, 1 büyük, 1 küçük, 1 rakam, 1 sembol */
const PASSWORD_RULES =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

/** Yup şema: form seviyesinde güçlü doğrulama */
const schema = yup
  .object({
    username: yup
      .string()
      .trim()
      .min(3, 'En az 3 karakter')
      .max(40, 'En fazla 40 karakter')
      .matches(/^[A-Za-z0-9._-]+$/, 'Sadece harf, rakam ve . _ - kullanılabilir')
      .required('Kullanıcı adı zorunludur'),
    email: yup
      .string()
      .trim()
      .lowercase()
      .email('Geçerli bir e-posta girin')
      .required('E-posta zorunludur'),
    password: yup
      .string()
      .matches(
        PASSWORD_RULES,
        'En az 8 karakter, büyük/küçük harf, rakam ve sembol içermeli'
      )
      .required('Şifre zorunludur'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Şifreler uyuşmuyor')
      .required('Şifre tekrar zorunludur'),
  })
  .required();

/** Yup şemasından tip çıkarımı (any yok) */
type FormValues = yup.InferType<typeof schema>;

/** Güç skoru: basit heuristik (UI için yeterli) */
function scorePassword(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw) && /[^\w\s]/.test(pw)) score += 1;
  return Math.min(score, 4);
}

/** Skoru yüzdeye çevir (LinearProgress için) */
function toPercent(score: number): number {
  return (score / 4) * 100;
}

/** Kullanıcıya dost metin */
function strengthLabel(score: number): 'Zayıf' | 'Orta' | 'İyi' | 'Güçlü' | '' {
  switch (score) {
    case 0:
      return '';
    case 1:
      return 'Zayıf';
    case 2:
      return 'Orta';
    case 3:
      return 'İyi';
    case 4:
      return 'Güçlü';
    default:
      return '';
  }
}

/** Site URL çözümü: env > window.origin > localhost */
function resolveSiteUrl(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://localhost:3000';
}

/** Supabase hata mesajlarını sadeleştir */
function mapSupabaseErrorMessage(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes('user already registered') || msg.includes('already registered')) {
    return 'Bu e-posta adresi zaten kullanılıyor.';
  }
  if (msg.includes('weak password')) {
    return 'Şifre zayıf görünüyor. Lütfen daha güçlü bir şifre deneyin.';
  }
  if (msg.includes('rate limit')) {
    return 'Çok sık denediniz. Lütfen kısa bir süre sonra tekrar deneyin.';
  }
  return message;
}

export default function RegisterForm(): React.JSX.Element {
  const router = useRouter();
  const { show } = useSnackbar();

  /** Şifre alanları için görünür/gizli durumları */
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false);

  /** RHF: onChange modunda anlık doğrulama + yupResolver */
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid, isDirty },
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

  const passwordValue = watch('password');
  const pwdScore = scorePassword(passwordValue ?? '');

  /** Submit: Supabase signUp + e-posta doğrulama yönlendirmesi */
  const onSubmit = async (values: FormValues): Promise<void> => {
    // Normalizasyon
    const username = values.username.trim();
    const email = values.email.trim().toLowerCase();
    const password = values.password;

    try {
      const siteUrl = resolveSiteUrl();

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // auth.users -> user_metadata
          data: {
            username,
            role: 'User', // Varsayılan kayıt rolü
            // İsterseniz profil oluşturma tetikleyici/cron ile public.users doldurulabilir
          },
          emailRedirectTo: `${siteUrl}/login`,
        },
      });

      if (error) {
        show(mapSupabaseErrorMessage(error.message), 'error');
        return;
      }

      // Başarı: e-posta onayı gerekli
      show('Kayıt başarılı! Lütfen e-posta adresinizi onaylayın.', 'success');
      router.push('/login');
    } catch (e) {
      console.log(e)
      show('Beklenmeyen bir hata oluştu.', 'error');
    }
  };

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit(onSubmit)}
      aria-live="polite"
    >
      <Grid container spacing={2}>
        {/* Kullanıcı adı */}
        <Grid size={{ xs: 12, sm: 12, md: 12 }}>
          <TextField
            label="Kullanıcı adı"
            fullWidth
            required
            autoComplete="username"
            inputMode="text"
            spellCheck={false}
            {...glassTextFieldProps}
            {...register('username')}
            helperText={errors.username?.message}
          />
        </Grid>

        {/* E-posta */}
        <Grid size={{ xs: 12, sm: 12, md: 12 }}>
          <TextField
            label="E-posta"
            type="email"
            fullWidth
            required
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            {...glassTextFieldProps}
            {...register('email')}
            helperText={errors.email?.message}
          />
        </Grid>

        {/* Şifre */}
        <Grid size={{ xs: 12, sm: 12, md: 12 }}>
          <TextField
            label="Şifre"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            autoComplete="new-password"
            {...glassTextFieldProps}
            {...register('password')}
            helperText={errors.password?.message ?? 'En az 8 karakter, büyük/küçük harf, rakam, sembol'}
            InputProps={{
              ...(glassTextFieldProps.InputProps ?? {}),
              endAdornment: (
                <InputAdornment position="end" sx={{ color: 'text.secondary' }}>
                  <IconButton
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                    color="inherit"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: (theme) => ({
                ...(typeof glassTextFieldProps.InputProps?.sx === 'function'
                  ? glassTextFieldProps.InputProps.sx(theme)
                  : (glassTextFieldProps.InputProps?.sx ?? {})),
              }),
            }}
            inputProps={{
              onPaste: (e) => e.preventDefault(),
              onCopy: (e) => e.preventDefault(),
              onCut: (e) => e.preventDefault(),
            }}
          />
          {/* Şifre gücü göstergesi */}
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={toPercent(pwdScore)}
              aria-label="Şifre gücü"
              sx={{
                height: 6,
                borderRadius: 1,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {strengthLabel(pwdScore)}
            </Typography>
          </Stack>
        </Grid>

        {/* Şifre tekrar */}
        <Grid size={{ xs: 12, sm: 12, md: 12 }}>
          <TextField
            label="Şifre Tekrar"
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            required
            autoComplete="new-password"
            {...glassTextFieldProps}
            {...register('confirmPassword')}
            helperText={errors.confirmPassword?.message}
            InputProps={{
              ...(glassTextFieldProps.InputProps ?? {}),
              endAdornment: (
                <InputAdornment position="end" sx={{ color: 'text.secondary' }}>
                  <IconButton
                    aria-label={showConfirmPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    edge="end"
                    color="inherit"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: (theme) => ({
                ...(typeof glassTextFieldProps.InputProps?.sx === 'function'
                  ? glassTextFieldProps.InputProps.sx(theme)
                  : (glassTextFieldProps.InputProps?.sx ?? {})),
              }),
            }}
            inputProps={{
              onPaste: (e) => e.preventDefault(),
              onCopy: (e) => e.preventDefault(),
              onCut: (e) => e.preventDefault(),
            }}
          />
        </Grid>

        {/* Submit */}
        <Grid size={{ xs: 12, sm: 12, md: 12 }}>
          <Button
            type="submit"
            variant="outlined"
            color="primary"
            fullWidth
            disabled={isSubmitting || !isValid || !isDirty}
            sx={(t) => ({
              py: 1.25,
              textTransform: 'capitalize',
              borderRadius: 7,
              borderColor: t.palette.divider,
              color: t.palette.text.primary,
            })}
          >
            {isSubmitting ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
          </Button>
        </Grid>

        {/* Link: Login */}
        <Grid size={{ xs: 12, sm: 12, md: 12 }} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Typography color="text.primary" mt={1}>
            Hesabınız varsa{' '}
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <Typography
                component="span"
                sx={{
                  color: 'text.primary',
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
        </Grid>
      </Grid>
    </Box>
  );
}
