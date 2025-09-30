// app/(auth)/login/page.tsx
import type { Metadata } from 'next';
import * as React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import AuthCard from '@/app/(auth)/components/layout/AuthCard';
import LoginForm from '@/app/(auth)/login/LoginForm.client';
import { guardLoginPage } from '@/lib/supabase/auth/guards.server';


export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = { title: 'Giriş', robots: { index: false, follow: false } };

export default async function LoginPage() {
  await guardLoginPage(); // burada karar veriliyor
  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', alignItems: 'center', justifyContent: 'center' }}>
      <AuthCard>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>Giriş Yapın</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <LoginForm />
          </Grid>
        </Grid>
      </AuthCard>
    </Box>
  );
}
