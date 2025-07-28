// components/skeletons/ProfileSkeleton.tsx
'use client'

import { Box, Divider, Grid, Paper, Skeleton, Typography } from '@mui/material';

const ProfileSkeleton = () => {
  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', py: 2 }}>
      
      <Paper elevation={5} sx={{ p: 3, borderRadius: 7 }}>
        
        {/* Üst Bilgiler */}
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Skeleton variant="circular" width={64} height={64} />
            <Box>
              <Skeleton variant="text" width={160} height={24} />
              <Skeleton variant="text" width={200} height={18} />
              <Skeleton variant="rounded" width={80} height={24} sx={{ mt: 1 }} />
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <Skeleton variant="rounded" width={100} height={36} />
            <Skeleton variant="rounded" width={80} height={36} />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Form Alanları */}
        <Typography fontSize={14} fontWeight={600} pb={2}>
          Kişisel Bilgiler
        </Typography>

        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid size={{ xs: 12 }} key={i}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
          ))}
        </Grid>

        <Box mt={3} display="flex" justifyContent="flex-end">
          <Skeleton variant="rounded" width={120} height={40} />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Şifre */}
        <Typography fontSize={14} fontWeight={600} pb={2}>
          Şifreyi Güncelle
        </Typography>

        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6 }} >
            <Skeleton variant="rounded" height={56} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} >
            <Skeleton variant="rounded" height={56} />
          </Grid>
        </Grid>

        <Box mt={3} display="flex" justifyContent="flex-end">
          <Skeleton variant="rounded" width={160} height={40} />
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfileSkeleton;
