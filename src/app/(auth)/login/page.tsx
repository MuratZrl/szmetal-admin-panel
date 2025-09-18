// app/(auth)/login/page.tsx
import * as React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import AuthCard from '../components/layout/AuthCard';
import LoginForm from './LoginForm.client';

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >

      <AuthCard>
    
        <Grid container spacing={2}>
    
          <Grid size={{ xs: 12 }} >
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Giriş Yapın
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }} >
            {/* Client adası */}
            <LoginForm />
          </Grid>
    
        </Grid>
    
      </AuthCard>
    
    </Box>
  );
}
