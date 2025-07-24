'use client';

import { Box, Typography } from '@mui/material';

export default function UnauthorizedPage() {
  return (
    <Box className="text-center mt-20">
      <Typography variant="h4" color="error" fontWeight={600}>
        Erişim Reddedildi
      </Typography>
      <Typography mt={2}>
        Bu sayfaya yalnızca yetkili kullanıcılar erişebilir.
      </Typography>
    </Box>
  );
}
