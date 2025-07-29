'use client';

import React from 'react';
import { Box, Card, Skeleton } from '@mui/material';

const SystemCardSkeleton = () => {
  return (
    <Card
      className="overflow-hidden"
      sx={{
        height: '100%',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 7,
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
          width="100%"
          height="100%"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
          }}
        />
      </Box>

      {/* Content Skeleton */}
      <Box sx={{ flexGrow: 1, px: { xs: 2, sm: 2.5 }, py: { xs: 1.5, sm: 2 } }}>
        <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="90%" height={16} />
      </Box>

      {/* Buttons Skeleton */}
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          pb: { xs: 2, sm: 2.5 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
        }}
      >
        <Skeleton
          variant="rounded"
          height={36}
          width="100%"
          sx={{ flex: 1 }}
        />
        <Skeleton
          variant="rounded"
          height={36}
          width="100%"
          sx={{ flex: 1 }}
        />
      </Box>
    </Card>
  );
};

export default SystemCardSkeleton;
