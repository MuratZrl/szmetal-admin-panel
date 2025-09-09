// app/(auth)/register/page.tsx
import * as React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import AuthCard from '../components/layout/AuthCard';
import RegisterForm from './RegisterForm.client';

export default function RegisterPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100dvh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AuthCard>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }} >
            <Typography variant="h5" color="white" fontWeight={600} mb={1.5}>
              Hemen Kayıt Olun
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }} >
            {/* Client adası */}
            <RegisterForm />
          </Grid>
        </Grid>
      </AuthCard>
    </Box>
  );
}
