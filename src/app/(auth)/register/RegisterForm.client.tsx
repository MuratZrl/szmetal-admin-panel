// src/features/auth/components/RegisterForm.tsx
'use client';

/**
 * Kayıt formu
 * - Username: boşluk ve Türkçe karakter destekli, case-insensitive benzersiz
 * - E-posta: signup öncesi benzersizlik kontrolü
 * - Şifre gücü göstergesi
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
import { alpha } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { glassTextFieldProps } from '../constants/formstyles';
import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';
import { supabase } from '@/lib/supabase/supabaseClient';

/* -------------------------------------------------------------------------- */
/* Doğrulama şeması                                                            */
/* -------------------------------------------------------------------------- */

const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
const USERNAME_REGEX = /^[\p{L}\p{N}._\- ]+$/u;

const schema = yup
  .object({
    username: yup
      .string()
      .transform(v => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : v))
      .min(3, 'En az 3 karakter')
      .max(40, 'En fazla 40 karakter')
      .matches(
        USERNAME_REGEX,
        'Harf, rakam, boşluk, ., _ ve - kullanılabilir'
      )
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

type FormValues = yup.InferType<typeof schema>;

/* -------------------------------------------------------------------------- */
/* Yardımcılar                                                                 */
/* -------------------------------------------------------------------------- */

function scorePassword(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw) && /[^\w\s]/.test(pw)) score += 1;
  return Math.min(score, 4);
}
function toPercent(score: number): number {
  return (score / 4) * 100;
}
function strengthLabel(score: number): 'Zayıf' | 'Orta' | 'İyi' | 'Güçlü' | '' {
  switch (score) {
    case 1: return 'Zayıf';
    case 2: return 'Orta';
    case 3: return 'İyi';
    case 4: return 'Güçlü';
    default: return '';
  }
}
function strengthBarColor(theme: import('@mui/material/styles').Theme, score: number): string {
  if (score <= 0) return theme.palette.divider;
  if (score === 1) return theme.palette.error.main;
  if (score === 2) return theme.palette.warning.light;
  if (score === 3) return theme.palette.warning.main;
  return theme.palette.success.main;
}
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

/* -------------------------------------------------------------------------- */
/* RPC tipleri                                                                 */
/* -------------------------------------------------------------------------- */

type BoolRpcResponse = {
  data: boolean | null;
  error: { message: string } | null;
};

async function isUsernameFree(username: string): Promise<boolean> {
  const normalized = username.replace(/\s+/g, ' ').trim();
  const { data, error } = (await supabase.rpc('username_available', {
    p_username: normalized,
  })) as BoolRpcResponse;
  if (error) {
    // Güvenli tarafta kal: hata olursa kullanılabilir sayma
    // Konsola düşür ki gerçek sebep görülsün
    console.error('username_available RPC error:', error);
    return false;
  }
  return Boolean(data);
}

async function isEmailFree(email: string): Promise<boolean> {
  const e = email.trim().toLowerCase();
  const { data, error } = (await supabase.rpc('email_available', {
    p_email: e,
  })) as BoolRpcResponse;
  if (error) {
    console.error('email_available RPC error:', error);
    return false;
  }
  return Boolean(data);
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export default function RegisterForm(): React.JSX.Element {
  const router = useRouter();
  const { show } = useSnackbar();

  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
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

  const onSubmit = async (values: FormValues): Promise<void> => {
    const username = values.username.replace(/\s+/g, ' ').trim();
    const email = values.email.trim().toLowerCase();
    const password = values.password;

    // 1) Ön kontrol: username & email benzersiz mi?
    const [userOk, emailOk] = await Promise.all([
      isUsernameFree(username),
      isEmailFree(email),
    ]);

    if (!userOk) {
      setError('username', { type: 'manual', message: 'Bu kullanıcı adı zaten kullanılıyor.' });
      show('Bu kullanıcı adı zaten kullanılıyor.', 'error');
      return;
    }
    if (!emailOk) {
      setError('email', { type: 'manual', message: 'Bu e-posta adresi zaten kayıtlı.' });
      show('Bu e-posta adresi zaten kayıtlı.', 'error');
      return;
    }

    try {
      const siteUrl = resolveSiteUrl();

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, role: 'User' },
          emailRedirectTo: `${siteUrl}/login`,
        },
      });

      if (error) {
        // Daha anlamlı geri bildirim
        const raw = error.message ?? '';
        const pretty = raw.toLowerCase().includes('database error saving new user')
          ? 'Kayıt başarısız: kullanıcı adı veya e-posta kullanımda.'
          : mapSupabaseErrorMessage(raw);

        // Hangi alan hatalı olabilir, ikisine de not düşelim
        if (pretty.includes('kullanıcı adı')) {
          setError('username', { type: 'manual', message: pretty });
        }
        if (pretty.includes('e-posta')) {
          setError('email', { type: 'manual', message: pretty });
        }

        show(pretty, 'error');
        return;
      }

      show('Kayıt başarılı! Lütfen e-posta adresinizi onaylayın.', 'success');
      router.push('/login');
    } catch (e) {
      console.error(e);
      show('Beklenmeyen bir hata oluştu.', 'error');
    }
  };

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)} aria-live="polite">
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
            error={Boolean(errors.username)}
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
            error={Boolean(errors.email)}
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
            error={Boolean(errors.password)}
            InputProps={{
              ...(glassTextFieldProps.InputProps ?? {}),
              endAdornment: (
                <InputAdornment position="end" sx={{ color: 'text.secondary' }}>
                  <IconButton
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword(s => !s)}
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

          {/* Şifre gücü */}
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={toPercent(pwdScore)}
              aria-label="Şifre gücü"
              sx={(theme) => ({
                height: 6,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.text.primary, 0.08),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: strengthBarColor(theme, pwdScore),
                },
              })}
            />
            <Typography
              variant="caption"
              sx={(theme) => ({
                color: pwdScore === 0 ? theme.palette.text.secondary : strengthBarColor(theme, pwdScore),
              })}
            >
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
            error={Boolean(errors.confirmPassword)}
            InputProps={{
              ...(glassTextFieldProps.InputProps ?? {}),
              endAdornment: (
                <InputAdornment position="end" sx={{ color: 'text.secondary' }}>
                  <IconButton
                    aria-label={showConfirmPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowConfirmPassword(s => !s)}
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
