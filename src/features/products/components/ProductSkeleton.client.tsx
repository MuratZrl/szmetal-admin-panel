'use client';

import { Skeleton, Box } from '@mui/material';

export default function ProductSkeleton() {
  return (
    <Box px={2} py={2}>
      <Skeleton variant="text" width={240} height={32} />
      <Skeleton variant="rectangular" height={8} sx={{ my: 2 }} />
      <Box style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        <Skeleton variant="rectangular" height={280} />
        <Skeleton variant="rectangular" height={280} />
      </Box>
    </Box>
  );
}
