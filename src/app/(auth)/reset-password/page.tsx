// src/app/(auth)/reset-password/page.tsx
import * as React from 'react';
import { Suspense } from 'react';
import { Box, Typography } from '@mui/material';

import AuthCard from '../components/layout/AuthCard';
import ResetPasswordForm from '@/app/(auth)/reset-password/ResetPassword.client';

export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100dvh',
        alignItems: 'center',
        justifyContent: 'center',
        width: 1,
      }}
    >
      <AuthCard>
        <Typography variant="h5" fontWeight={600} mb={1}>
          Şifrenizi Sıfırlayın
        </Typography>
        <Typography variant="subtitle1" mb={3}>
          Güçlü bir şifre belirleyin. Link doğrulaması otomatik yapılır.
        </Typography>

        <Suspense fallback={<div>Yükleniyor...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </AuthCard>
    </Box>
  );
}
