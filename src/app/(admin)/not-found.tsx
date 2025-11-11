// app/(admin)/not-found.tsx
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

import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function AdminNotFound(): React.JSX.Element {
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
          bgcolor: 'var(--rs-surface-1)',
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
                Admin bölümünde böyle bir sayfa yok.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yolunu kaybettin.
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'var(--rs-surface-2)' }}>
              <Stack spacing={1.25}>
                <NextLink href="/">
                  <Button component="span" startIcon={<HomeIcon />} variant="outlined" fullWidth>
                    Ana sayfa
                  </Button>
                </NextLink>

                <NextLink href="/dashboard">
                  <Button component="span" startIcon={<DashboardIcon />} variant="contained" fullWidth>
                    Kontrol Paneli
                  </Button>
                </NextLink>

                <Divider flexItem />

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
