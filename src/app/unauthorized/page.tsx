// app/unauthorized/page.tsx
'use client';

import * as React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Grid,
  Alert,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useRouter, useSearchParams } from 'next/navigation';

type Reason =
  | 'banned'
  | 'inactive'
  | 'role'              // ← middleware’in gönderdiği değer
  | 'forbidden'
  | 'no_profile'
  | 'profile-missing'
  | 'session-expired'
  | 'unknown';

function getReason(raw: string | null): Reason {
  const r = (raw ?? '').trim().toLowerCase();
  if (r === 'banned') return 'banned';
  if (r === 'inactive') return 'inactive';
  if (r === 'role') return 'role';
  if (r === 'forbidden') return 'forbidden';
  if (r === 'no_profile') return 'no_profile';
  if (r === 'profile-missing') return 'profile-missing';
  if (r === 'session-expired') return 'session-expired';
  return 'unknown';
}

function reasonText(reason: Reason): { title: string; desc: string } {
  switch (reason) {
    case 'banned':
      return {
        title: 'Hesap Engellendi',
        desc: 'Hesabınız engellendiği için bu sayfaya erişemezsiniz.',
      };
    case 'inactive':
      return {
        title: 'Hesap Pasif',
        desc: 'Hesabınız pasif durumda. Yalnızca Hesabım sayfasını görüntüleyebilirsiniz.',
      };
    case 'role':
    case 'forbidden':
      return {
        title: 'Erişim Reddedildi',
        desc: 'Bu sayfaya rolünüzle erişim izniniz bulunmuyor.',
      };
    case 'no_profile':
    case 'profile-missing':
      return {
        title: 'Profil Bulunamadı',
        desc: 'Kullanıcı profiliniz bulunamadı. Lütfen tekrar giriş yapmayı deneyin.',
      };
    case 'session-expired':
      return {
        title: 'Oturum Süresi Doldu',
        desc: 'Devam etmek için tekrar giriş yapın.',
      };
    default:
      return {
        title: 'Erişim Reddedildi',
        desc: 'Bu sayfaya yalnızca yetkili kullanıcılar erişebilir.',
      };
  }
}

export default function UnauthorizedPage(): React.JSX.Element {
  const router = useRouter();
  const params = useSearchParams();

  const reason = getReason(params.get('reason'));
  const { title, desc } = reasonText(reason);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
        py: 6,
        bgcolor: 'background.default',
      }}
    >
      {/* Dış grid container OLMALI */}
      <Grid container justifyContent="center">
        <Grid size={{ xs: 12, sm: 10, md: 7 }}>
          <Paper
            elevation={0}
            sx={(t) => ({
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              border: `1px solid ${t.palette.divider}`,
              bgcolor: 'background.paper',
            })}
          >
            <Stack spacing={2.5} alignItems="center" textAlign="center">
              <BlockIcon sx={{ fontSize: 56, color: 'error.main' }} />
              <Typography variant="h4" fontWeight={700}>
                {title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {desc}
              </Typography>

              <Alert
                severity="error"
                sx={{ width: '100%', mt: 1 }}
                icon={<HelpOutlineIcon fontSize="small" />}
              >
                Eğer bunun bir hata olduğunu düşünüyorsanız sistem yöneticinizle iletişime geçin.
              </Alert>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.25}
                sx={{ mt: 1 }}
                justifyContent="center"
              >
                <Button
                  onClick={() => router.back()}
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  sx={{ textTransform: 'capitalize', borderRadius: 2 }}
                >
                  Geri Dön
                </Button>

                <Button
                  // Doğrudan hedefe
                  onClick={() => router.push('/account')}
                  variant="contained"
                  color="primary"
                  startIcon={<HomeIcon />}
                  sx={{ textTransform: 'capitalize', borderRadius: 2 }}
                >
                  Ana Sayfa
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
