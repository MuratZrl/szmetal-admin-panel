'use client';

import { Box, Card, Skeleton } from '@mui/material';

const SystemsCardSkeleton = () => {
  return (
    <Card
      className="overflow-hidden"
      sx={{
        height: '100%',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 10,
        boxShadow: 3,
      }}
    >
      {/* Image Skeleton */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          pt: '56.25%',
          overflow: 'hidden',
        }}
      >
        <Skeleton
          variant="rectangular"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />
      </Box>

      {/* Content Skeleton */}
      <Box sx={{ flexGrow: 1, px: 2.5, py: 2 }}>
        <Skeleton variant="text" width="60%" height={28} />
        <Skeleton variant="text" width="100%" height={18} sx={{ mt: 1 }} />
        <Skeleton variant="text" width="90%" height={18} />
      </Box>

      {/* Buttons Skeleton */}
      <Box
        sx={{
          px: 2.5,
          pb: 2,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Skeleton variant="rounded" width={80} height={36} />
        <Skeleton variant="rounded" width={120} height={36} />
      </Box>
    </Card>
  );
};

export default SystemsCardSkeleton;
