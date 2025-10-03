'use client';

import {
  Box,
  Grid,
  Skeleton,
  Avatar,
  Typography,
} from '@mui/material';

export default function AccountSkeleton() {
  return (
    <Box
      display="flex"
      flexDirection={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
    >
      
      {/* Üst Profil Bilgisi */}
      <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} mb={3}>

        {/* Sol: Avatar + Bilgiler */}
        <Box display="flex" alignItems="center" gap={2}>
          <Skeleton variant="circular">
            <Avatar sx={{ width: 64, height: 64 }} />
          </Skeleton>
          <Box>
            <Skeleton width={150} height={24} />
            <Skeleton width={200} height={20} />
            <Skeleton variant="rounded" width={80} height={24} sx={{ mt: 1 }} />
          </Box>
        </Box>

        {/* Sağ: Butonlar */}
        <Box display="flex" gap={1}>
          <Skeleton variant="rounded" width={100} height={32} />
          <Skeleton variant="rounded" width={80} height={32} />
        </Box>
      </Box>

      {/* Kişisel Bilgiler */}
      <Typography fontSize={14} fontWeight={600} pb={2} gutterBottom>
        Kişisel Bilgiler
      </Typography>

      <Grid container spacing={2}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Grid size={{ xs: 12, sm: 6 }} key={index}>
            <Skeleton variant="rounded" height={56} />
          </Grid>
        ))}
      </Grid>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Skeleton variant="rounded" width={120} height={40} />
      </Box>

      {/* Şifre */}
      <Typography fontSize={14} fontWeight={600} pb={2} gutterBottom>
        Şifreyi Güncelle
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Skeleton variant="rounded" height={56} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Skeleton variant="rounded" height={56} />
        </Grid>
      </Grid>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Skeleton variant="rounded" width={160} height={40} />
      </Box>

    </Box>
  );
}
