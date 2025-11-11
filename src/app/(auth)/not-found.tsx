// app/(auth)/not-found.tsx
import * as React from 'react';

import NextLink from 'next/link';

import {
  Box,
  Grid,
  Stack,
  Typography,
  Button,
  Divider,
  Paper,
} from '@mui/material';

import LoginIcon from '@mui/icons-material/Login';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import LockResetIcon from '@mui/icons-material/LockReset';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function AuthNotFound(): React.JSX.Element {
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'grid',
        placeItems: 'center',
        px: { xs: 1.5, md: 2 },
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 960,
          p: { xs: 2, md: 4 },
          borderRadius: 3,
        }}
      >
        <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary">
                Hata Kodu
              </Typography>
              <Typography variant="h2" component="p" sx={{ lineHeight: 1 }}>
                404
              </Typography>
              <Typography variant="h5" component="h1">
                Auth bölümünde böyle bir sayfa yok.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yanlış bir oturum sayfasına geldin. Aşağıdaki kısayolları kullanabilirsin.
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'var(--rs-surface-2)' }}>
              <Stack spacing={1.25}>
                <NextLink href="/login">
                  <Button component="span" startIcon={<LoginIcon />} variant="contained" fullWidth>
                    Giriş yap
                  </Button>
                </NextLink>

                <NextLink href="/register">
                  <Button component="span" startIcon={<PersonAddAlt1Icon />} variant="outlined" fullWidth>
                    Kayıt ol
                  </Button>
                </NextLink>

                <Divider flexItem />

                <NextLink href="/forgot-password">
                  <Button component="span" startIcon={<LockResetIcon />} variant="text" fullWidth>
                    Şifremi unuttum
                  </Button>
                </NextLink>

                <Divider flexItem />

                <NextLink href="/">
                  <Button component="span" startIcon={<HomeIcon />} variant="text" fullWidth>
                    Ana sayfa
                  </Button>
                </NextLink>

                <NextLink href="/account">
                  <Button component="span" startIcon={<AccountCircleIcon />} variant="text" fullWidth>
                    Hesabım
                  </Button>
                </NextLink>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
