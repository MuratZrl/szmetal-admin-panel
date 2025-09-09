import * as React from 'react';
import { Box, Typography } from '@mui/material';
import AuthCard from '../components/layout/AuthCard';
import ForgotPasswordForm from './ForgotPasswordForm.client';

export default function ForgotPasswordPage() {
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
        <Typography variant="h5" color="white" fontWeight={600} mb={1}>
          Kendi E-posta Adresinizi Giriniz
        </Typography>
        <Typography variant="subtitle1" color="white" mb={3}>
          E-posta adresinize sıfırlama linki gönderebilmek için lütfen e-posta bilginizi giriniz.
        </Typography>

        {/* Client adası */}
        <ForgotPasswordForm />
      </AuthCard>
    </Box>
  );
}
